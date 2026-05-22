import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

const BIAS_THRESHOLD = 0.45;

interface BiasDef {
  name: string;
  icon: string;
  description: string;
  intervention: string;
  tip: string;
  prompt_instruction: string;
}

const BIAS_DEFS: Record<string, BiasDef> = {
  recency: {
    name: 'Sesgo de Recencia',
    icon: '⏱',
    description: 'Sobreponderas eventos recientes del mercado, como caídas o subidas abruptas, ignorando la tendencia histórica de largo plazo.',
    intervention: 'Los mercados han atravesado cientos de crisis y siempre se han recuperado en horizontes de 10+ años. El S&P 500 ha rendido en promedio un 10% anual en los últimos 50 años a pesar del crash del 2000, la crisis de 2008 y la pandemia de 2020.',
    tip: 'Antes de cambiar de estrategia, pregúntate: ¿Tomaría esta misma decisión si el mercado hubiera estado estable la última semana? Si no, probablemente es el sesgo de recencia actuando.',
    prompt_instruction: 'El usuario muestra sesgo de recencia. Enfatiza perspectiva histórica de largo plazo y datos de ciclos anteriores. Contrasta la situación actual con crisis pasadas que se recuperaron.',
  },
  familiarity: {
    name: 'Sesgo de Familiaridad',
    icon: '🔍',
    description: 'Concentras tu atención en activos que ya conoces, como empresas tecnológicas o criptomonedas, ignorando oportunidades en otros sectores con menor correlación.',
    intervention: 'Un portafolio diversificado entre sectores tiene históricamente menor volatilidad con retornos similares. La correlación entre tecnología y renta fija es casi cero, lo que significa que los bonos pueden protegerte cuando las acciones tecnológicas caen.',
    tip: 'Conocer bien una empresa no la convierte en mejor inversión. Apple es la marca más reconocida del mundo, pero cayó más del 26% en 2022. El conocimiento y la rentabilidad son independientes.',
    prompt_instruction: 'El usuario muestra sesgo de familiaridad hacia sectores específicos. Presenta activos de sectores menos familiares como oportunidades educativas. Usa datos de correlación para explicar el valor de la diversificación.',
  },
  loss_aversion: {
    name: 'Aversión a la Pérdida',
    icon: '📉',
    description: 'El dolor psicológico de una pérdida te afecta aproximadamente el doble que el placer de una ganancia equivalente, lo que puede llevarte a decisiones sub-óptimas.',
    intervention: 'Kahneman y Tversky demostraron que los humanos somos naturalmente adversos a las pérdidas. Sin embargo, los inversores que mantienen su estrategia durante caídas históricamente superan a quienes salen del mercado con pérdidas realizadas.',
    tip: 'Una pérdida en papel no es una pérdida real hasta que vendes. Si el activo tiene fundamentos sólidos, el tiempo es tu aliado. Los mercados que caen eventualmente se recuperan.',
    prompt_instruction: 'El usuario muestra alta aversión a la pérdida. Enfatiza el concepto de pérdida en papel vs pérdida realizada. Incluye estadísticas de recuperación histórica. Evita lenguaje que amplifique el miedo a perder.',
  },
  overconfidence: {
    name: 'Exceso de Confianza',
    icon: '🎯',
    description: 'Tu tolerancia al riesgo declarada es significativamente mayor de lo que tu perfil de vida sugeriría como prudente dado tu edad, ingresos y responsabilidades.',
    intervention: 'El exceso de confianza es el sesgo más documentado en finanzas conductuales. Estudios muestran que inversores que se auto-califican con alta tolerancia al riesgo frecuentemente venden en pánico durante caídas reales cuando ven su dinero disminuir.',
    tip: 'Imagina que tu portafolio pierde el 35% mañana. ¿Podrías mantener la estrategia sin afectar tu calidad de vida? Si hay dudas, tu riesgo real es menor al declarado.',
    prompt_instruction: 'El usuario puede estar sobreestimando su tolerancia al riesgo. Introduce escenarios de stress-test educativos. Explica la diferencia entre riesgo declarado y riesgo vivenciado. Sugiere portafolios ligeramente más conservadores como aprendizaje.',
  },
  disposition: {
    name: 'Efecto de Disposición',
    icon: '⚖️',
    description: 'Tendencia psicológica a vender activos ganadores demasiado pronto para "asegurar" la ganancia, y mantener los perdedores esperando que "vuelvan" al precio de compra.',
    intervention: 'El efecto de disposición fue documentado por Shefrin y Statman en 1985. Los inversores que lo siguen terminan con portafolios llenos de "perdedores" y sin "ganadores". La decisión de vender debe basarse en los fundamentos actuales, no en el precio de compra.',
    tip: 'Pregúntate: Si no tuvieras este activo hoy y tuvieras ese dinero disponible, ¿lo comprarías? Si la respuesta es no, probablemente deberías venderlo independientemente de si estás en pérdida o ganancia.',
    prompt_instruction: 'El usuario puede mostrar efecto de disposición. Introduce el concepto de costo irrecuperable (sunk cost). Explica que el precio de compra es irrelevante para decisiones futuras.',
  },
};

