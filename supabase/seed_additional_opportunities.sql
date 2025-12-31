-- Additional opportunities seed file
-- Run this after adding the tags column:
-- ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Boren Fellowship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Boren Fellowship',
  'National Security Education Program (NSEP)',
  'fellowship',
  '2026-01-21',
  'For graduate students committed to overseas study of languages critical to national security and public service. Provides funding for language study abroad in regions critical to U.S. interests.',
  ARRAY['fellowship', 'language', 'international', 'graduate', 'national_security'],
  NULL,
  true,
  'active'
);

-- Boren Scholarship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Boren Scholarship',
  'National Security Education Program (NSEP)',
  'scholarship',
  '2026-01-28',
  'For undergraduate students committed to overseas study of languages critical to national security and public service. Provides funding for language study abroad in regions critical to U.S. interests.',
  ARRAY['scholarship', 'language', 'international', 'undergraduate', 'national_security'],
  NULL,
  true,
  'active'
);

-- Truman Fellowship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Truman Scholarship',
  'Harry S. Truman Scholarship Foundation',
  'scholarship',
  '2026-02-03',
  'Supports graduate study for students committed to careers in government, non-profit, or public service. Awards up to $30,000 for graduate study and leadership training.',
  ARRAY['scholarship', 'public_service', 'graduate', 'leadership'],
  NULL,
  true,
  'active'
);

-- James Madison Fellowship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'James Madison Fellowship',
  'James Madison Memorial Fellowship Foundation',
  'fellowship',
  '2026-03-02',
  'Graduate funding for current or future teachers of American history/government committed to teaching the Constitution. Provides up to $24,000 for graduate study.',
  ARRAY['fellowship', 'education', 'history', 'teaching', 'graduate'],
  NULL,
  true,
  'active'
);

-- Marshall Scholarship (already exists, but adding with tags)
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Marshall Scholarship',
  'Marshall Aid Commemoration Commission',
  'scholarship',
  '2025-09-16',
  'Funding to study at institutions in the United Kingdom. Seeks candidates with strong leadership and academic characteristics. Finances up to 50 young Americans of high ability each year.',
  ARRAY['scholarship', 'international', 'graduate', 'uk', 'leadership'],
  NULL,
  true,
  'active'
) ON CONFLICT DO NOTHING;

-- Rhodes Scholarship (already exists, but adding with tags)
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Rhodes Scholarship',
  'Rhodes Trust',
  'scholarship',
  '2025-10-01',
  'Funding to study at the University of Oxford in the United Kingdom. Seeks candidates with strong leadership, academic excellence, and commitment to service.',
  ARRAY['scholarship', 'international', 'graduate', 'uk', 'leadership', 'oxford'],
  NULL,
  true,
  'active'
) ON CONFLICT DO NOTHING;

-- Fulbright U.S. Student Program (already exists, but adding with tags)
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Fulbright U.S. Student Program',
  'U.S. Department of State',
  'fellowship',
  '2025-10-07',
  'For U.S. citizens to design individual study/research projects or teach English abroad. Operates in over 140 countries worldwide.',
  ARRAY['fellowship', 'international', 'research', 'teaching', 'graduate'],
  NULL,
  true,
  'active'
) ON CONFLICT DO NOTHING;

-- Knight-Hennessey Scholarship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Knight-Hennessy Scholarship',
  'Stanford University',
  'scholarship',
  '2025-10-15',
  'Full funding to pursue graduate study (JD, MA, MBA, MD, MFA, or PhD) at Stanford University. Develops a community of future global leaders.',
  ARRAY['scholarship', 'graduate', 'leadership', 'stanford', 'full_funding'],
  NULL,
  true,
  'active'
);

-- Critical Language Scholarship (CLS)
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Critical Language Scholarship (CLS)',
  'U.S. Department of State',
  'scholarship',
  '2025-11-15',
  'Intensive overseas language and cultural immersion program (8–10 weeks) for enrolled U.S. undergraduate and graduate students. Covers all program costs.',
  ARRAY['scholarship', 'language', 'international', 'summer', 'undergraduate', 'graduate'],
  NULL,
  true,
  'active'
);

