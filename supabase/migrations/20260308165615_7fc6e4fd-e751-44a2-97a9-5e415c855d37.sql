
-- Vehicle types table for dynamic type/sub-type management
CREATE TABLE public.vehicle_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  label text NOT NULL,
  icon text DEFAULT '',
  parent_id uuid REFERENCES public.vehicle_types(id) ON DELETE CASCADE,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.vehicle_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read vehicle_types" ON public.vehicle_types FOR SELECT USING (true);
CREATE POLICY "Admin insert vehicle_types" ON public.vehicle_types FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update vehicle_types" ON public.vehicle_types FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete vehicle_types" ON public.vehicle_types FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Blog comments table
CREATE TABLE public.blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id uuid NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  commenter_name text NOT NULL,
  commenter_email text NOT NULL,
  comment text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read approved comments" ON public.blog_comments FOR SELECT USING (status = 'approved');
CREATE POLICY "Admin read all comments" ON public.blog_comments FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Public insert comment" ON public.blog_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update comments" ON public.blog_comments FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete comments" ON public.blog_comments FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Seed default vehicle types
INSERT INTO public.vehicle_types (name, label, icon, sort_order) VALUES
  ('car', 'Car', '🚗', 1),
  ('tempo', 'Tempo Traveller', '🚐', 2),
  ('bus', 'Bus', '🚌', 3),
  ('urbania', 'Urbania', '🚐', 4),
  ('maharaja', 'Maharaja', '👑', 5),
  ('taxi', 'Taxi', '🚕', 6);

-- Seed sub-types
INSERT INTO public.vehicle_types (name, label, parent_id, sort_order)
SELECT sub.name, sub.label, vt.id, sub.sort_order
FROM (VALUES
  ('car', 'sedan', 'Sedan', 1), ('car', 'suv', 'SUV', 2), ('car', 'muv', 'MUV', 3), ('car', 'hatchback', 'Hatchback', 4),
  ('tempo', 'traveller', 'Traveller', 1), ('tempo', 'luxury', 'Luxury Traveller', 2),
  ('urbania', '12-seater', '12 Seater', 1), ('urbania', '17-seater', '17 Seater', 2), ('urbania', '20-seater', '20 Seater', 3), ('urbania', '26-seater', '26 Seater', 4),
  ('bus', 'mini', 'Mini Bus', 1), ('bus', 'luxury', 'Luxury Bus', 2), ('bus', 'sleeper', 'Sleeper', 3), ('bus', 'semi-sleeper', 'Semi Sleeper', 4),
  ('bus', 'ac', 'AC Bus', 5), ('bus', 'non-ac', 'Non AC Bus', 6), ('bus', '32-seater', '32 Seater', 7), ('bus', '45-seater', '45 Seater', 8), ('bus', '52-seater', '52 Seater', 9),
  ('maharaja', 'tempo', 'Maharaja Tempo', 1), ('maharaja', 'bus', 'Maharaja Bus', 2)
) AS sub(parent_name, name, label, sort_order)
JOIN public.vehicle_types vt ON vt.name = sub.parent_name AND vt.parent_id IS NULL;
