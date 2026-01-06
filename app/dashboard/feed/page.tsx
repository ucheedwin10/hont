"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Search,
  Loader2,
  Sparkles,
  Calendar,
  FileText,
  GraduationCap,
  Award,
  BookOpen,
  Palette,
  Globe,
  FlaskConical,
  X,
  Plus,
  Link2,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Clock,
  Archive,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { BottomNav } from "@/components/ui/bottom-nav"

interface Opportunity {
  id: string
  title: string
  organization: string | null
  type: string | null
  deadline: string | null
  description: string | null
  tags: string[] | null
  questions: Array<{
    id: string
    question: string
    word_limit: number
    required: boolean
  }> | null
  is_public: boolean
  // Qualification tags
  education_level: string | null
  work_experience: string | null
  geographic_eligibility: string | null
  field_of_study: string | null
  funding_amount: string | null
}

interface ExtractedOpportunity {
  title: string
  organization: string | null
  deadline: string | null
  description: string | null
  type: string
  url: string
}

interface ParsedQuestion {
  id: string
  question: string
  word_limit: number | null
  required: boolean
}

const FILTER_CATEGORIES = [
  { key: "all", label: "All", icon: Sparkles },
  { key: "scholarship", label: "Scholarships", icon: GraduationCap },
  { key: "fellowship", label: "Fellowships", icon: Award },
  { key: "grant", label: "Grants", icon: BookOpen },
  { key: "research", label: "Research", icon: FlaskConical },
  { key: "arts", label: "Arts", icon: Palette },
  { key: "international", label: "International", icon: Globe },
]

