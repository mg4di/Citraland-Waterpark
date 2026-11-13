-- Tiket yang tidak pernah dipakai dan tanggal kunjungannya sudah lewat
-- otomatis ditandai dibatalkan (kedaluwarsa).
--
-- Catatan finance: booking 'paid' yang kedaluwarsa TETAP 'paid' agar revenue
-- historis tidak hilang; status batal disimpan di `cancelled_at` +
-- `cancellation_reason` dan frontend menampilkan status efektif 'cancelled'.
-- Booking 'pending' yang kedaluwarsa ikut diubah ke 'cancelled' agar tidak
-- bisa dilanjutkan pembayarannya lagi.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS checked_in_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancellation_reason text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookings_cancellation_reason_check'
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_cancellation_reason_check
      CHECK (cancellation_reason IS NULL OR cancellation_reason IN ('user', 'admin', 'expired'));
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_bookings_cancelled_at ON public.bookings(cancelled_at);
CREATE INDEX IF NOT EXISTS idx_bookings_visit_date_open
  ON public.bookings(visit_date) WHERE cancelled_at IS NULL;

-- Menandai tiket kedaluwarsa: belum dipakai, tanggal kunjungan lewat,
-- dan belum pernah dibatalkan. Aman dipanggil berulang kali.
CREATE OR REPLACE FUNCTION public.expire_unused_bookings()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  affected integer := 0;
BEGIN
  UPDATE public.bookings
  SET cancelled_at = now(),
      cancellation_reason = 'expired',
      payment_status = CASE
        WHEN payment_status = 'pending' THEN 'cancelled'
        ELSE payment_status
      END
  WHERE cancelled_at IS NULL
    AND checked_in_at IS NULL
    AND visit_date < CURRENT_DATE
    AND payment_status IN ('pending', 'paid');

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

REVOKE ALL ON FUNCTION public.expire_unused_bookings() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.expire_unused_bookings() TO authenticated, service_role;

-- Pembatalan oleh pengunjung: hanya booking miliknya yang masih pending
-- dan belum dipakai. Sekarang ikut mengisi cancelled_at / reason.
CREATE OR REPLACE FUNCTION public.cancel_own_booking(p_booking_code text)
RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_booking public.bookings;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO current_booking
  FROM public.bookings
  WHERE booking_code = p_booking_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF lower(current_booking.user_email) <> lower(auth.jwt() ->> 'email') THEN
    RAISE EXCEPTION 'Not allowed to cancel this booking';
  END IF;

  IF current_booking.payment_status <> 'pending' THEN
    RAISE EXCEPTION 'Only pending bookings can be cancelled';
  END IF;

  IF current_booking.checked_in_at IS NOT NULL THEN
    RAISE EXCEPTION 'Booking already used';
  END IF;

  IF current_booking.cancelled_at IS NOT NULL THEN
    RAISE EXCEPTION 'Booking already cancelled';
  END IF;

  UPDATE public.bookings
  SET cancelled_at = now(),
      cancellation_reason = 'user',
      payment_status = 'cancelled'
  WHERE booking_id = current_booking.booking_id
  RETURNING * INTO current_booking;

  RETURN current_booking;
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_own_booking(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_own_booking(text) TO authenticated;

-- Notifikasi Midtrans tidak boleh menghidupkan kembali booking yang sudah
-- dibatalkan/kedaluwarsa.
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

  IF current_booking.cancelled_at IS NOT NULL
    OR current_booking.payment_status = 'refunded'
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

REVOKE ALL ON FUNCTION public.apply_midtrans_notification(text, text, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_midtrans_notification(text, text, text, text)
  TO service_role;

-- Statistik dashboard: sertakan status efektif + alasan pembatalan agar
-- UI admin bisa menampilkan "Dibatalkan".
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
    SELECT CASE
      WHEN cancelled_at IS NOT NULL AND checked_in_at IS NULL THEN 'cancelled'
      ELSE payment_status
    END AS effective_status, count(*) AS booking_count
    FROM filtered
    GROUP BY 1
  )
  SELECT jsonb_build_object(
    'total_revenue', coalesce(sum(total_amount) FILTER (WHERE payment_status = 'paid'), 0),
    'total_bookings', count(*),
    'booking_status_distribution', coalesce(
      (SELECT jsonb_object_agg(effective_status, booking_count) FROM status_counts),
      '{}'::jsonb
    ),
    'recent_bookings', coalesce(
      (
        SELECT jsonb_agg(to_jsonb(recent))
        FROM (
          SELECT booking_id, booking_code, user_name, user_email, user_phone,
            visit_date, ticket_types, total_amount, payment_status, payment_method,
            midtrans_transaction_id, midtrans_payment_type, created_at, updated_at,
            checked_in_at, cancelled_at, cancellation_reason,
            CASE
              WHEN cancelled_at IS NOT NULL AND checked_in_at IS NULL THEN 'cancelled'
              ELSE payment_status
            END AS effective_status
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

REVOKE ALL ON FUNCTION public.admin_booking_statistics(date, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_booking_statistics(date, date) TO authenticated;

-- Jadwalkan harian bila pg_cron tersedia (opsional).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-unused-bookings') THEN
      PERFORM cron.schedule('expire-unused-bookings', '5 0 * * *', 'SELECT public.expire_unused_bookings();');
    END IF;
  END IF;
END;
$$;
