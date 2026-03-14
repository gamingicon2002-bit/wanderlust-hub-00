ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS map_lat text DEFAULT '28.6139';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS map_lng text DEFAULT '77.2090';