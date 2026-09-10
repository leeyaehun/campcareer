import "server-only"

import { cache } from "react"
import { getCareerProfile } from "./career-read-model"

/** Public read boundary used by canonical Career routes and their API. */
export const getPublicCareerProfile = cache(async (countryCode: string, careerId: string) => {
  const profile = await getCareerProfile({ countryCode, careerId })
  if (!profile?.country) return null
  return profile
})
