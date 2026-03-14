
-- Site settings table (single-row config)
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_email text DEFAULT '',
  phone text DEFAULT '+91 98765 43210',
  whatsapp text DEFAULT '+919876543210',
  office_address text DEFAULT '123 Travel Street, New Delhi, India',
  company_name text DEFAULT 'Wanderlust Tours',
  tagline text DEFAULT 'Book your dream trip today!',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin update settings" ON public.site_settings FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin insert settings" ON public.site_settings FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

-- Seed default row
INSERT INTO public.site_settings (contact_email, phone, whatsapp, office_address, company_name, tagline)
VALUES ('info@wanderlusttours.com', '+91 98765 43210', '+919876543210', '123 Travel Street, New Delhi, India', 'Wanderlust Tours', 'Book your dream trip today!');

-- Contact submissions table
CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert contact" ON public.contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read contact" ON public.contact_submissions FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete contact" ON public.contact_submissions FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Bookings table
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_type text NOT NULL DEFAULT 'package',
  reference_id uuid,
  reference_name text DEFAULT '',
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  pickup_location text DEFAULT '',
  drop_location text DEFAULT '',
  travel_date date,
  travel_time text DEFAULT '',
  num_travelers integer DEFAULT 1,
  vehicle_type text DEFAULT '',
  rental_option text DEFAULT '',
  notes text DEFAULT '',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert booking" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read bookings" ON public.bookings FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update bookings" ON public.bookings FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete bookings" ON public.bookings FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Add updated_at triggers
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
