
-- Junction table: booking can have multiple drivers
CREATE TABLE public.booking_drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(booking_id, driver_id)
);

ALTER TABLE public.booking_drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manage booking_drivers" ON public.booking_drivers FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Driver read own booking_drivers" ON public.booking_drivers FOR SELECT TO authenticated
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- Junction table: driver can have multiple vehicles
CREATE TABLE public.driver_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(driver_id, vehicle_id)
);

ALTER TABLE public.driver_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manage driver_vehicles" ON public.driver_vehicles FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public read driver_vehicles" ON public.driver_vehicles FOR SELECT TO authenticated
  USING (true);
