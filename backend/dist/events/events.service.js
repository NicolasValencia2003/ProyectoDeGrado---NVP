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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
const PREFERENCE_EVENTS = new Set(['rate_up', 'rate_down', 'save', 'unsave']);
let EventsService = class EventsService {
    supabase;
    logger = new common_1.Logger('EventsService');
    constructor(supabase) {
        this.supabase = supabase;
    }
    async log(event, userId) {
        if (!this.supabase.isConfigured() || !userId)
            return { ok: true };
        const db = this.supabase.db;
        const { error: evErr } = await db.from('user_events').insert({
            user_id: userId,
            event_type: event.event_type,
            asset_ticker: event.asset_ticker ?? null,
            asset_class: event.asset_class ?? null,
            sector: event.sector ?? null,
            dwell_seconds: event.dwell_seconds ?? null,
            metadata: event.metadata ?? null,
        });
        if (evErr)
            this.logger.warn(`Event insert failed [${event.event_type}]: ${evErr.message}`);
        const ticker = event.asset_ticker ?? null;
        const { error: rpcErr } = await db.rpc('upsert_user_preference', {
            p_user_id: userId,
            p_event_type: event.event_type,
            p_ticker: ticker,
        });
        if (rpcErr) {
            this.logger.warn(`upsert_user_preference RPC unavailable, using fallback: ${rpcErr.message}`);
            await this.fallbackUpdatePreferences(userId, event.event_type, ticker);
        }
        return { ok: true };
    }
    async fallbackUpdatePreferences(userId, eventType, ticker) {
        try {
            const db = this.supabase.db;
            const { data: current } = await db
                .from('user_preferences')
                .select('event_count, avoided_tickers, preferred_tickers')
                .eq('user_id', userId)
                .single();
            const eventCount = (current?.event_count ?? 0) + 1;
            const avoided = [...(current?.avoided_tickers ?? [])];
            const preferred = [...(current?.preferred_tickers ?? [])];
            if (ticker && PREFERENCE_EVENTS.has(eventType)) {
                if (eventType === 'rate_down') {
                    if (!avoided.includes(ticker))
                        avoided.push(ticker);
                    const pi = preferred.indexOf(ticker);
                    if (pi > -1)
                        preferred.splice(pi, 1);
                }
                else if (eventType === 'rate_up') {
                    if (!preferred.includes(ticker))
                        preferred.push(ticker);
                    const ai = avoided.indexOf(ticker);
                    if (ai > -1)
                        avoided.splice(ai, 1);
                }
                else if (eventType === 'save') {
                    if (!preferred.includes(ticker))
                        preferred.push(ticker);
                }
                else if (eventType === 'unsave') {
                    const pi = preferred.indexOf(ticker);
                    if (pi > -1)
                        preferred.splice(pi, 1);
                }
            }
            const { error } = await db.from('user_preferences').upsert({
                user_id: userId,
                event_count: eventCount,
                avoided_tickers: avoided,
                preferred_tickers: preferred,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
            if (error)
                this.logger.warn(`Fallback prefs upsert failed: ${error.message}`);
        }
        catch (err) {
            this.logger.warn(`Fallback prefs update error: ${err.message}`);
        }
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], EventsService);
//# sourceMappingURL=events.service.js.map