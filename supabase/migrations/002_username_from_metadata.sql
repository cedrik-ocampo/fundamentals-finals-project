-- ============================================================
-- Update handle_new_user to use preferred_username from metadata
-- and handle username collisions gracefully.
-- Run this in the Supabase SQL Editor
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  preferred     TEXT;
  base_username TEXT;
  final_username TEXT;
  counter       INT := 0;
BEGIN
  preferred := LOWER(TRIM(COALESCE(NEW.raw_user_meta_data->>'preferred_username', '')));

  IF preferred <> '' THEN
    base_username := preferred;
  ELSE
    base_username := LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9_]', '_', 'g'))
                     || '_' || SUBSTR(REPLACE(NEW.id::TEXT, '-', ''), 1, 4);
  END IF;

  -- Ensure uniqueness — append incrementing suffix if taken
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;

  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NULLIF(preferred, ''), SPLIT_PART(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;  -- idempotent: skip if profile already exists

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