-- Pickering Foreign Affairs Fellowship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Pickering Foreign Affairs Fellowship',
  'U.S. Department of State',
  'fellowship',
  NULL,
  'Funding for a two-year master''s degree leading to a Foreign Service career. Includes internships, mentoring, and professional development. (2026 cycle postponed)',
  ARRAY['fellowship', 'international', 'policy', 'graduate', 'foreign_service'],
  NULL,
  true,
  'active'
);

-- Rangel International Affairs Fellowship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Rangel International Affairs Fellowship',
  'U.S. Department of State',
  'fellowship',
  NULL,
  'Funding for graduate degrees in international affairs/economics leading to a career as a diplomat. Supports underrepresented groups in the Foreign Service. (2026 cycle postponed)',
  ARRAY['fellowship', 'international', 'policy', 'graduate', 'foreign_service', 'diversity'],
  NULL,
  true,
  'active'
);

-- JJ/WBGSP Scholarship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Joint Japan/World Bank Graduate Scholarship Program',
  'World Bank Group',
  'scholarship',
  '2025-05-23',
  'For nationals of developing countries with 3+ years of development-related experience to pursue a master''s degree in development topics at participating universities.',
  ARRAY['scholarship', 'international', 'development', 'graduate', 'world_bank'],
  NULL,
  true,
  'active'
);

-- AIGA Worldstudio Scholarships
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'AIGA Worldstudio Scholarships',
  'AIGA',
  'scholarship',
  NULL,
  'For students studying photography, illustration, and design. Requires 3.0 GPA. Supports underrepresented and economically disadvantaged students pursuing design careers.',
  ARRAY['scholarship', 'arts', 'design', 'undergraduate', 'graduate'],
  NULL,
  true,
  'active'
);

-- Dedalus Foundation Dissertation Fellowship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Dedalus Foundation Dissertation Fellowship',
  'Dedalus Foundation',
  'fellowship',
  NULL,
  '$25,000 stipend for PhD candidates working on dissertations related to 20th-century painting/sculpture. Nomination only through academic institutions.',
  ARRAY['fellowship', 'arts', 'research', 'graduate', 'art_history'],
  NULL,
  true,
  'active'
);

-- SOM Foundation Awards
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'SOM Foundation Travel & Research Fellowships',
  'Skidmore, Owings & Merrill Foundation',
  'fellowship',
  NULL,
  'Fellowships and residencies for students and recent graduates in Architecture, Urban Design, and Industrial Design. Supports international travel and research.',
  ARRAY['fellowship', 'arts', 'architecture', 'design', 'research'],
  NULL,
  true,
  'active'
);

-- John F. and Anna Lee Stacey Scholarship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'John F. and Anna Lee Stacey Scholarship',
  'National Cowboy & Western Heritage Museum',
  'scholarship',
  NULL,
  'For artists aged 18-35 focusing on classical/conservative traditions including form, color, drawing, and painting. Supports traditional representational art.',
  ARRAY['scholarship', 'arts', 'visual_arts', 'painting'],
  NULL,
  true,
  'active'
);

-- DAAD Scholarships
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'DAAD Fine Art & Film Scholarships',
  'German Academic Exchange Service (DAAD)',
  'scholarship',
  NULL,
  'Opportunities for postgraduate study in Germany in Fine Art, Design, Visual Communication, and Film. Full funding for international study in Germany.',
  ARRAY['scholarship', 'arts', 'international', 'graduate', 'film', 'design', 'germany'],
  NULL,
  true,
  'active'
);

-- Edward F. Albee Foundation
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Edward F. Albee Foundation Residency',
  'Edward F. Albee Foundation',
  'fellowship',
  NULL,
  'Short-term residential fellowship offering space to writers and visual artists for month-long periods at The Barn in Montauk, NY.',
  ARRAY['fellowship', 'arts', 'writing', 'visual_arts', 'residency'],
  NULL,
  true,
  'active'
);

