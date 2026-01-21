-- Helper Function for Role Retrieval (Security Definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  -- Fetch role from profiles linked to the authenticated user
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- Default to 'staff' if null (fail-safe)
  RETURN COALESCE(user_role, 'staff');
END;
$$;

-- Enable Row Level Security on all core tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraisals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- CLEANUP: Remove old permissive policies
DROP POLICY IF EXISTS "Public Usage" ON public.profiles;
DROP POLICY IF EXISTS "Public Usage" ON public.properties;
DROP POLICY IF EXISTS "Public Usage" ON public.documents;
DROP POLICY IF EXISTS "Public Usage" ON public.appraisals;
DROP POLICY IF EXISTS "Public Usage" ON public.recent_activities;

-- Cleanup tenants/leases existing policies
DROP POLICY IF EXISTS "Allow anonymous select tenants" ON tenants;
DROP POLICY IF EXISTS "Allow anonymous insert tenants" ON tenants;
DROP POLICY IF EXISTS "Allow anonymous update tenants" ON tenants;
DROP POLICY IF EXISTS "Allow anonymous select leases" ON leases;
DROP POLICY IF EXISTS "Allow anonymous insert leases" ON leases;
DROP POLICY IF EXISTS "Allow anonymous update leases" ON leases;
DROP POLICY IF EXISTS "Allow anonymous select payments" ON payments;
DROP POLICY IF EXISTS "Allow anonymous insert payments" ON payments;
DROP POLICY IF EXISTS "Allow anonymous update payments" ON payments;

-- =========================================================================
-- 1. PROFILES
-- =========================================================================
-- View: Users can see their own profile. Admins can see all.
CREATE POLICY "Profiles View" ON public.profiles
FOR SELECT USING (auth.uid() = id OR get_my_role() = 'admin');

-- Update: Users can update their own profile
CREATE POLICY "Profiles Update" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- =========================================================================
-- 2. PROPERTIES (High Value Assets)
-- =========================================================================
-- View: Admin, Manager, Staff
CREATE POLICY "Properties Select" ON public.properties
FOR SELECT USING (get_my_role() IN ('admin', 'manager', 'staff'));

-- Modify (Insert/Update/Delete): Admin & Manager Only
CREATE POLICY "Properties Insert" ON public.properties
FOR INSERT WITH CHECK (get_my_role() IN ('admin', 'manager'));

CREATE POLICY "Properties Update" ON public.properties
FOR UPDATE USING (get_my_role() IN ('admin', 'manager'));

CREATE POLICY "Properties Delete" ON public.properties
FOR DELETE USING (get_my_role() IN ('admin', 'manager'));

-- =========================================================================
-- 3. OPERATIONAL DATA (Tenants, Leases)
-- =========================================================================
-- View: All Roles
CREATE POLICY "Tenants Select" ON public.tenants
FOR SELECT USING (get_my_role() IN ('admin', 'manager', 'staff'));

CREATE POLICY "Leases Select" ON public.leases
FOR SELECT USING (get_my_role() IN ('admin', 'manager', 'staff'));

-- Modify: Admin & Manager Only (Staff cannot create Tenants per strict asset control, unless specified otherwise. 
-- User said: "Staff... Can Add payments/documents". Did not explicitly say Tenants.
-- I will restrict Tenants/Leases creation to Manager/Admin to be safe, as these are contracts.
-- Correction: Implementation Plan says "INSERT: Enabled for ... staff". 
-- I will stick to the approved PLAN which says Staff can Insert Tenants/Leases.)
CREATE POLICY "Tenants Insert" ON public.tenants
FOR INSERT WITH CHECK (get_my_role() IN ('admin', 'manager', 'staff'));

CREATE POLICY "Leases Insert" ON public.leases
FOR INSERT WITH CHECK (get_my_role() IN ('admin', 'manager', 'staff'));

-- Update/Delete: Admin & Manager Only
CREATE POLICY "Tenants Modify" ON public.tenants
FOR UPDATE USING (get_my_role() IN ('admin', 'manager'));

CREATE POLICY "Tenants Delete" ON public.tenants
FOR DELETE USING (get_my_role() IN ('admin', 'manager'));

CREATE POLICY "Leases Modify" ON public.leases
FOR UPDATE USING (get_my_role() IN ('admin', 'manager'));

CREATE POLICY "Leases Delete" ON public.leases
FOR DELETE USING (get_my_role() IN ('admin', 'manager'));

-- =========================================================================
-- 4. DAILY OPERATIONS (Documents, Payments, Appraisals)
-- =========================================================================
-- View: All Roles
CREATE POLICY "Documents View" ON public.documents
FOR SELECT USING (get_my_role() IN ('admin', 'manager', 'staff'));

CREATE POLICY "Payments View" ON public.payments
FOR SELECT USING (get_my_role() IN ('admin', 'manager', 'staff'));

CREATE POLICY "Appraisals View" ON public.appraisals
FOR SELECT USING (get_my_role() IN ('admin', 'manager', 'staff'));

-- Insert: Admin, Manager, AND Staff (Data Entry)
CREATE POLICY "Documents Insert" ON public.documents
FOR INSERT WITH CHECK (get_my_role() IN ('admin', 'manager', 'staff'));

CREATE POLICY "Payments Insert" ON public.payments
FOR INSERT WITH CHECK (get_my_role() IN ('admin', 'manager', 'staff'));

CREATE POLICY "Appraisals Insert" ON public.appraisals
FOR INSERT WITH CHECK (get_my_role() IN ('admin', 'manager', 'staff'));

-- Update/Delete: Admin & Manager Only
CREATE POLICY "Documents Modify" ON public.documents
FOR UPDATE USING (get_my_role() IN ('admin', 'manager'));
CREATE POLICY "Documents Delete" ON public.documents
FOR DELETE USING (get_my_role() IN ('admin', 'manager'));

CREATE POLICY "Payments Modify" ON public.payments
FOR UPDATE USING (get_my_role() IN ('admin', 'manager'));
CREATE POLICY "Payments Delete" ON public.payments
FOR DELETE USING (get_my_role() IN ('admin', 'manager'));

CREATE POLICY "Appraisals Modify" ON public.appraisals
FOR UPDATE USING (get_my_role() IN ('admin', 'manager'));
CREATE POLICY "Appraisals Delete" ON public.appraisals
FOR DELETE USING (get_my_role() IN ('admin', 'manager'));

-- =========================================================================
-- 5. ACTIVITY LOGS
-- =========================================================================
-- View: All
CREATE POLICY "Activity View" ON public.recent_activities
FOR SELECT USING (true);

-- Insert: All (System logs from any user action)
CREATE POLICY "Activity Insert" ON public.recent_activities
FOR INSERT WITH CHECK (true);
