
-- Sub-brands for invoicing
CREATE TABLE public.invoice_brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text DEFAULT '',
  address text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  gst_number text DEFAULT '',
  bank_details text DEFAULT '',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.invoice_brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage invoice_brands" ON public.invoice_brands FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Invoices
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE,
  brand_id uuid REFERENCES public.invoice_brands(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text DEFAULT '',
  customer_phone text DEFAULT '',
  customer_address text DEFAULT '',
  customer_gst text DEFAULT '',
  subtotal numeric NOT NULL DEFAULT 0,
  cgst_percent numeric DEFAULT 0,
  sgst_percent numeric DEFAULT 0,
  igst_percent numeric DEFAULT 0,
  cgst_amount numeric DEFAULT 0,
  sgst_amount numeric DEFAULT 0,
  igst_amount numeric DEFAULT 0,
  discount numeric DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  status text DEFAULT 'draft',
  invoice_date date DEFAULT CURRENT_DATE,
  due_date date,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage invoices" ON public.invoices FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Invoice line items
CREATE TABLE public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL DEFAULT '',
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  amount numeric NOT NULL DEFAULT 0,
  sort_order integer DEFAULT 0
);
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage invoice_items" ON public.invoice_items FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text DEFAULT '',
  type text DEFAULT 'info',
  is_read boolean DEFAULT false,
  link text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Service insert notifications" ON public.notifications FOR INSERT TO service_role WITH CHECK (true);

-- WhatsApp & SMTP config stored in site_settings via extra columns
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS whatsapp_api_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS whatsapp_api_key text DEFAULT '',
  ADD COLUMN IF NOT EXISTS whatsapp_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_booking_template text DEFAULT 'Hello {{customer_name}}, your booking for {{reference_name}} on {{travel_date}} has been confirmed. Thank you!',
  ADD COLUMN IF NOT EXISTS whatsapp_admin_template text DEFAULT 'New booking confirmed: {{customer_name}} - {{reference_name}} on {{travel_date}}',
  ADD COLUMN IF NOT EXISTS smtp_host text DEFAULT '',
  ADD COLUMN IF NOT EXISTS smtp_port text DEFAULT '587',
  ADD COLUMN IF NOT EXISTS smtp_user text DEFAULT '',
  ADD COLUMN IF NOT EXISTS smtp_pass text DEFAULT '',
  ADD COLUMN IF NOT EXISTS smtp_from_email text DEFAULT '',
  ADD COLUMN IF NOT EXISTS smtp_from_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS smtp_enabled boolean DEFAULT false;

-- Email templates
CREATE TABLE public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  template_type text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage email_templates" ON public.email_templates FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
