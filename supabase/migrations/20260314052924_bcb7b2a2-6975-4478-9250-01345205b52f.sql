-- 1. Add created_by column to bookings, invoices, customers
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- 2. Add can_view_all column to role_permissions
ALTER TABLE public.role_permissions ADD COLUMN IF NOT EXISTS can_view_all boolean DEFAULT false;

-- 3. Create a security definer function to check if moderator can view all for a module
CREATE OR REPLACE FUNCTION public.can_view_all_for_module(_user_id uuid, _module text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.role_permissions
    WHERE role = 'moderator'
      AND module = _module
      AND can_view_all = true
  )
$$;

-- 4. Update RLS policies for bookings - moderators see own data OR if can_view_all
DROP POLICY IF EXISTS "Admin read bookings" ON public.bookings;
CREATE POLICY "Admin read bookings" ON public.bookings
  FOR SELECT TO public
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR (
      has_role(auth.uid(), 'admin'::app_role)
      AND (
        NOT has_role(auth.uid(), 'moderator'::app_role)
        OR created_by = auth.uid()
        OR created_by IS NULL
        OR can_view_all_for_module(auth.uid(), 'bookings')
      )
    )
  );

DROP POLICY IF EXISTS "Admin update bookings" ON public.bookings;
CREATE POLICY "Admin update bookings" ON public.bookings
  FOR UPDATE TO public
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR (
      has_role(auth.uid(), 'admin'::app_role)
      AND (
        NOT has_role(auth.uid(), 'moderator'::app_role)
        OR created_by = auth.uid()
        OR created_by IS NULL
        OR can_view_all_for_module(auth.uid(), 'bookings')
      )
    )
  );

DROP POLICY IF EXISTS "Admin delete bookings" ON public.bookings;
CREATE POLICY "Admin delete bookings" ON public.bookings
  FOR DELETE TO public
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR (
      has_role(auth.uid(), 'admin'::app_role)
      AND (
        NOT has_role(auth.uid(), 'moderator'::app_role)
        OR created_by = auth.uid()
        OR created_by IS NULL
        OR can_view_all_for_module(auth.uid(), 'bookings')
      )
    )
  );

-- 5. Update RLS policies for invoices
DROP POLICY IF EXISTS "Admin manage invoices" ON public.invoices;
CREATE POLICY "Admin read invoices" ON public.invoices
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR (
      has_role(auth.uid(), 'admin'::app_role)
      AND (
        NOT has_role(auth.uid(), 'moderator'::app_role)
        OR created_by = auth.uid()
        OR created_by IS NULL
        OR can_view_all_for_module(auth.uid(), 'invoices')
      )
    )
  );

CREATE POLICY "Admin insert invoices" ON public.invoices
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin update invoices" ON public.invoices
  FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR (
      has_role(auth.uid(), 'admin'::app_role)
      AND (
        NOT has_role(auth.uid(), 'moderator'::app_role)
        OR created_by = auth.uid()
        OR created_by IS NULL
        OR can_view_all_for_module(auth.uid(), 'invoices')
      )
    )
  );

CREATE POLICY "Admin delete invoices" ON public.invoices
  FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR (
      has_role(auth.uid(), 'admin'::app_role)
      AND (
        NOT has_role(auth.uid(), 'moderator'::app_role)
        OR created_by = auth.uid()
        OR created_by IS NULL
        OR can_view_all_for_module(auth.uid(), 'invoices')
      )
    )
  );

-- 6. Update RLS policies for customers
DROP POLICY IF EXISTS "Admin manage customers" ON public.customers;
CREATE POLICY "Admin read customers" ON public.customers
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR (
      has_role(auth.uid(), 'admin'::app_role)
      AND (
        NOT has_role(auth.uid(), 'moderator'::app_role)
        OR created_by = auth.uid()
        OR created_by IS NULL
        OR can_view_all_for_module(auth.uid(), 'customers')
      )
    )
  );

CREATE POLICY "Admin insert customers" ON public.customers
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin update customers" ON public.customers
  FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR (
      has_role(auth.uid(), 'admin'::app_role)
      AND (
        NOT has_role(auth.uid(), 'moderator'::app_role)
        OR created_by = auth.uid()
        OR created_by IS NULL
        OR can_view_all_for_module(auth.uid(), 'customers')
      )
    )
  );

CREATE POLICY "Admin delete customers" ON public.customers
  FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR (
      has_role(auth.uid(), 'admin'::app_role)
      AND (
        NOT has_role(auth.uid(), 'moderator'::app_role)
        OR created_by = auth.uid()
        OR created_by IS NULL
        OR can_view_all_for_module(auth.uid(), 'customers')
      )
    )
  );