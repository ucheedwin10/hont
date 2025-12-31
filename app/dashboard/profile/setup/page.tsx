"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Upload,
  Link2,
  PenLine,
  Clock,
  X,
  Loader2,
  ArrowRight,
  CheckCircle,
  FileText,
} from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { BottomNav } from "@/components/ui/bottom-nav"
import { createClient } from "@/lib/supabase/client"

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

interface ParsedResumeData {
  bio: string
  jobs: Job[]
  achievements: string[]
  experience: string[]
  education: Education[]
  goals: string[]
}

export default function ProfileSetupPage() {
  const router = useRouter()
  const [showPortfolioModal, setShowPortfolioModal] = useState(false)
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [showParsedResultModal, setShowParsedResultModal] = useState(false)
  const [portfolioUrl, setPortfolioUrl] = useState("")
  const [resumeText, setResumeText] = useState("")
  const [parsingResume, setParsingResume] = useState(false)
  const [importingPortfolio, setImportingPortfolio] = useState(false)
  const [parsedResume, setParsedResume] = useState<ParsedResumeData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)

  // PDF upload state
  const [inputMethod, setInputMethod] = useState<"paste" | "pdf">("paste")
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [parsingPdf, setParsingPdf] = useState(false)

  const handleResumeparse = async () => {
    if (!resumeText.trim()) return

    setError(null)
    setParsedResume(null)
    setParsingResume(true)

    try {
      const response = await fetch("/api/parse-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeText: resumeText.trim() }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to parse resume")
      }

      setParsedResume(result.data)
      setShowResumeModal(false)
      setShowParsedResultModal(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to parse resume. Please try again."
      )
    } finally {
      setParsingResume(false)
    }
  }

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("PDF file must be under 5MB")
      return
    }

    setPdfFile(file)
    setError(null)
  }

  const handleParsePdf = async () => {
    if (!pdfFile) return

    setError(null)
    setParsedResume(null)
    setParsingPdf(true)

    try {
      // Convert PDF to base64
      const reader = new FileReader()

      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(",")[1]

          const response = await fetch("/api/parse-resume-pdf", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ pdfBase64: base64 }),
          })

          const result = await response.json()

          if (!response.ok) {
            throw new Error(result.error || "Failed to parse PDF")
          }

          setParsedResume(result.data)
          setShowResumeModal(false)
          setShowParsedResultModal(true)
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to parse PDF. Please try again."
          )
        } finally {
          setParsingPdf(false)
        }
      }

      reader.onerror = () => {
        setError("Failed to read PDF file")
        setParsingPdf(false)
      }

      reader.readAsDataURL(pdfFile)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to parse PDF. Please try again."
      )
      setParsingPdf(false)
    }
  }

  const handleUseResumeInfo = async () => {
    if (!parsedResume) return

    setSavingProfile(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to save your profile")
      }

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from("master_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single()

      const profileData = {
        user_id: user.id,
        bio: parsedResume.bio || "",
        bio_bullets: parsedResume.bio ? [parsedResume.bio] : [],
        jobs: parsedResume.jobs || [],
        achievements_bullets: parsedResume.achievements || [],
        experience_bullets: parsedResume.experience || [],
        education: parsedResume.education || [],
        goals_bullets: parsedResume.goals || [],
        completed: false, // User still needs to review
        ai_provider_used: "claude",
        updated_at: new Date().toISOString(),
      }

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from("master_profiles")
          .update(profileData)
          .eq("user_id", user.id)

        if (updateError) throw updateError
      } else {
        // Insert new profile
        const { error: insertError } = await supabase
          .from("master_profiles")
          .insert({
            ...profileData,
            created_at: new Date().toISOString(),
          })

        if (insertError) throw insertError
      }

      // Also save to localStorage as backup
      localStorage.setItem("parsedResumeData", JSON.stringify(parsedResume))

      setShowParsedResultModal(false)
      // Redirect directly to dashboard - it will show the profile review UI
      router.push("/dashboard")
    } catch (err) {
      console.error("Error saving profile:", err)
      // Log more details for debugging
      if (err && typeof err === 'object' && 'code' in err) {
        console.error("Supabase error code:", (err as { code: string }).code)
        console.error("Supabase error details:", JSON.stringify(err, null, 2))
      }

      let errorMessage = "Failed to save profile. Please try again."
      if (err instanceof Error) {
        errorMessage = err.message
        // Check for common Supabase errors
        if (err.message.includes("relation") && err.message.includes("does not exist")) {
          errorMessage = "Database table not set up. Please run the migration in Supabase."
        } else if (err.message.includes("permission denied") || err.message.includes("RLS")) {
          errorMessage = "Permission denied. Please check database policies."
        } else if (err.message.includes("violates unique constraint")) {
          errorMessage = "Profile already exists. Updating instead..."
        }
      }
      setError(errorMessage)
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePortfolioImport = async () => {
    if (!portfolioUrl.trim()) return

    setImportingPortfolio(true)

    // Simulate processing - in production, you'd scrape the URL
    await new Promise(resolve => setTimeout(resolve, 2000))

    setImportingPortfolio(false)
    setShowPortfolioModal(false)
    router.push("/dashboard/profile/edit")
  }

  const handleOpenPdfUpload = () => {
    setInputMethod("pdf")
    setShowResumeModal(true)
  }

  const handleOpenTextPaste = () => {
    setInputMethod("paste")
    setShowResumeModal(true)
  }

  const setupOptions = [
    {
      id: "pdf",
      icon: FileText,
      title: "Upload PDF Resume",
      description: "Upload your resume file for instant parsing",
      timeEstimate: "~1 minute",
      buttonText: "Upload PDF",
      gradient: "from-green-500 to-emerald-600",
      hoverGradient: "hover:from-green-600 hover:to-emerald-700",
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      onClick: handleOpenPdfUpload,
      recommended: true,
    },
    {
      id: "resume",
      icon: Upload,
      title: "Paste Resume",
      description: "Copy and paste your resume text",
      timeEstimate: "~2 minutes",
      buttonText: "Paste Resume Text",
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "hover:from-blue-600 hover:to-blue-700",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      onClick: handleOpenTextPaste,
    },
    {
      id: "portfolio",
      icon: Link2,
      title: "Import from Portfolio",
      description: "Paste your LinkedIn or personal website",
      timeEstimate: "~3 minutes",
      buttonText: "Add Link",
      gradient: "from-purple-500 to-purple-600",
      hoverGradient: "hover:from-purple-600 hover:to-purple-700",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      onClick: () => setShowPortfolioModal(true),
    },
    {
      id: "manual",
      icon: PenLine,
      title: "Build Manually",
      description: "Fill out your profile step-by-step",
      timeEstimate: "~5 minutes",
      buttonText: "Start Building",
      gradient: "from-amber-500 to-orange-500",
      hoverGradient: "hover:from-amber-600 hover:to-orange-600",
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      href: "/dashboard/profile/edit",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Resume Text/PDF Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowResumeModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setShowResumeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Import Your Resume
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Upload a PDF or paste your resume text. Our AI will extract your information automatically.
            </p>

            {/* Input Method Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setInputMethod("paste")}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                  inputMethod === "paste"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Paste Text
              </button>
              <button
                onClick={() => setInputMethod("pdf")}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                  inputMethod === "pdf"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Upload PDF
              </button>
            </div>

            {inputMethod === "paste" ? (
              <>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume content here..."
                  rows={12}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none mb-4 resize-none font-mono text-sm"
                />

                <button
                  onClick={handleResumeparse}
                  disabled={!resumeText.trim() || parsingResume}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {parsingResume ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing with Claude...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Parse Resume
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    id="pdf-upload"
                    className="hidden"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className={`flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                      pdfFile
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500"
                    }`}
                  >
                    {pdfFile ? (
                      <div className="flex flex-col items-center gap-2 text-center">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {pdfFile.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <span className="text-xs text-blue-500 hover:underline">
                          Click to change file
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center">
                        <FileText className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Click to upload PDF
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Max file size: 5MB
                        </span>
                      </div>
                    )}
                  </label>
                </div>

                <button
                  onClick={handleParsePdf}
                  disabled={!pdfFile || parsingPdf}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {parsingPdf ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing PDF with Claude...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Parse PDF
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Portfolio Modal */}
      {showPortfolioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPortfolioModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setShowPortfolioModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Import from Portfolio
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Paste your LinkedIn profile URL or personal website and we&apos;ll extract your information.
            </p>

            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none mb-4"
            />

            <button
              onClick={handlePortfolioImport}
              disabled={!portfolioUrl.trim() || importingPortfolio}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {importingPortfolio ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Link2 className="w-5 h-5" />
                  Import Portfolio
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Resume Parsed Result Modal */}
      {showParsedResultModal && parsedResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowParsedResultModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[80vh] shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Resume Parsed Successfully
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    AI extracted your profile information
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowParsedResultModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {parsedResume.bio && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                    Bio
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {parsedResume.bio}
                  </p>
                </div>
              )}

              {parsedResume.jobs && parsedResume.jobs.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                    Work Experience ({parsedResume.jobs.length} positions)
                  </h4>
                  <div className="space-y-3">
                    {parsedResume.jobs.map((job, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {job.title}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              {job.company} {job.location && `• ${job.location}`}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {job.start_date} - {job.end_date}
                          </span>
                        </div>
                        {job.description && (
                          <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                            {job.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {parsedResume.experience && parsedResume.experience.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                    Experience Highlights
                  </h4>
                  <ul className="space-y-2">
                    {parsedResume.experience.map((item, index) => (
                      <li key={index} className="text-gray-600 dark:text-gray-400 text-sm flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {parsedResume.achievements.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                    Achievements
                  </h4>
                  <ul className="space-y-2">
                    {parsedResume.achievements.map((item, index) => (
                      <li key={index} className="text-gray-600 dark:text-gray-400 text-sm flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {parsedResume.education && parsedResume.education.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                    Education ({parsedResume.education.length})
                  </h4>
                  <div className="space-y-2">
                    {parsedResume.education.map((edu, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {edu.degree}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {edu.institution} {edu.graduation_year && `• ${edu.graduation_year}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {parsedResume.goals && parsedResume.goals.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                    Goals
                  </h4>
                  <ul className="space-y-2">
                    {parsedResume.goals.map((item, index) => (
                      <li key={index} className="text-gray-600 dark:text-gray-400 text-sm flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowParsedResultModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUseResumeInfo}
                disabled={savingProfile}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Profile...
                  </>
                ) : (
                  <>
                    Continue to Profile
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 shadow-lg flex items-start gap-3">
            <div className="flex-1">
              <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                {error}
              </p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 dark:hover:text-red-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/dashboard/welcome"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 pb-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            How would you like to build your profile?
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Don&apos;t worry, you can edit everything later.
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {setupOptions.map((option) => {
            const Icon = option.icon
            const isRecommended = 'recommended' in option && option.recommended

            if (option.href) {
              return (
                <Link
                  key={option.id}
                  href={option.href}
                  className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg transition-all relative"
                >
                  <div className={`w-14 h-14 ${option.iconBg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-7 h-7 ${option.iconColor}`} />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {option.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {option.description}
                  </p>

                  <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-xs mb-5">
                    <Clock className="w-3.5 h-3.5" />
                    {option.timeEstimate}
                  </div>

                  <div className={`w-full bg-gradient-to-r ${option.gradient} ${option.hoverGradient} text-white font-semibold py-3 px-4 rounded-xl text-center transition-all`}>
                    {option.buttonText}
                  </div>
                </Link>
              )
            }

            return (
              <button
                key={option.id}
                onClick={option.onClick}
                className={`group bg-white dark:bg-gray-900 rounded-2xl border p-6 hover:shadow-lg transition-all text-left relative ${
                  isRecommended
                    ? "border-green-300 dark:border-green-700 ring-2 ring-green-500/20"
                    : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                }`}
              >
                {isRecommended && (
                  <div className="absolute -top-3 left-4 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Recommended
                  </div>
                )}
                <div className={`w-14 h-14 ${option.iconBg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform ${isRecommended ? "mt-2" : ""}`}>
                  <Icon className={`w-7 h-7 ${option.iconColor}`} />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {option.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {option.description}
                </p>

                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-xs mb-5">
                  <Clock className="w-3.5 h-3.5" />
                  {option.timeEstimate}
                </div>

                <div className={`w-full bg-gradient-to-r ${option.gradient} ${option.hoverGradient} text-white font-semibold py-3 px-4 rounded-xl text-center transition-all`}>
                  {option.buttonText}
                </div>
              </button>
            )
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
