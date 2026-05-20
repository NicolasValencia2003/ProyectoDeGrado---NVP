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
exports.SurveyService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let SurveyService = class SurveyService {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async save(userId, dto) {
        if (this.supabase.isConfigured()) {
            await this.supabase.db
                .from('survey_responses')
                .upsert({
                user_id: userId,
                survey_type: dto.survey_type,
                section_a_score: dto.section_a_score,
                section_a_answers: dto.section_a_answers,
                section_b_score: dto.section_b_score,
                section_b_answers: dto.section_b_answers,
                section_c_score: dto.section_c_score,
                section_c_answers: dto.section_c_answers,
                section_d_rating: dto.section_d_rating,
                section_d_learned: dto.section_d_learned,
                section_d_recommend: dto.section_d_recommend,
                completed_at: new Date().toISOString(),
            }, { onConflict: 'user_id,survey_type' })
                .throwOnError();
        }
        return { ok: true };
    }
    async get(userId, type) {
        if (!this.supabase.isConfigured())
            return null;
        const { data } = await this.supabase.db
            .from('survey_responses')
            .select('*')
            .eq('user_id', userId)
            .eq('survey_type', type)
            .single();
        return data;
    }
    async getComparison(userId) {
        if (!this.supabase.isConfigured())
            return { pre: null, post: null };
        const { data } = await this.supabase.db
            .from('survey_responses')
            .select('*')
            .eq('user_id', userId);
        const pre = data?.find((r) => r.survey_type === 'pre') ?? null;
        const post = data?.find((r) => r.survey_type === 'post') ?? null;
        return { pre, post };
    }
};
exports.SurveyService = SurveyService;
exports.SurveyService = SurveyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], SurveyService);
//# sourceMappingURL=survey.service.js.map