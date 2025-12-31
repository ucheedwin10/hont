"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sparkles, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function WelcomePage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string>("")

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/signin")
        return
      }

      // Check if profile already exists and is complete in master_profiles table
      const { data: profile } = await supabase
        .from("master_profiles")
        .select("id, completed")
        .eq("user_id", user.id)
        .single()

      if (profile?.completed) {
        // User already has completed profile, redirect to dashboard
        router.push("/dashboard")
        return
      }

      // Set user name from email
      setUserName(user.email?.split("@")[0] || "")
    }

    checkUser()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">Hont</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="max-w-lg w-full text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-amber-500/25">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {userName ? `Welcome, ${userName}!` : "Welcome!"}
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Great! You&apos;re ready to complete your first application.
          </p>

          <p className="text-gray-500 dark:text-gray-500 mb-10">
            First, let&apos;s build your profile. This helps us generate tailored applications for you.
          </p>

          {/* CTA Button */}
          <Link
            href="/dashboard/profile/setup"
            className="inline-flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold py-4 px-8 rounded-xl text-lg transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
          >
            Build My Profile Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>
    </div>
  )
}
