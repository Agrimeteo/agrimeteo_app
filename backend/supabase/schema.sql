-- Updated AgroSmart Schema for Admin + Notifications
-- Run in Supabase SQL Editor

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'beginner', 'farmer', 'admin')),
  location TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create crops table
CREATE TABLE IF NOT EXISTS public.crops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  crop_type TEXT NOT NULL,
  planting_date DATE,
  expected_harvest DATE,
  status TEXT DEFAULT 'planted' CHECK (status IN ('planted', 'growing', 'harvested')),
  area REAL,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for crops
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;

-- Create policies for crops
CREATE POLICY "Users can manage own crops" ON public.crops
  FOR ALL USING (auth.uid() = user_id);

-- Update existing users to 'user' role (or set manually)
UPDATE public.profiles SET role = 'user' WHERE role IS NULL;

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success', 'weather')),
  read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own notifications" ON public.notifications 
FOR ALL USING (auth.uid() = user_id);

-- Admin notifications (global)
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for admin notifications (visible to admins only)
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view admin notifications" ON public.admin_notifications 
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Admin stats views
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin') as admin_count,
  (SELECT COUNT(*) FROM public.crops) as total_crops,
  (SELECT COUNT(*) FROM public.reports) as total_reports,
  (SELECT COUNT(*) FROM public.weather_alerts) as total_alerts,
  (SELECT COUNT(*) FROM public.notifications WHERE NOT read) as unread_notifications,
  (SELECT AVG(EXTRACT(DAYS FROM expected_harvest - NOW())) FROM public.crops WHERE status != 'harvested') as avg_harvest_days;

-- Users view for admin
CREATE OR REPLACE VIEW public.admin_users AS
SELECT 
  u.id, 
  p.full_name, 
  u.email, 
  p.role,
  p.location,
  (SELECT COUNT(*) FROM public.crops WHERE user_id = u.id) as crop_count,
  (SELECT COUNT(*) FROM public.reports WHERE user_id = u.id) as report_count
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;

-- Crops view for admin
CREATE OR REPLACE VIEW public.admin_crops AS
SELECT 
  c.*,
  p.full_name as user_name,
  p.role as user_role
FROM public.crops c
JOIN auth.users u ON c.user_id = u.id
JOIN public.profiles p ON u.id = p.id;

-- Reports view for admin
CREATE OR REPLACE VIEW public.admin_reports AS
SELECT 
  r.*,
  p.full_name as user_name,
  p.role as user_role
FROM public.reports r
JOIN auth.users u ON r.user_id = u.id
JOIN public.profiles p ON u.id = p.id;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
-- Note: Enable realtime on notifications table in Supabase dashboard

-- Function to create admin notification
CREATE OR REPLACE FUNCTION public.create_admin_notification(
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.admin_notifications (title, message, type)
  VALUES (p_title, p_message, p_type)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create user notification
CREATE OR REPLACE FUNCTION public.create_user_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, data)
  VALUES (p_user_id, p_title, p_message, p_type, p_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT '✅ Admin + Notifications schema ready! Create an admin user: UPDATE profiles SET role = ''admin'' WHERE id = (your-admin-user-id);';

