-- Add missing contract_url column to leases table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leases' AND column_name = 'contract_url') THEN
        ALTER TABLE public.leases ADD COLUMN contract_url text;
    END IF;
END $$;
