
CREATE TABLE public.homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text UNIQUE NOT NULL,
  title text NOT NULL DEFAULT '',
  subtitle text DEFAULT '',
  badge_text text DEFAULT '',
  cta_text text DEFAULT '',
  cta_link text DEFAULT '',
  image_url text DEFAULT '',
  extra_data jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read homepage" ON public.homepage_sections FOR SELECT USING (true);
CREATE POLICY "Admin insert homepage" ON public.homepage_sections FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Admin update homepage" ON public.homepage_sections FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Admin delete homepage" ON public.homepage_sections FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

INSERT INTO public.homepage_sections (section_key, title, subtitle, badge_text, cta_text, cta_link, image_url, extra_data, sort_order) VALUES
('hero', 'Explore Beyond Boundaries', 'Handcrafted tours, premium vehicles, and unforgettable experiences across India and the world.', '✦ Premium Travel Experiences', 'Explore Packages', '/packages', '', '{}', 1),
('stats', 'Our Numbers', '', '', '', '', '', '{"items":[{"icon":"MapPin","label":"Destinations","value":"50+"},{"icon":"Users","label":"Happy Travelers","value":"10,000+"},{"icon":"Shield","label":"Years Experience","value":"15+"},{"icon":"Clock","label":"24/7 Support","value":"Always"}]}', 2),
('featured_packages', 'Featured Tour Packages', 'Curated domestic experiences designed for the perfect Indian adventure', '', 'View All Packages', '/packages', '', '{}', 3),
('international_packages', 'International Tours', 'Explore the world with our handpicked global adventures', '', '', '', '', '{}', 4),
('destinations', 'Popular Destinations', 'Explore the diverse beauty of incredible India', '', '', '', '', '{}', 5),
('vehicles', 'Our Fleet', 'Premium vehicles for every type of journey', '', 'View All Vehicles', '/vehicles', '', '{}', 6),
('offers', 'Special Offers', 'Limited time deals on our best packages', '', '', '', '', '{}', 7),
('testimonials', 'What Our Travelers Say', 'Real experiences from real travelers', '', '', '', '', '{}', 8),
('gallery', 'Travel Gallery', 'Moments captured from our tours', '', 'View Full Gallery', '/gallery', '', '{}', 9),
('inquiry', 'Ready to Start Your Journey?', 'Share your details and our travel experts will get back to you with the best options.', '', '', '', '', '{}', 10);
