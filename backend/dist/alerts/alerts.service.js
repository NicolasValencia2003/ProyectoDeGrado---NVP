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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let AlertsService = class AlertsService {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async getAll(userId) {
        if (!this.supabase.isConfigured())
            return [];
        const now = new Date().toISOString();
        const generated = [];
        const readConditions = new Set();
        if (userId) {
            try {
                const { data } = await this.supabase.db
                    .from('alert_reads')
                    .select('condition_name')
                    .eq('user_id', userId);
                (data ?? []).forEach((r) => readConditions.add(r.condition_name));
            }
            catch { }
        }
        try {
            const { data: s } = await this.supabase.db
                .from('sentiment_cache')
                .select('fear_greed, fear_greed_label, treasury_10y, updated_at')
                .eq('id', 1)
                .single();
            if (s) {
                const fg = s.fear_greed ?? 50;
                if (fg >= 75) {
                    const cond = 'extreme_greed';
                    generated.push({
                        id: cond, condition_name: cond, severity: 'warning',
                        message: `El índice Miedo/Codicia está en ${fg} (${s.fear_greed_label}). Históricamente, niveles de codicia extrema preceden periodos de mayor volatilidad.`,
                        created_at: s.updated_at ?? now,
                        read_by: readConditions.has(cond) ? [userId] : [],
                    });
                }
                else if (fg <= 25) {
                    const cond = 'extreme_fear';
                    generated.push({
                        id: cond, condition_name: cond, severity: 'info',
                        message: `El índice Miedo/Codicia está en ${fg} (${s.fear_greed_label}). El miedo extremo puede señalar oportunidades para inversores con horizonte largo.`,
                        created_at: s.updated_at ?? now,
                        read_by: readConditions.has(cond) ? [userId] : [],
                    });
                }
                if ((s.treasury_10y ?? 0) >= 4.8) {
                    const cond = 'high_treasury';
                    generated.push({
                        id: cond, condition_name: cond, severity: 'info',
                        message: `El bono del tesoro de EE.UU. a 10 años rinde ${s.treasury_10y}%. Tasas altas pueden presionar la valoración de activos de renta variable.`,
                        created_at: s.updated_at ?? now,
                        read_by: readConditions.has(cond) ? [userId] : [],
                    });
                }
            }
        }
        catch { }
        try {
            const benchmarks = ['SPY', 'QQQ', 'BTC-USD', 'GLD', 'TLT'];
            const { data: prices } = await this.supabase.db
                .from('prices_cache')
                .select('ticker, name, change_1d_pct, updated_at')
                .in('ticker', benchmarks);
            for (const p of prices ?? []) {
                const change = p.change_1d_pct ?? 0;
                if (Math.abs(change) < 3)
                    continue;
                const cond = `move_${p.ticker.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
                const dir = change > 0 ? 'subió' : 'bajó';
                generated.push({
                    id: cond, condition_name: cond,
                    severity: Math.abs(change) >= 5 ? 'danger' : 'warning',
                    message: `${p.name ?? p.ticker} ${dir} un ${Math.abs(change).toFixed(1)}% hoy. Los activos relacionados en tu portafolio podrían verse afectados.`,
                    created_at: p.updated_at ?? now,
                    read_by: readConditions.has(cond) ? [userId] : [],
                });
            }
        }
        catch { }
        if (userId) {
            try {
                const { data: hist } = await this.supabase.db
                    .from('recommendation_history')
                    .select('payload')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(1);
                const tickers = (hist?.[0]?.payload?.recommendations ?? []).map((r) => r.ticker);
                const covered = new Set(generated.map(a => a.condition_name));
                if (tickers.length) {
                    const { data: prices } = await this.supabase.db
                        .from('prices_cache')
                        .select('ticker, name, change_1d_pct, updated_at')
                        .in('ticker', tickers);
                    for (const p of prices ?? []) {
                        const change = p.change_1d_pct ?? 0;
                        if (Math.abs(change) < 3)
                            continue;
                        const benchCond = `move_${p.ticker.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
                        if (covered.has(benchCond))
                            continue;
                        const cond = `portfolio_${p.ticker.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
                        const dir = change > 0 ? 'subió' : 'bajó';
                        generated.push({
                            id: cond, condition_name: cond, severity: 'warning',
                            message: `${p.name ?? p.ticker} (en tu portafolio) ${dir} un ${Math.abs(change).toFixed(1)}% hoy.`,
                            created_at: p.updated_at ?? now,
                            read_by: readConditions.has(cond) ? [userId] : [],
                        });
                    }
                }
            }
            catch { }
        }
        if (generated.length === 0)
            return [];
        return generated.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    async markRead(conditionName, userId) {
        if (!this.supabase.isConfigured() || !userId)
            return;
        try {
            await this.supabase.db
                .from('alert_reads')
                .upsert({ user_id: userId, condition_name: conditionName }, { onConflict: 'user_id,condition_name' });
        }
        catch { }
    }
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], AlertsService);
//# sourceMappingURL=alerts.service.js.map