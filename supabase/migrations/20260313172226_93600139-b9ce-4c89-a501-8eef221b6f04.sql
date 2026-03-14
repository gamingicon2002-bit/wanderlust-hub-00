
-- Hotel rooms table
CREATE TABLE public.hotel_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
  room_number text NOT NULL DEFAULT '',
  room_type text NOT NULL DEFAULT 'standard',
  ac_type text NOT NULL DEFAULT 'ac',
  beds integer NOT NULL DEFAULT 1,
  pillows integer NOT NULL DEFAULT 2,
  sheets integer NOT NULL DEFAULT 2,
  price_per_night numeric DEFAULT 0,
  images text[] DEFAULT '{}'::text[],
  is_available boolean DEFAULT true,
  floor text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.hotel_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read hotel_rooms" ON public.hotel_rooms FOR SELECT TO public USING (true);
CREATE POLICY "Admin manage hotel_rooms" ON public.hotel_rooms FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Hotel booking details table
CREATE TABLE public.hotel_booking_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  room_id uuid REFERENCES public.hotel_rooms(id) ON DELETE SET NULL,
  check_in date,
  check_out date,
  guest_id_type text DEFAULT '',
  guest_id_number text DEFAULT '',
  guest_id_image text DEFAULT '',
  marital_status text DEFAULT '',
  family_members integer DEFAULT 1,
  num_beds integer DEFAULT 1,
  num_pillows integer DEFAULT 2,
  num_sheets integer DEFAULT 2,
  special_requests text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.hotel_booking_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage hotel_booking_details" ON public.hotel_booking_details FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public insert hotel_booking_details" ON public.hotel_booking_details FOR INSERT TO public WITH CHECK (true);
