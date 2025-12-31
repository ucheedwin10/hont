import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const type = searchParams.get('type')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.user) {
      // Check if this is an email confirmation (signup, email change, etc.)
      if (type === 'signup' || type === 'email') {
        // New user email confirmation - show success page
        return NextResponse.redirect(`${origin}/auth/confirm`)
      }

      if (type === 'recovery') {
        // Password recovery - redirect to password reset page if you have one
        return NextResponse.redirect(`${origin}/auth/reset-password`)
      }

      // Check if user is new (no profile data yet) - for OAuth users
      const isNewUser = data.user.created_at &&
        new Date(data.user.created_at).getTime() > Date.now() - 60000 // Created within last minute

      if (isNewUser) {
        return NextResponse.redirect(`${origin}/dashboard/welcome`)
      }

      // Existing user signing in via OAuth
      return NextResponse.redirect(`${origin}${next}`)
    }

    // If there's an error but it's related to email confirmation already done
    if (error?.message?.includes('already confirmed') ||
        error?.message?.includes('expired') ||
        error?.message?.includes('invalid')) {
      // User might have already confirmed - redirect to signin with a neutral message
      return NextResponse.redirect(`${origin}/auth/signin`)
    }
  }

  // Return the user to signin without error for edge cases
  return NextResponse.redirect(`${origin}/auth/signin`)
}
