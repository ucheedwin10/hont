-- Create master_profiles table for storing user profile data
CREATE TABLE IF NOT EXISTS public.master_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bio TEXT,
  bio_bullets JSONB DEFAULT '[]'::jsonb,
  achievements_bullets JSONB DEFAULT '[]'::jsonb,
  experience_bullets JSONB DEFAULT '[]'::jsonb,
  goals_bullets JSONB DEFAULT '[]'::jsonb,
  ai_provider_used TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one profile per user
  CONSTRAINT unique_user_profile UNIQUE (user_id)
);

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_master_profiles_user_id ON public.master_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE public.master_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.master_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.master_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.master_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON public.master_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT ALL ON public.master_profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
