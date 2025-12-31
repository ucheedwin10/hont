-- Create opportunities table for storing scholarship/grant opportunities
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- null for pre-loaded public opportunities
  title TEXT NOT NULL,
  organization TEXT,
  type TEXT CHECK (type IN ('scholarship', 'fellowship', 'grant', 'other')),
  deadline DATE,
  url TEXT,
  description TEXT,
  requirements JSONB DEFAULT '[]'::jsonb,
  questions JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_opportunities_user_id ON public.opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_is_public ON public.opportunities(is_public);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(status);

-- Enable Row Level Security
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view public opportunities
CREATE POLICY "Anyone can view public opportunities"
  ON public.opportunities
  FOR SELECT
  USING (is_public = true AND status = 'active');

-- Policy: Users can view their own opportunities
CREATE POLICY "Users can view own opportunities"
  ON public.opportunities
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own opportunities
CREATE POLICY "Users can insert own opportunities"
  ON public.opportunities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own opportunities
CREATE POLICY "Users can update own opportunities"
  ON public.opportunities
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own opportunities
CREATE POLICY "Users can delete own opportunities"
  ON public.opportunities
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT ON public.opportunities TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.opportunities TO authenticated;
GRANT SELECT ON public.opportunities TO anon; -- For public opportunities


-- Create user_applications table for tracking user applications to opportunities
CREATE TABLE IF NOT EXISTS public.user_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE NOT NULL,
  answers JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'submitted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Ensure one application per user per opportunity
  CONSTRAINT unique_user_opportunity UNIQUE (user_id, opportunity_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_applications_user_id ON public.user_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_applications_opportunity_id ON public.user_applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_user_applications_status ON public.user_applications(status);

-- Enable Row Level Security
ALTER TABLE public.user_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own applications
CREATE POLICY "Users can view own applications"
  ON public.user_applications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own applications
CREATE POLICY "Users can insert own applications"
  ON public.user_applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own applications
CREATE POLICY "Users can update own applications"
  ON public.user_applications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own applications
CREATE POLICY "Users can delete own applications"
  ON public.user_applications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.user_applications TO authenticated;
