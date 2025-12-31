/**
 * Checks if a user's profile is complete based on localStorage data.
 * In a production app, this would query Supabase for the user's profile.
 *
 * @returns true if profile exists and has required fields filled
 */
export function checkProfileComplete(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    const profileData = localStorage.getItem("masterProfileV2")
    if (!profileData) {
      return false
    }

    const profile = JSON.parse(profileData)

    // Profile is considered complete if user has at least filled in bio or field
    const hasBasicInfo = Boolean(
      (profile.bio && profile.bio.trim().length > 0) ||
      (profile.field && profile.field.trim().length > 0)
    )

    return hasBasicInfo
  } catch (error) {
    console.error("Error checking profile completion:", error)
    return false
  }
}

/**
 * Gets the profile data from localStorage
 */
export function getProfileData() {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const profileData = localStorage.getItem("masterProfileV2")
    if (!profileData) {
      return null
    }
    return JSON.parse(profileData)
  } catch (error) {
    console.error("Error getting profile data:", error)
    return null
  }
}

/**
 * Checks if user has started (but not completed) their profile
 */
export function hasStartedProfile(): boolean {
  const profile = getProfileData()
  return profile !== null
}
