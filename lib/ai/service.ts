import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

export type AIProvider = 'gemini' | 'claude' | 'openai';

export interface AIConfig {
  provider: AIProvider;
  model?: string;
}

const DEFAULT_MODELS = {
  gemini: 'gemini-1.5-flash',  // Free tier model
  claude: 'claude-sonnet-4-20250514',
  openai: 'gpt-4o-mini',
} as const;

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry<T>(
  fn: () => Promise<T>,
  provider: string
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const isRateLimitError =
        lastError.message?.includes('rate') ||
        lastError.message?.includes('429') ||
        lastError.message?.includes('quota');

      if (!isRateLimitError || attempt === MAX_RETRIES - 1) {
        throw lastError;
      }

      const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
      console.log(`[${provider}] Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
      await sleep(delay);
    }
  }

  throw lastError;
}

async function generateWithGemini(prompt: string, model?: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Debug: Log API key status (first 10 chars only for security)
  if (apiKey) {
    console.log(`[Gemini] API Key loaded: ${apiKey.substring(0, 10)}...`);
  } else {
    console.error('[Gemini] ERROR: GEMINI_API_KEY is not set in environment');
    throw new Error('GEMINI_API_KEY is not configured. Set GEMINI_API_KEY in your environment variables, or try using Claude by setting AI_MODEL_PROVIDER=claude');
  }

  const modelName = model || DEFAULT_MODELS.gemini;
  console.log(`[Gemini] Initializing GoogleGenerativeAI client...`);

  try {
    // Initialize the client
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log(`[Gemini] Getting model: ${modelName}`);

    // Get the model
    const geminiModel = genAI.getGenerativeModel({ model: modelName });
    console.log(`[Gemini] Model initialized, sending request...`);

    // Generate content
    const result = await geminiModel.generateContent(prompt);
    console.log(`[Gemini] Received result, extracting response...`);

    const response = result.response;
    const text = response.text();

    if (!text) {
      console.error('[Gemini] ERROR: Empty response received');
      throw new Error('Gemini returned empty response');
    }

    console.log(`[Gemini] Success! Response length: ${text.length} chars`);
    return text;
  } catch (error) {
    const err = error as Error;
    console.error('[Gemini] API Error:', err.message);
    console.error('[Gemini] Full error:', JSON.stringify(err, null, 2));

    // Provide helpful error messages for common issues
    if (err.message?.includes('404') || err.message?.includes('not found')) {
      throw new Error(`Gemini model "${modelName}" not found. Try 'gemini-1.5-flash' (free tier) or set AI_MODEL_PROVIDER=claude`);
    }
    if (err.message?.includes('API key') || err.message?.includes('API_KEY')) {
      throw new Error('Invalid Gemini API key. Check your GEMINI_API_KEY is correct, or try using Claude by setting AI_MODEL_PROVIDER=claude');
    }
    if (err.message?.includes('quota') || err.message?.includes('rate')) {
      throw new Error('Gemini API quota exceeded. Please try again later or use Claude by setting AI_MODEL_PROVIDER=claude');
    }

    throw new Error(`Gemini API failed: ${err.message}. Try setting AI_MODEL_PROVIDER=claude as a fallback.`);
  }
}

async function generateWithClaude(prompt: string, model?: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const anthropic = new Anthropic({ apiKey });
  const modelName = model || DEFAULT_MODELS.claude;

  console.log(`[Claude] Using model: ${modelName}`);

  return withRetry(async () => {
    const message = await anthropic.messages.create({
      model: modelName,
      max_tokens: 4096,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Claude returned non-text response');
    }

    return content.text;
  }, 'Claude');
}

async function generateWithOpenAI(prompt: string, model?: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const openai = new OpenAI({ apiKey });
  const modelName = model || DEFAULT_MODELS.openai;

  console.log(`[OpenAI] Using model: ${modelName}`);

  return withRetry(async () => {
    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) {
      throw new Error('OpenAI returned empty response');
    }

    return text;
  }, 'OpenAI');
}

export async function generateText(
  prompt: string,
  config?: AIConfig
): Promise<string> {
  const provider = config?.provider || (process.env.AI_MODEL_PROVIDER as AIProvider) || 'gemini';

  console.log(`[AI Service] Using provider: ${provider}`);

  switch (provider) {
    case 'gemini':
      return generateWithGemini(prompt, config?.model);
    case 'claude':
      return generateWithClaude(prompt, config?.model);
    case 'openai':
      return generateWithOpenAI(prompt, config?.model);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}
