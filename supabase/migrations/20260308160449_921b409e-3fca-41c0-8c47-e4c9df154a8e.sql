CREATE TABLE public.related_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  related_package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(package_id, related_package_id),
  CHECK (package_id != related_package_id)
);

ALTER TABLE public.related_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read related packages" ON public.related_packages FOR SELECT USING (true);
CREATE POLICY "Admin insert related packages" ON public.related_packages FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update related packages" ON public.related_packages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete related packages" ON public.related_packages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Also create related_hotels for package-hotel assignment
CREATE TABLE public.related_hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(package_id, hotel_id)
);

ALTER TABLE public.related_hotels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read related hotels" ON public.related_hotels FOR SELECT USING (true);
CREATE POLICY "Admin insert related hotels" ON public.related_hotels FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update related hotels" ON public.related_hotels FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete related hotels" ON public.related_hotels FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));