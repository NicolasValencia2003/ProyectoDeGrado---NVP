-- FinVise: Complete schema migration
-- Run this in Supabase SQL Editor

-- ─────────────────────────────────────────────────
-- 1. profiles (extends auth.users)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  age_group                       text CHECK (age_group IN ('18-24','25-34','35-44','45-54','55+')),
  occupation_type                 text CHECK (occupation_type IN ('student','employed_fixed','freelance','entrepreneur','unemployed','retired')),
  education_level                 text CHECK (education_level IN ('high_school','technical','university','postgrad')),
  family_context                  text CHECK (family_context IN ('single_no_deps','single_with_deps','couple_no_kids','couple_with_kids','large_family')),
  primary_goal                    text CHECK (primary_goal IN ('emergency_fund','buy_home','education','retirement','wealth_growth','general_learning')),
  motivation                      text CHECK (motivation IN ('curiosity','learn_before_invest','already_invest','academic','other')),
  risk_score                      int CHECK (risk_score BETWEEN 1 AND 10),
  academic_disclaimer_accepted    boolean DEFAULT false,
  academic_disclaimer_accepted_at timestamptz,
  created_at                      timestamptz DEFAULT now()
);

-- Add risk_score if already deployed without it
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS risk_score int CHECK (risk_score BETWEEN 1 AND 10);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_own" ON public.profiles;
CREATE POLICY "profiles_own" ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────
-- 2. survey_responses
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id                  bigserial PRIMARY KEY,
  user_id             uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  survey_type         text CHECK (survey_type IN ('pre','post')),
  section_a_score     int,
  section_a_answers   jsonb,
  section_b_score     numeric,
  section_b_answers   jsonb,
  section_c_score     numeric,
  section_c_answers   jsonb,
  section_d_rating    int,
  section_d_learned   text,
  section_d_recommend text,
  completed_at        timestamptz DEFAULT now(),
  UNIQUE(user_id, survey_type)
);

ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "survey_own" ON public.survey_responses;
CREATE POLICY "survey_own" ON public.survey_responses FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────
-- 3. bias_interventions
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bias_interventions (
  id                      bigserial PRIMARY KEY,
  user_id                 uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  bias_type               text NOT NULL,
  detected_at             timestamptz DEFAULT now(),
  strength                numeric(4,3),
  acknowledged            boolean DEFAULT false,
  acknowledged_at         timestamptz,
  sector_diversity_before numeric(4,3),
  sector_diversity_after  numeric(4,3)
);

ALTER TABLE public.bias_interventions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bias_own" ON public.bias_interventions;
CREATE POLICY "bias_own" ON public.bias_interventions FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────
-- 4. prices_cache (global)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.prices_cache (
  ticker        text PRIMARY KEY,
  name          text,
  price         numeric,
  change_1d_pct numeric,
  asset_class   text,
  sector        text,
  risk_level    int,
  updated_at    timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- 5. sentiment_cache (global, single row)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sentiment_cache (
  id               int PRIMARY KEY DEFAULT 1,
  fear_greed       int,
  fear_greed_label text,
  treasury_10y     numeric,
  top_headlines    jsonb,
  updated_at       timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- 6. recommendation_history
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.recommendation_history (
  id              bigserial PRIMARY KEY,
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_score_used int,
  payload         jsonb,
  market_snapshot jsonb,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE public.recommendation_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "history_own" ON public.recommendation_history;
CREATE POLICY "history_own" ON public.recommendation_history FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────
-- 7. user_events
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_events (
  id            bigserial PRIMARY KEY,
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type    text,
  asset_ticker  text,
  asset_class   text,
  sector        text,
  dwell_seconds int,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "events_own" ON public.user_events;
CREATE POLICY "events_own" ON public.user_events FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────
-- 8. user_preferences
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  sector_weights    jsonb DEFAULT '{}',
  asset_weights     jsonb DEFAULT '{}',
  avoided_tickers   text[] DEFAULT '{}',
  preferred_tickers text[] DEFAULT '{}',
  event_count       int DEFAULT 0,
  detected_biases   jsonb DEFAULT '{}',
  updated_at        timestamptz DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "prefs_own" ON public.user_preferences;
CREATE POLICY "prefs_own" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);
