
-- Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewable_type text NOT NULL DEFAULT 'package',
  reviewable_id uuid NOT NULL,
  reviewer_name text NOT NULL,
  reviewer_email text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  comment text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read approved reviews" ON public.reviews
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Admin read all reviews" ON public.reviews
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public insert review" ON public.reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin update reviews" ON public.reviews
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin delete reviews" ON public.reviews
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Blogs table
CREATE TABLE public.blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  excerpt text DEFAULT '',
  image text DEFAULT '',
  author_name text NOT NULL,
  author_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read approved blogs" ON public.blogs
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Admin read all blogs" ON public.blogs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public insert blog" ON public.blogs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin update blogs" ON public.blogs
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin delete blogs" ON public.blogs
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
