"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  FileText,
  Calendar,
  Clock,
  Plus,
  LogOut,
  ChevronRight,
  Sparkles,
  PenLine,
  Loader2,
  CheckCircle,
  X,
  GraduationCap,
  ExternalLink,
  Award,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { BottomNav } from "@/components/ui/bottom-nav"

interface ProfileData {
  id: string
  bio: string | null
  bio_bullets: string[]
  achievements_bullets: string[]
  experience_bullets: string[]
  goals_bullets: string[]
  completed: boolean
  ai_provider_used: string | null
}

interface Opportunity {
  id: string
  title: string
  organization: string | null
  type: string | null
  deadline: string | null
  description: string | null
  questions: Array<{
    id: string
    question: string
    word_limit: number
    required: boolean
  }>
  is_public: boolean
  // Qualification tags
  education_level: string | null
  work_experience: string | null
  geographic_eligibility: string | null
  field_of_study: string | null
  funding_amount: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [completingProfile, setCompletingProfile] = useState(false)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [opportunityText, setOpportunityText] = useState("")
  const [parsingOpportunity, setParsingOpportunity] = useState(false)
  const [startingApplication, setStartingApplication] = useState<string | null>(null)
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, hoursSaved: "0" })

  useEffect(() => {
    const getUser = async () => {
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

      setUserEmail(user.email || null)

      // Fetch profile data
      const { data: profile, error } = await supabase
        .from("master_profiles")
        .select("id, bio, bio_bullets, achievements_bullets, experience_bullets, goals_bullets, completed, ai_provider_used")
        .eq("user_id", user.id)
        .single()

      if (error || !profile) {
        router.push("/dashboard/welcome")
        return
      }

      setProfileData(profile as ProfileData)

      // Fetch opportunities same as Feed page - sorted by deadline (soonest first)
      const now = new Date()
      const { data: opps } = await supabase
        .from("opportunities")
        .select("id, title, organization, type, deadline, description, questions, is_public, education_level, work_experience, geographic_eligibility, field_of_study, funding_amount")
        .eq("is_public", true)
        .eq("status", "active")
        .order("deadline", { ascending: true, nullsFirst: false })

      if (opps && opps.length > 0) {
        // Filter out expired opportunities and take first 6 active ones
        const activeOpps = opps.filter(opp => {
          if (!opp.deadline) return true // No deadline = rolling, include
          return new Date(opp.deadline) >= now
        })
        setOpportunities(activeOpps.slice(0, 6) as Opportunity[])
      }

      // Fetch application stats
      const { count: totalCount } = await supabase
        .from("user_applications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      // Get start of current month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const { count: monthCount } = await supabase
        .from("user_applications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", startOfMonth)

      const total = totalCount || 0
      const thisMonth = monthCount || 0
      const hoursSaved = (total * 3.5).toFixed(1)

      setStats({ total, thisMonth, hoursSaved })

      setLoading(false)
    }

    getUser()
  }, [router])

  const handleCompleteProfile = async () => {
    if (!profileData) return

    setCompletingProfile(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/signin")
        return
      }

      const { error } = await supabase
        .from("master_profiles")
        .update({ completed: true, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)

      if (error) throw error

      setProfileData({ ...profileData, completed: true })
    } catch (err) {
      console.error("Error completing profile:", err)
    } finally {
      setCompletingProfile(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

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

  const handleParseOpportunity = async () => {
    if (!opportunityText.trim()) return

    setParsingOpportunity(true)
    try {
      const response = await fetch("/api/opportunities/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: opportunityText }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to parse opportunity")
      }

      // Save the opportunity and redirect
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/signin")
        return
      }

      const { data: newOpp, error } = await supabase
        .from("opportunities")
        .insert({
          user_id: user.id,
          title: result.data.title || "Untitled Opportunity",
          organization: result.data.organization,
          type: result.data.type || "other",
          deadline: result.data.deadline,
          description: result.data.description,
          questions: result.data.questions || [],
          is_public: false,
          status: "active",
        })
        .select("id")
        .single()

      if (error) throw error

      // Create application for this opportunity
      const { data: newApp, error: appError } = await supabase
        .from("user_applications")
        .insert({
          user_id: user.id,
          opportunity_id: newOpp.id,
          answers: [],
          status: "in_progress",
        })
        .select("id")
        .single()

      if (appError) throw appError

      setShowAddModal(false)
      setOpportunityText("")
      router.push(`/dashboard/applications/${newApp.id}`)
    } catch (err) {
      console.error("Error parsing opportunity:", err)
    } finally {
      setParsingOpportunity(false)
    }
  }

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Deadline badge helper - same as Feed page
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

  const statsCards = [
    { label: "Total Applications", value: stats.total.toString(), icon: FileText, color: "bg-blue-500" },
    { label: "This Month", value: stats.thisMonth.toString(), icon: Calendar, color: "bg-green-500" },
    { label: "Hours Saved", value: stats.hoursSaved, icon: Clock, color: "bg-purple-500" },
  ]

  const getTypeBadgeColor = (type: string | null) => {
    switch (type) {
      case "scholarship": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
      case "fellowship": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
      case "grant": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return "No deadline"
    const date = new Date(deadline)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Add Opportunity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add an Opportunity</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Paste the scholarship or grant description below. Our AI will extract the questions and requirements automatically.
              </p>

              <div className="relative">
                <textarea
                  value={opportunityText}
                  onChange={(e) => setOpportunityText(e.target.value)}
                  placeholder="Paste the full opportunity description, requirements, and essay questions here..."
                  rows={10}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {opportunityText.length.toLocaleString()} characters
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleParseOpportunity}
                disabled={!opportunityText.trim() || parsingOpportunity}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {parsingOpportunity ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
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
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">Hont</span>
            </Link>

            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back{userEmail ? `, ${userEmail.split("@")[0]}` : ""}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{currentDate}</p>
        </div>

        {/* Profile Section */}
        {profileData && !profileData.completed ? (
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 rounded-2xl border border-amber-200 dark:border-amber-800/50 p-6 sm:p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Your Profile is Ready for Review!</h2>
                <p className="text-gray-600 dark:text-gray-400">Review it below and confirm to start applying.</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {profileData.bio && (
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Bio</h4>
                  <p className="text-gray-800 dark:text-gray-200">{profileData.bio}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard/profile/setup" className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-white dark:hover:bg-gray-800 transition-colors">
                <PenLine className="w-4 h-4" />
                Re-import Profile
              </Link>
              <button onClick={handleCompleteProfile} disabled={completingProfile} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition-all">
                {completingProfile ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><CheckCircle className="w-4 h-4" />Looks Good, Start Applying!</>}
              </button>
            </div>
          </div>
        ) : profileData?.completed ? (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800/50 p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Profile Complete</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {profileData.experience_bullets?.length || 0} experiences • {profileData.achievements_bullets?.length || 0} achievements
                  </p>
                </div>
              </div>
              <Link href="/dashboard/profile/edit" className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                <PenLine className="w-4 h-4" />
                Edit Profile
              </Link>
            </div>
          </div>
        ) : null}

        {/* Add New Opportunity Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]"
          >
            <Plus className="w-6 h-6" />
            <span className="text-lg">Add New Opportunity</span>
          </button>
        </div>

        {/* Opportunities Section */}
        {opportunities.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-500" />
                Opportunities for You
              </h2>
              <Link href="/dashboard/feed" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1">
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {opportunities.map((opp) => {
                const deadlineBadge = getDeadlineBadge(opp.deadline)
                return (
                  <div key={opp.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {deadlineBadge && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${deadlineBadge.color} ${deadlineBadge.textColor}`}>
                            {deadlineBadge.label}
                          </span>
                        )}
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${getTypeBadgeColor(opp.type)}`}>
                          {opp.type || "Other"}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {opp.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{opp.organization}</p>

                    {/* Qualification Tags */}
                    {(opp.education_level || opp.geographic_eligibility || opp.field_of_study || opp.work_experience) && (
                      <div className="flex flex-wrap gap-1 mb-3">
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
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
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
                        <><Loader2 className="w-4 h-4 animate-spin" />Starting...</>
                      ) : (
                        <><Sparkles className="w-4 h-4" />Generate Application</>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {statsCards.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            )
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          </div>
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">No applications yet. Choose an opportunity above to get started!</p>
            <button onClick={() => setShowAddModal(true)} className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
              Add a custom opportunity
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
