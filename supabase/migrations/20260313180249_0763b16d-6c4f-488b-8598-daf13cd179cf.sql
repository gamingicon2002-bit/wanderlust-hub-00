
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS business_mode text DEFAULT 'full';
