-- 1. Fix Appraisals Table
CREATE TABLE IF NOT EXISTS public.appraisals (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  appraisal_date date,
  appraised_value numeric,
  appraisal_company text,
  report_url text,
  report_file_name text
);

-- Add column if it doesn't exist (Idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appraisals' AND column_name = 'report_file_name') THEN
        ALTER TABLE public.appraisals ADD COLUMN report_file_name text;
    END IF;
END $$;

-- 2. Fix Leases Table
-- Add 'terms' column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leases' AND column_name = 'terms') THEN
        ALTER TABLE public.leases ADD COLUMN terms text;
    END IF;
END $$;

-- 3. Refresh Policies (Safe to re-run)
DO $$
BEGIN
    -- Enable RLS
    ALTER TABLE public.appraisals ENABLE ROW LEVEL SECURITY;
    
    -- Drop old policies to avoid conflicts
    DROP POLICY IF EXISTS "Appraisals View" ON public.appraisals;
    DROP POLICY IF EXISTS "Appraisals Insert" ON public.appraisals;
    DROP POLICY IF EXISTS "Appraisals Modify" ON public.appraisals;
    DROP POLICY IF EXISTS "Appraisals Delete" ON public.appraisals;
    
    -- Re-create Policies (Admin/Manager/Staff access)
    CREATE POLICY "Appraisals View" ON public.appraisals FOR SELECT USING (true);
    CREATE POLICY "Appraisals Insert" ON public.appraisals FOR INSERT WITH CHECK (true);
    CREATE POLICY "Appraisals Modify" ON public.appraisals FOR UPDATE USING (true);
    CREATE POLICY "Appraisals Delete" ON public.appraisals FOR DELETE USING (true);
END $$;
