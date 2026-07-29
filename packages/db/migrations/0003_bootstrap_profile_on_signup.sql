-- 0003_bootstrap_profile_on_signup.sql
-- Auto-create a `profiles` row when a new user signs up via Supabase Auth.
-- Idempotent.
--
-- Defaults: role='customer', studio_id is hardcoded to the MVP studio UUID
-- (`STUDIO_ID` en .env). Si en el futuro cambias STUDIO_ID, regenerá esta
-- migración con el nuevo UUID.

-- =====================================================================
-- Function
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_studio uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Make `auth.uid()` return NEW.id within this transaction so the existing
  -- `profiles_self_insert` RLS policy can pass (id = auth.uid()).
  PERFORM set_config('request.jwt.claim.sub', NEW.id::text, true);

  INSERT INTO public.profiles (id, role, studio_id)
  VALUES (NEW.id, 'customer', default_studio)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- =====================================================================
-- Trigger
-- =====================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
