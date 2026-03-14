
CREATE TABLE IF NOT EXISTS public.landing_page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL,
  section_key TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT DEFAULT '',
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  cta_text TEXT DEFAULT '',
  cta_link TEXT DEFAULT '',
  extra_data JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page_key, section_key)
);

ALTER TABLE public.landing_page_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read landing_page_sections" ON public.landing_page_sections FOR SELECT TO public USING (true);
CREATE POLICY "Admin insert landing_page_sections" ON public.landing_page_sections FOR INSERT TO public WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Admin update landing_page_sections" ON public.landing_page_sections FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Admin delete landing_page_sections" ON public.landing_page_sections FOR DELETE TO public USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
