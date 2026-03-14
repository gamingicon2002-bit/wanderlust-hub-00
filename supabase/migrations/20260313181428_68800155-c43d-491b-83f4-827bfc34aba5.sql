
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS lead_source text DEFAULT '';

CREATE OR REPLACE FUNCTION public.upsert_customer_from_booking()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $$
BEGIN
  INSERT INTO public.customers (name, email, phone, lead_source, total_invoices, total_spent)
  VALUES (NEW.customer_name, NEW.customer_email, NEW.customer_phone, COALESCE(NEW.lead_source, ''), 0, 0)
  ON CONFLICT ON CONSTRAINT customers_email_phone_unique DO UPDATE
    SET name = COALESCE(NULLIF(NEW.customer_name, ''), customers.name),
        phone = COALESCE(NULLIF(NEW.customer_phone, ''), customers.phone),
        email = COALESCE(NULLIF(NEW.customer_email, ''), customers.email),
        lead_source = COALESCE(NULLIF(NEW.lead_source, ''), customers.lead_source),
        updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_upsert_customer ON public.bookings;
CREATE TRIGGER trg_upsert_customer
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.upsert_customer_from_booking();
