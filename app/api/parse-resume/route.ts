import { NextRequest, NextResponse } from 'next/server';
import { generateText, type AIProvider } from '@/lib/ai/service';

const RESUME_PARSE_PROMPT = `You are extracting structured profile information from a resume.

From the text below, extract:

1. Bio: A compelling professional bio (2-3 sentences) that:
   - Starts with their current role or expertise
   - Highlights their most impressive achievement or quantifiable impact
   - Mentions their key skills or focus area
   - Uses strong, active language
   - Sounds natural and authentic (not generic)

   Example of a great bio:
   "Product management professional leading AI-driven education initiatives across Nigeria. Successfully deployed adaptive learning systems reaching 8M+ students with 25% improvement in engagement. Specializes in bridging technical innovation with social impact."

2. Jobs: Array of positions held with structured data
   Format for each job:
   {
     "company": "Company Name",
     "title": "Job Title",
     "location": "City, Country or Remote",
     "start_date": "Month Year",
     "end_date": "Month Year" or "Present",
     "description": "Brief description of role and key responsibilities"
   }

3. Experience: Array of achievement/impact bullets from work (what we already extract as bullet points)

4. Achievements: Key accomplishments, awards, honors

5. Education: Array of degrees and institutions
   Format for each:
   {
     "degree": "Degree Name (e.g., BS Computer Science)",
     "institution": "University/School Name",
     "graduation_year": "Year" or "Expected Year"
   }

6. Goals: Short future-oriented statements if present

Rules:
- Do not invent information
- Be concise and factual
- Rewrite content clearly without copying verbatim
- If a section is missing, return an empty array for it
- For jobs, extract ALL positions found in the resume
- For education, extract ALL degrees/certifications found

Return the result strictly as valid JSON in this format:

{
  "bio": "",
  "jobs": [],
  "experience": [],
  "achievements": [],
  "education": [],
  "goals": []
}

Resume text:
<<<
{{RESUME_TEXT}}
>>>`;

interface Job {
  company: string;
  title: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
}

interface Education {
  degree: string;
  institution: string;
  graduation_year: string;
}

interface ParsedResume {
  bio: string;
  jobs: Job[];
  experience: string[];
  achievements: string[];
  education: Education[];
  goals: string[];
}

function validateJob(job: unknown): job is Job {
  if (typeof job !== 'object' || job === null) return false;
  const j = job as Record<string, unknown>;
  return (
    typeof j.company === 'string' &&
    typeof j.title === 'string' &&
    typeof j.location === 'string' &&
    typeof j.start_date === 'string' &&
    typeof j.end_date === 'string' &&
    typeof j.description === 'string'
  );
}

function validateEducation(edu: unknown): edu is Education {
  if (typeof edu !== 'object' || edu === null) return false;
  const e = edu as Record<string, unknown>;
  return (
    typeof e.degree === 'string' &&
    typeof e.institution === 'string' &&
    typeof e.graduation_year === 'string'
  );
}

function validateParsedResume(data: unknown): data is ParsedResume {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.bio !== 'string') {
    return false;
  }

  // Validate jobs array
  if (!Array.isArray(obj.jobs) || !obj.jobs.every(validateJob)) {
    // Allow empty or missing jobs - just set to empty array
    obj.jobs = [];
  }

  if (!Array.isArray(obj.achievements) || !obj.achievements.every(item => typeof item === 'string')) {
    return false;
  }

  if (!Array.isArray(obj.experience) || !obj.experience.every(item => typeof item === 'string')) {
    return false;
  }

  // Validate education array
  if (!Array.isArray(obj.education) || !obj.education.every(validateEducation)) {
    // Allow empty or missing education - just set to empty array
    obj.education = [];
  }

  if (!Array.isArray(obj.goals) || !obj.goals.every(item => typeof item === 'string')) {
    return false;
  }

  return true;
}

function extractJSON(text: string): string {
  // Try to find JSON in markdown code blocks first
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // Try to find raw JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  return text;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, provider } = body;

    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json(
        { error: 'resumeText is required and must be a string' },
        { status: 400 }
      );
    }

    if (resumeText.trim().length === 0) {
      return NextResponse.json(
        { error: 'resumeText cannot be empty' },
        { status: 400 }
      );
    }

    // Build the prompt with the resume text
    const prompt = RESUME_PARSE_PROMPT.replace('{{RESUME_TEXT}}', resumeText);

    // Generate text using the AI service
    const aiConfig = provider ? { provider: provider as AIProvider } : undefined;
    const response = await generateText(prompt, aiConfig);

    // Extract and parse JSON from the response
    const jsonString = extractJSON(response);
    let parsedData: unknown;

    try {
      parsedData = JSON.parse(jsonString);
    } catch {
      console.error('Failed to parse AI response as JSON:', response);
      return NextResponse.json(
        { error: 'AI returned invalid JSON response' },
        { status: 500 }
      );
    }

    // Validate the structure
    if (!validateParsedResume(parsedData)) {
      console.error('AI response has invalid structure:', parsedData);
      return NextResponse.json(
        { error: 'AI response does not match expected structure' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error('Resume parsing error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
