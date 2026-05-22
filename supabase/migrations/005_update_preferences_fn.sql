-- Atomic function to keep user_preferences in sync after each behavioral event.
-- Called by the NestJS backend after every event insert.
CREATE OR REPLACE FUNCTION public.upsert_user_preference(
  p_user_id   uuid,
  p_event_type text,
  p_ticker    text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER   -- runs as owner, bypasses RLS
AS $$
BEGIN
  -- Ensure a row exists and bump event_count atomically.
  INSERT INTO public.user_preferences (user_id, event_count, updated_at)
  VALUES (p_user_id, 1, now())
  ON CONFLICT (user_id) DO UPDATE
    SET event_count = public.user_preferences.event_count + 1,
        updated_at  = now();

  -- Update ticker preference arrays based on event type.
  IF p_ticker IS NOT NULL THEN
    IF p_event_type = 'rate_down' THEN
      -- Add to avoided (idempotent: remove first, then append)
      UPDATE public.user_preferences
         SET avoided_tickers   = array_append(array_remove(avoided_tickers, p_ticker), p_ticker),
             preferred_tickers = array_remove(preferred_tickers, p_ticker),
             updated_at        = now()
       WHERE user_id = p_user_id;

    ELSIF p_event_type = 'rate_up' THEN
      -- Add to preferred, remove from avoided
      UPDATE public.user_preferences
         SET preferred_tickers = array_append(array_remove(preferred_tickers, p_ticker), p_ticker),
             avoided_tickers   = array_remove(avoided_tickers, p_ticker),
             updated_at        = now()
       WHERE user_id = p_user_id;

    ELSIF p_event_type = 'save' THEN
      UPDATE public.user_preferences
         SET preferred_tickers = array_append(array_remove(preferred_tickers, p_ticker), p_ticker),
             updated_at        = now()
       WHERE user_id = p_user_id;

    ELSIF p_event_type = 'unsave' THEN
      UPDATE public.user_preferences
         SET preferred_tickers = array_remove(preferred_tickers, p_ticker),
             updated_at        = now()
       WHERE user_id = p_user_id;
    END IF;
  END IF;
END;
$$;

-- Allow all authenticated roles to call it (backend uses service role which already bypasses RLS,
-- but grant to authenticated so direct client calls also work if needed).
GRANT EXECUTE ON FUNCTION public.upsert_user_preference(uuid, text, text) TO authenticated, service_role;
