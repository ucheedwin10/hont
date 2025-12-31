-- Add jobs and education columns to master_profiles table
-- Jobs stores structured work experience data
-- Education stores structured education history

ALTER TABLE public.master_profiles
ADD COLUMN IF NOT EXISTS jobs JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb;

-- Add comment explaining the structure
COMMENT ON COLUMN public.master_profiles.jobs IS 'Array of job objects: {company, title, location, start_date, end_date, description}';
COMMENT ON COLUMN public.master_profiles.education IS 'Array of education objects: {degree, institution, graduation_year}';
