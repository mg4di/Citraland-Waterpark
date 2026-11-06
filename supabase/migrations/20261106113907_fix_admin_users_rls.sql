CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.admin_users
      WHERE lower(email) = lower((SELECT auth.jwt() ->> 'email'))
    );
$$;
REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT private.is_admin();
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

CREATE OR REPLACE FUNCTION private.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.admin_users
      WHERE lower(email) = lower((SELECT auth.jwt() ->> 'email'))
        AND role = 'super_admin'
    );
$$;
REVOKE ALL ON FUNCTION private.is_super_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.is_super_admin() TO authenticated;

DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can manage admins" ON public.admin_users;
CREATE POLICY "Admins can view admin_users" ON public.admin_users
  FOR SELECT TO authenticated USING (
    lower(email) = lower((SELECT auth.jwt() ->> 'email')) OR public.is_admin()
  );
CREATE POLICY "Super admins can manage admins" ON public.admin_users
  FOR ALL TO authenticated
  USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());