-- Hart Howerton Fellowship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Hart Howerton Summer Fellowship',
  'Hart Howerton',
  'fellowship',
  NULL,
  'Summer fellowship for architecture students including internships in New York or San Francisco and self-designed research projects.',
  ARRAY['fellowship', 'arts', 'architecture', 'summer', 'internship'],
  NULL,
  true,
  'active'
);

-- Center for Craft, Creativity & Design Grants
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Center for Craft Grants',
  'Center for Craft, Creativity & Design',
  'grant',
  NULL,
  'Resources for makers, curators, and scholars to advance the study and practice of craft. Various grant programs available.',
  ARRAY['grant', 'arts', 'craft', 'research'],
  NULL,
  true,
  'active'
);

-- ASCAP Foundation Scholarships
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'ASCAP Foundation Scholarships',
  'ASCAP Foundation',
  'scholarship',
  NULL,
  'Various scholarships ensuring opportunities for the study of music at all levels. Supports composers, songwriters, and music students.',
  ARRAY['scholarship', 'arts', 'music', 'composition'],
  NULL,
  true,
  'active'
);

-- American Musicological Society Fellowships
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'American Musicological Society Fellowships',
  'American Musicological Society',
  'fellowship',
  NULL,
  'Several opportunities for graduate-level musicology students including dissertation fellowships and travel grants.',
  ARRAY['fellowship', 'arts', 'music', 'research', 'graduate'],
  NULL,
  true,
  'active'
);

-- BMI Foundation Scholarships
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'BMI Foundation Awards',
  'BMI Foundation',
  'scholarship',
  NULL,
  'Awards and fellowships for composers, songwriters, and performers. Includes the BMI Student Composer Awards.',
  ARRAY['scholarship', 'arts', 'music', 'composition', 'performance'],
  NULL,
  true,
  'active'
);

-- Atlantic Music Festival Fellowship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Atlantic Music Festival Fellowship',
  'Atlantic Music Festival',
  'fellowship',
  NULL,
  '6-week summer residency covering tuition, housing, and meals for composers, conductors, and performers in Maine.',
  ARRAY['fellowship', 'arts', 'music', 'performance', 'summer', 'residency'],
  NULL,
  true,
  'active'
);

-- Olympic Music Festival Fellowship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Olympic Music Festival Fellowship',
  'Olympic Music Festival',
  'fellowship',
  NULL,
  'Residency for rising musicians (violin, viola, cello, piano) to work with world-class mentors in chamber music.',
  ARRAY['fellowship', 'arts', 'music', 'performance', 'chamber_music'],
  NULL,
  true,
  'active'
);

-- American Society for Theatre Research
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'ASTR Graduate Student Awards',
  'American Society for Theatre Research',
  'fellowship',
  NULL,
  'Supports scholarship in theatre and performance studies. Includes graduate study support, research grants, and mentoring programs.',
  ARRAY['fellowship', 'arts', 'theatre', 'research', 'graduate'],
  NULL,
  true,
  'active'
);

-- Gai Laing Jones Theatre Ed. Scholarship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Gai Laing Jones Theatre Education Scholarship',
  'Educational Theatre Association',
  'scholarship',
  NULL,
  '$2,000 awards for college juniors or seniors working towards a theatre education degree. Supports future theatre educators.',
  ARRAY['scholarship', 'arts', 'theatre', 'education', 'undergraduate'],
  NULL,
  true,
  'active'
);

-- Taymor World Theater Fellowship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Julie Taymor World Theater Fellowship',
  'World Theater Foundation',
  'fellowship',
  NULL,
  'Travel opportunities for young theater directors to immerse themselves in artistic experiences abroad. Supports international artistic development.',
  ARRAY['fellowship', 'arts', 'theatre', 'international', 'directing'],
  NULL,
  true,
  'active'
);

-- Pina Bausch Fellowship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Pina Bausch Fellowship',
  'Pina Bausch Foundation',
  'fellowship',
  NULL,
  'For dancers and choreographers to work cooperatively with established choreographers. Includes travel to Germany and collaborative work.',
  ARRAY['fellowship', 'arts', 'dance', 'choreography', 'international', 'germany'],
  NULL,
  true,
  'active'
);

