-- Add Tony Elumelu Foundation Entrepreneurship Programme
-- Run this in Supabase SQL Editor

-- Delete if exists (to avoid duplicates)
DELETE FROM public.opportunities
WHERE title = 'Tony Elumelu Foundation Entrepreneurship Programme';

-- Insert the opportunity
INSERT INTO public.opportunities (
  title,
  organization,
  type,
  deadline,
  url,
  description,
  requirements,
  questions,
  is_public,
  status,
  education_level,
  work_experience,
  geographic_eligibility,
  field_of_study,
  funding_amount
) VALUES (
  'Tony Elumelu Foundation Entrepreneurship Programme',
  'Tony Elumelu Foundation',
  'grant',
  '2026-03-01',
  'https://www.tonyelumelufoundation.org/teep',
  'The Tony Elumelu Foundation Entrepreneurship Programme (TEEP) is a 10-year, $100 million commitment to identify, train, mentor, and fund 10,000 African entrepreneurs. Selected entrepreneurs receive $5,000 in seed capital, world-class business training, mentorship, and access to a network of African entrepreneurs.',
  '[
    "Must be an African citizen (resident anywhere in the world)",
    "Must be 18 years or older",
    "Business must be based in Africa",
    "Business idea must be less than 3 years old",
    "Must commit to the 12-week training program"
  ]'::jsonb,
  '[
    {
      "id": "tef_q1",
      "question": "Describe your business idea and the problem it solves. What makes your solution unique?",
      "word_limit": 500,
      "required": true
    },
    {
      "id": "tef_q2",
      "question": "Who are your target customers and how will you reach them? Describe your go-to-market strategy.",
      "word_limit": 500,
      "required": true
    },
    {
      "id": "tef_q3",
      "question": "What is your revenue model? How will your business make money and become sustainable?",
      "word_limit": 400,
      "required": true
    },
    {
      "id": "tef_q4",
      "question": "Describe your team. What skills and experience do you bring to execute this business?",
      "word_limit": 300,
      "required": true
    }
  ]'::jsonb,
  true,
  'active',
  'Diploma',
  'No Experience',
  'Africa',
  'Business',
  '$5K-$15K'
);
