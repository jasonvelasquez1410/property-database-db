-- Allow anonymous/public access to Properties table for Demo Reset
-- (This is necessary because the user might not be logged in as Admin when resetting)

-- 1. PROPERTIES
DROP POLICY IF EXISTS "Public Usage" ON public.properties;
DROP POLICY IF EXISTS "Properties Insert" ON public.properties;
DROP POLICY IF EXISTS "Properties Delete" ON public.properties;

CREATE POLICY "Allow Demo Insert" ON public.properties FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Demo Delete" ON public.properties FOR DELETE USING (true);
CREATE POLICY "Allow Demo Select" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Allow Demo Update" ON public.properties FOR UPDATE USING (true);

-- 2. APPRAISALS (Just in case)
DROP POLICY IF EXISTS "Public Usage" ON public.appraisals;
CREATE POLICY "Allow Demo Insert Appraisals" ON public.appraisals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Demo Delete Appraisals" ON public.appraisals FOR DELETE USING (true);

-- 3. DOCUMENTS, TENANTS, LEASES (Ensure they are also open)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow Demo Docs" ON public.documents FOR ALL USING (true);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow Demo Tenants" ON public.tenants FOR ALL USING (true);

ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow Demo Leases" ON public.leases FOR ALL USING (true);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow Demo Payments" ON public.payments FOR ALL USING (true);
