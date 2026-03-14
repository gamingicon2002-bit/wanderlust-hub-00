
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS invoice_terms TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS invoice_cancellation_policy TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS package_terms TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS package_cancellation_policy TEXT DEFAULT '';
