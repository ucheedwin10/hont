import { NextRequest, NextResponse } from 'next/server';
import { generateText, type AIProvider } from '@/lib/ai/service';

const OPPORTUNITY_PARSE_PROMPT = `You are extracting structured information from a scholarship, fellowship, or grant opportunity.

From the text below, extract the following information:
- title: The name of the scholarship/fellowship/grant
- organization: The organization offering this opportunity
- type: One of "scholarship", "fellowship", "grant", or "other"
- deadline: The application deadline in YYYY-MM-DD format (if mentioned, otherwise null)
- description: A 2-3 sentence summary of what this opportunity offers
- requirements: An array of eligibility requirements (bullet points)
- questions: An array of application questions/essay prompts with their word limits

Rules:
- Do not invent information - only extract what is explicitly stated
- For questions, extract the exact question text and any word/character limits mentioned
- If a word limit is not specified for a question, set word_limit to null
- Generate a unique ID for each question using the format: "q1", "q2", etc.
- Mark all extracted questions as required: true unless explicitly stated as optional

Return the result strictly as valid JSON in this format:

{
  "title": "",
  "organization": "",
  "type": "scholarship",
  "deadline": "2025-12-31",
  "description": "",
  "requirements": [],
  "questions": [
    {
      "id": "q1",
      "question": "The essay prompt text here",
      "word_limit": 500,
      "required": true
    }
  ]
}

Opportunity text:
<<<
{{OPPORTUNITY_TEXT}}
>>>`;

interface ParsedQuestion {
  id: string;
  question: string;
  word_limit: number | null;
  required: boolean;
}

interface ParsedOpportunity {
  title: string;
  organization: string;
  type: 'scholarship' | 'fellowship' | 'grant' | 'other';
  deadline: string | null;
  description: string;
  requirements: string[];
  questions: ParsedQuestion[];
}

function validateParsedOpportunity(data: unknown): data is ParsedOpportunity {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.title !== 'string') {
    return false;
  }

  if (typeof obj.organization !== 'string') {
    return false;
  }

  const validTypes = ['scholarship', 'fellowship', 'grant', 'other'];
  if (!validTypes.includes(obj.type as string)) {
    return false;
  }

  if (obj.deadline !== null && typeof obj.deadline !== 'string') {
    return false;
  }

  if (typeof obj.description !== 'string') {
    return false;
  }

  if (!Array.isArray(obj.requirements) || !obj.requirements.every(item => typeof item === 'string')) {
    return false;
  }

  if (!Array.isArray(obj.questions)) {
    return false;
  }

  for (const q of obj.questions) {
    if (typeof q !== 'object' || q === null) {
      return false;
    }
    const question = q as Record<string, unknown>;
    if (typeof question.id !== 'string') {
      return false;
    }
    if (typeof question.question !== 'string') {
      return false;
    }
    if (question.word_limit !== null && typeof question.word_limit !== 'number') {
      return false;
    }
    if (typeof question.required !== 'boolean') {
      return false;
    }
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
    const { text, provider } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'text is required and must be a string' },
        { status: 400 }
      );
    }

    if (text.trim().length === 0) {
      return NextResponse.json(
        { error: 'text cannot be empty' },
        { status: 400 }
      );
    }

    // Build the prompt with the opportunity text
    const prompt = OPPORTUNITY_PARSE_PROMPT.replace('{{OPPORTUNITY_TEXT}}', text);

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
    if (!validateParsedOpportunity(parsedData)) {
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
    console.error('Opportunity parsing error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
