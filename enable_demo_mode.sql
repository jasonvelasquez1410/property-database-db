-- DEMO MODE: Auto-promote everyone to ADMIN
-- 1. Update the Trigger Function to default to 'admin' instead of 'staff'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    -- FORCE ADMIN ROLE FOR DEMO
    COALESCE(new.raw_user_meta_data->>'role', 'admin'),
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Retroactively promote ANY existing 'staff' or 'manager' to 'admin'
-- This ensures anyone who already signed up gets full access immediately.
UPDATE public.profiles
SET role = 'admin'
WHERE role IN ('staff', 'manager');
