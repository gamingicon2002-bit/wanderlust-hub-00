
-- Itinerary history table
CREATE TABLE public.itineraries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT DEFAULT '',
  customer_phone TEXT DEFAULT '',
  package_name TEXT DEFAULT '',
  destination TEXT DEFAULT '',
  travel_date DATE,
  duration TEXT DEFAULT '',
  num_travelers INTEGER DEFAULT 1,
  pickup_location TEXT DEFAULT '',
  drop_location TEXT DEFAULT '',
  vehicle_name TEXT DEFAULT '',
  vehicle_type TEXT DEFAULT '',
  driver_name TEXT DEFAULT '',
  driver_phone TEXT DEFAULT '',
  days JSONB DEFAULT '[]'::jsonb,
  inclusions TEXT DEFAULT '',
  exclusions TEXT DEFAULT '',
  special_notes TEXT DEFAULT '',
  emergency_contact TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manage itineraries" ON public.itineraries FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Document design settings (for invoice and itinerary PDF customization)
ALTER TABLE public.site_settings 
  ADD COLUMN IF NOT EXISTS doc_primary_color TEXT DEFAULT '#2563eb',
  ADD COLUMN IF NOT EXISTS doc_secondary_color TEXT DEFAULT '#7c3aed',
  ADD COLUMN IF NOT EXISTS doc_accent_color TEXT DEFAULT '#f59e0b',
  ADD COLUMN IF NOT EXISTS doc_font_family TEXT DEFAULT 'Inter';

-- Module permissions for roles
CREATE TABLE public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL,
  module TEXT NOT NULL,
  can_view BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, module)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manage role_permissions" ON public.role_permissions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated read role_permissions" ON public.role_permissions FOR SELECT TO authenticated
  USING (true);
