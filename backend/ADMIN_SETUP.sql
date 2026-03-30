-- ADMIN_SETUP.sql - Run AFTER FULL_SCHEMA.sql

-- 1. Add email column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Populate emails from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;

-- 3. Create admin user if not exists (manual auth first)
-- Then set role
UPDATE public.profiles 
SET role = 'admin', full_name = 'Admin Agrimétéo'
WHERE email = 'admin@agrimeteo.com';

-- Verify
SELECT id, full_name, email, role FROM public.profiles WHERE role = 'admin';

SELECT '✅ Admin setup complete!';

