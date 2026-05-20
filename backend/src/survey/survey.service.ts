import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SurveyService {
  constructor(private supabase: SupabaseService) {}

  async save(userId: string, dto: any): Promise<{ ok: boolean }> {
    if (this.supabase.isConfigured()) {
      await this.supabase.db!
        .from('survey_responses')
        .upsert(
          {
            user_id:            userId,
            survey_type:        dto.survey_type,
            section_a_score:    dto.section_a_score,
            section_a_answers:  dto.section_a_answers,
            section_b_score:    dto.section_b_score,
            section_b_answers:  dto.section_b_answers,
            section_c_score:    dto.section_c_score,
            section_c_answers:  dto.section_c_answers,
            section_d_rating:   dto.section_d_rating,
            section_d_learned:  dto.section_d_learned,
            section_d_recommend:dto.section_d_recommend,
            completed_at:       new Date().toISOString(),
          },
          { onConflict: 'user_id,survey_type' }
        )
        .throwOnError();
    }
    return { ok: true };
  }

  async get(userId: string, type: string): Promise<any> {
    if (!this.supabase.isConfigured()) return null;
    const { data } = await this.supabase.db!
      .from('survey_responses')
      .select('*')
      .eq('user_id', userId)
      .eq('survey_type', type)
      .single();
    return data;
  }

  async getComparison(userId: string): Promise<{ pre: any; post: any }> {
    if (!this.supabase.isConfigured()) return { pre: null, post: null };
    const { data } = await this.supabase.db!
      .from('survey_responses')
      .select('*')
      .eq('user_id', userId);
    const pre  = data?.find((r: any) => r.survey_type === 'pre')  ?? null;
    const post = data?.find((r: any) => r.survey_type === 'post') ?? null;
    return { pre, post };
  }
}
