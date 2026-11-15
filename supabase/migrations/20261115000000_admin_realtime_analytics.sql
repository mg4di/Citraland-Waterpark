-- Admin dashboard: realtime publication, aggregate RPCs, user management,
-- and manual check-in. Timezone for all business-date logic is Asia/Makassar.

-- ---------------------------------------------------------------------------
-- 1. Admin profile: phone + self-service update
-- ---------------------------------------------------------------------------
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS phone text;

DROP POLICY IF EXISTS "Admins can update own admin profile" ON public.admin_users;
CREATE POLICY "Admins can update own admin profile" ON public.admin_users
  FOR UPDATE TO authenticated
  USING (lower(email) = lower((SELECT auth.jwt() ->> 'email')))
  WITH CHECK (lower(email) = lower((SELECT auth.jwt() ->> 'email')));

GRANT UPDATE (full_name, phone) ON public.admin_users TO authenticated;

-- Admin dapat mengubah status pengunjung (aktif/nonaktif).
GRANT UPDATE (status) ON public.users TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. Realtime publication
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  target_table text;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    FOREACH target_table IN ARRAY ARRAY[
      'bookings',
      'users',
      'ticket_pricing',
      'facilities',
      'promotions',
      'gallery_images'
    ]
    LOOP
      BEGIN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', target_table);
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END;
    END LOOP;
  END IF;
END;
$$;

ALTER TABLE public.bookings REPLICA IDENTITY FULL;

