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
let EventsService = class EventsService {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async log(event, userId) {
        console.log('Event:', event.event_type, event.asset_ticker);
        if (this.supabase.isConfigured() && userId) {
            const row = {
                user_id: userId,
                event_type: event.event_type,
                asset_ticker: event.asset_ticker ?? null,
                asset_class: event.asset_class ?? null,
                sector: event.sector ?? null,
                dwell_seconds: event.dwell_seconds ?? null,
            };
            if (event.metadata != null)
                row.metadata = event.metadata;
            void this.supabase.db.from('user_events').insert(row).then(({ error }) => {
                if (error && error.message.includes('metadata')) {
                    delete row.metadata;
                    void this.supabase.db.from('user_events').insert(row);
                }
            });
        }
        return { ok: true };
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], EventsService);
//# sourceMappingURL=events.service.js.map