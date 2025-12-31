"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function EmailConfirmPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Start countdown after a brief initial display
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsRedirecting(true)
          // Small delay before redirect to show "Redirecting..."
          setTimeout(() => {
            router.push("/dashboard/welcome")
          }, 500)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
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
        <div className="max-w-lg w-full text-center animate-fadeIn">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/25">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Email Verified!
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Your account is ready. Let&apos;s get started.
          </p>

          {/* Countdown Display */}
          <div className="mb-8">
            {isRedirecting ? (
              <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
                <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-lg font-medium">Redirecting...</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-full px-6 py-3">
                <span className="text-gray-600 dark:text-gray-400">Redirecting in</span>
                <span className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-xl font-bold text-white">
                  {countdown}
                </span>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <Link
            href="/dashboard/welcome"
            className="inline-flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold py-4 px-8 rounded-xl text-lg transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
          >
            Continue Now
            <ArrowRight className="w-5 h-5" />
          </Link>

          {/* Subtext */}
          <p className="mt-6 text-sm text-gray-400 dark:text-gray-500">
            Or wait for automatic redirect
          </p>
        </div>
      </main>
    </div>
  )
}
