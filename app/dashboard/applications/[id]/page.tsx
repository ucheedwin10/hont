"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Save,
  CheckCircle,
  AlertCircle,
  Calendar,
  ExternalLink,
  FileText,
  RefreshCw,
  Copy,
  Check,
  Scissors,
  ClipboardList,
  Plus,
  HelpCircle,
  Trash2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { saveAnswer, loadAnswers } from "@/lib/saveAnswer"

interface Question {
  id: string
  question: string
  word_limit: number | null
  required: boolean
}

interface Answer {
  question_id: string
  text: string
  generated: boolean
}

interface Opportunity {
  id: string
  title: string
  organization: string | null
  type: string | null
  deadline: string | null
  url: string | null
  description: string | null
  questions: Question[]
}

interface Application {
  id: string
  user_id: string
  opportunity_id: string
  answers: Answer[]
  status: string
  opportunity: Opportunity
}

interface Job {
  company: string
  title: string
  location: string
  start_date: string
  end_date: string
  description: string
}

interface Education {
  degree: string
  institution: string
  graduation_year: string
}

interface ProfileData {
  bio: string | null
  bio_bullets: string[]
  jobs: Job[]
  achievements_bullets: string[]
  experience_bullets: string[]
  education: Education[]
  goals_bullets: string[]
}

