-- WARNING: This schema is for context only and is not meant to be run.
-- Run these SQL commands in your Supabase SQL editor

-- 1. Create admin_users table to manage admin access
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role character varying NOT NULL DEFAULT 'admin',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  CONSTRAINT admin_users_pkey PRIMARY KEY (id),
  CONSTRAINT admin_users_user_id_key UNIQUE (user_id)
);

-- 2. Enable RLS (Row Level Security) on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Create policy to allow authenticated users to read their own admin status
CREATE POLICY "Users can view own admin status" ON public.admin_users
  FOR SELECT USING (auth.uid() = user_id);

-- 4. Create policy to allow service role to manage admin users (avoid recursion)
CREATE POLICY "Service role can manage admin users" ON public.admin_users
  FOR ALL USING (auth.role() = 'service_role');

-- 5. Alternative: Temporarily disable RLS for initial setup
-- You can re-enable it later after creating your first admin
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- 5. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_users TO authenticated;
-- Note: No sequence needed for UUID primary keys

-- 6. Create function to add first admin (run this once to create your first admin)
-- Replace 'your-email@example.com' with your actual email
-- You'll need to sign up with this email first through Supabase Auth

/*
-- First, create a user account through your app or Supabase Auth UI
-- Then run this to make them an admin:

INSERT INTO public.admin_users (user_id, role, created_at)
SELECT 
  id,
  'admin',
  now()
FROM auth.users 
WHERE email = 'your-email@example.com'
ON CONFLICT (user_id) DO NOTHING;
*/

-- 7. Optional: Create a view for easier admin management
CREATE OR REPLACE VIEW admin_users_with_details AS
SELECT 
  au.id,
  au.user_id,
  au.role,
  au.created_at,
  au.updated_at,
  u.email,
  u.created_at as user_created_at,
  u.last_sign_in_at
FROM public.admin_users au
JOIN auth.users u ON au.user_id = u.id;

-- Grant permissions on the view
GRANT SELECT ON admin_users_with_details TO authenticated;

-- 8. Optional: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);