export default function FeedPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [startingApplication, setStartingApplication] = useState<string | null>(null)

  // Custom opportunity modal state
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [customStep, setCustomStep] = useState<1 | 2 | 3>(1)
  const [customUrl, setCustomUrl] = useState("")
  const [customLoading, setCustomLoading] = useState(false)
  const [customError, setCustomError] = useState<string | null>(null)
  const [extractedOpportunity, setExtractedOpportunity] = useState<ExtractedOpportunity | null>(null)
  const [questionsText, setQuestionsText] = useState("")
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  // Lazy loading state
  const [displayCount, setDisplayCount] = useState(12)
  const [showArchived, setShowArchived] = useState(false)

  // Deadline badge helper
  const getDeadlineBadge = (deadline: string | null) => {
    if (!deadline) return null
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const daysUntil = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntil < 0) {
      return { label: "ARCHIVED", color: "bg-gray-500", textColor: "text-white", isExpired: true }
    } else if (daysUntil <= 7) {
      return { label: "CLOSING SOON", color: "bg-red-500", textColor: "text-white", isExpired: false }
    } else if (daysUntil <= 30) {
      return { label: "CLOSING THIS MONTH", color: "bg-amber-500", textColor: "text-white", isExpired: false }
    }
    return null
  }

  useEffect(() => {
    const fetchOpportunities = async () => {
      const supabase = createClient()

      // Try getSession first (uses cached session), fallback to getUser
      const { data: { session } } = await supabase.auth.getSession()
      let user = session?.user

      if (!user) {
        // Double-check with getUser before redirecting
        const { data: { user: verifiedUser } } = await supabase.auth.getUser()
        if (!verifiedUser) {
          router.push("/auth/signin")
          return
        }
        user = verifiedUser
      }

      setUserId(user.id)

      const { data: opps, error } = await supabase
        .from("opportunities")
        .select("id, title, organization, type, deadline, description, tags, questions, is_public, education_level, work_experience, geographic_eligibility, field_of_study, funding_amount")
        .eq("is_public", true)
        .eq("status", "active")
        .order("deadline", { ascending: true, nullsFirst: false })

      if (error) {
        console.error("Error fetching opportunities:", error)
      }

      if (opps) {
        // Debug: Log first opportunity to verify qualification fields
        console.log("First opportunity data:", opps[0])
        console.log("Qualification fields:", {
          education_level: opps[0]?.education_level,
          work_experience: opps[0]?.work_experience,
          geographic_eligibility: opps[0]?.geographic_eligibility,
          field_of_study: opps[0]?.field_of_study,
          funding_amount: opps[0]?.funding_amount,
        })
        setOpportunities(opps as Opportunity[])
      }

      setLoading(false)
    }

    fetchOpportunities()
  }, [router])

  // Separate active and archived opportunities
  const { activeOpportunities, archivedOpportunities } = useMemo(() => {
    let filtered = opportunities

    // Apply type/tag filter
    if (activeFilter !== "all") {
      filtered = filtered.filter((opp) => {
        if (activeFilter === "scholarship" || activeFilter === "fellowship" || activeFilter === "grant") {
          return opp.type === activeFilter
        }
        // Check tags for other filters
        return opp.tags?.includes(activeFilter) || opp.type === activeFilter
      })
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (opp) =>
          opp.title.toLowerCase().includes(query) ||
          opp.organization?.toLowerCase().includes(query) ||
          opp.description?.toLowerCase().includes(query) ||
          opp.tags?.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    // Separate into active and archived based on deadline
    const now = new Date()
    const active: Opportunity[] = []
    const archived: Opportunity[] = []

    filtered.forEach((opp) => {
      if (opp.deadline) {
        const deadlineDate = new Date(opp.deadline)
        if (deadlineDate < now) {
          archived.push(opp)
        } else {
          active.push(opp)
        }
      } else {
        // No deadline = rolling, treat as active
        active.push(opp)
      }
    })

    return { activeOpportunities: active, archivedOpportunities: archived }
  }, [opportunities, activeFilter, searchQuery])

  // Get paginated active opportunities for display
  const displayedOpportunities = useMemo(() => {
    return activeOpportunities.slice(0, displayCount)
  }, [activeOpportunities, displayCount])

  const hasMoreToLoad = displayCount < activeOpportunities.length

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: opportunities.length }

    opportunities.forEach((opp) => {
      // Count by type
      if (opp.type) {
        counts[opp.type] = (counts[opp.type] || 0) + 1
      }
      // Count by tags
      opp.tags?.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1
      })
    })

    return counts
  }, [opportunities])

  const handleStartApplication = async (opportunityId: string) => {
    setStartingApplication(opportunityId)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/signin")
        return
      }

      // Check if application already exists
      const { data: existingApp } = await supabase
        .from("user_applications")
        .select("id")
        .eq("user_id", user.id)
        .eq("opportunity_id", opportunityId)
        .single()

      if (existingApp) {
        router.push(`/dashboard/applications/${existingApp.id}`)
        return
      }

      // Create new application
      const { data: newApp, error } = await supabase
        .from("user_applications")
        .insert({
          user_id: user.id,
          opportunity_id: opportunityId,
          answers: [],
          status: "in_progress",
        })
        .select("id")
        .single()

      if (error) throw error

      router.push(`/dashboard/applications/${newApp.id}`)
    } catch (err) {
      console.error("Error starting application:", err)
      setStartingApplication(null)
    }
  }

  const getTypeBadgeColor = (type: string | null) => {
    switch (type) {
      case "scholarship":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
      case "fellowship":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
      case "grant":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return "Rolling"
    const date = new Date(deadline)
    const now = new Date()
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "Expired"
    if (diffDays === 0) return "Today!"
    if (diffDays <= 7) return `${diffDays} days left`
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks left`

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const getDeadlineColor = (deadline: string | null) => {
    if (!deadline) return "text-gray-500"
    const date = new Date(deadline)
    const now = new Date()
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "text-gray-400"
    if (diffDays <= 7) return "text-red-500"
    if (diffDays <= 30) return "text-amber-500"
    return "text-gray-500"
  }

  // Custom opportunity handlers
  const resetCustomModal = () => {
    setShowCustomModal(false)
    setCustomStep(1)
    setCustomUrl("")
    setCustomLoading(false)
    setCustomError(null)
    setExtractedOpportunity(null)
    setQuestionsText("")
    setParsedQuestions([])
  }

  const handleCrawlUrl = async () => {
    if (!customUrl.trim()) {
      setCustomError("Please enter a URL")
      return
    }

    setCustomLoading(true)
    setCustomError(null)

    try {
      const response = await fetch("/api/crawl-opportunity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: customUrl.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to crawl URL")
      }

      setExtractedOpportunity(data.opportunity)
      setCustomStep(2)
    } catch (err) {
      setCustomError(err instanceof Error ? err.message : "Failed to crawl URL")
    } finally {
      setCustomLoading(false)
    }
  }

  const handleParseQuestions = async () => {
    if (!questionsText.trim()) {
      setCustomError("Please paste the essay questions")
      return
    }

    setCustomLoading(true)
    setCustomError(null)

    try {
      const response = await fetch("/api/parse-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionsText: questionsText.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse questions")
      }

      setParsedQuestions(data.questions)
      setCustomStep(3)
    } catch (err) {
      setCustomError(err instanceof Error ? err.message : "Failed to parse questions")
    } finally {
      setCustomLoading(false)
    }
  }

  const handleSaveCustomOpportunity = async () => {
    if (!userId) {
      setCustomError("You must be logged in to save opportunities")
      return
    }

    if (parsedQuestions.length === 0) {
      setCustomError("No questions to save. Please extract questions first.")
      return
    }

    setCustomLoading(true)
    setCustomError(null)

    try {
      // Use defaults if extracted data is missing
      const opportunityTitle = extractedOpportunity?.title?.trim() || "Custom Opportunity"
      const opportunityOrg = extractedOpportunity?.organization?.trim() || "Custom Application"
      const opportunityType = extractedOpportunity?.type || "other"
      const opportunityDescription = extractedOpportunity?.description?.trim() ||
        `Custom opportunity with ${parsedQuestions.length} question${parsedQuestions.length !== 1 ? "s" : ""}`

      const requestBody = {
        title: opportunityTitle,
        organization: opportunityOrg,
        deadline: extractedOpportunity?.deadline || null,
        description: opportunityDescription,
        type: opportunityType,
        url: extractedOpportunity?.url || customUrl || null,
        questions: parsedQuestions,
        userId,
      }

      console.log("Saving opportunity with payload:", JSON.stringify(requestBody, null, 2))
      console.log("Questions being sent:", parsedQuestions)
      console.log("Questions count:", parsedQuestions.length)

      const response = await fetch("/api/opportunities/save-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()
      console.log("API Response:", JSON.stringify(data, null, 2))

      if (!response.ok) {
        throw new Error(data.error || "Failed to save opportunity")
      }

      console.log("Save successful! Opportunity ID:", data.opportunityId, "Application ID:", data.applicationId, "Questions saved:", data.questionsCount)

      // Close modal first
      resetCustomModal()

      // Redirect to the application page to generate answers
      if (data.applicationId) {
        console.log("Redirecting to application:", data.applicationId)
        router.push(`/dashboard/applications/${data.applicationId}`)
      } else if (data.opportunityId) {
        // Fallback: if no application was created, redirect to opportunities
        console.log("No application ID, redirecting to opportunities")
        router.push("/dashboard/applications")
      } else {
        throw new Error("No application or opportunity ID returned")
      }
    } catch (err) {
      console.error("Save error:", err)
      setCustomError(err instanceof Error ? err.message : "Failed to save opportunity")
      setCustomLoading(false)
    }
  }

  // Skeleton Card Component
  const OpportunitySkeleton = () => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Header Skeleton */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-amber-500 rounded-lg animate-pulse" />
                <div className="w-12 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
              <div className="hidden md:flex items-center space-x-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ))}
              </div>
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            </div>
          </div>
        </header>

        {/* Hero Skeleton */}
        <section className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="h-10 w-64 bg-white/20 rounded mx-auto mb-3 animate-pulse" />
            <div className="h-6 w-48 bg-white/20 rounded mx-auto mb-8 animate-pulse" />
            <div className="max-w-2xl mx-auto h-14 bg-white/90 rounded-2xl animate-pulse" />
          </div>
        </section>

        {/* Filter Skeleton */}
        <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-hidden">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse flex-shrink-0" />
            ))}
          </div>
        </section>

        {/* Grid Skeleton */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <OpportunitySkeleton key={i} />
            ))}
          </div>
        </main>

        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">Hont</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
                Dashboard
              </Link>
              <Link href="/dashboard/feed" className="text-amber-600 dark:text-amber-400 font-semibold">
                Feed
              </Link>
              <Link href="/dashboard/applications" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
                Applications
              </Link>
              <Link href="/dashboard/profile/edit" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
                Profile
              </Link>
            </nav>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Discover Your Next Opportunity
          </h1>
          <p className="text-lg text-white/90 mb-8">
            Browse {opportunities.length}+ scholarships, fellowships, and grants
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, organization, or field..."
              className="w-full pl-12 pr-12 py-4 rounded-2xl border-0 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-white/50 outline-none text-lg shadow-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Add Custom Opportunity Button */}
          <button
            onClick={() => setShowCustomModal(true)}
            className="mt-6 inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-medium px-5 py-2.5 rounded-xl transition-all backdrop-blur-sm"
          >
            <Plus className="w-5 h-5" />
            Add Custom Opportunity
          </button>
        </div>
      </section>

      {/* Filter Buttons */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-4 px-4 sm:px-6 lg:px-8 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {FILTER_CATEGORIES.map((category) => {
              const Icon = category.icon
              const count = categoryCounts[category.key] || 0
              const isActive = activeFilter === category.key

              return (
                <button
                  key={category.key}
                  onClick={() => setActiveFilter(category.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Results Count */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{activeOpportunities.length}</span> active opportunities
            {archivedOpportunities.length > 0 && (
              <span className="text-gray-400 dark:text-gray-500">
                {" "}({archivedOpportunities.length} archived)
              </span>
            )}
            {searchQuery && (
              <span>
                {" "}for &quot;<span className="font-medium">{searchQuery}</span>&quot;
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Opportunities Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-12">
        {activeOpportunities.length === 0 && archivedOpportunities.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No opportunities found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => {
                setSearchQuery("")
                setActiveFilter("all")
              }}
              className="mt-4 text-amber-600 dark:text-amber-400 font-medium hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {/* Active Opportunities Grid */}
            {activeOpportunities.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedOpportunities.map((opp) => {
                  const deadlineBadge = getDeadlineBadge(opp.deadline)
                  return (
                    <div
                      key={opp.id}
                      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg transition-all group relative"
                    >
                      {/* Deadline Badge */}
                      {deadlineBadge && !deadlineBadge.isExpired && (
                        <div className={`absolute -top-2 -right-2 ${deadlineBadge.color} ${deadlineBadge.textColor} text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg`}>
                          <Clock className="w-3 h-3" />
                          {deadlineBadge.label}
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${getTypeBadgeColor(
                            opp.type
                          )}`}
                        >
                          {opp.type || "Other"}
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                        {opp.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{opp.organization}</p>

                      {opp.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {opp.description}
                        </p>
                      )}

                      {/* Qualification Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                          {opp.education_level && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              📚 {opp.education_level}
                            </span>
                          )}
                          {opp.geographic_eligibility && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                              🌍 {opp.geographic_eligibility}
                            </span>
                          )}
                          {opp.field_of_study && opp.field_of_study !== "Any Field" && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                              🎓 {opp.field_of_study}
                            </span>
                          )}
                          {opp.work_experience && opp.work_experience !== "No Experience" && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                              💼 {opp.work_experience}
                            </span>
                          )}
                          {!opp.education_level && !opp.geographic_eligibility && (
                            <span className="text-[10px] text-gray-400">No qualification data</span>
                          )}
                        </div>

                      {/* Legacy Tags */}
                      {opp.tags && opp.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {opp.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                            >
                              {tag.replace(/_/g, " ")}
                            </span>
                          ))}
                          {opp.tags.length > 3 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                              +{opp.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                        <span className={`flex items-center gap-1 ${getDeadlineColor(opp.deadline)}`}>
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDeadline(opp.deadline)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {opp.questions?.length || 0} questions
                        </span>
                      </div>

                      <button
                        onClick={() => handleStartApplication(opp.id)}
                        disabled={startingApplication === opp.id}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                      >
                        {startingApplication === opp.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Generate Application
                          </>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 mb-8">
                <p className="text-gray-500 dark:text-gray-400">No active opportunities match your filters</p>
              </div>
            )}

            {/* Load More Button */}
            {hasMoreToLoad && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setDisplayCount((prev) => prev + 12)}
                  className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 transition-all"
                >
                  <ChevronDown className="w-5 h-5" />
                  Load More ({activeOpportunities.length - displayCount} remaining)
                </button>
              </div>
            )}

            {/* Archived Opportunities Section */}
            {archivedOpportunities.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className="flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-6"
                >
                  <Archive className="w-5 h-5" />
                  <span className="font-medium">
                    Archived Opportunities ({archivedOpportunities.length})
                  </span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showArchived ? "rotate-180" : ""}`} />
                </button>

                {showArchived && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
                    {archivedOpportunities.map((opp) => (
                      <div
                        key={opp.id}
                        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 relative"
                      >
                        {/* Archived Badge */}
                        <div className="absolute -top-2 -right-2 bg-gray-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                          <Archive className="w-3 h-3" />
                          ARCHIVED
                        </div>

                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-gray-400" />
                          </div>
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full capitalize bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            {opp.type || "Other"}
                          </span>
                        </div>

                        <h3 className="font-semibold text-gray-600 dark:text-gray-400 mb-1 line-clamp-2">
                          {opp.title}
                        </h3>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mb-2">{opp.organization}</p>

                        <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Expired {formatDeadline(opp.deadline)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            {opp.questions?.length || 0} questions
                          </span>
                        </div>

                        <button
                          onClick={() => handleStartApplication(opp.id)}
                          disabled={startingApplication === opp.id}
                          className="w-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-600 dark:text-gray-400 font-medium py-2.5 px-4 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                        >
                          {startingApplication === opp.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Starting...
                            </>
                          ) : (
                            <>
                              <FileText className="w-4 h-4" />
                              View Application
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Custom Opportunity Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Add Custom Opportunity
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Step {customStep} of 3
                </p>
              </div>
              <button
                onClick={resetCustomModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 pt-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex-1">
                    <div
                      className={`h-2 rounded-full transition-colors ${
                        step <= customStep
                          ? "bg-amber-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Error Message */}
              {customError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{customError}</p>
                </div>
              )}

              {/* Step 1: URL Input */}
              {customStep === 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Opportunity URL (Optional)
                  </label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://example.com/scholarship"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Paste the URL to auto-extract details, or skip to enter questions directly
                  </p>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        // Skip URL extraction, go directly to questions
                        setExtractedOpportunity(null)
                        setCustomStep(2)
                      }}
                      className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-xl transition-all"
                    >
                      Skip
                    </button>
                    <button
                      onClick={handleCrawlUrl}
                      disabled={customLoading || !customUrl.trim()}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {customLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-5 h-5" />
                          Extract
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Questions Input */}
              {customStep === 2 && (
                <div>
                  {/* Extracted Details Preview - only show if we have data */}
                  {extractedOpportunity && (extractedOpportunity.title || extractedOpportunity.organization) && (
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {extractedOpportunity.title || "Custom Opportunity"}
                          </h3>
                          {extractedOpportunity.organization && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {extractedOpportunity.organization}
                            </p>
                          )}
                          {extractedOpportunity.deadline && (
                            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                              Deadline: {extractedOpportunity.deadline}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show helper text if no opportunity was extracted */}
                  {!extractedOpportunity && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Paste your essay questions below. We&apos;ll extract word limits automatically.
                      </p>
                    </div>
                  )}

                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Essay Questions
                  </label>
                  <textarea
                    value={questionsText}
                    onChange={(e) => setQuestionsText(e.target.value)}
                    placeholder="Paste all essay questions here. Include word limits if specified.

Example:
1. Why do you deserve this scholarship? (500 words)
2. Describe your career goals and how this opportunity aligns with them. (750 words max)"
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Copy and paste the essay questions from the application
                  </p>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setCustomStep(1)}
                      className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-xl transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleParseQuestions}
                      disabled={customLoading || !questionsText.trim()}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {customLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Extracting Questions...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Extract Questions
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Edit Questions */}
              {customStep === 3 && extractedOpportunity && (
                <div>
                  <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">
                        Found {parsedQuestions.length} question{parsedQuestions.length !== 1 ? "s" : ""}! Review and adjust word limits if needed.
                      </span>
                    </div>
                  </div>

                  {/* Opportunity Summary */}
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {extractedOpportunity.title}
                    </h3>
                    {extractedOpportunity.organization && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {extractedOpportunity.organization}
                      </p>
                    )}
                  </div>

                  {/* Questions with Editable Word Limits */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {parsedQuestions.map((q, index) => (
                      <div
                        key={q.id}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded">
                            Question {index + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-500 dark:text-gray-400">
                              Word limit:
                            </label>
                            <input
                              type="number"
                              min="50"
                              max="5000"
                              value={q.word_limit || 500}
                              onChange={(e) => {
                                const newLimit = parseInt(e.target.value) || 500
                                setParsedQuestions(prev =>
                                  prev.map((pq, i) =>
                                    i === index ? { ...pq, word_limit: newLimit } : pq
                                  )
                                )
                              }}
                              className="w-20 px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                            />
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {q.question}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setParsedQuestions([])
                        setCustomStep(2)
                      }}
                      className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-xl transition-all"
                    >
                      Re-extract
                    </button>
                    <button
                      onClick={handleSaveCustomOpportunity}
                      disabled={customLoading}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {customLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Generate Answers
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
