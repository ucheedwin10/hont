import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      organization,
      deadline,
      description,
      type,
      url,
      questions,
      userId
    } = body;

    // Validate userId is required
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Use defaults for missing fields
    const opportunityTitle = title?.trim() || 'Custom Opportunity';
    const opportunityOrg = organization?.trim() || 'Custom Application';
    const opportunityType = type || 'other';
    const opportunityDescription = description?.trim() ||
      `Custom opportunity with ${questions?.length || 0} question${questions?.length !== 1 ? 's' : ''}`;

    console.log('Saving custom opportunity:', {
      title: opportunityTitle,
      organization: opportunityOrg,
      questionsCount: questions?.length || 0,
      questions: JSON.stringify(questions), // Log actual questions
      userId
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Prepare questions array - ensure it's properly formatted
    const formattedQuestions = Array.isArray(questions) ? questions.map((q, index) => ({
      id: q.id || `q${index + 1}`,
      question: q.question || '',
      word_limit: typeof q.word_limit === 'number' ? q.word_limit : 500,
      required: q.required !== false
    })) : [];

    console.log('Formatted questions to save:', JSON.stringify(formattedQuestions));

    // Insert the opportunity
    const { data: opportunity, error: insertError } = await supabase
      .from('opportunities')
      .insert({
        title: opportunityTitle,
        organization: opportunityOrg,
        deadline: deadline || null,
        description: opportunityDescription,
        type: opportunityType,
        url: url || null,
        questions: formattedQuestions,
        is_public: false, // Custom opportunities are private by default
        created_by: userId,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, questions')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error(insertError.message);
    }

    console.log('Opportunity created:', opportunity.id);
    console.log('Saved questions count:', opportunity.questions?.length || 0);

    // Create an application for this opportunity
    const { data: application, error: appError } = await supabase
      .from('user_applications')
      .insert({
        user_id: userId,
        opportunity_id: opportunity.id,
        status: 'in_progress',
        answers: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (appError) {
      console.error('Application creation error:', appError);
      // Return opportunity ID even if application creation failed
      return NextResponse.json({
        success: true,
        opportunityId: opportunity.id,
        applicationId: null,
        message: 'Opportunity saved but application creation failed'
      });
    }

    console.log('Application created:', application.id);

    return NextResponse.json({
      success: true,
      opportunityId: opportunity.id,
      applicationId: application.id,
      questionsCount: formattedQuestions.length,
      savedQuestions: opportunity.questions?.length || 0
    });
  } catch (error) {
    console.error('Save opportunity error:', error);
    const message = error instanceof Error ? error.message : 'Failed to save opportunity';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
