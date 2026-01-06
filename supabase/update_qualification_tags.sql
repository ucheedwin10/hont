-- Bulk UPDATE script to add qualification tags to all opportunities
-- Run this in Supabase SQL Editor

-- =====================================================
-- MAJOR INTERNATIONAL SCHOLARSHIPS
-- =====================================================

-- Rhodes Scholarship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = 'Fully Funded'
WHERE title = 'Rhodes Scholarship';

-- Fulbright U.S. Student Program
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = 'Fully Funded'
WHERE title = 'Fulbright U.S. Student Program';

-- Gates Cambridge Scholarship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = 'Fully Funded'
WHERE title = 'Gates Cambridge Scholarship';

-- Chevening Scholarship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = '0-2 years',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = 'Fully Funded'
WHERE title = 'Chevening Scholarship';

-- Marshall Scholarship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = 'Fully Funded'
WHERE title = 'Marshall Scholarship';

-- Knight-Hennessy Scholarship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = 'Fully Funded'
WHERE title = 'Knight-Hennessy Scholarship';

-- Schwarzman Scholars
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = 'Fully Funded'
WHERE title = 'Schwarzman Scholars';

-- Yenching Academy Scholarship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = 'Fully Funded'
WHERE title = 'Yenching Academy Scholarship';

-- George J. Mitchell Scholarship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = 'Fully Funded'
WHERE title = 'George J. Mitchell Scholarship';

-- =====================================================
-- U.S. GOVERNMENT & POLICY FELLOWSHIPS
-- =====================================================

-- Boren Fellowship (Graduate)
UPDATE opportunities SET
  education_level = 'Master''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = '$15K+'
WHERE title = 'Boren Fellowship';

-- Boren Scholarship (Undergraduate)
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = '$15K+'
WHERE title = 'Boren Scholarship';

-- Truman Scholarship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = '$15K+'
WHERE title = 'Truman Scholarship';

-- Critical Language Scholarship (CLS)
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = 'Fully Funded'
WHERE title = 'Critical Language Scholarship (CLS)';

-- Pickering Foreign Affairs Fellowship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = 'Fully Funded'
WHERE title = 'Pickering Foreign Affairs Fellowship';

-- Rangel International Affairs Fellowship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = 'Fully Funded'
WHERE title = 'Rangel International Affairs Fellowship';

-- =====================================================
-- STEM & RESEARCH FELLOWSHIPS
-- =====================================================

-- Barry Goldwater Scholarship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'STEM',
  funding_amount = '$5K-$15K'
WHERE title = 'Barry Goldwater Scholarship';

-- NSF Graduate Research Fellowship Program (GRFP)
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'STEM',
  funding_amount = 'Fully Funded'
WHERE title = 'NSF Graduate Research Fellowship Program (GRFP)';

-- Hertz Foundation Graduate Fellowship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'STEM',
  funding_amount = 'Fully Funded'
WHERE title = 'Hertz Foundation Graduate Fellowship';

-- Ford Foundation Fellowship Program
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = '$15K+'
WHERE title = 'Ford Foundation Fellowship Program';

-- Smithsonian Fellowships
UPDATE opportunities SET
  education_level = 'Master''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = '$15K+'
WHERE title = 'Smithsonian Fellowships';

-- =====================================================
-- INTERNATIONAL DEVELOPMENT & WORLD BANK
-- =====================================================

-- Joint Japan/World Bank Graduate Scholarship Program
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = '3-5 years',
  geographic_eligibility = 'Africa',
  field_of_study = 'Any Field',
  funding_amount = 'Fully Funded'
WHERE title = 'Joint Japan/World Bank Graduate Scholarship Program';

-- =====================================================
-- EDUCATION & TEACHING
-- =====================================================

-- James Madison Fellowship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = '0-2 years',
  geographic_eligibility = 'Global',
  field_of_study = 'Arts',
  funding_amount = '$15K+'
WHERE title = 'James Madison Fellowship';

-- Gai Laing Jones Theatre Education Scholarship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Arts',
  funding_amount = '$1K-$5K'
WHERE title = 'Gai Laing Jones Theatre Education Scholarship';

-- =====================================================
-- ARTS & DESIGN SCHOLARSHIPS
-- =====================================================

-- AIGA Worldstudio Scholarships
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Arts',
  funding_amount = '$1K-$5K'
