import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: NextRequest) {
  try {
    const { questionsText } = await req.json();

    if (!questionsText || typeof questionsText !== 'string') {
      return NextResponse.json(
        { error: 'Questions text is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: 'cclaude-sonnet-4-6',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `Parse these application questions into a structured format.

INPUT TEXT:
${questionsText}

RULES FOR IDENTIFYING QUESTIONS:
- Look for text ending with "?"
- Look for numbered items (1., 2., Q1, Q2, etc.)
- Look for prompts even WITHOUT "?" - these are common patterns:
  * "Describe your..."
  * "Explain why..."
  * "Tell us about..."
  * "Share your..."
  * "What are your..."
  * "How would you..."
  * "Why do you..."
  * "Discuss..."
- Each distinct prompt/question should be extracted separately
- Be THOROUGH - extract ALL questions found, even if they seem similar

WORD LIMIT DETECTION:
- Look for patterns like: (100-150 Words), (500 words), [Word Limit: 300], "max 500", "500-word", "up to 300 words", "minimum 200 words"
- If a range is given (e.g., "100-150 words"), use the HIGHER number
- If character limit is given instead, divide by 5 to estimate word limit
- If NO word limit is specified, DEFAULT to 500 words

Return a JSON array in this EXACT format:
[
  {
    "id": "q1",
    "question": "What are your motivations to apply for this program? (100-150 Words)",
    "word_limit": 150,
    "required": true
  },
  {
    "id": "q2",
    "question": "How would your community benefit from your participation after this program?",
    "word_limit": 500,
    "required": true
  }
]

CRITICAL RULES:
- Generate unique IDs (q1, q2, q3, etc.)
- KEEP the word limit info in the question text if present (for user reference)
- If no word limit specified, set word_limit to 500 (not null)
- Assume all questions are required unless explicitly marked optional
- Clean up extra whitespace but preserve the question wording
- Skip pure instructions/headers that aren't actual questions
- Return ONLY the valid JSON array, no markdown code blocks, no explanation`
        }
      ]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Extract JSON from response
    let jsonText = content.text.trim();
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    }
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const questions = JSON.parse(jsonText);

    // Validate structure
    if (!Array.isArray(questions)) {
      throw new Error('Expected array of questions');
    }

    // Ensure each question has required fields and filter out empty questions
    const validatedQuestions = questions
      .filter((q: { question?: string }) => q.question && q.question.trim().length > 0)
      .map((q: { id?: string; question?: string; word_limit?: number; required?: boolean }, index: number) => ({
        id: q.id || `q${index + 1}`,
        question: (q.question || '').trim(),
        word_limit: typeof q.word_limit === 'number' && q.word_limit > 0 ? q.word_limit : 500,
        required: q.required !== false
      }));

    if (validatedQuestions.length === 0) {
      return NextResponse.json(
        { error: 'No valid questions found. Please check the format and try again.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      questions: validatedQuestions
    });
  } catch (error) {
    console.error('Parse questions error:', error);
    const message = error instanceof Error ? error.message : 'Failed to parse questions';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
