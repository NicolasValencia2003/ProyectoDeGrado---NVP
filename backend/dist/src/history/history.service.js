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
exports.HistoryService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
const mock_data_1 = require("../mock/mock-data");
let HistoryService = class HistoryService {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async getEnriched(userId) {
        let history = mock_data_1.MOCK_HISTORY;
        if (this.supabase.isConfigured() && userId) {
            try {
                const { data } = await this.supabase.db
                    .from('recommendation_history')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(20);
                if (data?.length)
                    history = data;
            }
            catch { }
        }
        return history.map((entry) => ({
            ...entry,
            payload: {
                ...entry.payload,
                recommendations: (entry.payload?.recommendations ?? []).map((r) => {
                    const current_price = mock_data_1.MOCK_PRICES[r.ticker]?.price ?? r.current_price ?? null;
                    const price_at_rec = r.price_at_rec ?? r.current_price ?? null;
                    const performance_pct = current_price && price_at_rec
                        ? Math.round(((current_price - price_at_rec) / price_at_rec) * 10000) / 100
                        : null;
                    return { ...r, current_price, performance_pct };
                }),
            },
        }));
    }
};
exports.HistoryService = HistoryService;
exports.HistoryService = HistoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], HistoryService);
//# sourceMappingURL=history.service.js.map