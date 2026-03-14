
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS driver_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON public.drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_driver_id ON public.bookings(driver_id);
CREATE POLICY "Driver read own record" ON public.drivers FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Driver read assigned bookings" ON public.bookings FOR SELECT TO authenticated USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));