WHERE title = 'AIGA Worldstudio Scholarships';

-- Dedalus Foundation Dissertation Fellowship
UPDATE opportunities SET
  education_level = 'PhD',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Arts',
  funding_amount = '$15K+'
WHERE title = 'Dedalus Foundation Dissertation Fellowship';

-- SOM Foundation Travel & Research Fellowships
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Engineering',
  funding_amount = '$5K-$15K'
WHERE title = 'SOM Foundation Travel & Research Fellowships';

-- John F. and Anna Lee Stacey Scholarship
UPDATE opportunities SET
  education_level = 'Diploma',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Arts',
  funding_amount = '$1K-$5K'
WHERE title = 'John F. and Anna Lee Stacey Scholarship';

-- DAAD Fine Art & Film Scholarships
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Arts',
  funding_amount = 'Fully Funded'
WHERE title = 'DAAD Fine Art & Film Scholarships';

-- Edward F. Albee Foundation Residency
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = '0-2 years',
  geographic_eligibility = 'Global',
  field_of_study = 'Arts',
  funding_amount = '$1K-$5K'
WHERE title = 'Edward F. Albee Foundation Residency';

-- Hart Howerton Summer Fellowship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Engineering',
  funding_amount = '$5K-$15K'
WHERE title = 'Hart Howerton Summer Fellowship';

-- Center for Craft Grants
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = '0-2 years',
  geographic_eligibility = 'Global',
  field_of_study = 'Arts',
  funding_amount = '$1K-$5K'
WHERE title = 'Center for Craft Grants';

-- MacDowell Fellowship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = '0-2 years',
  geographic_eligibility = 'Global',
  field_of_study = 'Arts',
  funding_amount = 'Fully Funded'
WHERE title = 'MacDowell Fellowship';

-- McKnight Artist Fellowships
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = '0-2 years',
  geographic_eligibility = 'Global',
  field_of_study = 'Arts',
  funding_amount = '$15K+'
WHERE title = 'McKnight Artist Fellowships';

-- Ox-Bow Summer Residency Fellowship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Arts',
  funding_amount = 'Fully Funded'
WHERE title = 'Ox-Bow Summer Residency Fellowship';

-- Getty Research Institute Grants
UPDATE opportunities SET
  education_level = 'Master''s',
  work_experience = '0-2 years',
  geographic_eligibility = 'Global',
  field_of_study = 'Arts',
  funding_amount = '$5K-$15K'
WHERE title = 'Getty Research Institute Grants';

-- =====================================================
-- MUSIC SCHOLARSHIPS & FELLOWSHIPS
-- =====================================================

-- ASCAP Foundation Scholarships
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Arts',
  funding_amount = '$1K-$5K'
WHERE title = 'ASCAP Foundation Scholarships';

-- American Musicological Society Fellowships
UPDATE opportunities SET
  education_level = 'Master''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Arts',
  funding_amount = '$5K-$15K'
WHERE title = 'American Musicological Society Fellowships';

-- BMI Foundation Awards
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Arts',
  funding_amount = '$1K-$5K'
WHERE title = 'BMI Foundation Awards';

-- Atlantic Music Festival Fellowship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Arts',
  funding_amount = 'Fully Funded'
WHERE title = 'Atlantic Music Festival Fellowship';

-- Olympic Music Festival Fellowship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Arts',
  funding_amount = '$5K-$15K'
WHERE title = 'Olympic Music Festival Fellowship';

-- =====================================================
-- THEATRE & DANCE FELLOWSHIPS
-- =====================================================

-- ASTR Graduate Student Awards
UPDATE opportunities SET
  education_level = 'Master''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Arts',
  funding_amount = '$1K-$5K'
WHERE title = 'ASTR Graduate Student Awards';

-- Julie Taymor World Theater Fellowship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = '0-2 years',
  geographic_eligibility = 'Global',
  field_of_study = 'Arts',
  funding_amount = '$5K-$15K'
WHERE title = 'Julie Taymor World Theater Fellowship';

-- Pina Bausch Fellowship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = '0-2 years',
  geographic_eligibility = 'Global',
  field_of_study = 'Arts',
  funding_amount = '$15K+'
WHERE title = 'Pina Bausch Fellowship';

-- Tanya Liedtke Fellowship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = '0-2 years',
  geographic_eligibility = 'Global',
  field_of_study = 'Arts',
  funding_amount = '$15K+'
