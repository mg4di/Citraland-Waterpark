-- Ekstensi, seluruh tabel (inti, konten, gate ESP32, dan log pemindaian), serta indeks.
-- Tabel dibuat lebih dulu karena fungsi, trigger, dan kebijakan RLS pada file
-- berikutnya bergantung pada tabel ini.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabel

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
  midtrans_order_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Status penggunaan/pembatalan tiket. Booking 'paid' yang kedaluwarsa tetap 'paid'
  -- agar revenue historis tidak hilang; pembatalan dicatat di cancelled_at dan
  -- cancellation_reason.
  checked_in_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  CONSTRAINT bookings_email_format CHECK (user_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT bookings_visit_date_not_monday CHECK (extract(isodow FROM visit_date) <> 1),
  CONSTRAINT bookings_ticket_types_object CHECK (
    jsonb_typeof(ticket_types) = 'object' AND ticket_types <> '{}'::jsonb
  ),
  CONSTRAINT bookings_cancellation_reason_check CHECK (
    cancellation_reason IS NULL OR cancellation_reason IN ('user', 'admin', 'expired')
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

CREATE TABLE IF NOT EXISTS public.gates (
  gate_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gate_name text NOT NULL,
  api_key_hash text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.scan_logs (
  log_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gate_id uuid NOT NULL REFERENCES public.gates(gate_id),
  booking_id uuid REFERENCES public.bookings(booking_id) ON DELETE SET NULL,
  scanned_code text NOT NULL,
  result text NOT NULL CHECK (result IN ('accepted', 'rejected')),
  reason text,
  scanned_at timestamptz NOT NULL DEFAULT now()
);

-- Indeks

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

CREATE INDEX IF NOT EXISTS idx_gates_is_active ON public.gates(is_active);

CREATE INDEX IF NOT EXISTS idx_scan_logs_gate_id ON public.scan_logs(gate_id);

CREATE INDEX IF NOT EXISTS idx_scan_logs_booking_id ON public.scan_logs(booking_id);

CREATE INDEX IF NOT EXISTS idx_scan_logs_scanned_at ON public.scan_logs(scanned_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_cancelled_at ON public.bookings(cancelled_at);

CREATE INDEX IF NOT EXISTS idx_bookings_visit_date_open
  ON public.bookings(visit_date) WHERE cancelled_at IS NULL;
