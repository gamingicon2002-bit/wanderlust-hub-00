
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS tour_type text NOT NULL DEFAULT 'domestic';
