CREATE TABLE IF NOT EXISTS public.alert_reads (
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  condition_name text NOT NULL,
  read_at        timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, condition_name)
);

ALTER TABLE public.alert_reads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "alert_reads_own" ON public.alert_reads;
CREATE POLICY "alert_reads_own" ON public.alert_reads FOR ALL USING (auth.uid() = user_id);
