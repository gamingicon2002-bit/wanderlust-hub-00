# Supabase Complete Setup Guide

> Run these SQL commands **in order** in the Supabase SQL Editor when setting up a new project.
> After running all SQL, deploy the Edge Functions and create your first super admin.

---

## Table of Contents

1. [Enum & Functions](#1-enum--functions)
2. [Tables](#2-tables)
3. [Foreign Keys & Constraints](#3-foreign-keys--constraints)
4. [Enable RLS on All Tables](#4-enable-rls-on-all-tables)
5. [RLS Policies](#5-rls-policies)
6. [Triggers](#6-triggers)
7. [Seed Data](#7-seed-data)
8. [Create Super Admin](#8-create-super-admin)
9. [Edge Functions](#9-edge-functions)
10. [Environment Variables](#10-environment-variables)

---

## 1. Enum & Functions

```sql
-- =============================================
-- STEP 1: Create custom enum for roles
-- =============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'super_admin');

-- =============================================
-- STEP 2: Create security definer functions
-- =============================================

-- Check if a user has a specific role (used in RLS policies)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'::app_role
  )
$$;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Auto-create/update customer from booking
CREATE OR REPLACE FUNCTION public.upsert_customer_from_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.customers (name, email, phone, lead_source, total_invoices, total_spent)
  VALUES (NEW.customer_name, NEW.customer_email, NEW.customer_phone, COALESCE(NEW.lead_source, ''), 0, 0)
  ON CONFLICT ON CONSTRAINT customers_email_phone_unique DO UPDATE
    SET name = COALESCE(NULLIF(NEW.customer_name, ''), customers.name),
        phone = COALESCE(NULLIF(NEW.customer_phone, ''), customers.phone),
        email = COALESCE(NULLIF(NEW.customer_email, ''), customers.email),
        lead_source = COALESCE(NULLIF(NEW.lead_source, ''), customers.lead_source),
        updated_at = now();
  RETURN NEW;
END;
$$;
```

---

## 2. Tables

```sql
-- =============================================
-- USER ROLES
-- =============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- =============================================
-- SITE SETTINGS (singleton)
-- =============================================
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT DEFAULT 'Wanderlust Tours',
  tagline TEXT DEFAULT 'Book your dream trip today!',
  contact_email TEXT DEFAULT '',
  phone TEXT DEFAULT '+91 98765 43210',
  whatsapp TEXT DEFAULT '+919876543210',
  office_address TEXT DEFAULT '123 Travel Street, New Delhi, India',
  business_mode TEXT DEFAULT 'full',
  show_theme_toggle BOOLEAN DEFAULT true,
  -- SMTP
  smtp_enabled BOOLEAN DEFAULT false,
  smtp_host TEXT DEFAULT '',
  smtp_port TEXT DEFAULT '587',
  smtp_user TEXT DEFAULT '',
  smtp_pass TEXT DEFAULT '',
  smtp_from_email TEXT DEFAULT '',
  smtp_from_name TEXT DEFAULT '',
  -- WhatsApp
  whatsapp_enabled BOOLEAN DEFAULT false,
  whatsapp_api_url TEXT DEFAULT '',
  whatsapp_api_key TEXT DEFAULT '',
  whatsapp_booking_template TEXT DEFAULT 'Hello {{customer_name}}, your booking for {{reference_name}} on {{travel_date}} has been confirmed. Thank you!',
  whatsapp_admin_template TEXT DEFAULT 'New booking confirmed: {{customer_name}} - {{reference_name}} on {{travel_date}}',
  -- Document design
  doc_primary_color TEXT DEFAULT '#2563eb',
  doc_secondary_color TEXT DEFAULT '#7c3aed',
  doc_accent_color TEXT DEFAULT '#f59e0b',
  doc_font_family TEXT DEFAULT 'Inter',
  -- Navbar config
  navbar_items JSONB DEFAULT '{"blogs": true, "hotels": true, "offers": true, "contact": true, "gallery": true, "packages": true, "vehicles": true, "destinations": true}'::jsonb,
  -- Lead sources
  lead_sources JSONB DEFAULT '["Website", "WhatsApp", "Phone", "Walk-in", "Facebook", "Instagram", "Google", "Referral"]'::jsonb,
  -- Map location (Contact page)
  map_lat TEXT DEFAULT '28.6139',
  map_lng TEXT DEFAULT '77.2090',
  -- Terms & Policies
  invoice_terms TEXT DEFAULT '',
  invoice_cancellation_policy TEXT DEFAULT '',
  package_terms TEXT DEFAULT '',
  package_cancellation_policy TEXT DEFAULT '',
  -- Timestamps
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PACKAGES
-- =============================================
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  duration TEXT,
  description TEXT DEFAULT '',
  short_description TEXT DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  original_price NUMERIC,
  image TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}',
  itinerary TEXT[] DEFAULT '{}',
  inclusions TEXT[] DEFAULT '{}',
  exclusions TEXT[] DEFAULT '{}',
  special_features TEXT[] DEFAULT '{}',
  brochure_url TEXT DEFAULT '',
  tour_type TEXT NOT NULL DEFAULT 'domestic',
  additional_notes TEXT DEFAULT '',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- VEHICLES
-- =============================================
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  sub_type TEXT,
  model TEXT,
  capacity INTEGER,
  price_per_km NUMERIC,
  price_per_day NUMERIC,
  fuel_type TEXT,
  transmission TEXT,
  description TEXT DEFAULT '',
  short_description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  rental_options TEXT[] DEFAULT '{}',
  brochure_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- VEHICLE TYPES (hierarchical)
-- =============================================
CREATE TABLE public.vehicle_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  icon TEXT,
  parent_id UUID REFERENCES vehicle_types(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- DESTINATIONS
-- =============================================
CREATE TABLE public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  short_description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}',
  highlights TEXT[] DEFAULT '{}',
  best_time TEXT DEFAULT '',
  brochure_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- HOTELS
-- =============================================
CREATE TABLE public.hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  destination TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  short_description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  rating NUMERIC DEFAULT 0,
  price_per_night NUMERIC DEFAULT 0,
  contact_phone TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- HOTEL ROOMS
-- =============================================
CREATE TABLE public.hotel_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL DEFAULT '',
  room_type TEXT NOT NULL DEFAULT 'standard',
  ac_type TEXT NOT NULL DEFAULT 'ac',
  beds INTEGER NOT NULL DEFAULT 1,
  pillows INTEGER NOT NULL DEFAULT 2,
  sheets INTEGER NOT NULL DEFAULT 2,
  price_per_night NUMERIC DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  floor TEXT DEFAULT '',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- DRIVERS
-- =============================================
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT DEFAULT '',
  license_number TEXT DEFAULT '',
  experience_years INTEGER DEFAULT 0,
  photo TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- DRIVER VEHICLES (many-to-many)
-- =============================================
CREATE TABLE public.driver_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(driver_id, vehicle_id)
);

-- =============================================
-- BOOKINGS
-- =============================================
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_type TEXT NOT NULL DEFAULT 'package',
  reference_id UUID,
  reference_name TEXT DEFAULT '',
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  pickup_location TEXT DEFAULT '',
  drop_location TEXT DEFAULT '',
  travel_date DATE,
  travel_time TEXT DEFAULT '',
  num_travelers INTEGER DEFAULT 1,
  vehicle_type TEXT DEFAULT '',
  rental_option TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  lead_source TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- BOOKING DRIVERS (many-to-many)
-- =============================================
CREATE TABLE public.booking_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(booking_id, driver_id)
);

-- =============================================
-- HOTEL BOOKING DETAILS
-- =============================================
CREATE TABLE public.hotel_booking_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  room_id UUID REFERENCES hotel_rooms(id) ON DELETE SET NULL,
  check_in DATE,
  check_out DATE,
  family_members INTEGER DEFAULT 1,
  marital_status TEXT DEFAULT '',
  guest_id_type TEXT DEFAULT '',
  guest_id_number TEXT DEFAULT '',
  guest_id_image TEXT DEFAULT '',
  num_beds INTEGER DEFAULT 1,
  num_pillows INTEGER DEFAULT 2,
  num_sheets INTEGER DEFAULT 2,
  special_requests TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- CUSTOMERS
-- =============================================
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  gst_number TEXT DEFAULT '',
  lead_source TEXT DEFAULT '',
  total_invoices INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT customers_email_phone_unique UNIQUE(email, phone)
);

-- =============================================
-- INVOICE BRANDS
-- =============================================
CREATE TABLE public.invoice_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  gst_number TEXT DEFAULT '',
  bank_details TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INVOICES
-- =============================================
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES invoice_brands(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT DEFAULT '',
  customer_phone TEXT DEFAULT '',
  customer_address TEXT DEFAULT '',
  customer_gst TEXT DEFAULT '',
  heading TEXT DEFAULT 'INVOICE',
  description TEXT DEFAULT '',
  invoice_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  cgst_percent NUMERIC DEFAULT 0,
  sgst_percent NUMERIC DEFAULT 0,
  igst_percent NUMERIC DEFAULT 0,
  cgst_amount NUMERIC DEFAULT 0,
  sgst_amount NUMERIC DEFAULT 0,
  igst_amount NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'draft',
  payment_method TEXT DEFAULT '',
  paid_at TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  terms TEXT DEFAULT '',
  footer_text TEXT DEFAULT 'Thank you for your business!',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INVOICE ITEMS
-- =============================================
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL DEFAULT '',
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  amount NUMERIC NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

-- =============================================
-- ITINERARIES
-- =============================================
CREATE TABLE public.itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT DEFAULT '',
  customer_phone TEXT DEFAULT '',
  package_name TEXT DEFAULT '',
  destination TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  pickup_location TEXT DEFAULT '',
  drop_location TEXT DEFAULT '',
  vehicle_name TEXT DEFAULT '',
  vehicle_type TEXT DEFAULT '',
  driver_name TEXT DEFAULT '',
  driver_phone TEXT DEFAULT '',
  travel_date DATE,
  num_travelers INTEGER DEFAULT 1,
  total_price NUMERIC DEFAULT 0,
  price_includes_driver BOOLEAN DEFAULT true,
  days JSONB DEFAULT '[]'::jsonb,
  inclusions TEXT DEFAULT '',
  exclusions TEXT DEFAULT '',
  special_notes TEXT DEFAULT '',
  emergency_contact TEXT DEFAULT '',
  background_image TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- REVIEWS (polymorphic)
-- =============================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewable_type TEXT NOT NULL DEFAULT 'package',
  reviewable_id UUID NOT NULL,
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  comment TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- BLOGS
-- =============================================
CREATE TABLE public.blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT DEFAULT '',
  image TEXT DEFAULT '',
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- BLOG COMMENTS
-- =============================================
CREATE TABLE public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  commenter_name TEXT NOT NULL,
  commenter_email TEXT NOT NULL,
  comment TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- CONTACT SUBMISSIONS
-- =============================================
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- NOTIFICATIONS
-- =============================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT DEFAULT '',
  type TEXT DEFAULT 'info',
  link TEXT DEFAULT '',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SOCIAL LINKS
-- =============================================
CREATE TABLE public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '',
  icon_name TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SPECIAL OFFERS
-- =============================================
CREATE TABLE public.special_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  discount_percent NUMERIC,
  discount_text TEXT DEFAULT '',
  image TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- GALLERY
-- =============================================
CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- HOMEPAGE SECTIONS
-- =============================================
CREATE TABLE public.homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT DEFAULT '',
  badge_text TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  cta_text TEXT DEFAULT '',
  cta_link TEXT DEFAULT '',
  extra_data JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- LANDING PAGE SECTIONS
-- =============================================
CREATE TABLE public.landing_page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL,
  section_key TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT DEFAULT '',
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  cta_text TEXT DEFAULT '',
  cta_link TEXT DEFAULT '',
  extra_data JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page_key, section_key)
);

-- =============================================
-- PAGES (static CMS pages)
-- =============================================
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- EMAIL TEMPLATES
-- =============================================
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  template_type TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- RELATED HOTELS (package <-> hotel)
-- =============================================
CREATE TABLE public.related_hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(package_id, hotel_id)
);

-- =============================================
-- RELATED PACKAGES (package <-> package)
-- =============================================
CREATE TABLE public.related_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  related_package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(package_id, related_package_id)
);

-- =============================================
-- ROLE PERMISSIONS (module-level access)
-- =============================================
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  module TEXT NOT NULL,
  can_view BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role, module)
);
```

---

## 4. Enable RLS on All Tables

```sql
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_booking_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.related_hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.related_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
```

---

## 5. RLS Policies

```sql
-- =============================================
-- USER ROLES
-- =============================================
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- =============================================
-- SITE SETTINGS
-- =============================================
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT TO public USING (true);
CREATE POLICY "Admin update settings" ON public.site_settings FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin insert settings" ON public.site_settings FOR INSERT TO public WITH CHECK (has_role(auth.uid(), 'admin'));

-- =============================================
-- PACKAGES
-- =============================================
CREATE POLICY "Public read packages" ON public.packages FOR SELECT TO public USING (true);
CREATE POLICY "Admin insert packages" ON public.packages FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update packages" ON public.packages FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete packages" ON public.packages FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- VEHICLES
-- =============================================
CREATE POLICY "Public read vehicles" ON public.vehicles FOR SELECT TO public USING (true);
CREATE POLICY "Admin insert vehicles" ON public.vehicles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update vehicles" ON public.vehicles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete vehicles" ON public.vehicles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- VEHICLE TYPES
-- =============================================
CREATE POLICY "Public read vehicle_types" ON public.vehicle_types FOR SELECT TO public USING (true);
CREATE POLICY "Admin manage vehicle_types" ON public.vehicle_types FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- =============================================
-- DESTINATIONS
-- =============================================
CREATE POLICY "Public read destinations" ON public.destinations FOR SELECT TO public USING (true);
CREATE POLICY "Admin insert destinations" ON public.destinations FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update destinations" ON public.destinations FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete destinations" ON public.destinations FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- HOTELS
-- =============================================
CREATE POLICY "Public read hotels" ON public.hotels FOR SELECT TO public USING (true);
CREATE POLICY "Admin insert hotels" ON public.hotels FOR INSERT TO public WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update hotels" ON public.hotels FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete hotels" ON public.hotels FOR DELETE TO public USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- HOTEL ROOMS
-- =============================================
CREATE POLICY "Public read hotel_rooms" ON public.hotel_rooms FOR SELECT TO public USING (true);
CREATE POLICY "Admin manage hotel_rooms" ON public.hotel_rooms FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- =============================================
-- DRIVERS
-- =============================================
CREATE POLICY "Public read drivers" ON public.drivers FOR SELECT TO public USING (true);
CREATE POLICY "Driver read own record" ON public.drivers FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin insert drivers" ON public.drivers FOR INSERT TO public WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update drivers" ON public.drivers FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete drivers" ON public.drivers FOR DELETE TO public USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- DRIVER VEHICLES
-- =============================================
CREATE POLICY "Public read driver_vehicles" ON public.driver_vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage driver_vehicles" ON public.driver_vehicles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- =============================================
-- BOOKINGS
-- =============================================
CREATE POLICY "Public insert booking" ON public.bookings FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admin read bookings" ON public.bookings FOR SELECT TO public USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update bookings" ON public.bookings FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete bookings" ON public.bookings FOR DELETE TO public USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Driver read assigned bookings" ON public.bookings FOR SELECT TO authenticated USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- =============================================
-- BOOKING DRIVERS
-- =============================================
CREATE POLICY "Admin manage booking_drivers" ON public.booking_drivers FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Driver read own booking_drivers" ON public.booking_drivers FOR SELECT TO authenticated USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- =============================================
-- HOTEL BOOKING DETAILS
-- =============================================
CREATE POLICY "Public insert hotel_booking_details" ON public.hotel_booking_details FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admin manage hotel_booking_details" ON public.hotel_booking_details FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- =============================================
-- CUSTOMERS
-- =============================================
CREATE POLICY "Admin manage customers" ON public.customers FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- =============================================
-- INVOICE BRANDS
-- =============================================
CREATE POLICY "Admin manage invoice_brands" ON public.invoice_brands FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- =============================================
-- INVOICES
-- =============================================
CREATE POLICY "Admin manage invoices" ON public.invoices FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- =============================================
-- INVOICE ITEMS
-- =============================================
CREATE POLICY "Admin manage invoice_items" ON public.invoice_items FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- =============================================
-- ITINERARIES
-- =============================================
CREATE POLICY "Admin manage itineraries" ON public.itineraries FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- =============================================
-- REVIEWS
-- =============================================
CREATE POLICY "Public insert review" ON public.reviews FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public read approved reviews" ON public.reviews FOR SELECT TO public USING (status = 'approved');
CREATE POLICY "Admin read all reviews" ON public.reviews FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update reviews" ON public.reviews FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete reviews" ON public.reviews FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- BLOGS
-- =============================================
CREATE POLICY "Public insert blog" ON public.blogs FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public read approved blogs" ON public.blogs FOR SELECT TO public USING (status = 'approved');
CREATE POLICY "Admin read all blogs" ON public.blogs FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update blogs" ON public.blogs FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete blogs" ON public.blogs FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- BLOG COMMENTS
-- =============================================
CREATE POLICY "Public insert comment" ON public.blog_comments FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public read approved comments" ON public.blog_comments FOR SELECT TO public USING (status = 'approved');
CREATE POLICY "Admin read all comments" ON public.blog_comments FOR SELECT TO public USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update comments" ON public.blog_comments FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete comments" ON public.blog_comments FOR DELETE TO public USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- CONTACT SUBMISSIONS
-- =============================================
CREATE POLICY "Public insert contact" ON public.contact_submissions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admin read contact" ON public.contact_submissions FOR SELECT TO public USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete contact" ON public.contact_submissions FOR DELETE TO public USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- NOTIFICATIONS
-- =============================================
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Service insert notifications" ON public.notifications FOR INSERT TO service_role WITH CHECK (true);

-- =============================================
-- SOCIAL LINKS
-- =============================================
CREATE POLICY "Public read social_links" ON public.social_links FOR SELECT TO public USING (true);
CREATE POLICY "Admin insert social_links" ON public.social_links FOR INSERT TO public WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update social_links" ON public.social_links FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete social_links" ON public.social_links FOR DELETE TO public USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- SPECIAL OFFERS
-- =============================================
CREATE POLICY "Public read offers" ON public.special_offers FOR SELECT TO public USING (true);
CREATE POLICY "Admin insert offers" ON public.special_offers FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update offers" ON public.special_offers FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete offers" ON public.special_offers FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- GALLERY
-- =============================================
CREATE POLICY "Public read gallery" ON public.gallery FOR SELECT TO public USING (true);
CREATE POLICY "Admin insert gallery" ON public.gallery FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update gallery" ON public.gallery FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete gallery" ON public.gallery FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- HOMEPAGE SECTIONS
-- =============================================
CREATE POLICY "Public read homepage" ON public.homepage_sections FOR SELECT TO public USING (true);
CREATE POLICY "Admin insert homepage" ON public.homepage_sections FOR INSERT TO public WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admin update homepage" ON public.homepage_sections FOR UPDATE TO public USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admin delete homepage" ON public.homepage_sections FOR DELETE TO public USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- =============================================
-- LANDING PAGE SECTIONS
-- =============================================
CREATE POLICY "Public read landing_page_sections" ON public.landing_page_sections FOR SELECT TO public USING (true);
CREATE POLICY "Admin insert landing_page_sections" ON public.landing_page_sections FOR INSERT TO public WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admin update landing_page_sections" ON public.landing_page_sections FOR UPDATE TO public USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admin delete landing_page_sections" ON public.landing_page_sections FOR DELETE TO public USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- =============================================
-- PAGES
-- =============================================
CREATE POLICY "Public read active pages" ON public.pages FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Admin read all pages" ON public.pages FOR SELECT TO public USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admin insert pages" ON public.pages FOR INSERT TO public WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admin update pages" ON public.pages FOR UPDATE TO public USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admin delete pages" ON public.pages FOR DELETE TO public USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- =============================================
-- EMAIL TEMPLATES
-- =============================================
CREATE POLICY "Admin manage email_templates" ON public.email_templates FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- =============================================
-- RELATED HOTELS
-- =============================================
CREATE POLICY "Public read related hotels" ON public.related_hotels FOR SELECT TO public USING (true);
CREATE POLICY "Admin insert related hotels" ON public.related_hotels FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update related hotels" ON public.related_hotels FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete related hotels" ON public.related_hotels FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- RELATED PACKAGES
-- =============================================
CREATE POLICY "Public read related packages" ON public.related_packages FOR SELECT TO public USING (true);
CREATE POLICY "Admin insert related packages" ON public.related_packages FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update related packages" ON public.related_packages FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete related packages" ON public.related_packages FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- ROLE PERMISSIONS
-- =============================================
CREATE POLICY "Authenticated read role_permissions" ON public.role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage role_permissions" ON public.role_permissions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
```

---

## 6. Triggers

```sql
-- Auto-upsert customer when a booking is created
CREATE TRIGGER on_booking_insert
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.upsert_customer_from_booking();

-- Auto-update updated_at on tables that have it
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON public.destinations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON public.hotels FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_hotel_rooms_updated_at BEFORE UPDATE ON public.hotel_rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_itineraries_updated_at BEFORE UPDATE ON public.itineraries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON public.blogs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_invoice_brands_updated_at BEFORE UPDATE ON public.invoice_brands FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_special_offers_updated_at BEFORE UPDATE ON public.special_offers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_homepage_sections_updated_at BEFORE UPDATE ON public.homepage_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_landing_page_sections_updated_at BEFORE UPDATE ON public.landing_page_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 7. Seed Data

```sql
-- Insert default site settings (singleton row)
INSERT INTO public.site_settings (company_name, tagline, phone, whatsapp, office_address)
VALUES ('Your Company Name', 'Your tagline here', '+91 98765 43210', '+919876543210', 'Your Address, City, India');

-- Insert default homepage sections
INSERT INTO public.homepage_sections (section_key, title, subtitle, sort_order) VALUES
  ('hero', 'Discover Incredible India', 'Unforgettable journeys, handcrafted for you', 1),
  ('packages', 'Popular Packages', 'Explore our curated travel experiences', 2),
  ('vehicles', 'Our Fleet', 'Premium vehicles for every journey', 3),
  ('destinations', 'Top Destinations', 'Explore breathtaking locations', 4),
  ('reviews', 'What Our Travelers Say', 'Real experiences from happy customers', 5),
  ('offers', 'Special Offers', 'Limited time deals you cannot miss', 6),
  ('gallery', 'Travel Gallery', 'Glimpses from amazing journeys', 7),
  ('cta', 'Ready for Your Next Adventure?', 'Book your dream trip today', 8);
```

---

## 8. Create Super Admin

### Step 1: Create an Auth User

Go to **Supabase Dashboard → Authentication → Users → Add User**

- Email: `admin@yourdomain.com`
- Password: `YourSecurePassword123!`
- Check "Auto Confirm"

### Step 2: Assign Super Admin Role

After creating the user, copy the user's UUID from the dashboard, then run:

```sql
-- Replace 'USER_UUID_HERE' with the actual UUID from Authentication → Users
INSERT INTO public.user_roles (user_id, role)
VALUES
  ('USER_UUID_HERE', 'super_admin'),
  ('USER_UUID_HERE', 'admin');
```

> **Important:** Super admins also need the `admin` role for RLS policies to work correctly.

### Alternative: Use the Edge Function (after deploying)

If the Edge Functions are deployed, you can create additional admins from the Admin Panel → Users section.

---

## 9. Edge Functions

Deploy these Edge Functions from the `supabase/functions/` directory:

| Function | Purpose |
|----------|---------|
| `admin-management` | Create/delete admin users, change roles & passwords |
| `send-email` | Send emails via SMTP (booking confirmations, etc.) |
| `send-notification` | Create in-app notifications |

### Deploy Command

```bash
supabase functions deploy admin-management
supabase functions deploy send-email
supabase functions deploy send-notification
```

### Required Secrets

Set these in Supabase Dashboard → Edge Functions → Secrets:

| Secret | Description |
|--------|-------------|
| `SUPABASE_URL` | Auto-set by Supabase |
| `SUPABASE_ANON_KEY` | Auto-set by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-set by Supabase |

---

## 10. Environment Variables

Set these in your frontend `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_SUPABASE_PROJECT_ID=your-project-id
```

---

## Quick Reference: Role Hierarchy

| Role | Access Level |
|------|-------------|
| `super_admin` | Full access + manage other admins |
| `admin` | Full CRUD on all tables |
| `moderator` | Same as admin (also gets admin role) |
| `user` | Public access only |

## Business Modes

| Mode | Modules |
|------|---------|
| `full` | Everything enabled |
| `package_only` | Packages, vehicles, destinations, drivers, bookings, invoices |
| `hotel_only` | Hotels, hotel bookings, invoices, customers |
| `invoice_only` | Invoices, invoice brands, customers only |

Change mode in **Admin → Settings → Business Mode**.