WHERE title = 'Tanya Liedtke Fellowship';

-- =====================================================
-- TECHNOLOGY & GAMING
-- =====================================================

-- AIAS Randy Pausch Scholarship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'STEM',
  funding_amount = '$5K-$15K'
WHERE title = 'AIAS Randy Pausch Scholarship';

-- =====================================================
-- POLITICAL SCIENCE & POLICY
-- =====================================================

-- APSA Diversity Fellowship Program
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = 'Fully Funded'
WHERE title = 'APSA Diversity Fellowship Program';

-- New America Fellowship
UPDATE opportunities SET
  education_level = 'Master''s',
  work_experience = '3-5 years',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = '$15K+'
WHERE title = 'New America Fellowship';

-- =====================================================
-- HUMANITIES & RESEARCH
-- =====================================================

-- Harry Ransom Center Fellowships
UPDATE opportunities SET
  education_level = 'Master''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Arts',
  funding_amount = '$5K-$15K'
WHERE title = 'Harry Ransom Center Fellowships';

-- Huntington Library Fellowships
UPDATE opportunities SET
  education_level = 'Master''s',
  work_experience = '0-2 years',
  geographic_eligibility = 'Global',
  field_of_study = 'Arts',
  funding_amount = '$5K-$15K'
WHERE title = 'Huntington Library Fellowships';

-- =====================================================
-- SOCIAL JUSTICE & HUMAN RIGHTS
-- =====================================================

-- Fisher Center Fellowship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = '$5K-$15K'
WHERE title = 'Fisher Center Fellowship';

-- Humanity in Action Fellowship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = 'Fully Funded'
WHERE title = 'Humanity in Action Fellowship';

-- =====================================================
-- ESSAY CONTESTS & WRITING
-- =====================================================

-- Elie Wiesel Prize in Ethics Essay Contest
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = '$1K-$5K'
WHERE title = 'Elie Wiesel Prize in Ethics Essay Contest';

-- Gay and Lesbian Review Writer Grants
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = '0-2 years',
  geographic_eligibility = 'Global',
  field_of_study = 'Arts',
  funding_amount = '$1K-$5K'
WHERE title = 'Gay and Lesbian Review Writer Grants';

-- =====================================================
-- SERVICE & COMMUNITY GRANTS
-- =====================================================

-- Ella Lyman Cabot Trust Grants
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = '0-2 years',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = '$5K-$15K'
WHERE title = 'Ella Lyman Cabot Trust Grants';

-- =====================================================
-- PEACE & INTERNATIONAL RELATIONS
-- =====================================================

-- Rotary Peace Fellowship
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = '3-5 years',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = 'Fully Funded'
WHERE title = 'Rotary Peace Fellowship';

-- Rotary Club Scholarships
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = '$1K-$5K'
WHERE title = 'Rotary Club Scholarships';

-- =====================================================
-- DIVERSITY & IMMIGRANT SUPPORT
-- =====================================================

-- Paul & Daisy Soros Fellowship for New Americans
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = 'Fully Funded'
WHERE title = 'Paul & Daisy Soros Fellowship for New Americans';

-- AAUW Fellowships and Grants
UPDATE opportunities SET
  education_level = 'Bachelor''s',
  work_experience = 'No Experience',
  geographic_eligibility = 'Global',
  field_of_study = 'Any Field',
  funding_amount = '$15K+'
WHERE title = 'AAUW Fellowships and Grants';

-- =====================================================
-- CATCH-ALL: Update any remaining NULL values with defaults
-- =====================================================

-- Set reasonable defaults for any opportunities not explicitly updated
UPDATE opportunities SET
  education_level = COALESCE(education_level, 'Bachelor''s'),
  work_experience = COALESCE(work_experience, 'No Experience'),
  geographic_eligibility = COALESCE(geographic_eligibility, 'Global'),
  field_of_study = COALESCE(field_of_study, 'Any Field'),
  funding_amount = COALESCE(funding_amount, '$5K-$15K')
WHERE
  education_level IS NULL OR
  work_experience IS NULL OR
  geographic_eligibility IS NULL OR
  field_of_study IS NULL OR
  funding_amount IS NULL;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Run this to verify all opportunities have tags:
-- SELECT title, education_level, work_experience, geographic_eligibility, field_of_study, funding_amount
-- FROM opportunities
-- ORDER BY title;
