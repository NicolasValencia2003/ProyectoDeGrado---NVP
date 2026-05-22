ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS excluded_sectors text[] DEFAULT '{}';
