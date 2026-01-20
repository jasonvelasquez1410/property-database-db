-- Create Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    occupation TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    id_type TEXT,
    id_number TEXT,
    status TEXT DEFAULT 'Active', -- 'Active', 'Evicted', 'Past'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Leases Table
CREATE TABLE IF NOT EXISTS leases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id),
    tenant_id UUID REFERENCES tenants(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent NUMERIC,
    security_deposit NUMERIC,
    status TEXT DEFAULT 'Active', -- 'Active', 'Terminated', 'Expired', 'Renewed'
    terms TEXT, -- URL or text description
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lease_id UUID REFERENCES leases(id),
    payment_date DATE DEFAULT CURRENT_DATE,
    amount NUMERIC NOT NULL,
    payment_type TEXT, -- 'Rent', 'Deposit', 'Utilities', 'Other'
    payment_method TEXT, -- 'Cash', 'Check', 'Bank Transfer', 'Gcash'
    reference_no TEXT,
    status TEXT DEFAULT 'Completed', -- 'Completed', 'Pending', 'Failed'
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for demo purposes (matching existing policy)
CREATE POLICY "Allow anonymous select tenants" ON tenants FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert tenants" ON tenants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update tenants" ON tenants FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous select leases" ON leases FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert leases" ON leases FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update leases" ON leases FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous select payments" ON payments FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert payments" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update payments" ON payments FOR UPDATE USING (true);

-- Insert Demo Data (Optional - run this to populate tables)
INSERT INTO tenants (name, email, phone, occupation, status)
VALUES 
    ('Sarah Jenkins', 'sarah.j@example.com', '0917-555-0123', 'Marketing Manager', 'Active'),
    ('Michael Ross', 'mike.ross@example.com', '0918-555-0987', 'Lawyer', 'Active'),
    ('Jessica Pearson', 'jessica.p@example.com', '0917-555-4321', 'Managing Partner', 'Past');

-- Note: You would need real property IDs to insert valid leases linked to properties.
-- The app will allow you to create them via the UI once tenants are added.