@Injectable()
export class BiasDetectionService {
  private readonly log = new Logger('BiasDetection');

  constructor(private supabase: SupabaseService) {}

  async analyzeUser(userId: string, userProfile: any): Promise<any> {
    const empty = { scores: {}, active: [], last_updated: new Date().toISOString() };
    if (!this.supabase.isConfigured() || !userId) return empty;

    try {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: events } = await this.supabase.db!
        .from('user_events')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', since)
        .order('created_at', { ascending: false });

      // Fetch full profile for overconfidence scoring
      const { data: profileRow } = await this.supabase.db!
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const profile = { ...userProfile, ...(profileRow ?? {}) };
      const allEvents = events ?? [];

      const scores: Record<string, number> = {
        recency:        this.scoreRecency(allEvents),
        familiarity:    this.scoreFamiliarity(allEvents),
        loss_aversion:  this.scoreLossAversion(allEvents),
        overconfidence: this.scoreOverconfidence(profile),
        disposition:    this.scoreDisposition(allEvents),
      };

      const active = Object.entries(scores)
        .filter(([, score]) => score >= BIAS_THRESHOLD)
        .sort(([, a], [, b]) => b - a)
        .map(([key, score]) => ({
          key,
          score: Math.round(score * 100) / 100,
          ...BIAS_DEFS[key],
          evidence: this.buildEvidence(key, allEvents, profile),
        }));

      const biasMap = active.length > 0
        ? Object.fromEntries(active.map(b => [b.key, { score: b.score, prompt_instruction: b.prompt_instruction }]))
        : {};

      const { error: prefErr } = await this.supabase.db!.from('user_preferences')
        .upsert(
          { user_id: userId, detected_biases: biasMap, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );
      if (prefErr) this.log.warn(`user_preferences upsert failed: ${prefErr.message}`);

      if (active.length > 0) {
        const interventions = active.map(b => ({
          user_id:    userId,
          bias_type:  b.key,
          strength:   b.score,
          detected_at: new Date().toISOString(),
        }));
        const { error: intErr } = await this.supabase.db!
          .from('bias_interventions')
          .insert(interventions);
        if (intErr) this.log.warn(`bias_interventions insert failed: ${intErr.message}`);
      }

      this.log.log(`Bias analysis [${userId.slice(0, 8)}]: ${active.map(b => b.key).join(', ') || 'none detected'}`);
      return { scores, active, last_updated: new Date().toISOString() };
    } catch (err) {
      this.log.warn('Bias analysis error: ' + (err as Error).message);
      return empty;
    }
  }

  // ─── Scoring Functions ──────────────────────────────────────────────────────

  private scoreRecency(events: any[]): number {
    const requests = events.filter(e => e.event_type === 'recommendation_requested');
    if (requests.length < 2) return 0;
    const now = Date.now();
    const last24h = requests.filter(e => now - new Date(e.created_at).getTime() < 86_400_000).length;
    const last7d  = requests.filter(e => now - new Date(e.created_at).getTime() < 7 * 86_400_000).length;
    return Math.max(Math.min(last24h / 4, 1), Math.min(last7d / 10, 0.65));
  }

  private scoreFamiliarity(events: any[]): number {
    const withSector = events.filter(e => e.sector && e.sector !== 'cognitive');
    if (withSector.length < 5) return 0;
    const counts: Record<string, number> = {};
    for (const e of withSector) counts[e.sector] = (counts[e.sector] ?? 0) + 1;
    const max = Math.max(...Object.values(counts));
    return Math.min(max / withSector.length, 1);
  }

  private scoreLossAversion(events: any[]): number {
    const simEvents = events.filter(
      e => e.event_type === 'simulator_used' && e.metadata?.result_pct !== undefined
    );
    if (simEvents.length < 3) return 0;
    const neg = simEvents.filter(e => (e.metadata?.result_pct ?? 0) < 0).length;
    const pos = simEvents.filter(e => (e.metadata?.result_pct ?? 0) >= 0).length;
    if (pos === 0) return Math.min(neg / 4, 0.9);
    const ratio = neg / pos;
    return ratio > 2 ? Math.min(ratio / 5, 1) : 0;
  }

