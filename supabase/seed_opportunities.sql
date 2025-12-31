-- Seed file for pre-loaded public opportunities
-- Run this after the migrations to populate initial scholarship data

-- Rhodes Scholarship
INSERT INTO public.opportunities (
  id,
  user_id,
  title,
  organization,
  type,
  deadline,
  url,
  description,
  requirements,
  questions,
  is_public,
  status
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  NULL, -- public opportunity
  'Rhodes Scholarship',
  'Rhodes Trust',
  'scholarship',
  '2025-10-15',
  'https://www.rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship/',
  'The Rhodes Scholarship is the oldest and most prestigious international scholarship program, enabling outstanding young people from around the world to study at the University of Oxford. Rhodes Scholars are chosen for their intellect, character, leadership, and commitment to service.',
  '[
    "Must be a citizen of a Rhodes-eligible country",
    "Age 18-24 at time of application",
    "Completed undergraduate degree by October of year of study",
    "Demonstrated academic excellence",
    "Strong leadership potential"
  ]'::jsonb,
  '[
    {
      "id": "rhodes_q1",
      "question": "Why do you want to study at Oxford, and how will the course you have chosen help you achieve your goals?",
      "word_limit": 500,
      "required": true
    },
    {
      "id": "rhodes_q2",
      "question": "Describe an experience that demonstrates your leadership ability and potential for impact.",
      "word_limit": 750,
      "required": true
    },
    {
      "id": "rhodes_q3",
      "question": "How do you plan to use your education to make a positive difference in the world?",
      "word_limit": 500,
      "required": true
    }
  ]'::jsonb,
  true,
  'active'
);

-- Fulbright Scholarship
INSERT INTO public.opportunities (
  id,
  user_id,
  title,
  organization,
  type,
  deadline,
  url,
  description,
  requirements,
  questions,
  is_public,
  status
) VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f23456789012',
  NULL,
  'Fulbright U.S. Student Program',
  'U.S. Department of State',
  'fellowship',
  '2025-10-08',
  'https://us.fulbrightonline.org/',
  'The Fulbright U.S. Student Program provides grants for individually designed study/research projects or for English Teaching Assistant Programs. The program operates in over 140 countries and is designed to increase mutual understanding between the people of the United States and other countries.',
  '[
    "U.S. citizenship required",
    "Bachelor''s degree by start of grant",
    "Proficiency in host country language (varies by country)",
    "Good health",
    "Strong academic record"
  ]'::jsonb,
  '[
    {
      "id": "fulbright_q1",
      "question": "Statement of Grant Purpose: Describe your proposed study, research, or teaching project, including its objectives, methodology, and significance.",
      "word_limit": 700,
      "required": true
    },
    {
      "id": "fulbright_q2",
      "question": "Personal Statement: Describe your background, interests, and goals. How have your experiences prepared you for this grant?",
      "word_limit": 500,
      "required": true
    },
    {
      "id": "fulbright_q3",
      "question": "Why have you chosen this particular country for your Fulbright experience?",
      "word_limit": 300,
      "required": true
    }
  ]'::jsonb,
  true,
  'active'
);

-- Gates Cambridge Scholarship
INSERT INTO public.opportunities (
  id,
  user_id,
  title,
  organization,
  type,
  deadline,
  url,
  description,
  requirements,
  questions,
  is_public,
  status
) VALUES (
  'c3d4e5f6-a7b8-9012-cdef-345678901234',
  NULL,
  'Gates Cambridge Scholarship',
  'Gates Cambridge Trust',
  'scholarship',
  '2025-10-16',
  'https://www.gatescambridge.org/',
  'Gates Cambridge Scholarships are prestigious, highly competitive full-cost scholarships awarded to outstanding applicants from countries outside the UK to pursue a full-time postgraduate degree in any subject at the University of Cambridge.',
  '[
    "Citizen of any country outside the UK",
    "Applying for a full-time residential course at Cambridge",
    "Outstanding intellectual ability",
    "Leadership capacity",
    "Commitment to improving the lives of others"
  ]'::jsonb,
  '[
    {
      "id": "gates_q1",
      "question": "Describe a significant experience that shaped who you are today and how it relates to your future goals.",
      "word_limit": 500,
      "required": true
    },
    {
      "id": "gates_q2",
      "question": "How do you plan to use your Cambridge education to make a positive impact on society?",
      "word_limit": 500,
      "required": true
    },
    {
      "id": "gates_q3",
      "question": "Describe your leadership experience and how you have worked to improve the lives of others.",
      "word_limit": 500,
      "required": true
    }
  ]'::jsonb,
  true,
  'active'
);

