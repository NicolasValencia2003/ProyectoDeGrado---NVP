import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { SupabaseService } from '../supabase/supabase.service';
import { MarketDataFetcherService } from '../market/market-data-fetcher.service';
import { buildLifeProfileContext, buildBiasInstructions } from '../portfolio/life-profile.service';
import { MOCK_RECOMMENDATIONS } from '../mock/mock-data';
import { BanditService } from '../bandit/bandit.service';

const ALLOCATION_RULES: Record<string, Record<string, number>> = {
  conservative: { bond: 0.55, cash: 0.10, etf: 0.25, reit: 0.05, commodity: 0.05, stock: 0,    crypto: 0    },
  balanced:     { etf:  0.40, bond: 0.25, stock: 0.15, reit: 0.10, commodity: 0.05, cash: 0.05, crypto: 0    },
  growth:       { etf:  0.35, stock: 0.25, crypto: 0.15, bond: 0.10, reit: 0.10, commodity: 0.05, cash: 0    },
  aggressive:   { stock: 0.30, crypto: 0.30, etf: 0.25, commodity: 0.10, reit: 0.05, bond: 0,   cash: 0      },
};

@Injectable()
export class RecommendationsService {
  private anthropic: Anthropic | null = null;

  constructor(
    private supabase: SupabaseService,
    private marketFetcher: MarketDataFetcherService,
    private bandit: BanditService,
  ) {
    const apiKey = process.env.ANTHROPIC_API_KEY ?? '';
    if (apiKey && !apiKey.includes('your-anthropic')) {
      this.anthropic = new Anthropic({ apiKey });
    }
  }

  async generate(user: any, riskOverride?: number, excludedTickers: string[] = []): Promise<any> {
    const score = riskOverride ?? user.risk_score ?? 7;

    let prefs: any = null;

    // Hard 28s deadline for the entire market-data pipeline so the endpoint
    // always responds before the frontend's 35s axios timeout fires.
    const timeout = <T>(ms: number, fallback: T, p: Promise<T>): Promise<T> =>
      Promise.race([p, new Promise<T>(r => setTimeout(() => r(fallback), ms))]);

    const [pricesMap, sentiment, ucbScores] = await Promise.all([
      timeout(10000, this.marketFetcher['buildFallbackPrices'](), this.marketFetcher.getPricesWithRefresh()),
      timeout(5000,  {}, this.marketFetcher.getSentimentWithRefresh()),
      timeout(5000,  {}, this.bandit.getScores(user.id ?? '')),
    ]);

    if (this.supabase.isConfigured() && user.id) {
      try {
        const { data } = await this.supabase.db!
          .from('user_preferences').select('*').eq('user_id', user.id).single();
        if (data) prefs = data;
      } catch { /* ignore */ }
    }

    const candidates = this.buildCandidates(score, pricesMap, user, prefs, excludedTickers, ucbScores);

    let result: any;
    if (this.anthropic) {
      result = await this.generateWithClaude(user, prefs, candidates, pricesMap, sentiment, score, excludedTickers);
    } else {
      result = this.generateMock(score, pricesMap, excludedTickers, candidates);
    }

    // Post-filter: guarantee excluded tickers never appear regardless of path
    if (excludedTickers.length > 0) {
      result.recommendations = (result.recommendations ?? []).filter(
        (r: any) => !excludedTickers.includes(r.ticker),
      );
    }

    // Fallback: if Claude ignored the candidates and all results were filtered out,
    // build recommendations directly from the pre-computed candidate pool
    if (result.recommendations.length === 0 && candidates.length > 0) {
      result.recommendations = candidates.map((c: any) => ({
        ticker:         c.ticker,
        name:           c.name,
        allocation_pct: c.allocation_pct,
        current_price:  c.current_price ?? null,
        change_1d_pct:  c.change_1d_pct ?? null,
        asset_class:    c.asset_class,
        sector:         c.sector,
        rationale:      `${c.name} es un activo de clase ${c.asset_class} relevante para tu perfil de riesgo ${score}/10, seleccionado como ejemplo educativo de diversificación.`,
        key_risk:       `Como activo de tipo ${c.asset_class}, su comportamiento está ligado a condiciones específicas del mercado que es importante comprender.`,
      }));
    }

    return result;
  }