-- Tanya Liedtke Fellowship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Tanya Liedtke Fellowship',
  'Tanya Liedtke Foundation',
  'fellowship',
  NULL,
  'For dancers and choreographers to complete a dance fellowship in Berlin for a performance project. Supports emerging choreographic voices.',
  ARRAY['fellowship', 'arts', 'dance', 'choreography', 'international', 'berlin'],
  NULL,
  true,
  'active'
);

-- MacDowell Fellowships
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'MacDowell Fellowship',
  'MacDowell',
  'fellowship',
  NULL,
  'Funding for artists in architecture, film, literature, music, theatre, and interdisciplinary arts. Room, board, and studio space provided. Cannot be enrolled in degree program.',
  ARRAY['fellowship', 'arts', 'multidisciplinary', 'residency', 'writing', 'music', 'visual_arts'],
  NULL,
  true,
  'active'
);

-- McKnight Artist Fellowships
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'McKnight Artist Fellowships',
  'McKnight Foundation',
  'fellowship',
  NULL,
  'Up to $25,000 unrestricted support for artists in various fields including ceramics, dance, writing, music, and visual arts. Minnesota-based program.',
  ARRAY['fellowship', 'arts', 'multidisciplinary', 'minnesota'],
  NULL,
  true,
  'active'
);

-- Ox-Bow Residency Fellowship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Ox-Bow Summer Residency Fellowship',
  'Ox-Bow School of Art',
  'fellowship',
  NULL,
  'Fully funded summer opportunity for 12 students to focus on work and meet renowned artists at the Ox-Bow campus in Michigan.',
  ARRAY['fellowship', 'arts', 'visual_arts', 'summer', 'residency'],
  NULL,
  true,
  'active'
);

-- Smithsonian Office of Fellowships
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Smithsonian Fellowships',
  'Smithsonian Institution',
  'fellowship',
  NULL,
  'Competitively awarded to graduate and pre-doctoral students for independent study using Smithsonian collections and facilities across multiple research areas.',
  ARRAY['fellowship', 'research', 'history', 'science', 'graduate'],
  NULL,
  true,
  'active'
);

-- AIAS Randy Pausch Scholarship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'AIAS Randy Pausch Scholarship',
  'Academy of Interactive Arts & Sciences Foundation',
  'scholarship',
  NULL,
  'Supports aspiring game makers in undergraduate or graduate programs. Requires 3.3 GPA. Honors the legacy of Randy Pausch.',
  ARRAY['scholarship', 'technology', 'game_design', 'undergraduate', 'graduate'],
  NULL,
  true,
  'active'
);

-- APSA Diversity Fellows Program
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'APSA Diversity Fellowship Program',
  'American Political Science Association',
  'fellowship',
  NULL,
  'Funding for a Ph.D. in political science for individuals from underrepresented backgrounds. Supports diversity in the discipline.',
  ARRAY['fellowship', 'research', 'political_science', 'graduate', 'diversity'],
  NULL,
  true,
  'active'
);

-- Elie Wiesel Prize in Ethics
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Elie Wiesel Prize in Ethics Essay Contest',
  'Elie Wiesel Foundation for Humanity',
  'other',
  NULL,
  'Essay contest for undergraduate juniors and seniors exploring ethical questions. First prize $5,000, second prize $2,500, third prize $1,500.',
  ARRAY['essay_contest', 'ethics', 'undergraduate', 'writing'],
  NULL,
  true,
  'active'
);

-- Ella Lyman Cabot Grants
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Ella Lyman Cabot Trust Grants',
  'Ella Lyman Cabot Trust',
  'grant',
  NULL,
  'Funds creative projects that serve others in arts, sciences, social service, and education. Supports innovative service-oriented work.',
  ARRAY['grant', 'public_service', 'arts', 'education', 'social_service'],
  NULL,
  true,
  'active'
);

