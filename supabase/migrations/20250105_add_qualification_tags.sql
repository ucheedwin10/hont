-- Add qualification tag columns to opportunities table
-- These help users filter scholarships by eligibility criteria

ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS education_level TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS work_experience TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS geographic_eligibility TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS field_of_study TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS funding_amount TEXT;

-- Add check constraints to ensure valid values
ALTER TABLE opportunities ADD CONSTRAINT check_education_level
  CHECK (education_level IS NULL OR education_level IN ('O-Level', 'Diploma', 'Bachelor''s', 'Master''s', 'PhD'));

ALTER TABLE opportunities ADD CONSTRAINT check_work_experience
  CHECK (work_experience IS NULL OR work_experience IN ('No Experience', '0-2 years', '3-5 years', '5+ years'));

ALTER TABLE opportunities ADD CONSTRAINT check_geographic_eligibility
  CHECK (geographic_eligibility IS NULL OR geographic_eligibility IN ('Nigeria Only', 'West Africa', 'Africa', 'Global'));

ALTER TABLE opportunities ADD CONSTRAINT check_field_of_study
  CHECK (field_of_study IS NULL OR field_of_study IN ('Any Field', 'STEM', 'Business', 'Arts', 'Engineering'));

ALTER TABLE opportunities ADD CONSTRAINT check_funding_amount
  CHECK (funding_amount IS NULL OR funding_amount IN ('$1K-$5K', '$5K-$15K', '$15K+', 'Fully Funded'));

-- Add indexes for filtering performance
CREATE INDEX IF NOT EXISTS idx_opportunities_education_level ON opportunities(education_level);
CREATE INDEX IF NOT EXISTS idx_opportunities_geographic_eligibility ON opportunities(geographic_eligibility);
CREATE INDEX IF NOT EXISTS idx_opportunities_funding_amount ON opportunities(funding_amount);

-- Comment on columns for documentation
COMMENT ON COLUMN opportunities.education_level IS 'Minimum education level required: O-Level, Diploma, Bachelor''s, Master''s, PhD';
COMMENT ON COLUMN opportunities.work_experience IS 'Work experience requirement: No Experience, 0-2 years, 3-5 years, 5+ years';
COMMENT ON COLUMN opportunities.geographic_eligibility IS 'Geographic eligibility: Nigeria Only, West Africa, Africa, Global';
COMMENT ON COLUMN opportunities.field_of_study IS 'Field of study requirement: Any Field, STEM, Business, Arts, Engineering';
COMMENT ON COLUMN opportunities.funding_amount IS 'Funding amount range: $1K-$5K, $5K-$15K, $15K+, Fully Funded';
