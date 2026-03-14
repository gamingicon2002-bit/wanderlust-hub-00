
CREATE OR REPLACE FUNCTION public.upsert_customer_from_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.customers (name, email, phone, total_invoices, total_spent)
  VALUES (NEW.customer_name, NEW.customer_email, NEW.customer_phone, 0, 0)
  ON CONFLICT ON CONSTRAINT customers_email_phone_unique DO UPDATE
    SET name = COALESCE(NULLIF(NEW.customer_name, ''), customers.name),
        phone = COALESCE(NULLIF(NEW.customer_phone, ''), customers.phone),
        email = COALESCE(NULLIF(NEW.customer_email, ''), customers.email),
        updated_at = now();
  RETURN NEW;
END;
$$;

-- Add unique constraint for upsert matching
ALTER TABLE public.customers ADD CONSTRAINT customers_email_phone_unique UNIQUE (email, phone);

-- Create trigger on bookings
CREATE TRIGGER trg_upsert_customer_on_booking
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.upsert_customer_from_booking();
