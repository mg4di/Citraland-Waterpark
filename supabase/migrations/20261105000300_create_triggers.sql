-- Fungsi trigger beserta trigger yang memakainya.

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

-- Profil otomatis saat akun Auth dibuat

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
