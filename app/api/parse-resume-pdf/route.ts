import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: NextRequest) {
  try {
    const { pdfBase64 } = await req.json();

    if (!pdfBase64) {
      return NextResponse.json(
        { error: 'PDF data is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    // Claude can read PDFs directly via the document content type
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64,
              },
            },
            {
              type: 'text',
              text: `Extract the following from this resume and return as JSON:

{
  "bio": "A compelling 2-3 sentence professional bio that: starts with current role/expertise, highlights most impressive achievement with numbers if available, mentions key skills, uses strong active language, sounds natural not generic",
  "jobs": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "location": "City, Country or Remote",
      "start_date": "Month Year",
      "end_date": "Month Year or Present",
      "description": "Brief role description"
    }
  ],
  "experience": ["achievement/impact bullet 1", "achievement/impact bullet 2"],
  "achievements": ["key accomplishment 1", "award or honor"],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "School Name",
      "graduation_year": "Year or Expected Year"
    }
  ],
  "goals": ["career goal if mentioned"]
}

Rules:
- Extract ALL jobs found in the resume
- Extract ALL education entries
- Be concise and factual
- If a section is missing, return an empty array
- Return ONLY valid JSON, no markdown code blocks or explanation`,
            },
          ],
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Extract JSON from the response (handle potential markdown wrapping)
    let jsonText = content.text.trim();

    // Remove markdown code blocks if present
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    }

    // Find JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const profile = JSON.parse(jsonText);

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('PDF parsing error:', error);
    const message = error instanceof Error ? error.message : 'Failed to parse PDF';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
