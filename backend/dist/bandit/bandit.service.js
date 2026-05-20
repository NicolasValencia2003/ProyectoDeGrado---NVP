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
exports.BanditService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let BanditService = class BanditService {
    supabase;
    log = new common_1.Logger('BanditService');
    C = Math.SQRT2;
    REWARDS = {
        rate_up: 1.0,
        save: 0.8,
        rate_down: -1.0,
        dismiss: -0.5,
    };
    constructor(supabase) {
        this.supabase = supabase;
    }
    async getScores(userId) {
        if (!this.supabase.isConfigured() || !userId)
            return {};
        try {
            const { data: events, error } = await this.supabase.db
                .from('user_events')
                .select('event_type, asset_ticker')
                .eq('user_id', userId)
                .in('event_type', ['view', 'rate_up', 'rate_down', 'save', 'dismiss'])
                .not('asset_ticker', 'is', null);
            if (error || !events?.length)
                return {};
            const pulls = {};
            const rewards = {};
            let totalPulls = 0;
            for (const ev of events) {
                const t = ev.asset_ticker;
                if (!t)
                    continue;
                if (ev.event_type === 'view') {
                    pulls[t] = (pulls[t] ?? 0) + 1;
                    totalPulls++;
                }
                else {
                    const r = this.REWARDS[ev.event_type] ?? 0;
                    rewards[t] = (rewards[t] ?? 0) + r;
                }
            }
            const scores = {};
            for (const ticker of new Set([...Object.keys(pulls), ...Object.keys(rewards)])) {
                const n = pulls[ticker] ?? 0;
                if (n === 0) {
                    scores[ticker] = (rewards[ticker] ?? 0);
                }
                else {
                    const mu = (rewards[ticker] ?? 0) / n;
                    const exploration = totalPulls > 1
                        ? this.C * Math.sqrt(Math.log(totalPulls) / n)
                        : 0;
                    scores[ticker] = mu + exploration;
                }
            }
            this.log.debug(`UCB scores computed for ${Object.keys(scores).length} tickers`);
            return scores;
        }
        catch (err) {
            this.log.warn('Bandit score error: ' + err.message);
            return {};
        }
    }
    async getBanditProfile(userId) {
        const empty = { top_liked: [], top_disliked: [], total_feedback_events: 0, total_tickers_seen: 0, personalization_pct: 0, positive_rate: 0 };
        if (!this.supabase.isConfigured() || !userId)
            return empty;
        try {
            const { data: events, error } = await this.supabase.db
                .from('user_events')
                .select('event_type, asset_ticker')
                .eq('user_id', userId)
                .in('event_type', ['view', 'rate_up', 'rate_down', 'save', 'dismiss'])
                .not('asset_ticker', 'is', null);
            if (error || !events?.length)
                return empty;
            const rewards = {};
            const counts = {};
            let totalFeedback = 0;
            let positiveFeedback = 0;
            for (const ev of events) {
                const t = ev.asset_ticker;
                if (!t || ev.event_type === 'view')
                    continue;
                const r = this.REWARDS[ev.event_type] ?? 0;
                rewards[t] = (rewards[t] ?? 0) + r;
                counts[t] = (counts[t] ?? 0) + 1;
                totalFeedback++;
                if (r > 0)
                    positiveFeedback++;
            }
            const tickers = Object.keys(rewards);
            const profile = tickers.map(ticker => ({
                ticker,
                net_reward: Math.round(rewards[ticker] * 100) / 100,
                feedback_count: counts[ticker] ?? 0,
            })).sort((a, b) => b.net_reward - a.net_reward);
            return {
                top_liked: profile.filter(p => p.net_reward > 0).slice(0, 4),
                top_disliked: profile.filter(p => p.net_reward < 0).slice(0, 4),
                total_feedback_events: totalFeedback,
                total_tickers_seen: new Set(events.filter(e => e.event_type === 'view').map(e => e.asset_ticker)).size,
                personalization_pct: Math.min(Math.round((totalFeedback / 20) * 100), 100),
                positive_rate: totalFeedback > 0 ? Math.round((positiveFeedback / totalFeedback) * 100) : 0,
            };
        }
        catch (err) {
            this.log.warn('Bandit profile error: ' + err.message);
            return empty;
        }
    }
    rank(tickers, ucbScores) {
        return [...tickers].sort((a, b) => {
            const sa = ucbScores[a] ?? Infinity;
            const sb = ucbScores[b] ?? Infinity;
            if (sa === Infinity && sb === Infinity)
                return 0;
            if (sa === Infinity)
                return -1;
            if (sb === Infinity)
                return 1;
            return sb - sa;
        });
    }
};
exports.BanditService = BanditService;
exports.BanditService = BanditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], BanditService);
//# sourceMappingURL=bandit.service.js.map