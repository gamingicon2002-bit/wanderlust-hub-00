
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS heading text DEFAULT 'INVOICE',
  ADD COLUMN IF NOT EXISTS description text DEFAULT '',
  ADD COLUMN IF NOT EXISTS footer_text text DEFAULT 'Thank you for your business!',
  ADD COLUMN IF NOT EXISTS terms text DEFAULT '',
  ADD COLUMN IF NOT EXISTS payment_method text DEFAULT '';