  private scoreOverconfidence(profile: any): number {
    const declared = parseInt(profile?.risk_score ?? '0', 10);
    if (!declared) return 0;

    let suggested = 5;
    const ageGroup = profile?.age_group ?? '';
    if (ageGroup === '55+')   suggested -= 2;
    else if (ageGroup === '45-54') suggested -= 1;
    else if (ageGroup === '18-24') suggested += 1;

    const income = profile?.monthly_income ?? '';
    if (income === 'less_than_1m') suggested -= 2;
    else if (income === 'more_than_5m') suggested += 1;

    const deps = profile?.dependents ?? profile?.family_context ?? '';
    if (deps === 'yes_multiple' || deps === 'large_family') suggested -= 1;

    suggested = Math.max(1, Math.min(10, suggested));
    const delta = declared - suggested;
    return delta >= 3 ? Math.min(delta / 5, 1) : 0;
  }

  private scoreDisposition(events: any[]): number {
    const chatEvents = events.filter(e => e.event_type === 'chat_message');
    if (chatEvents.length < 5) return 0;
    const sellIntent = chatEvents.filter(e => e.metadata?.has_sell_intent === true).length;
    const holdIntent = chatEvents.filter(e => e.metadata?.has_hold_intent === true).length;
    if (sellIntent + holdIntent === 0) return 0;
    if (holdIntent === 0) return Math.min(sellIntent / 5, 0.8);
    const ratio = sellIntent / holdIntent;
    return ratio > 2.5 ? Math.min(ratio / 5, 0.9) : 0;
  }

  // ─── Evidence Builder ───────────────────────────────────────────────────────

  private buildEvidence(key: string, events: any[], profile: any): string {
    switch (key) {
      case 'recency': {
        const n = events.filter(e =>
          e.event_type === 'recommendation_requested' &&
          Date.now() - new Date(e.created_at).getTime() < 86_400_000
        ).length;
        const w = events.filter(e => e.event_type === 'recommendation_requested').length;
        return `Solicitaste recomendaciones ${n} ${n === 1 ? 'vez' : 'veces'} en las últimas 24 horas y ${w} en los últimos 30 días.`;
      }
      case 'familiarity': {
        const withSector = events.filter(e => e.sector && e.sector !== 'cognitive');
        const counts: Record<string, number> = {};
        for (const e of withSector) counts[e.sector] = (counts[e.sector] ?? 0) + 1;
        const top = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];
        if (!top) return 'Alta concentración en un sector específico del mercado.';
        return `El ${Math.round((top[1] / withSector.length) * 100)}% de tus interacciones son del sector "${top[0]}" (${top[1]} de ${withSector.length} eventos).`;
      }
      case 'loss_aversion': {
        const sims = events.filter(e => e.event_type === 'simulator_used' && e.metadata?.result_pct !== undefined);
        const neg = sims.filter(e => (e.metadata?.result_pct ?? 0) < 0).length;
        const pos = sims.filter(e => (e.metadata?.result_pct ?? 0) >= 0).length;
        return `${neg} simulaciones en escenario negativo versus ${pos} en escenario positivo en los últimos 30 días.`;
      }
      case 'overconfidence': {
        const declared = profile?.risk_score ?? '?';
        let suggested = 5;
        if (profile?.age_group === '55+') suggested -= 2;
        else if (profile?.age_group === '45-54') suggested -= 1;
        else if (profile?.age_group === '18-24') suggested += 1;
        if (profile?.monthly_income === 'less_than_1m') suggested -= 2;
        suggested = Math.max(1, Math.min(10, suggested));
        return `Tu riesgo declarado es ${declared}/10, pero tu perfil de vida (edad, ingresos, dependientes) sugiere alrededor de ${suggested}/10 como punto de partida prudente.`;
      }
      case 'disposition': {
        const chatEvents = events.filter(e => e.event_type === 'chat_message');
        const sell = chatEvents.filter(e => e.metadata?.has_sell_intent === true).length;
        const hold = chatEvents.filter(e => e.metadata?.has_hold_intent === true).length;
        return `Detectamos ${sell} preguntas sobre cuándo vender activos ganadores y ${hold} sobre mantener activos perdedores en el chat educativo.`;
      }
      default:
        return '';
    }
  }
}
