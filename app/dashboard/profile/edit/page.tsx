"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Sparkles,
  PenLine,
  Loader2,
  Check,
  X,
  Plus,
  Trash2,
  Briefcase,
  GraduationCap,
  MapPin,
  Calendar,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { BottomNav } from "@/components/ui/bottom-nav"

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
  id: string
  bio: string
  bio_bullets: string[]
  jobs: Job[]
  achievements_bullets: string[]
  experience_bullets: string[]
  education: Education[]
  goals_bullets: string[]
}

type EditingSection = "bio" | "jobs" | "experience" | "achievements" | "education" | "goals" | null

const emptyJob: Job = {
  company: "",
  title: "",
  location: "",
  start_date: "",
  end_date: "",
  description: "",
}

const emptyEducation: Education = {
  degree: "",
  institution: "",
  graduation_year: "",
}

export default function ProfileEditPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [editingSection, setEditingSection] = useState<EditingSection>(null)
  const [editBuffer, setEditBuffer] = useState<string>("")
  const [editArrayBuffer, setEditArrayBuffer] = useState<string[]>([])
  const [editJobsBuffer, setEditJobsBuffer] = useState<Job[]>([])
  const [editEducationBuffer, setEditEducationBuffer] = useState<Education[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/signin")
        return
      }

      const { data: profile, error } = await supabase
        .from("master_profiles")
        .select("id, bio, bio_bullets, jobs, achievements_bullets, experience_bullets, education, goals_bullets")
        .eq("user_id", user.id)
        .single()

      if (error || !profile) {
        // No profile exists - create an empty one for manual building
        const { data: newProfile, error: insertError } = await supabase
          .from("master_profiles")
          .insert({
            user_id: user.id,
            bio: "",
            bio_bullets: [],
            jobs: [],
            achievements_bullets: [],
            experience_bullets: [],
            education: [],
            goals_bullets: [],
            completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select("id, bio, bio_bullets, jobs, achievements_bullets, experience_bullets, education, goals_bullets")
          .single()

        if (insertError || !newProfile) {
          console.error("Error creating profile:", insertError)
          router.push("/dashboard/welcome")
          return
        }

        setProfileData(newProfile as ProfileData)
        setLoading(false)
        return
      }

      setProfileData(profile as ProfileData)
      setLoading(false)
    }

    fetchProfile()
  }, [router])

  const startEditing = (section: EditingSection) => {
    if (!profileData || !section) return

    if (section === "bio") {
      setEditBuffer(profileData.bio || "")
    } else if (section === "jobs") {
      setEditJobsBuffer([...(profileData.jobs || [])])
    } else if (section === "education") {
      setEditEducationBuffer([...(profileData.education || [])])
    } else {
      const bulletKey = `${section}_bullets` as keyof ProfileData
      setEditArrayBuffer([...(profileData[bulletKey] as string[] || [])])
    }
    setEditingSection(section)
  }

  const cancelEditing = () => {
    setEditingSection(null)
    setEditBuffer("")
    setEditArrayBuffer([])
    setEditJobsBuffer([])
    setEditEducationBuffer([])
  }

  const saveSection = async () => {
    if (!profileData || !editingSection) return

    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/signin")
        return
      }

      let updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      if (editingSection === "bio") {
        updateData.bio = editBuffer
      } else if (editingSection === "jobs") {
        // Filter out jobs with empty company and title
        updateData.jobs = editJobsBuffer.filter(job => job.company.trim() || job.title.trim())
      } else if (editingSection === "education") {
        // Filter out education with empty degree and institution
        updateData.education = editEducationBuffer.filter(edu => edu.degree.trim() || edu.institution.trim())
      } else {
        const bulletKey = `${editingSection}_bullets`
        updateData[bulletKey] = editArrayBuffer.filter(item => item.trim() !== "")
      }

      const { error: updateError } = await supabase
        .from("master_profiles")
        .update(updateData)
        .eq("user_id", user.id)

      if (updateError) throw updateError

      // Update local state
      if (editingSection === "bio") {
        setProfileData({ ...profileData, bio: editBuffer })
      } else if (editingSection === "jobs") {
        setProfileData({
          ...profileData,
          jobs: editJobsBuffer.filter(job => job.company.trim() || job.title.trim()),
        })
      } else if (editingSection === "education") {
        setProfileData({
          ...profileData,
          education: editEducationBuffer.filter(edu => edu.degree.trim() || edu.institution.trim()),
        })
      } else {
        const bulletKey = `${editingSection}_bullets` as keyof ProfileData
        setProfileData({
          ...profileData,
          [bulletKey]: editArrayBuffer.filter(item => item.trim() !== ""),
        })
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
      setEditingSection(null)
      setEditBuffer("")
      setEditArrayBuffer([])
      setEditJobsBuffer([])
      setEditEducationBuffer([])
    } catch (err) {
      console.error("Error saving profile:", err)
      setError("Failed to save changes. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const addBulletItem = () => {
    setEditArrayBuffer([...editArrayBuffer, ""])
  }

  const updateBulletItem = (index: number, value: string) => {
    const newBuffer = [...editArrayBuffer]
    newBuffer[index] = value
    setEditArrayBuffer(newBuffer)
  }

  const removeBulletItem = (index: number) => {
    setEditArrayBuffer(editArrayBuffer.filter((_, i) => i !== index))
  }

  // Job helpers
  const addJob = () => {
    setEditJobsBuffer([...editJobsBuffer, { ...emptyJob }])
  }

  const updateJob = (index: number, field: keyof Job, value: string) => {
    const newJobs = [...editJobsBuffer]
    newJobs[index] = { ...newJobs[index], [field]: value }
    setEditJobsBuffer(newJobs)
  }

  const removeJob = (index: number) => {
    setEditJobsBuffer(editJobsBuffer.filter((_, i) => i !== index))
  }

  // Education helpers
  const addEducation = () => {
    setEditEducationBuffer([...editEducationBuffer, { ...emptyEducation }])
  }

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const newEducation = [...editEducationBuffer]
    newEducation[index] = { ...newEducation[index], [field]: value }
    setEditEducationBuffer(newEducation)
  }

  const removeEducation = (index: number) => {
    setEditEducationBuffer(editEducationBuffer.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (!profileData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Success Toast */}
      {saveSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            Changes saved!
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 shadow-lg flex items-center gap-3">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
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
              href="/dashboard"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">Edit Profile</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Master Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Edit your profile information below. This data is used to generate personalized applications.</p>
        </div>

        <div className="space-y-6">
          {/* Bio Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bio</h2>
              {editingSection !== "bio" ? (
                <button
                  onClick={() => startEditing("bio")}
                  className="flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium text-sm"
                >
                  <PenLine className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveSection}
                    disabled={saving}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save
                  </button>
                </div>
              )}
            </div>
            <div className="p-6">
              {editingSection === "bio" ? (
                <textarea
                  value={editBuffer}
                  onChange={(e) => setEditBuffer(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                  placeholder="Write a brief bio about yourself..."
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300">
                  {profileData.bio || <span className="text-gray-400 italic">No bio added yet</span>}
                </p>
              )}
            </div>
          </div>

          {/* Jobs/Work Experience Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Work Experience</h2>
              </div>
              {editingSection !== "jobs" ? (
                <button
                  onClick={() => startEditing("jobs")}
                  className="flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium text-sm"
                >
                  <PenLine className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveSection}
                    disabled={saving}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save
                  </button>
                </div>
              )}
            </div>
            <div className="p-6">
              {editingSection === "jobs" ? (
                <div className="space-y-4">
                  {editJobsBuffer.map((job, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Position {index + 1}
                        </span>
                        <button
                          onClick={() => removeJob(index)}
                          className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={job.title}
                          onChange={(e) => updateJob(index, "title", e.target.value)}
                          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                          placeholder="Job Title"
                        />
                        <input
                          type="text"
                          value={job.company}
                          onChange={(e) => updateJob(index, "company", e.target.value)}
                          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                          placeholder="Company"
                        />
                        <input
                          type="text"
                          value={job.location}
                          onChange={(e) => updateJob(index, "location", e.target.value)}
                          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                          placeholder="Location (e.g., San Francisco, CA)"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={job.start_date}
                            onChange={(e) => updateJob(index, "start_date", e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                            placeholder="Start (e.g., Jan 2023)"
                          />
                          <input
                            type="text"
                            value={job.end_date}
                            onChange={(e) => updateJob(index, "end_date", e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                            placeholder="End (or Present)"
                          />
                        </div>
                      </div>
                      <textarea
                        value={job.description}
                        onChange={(e) => updateJob(index, "description", e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm resize-none"
                        placeholder="Brief description of your role and key responsibilities..."
                      />
                    </div>
                  ))}
                  <button
                    onClick={addJob}
                    className="flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Position
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {profileData.jobs && profileData.jobs.length > 0 ? (
                    profileData.jobs.map((job, index) => (
                      <div key={index} className="border-l-2 border-amber-500 pl-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">{job.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          {job.company}
                          {job.location && (
                            <>
                              <span className="text-gray-300 dark:text-gray-600">•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {job.location}
                              </span>
                            </>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {job.start_date} - {job.end_date}
                        </p>
                        {job.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{job.description}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 italic">No work experience added yet</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Experience Highlights Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Experience Highlights</h2>
              {editingSection !== "experience" ? (
                <button
                  onClick={() => startEditing("experience")}
                  className="flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium text-sm"
                >
                  <PenLine className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveSection}
                    disabled={saving}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save
                  </button>
                </div>
              )}
            </div>
            <div className="p-6">
              {editingSection === "experience" ? (
                <div className="space-y-3">
                  {editArrayBuffer.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateBulletItem(index, e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                        placeholder="Add experience item..."
                      />
                      <button
                        onClick={() => removeBulletItem(index)}
                        className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addBulletItem}
                    className="flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Experience
                  </button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {profileData.experience_bullets && profileData.experience_bullets.length > 0 ? (
                    profileData.experience_bullets.map((item, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {item}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400 italic">No experience added yet</li>
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* Achievements Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Achievements</h2>
              {editingSection !== "achievements" ? (
                <button
                  onClick={() => startEditing("achievements")}
                  className="flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium text-sm"
                >
                  <PenLine className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveSection}
                    disabled={saving}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save
                  </button>
                </div>
              )}
            </div>
            <div className="p-6">
              {editingSection === "achievements" ? (
                <div className="space-y-3">
                  {editArrayBuffer.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateBulletItem(index, e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                        placeholder="Add achievement..."
                      />
                      <button
                        onClick={() => removeBulletItem(index)}
                        className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addBulletItem}
                    className="flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Achievement
                  </button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {profileData.achievements_bullets && profileData.achievements_bullets.length > 0 ? (
                    profileData.achievements_bullets.map((item, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {item}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400 italic">No achievements added yet</li>
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* Education Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Education</h2>
              </div>
              {editingSection !== "education" ? (
                <button
                  onClick={() => startEditing("education")}
                  className="flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium text-sm"
                >
                  <PenLine className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveSection}
                    disabled={saving}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save
                  </button>
                </div>
              )}
            </div>
            <div className="p-6">
              {editingSection === "education" ? (
                <div className="space-y-4">
                  {editEducationBuffer.map((edu, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Education {index + 1}
                        </span>
                        <button
                          onClick={() => removeEducation(index)}
                          className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, "degree", e.target.value)}
                          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                          placeholder="Degree (e.g., BS Computer Science)"
                        />
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => updateEducation(index, "institution", e.target.value)}
                          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                          placeholder="Institution"
                        />
                        <input
                          type="text"
                          value={edu.graduation_year}
                          onChange={(e) => updateEducation(index, "graduation_year", e.target.value)}
                          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm md:col-span-2"
                          placeholder="Graduation Year (e.g., 2024 or Expected 2025)"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addEducation}
                    className="flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Education
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {profileData.education && profileData.education.length > 0 ? (
                    profileData.education.map((edu, index) => (
                      <div key={index} className="border-l-2 border-amber-500 pl-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">{edu.degree}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {edu.institution}
                          {edu.graduation_year && (
                            <span className="text-gray-400 dark:text-gray-500"> • {edu.graduation_year}</span>
                          )}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 italic">No education added yet</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Goals Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Goals</h2>
              {editingSection !== "goals" ? (
                <button
                  onClick={() => startEditing("goals")}
                  className="flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium text-sm"
                >
                  <PenLine className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveSection}
                    disabled={saving}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save
                  </button>
                </div>
              )}
            </div>
            <div className="p-6">
              {editingSection === "goals" ? (
                <div className="space-y-3">
                  {editArrayBuffer.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateBulletItem(index, e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                        placeholder="Add goal..."
                      />
                      <button
                        onClick={() => removeBulletItem(index)}
                        className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addBulletItem}
                    className="flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Goal
                  </button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {profileData.goals_bullets && profileData.goals_bullets.length > 0 ? (
                    profileData.goals_bullets.map((item, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        {item}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400 italic">No goals added yet</li>
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* Re-import Option */}
          <div className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Want to start fresh? Re-import your profile from a resume.
            </p>
            <Link
              href="/dashboard/profile/setup"
              className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium"
            >
              Re-import Profile
            </Link>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