CREATE INDEX IF NOT EXISTS idx_bookings_checked_in_at
  ON public.bookings(checked_in_at)
  WHERE checked_in_at IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 3. Dashboard summary
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_dashboard_summary(
  p_date_from date DEFAULT NULL,
  p_date_to date DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_today date := (now() AT TIME ZONE 'Asia/Makassar')::date;
  v_from date := coalesce(p_date_from, v_today - 29);
  v_to date := coalesce(p_date_to, v_today);
  v_prev_from date;
  v_prev_to date;
  v_days integer;
  v_result jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  IF v_to < v_from THEN
    RAISE EXCEPTION 'Invalid date range';
  END IF;

  v_days := (v_to - v_from) + 1;
  v_prev_to := v_from - 1;
  v_prev_from := v_prev_to - (v_days - 1);

  WITH filtered AS (
    SELECT *
    FROM public.bookings
    WHERE (created_at AT TIME ZONE 'Asia/Makassar')::date BETWEEN v_from AND v_to
  ),
  previous AS (
    SELECT *
    FROM public.bookings
    WHERE (created_at AT TIME ZONE 'Asia/Makassar')::date BETWEEN v_prev_from AND v_prev_to
  ),
  status_counts AS (
    SELECT
      CASE
        WHEN cancelled_at IS NOT NULL AND checked_in_at IS NULL THEN 'cancelled'
        ELSE payment_status
      END AS effective_status,
      count(*) AS booking_count
    FROM filtered
    GROUP BY 1
  ),
  daily AS (
    SELECT
      day::date AS day,
      coalesce(revenue, 0) AS revenue
    FROM generate_series(v_from, v_to, interval '1 day') AS series(day)
    LEFT JOIN (
      SELECT
        (created_at AT TIME ZONE 'Asia/Makassar')::date AS paid_day,
        sum(total_amount) AS revenue
      FROM filtered
      WHERE payment_status = 'paid'
      GROUP BY 1
    ) paid ON paid.paid_day = day::date
  )
  SELECT jsonb_build_object(
    'range_from', v_from,
    'range_to', v_to,
    'prev_from', v_prev_from,
    'prev_to', v_prev_to,
    'total_revenue', coalesce((
      SELECT sum(total_amount) FROM filtered WHERE payment_status = 'paid'
    ), 0),
    'total_bookings', (SELECT count(*) FROM filtered),
    'tickets_sold', coalesce((
      SELECT sum((entry.value ->> 'qty')::integer)
      FROM filtered f
      CROSS JOIN LATERAL jsonb_each(f.ticket_types) AS entry
      WHERE f.payment_status = 'paid'
    ), 0),
    'checked_in_total', (
      SELECT count(*)
      FROM public.bookings
      WHERE checked_in_at IS NOT NULL
        AND cancelled_at IS NULL
        AND (checked_in_at AT TIME ZONE 'Asia/Makassar')::date BETWEEN v_from AND v_to
    ),
    'checked_in_today', (
      SELECT count(*)
      FROM public.bookings
      WHERE checked_in_at IS NOT NULL
        AND cancelled_at IS NULL
        AND (checked_in_at AT TIME ZONE 'Asia/Makassar')::date = v_today
    ),
    'checked_in_yesterday', (
      SELECT count(*)
      FROM public.bookings
      WHERE checked_in_at IS NOT NULL
        AND cancelled_at IS NULL
        AND (checked_in_at AT TIME ZONE 'Asia/Makassar')::date = v_today - 1
    ),
    'new_bookings_week', (
      SELECT count(*)
      FROM public.bookings
      WHERE created_at >= now() - interval '7 days'
    ),
    'prev_revenue', coalesce((
      SELECT sum(total_amount) FROM previous WHERE payment_status = 'paid'
    ), 0),
    'prev_bookings', (SELECT count(*) FROM previous),
    'prev_tickets_sold', coalesce((
      SELECT sum((entry.value ->> 'qty')::integer)
      FROM previous p
      CROSS JOIN LATERAL jsonb_each(p.ticket_types) AS entry
      WHERE p.payment_status = 'paid'
    ), 0),
    'status_distribution', coalesce((
      SELECT jsonb_object_agg(effective_status, booking_count)
      FROM status_counts
    ), '{}'::jsonb),
    'daily_revenue', coalesce((
      SELECT jsonb_agg(jsonb_build_object('date', to_char(day, 'YYYY-MM-DD'), 'revenue', revenue) ORDER BY day)
      FROM daily
    ), '[]'::jsonb),
    'recent_bookings', coalesce((
      SELECT jsonb_agg(to_jsonb(recent) ORDER BY recent.created_at DESC)
      FROM (
        SELECT
          booking_id, booking_code, user_name, user_email, user_phone,
          visit_date, ticket_types, total_amount, payment_status, payment_method,
          midtrans_transaction_id, midtrans_payment_type, created_at, updated_at,
          checked_in_at, cancelled_at, cancellation_reason,
          CASE
            WHEN cancelled_at IS NOT NULL AND checked_in_at IS NULL THEN 'cancelled'
            ELSE payment_status
          END AS effective_status
        FROM filtered
        ORDER BY created_at DESC
        LIMIT 8
      ) AS recent
    ), '[]'::jsonb)
  )
  INTO v_result;

  RETURN v_result;
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. Analytics
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_analytics(
  p_date_from date DEFAULT NULL,
  p_date_to date DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_today date := (now() AT TIME ZONE 'Asia/Makassar')::date;
  v_from date := coalesce(p_date_from, v_today - 29);
  v_to date := coalesce(p_date_to, v_today);
  v_year integer := extract(year FROM v_to)::integer;
  v_prev_from date;
  v_prev_to date;
  v_days integer;
  v_result jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  IF v_to < v_from THEN
    RAISE EXCEPTION 'Invalid date range';
  END IF;

  v_days := (v_to - v_from) + 1;
  v_prev_to := v_from - 1;
  v_prev_from := v_prev_to - (v_days - 1);

  WITH filtered AS (
    SELECT *
    FROM public.bookings
    WHERE (created_at AT TIME ZONE 'Asia/Makassar')::date BETWEEN v_from AND v_to
  ),
  previous AS (
    SELECT *
    FROM public.bookings
    WHERE (created_at AT TIME ZONE 'Asia/Makassar')::date BETWEEN v_prev_from AND v_prev_to
  ),
  months AS (
    SELECT generate_series(
      make_date(v_year, 1, 1),
      make_date(v_year, 12, 1),
      interval '1 month'
    )::date AS month_start
  ),
  monthly AS (
    SELECT
      date_trunc('month', (created_at AT TIME ZONE 'Asia/Makassar'))::date AS month_start,
      sum(total_amount) AS revenue
    FROM public.bookings
    WHERE payment_status = 'paid'
    GROUP BY 1
  ),
  user_months AS (
    SELECT
      date_trunc('month', (created_at AT TIME ZONE 'Asia/Makassar'))::date AS month_start,
      count(*) AS user_count
    FROM public.users
    GROUP BY 1
  ),
  ticket_types AS (
    SELECT
      coalesce(sum((entry.value ->> 'qty')::integer) FILTER (WHERE entry.key = 'weekday'), 0) AS weekday,
      coalesce(sum((entry.value ->> 'qty')::integer) FILTER (WHERE entry.key = 'weekend'), 0) AS weekend
    FROM filtered f
    CROSS JOIN LATERAL jsonb_each(f.ticket_types) AS entry
    WHERE f.payment_status = 'paid'
  ),
  peak AS (
    SELECT
      extract(isodow FROM (checked_in_at AT TIME ZONE 'Asia/Makassar'))::integer AS dow,
      extract(hour FROM (checked_in_at AT TIME ZONE 'Asia/Makassar'))::integer AS hour,
      count(*) AS scan_count
    FROM public.bookings
    WHERE checked_in_at IS NOT NULL
      AND cancelled_at IS NULL
      AND (checked_in_at AT TIME ZONE 'Asia/Makassar')::date BETWEEN v_from AND v_to
    GROUP BY 1, 2
  )
  SELECT jsonb_build_object(
    'range_from', v_from,
    'range_to', v_to,
    'prev_from', v_prev_from,
    'prev_to', v_prev_to,
    'year', v_year,
    'total_revenue', coalesce((SELECT sum(total_amount) FROM filtered WHERE payment_status = 'paid'), 0),
    'total_bookings', (SELECT count(*) FROM filtered),
    'tickets_sold', coalesce((
      SELECT sum((entry.value ->> 'qty')::integer)
      FROM filtered f
      CROSS JOIN LATERAL jsonb_each(f.ticket_types) AS entry
      WHERE f.payment_status = 'paid'
    ), 0),
    'checked_in_total', (
      SELECT count(*)
      FROM public.bookings
      WHERE checked_in_at IS NOT NULL
        AND cancelled_at IS NULL
        AND (checked_in_at AT TIME ZONE 'Asia/Makassar')::date BETWEEN v_from AND v_to
    ),
    'new_users_this_month', (
      SELECT count(*)
      FROM public.users
      WHERE (created_at AT TIME ZONE 'Asia/Makassar')::date
        >= date_trunc('month', (now() AT TIME ZONE 'Asia/Makassar'))::date
    ),
    'prev_revenue', coalesce((SELECT sum(total_amount) FROM previous WHERE payment_status = 'paid'), 0),
    'prev_bookings', (SELECT count(*) FROM previous),
    'prev_tickets_sold', coalesce((
      SELECT sum((entry.value ->> 'qty')::integer)
      FROM previous p
      CROSS JOIN LATERAL jsonb_each(p.ticket_types) AS entry
      WHERE p.payment_status = 'paid'
    ), 0),
    'price_min', coalesce((SELECT min(price) FROM public.ticket_pricing WHERE status = 'active'), 0),
    'price_max', coalesce((SELECT max(price) FROM public.ticket_pricing WHERE status = 'active'), 0),
    'ticket_distribution', (
      SELECT jsonb_build_object('weekday', weekday, 'weekend', weekend)
      FROM ticket_types
    ),
    'monthly_revenue', coalesce((
      SELECT jsonb_agg(
        jsonb_build_object(
          'month', to_char(months.month_start, 'YYYY-MM'),
          'month_start', months.month_start,
          'revenue', coalesce(monthly.revenue, 0)
        ) ORDER BY months.month_start
      )
      FROM months
      LEFT JOIN monthly ON monthly.month_start = months.month_start
    ), '[]'::jsonb),
    'user_growth', coalesce((
      SELECT jsonb_agg(
        jsonb_build_object(
          'month', to_char(months.month_start, 'YYYY-MM'),
          'month_start', months.month_start,
          'users', coalesce(user_months.user_count, 0)
        ) ORDER BY months.month_start
      )
      FROM months
      LEFT JOIN user_months ON user_months.month_start = months.month_start
    ), '[]'::jsonb),
    'peak_hours', coalesce((
      SELECT jsonb_agg(
        jsonb_build_object('dow', dow, 'hour', hour, 'count', scan_count)
        ORDER BY dow, hour
      )
      FROM peak
    ), '[]'::jsonb),
    'peak_hours_total', (SELECT coalesce(sum(scan_count), 0) FROM peak)
  )
  INTO v_result;

  RETURN v_result;
END;
$$;

-- ---------------------------------------------------------------------------
-- 5. User management overview
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_users_overview(
  p_search text DEFAULT NULL,
  p_status text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_search text := nullif(trim(coalesce(p_search, '')), '');
  v_status text := nullif(trim(coalesce(p_status, '')), '');
  v_month_start date := date_trunc('month', (now() AT TIME ZONE 'Asia/Makassar'))::date;
  v_result jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  WITH stats AS (
    SELECT
      count(*)::integer AS total,
      (count(*) FILTER (WHERE status = 'active'))::integer AS active,
      (count(*) FILTER (WHERE status = 'inactive'))::integer AS inactive,
      (count(*) FILTER (
        WHERE (created_at AT TIME ZONE 'Asia/Makassar')::date >= v_month_start
      ))::integer AS new_this_month,
      (count(*) FILTER (
        WHERE (created_at AT TIME ZONE 'Asia/Makassar')::date >= (v_month_start - interval '1 month')::date
          AND (created_at AT TIME ZONE 'Asia/Makassar')::date < v_month_start
      ))::integer AS new_prev_month
    FROM public.users
  ),
  user_rows AS (
    SELECT
      u.user_id,
      u.email,
      u.full_name,
      u.phone,
      u.status,
      u.created_at,
      count(b.booking_id)::integer AS booking_count,
      (count(b.booking_id) FILTER (WHERE b.payment_status = 'paid'))::integer AS paid_bookings,
      coalesce(sum(b.total_amount) FILTER (WHERE b.payment_status = 'paid'), 0) AS total_spend,
      max(b.created_at) AS last_booking_at
    FROM public.users u
    LEFT JOIN public.bookings b ON lower(b.user_email) = lower(u.email)
    WHERE (
      v_search IS NULL
      OR strpos(lower(u.full_name), lower(v_search)) > 0
      OR strpos(lower(u.email), lower(v_search)) > 0
      OR strpos(coalesce(u.phone, ''), v_search) > 0
    )
      AND (v_status IS NULL OR u.status = v_status)
    GROUP BY u.user_id
    ORDER BY u.created_at DESC
    LIMIT 500
  )
  SELECT jsonb_build_object(
    'stats', (SELECT to_jsonb(stats) FROM stats),
    'users', coalesce((
      SELECT jsonb_agg(to_jsonb(user_rows) ORDER BY user_rows.created_at DESC)
      FROM user_rows
    ), '[]'::jsonb)
  )
  INTO v_result;

  RETURN v_result;
END;
$$;

-- ---------------------------------------------------------------------------
-- 6. Manual check-in (fallback tanpa perangkat IoT)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_check_in_booking(p_booking_code text)
RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_booking public.bookings;
  v_today date := (now() AT TIME ZONE 'Asia/Makassar')::date;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  IF p_booking_code IS NULL OR trim(p_booking_code) = '' THEN
    RAISE EXCEPTION 'Booking code required';
  END IF;

  SELECT * INTO current_booking
  FROM public.bookings
  WHERE booking_code = trim(p_booking_code)
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  IF current_booking.cancelled_at IS NOT NULL THEN
    RAISE EXCEPTION 'Booking cancelled';
  END IF;
  IF current_booking.payment_status <> 'paid' THEN
    RAISE EXCEPTION 'Booking not paid';
  END IF;
  IF current_booking.checked_in_at IS NOT NULL THEN
    RAISE EXCEPTION 'Booking already used';
  END IF;
  IF current_booking.visit_date <> v_today THEN
    RAISE EXCEPTION 'Booking visit date is not today';
  END IF;

  UPDATE public.bookings
  SET checked_in_at = now()
  WHERE booking_id = current_booking.booking_id
    AND checked_in_at IS NULL
  RETURNING * INTO current_booking;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking already used';
  END IF;

  RETURN current_booking;
END;
$$;

-- ---------------------------------------------------------------------------
-- 7. Grants
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.admin_dashboard_summary(date, date) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_analytics(date, date) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_users_overview(text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_check_in_booking(text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_dashboard_summary(date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_analytics(date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_users_overview(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_check_in_booking(text) TO authenticated;

-- ---------------------------------------------------------------------------
-- 8. Bersihkan baris galeri lama
-- ---------------------------------------------------------------------------
-- Penghapusan galeri di admin sekarang bersifat permanen. Hapus baris yang
-- sebelumnya tertinggal berstatus 'archived' karena perilaku soft-delete lama.
DELETE FROM public.gallery_images
WHERE status = 'archived';
