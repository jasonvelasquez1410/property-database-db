-- 1. Function to handle new user signup
-- This function runs automatically whenever a new user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'staff'),
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger to call the function
-- Removes existing trigger if it exists to avoid errors on potential re-runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Backfill missing profiles (Fix for your Jason account)
-- This inserts a profile for any existing user in auth.users who doesn't have one in public.profiles
INSERT INTO public.profiles (id, name, role, email)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)), 
    COALESCE(raw_user_meta_data->>'role', 'staff'),
    email
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 4. BOOTSTRAP: Make your specific account an ADMIN
-- Update the role for your email address
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'jason.velasquez1410@gmail.com';

-- 5. Enable RLS but ensure policies exist (Safety check)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
