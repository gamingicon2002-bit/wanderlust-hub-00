
-- Packages table
CREATE TABLE public.packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    destination TEXT NOT NULL,
    duration TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    original_price NUMERIC,
    description TEXT DEFAULT '',
    short_description TEXT DEFAULT '',
    image TEXT DEFAULT '',
    images TEXT[] DEFAULT '{}',
    itinerary TEXT[] DEFAULT '{}',
    inclusions TEXT[] DEFAULT '{}',
    exclusions TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    brochure_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Vehicles table
CREATE TABLE public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT DEFAULT '',
    description TEXT DEFAULT '',
    short_description TEXT DEFAULT '',
    image TEXT DEFAULT '',
    images TEXT[] DEFAULT '{}',
    capacity INTEGER DEFAULT 0,
    price_per_km NUMERIC,
    features TEXT[] DEFAULT '{}',
    brochure_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Destinations table
CREATE TABLE public.destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    short_description TEXT DEFAULT '',
    image TEXT DEFAULT '',
    images TEXT[] DEFAULT '{}',
    highlights TEXT[] DEFAULT '{}',
    best_time TEXT DEFAULT '',
    brochure_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Special offers table
CREATE TABLE public.special_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    discount_percent NUMERIC,
    discount_text TEXT DEFAULT '',
    image TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Gallery table
CREATE TABLE public.gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT DEFAULT '',
    description TEXT DEFAULT '',
    image_url TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read packages" ON public.packages FOR SELECT USING (true);
CREATE POLICY "Public read vehicles" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Public read destinations" ON public.destinations FOR SELECT USING (true);
CREATE POLICY "Public read offers" ON public.special_offers FOR SELECT USING (true);
CREATE POLICY "Public read gallery" ON public.gallery FOR SELECT USING (true);

-- Admin write access
CREATE POLICY "Admin insert packages" ON public.packages FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update packages" ON public.packages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete packages" ON public.packages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin insert vehicles" ON public.vehicles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update vehicles" ON public.vehicles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete vehicles" ON public.vehicles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin insert destinations" ON public.destinations FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update destinations" ON public.destinations FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete destinations" ON public.destinations FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin insert offers" ON public.special_offers FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update offers" ON public.special_offers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete offers" ON public.special_offers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin insert gallery" ON public.gallery FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update gallery" ON public.gallery FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete gallery" ON public.gallery FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.destinations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.special_offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
