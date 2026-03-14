ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS additional_notes text DEFAULT '';
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS special_features text[] DEFAULT '{}'::text[];