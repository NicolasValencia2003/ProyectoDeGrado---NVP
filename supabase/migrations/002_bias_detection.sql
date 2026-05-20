-- Add metadata column to user_events for bias detection engine
ALTER TABLE user_events ADD COLUMN IF NOT EXISTS metadata jsonb;
