import { NextRequest, NextResponse } from 'next/server';
import Firecrawl from '@mendable/firecrawl-js';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

    if (!firecrawlApiKey) {
      return NextResponse.json(
        { error: 'Firecrawl API key not configured' },
        { status: 500 }
      );
    }

    if (!anthropicApiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    // Initialize Firecrawl
    const firecrawl = new Firecrawl({
      apiKey: firecrawlApiKey
    });

    // Scrape the page
    const scrapeResult = await firecrawl.scrape(url, {
      formats: ['markdown']
    });

    if (!scrapeResult.markdown) {
      throw new Error('Failed to scrape URL');
    }

    // Use Claude to extract structured data
    const anthropic = new Anthropic({ apiKey: anthropicApiKey });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `Extract scholarship/fellowship/grant information from this webpage content:

${scrapeResult.markdown}

Return JSON with:
{
  "title": "Scholarship/fellowship/grant name",
  "organization": "Organization or institution name",
  "deadline": "Deadline date if found (format: YYYY-MM-DD if possible, otherwise as written)",
  "description": "Brief description (2-3 sentences summarizing the opportunity)",
  "requirements": ["requirement 1", "requirement 2"],
  "amount": "Award amount if mentioned",
  "type": "scholarship" or "fellowship" or "grant" or "other",
  "url": "${url}"
}

Rules:
- Extract only what's clearly stated on the page
- If a field is not found, use null
- Keep description concise but informative
- Return ONLY valid JSON, no markdown or explanation`
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
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const opportunity = JSON.parse(jsonText);

    return NextResponse.json({
      success: true,
      opportunity: {
        ...opportunity,
        url: url // Ensure URL is always set
      }
    });
  } catch (error) {
    console.error('Crawl error:', error);
    const message = error instanceof Error ? error.message : 'Failed to crawl opportunity';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
