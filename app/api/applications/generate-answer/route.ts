import { NextRequest, NextResponse } from 'next/server';
import { generateText, type AIProvider } from '@/lib/ai/service';

interface PromptContext {
  wordLimit: number | null;
  questionNumber?: number;
  totalQuestions?: number;
  previousAnswerSummaries?: string[];
}

function getAnswerGenerationPrompt(context: PromptContext): string {
  const { wordLimit, questionNumber, totalQuestions, previousAnswerSummaries } = context;
  const targetWords = wordLimit ? Math.floor(wordLimit * 0.95) : null;

  const limitInstructions = wordLimit
    ? `
STRICT WORD LIMIT: ${wordLimit} words MAXIMUM (CRITICAL - DO NOT EXCEED)
- Target: ${targetWords} words (95% of limit)
- This is NOT a suggestion - exceeding this limit will disqualify your application
- Count your words mentally as you write
- Better to be slightly under than over
- Every sentence must earn its place - be concise and impactful`
    : `
LENGTH: Write a focused, well-developed response (approximately 300-500 words)`;

  const questionContext = questionNumber && totalQuestions
    ? `\nYou are writing answer ${questionNumber} of ${totalQuestions} for this application.`
    : '';

  const diversityInstructions = previousAnswerSummaries && previousAnswerSummaries.length > 0
    ? `
CRITICAL - AVOID REPETITION:
You have already written ${previousAnswerSummaries.length} answer(s) for this application.
Examples/achievements already used (DO NOT repeat these):
${previousAnswerSummaries.map((summary, i) => `Answer ${i + 1}: ${summary}`).join('\n')}

For THIS answer, you MUST:
- Choose DIFFERENT experiences/achievements from the profile
- Highlight DIFFERENT skills or qualities
- Use FRESH examples that haven't been mentioned yet
- If the profile has limited experiences, approach the same experience from a completely different angle`
    : '';

  return `You are a professional scholarship essay writer helping a candidate apply for competitive opportunities.${questionContext}

USER'S PROFILE:
Bio: {{BIO}}

Work Experience:
{{JOBS}}

Experience Highlights:
{{EXPERIENCE}}

Achievements:
{{ACHIEVEMENTS}}

Education:
{{EDUCATION}}

Goals:
{{GOALS}}

OPPORTUNITY CONTEXT:
- Organization: {{ORGANIZATION}}
- Program: {{PROGRAM_TITLE}}
- Description: {{PROGRAM_DESCRIPTION}}

QUESTION TO ANSWER:
{{QUESTION}}
${limitInstructions}
${diversityInstructions}

QUALITY GUIDELINES:
- Select the MOST RELEVANT experience for THIS specific question
- Be specific - use concrete examples from the profile with numbers and details
- Be authentic - write like a real person, not generic AI text
- Be direct - answer the exact question asked
- Be impactful - lead with your strongest point
- Use active voice and strong verbs
- Avoid clichés ("passion for," "ever since I was young," "unique opportunity")
- Show, don't tell - demonstrate qualities through specific achievements

STRUCTURE:
1. Opening hook (1-2 sentences) - grab attention immediately
2. Specific example with concrete details (main body)
3. Impact and lessons learned
4. Connection to future goals and this opportunity

Write ONLY the essay response in first person. Do NOT include:
- Any preamble or introduction about what you're writing
- Meta-commentary like "Here is my response"
- Word count annotations
- Any text outside the actual essay`;
}

const TRIM_PROMPT = `You are an expert editor. Your task is CRITICAL: reduce this essay to {{TARGET_WORDS}} words or fewer.

CURRENT: {{CURRENT_WORDS}} words
TARGET: {{TARGET_WORDS}} words maximum (MUST NOT EXCEED)

TRIMMING RULES:
- Remove redundant phrases and filler words
- Combine sentences where possible
- Cut weaker examples, keep the strongest 1-2
- Remove unnecessary adjectives and adverbs
- Keep specific numbers and concrete details
- Maintain the opening hook and conclusion
- Preserve natural flow

ESSAY TO TRIM:
{{ESSAY}}

Write ONLY the trimmed essay. Count carefully - you MUST be at or under {{TARGET_WORDS}} words.`;

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