-- Fisher Center Fellowships
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Fisher Center Fellowship',
  'Hobart and William Smith Colleges',
  'fellowship',
  NULL,
  'Research opportunities around issues of race, gender, and class. Supports interdisciplinary research on social justice topics.',
  ARRAY['fellowship', 'research', 'social_justice', 'gender_studies'],
  NULL,
  true,
  'active'
);

-- Harry Ransom Center Fellowship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Harry Ransom Center Fellowships',
  'University of Texas at Austin',
  'fellowship',
  NULL,
  'Short-term and dissertation fellowships for projects using the Ransom Center''s collections in literature, photography, film, art, and performing arts.',
  ARRAY['fellowship', 'research', 'humanities', 'archives', 'graduate'],
  NULL,
  true,
  'active'
);

-- Humanity In Action Fellowship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Humanity in Action Fellowship',
  'Humanity in Action',
  'fellowship',
  NULL,
  'Three-week summer educational program exploring social justice and human rights in cities across Europe and the United States.',
  ARRAY['fellowship', 'human_rights', 'social_justice', 'summer', 'international'],
  NULL,
  true,
  'active'
);

-- Huntington Library Fellowships
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Huntington Library Fellowships',
  'The Huntington Library',
  'fellowship',
  NULL,
  'Fellowships for scholars using the Huntington Library''s holdings in British and American history, literature, art history, and history of science.',
  ARRAY['fellowship', 'research', 'history', 'literature', 'humanities'],
  NULL,
  true,
  'active'
);

-- Gay and Lesbian Review Grants
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Gay and Lesbian Review Writer Grants',
  'Gay and Lesbian Review',
  'grant',
  NULL,
  'Grants to support emerging and unpublished LGBTQ+ writers, thinkers, and scholars. Supports diverse voices in LGBTQ+ discourse.',
  ARRAY['grant', 'writing', 'lgbtq', 'journalism'],
  NULL,
  true,
  'active'
);

-- Getty Research Institute Grants
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Getty Research Institute Grants',
  'Getty Research Institute',
  'grant',
  NULL,
  'Financial support for researchers traveling to use the Getty Research Institute collections in art history and related fields.',
  ARRAY['grant', 'research', 'arts', 'art_history', 'humanities'],
  NULL,
  true,
  'active'
);

-- New America Fellows Program
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'New America Fellowship',
  'New America',
  'fellowship',
  NULL,
  'One-year fellowship investing in journalists, scholars, and analysts generating bold ideas on pressing issues in public policy and media.',
  ARRAY['fellowship', 'policy', 'journalism', 'research', 'media'],
  NULL,
  true,
  'active'
);

-- Rotary Foundation Peace Fellowship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Rotary Peace Fellowship',
  'Rotary Foundation',
  'fellowship',
  NULL,
  'Awards for graduates and professionals to study peace and conflict resolution at one of six Rotary Peace Centers worldwide.',
  ARRAY['fellowship', 'peace_studies', 'international', 'graduate', 'conflict_resolution'],
  NULL,
  true,
  'active'
);

-- Rotary Club Scholarships
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Rotary Club Scholarships',
  'Rotary International',
  'scholarship',
  NULL,
  'Local and district-level funding for undergraduate or graduate study. Varies by Rotary Club. Contact local club for details.',
  ARRAY['scholarship', 'undergraduate', 'graduate', 'local'],
  NULL,
  true,
  'active'
);

-- Gates Cambridge Scholarship (updating with tags if needed)
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Gates Cambridge Scholarship',
  'Gates Cambridge Trust',
  'scholarship',
  '2025-10-16',
  'Full-cost scholarships for outstanding applicants from outside the UK to pursue a postgraduate degree at the University of Cambridge.',
  ARRAY['scholarship', 'international', 'graduate', 'uk', 'cambridge', 'full_funding'],
  NULL,
  true,
  'active'
) ON CONFLICT DO NOTHING;

-- Chevening Scholarship (updating with tags if needed)
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Chevening Scholarship',
  'UK Foreign, Commonwealth & Development Office',
  'scholarship',
  '2025-11-05',
  'UK Government''s global scholarship programme offering full financial support for future leaders to study for a master''s degree at any UK university.',
  ARRAY['scholarship', 'international', 'graduate', 'uk', 'leadership', 'full_funding'],
  NULL,
  true,
  'active'
) ON CONFLICT DO NOTHING;

