
CREATE TABLE public.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL DEFAULT '',
  icon_name text NOT NULL DEFAULT '',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read social_links" ON public.social_links FOR SELECT USING (true);
CREATE POLICY "Admin insert social_links" ON public.social_links FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update social_links" ON public.social_links FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete social_links" ON public.social_links FOR DELETE USING (has_role(auth.uid(), 'admin'));
