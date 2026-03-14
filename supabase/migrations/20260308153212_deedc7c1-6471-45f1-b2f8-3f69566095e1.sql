
-- Drivers table
CREATE TABLE public.drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL DEFAULT '',
  email text DEFAULT '',
  license_number text DEFAULT '',
  experience_years integer DEFAULT 0,
  photo text DEFAULT '',
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read drivers" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Admin insert drivers" ON public.drivers FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin update drivers" ON public.drivers FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin delete drivers" ON public.drivers FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Hotels table
CREATE TABLE public.hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL DEFAULT '',
  destination text NOT NULL DEFAULT '',
  description text DEFAULT '',
  short_description text DEFAULT '',
  image text DEFAULT '',
  images text[] DEFAULT '{}',
  price_per_night numeric DEFAULT 0,
  rating numeric DEFAULT 0,
  amenities text[] DEFAULT '{}',
  contact_phone text DEFAULT '',
  contact_email text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read hotels" ON public.hotels FOR SELECT USING (true);
CREATE POLICY "Admin insert hotels" ON public.hotels FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin update hotels" ON public.hotels FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin delete hotels" ON public.hotels FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Add model, fuel_type, transmission to vehicles
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS model text DEFAULT '';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS fuel_type text DEFAULT '';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS transmission text DEFAULT '';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS price_per_day numeric DEFAULT NULL;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS rental_options text[] DEFAULT '{}';