  private async generateWithClaude(
    user: any, prefs: any, candidates: any[],
    pricesMap: Record<string, any>, sentiment: any, score: number,
    excludedTickers: string[] = [],
  ): Promise<any> {
    const lifeContext      = buildLifeProfileContext(user, prefs);
    const biasInstructions = buildBiasInstructions(prefs?.detected_biases ?? {});
    const headlines: any[] = Array.isArray(sentiment?.top_headlines) ? sentiment.top_headlines : [];
    const topHeadline      = headlines[0]?.title ?? 'Markets continue steady amid mixed economic signals';

    const candidateList = candidates
      .map(c =>
        `  - ${c.ticker} (${c.name}): ${c.allocation_pct.toFixed(1)}% allocation, ` +
        `price $${c.current_price?.toLocaleString?.() ?? 'N/A'}, ` +
        `${(c.change_1d_pct ?? 0) >= 0 ? '+' : ''}${(c.change_1d_pct ?? 0).toFixed(2)}% today`
      )
      .join('\n');

    const firstCandidate = candidates[0];
    const prompt = `Eres FinVise, un asistente educativo de inversiones — NO un asesor financiero.
Tu rol es ENSEÑAR conceptos de inversión, no asesorar sobre decisiones financieras reales.
TODA la respuesta debe estar en español. Cada explicación debe ser educativa, basada en datos reales del mercado y adaptada al contexto de vida específico del usuario.

REGLAS CRÍTICAS:
1. Nunca digas "deberías invertir X cantidad". Di "este activo sería relevante para aprender dado tu perfil porque..."
2. Enmarca siempre las recomendaciones como ejemplos educativos, no directivas.
3. El campo disclaimer DEBE indicar que es material académico de la Pontificia Universidad Javeriana Cali.
4. Adapta CADA explicación al contexto de vida del usuario a continuación.
5. Usa terminología financiera en español con ejemplos concretos y comprensibles.
6. OBLIGATORIO: Usa EXACTAMENTE los tickers del "PORTAFOLIO PRE-CALCULADO" — ni uno más, ni uno menos. NO inventes ni sustituyas tickers.
${lifeContext}
DATOS ACTUALES DEL MERCADO (${new Date().toISOString()}):
- Índice Miedo/Codicia: ${sentiment?.fear_greed ?? 62} (${sentiment?.fear_greed_label ?? 'Neutral'})
- Rendimiento Tesoro EE.UU. 10A: ${sentiment?.treasury_10y ?? 4.42}%
- Titular principal: ${topHeadline}

PORTAFOLIO EDUCATIVO PRE-CALCULADO (análisis cuantitativo) — USA SOLO ESTOS TICKERS:
${candidateList}
${biasInstructions}
Para cada activo de la lista anterior escribe:
1. Una explicación educativa de 2 oraciones adaptada al perfil de vida de ESTE usuario.
2. Un concepto clave de 1 oración sobre el principal riesgo de este activo.

RESPONDE ÚNICAMENTE con este JSON exacto (sin markdown, sin preámbulo, todo en español).
Reemplaza el ejemplo con los tickers REALES del portafolio pre-calculado:
{
  "recommendations": [
    {
      "ticker": "${firstCandidate?.ticker ?? 'TICKER'}",
      "name": "${firstCandidate?.name ?? 'Nombre del activo'}",
      "allocation_pct": ${firstCandidate?.allocation_pct ?? 0},
      "rationale": "Explicación educativa de 2 oraciones en español adaptada a este usuario.",
      "key_concept": "Concepto clave de riesgo en español que este usuario debe comprender.",
      "asset_class": "${firstCandidate?.asset_class ?? 'etf'}",
      "sector": "${firstCandidate?.sector ?? 'broad_market'}"
    }
  ],
  "market_summary": "Una oración conectando el mercado de hoy con el contexto educativo, en español.",
  "educational_insight": "Un aprendizaje adicional específico al perfil de este usuario, en español.",
  "disclaimer": "Este contenido es material educativo generado por FinVise, plataforma académica de la Pontificia Universidad Javeriana Cali. No constituye asesoramiento financiero personalizado bajo ninguna norma legal o regulatoria. Consulta un asesor certificado ante la Superintendencia Financiera antes de tomar decisiones de inversión real."
}`;

    try {
      const claudeTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Claude timeout')), 20000),
      );
      const message = await Promise.race([
        this.anthropic!.messages.create({
          model:      'claude-sonnet-4-6',
          max_tokens: 1800,
          messages:   [{ role: 'user', content: prompt }],
        }),
        claudeTimeout,
      ]);

      const raw    = message.content[0].type === 'text' ? message.content[0].text : '{}';
      const text   = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
      const parsed = JSON.parse(text) as any;

      parsed.recommendations = (parsed.recommendations ?? []).map((r: any) => ({
        ...r,
        current_price: pricesMap[r.ticker]?.price ?? null,
        change_1d_pct: pricesMap[r.ticker]?.change_1d_pct ?? null,
        key_risk:      r.key_concept ?? r.key_risk,
      }));

      if (this.supabase.isConfigured() && user.id) {
        void this.supabase.db!.from('recommendation_history').insert({
          user_id:         user.id,
          risk_score_used: score,
          payload:         parsed,
          market_snapshot: {
            fear_greed:       sentiment?.fear_greed ?? 62,
            fear_greed_label: sentiment?.fear_greed_label ?? 'Neutral',
            treasury_10y:     sentiment?.treasury_10y ?? 4.42,
          },
        });
      }

      return parsed;
    } catch (err) {
      console.error('Claude error, using mock fallback:', (err as Error).message);
      return this.generateMock(score, pricesMap, excludedTickers);
    }
  }

  private generateMock(score: number, pricesMap: Record<string, any>, excludedTickers: string[] = [], candidates: any[] = []): any {
    let band: string;
    if (score <= 3)      band = 'conservative';
    else if (score <= 8) band = 'balanced';
    else                 band = 'aggressive';

    const base = MOCK_RECOMMENDATIONS[band];
    const baseFiltered = base.recommendations.filter((r: any) => !excludedTickers.includes(r.ticker));

    // When tickers are excluded, supplement with candidates from the full pool
    // so the replacement flow always finds a genuinely new ticker
    const baseTickers = new Set(baseFiltered.map((r: any) => r.ticker));
    const extras = candidates
      .filter(c => !baseTickers.has(c.ticker) && !excludedTickers.includes(c.ticker))
      .map(c => ({
        ticker:         c.ticker,
        name:           c.name,
        allocation_pct: c.allocation_pct,
        current_price:  c.current_price ?? null,
        change_1d_pct:  c.change_1d_pct ?? null,
        asset_class:    c.asset_class,
        sector:         c.sector,
        rationale:      `${c.name} es relevante para tu perfil como ejemplo educativo de activos de clase ${c.asset_class}. Su inclusión ilustra el principio de diversificación entre distintas clases de activos.`,
        key_risk:       `Como todo activo de tipo ${c.asset_class}, presenta riesgos propios de su categoría que es importante comprender antes de invertir.`,
      }));

    return {
      ...base,
      recommendations: [
        ...baseFiltered.map((r: any) => ({
          ...r,
          current_price: pricesMap[r.ticker]?.price ?? r.current_price,
          change_1d_pct: pricesMap[r.ticker]?.change_1d_pct ?? r.change_1d_pct,
          key_risk:      r.key_risk ?? r.key_concept,
        })),
        ...extras,
      ],
    };
  }

  private buildCandidates(score: number, pricesMap: Record<string, any>, user: any, prefs: any, extraExcluded: string[] = [], ucbScores: Record<string, number> = {}): any[] {
    const band     = score <= 3 ? 'conservative' : score <= 6 ? 'balanced' : score <= 8 ? 'growth' : 'aggressive';
    const rules    = ALLOCATION_RULES[band];
    const excluded: string[] = user.excluded_sectors ?? [];
    const avoided:  string[] = [...(prefs?.avoided_tickers ?? []), ...extraExcluded];
    const merged   = { ...pricesMap };

    const byClass: Record<string, string[]> = {};
    for (const [ticker, p] of Object.entries(merged)) {
      const risk = (p as any).risk_level ?? 5;
      if (Math.abs(risk - score) > 3) continue;
      if (excluded.includes((p as any).sector)) continue;
      if (avoided.includes(ticker)) continue;
      const ac = (p as any).asset_class;
      if (!byClass[ac]) byClass[ac] = [];
      byClass[ac].push(ticker);
    }

    const result: any[] = [];
    for (const [assetClass, weight] of Object.entries(rules)) {
      if (weight === 0) continue;
      const tickers = this.bandit.rank(byClass[assetClass] ?? [], ucbScores).slice(0, 2);
      if (!tickers.length) continue;
      const perTicker = (weight / tickers.length) * 100;
      for (const ticker of tickers) {
        const p = merged[ticker] ?? {};
        result.push({
          ticker,
          name:           (p as any).name ?? ticker,
          asset_class:    assetClass,
          sector:         (p as any).sector ?? '',
          allocation_pct: Math.round(perTicker * 100) / 100,
          current_price:  (p as any).price ?? null,
          change_1d_pct:  (p as any).change_1d_pct ?? null,
        });
      }
    }

    const total = result.reduce((s, r) => s + r.allocation_pct, 0);
    if (total > 0) {
      const f = 100 / total;
      result.forEach(r => { r.allocation_pct = Math.round(r.allocation_pct * f * 100) / 100; });
    }
    return result.sort((a, b) => b.allocation_pct - a.allocation_pct);
  }
}