interface GenerateAnswerRequest {
  question: string;
  wordLimit?: number | null;
  questionNumber?: number;
  totalQuestions?: number;
  previousAnswerSummaries?: string[];
  profile: {
    bio: string | null;
    jobs?: Job[];
    achievements: string[];
    experience: string[];
    education?: Education[];
    goals: string[];
  };
  opportunity: {
    title: string;
    organization: string | null;
    description: string | null;
  };
  provider?: AIProvider;
}

function formatBulletPoints(items: string[]): string {
  if (!items || items.length === 0) return 'Not provided';
  return items.map(item => `- ${item}`).join('\n');
}

function formatJobs(jobs: Job[] | undefined): string {
  if (!jobs || jobs.length === 0) return 'Not provided';
  return jobs.map(job => {
    const parts = [
      `- ${job.title} at ${job.company}`,
      job.location ? ` (${job.location})` : '',
      ` | ${job.start_date} - ${job.end_date}`,
    ];
    const header = parts.join('');
    return job.description ? `${header}\n  ${job.description}` : header;
  }).join('\n');
}

function formatEducation(education: Education[] | undefined): string {
  if (!education || education.length === 0) return 'Not provided';
  return education.map(edu => {
    const yearPart = edu.graduation_year ? ` (${edu.graduation_year})` : '';
    return `- ${edu.degree} from ${edu.institution}${yearPart}`;
  }).join('\n');
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

async function trimEssay(
  essay: string,
  targetWords: number,
  provider?: AIProvider
): Promise<string> {
  const currentWords = countWords(essay);

  const prompt = TRIM_PROMPT
    .replace('{{TARGET_WORDS}}', String(targetWords))
    .replace('{{CURRENT_WORDS}}', String(currentWords))
    .replace('{{ESSAY}}', essay);

  const aiConfig = provider ? { provider } : undefined;
  const trimmed = await generateText(prompt, aiConfig);

  return trimmed.trim();
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateAnswerRequest = await request.json();
    const {
      question,
      wordLimit,
      questionNumber,
      totalQuestions,
      previousAnswerSummaries,
      profile,
      opportunity,
      provider
    } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'question is required and must be a string' },
        { status: 400 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'profile is required' },
        { status: 400 }
      );
    }

    console.log(`Generating answer ${questionNumber || '?'}/${totalQuestions || '?'}, previous answers: ${previousAnswerSummaries?.length || 0}`);

    // Build the prompt with context for diversity
    const promptContext: PromptContext = {
      wordLimit: wordLimit || null,
      questionNumber,
      totalQuestions,
      previousAnswerSummaries
    };
    const promptTemplate = getAnswerGenerationPrompt(promptContext);
    const prompt = promptTemplate
      .replace('{{BIO}}', profile.bio || 'Not provided')
      .replace('{{JOBS}}', formatJobs(profile.jobs))
      .replace('{{EXPERIENCE}}', formatBulletPoints(profile.experience || []))
      .replace('{{ACHIEVEMENTS}}', formatBulletPoints(profile.achievements || []))
      .replace('{{EDUCATION}}', formatEducation(profile.education))
      .replace('{{GOALS}}', formatBulletPoints(profile.goals || []))
      .replace('{{ORGANIZATION}}', opportunity?.organization || 'Not specified')
      .replace('{{PROGRAM_TITLE}}', opportunity?.title || 'Not specified')
      .replace('{{PROGRAM_DESCRIPTION}}', opportunity?.description || 'Not provided')
      .replace('{{QUESTION}}', question);

    // Generate text using the AI service
    const aiConfig = provider ? { provider } : undefined;
    let answer = await generateText(prompt, aiConfig);
    answer = answer.trim();

    let wordCount = countWords(answer);
    let trimAttempts = 0;
    const maxTrimAttempts = 2;

    // If over word limit, attempt to trim
    if (wordLimit && wordCount > wordLimit) {
      while (wordCount > wordLimit && trimAttempts < maxTrimAttempts) {
        trimAttempts++;
        console.log(`Answer over limit (${wordCount}/${wordLimit}), trimming attempt ${trimAttempts}...`);

        answer = await trimEssay(answer, wordLimit, provider);
        wordCount = countWords(answer);
      }
    }

    return NextResponse.json({
      success: true,
      answer,
      wordCount,
      wordLimit: wordLimit || null,
      isOverLimit: wordLimit ? wordCount > wordLimit : false,
      trimAttempts,
    });
  } catch (error) {
    console.error('Answer generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
