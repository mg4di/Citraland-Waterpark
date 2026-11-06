CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE IF NOT EXISTS public.admin_users (
  admin_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'moderator')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admin_users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE IF NOT EXISTS public.bookings (
  booking_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code text NOT NULL UNIQUE,
  user_name text NOT NULL,
  user_email text NOT NULL,
  user_phone text NOT NULL,
  visit_date date NOT NULL,
  ticket_types jsonb NOT NULL,
  total_amount numeric(10, 2) NOT NULL CHECK (total_amount >= 0),
  payment_status text NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  payment_method text,
  midtrans_transaction_id text,
  midtrans_payment_type text,
  midtrans_order_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bookings_email_format CHECK (user_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT bookings_visit_date_not_monday CHECK (extract(isodow FROM visit_date) <> 1),
  CONSTRAINT bookings_ticket_types_object CHECK (
    jsonb_typeof(ticket_types) = 'object' AND ticket_types <> '{}'::jsonb
  )
);

CREATE TABLE IF NOT EXISTS public.ticket_pricing (
  ticket_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_type text NOT NULL UNIQUE CHECK (ticket_type IN ('weekday', 'weekend')),
  ticket_name text NOT NULL,
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  days_description text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.facilities (
  facility_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  display_order integer NOT NULL DEFAULT 0 UNIQUE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.promotions (
  promo_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'nominal')),
  discount_amount numeric(10, 2) NOT NULL CHECK (discount_amount >= 0),
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT promotions_code_uppercase CHECK (promo_code = upper(promo_code)),
  CONSTRAINT promotions_valid_date_range CHECK (end_date >= start_date),
  CONSTRAINT promotions_valid_percentage CHECK (
    discount_type <> 'percentage' OR discount_amount <= 100
  )
);

CREATE TABLE IF NOT EXISTS public.gallery_images (
  image_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text,
  display_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  storage_path text
);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_booking_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  ticket_entry record;
  current_price numeric;
  calculated_total numeric := 0;
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF auth.uid() IS NULL
    OR lower(NEW.user_email) <> lower(auth.jwt() ->> 'email')
    OR NEW.payment_status <> 'pending'
    OR NEW.midtrans_transaction_id IS NOT NULL
    OR NEW.midtrans_payment_type IS NOT NULL
    OR NEW.midtrans_order_id IS NOT NULL THEN
    RAISE EXCEPTION 'Invalid booking insert';
  END IF;

  IF NEW.booking_code !~ '^BH-[A-Z0-9]{6}$'
    OR NEW.visit_date < CURRENT_DATE
    OR extract(isodow FROM NEW.visit_date) = 1
    OR jsonb_typeof(NEW.ticket_types) <> 'object'
    OR NEW.ticket_types = '{}'::jsonb THEN
    RAISE EXCEPTION 'Invalid booking data';
  END IF;

  FOR ticket_entry IN
    SELECT key, value FROM jsonb_each(NEW.ticket_types)
  LOOP
    IF ticket_entry.key NOT IN ('weekday', 'weekend')
      OR jsonb_typeof(ticket_entry.value) <> 'object'
      OR (ticket_entry.value ->> 'qty') !~ '^[1-9][0-9]*$'
      OR (ticket_entry.value ->> 'price') !~ '^[0-9]+(\.[0-9]+)?$' THEN
      RAISE EXCEPTION 'Invalid ticket selection';
    END IF;

    IF (ticket_entry.key = 'weekday' AND extract(isodow FROM NEW.visit_date) NOT BETWEEN 2 AND 5)
      OR (ticket_entry.key = 'weekend' AND extract(isodow FROM NEW.visit_date) NOT IN (6, 7)) THEN
      RAISE EXCEPTION 'Ticket type does not match visit date';
    END IF;

    SELECT price INTO current_price
    FROM public.ticket_pricing
    WHERE ticket_type = ticket_entry.key AND status = 'active';
    IF current_price IS NULL OR current_price <> (ticket_entry.value ->> 'price')::numeric THEN
      RAISE EXCEPTION 'Ticket price is no longer current';
    END IF;
    calculated_total := calculated_total
      + current_price * (ticket_entry.value ->> 'qty')::integer;
  END LOOP;

  IF calculated_total <> NEW.total_amount THEN
    RAISE EXCEPTION 'Booking total does not match ticket prices';
  END IF;

  RETURN NEW;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_code ON public.bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_bookings_user_email ON public.bookings(user_email);
CREATE INDEX IF NOT EXISTS idx_bookings_visit_date ON public.bookings(visit_date);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_ticket_types ON public.bookings USING GIN(ticket_types);
CREATE INDEX IF NOT EXISTS idx_bookings_midtrans_transaction_id
  ON public.bookings(midtrans_transaction_id);
CREATE INDEX IF NOT EXISTS idx_ticket_pricing_status ON public.ticket_pricing(status);
CREATE INDEX IF NOT EXISTS idx_facilities_status ON public.facilities(status);
CREATE INDEX IF NOT EXISTS idx_facilities_display_order ON public.facilities(display_order);
CREATE INDEX IF NOT EXISTS idx_promotions_status ON public.promotions(status);
CREATE INDEX IF NOT EXISTS idx_promotions_date_range ON public.promotions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_gallery_images_status ON public.gallery_images(status);
CREATE INDEX IF NOT EXISTS idx_gallery_images_display_order ON public.gallery_images(display_order);
CREATE INDEX IF NOT EXISTS idx_gallery_images_uploaded_at ON public.gallery_images(uploaded_at DESC);

DROP TRIGGER IF EXISTS users_set_updated_at ON public.users;
DROP TRIGGER IF EXISTS bookings_validate_insert ON public.bookings;
DROP TRIGGER IF EXISTS bookings_set_updated_at ON public.bookings;
DROP TRIGGER IF EXISTS ticket_pricing_set_updated_at ON public.ticket_pricing;
DROP TRIGGER IF EXISTS facilities_set_updated_at ON public.facilities;
CREATE TRIGGER bookings_set_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER bookings_validate_insert
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.validate_booking_insert();
CREATE TRIGGER ticket_pricing_set_updated_at
  BEFORE UPDATE ON public.ticket_pricing
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER facilities_set_updated_at
  BEFORE UPDATE ON public.facilities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    INSERT INTO public.users (user_id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      coalesce(nullif(trim(NEW.raw_user_meta_data ->> 'full_name'), ''), NEW.email)
    )
    ON CONFLICT (user_id) DO UPDATE
      SET email = EXCLUDED.email;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();

CREATE OR REPLACE FUNCTION public.apply_midtrans_notification(
  p_order_id text,
  p_transaction_id text,
  p_payment_type text,
  p_payment_status text
)
RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_booking public.bookings;
BEGIN
  IF p_payment_status NOT IN ('pending', 'paid', 'failed', 'cancelled', 'refunded') THEN
    RAISE EXCEPTION 'Unsupported payment status';
  END IF;

  SELECT * INTO current_booking
  FROM public.bookings
  WHERE midtrans_order_id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF current_booking.payment_status = 'refunded'
    OR (current_booking.payment_status IN ('paid', 'failed', 'cancelled')
      AND p_payment_status <> 'refunded') THEN
    RETURN current_booking;
  END IF;

  UPDATE public.bookings
  SET payment_status = p_payment_status,
      midtrans_transaction_id = p_transaction_id,
      midtrans_payment_type = p_payment_type,
      payment_method = p_payment_type
  WHERE booking_id = current_booking.booking_id
  RETURNING * INTO current_booking;

  RETURN current_booking;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_booking_statistics(
  p_date_from date DEFAULT NULL,
  p_date_to date DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  WITH filtered AS (
    SELECT *
    FROM public.bookings
    WHERE (p_date_from IS NULL OR created_at >= p_date_from::timestamptz)
      AND (p_date_to IS NULL OR created_at < (p_date_to + 1)::timestamptz)
  ),
  status_counts AS (
    SELECT payment_status, count(*) AS booking_count
    FROM filtered
    GROUP BY payment_status
  )
  SELECT jsonb_build_object(
    'total_revenue', coalesce(sum(total_amount) FILTER (WHERE payment_status = 'paid'), 0),
    'total_bookings', count(*),
    'booking_status_distribution', coalesce(
      (SELECT jsonb_object_agg(payment_status, booking_count) FROM status_counts),
      '{}'::jsonb
    ),
    'recent_bookings', coalesce(
      (
        SELECT jsonb_agg(to_jsonb(recent))
        FROM (
          SELECT booking_id, booking_code, user_name, user_email, user_phone,
            visit_date, ticket_types, total_amount, payment_status, payment_method,
            midtrans_transaction_id, midtrans_payment_type, created_at, updated_at
          FROM filtered
          ORDER BY created_at DESC
          LIMIT 5
        ) AS recent
      ),
      '[]'::jsonb
    )
  )
  INTO result
  FROM filtered;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_midtrans_notification(text, text, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_midtrans_notification(text, text, text, text)
  TO service_role;
REVOKE ALL ON FUNCTION public.admin_booking_statistics(date, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_booking_statistics(date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

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
    lower(email) = lower(auth.jwt() ->> 'email') OR public.is_admin()
  );
CREATE POLICY "Super admins can manage admins" ON public.admin_users
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.admin_users AS admin
      WHERE lower(admin.email) = lower(auth.jwt() ->> 'email')
        AND admin.role = 'super_admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users AS admin
      WHERE lower(admin.email) = lower(auth.jwt() ->> 'email')
        AND admin.role = 'super_admin'
    )
  );

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

GRANT SELECT ON public.users TO authenticated;
GRANT UPDATE (full_name, phone) ON public.users TO authenticated;
GRANT SELECT ON public.admin_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT SELECT ON public.ticket_pricing, public.facilities, public.promotions, public.gallery_images
  TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.ticket_pricing, public.facilities,
  public.promotions, public.gallery_images TO authenticated;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('gallery', 'gallery', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view gallery files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload gallery files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update gallery files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete gallery files" ON storage.objects;
CREATE POLICY "Public can view gallery files" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'gallery');
CREATE POLICY "Admins can upload gallery files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery' AND public.is_admin());
CREATE POLICY "Admins can update gallery files" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'gallery' AND public.is_admin())
  WITH CHECK (bucket_id = 'gallery' AND public.is_admin());
CREATE POLICY "Admins can delete gallery files" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'gallery' AND public.is_admin());
