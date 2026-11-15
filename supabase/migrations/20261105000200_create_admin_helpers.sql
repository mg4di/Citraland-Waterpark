-- Schema private serta fungsi pemeriksa admin (is_admin, is_super_admin).
-- Dipanggil oleh kebijakan RLS dan fungsi booking. SECURITY DEFINER dipakai agar
-- pembacaan admin_users tidak memicu rekursi RLS pada tabel itu sendiri.

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