-- Schwarzman Scholars
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Schwarzman Scholars',
  'Schwarzman Scholars / Tsinghua University',
  'scholarship',
  '2025-09-15',
  'One-year master''s program at Tsinghua University in Beijing designed to prepare future leaders to navigate the geopolitical landscape.',
  ARRAY['scholarship', 'international', 'graduate', 'china', 'leadership', 'full_funding'],
  NULL,
  true,
  'active'
);

-- Yenching Academy Fellowship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Yenching Academy Scholarship',
  'Peking University',
  'scholarship',
  '2025-12-01',
  'Fully-funded master''s program in China Studies at Peking University. Open to international students with outstanding academic credentials.',
  ARRAY['scholarship', 'international', 'graduate', 'china', 'full_funding'],
  NULL,
  true,
  'active'
);

-- Mitchell Scholarship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'George J. Mitchell Scholarship',
  'US-Ireland Alliance',
  'scholarship',
  '2025-09-27',
  'One year of postgraduate study in any discipline at institutions in Ireland. For future American leaders aged 18-30.',
  ARRAY['scholarship', 'international', 'graduate', 'ireland', 'leadership'],
  NULL,
  true,
  'active'
);

-- Soros Fellowship for New Americans
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Paul & Daisy Soros Fellowship for New Americans',
  'Paul & Daisy Soros Fellowships for New Americans',
  'fellowship',
  '2025-10-28',
  'Up to $90,000 for graduate study for immigrants and children of immigrants. Supports New Americans pursuing graduate degrees in any field.',
  ARRAY['fellowship', 'graduate', 'immigrants', 'diversity', 'full_funding'],
  NULL,
  true,
  'active'
);

-- Goldwater Scholarship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Barry Goldwater Scholarship',
  'Barry Goldwater Scholarship Foundation',
  'scholarship',
  '2026-01-24',
  'For college sophomores and juniors pursuing research careers in STEM fields. Awards up to $7,500 annually.',
  ARRAY['scholarship', 'stem', 'undergraduate', 'research'],
  NULL,
  true,
  'active'
);

-- NSF Graduate Research Fellowship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'NSF Graduate Research Fellowship Program (GRFP)',
  'National Science Foundation',
  'fellowship',
  '2025-10-21',
  'Three years of support for graduate students in STEM fields. Provides $37,000 annual stipend and $16,000 cost of education allowance.',
  ARRAY['fellowship', 'stem', 'graduate', 'research', 'science'],
  NULL,
  true,
  'active'
);

-- Hertz Foundation Fellowship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Hertz Foundation Graduate Fellowship',
  'Fannie and John Hertz Foundation',
  'fellowship',
  '2025-10-25',
  'Up to five years of support for PhD students in applied physical and biological sciences, mathematics, and engineering.',
  ARRAY['fellowship', 'stem', 'graduate', 'phd', 'research'],
  NULL,
  true,
  'active'
);

-- Ford Foundation Fellowship
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'Ford Foundation Fellowship Program',
  'Ford Foundation / National Academies',
  'fellowship',
  '2025-12-05',
  'Predoctoral, dissertation, and postdoctoral fellowships for PhD students committed to diversity in academia.',
  ARRAY['fellowship', 'graduate', 'phd', 'diversity', 'research'],
  NULL,
  true,
  'active'
);

-- AAUW Fellowships
INSERT INTO public.opportunities (
  title, organization, type, deadline, description, tags, questions, is_public, status
) VALUES (
  'AAUW Fellowships and Grants',
  'American Association of University Women',
  'fellowship',
  '2025-11-15',
  'Various fellowships for women pursuing graduate and postdoctoral study. International fellowships also available for non-U.S. women.',
  ARRAY['fellowship', 'graduate', 'women', 'diversity', 'international'],
  NULL,
  true,
  'active'
);
