import { NextRequest, NextResponse } from 'next/server';
import { generateText, type AIProvider } from '@/lib/ai/service';

const TRIM_PROMPT = `You are an expert editor. Reduce this essay to EXACTLY {{TARGET_WORDS}} words or fewer while:
- Keeping the core message and strongest examples
- Maintaining natural flow and readability
- Preserving specific details and numbers
- Removing redundant phrases and filler words
- Not adding any new content

Current essay ({{CURRENT_WORDS}} words):
{{ESSAY}}

Write ONLY the trimmed essay. No commentary, explanations, or word counts.`;

interface TrimAnswerRequest {
  answer: string;
  targetWords: number;
  provider?: AIProvider;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function POST(request: NextRequest) {
  try {
    const body: TrimAnswerRequest = await request.json();
    const { answer, targetWords, provider } = body;

    if (!answer || typeof answer !== 'string') {
      return NextResponse.json(
        { error: 'answer is required and must be a string' },
        { status: 400 }
      );
    }

    if (!targetWords || typeof targetWords !== 'number' || targetWords < 1) {
      return NextResponse.json(
        { error: 'targetWords is required and must be a positive number' },
        { status: 400 }
      );
    }

    const currentWords = countWords(answer);

    // If already under limit, return as-is
    if (currentWords <= targetWords) {
      return NextResponse.json({
        success: true,
        answer: answer.trim(),
        wordCount: currentWords,
        trimmed: false,
      });
    }

    const prompt = TRIM_PROMPT
      .replace('{{TARGET_WORDS}}', String(targetWords))
      .replace('{{CURRENT_WORDS}}', String(currentWords))
      .replace('{{ESSAY}}', answer);

    const aiConfig = provider ? { provider } : undefined;
    let trimmedAnswer = await generateText(prompt, aiConfig);
    trimmedAnswer = trimmedAnswer.trim();

    let newWordCount = countWords(trimmedAnswer);

    // If still over, try once more with stricter target
    if (newWordCount > targetWords) {
      const stricterTarget = Math.floor(targetWords * 0.95);
      const retryPrompt = TRIM_PROMPT
        .replace('{{TARGET_WORDS}}', String(stricterTarget))
        .replace('{{CURRENT_WORDS}}', String(newWordCount))
        .replace('{{ESSAY}}', trimmedAnswer);

      trimmedAnswer = await generateText(retryPrompt, aiConfig);
      trimmedAnswer = trimmedAnswer.trim();
      newWordCount = countWords(trimmedAnswer);
    }

    return NextResponse.json({
      success: true,
      answer: trimmedAnswer,
      wordCount: newWordCount,
      originalWordCount: currentWords,
      trimmed: true,
      isOverLimit: newWordCount > targetWords,
    });
  } catch (error) {
    console.error('Answer trimming error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
