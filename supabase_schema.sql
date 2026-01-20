-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (linked to auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  role text check (role in ('admin', 'manager', 'staff'))
);

-- Properties table
create table public.properties (
  id uuid default uuid_generate_v4() primary key,
  property_name text not null,
  photo_url text,
  property_type text,
  full_address text,
  location text,
  gps_coordinates text,
  video_url text,
  unit_number text,
  floor_number text,
  lot_no text,
  tct_or_cct_no text,
  area_sqm numeric,
  original_developer text,
  brokers_name text,
  brokers_contact text,
  buyers_name text,
  
  -- File URLs
  tct_url text,
  tct_file_name text,
  td_url text,
  td_file_name text,
  cct_url text,
  cct_file_name text,
  location_plan_url text,
  location_plan_file_name text,

  -- Flattened Acquisition
  acquisition_unit_lot_cost numeric,
  acquisition_cost_per_sqm numeric,
  acquisition_fit_out_cost numeric,
  acquisition_total_cost numeric,

  -- Flattened Payment
  payment_status text,
  payment_schedule_url text,
  payment_schedule_file_name text,

  -- Flattened Lease
  lease_lessee text,
  lease_date date,
  lease_rate numeric,
  lease_term_years numeric,
  lease_referring_broker text,
  lease_broker_contact text,
  lease_contract_url text,
  lease_contract_file_name text,

  -- Flattened Possession
  possession_is_turned_over boolean,
  possession_turnover_date date,
  possession_authorized_recipient text,

  -- Flattened Insurance
  insurance_coverage_date date,
  insurance_amount_insured numeric,
  insurance_company text,
  insurance_policy_url text,
  insurance_policy_file_name text,

  -- Flattened Management
  caretaker_name text,
  caretaker_rate numeric,
  real_estate_tax_last_paid date,
  real_estate_tax_amount numeric,
  real_estate_tax_receipt_url text,
  real_estate_tax_receipt_file_name text,
  condo_dues_last_paid date,
  condo_dues_amount numeric,
  condo_dues_receipt_url text,
  condo_dues_receipt_file_name text,

  -- Pending Docs Checklists
  pending_documents text[],

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Documents Table (One-to-Many)
create table public.documents (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  type text,
  status text,
  priority text,
  due_date date,
  execution_date date,
  document_url text,
  file_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Appraisals Table (One-to-Many)
create table public.appraisals (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  appraisal_date date,
  appraised_value numeric,
  appraisal_company text,
  report_url text,
  report_file_name text
);

-- Recent Activity Table
create table public.recent_activities (
  id uuid default uuid_generate_v4() primary key,
  type text,
  title text,
  description text,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security) - Optional but good practice
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.documents enable row level security;
alter table public.appraisals enable row level security;
alter table public.recent_activities enable row level security;

-- Policies (Open for now for ease of development)
create policy "Public Usage" on public.profiles for all using (true);
create policy "Public Usage" on public.properties for all using (true);
create policy "Public Usage" on public.documents for all using (true);
create policy "Public Usage" on public.appraisals for all using (true);
create policy "Public Usage" on public.recent_activities for all using (true);
