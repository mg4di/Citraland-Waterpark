-- RLS: gates & scan_logs are only touched by the service role (Edge Function)
-- and read by admins.
ALTER TABLE public.gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view scan logs" ON public.scan_logs;
CREATE POLICY "Admins can view scan logs" ON public.scan_logs
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view gates" ON public.gates;
CREATE POLICY "Admins can view gates" ON public.gates
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.process_gate_scan(
  p_gate_id uuid,
  p_scanned_code text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_code text := left(trim(coalesce(p_scanned_code, '')), 200);
  v_parts text[];
  v_booking public.bookings;
  v_reason text;
  v_today date := (now() AT TIME ZONE 'Asia/Makassar')::date; -- WITA
BEGIN
  v_parts := string_to_array(v_code, '|');

  IF coalesce(array_length(v_parts, 1), 0) <> 5 OR v_parts[1] <> 'CITRALAND' THEN
    v_reason := 'invalid_format';
  ELSE
    SELECT * INTO v_booking
    FROM public.bookings
    WHERE booking_code = v_parts[2]
    FOR UPDATE;

    IF NOT FOUND THEN
      v_reason := 'booking_not_found';
    ELSIF v_parts[3] <> v_booking.visit_date::text
      OR v_parts[5] <> round(v_booking.total_amount)::bigint::text THEN
      v_reason := 'qr_mismatch';
    ELSIF v_booking.cancelled_at IS NOT NULL THEN
      v_reason := 'cancelled';
    ELSIF v_booking.payment_status <> 'paid' THEN
      v_reason := 'not_paid';
    ELSIF v_booking.checked_in_at IS NOT NULL THEN
      v_reason := 'already_used';
    ELSIF v_booking.visit_date < v_today THEN
      v_reason := 'expired';
    ELSIF v_booking.visit_date > v_today THEN
      v_reason := 'not_valid_today';
    END IF;
  END IF;

  INSERT INTO public.scan_logs (gate_id, booking_id, scanned_code, result, reason)
  VALUES (
    p_gate_id,
    CASE WHEN v_booking.booking_id IS NOT NULL THEN v_booking.booking_id END,
    v_code,
    CASE WHEN v_reason IS NULL THEN 'accepted' ELSE 'rejected' END,
    v_reason
  );

  IF v_reason IS NULL THEN
    UPDATE public.bookings SET checked_in_at = now()
    WHERE booking_id = v_booking.booking_id;
  END IF;

  RETURN jsonb_build_object(
    'accepted', v_reason IS NULL,
    'reason', v_reason,
    'booking_code', v_booking.booking_code,
    'visitor_name', v_booking.user_name,
    'ticket_types', v_booking.ticket_types
  );
END;
$$;

REVOKE ALL ON FUNCTION public.process_gate_scan(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_gate_scan(uuid, text) TO service_role;