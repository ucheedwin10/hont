"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Redirect to feed page - opportunities page is now handled by /dashboard/feed
export default function OpportunitiesPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard/feed")
  }, [router])

  return null
}
