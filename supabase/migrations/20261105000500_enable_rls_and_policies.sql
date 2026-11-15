-- Row Level Security: aktifkan RLS, definisikan kebijakan akses per tabel, lalu beri hak akses tabel.
-- gates dan scan_logs hanya dapat diakses admin; perangkat ESP32 tidak membaca tabel
-- langsung, melainkan lewat fungsi SECURITY DEFINER.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.ticket_pricing ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.gates ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;

-- Kebijakan

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

DROP POLICY IF EXISTS "Admins can update users" ON public.users;

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can update users" ON public.users
  FOR UPDATE TO authenticated USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;

DROP POLICY IF EXISTS "Super admins can manage admins" ON public.admin_users;

CREATE POLICY "Admins can view admin_users" ON public.admin_users
  FOR SELECT TO authenticated USING (
    lower(email) = lower((SELECT auth.jwt() ->> 'email')) OR public.is_admin()
  );

CREATE POLICY "Super admins can manage admins" ON public.admin_users
  FOR ALL TO authenticated USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;

DROP POLICY IF EXISTS "Users can create own bookings" ON public.bookings;

DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;

DROP POLICY IF EXISTS "Admins can update bookings" ON public.bookings;

DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;

CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (lower(user_email) = lower(auth.jwt() ->> 'email'));

CREATE POLICY "Users can create own bookings" ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (lower(user_email) = lower(auth.jwt() ->> 'email'));

CREATE POLICY "Admins can view all bookings" ON public.bookings
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can update bookings" ON public.bookings
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete bookings" ON public.bookings
  FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public can view active pricing" ON public.ticket_pricing;

DROP POLICY IF EXISTS "Admins can manage pricing" ON public.ticket_pricing;

CREATE POLICY "Public can view active pricing" ON public.ticket_pricing
  FOR SELECT TO anon, authenticated USING (status = 'active');

CREATE POLICY "Admins can manage pricing" ON public.ticket_pricing
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can view active facilities" ON public.facilities;

DROP POLICY IF EXISTS "Admins can manage facilities" ON public.facilities;

CREATE POLICY "Public can view active facilities" ON public.facilities
  FOR SELECT TO anon, authenticated USING (status = 'active');

CREATE POLICY "Admins can manage facilities" ON public.facilities
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can view active promotions" ON public.promotions;

DROP POLICY IF EXISTS "Admins can manage promotions" ON public.promotions;

CREATE POLICY "Public can view active promotions" ON public.promotions
  FOR SELECT TO anon, authenticated USING (
    status = 'active' AND CURRENT_DATE BETWEEN start_date AND end_date
  );

CREATE POLICY "Admins can manage promotions" ON public.promotions
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can view published images" ON public.gallery_images;

DROP POLICY IF EXISTS "Admins can manage gallery" ON public.gallery_images;

CREATE POLICY "Public can view published images" ON public.gallery_images
  FOR SELECT TO anon, authenticated USING (status = 'published');

CREATE POLICY "Admins can manage gallery" ON public.gallery_images
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage gates" ON public.gates;

DROP POLICY IF EXISTS "Admins can view scan logs" ON public.scan_logs;

CREATE POLICY "Admins can manage gates" ON public.gates
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can view scan logs" ON public.scan_logs
  FOR SELECT TO authenticated USING (public.is_admin());

-- Hak akses tabel

GRANT SELECT ON public.users TO authenticated;

GRANT UPDATE (full_name, phone) ON public.users TO authenticated;

GRANT SELECT ON public.admin_users TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;

GRANT SELECT ON public.ticket_pricing, public.facilities, public.promotions, public.gallery_images
  TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON public.ticket_pricing, public.facilities,
  public.promotions, public.gallery_images TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gates TO authenticated;

GRANT SELECT ON public.scan_logs TO authenticated;
