"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationsService = void 0;
const common_1 = require("@nestjs/common");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const supabase_service_1 = require("../supabase/supabase.service");
const market_data_fetcher_service_1 = require("../market/market-data-fetcher.service");
const life_profile_service_1 = require("../portfolio/life-profile.service");
const bandit_service_1 = require("../bandit/bandit.service");
const ALLOCATION_RULES = {
    conservative: { bond: 0.55, cash: 0.10, etf: 0.25, reit: 0.05, commodity: 0.05, stock: 0, crypto: 0 },
    balanced: { etf: 0.40, bond: 0.25, stock: 0.15, reit: 0.10, commodity: 0.05, cash: 0.05, crypto: 0 },
    growth: { etf: 0.35, stock: 0.25, crypto: 0.15, bond: 0.10, reit: 0.10, commodity: 0.05, cash: 0 },
    aggressive: { stock: 0.30, crypto: 0.30, etf: 0.25, commodity: 0.10, reit: 0.05, bond: 0, cash: 0 },
};
let RecommendationsService = class RecommendationsService {
    supabase;
    marketFetcher;
    bandit;
    logger = new common_1.Logger('RecommendationsService');
    anthropic = null;
    constructor(supabase, marketFetcher, bandit) {
        this.supabase = supabase;
        this.marketFetcher = marketFetcher;
        this.bandit = bandit;
        const apiKey = process.env.ANTHROPIC_API_KEY ?? '';
        if (apiKey && !apiKey.includes('your-anthropic')) {
            this.anthropic = new sdk_1.default({ apiKey });
        }
    }
    async generate(user, riskOverride, excludedTickers = []) {
        const score = riskOverride ?? user.risk_score ?? 7;
        let prefs = null;
        const timeout = (ms, fallback, p) => Promise.race([p, new Promise(r => setTimeout(() => r(fallback), ms))]);
        const [pricesMap, sentiment, ucbScores] = await Promise.all([
            timeout(10000, {}, this.marketFetcher.getPricesWithRefresh()),
            timeout(5000, {}, this.marketFetcher.getSentimentWithRefresh()),
            timeout(5000, {}, this.bandit.getScores(user.id ?? '')),
        ]);
        if (this.supabase.isConfigured() && user.id) {
            try {
                const { data } = await this.supabase.db
                    .from('user_preferences').select('*').eq('user_id', user.id).single();
                if (data)
                    prefs = data;
            }
            catch { }
        }
        const candidates = this.buildCandidates(score, pricesMap, user, prefs, excludedTickers, ucbScores);
        if (!this.anthropic) {
            throw new common_1.ServiceUnavailableException('El servicio de recomendaciones no está configurado. Contacta al administrador.');
        }
        let result;
        try {
            result = await this.generateWithClaude(user, prefs, candidates, pricesMap, sentiment, excludedTickers);
        }
        catch {
            result = {
                recommendations: candidates.map((c) => ({
                    ticker: c.ticker,
                    name: c.name,
                    allocation_pct: c.allocation_pct,
                    current_price: c.current_price ?? null,
                    change_1d_pct: c.change_1d_pct ?? null,
                    asset_class: c.asset_class,
                    sector: c.sector,
                    rationale: `${c.name} es un activo de clase ${c.asset_class} relevante para tu perfil de riesgo ${score}/10, seleccionado como ejemplo educativo de diversificación.`,
                    key_risk: `Como activo de tipo ${c.asset_class}, su comportamiento está ligado a condiciones específicas del mercado que es importante comprender.`,
                })),
                market_summary: 'Portafolio educativo generado a partir del análisis cuantitativo de mercado.',
                educational_insight: `Con un perfil de riesgo ${score}/10, este portafolio diversificado ofrece una base para aprender sobre distintas clases de activos.`,
                disclaimer: 'Este contenido es material educativo generado por FinVise, plataforma académica de la Pontificia Universidad Javeriana Cali. No constituye asesoramiento financiero personalizado bajo ninguna norma legal o regulatoria. Consulta un asesor certificado ante la Superintendencia Financiera antes de tomar decisiones de inversión real.',
            };
        }
        const candidateTickers = new Set(candidates.map((c) => c.ticker));
        result.recommendations = (result.recommendations ?? []).filter((r) => candidateTickers.has(r.ticker));
        if (excludedTickers.length > 0) {
            result.recommendations = result.recommendations.filter((r) => !excludedTickers.includes(r.ticker));
        }
        if ((result.recommendations ?? []).length === 0 && candidates.length > 0) {
            result.recommendations = candidates.map((c) => ({
                ticker: c.ticker,
                name: c.name,
                allocation_pct: c.allocation_pct,
                current_price: c.current_price ?? null,
                change_1d_pct: c.change_1d_pct ?? null,
                asset_class: c.asset_class,
                sector: c.sector,
                rationale: `${c.name} es un activo de clase ${c.asset_class} relevante para tu perfil de riesgo ${score}/10, seleccionado como ejemplo educativo de diversificación.`,
                key_risk: `Como activo de tipo ${c.asset_class}, su comportamiento está ligado a condiciones específicas del mercado que es importante comprender.`,
            }));
        }
        if (this.supabase.isConfigured() && user.id) {
            const { error: histErr } = await this.supabase.db.from('recommendation_history').insert({
                user_id: user.id,
                risk_score_used: score,
                payload: result,
                market_snapshot: {
                    fear_greed: sentiment?.fear_greed ?? null,
                    fear_greed_label: sentiment?.fear_greed_label ?? null,
                    treasury_10y: sentiment?.treasury_10y ?? null,
                },
            });
            if (histErr)
                this.logger.error(`recommendation_history insert failed: ${histErr.message}`);
        }
        return result;
    }
    async generateWithClaude(user, prefs, candidates, pricesMap, sentiment, excludedTickers = []) {
        const lifeContext = (0, life_profile_service_1.buildLifeProfileContext)(user, prefs);
        const biasInstructions = (0, life_profile_service_1.buildBiasInstructions)(prefs?.detected_biases ?? {});
        const headlines = Array.isArray(sentiment?.top_headlines) ? sentiment.top_headlines : [];
        const topHeadline = headlines[0]?.title ?? 'Markets continue steady amid mixed economic signals';
        const candidateList = candidates
            .map(c => `  - ${c.ticker} (${c.name}): ${c.allocation_pct.toFixed(1)}% allocation, ` +
            `price $${c.current_price?.toLocaleString?.() ?? 'N/A'}, ` +
            `${(c.change_1d_pct ?? 0) >= 0 ? '+' : ''}${(c.change_1d_pct ?? 0).toFixed(2)}% today`)
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
            const claudeTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Claude timeout')), 20000));
            const message = await Promise.race([
                this.anthropic.messages.create({
                    model: 'claude-sonnet-4-6',
                    max_tokens: 1800,
                    messages: [{ role: 'user', content: prompt }],
                }),
                claudeTimeout,
            ]);
            const raw = message.content[0].type === 'text' ? message.content[0].text : '{}';
            const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
            const parsed = JSON.parse(text);
            parsed.recommendations = (parsed.recommendations ?? []).map((r) => ({
                ...r,
                current_price: pricesMap[r.ticker]?.price ?? null,
                change_1d_pct: pricesMap[r.ticker]?.change_1d_pct ?? null,
                key_risk: r.key_concept ?? r.key_risk,
            }));
            return parsed;
        }
        catch (err) {
            const msg = err.message;
            throw new common_1.ServiceUnavailableException(`Error al generar recomendaciones: ${msg}`);
        }
    }
    buildCandidates(score, pricesMap, user, prefs, extraExcluded = [], ucbScores = {}) {
        const band = score <= 3 ? 'conservative' : score <= 6 ? 'balanced' : score <= 8 ? 'growth' : 'aggressive';
        const rules = ALLOCATION_RULES[band];
        const excluded = [...(prefs?.excluded_sectors ?? []), ...(user.excluded_sectors ?? [])];
        const avoided = [...(prefs?.avoided_tickers ?? []), ...extraExcluded];
        const merged = { ...pricesMap };
        const buildByClass = (tolerance) => {
            const map = {};
            for (const [ticker, p] of Object.entries(merged)) {
                const risk = p.risk_level ?? 5;
                if (Math.abs(risk - score) > tolerance)
                    continue;
                if (excluded.includes(p.sector))
                    continue;
                if (avoided.includes(ticker))
                    continue;
                const ac = p.asset_class;
                if (!map[ac])
                    map[ac] = [];
                map[ac].push(ticker);
            }
            return map;
        };
        const strict = buildByClass(3);
        const wide = buildByClass(6);
        const byClass = {};
        for (const assetClass of Object.keys(rules)) {
            byClass[assetClass] = strict[assetClass]?.length ? strict[assetClass] : (wide[assetClass] ?? []);
        }
        const result = [];
        for (const [assetClass, weight] of Object.entries(rules)) {
            if (weight === 0)
                continue;
            const tickers = this.bandit.rank(byClass[assetClass] ?? [], ucbScores).slice(0, 1);
            if (!tickers.length)
                continue;
            const perTicker = (weight / tickers.length) * 100;
            for (const ticker of tickers) {
                const p = merged[ticker] ?? {};
                result.push({
                    ticker,
                    name: p.name ?? ticker,
                    asset_class: assetClass,
                    sector: p.sector ?? '',
                    allocation_pct: Math.round(perTicker * 100) / 100,
                    current_price: p.price ?? null,
                    change_1d_pct: p.change_1d_pct ?? null,
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
};
exports.RecommendationsService = RecommendationsService;
exports.RecommendationsService = RecommendationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        market_data_fetcher_service_1.MarketDataFetcherService,
        bandit_service_1.BanditService])
], RecommendationsService);
//# sourceMappingURL=recommendations.service.js.map