-- Chevening Scholarship
INSERT INTO public.opportunities (
  id,
  user_id,
  title,
  organization,
  type,
  deadline,
  url,
  description,
  requirements,
  questions,
  is_public,
  status
) VALUES (
  'd4e5f6a7-b8c9-0123-defa-456789012345',
  NULL,
  'Chevening Scholarship',
  'UK Foreign, Commonwealth & Development Office',
  'scholarship',
  '2025-11-05',
  'https://www.chevening.org/',
  'Chevening Scholarships are the UK Government''s global scholarship programme, funded by the Foreign, Commonwealth and Development Office. The programme offers full financial support for future leaders to study for any eligible master''s degree at any UK university.',
  '[
    "Citizen of a Chevening-eligible country",
    "Return to home country for at least two years after scholarship",
    "Minimum 2 years work experience",
    "Bachelor''s degree or equivalent",
    "Meet English language requirement"
  ]'::jsonb,
  '[
    {
      "id": "chevening_q1",
      "question": "Leadership and Influence: Describe your leadership experience. How have you influenced and inspired others?",
      "word_limit": 500,
      "required": true
    },
    {
      "id": "chevening_q2",
      "question": "Networking: Explain the importance of building a network. How do you plan to build and maintain your network during and after Chevening?",
      "word_limit": 500,
      "required": true
    },
    {
      "id": "chevening_q3",
      "question": "Career Plan: Describe your career plan and how Chevening will help you achieve your goals.",
      "word_limit": 500,
      "required": true
    },
    {
      "id": "chevening_q4",
      "question": "Studying in the UK: Why do you want to study in the UK? Why have you chosen these specific courses and universities?",
      "word_limit": 500,
      "required": true
    }
  ]'::jsonb,
  true,
  'active'
);

-- Marshall Scholarship
INSERT INTO public.opportunities (
  id,
  user_id,
  title,
  organization,
  type,
  deadline,
  url,
  description,
  requirements,
  questions,
  is_public,
  status
) VALUES (
  'e5f6a7b8-c9d0-1234-efab-567890123456',
  NULL,
  'Marshall Scholarship',
  'Marshall Aid Commemoration Commission',
  'scholarship',
  '2025-09-30',
  'https://www.marshallscholarship.org/',
  'Marshall Scholarships finance young Americans of high ability to study for a graduate degree in the United Kingdom. Up to fifty Scholars are selected each year to study at any UK university in any field of study.',
  '[
    "U.S. citizen",
    "Bachelor''s degree from accredited U.S. college/university",
    "GPA of 3.7 or higher",
    "Graduated within 2 years of start of scholarship",
    "Have not already studied for a UK degree"
  ]'::jsonb,
  '[
    {
      "id": "marshall_q1",
      "question": "Personal Statement: Discuss your academic interests and career goals. Why do you want to study in the UK?",
      "word_limit": 1000,
      "required": true
    },
    {
      "id": "marshall_q2",
      "question": "Proposed Academic Programme: Describe your proposed course of study and how it relates to your future goals.",
      "word_limit": 500,
      "required": true
    },
    {
      "id": "marshall_q3",
      "question": "What do you see as the most pressing challenges facing your generation, and how do you plan to address them?",
      "word_limit": 500,
      "required": true
    }
  ]'::jsonb,
  true,
  'active'
);
