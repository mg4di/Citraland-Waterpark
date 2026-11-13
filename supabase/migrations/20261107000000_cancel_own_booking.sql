-- Pengunjung dapat membatalkan booking sendiri yang masih menunggu pembayaran.
-- Pembatalan hanya mengubah payment_status dari 'pending' menjadi 'cancelled';
-- status lain (paid/failed/refunded) tidak dapat diubah oleh pengunjung.

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

  UPDATE public.bookings
  SET payment_status = 'cancelled'
  WHERE booking_id = current_booking.booking_id
  RETURNING * INTO current_booking;

  RETURN current_booking;
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_own_booking(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_own_booking(text) TO authenticated;
