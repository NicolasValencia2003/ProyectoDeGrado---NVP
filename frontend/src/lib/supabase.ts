import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://yzizzghmgdvwnkmxshla.supabase.co',
  'sb_publishable_kiKN_6Q1Dno2GEbkmwqpcQ_lxAL_Tny'
);

export type Profile = {
  id: string;
  risk_score: number | null;
  age_group: string | null;
  occupation_type: string | null;
  education_level: string | null;
  family_context: string | null;
  primary_goal: string | null;
  motivation: string | null;
  academic_disclaimer_accepted: boolean;
};
