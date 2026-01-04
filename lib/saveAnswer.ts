import { createClient } from '@/lib/supabase/client'

interface SaveAnswerParams {
  applicationId: string
  questionId: string
  answer: string
}

interface SaveAnswerResponse {
  success: boolean
  error?: string
  savedAt?: string
}

/**
 * Saves an answer to the user_application_answers table.
 * Uses upsert to update existing answers (based on application_id + question_id).
 * Also updates the application status to 'in_progress' if not already set.
 */
export async function saveAnswer({
  applicationId,
  questionId,
  answer,
}: SaveAnswerParams): Promise<SaveAnswerResponse> {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Calculate word count
    const wordCount = answer.trim().split(/\s+/).filter(Boolean).length

    const now = new Date().toISOString()

    // Upsert answer to user_application_answers table
    // Uses the unique constraint on (application_id, question_id) to update if exists
    const { error: upsertError } = await supabase
      .from('user_application_answers')
      .upsert(
        {
          application_id: applicationId,
          question_id: questionId,
          answer: answer,
          word_count: wordCount,
          updated_at: now,
        },
        {
          onConflict: 'application_id,question_id',
        }
      )

    if (upsertError) {
      console.error('Error saving answer:', upsertError)
      return { success: false, error: upsertError.message }
    }

    // Update application status to 'in_progress' if it's not already in a later state
    const { error: statusError } = await supabase
      .from('user_applications')
      .update({
        status: 'in_progress',
        updated_at: now
      })
      .eq('id', applicationId)
      .eq('user_id', user.id)
      .in('status', ['draft', 'pending']) // Only update if in draft/pending state

    // Note: statusError is not critical - answer was still saved
    if (statusError) {
      console.warn('Could not update application status:', statusError)
    }

    return { success: true, savedAt: now }
  } catch (err) {
    console.error('Unexpected error in saveAnswer:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    }
  }
}

interface LoadAnswersParams {
  applicationId: string
}

interface SavedAnswer {
  question_id: string
  answer: string
  word_count: number
  updated_at: string
}

interface LoadAnswersResponse {
  success: boolean
  answers: SavedAnswer[]
  error?: string
}

/**
 * Loads all saved answers for a given application from user_application_answers table.
 */
export async function loadAnswers({
  applicationId,
}: LoadAnswersParams): Promise<LoadAnswersResponse> {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, answers: [], error: 'Not authenticated' }
    }

    // First verify the user owns this application
    const { data: application, error: appError } = await supabase
      .from('user_applications')
      .select('id')
      .eq('id', applicationId)
      .eq('user_id', user.id)
      .single()

    if (appError || !application) {
      return { success: false, answers: [], error: 'Application not found' }
    }

    // Fetch all answers for this application
    const { data: answers, error: fetchError } = await supabase
      .from('user_application_answers')
      .select('question_id, answer, word_count, updated_at')
      .eq('application_id', applicationId)
      .order('updated_at', { ascending: false })

    if (fetchError) {
      console.error('Error loading answers:', fetchError)
      return { success: false, answers: [], error: fetchError.message }
    }

    return {
      success: true,
      answers: answers || []
    }
  } catch (err) {
    console.error('Unexpected error in loadAnswers:', err)
    return {
      success: false,
      answers: [],
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    }
  }
}