export default function ApplicationPage() {
  const router = useRouter()
  const params = useParams()
  const applicationId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [application, setApplication] = useState<Application | null>(null)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [generating, setGenerating] = useState<Record<string, boolean>>({})
  const [trimming, setTrimming] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<Record<string, boolean>>({})
  const [copiedAll, setCopiedAll] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [generatingAll, setGeneratingAll] = useState(false)
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 })
  const [savingAnswer, setSavingAnswer] = useState<Record<string, boolean>>({})
  const [answerSaveStatus, setAnswerSaveStatus] = useState<Record<string, { saved: boolean; savedAt: string | null }>>({})
  const [answerLastSaved, setAnswerLastSaved] = useState<Record<string, string>>({})

  // State for adding questions
  const [showAddQuestions, setShowAddQuestions] = useState(false)
  const [newQuestions, setNewQuestions] = useState<Question[]>([])
  const [savingQuestions, setSavingQuestions] = useState(false)
  const [parsingText, setParsingText] = useState("")
  const [isParsing, setIsParsing] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/signin")
        return
      }

      // Fetch application with opportunity
      const { data: app, error: appError } = await supabase
        .from("user_applications")
        .select(`
          id,
          user_id,
          opportunity_id,
          answers,
          status,
          opportunity:opportunities (
            id,
            title,
            organization,
            type,
            deadline,
            url,
            description,
            questions
          )
        `)
        .eq("id", applicationId)
        .eq("user_id", user.id)
        .single()

      if (appError || !app) {
        setError("Application not found")
        setLoading(false)
        return
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from("master_profiles")
        .select("bio, bio_bullets, jobs, achievements_bullets, experience_bullets, education, goals_bullets")
        .eq("user_id", user.id)
        .single()

      // Transform the data
      const opportunity = Array.isArray(app.opportunity) ? app.opportunity[0] : app.opportunity
      const applicationData: Application = {
        id: app.id,
        user_id: app.user_id,
        opportunity_id: app.opportunity_id,
        answers: app.answers || [],
        status: app.status,
        opportunity: opportunity as Opportunity,
      }

      setApplication(applicationData)
      setProfile(profileData as ProfileData)

      // Load answers from user_application_answers table (new persistence layer)
      const { success: loadSuccess, answers: savedAnswersList } = await loadAnswers({
        applicationId: applicationData.id
      })

      if (loadSuccess && savedAnswersList.length > 0) {
        // Use answers from the new table
        const loadedAnswers: Record<string, string> = {}
        const loadedSaveStatus: Record<string, { saved: boolean; savedAt: string | null }> = {}
        const loadedLastSaved: Record<string, string> = {}

        for (const savedAnswer of savedAnswersList) {
          loadedAnswers[savedAnswer.question_id] = savedAnswer.answer
          loadedSaveStatus[savedAnswer.question_id] = { saved: true, savedAt: savedAnswer.updated_at }
          loadedLastSaved[savedAnswer.question_id] = savedAnswer.updated_at
        }

        setAnswers(loadedAnswers)
        setAnswerSaveStatus(loadedSaveStatus)
        setAnswerLastSaved(loadedLastSaved)
      } else {
        // Fallback: Initialize answers from legacy JSONB data if new table is empty
        const savedAnswers: Record<string, string> = {}
        for (const answer of applicationData.answers) {
          savedAnswers[answer.question_id] = answer.text
        }
        setAnswers(savedAnswers)
      }

      // If no questions, show the add questions UI
      if (!opportunity.questions || opportunity.questions.length === 0) {
        setShowAddQuestions(true)
      }

      setLoading(false)
    }

    fetchData()
  }, [applicationId, router])

  const getWordCount = useCallback((text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length
  }, [])

  // Helper to summarize an answer (first 100 chars + key phrases)
  const summarizeAnswer = (answer: string): string => {
    if (!answer) return ''
    // Get first sentence and any numbers/achievements mentioned
    const firstSentence = answer.split(/[.!?]/)[0] || ''
    const truncated = firstSentence.length > 150 ? firstSentence.substring(0, 150) + '...' : firstSentence
    return truncated
  }

  const handleGenerateAnswer = async (
    questionId: string,
    questionText: string,
    wordLimit: number | null,
    questionNumber?: number,
    totalQuestions?: number,
    previousAnswerSummaries?: string[]
  ) => {
    if (!profile || !application) return

    setGenerating((prev) => ({ ...prev, [questionId]: true }))

    try {
      const response = await fetch("/api/applications/generate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionText,
          wordLimit,
          questionNumber,
          totalQuestions,
          previousAnswerSummaries,
          profile: {
            bio: profile.bio,
            jobs: profile.jobs || [],
            achievements: profile.achievements_bullets,
            experience: profile.experience_bullets,
            education: profile.education || [],
            goals: profile.goals_bullets,
          },
          opportunity: {
            title: application?.opportunity.title,
            organization: application?.opportunity.organization,
            description: application?.opportunity.description,
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate answer")
      }

      // Update local state with generated answer
      setAnswers((prev) => ({ ...prev, [questionId]: result.answer }))

      // Auto-save the generated answer to database
      setSavingAnswer((prev) => ({ ...prev, [questionId]: true }))
      const saveResult = await saveAnswer({
        applicationId: application.id,
        questionId,
        answer: result.answer,
      })

      if (saveResult.success) {
        setAnswerSaveStatus((prev) => ({
          ...prev,
          [questionId]: { saved: true, savedAt: saveResult.savedAt || null }
        }))
        setAnswerLastSaved((prev) => ({
          ...prev,
          [questionId]: saveResult.savedAt || new Date().toISOString()
        }))
      } else {
        console.error("Failed to save answer:", saveResult.error)
        setAnswerSaveStatus((prev) => ({
          ...prev,
          [questionId]: { saved: false, savedAt: null }
        }))
      }
      setSavingAnswer((prev) => ({ ...prev, [questionId]: false }))

      return result.answer // Return for use in handleGenerateAll
    } catch (err) {
      console.error("Error generating answer:", err)
      return null
    } finally {
      setGenerating((prev) => ({ ...prev, [questionId]: false }))
    }
  }

  const handleGenerateAll = async () => {
    if (!application?.opportunity.questions || !profile) return

    const questions = application.opportunity.questions
    const totalQuestions = questions.length
    setGeneratingAll(true)
    setGenerationProgress({ current: 0, total: totalQuestions })

    // Collect summaries of all answers for diversity
    const answerSummaries: string[] = []

    // First, collect summaries of any existing answers
    for (const question of questions) {
      const existingAnswer = answers[question.id]
      if (existingAnswer && existingAnswer.trim().length > 0) {
        answerSummaries.push(summarizeAnswer(existingAnswer))
      }
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      setGenerationProgress({ current: i + 1, total: totalQuestions })

      // Skip if already has an answer
      if (answers[question.id] && answers[question.id].trim().length > 0) {
        continue
      }

      // Generate with context of previous answers
      const newAnswer = await handleGenerateAnswer(
        question.id,
        question.question,
        question.word_limit,
        i + 1,  // questionNumber (1-indexed)
        totalQuestions,
        answerSummaries.length > 0 ? answerSummaries : undefined
      )

      // Add summary of new answer for next iterations
      if (newAnswer) {
        answerSummaries.push(summarizeAnswer(newAnswer))
      }
    }

    setGeneratingAll(false)
    setGenerationProgress({ current: 0, total: 0 })
  }

  const handleTrimAnswer = async (questionId: string, wordLimit: number) => {
    const currentAnswer = answers[questionId]
    if (!currentAnswer || !application) return

    setTrimming((prev) => ({ ...prev, [questionId]: true }))

    try {
      const response = await fetch("/api/applications/trim-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: currentAnswer,
          targetWords: wordLimit,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to trim answer")
      }

      setAnswers((prev) => ({ ...prev, [questionId]: result.answer }))

      // Auto-save the trimmed answer
      setSavingAnswer((prev) => ({ ...prev, [questionId]: true }))
      const saveResult = await saveAnswer({
        applicationId: application.id,
        questionId,
        answer: result.answer,
      })

      if (saveResult.success) {
        setAnswerSaveStatus((prev) => ({
          ...prev,
          [questionId]: { saved: true, savedAt: saveResult.savedAt || null }
        }))
        setAnswerLastSaved((prev) => ({
          ...prev,
          [questionId]: saveResult.savedAt || new Date().toISOString()
        }))
      }
      setSavingAnswer((prev) => ({ ...prev, [questionId]: false }))
    } catch (err) {
      console.error("Error trimming answer:", err)
    } finally {
      setTrimming((prev) => ({ ...prev, [questionId]: false }))
    }
  }

  const handleCopyAnswer = async (questionId: string) => {
    const answer = answers[questionId]
    if (!answer) return

    try {
      await navigator.clipboard.writeText(answer)
      setCopied((prev) => ({ ...prev, [questionId]: true }))
      setTimeout(() => {
        setCopied((prev) => ({ ...prev, [questionId]: false }))
      }, 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleCopyAll = async () => {
    if (!application?.opportunity.questions) return

    const questions = application.opportunity.questions
    let fullText = `${application.opportunity.title}\n`
    fullText += `${application.opportunity.organization || ""}\n`
    fullText += "=".repeat(50) + "\n\n"

    for (const question of questions) {
      fullText += `Q: ${question.question}\n`
      if (question.word_limit) {
        fullText += `(Word limit: ${question.word_limit})\n`
      }
      fullText += "\n"
      fullText += `A: ${answers[question.id] || "[No answer yet]"}\n`
      fullText += `Word count: ${getWordCount(answers[question.id] || "")}\n`
      fullText += "\n" + "-".repeat(50) + "\n\n"
    }

    try {
      await navigator.clipboard.writeText(fullText)
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2000)
    } catch (err) {
      console.error("Failed to copy all:", err)
    }
  }

  const handleSave = async () => {
    if (!application) return

    setSaving(true)
    setSaveSuccess(false)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/signin")
        return
      }

      // Save each answer to the new user_application_answers table
      const savePromises = Object.entries(answers).map(async ([questionId, text]) => {
        if (!text || text.trim().length === 0) return null
        return saveAnswer({
          applicationId: application.id,
          questionId,
          answer: text,
        })
      })

      const results = await Promise.all(savePromises)
      const allSuccessful = results.every(r => r === null || r?.success)

      if (!allSuccessful) {
        throw new Error("Some answers failed to save")
      }

      // Update save status for all answers
      const newSaveStatus: Record<string, { saved: boolean; savedAt: string | null }> = {}
      const newLastSaved: Record<string, string> = {}
      const now = new Date().toISOString()

      for (const questionId of Object.keys(answers)) {
        if (answers[questionId] && answers[questionId].trim().length > 0) {
          newSaveStatus[questionId] = { saved: true, savedAt: now }
          newLastSaved[questionId] = now
        }
      }

      setAnswerSaveStatus(prev => ({ ...prev, ...newSaveStatus }))
      setAnswerLastSaved(prev => ({ ...prev, ...newLastSaved }))

      // Also update the legacy JSONB column for backwards compatibility
      const answersArray: Answer[] = Object.entries(answers).map(([question_id, text]) => ({
        question_id,
        text,
        generated: true,
      }))

      await supabase
        .from("user_applications")
        .update({
          answers: answersArray,
          updated_at: now,
        })
        .eq("id", application.id)
        .eq("user_id", user.id)

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error("Error saving answers:", err)
    } finally {
      setSaving(false)
    }
  }

  // Add question handling
  const handleAddQuestion = () => {
    const newId = `q_${Date.now()}`
    setNewQuestions([
      ...newQuestions,
      { id: newId, question: "", word_limit: 500, required: true },
    ])
  }

  const handleUpdateQuestion = (id: string, field: keyof Question, value: string | number | boolean | null) => {
    setNewQuestions(
      newQuestions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    )
  }

  const handleRemoveQuestion = (id: string) => {
    setNewQuestions(newQuestions.filter((q) => q.id !== id))
  }

  const handleParseQuestions = async () => {
    if (!parsingText.trim() || !application) return

    setIsParsing(true)
    try {
      console.log("Parsing questions from text...")

      const response = await fetch("/api/parse-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionsText: parsingText }),
      })

      const result = await response.json()
      console.log("Parse response:", result)

      if (!response.ok) {
        throw new Error(result.error || "Failed to parse questions")
      }

      if (result.questions && result.questions.length > 0) {
        console.log("Extracted questions:", result.questions)

        // Format questions properly
        const formattedQuestions = result.questions.map((q: { id?: string; question: string; word_limit?: number; required?: boolean }, index: number) => ({
          id: q.id || `q${index + 1}`,
          question: q.question.trim(),
          word_limit: typeof q.word_limit === 'number' && q.word_limit > 0 ? q.word_limit : 500,
          required: q.required !== false
        }))

        // IMMEDIATELY save to database
        console.log("Saving questions to opportunity:", application.opportunity_id)
        const supabase = createClient()

        const { data: updatedOpp, error: updateError } = await supabase
          .from("opportunities")
          .update({
            questions: formattedQuestions,
            updated_at: new Date().toISOString(),
          })
          .eq("id", application.opportunity_id)
          .select("id, questions")
          .single()

        if (updateError) {
          console.error("Failed to save questions:", updateError)
          throw new Error("Failed to save questions: " + updateError.message)
        }

        console.log("Questions saved successfully:", updatedOpp)
        console.log("Saved questions count:", updatedOpp?.questions?.length || 0)

        // Update local state
        setApplication({
          ...application,
          opportunity: {
            ...application.opportunity,
            questions: formattedQuestions,
          },
        })

        setParsingText("")
        setShowAddQuestions(false)
        setNewQuestions([])

        alert(`Successfully extracted and saved ${formattedQuestions.length} questions!`)
      } else {
        alert("No questions found in the text. Please check the format.")
      }
    } catch (err) {
      console.error("Error parsing questions:", err)
      alert("Failed to parse questions: " + (err instanceof Error ? err.message : "Unknown error"))
    } finally {
      setIsParsing(false)
    }
  }

  const handleSaveQuestions = async () => {
    if (!application || newQuestions.length === 0) return

    setSavingQuestions(true)
    try {
      const supabase = createClient()

      // Filter out empty questions and ensure proper format
      const validQuestions = newQuestions
        .filter((q) => q.question.trim().length > 0)
        .map((q, index) => ({
          id: q.id || `q${index + 1}`,
          question: q.question.trim(),
          word_limit: typeof q.word_limit === 'number' && q.word_limit > 0 ? q.word_limit : 500,
          required: q.required !== false
        }))

      if (validQuestions.length === 0) {
        console.log("No valid questions to save")
        setSavingQuestions(false)
        return
      }

      console.log("Saving questions to opportunity:", application.opportunity_id)
      console.log("Questions to save:", JSON.stringify(validQuestions, null, 2))

      // Update opportunity with new questions
      const { data: updatedOpp, error } = await supabase
        .from("opportunities")
        .update({
          questions: validQuestions,
          updated_at: new Date().toISOString(),
        })
        .eq("id", application.opportunity_id)
        .select("id, questions")
        .single()

      if (error) {
        console.error("Supabase update error:", error)
        throw error
      }

      console.log("Questions saved successfully:", updatedOpp)
      console.log("Saved questions count:", updatedOpp?.questions?.length || 0)

      // Update local state
      setApplication({
        ...application,
        opportunity: {
          ...application.opportunity,
          questions: validQuestions,
        },
      })
      setShowAddQuestions(false)
      setNewQuestions([])
    } catch (err) {
      console.error("Error saving questions:", err)
      alert("Failed to save questions: " + (err instanceof Error ? err.message : "Unknown error"))
    } finally {
      setSavingQuestions(false)
    }
  }

  const getWordCountStatus = (text: string, limit: number | null) => {
    if (!limit) return "neutral"
    const count = getWordCount(text)
    if (count > limit) return "over"
    if (count >= limit * 0.9) return "close"
    return "good"
  }

  const getWordCountColor = (status: string) => {
    switch (status) {
      case "over":
        return "text-red-500 bg-red-50 dark:bg-red-900/20"
      case "close":
        return "text-amber-500 bg-amber-50 dark:bg-amber-900/20"
      case "good":
        return "text-green-500 bg-green-50 dark:bg-green-900/20"
      default:
        return "text-gray-500 bg-gray-50 dark:bg-gray-800"
    }
  }

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return null
    const date = new Date(deadline)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {error || "Application not found"}
          </h1>
          <Link
            href="/dashboard"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const opportunity = application.opportunity
  const questions = opportunity.questions || []
  const hasQuestions = questions.length > 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/dashboard"
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </Link>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              {hasQuestions && (
                <>
                  <button
                    onClick={handleCopyAll}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
                  >
                    {copiedAll ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <ClipboardList className="w-4 h-4" />
                        Copy All
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : saveSuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Opportunity Header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {opportunity.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {opportunity.organization}
              </p>
            </div>
            {opportunity.url && (
              <a
                href={opportunity.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <ExternalLink className="w-4 h-4" />
                View Details
              </a>
            )}
          </div>

          {opportunity.deadline && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <Calendar className="w-4 h-4" />
              <span>Deadline: {formatDeadline(opportunity.deadline)}</span>
            </div>
          )}

          {opportunity.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {opportunity.description}
            </p>
          )}
        </div>

        {/* No Questions - Add Questions UI */}
        {!hasQuestions && showAddQuestions && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 mb-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No Questions Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                This opportunity doesn&apos;t have any questions yet. Add questions
                manually or paste the application requirements to extract them
                automatically.
              </p>
            </div>

            {/* Paste to Extract */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paste Application Requirements (Optional)
              </label>
              <textarea
                value={parsingText}
                onChange={(e) => setParsingText(e.target.value)}
                placeholder="Paste the essay questions, prompts, or application requirements here. Our AI will extract the questions automatically..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none text-sm"
              />
              {parsingText.trim() && (
                <button
                  onClick={handleParseQuestions}
                  disabled={isParsing}
                  className="mt-3 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Extract Questions
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-900 text-gray-500">
                  or add manually
                </span>
              </div>
            </div>

            {/* Manual Questions */}
            <div className="space-y-4 mb-6">
              {newQuestions.map((q, index) => (
                <div
                  key={q.id}
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-3">
                      {index + 1}.
                    </span>
                    <div className="flex-1 space-y-3">
                      <textarea
                        value={q.question}
                        onChange={(e) =>
                          handleUpdateQuestion(q.id, "question", e.target.value)
                        }
                        placeholder="Enter the essay question or prompt..."
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none text-sm"
                      />
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-500 dark:text-gray-400">
                            Word limit:
                          </label>
                          <input
                            type="number"
                            value={q.word_limit || ""}
                            onChange={(e) =>
                              handleUpdateQuestion(
                                q.id,
                                "word_limit",
                                e.target.value ? parseInt(e.target.value) : null
                              )
                            }
                            placeholder="500"
                            className="w-20 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                          />
                        </div>
                        <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <input
                            type="checkbox"
                            checked={q.required}
                            onChange={(e) =>
                              handleUpdateQuestion(q.id, "required", e.target.checked)
                            }
                            className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                          />
                          Required
                        </label>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleAddQuestion}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium py-2 px-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
              {newQuestions.length > 0 && (
                <button
                  onClick={handleSaveQuestions}
                  disabled={savingQuestions}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  {savingQuestions ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Save Questions & Continue
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Generate All Button */}
        {hasQuestions && (
          <div className="mb-6">
            <button
              onClick={handleGenerateAll}
              disabled={generatingAll || Object.values(generating).some(Boolean)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white font-semibold py-4 px-6 rounded-xl transition-all text-lg"
            >
              {generatingAll ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating {generationProgress.current} of{" "}
                  {generationProgress.total}...
                </>
              ) : Object.values(generating).some(Boolean) ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate All Answers from Profile
                </>
              )}
            </button>
          </div>
        )}

        {/* Questions */}
        {hasQuestions && (
          <div className="space-y-6">
            {questions.map((question, index) => {
              const answerText = answers[question.id] || ""
              const wordCount = getWordCount(answerText)
              const status = getWordCountStatus(answerText, question.word_limit)
              const isOverLimit =
                question.word_limit && wordCount > question.word_limit

              return (
                <div
                  key={question.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Question {index + 1}
                          </span>
                          {question.required && (
                            <span className="text-xs font-medium text-red-500 dark:text-red-400">
                              Required
                            </span>
                          )}
                          {question.word_limit && (
                            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                              {question.word_limit} words max
                            </span>
                          )}
                        </div>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {question.question}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleCopyAnswer(question.id)}
                          disabled={!answerText}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Copy answer"
                        >
                          {copied[question.id] ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            handleGenerateAnswer(
                              question.id,
                              question.question,
                              question.word_limit
                            )
                          }
                          disabled={generating[question.id]}
                          className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium"
                        >
                          {generating[question.id] ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4" />
                              {answerText ? "Regenerate" : "Generate"}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <textarea
                      value={answerText}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [question.id]: e.target.value,
                        }))
                      }
                      placeholder="Your answer will appear here after generation, or you can write your own..."
                      rows={8}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                    />
                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full ${getWordCountColor(
                            status
                          )}`}
                        >
                          <FileText className="w-4 h-4" />
                          <span className="font-medium">{wordCount} words</span>
                        </div>
                        {question.word_limit && (
                          <span
                            className={`text-sm font-medium ${
                              isOverLimit
                                ? "text-red-500"
                                : "text-gray-400 dark:text-gray-500"
                            }`}
                          >
                            {isOverLimit ? (
                              <span className="flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {wordCount - question.word_limit} over limit
                              </span>
                            ) : (
                              `${question.word_limit - wordCount} remaining`
                            )}
                          </span>
                        )}
                        {/* Save status indicator */}
                        {savingAnswer[question.id] ? (
                          <span className="flex items-center gap-1 text-sm text-blue-500">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Saving...
                          </span>
                        ) : answerSaveStatus[question.id]?.saved ? (
                          <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            Saved {formatRelativeTime(answerLastSaved[question.id])}
                          </span>
                        ) : null}
                      </div>

                      {isOverLimit && (
                        <button
                          onClick={() =>
                            handleTrimAnswer(question.id, question.word_limit!)
                          }
                          disabled={trimming[question.id]}
                          className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full transition-colors"
                        >
                          {trimming[question.id] ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Trimming...
                            </>
                          ) : (
                            <>
                              <Scissors className="w-4 h-4" />
                              Trim to Limit
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Bottom Save Button */}
        {hasQuestions && (
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleCopyAll}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-4 px-6 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {copiedAll ? (
                <>
                  <Check className="w-5 h-5 text-green-500" />
                  Copied All!
                </>
              ) : (
                <>
                  <ClipboardList className="w-5 h-5" />
                  Copy All Answers
                </>
              )}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save All Answers
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
