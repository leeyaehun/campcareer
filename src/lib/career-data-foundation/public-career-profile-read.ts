import "server-only"

import { cache } from "react"
import { unstable_cache } from "next/cache"
import { getCareerProfile } from "./career-read-model"
import { toCareerProfile } from "./career-profile-contract"
import { getCareerMarketInsight } from "@/lib/workspace/career-market-read"

/** Public read boundary used by canonical Career routes and their API. */
async function loadPublicCareerProfile(countryCode: string, careerId: string) {
  const profile = await getCareerProfile({ countryCode, careerId })
  if (!profile?.country) return null
  return profile
}

const getCachedPublicCareerProfile = unstable_cache(
  loadPublicCareerProfile,
  ["public-career-profile-v1"],
  { revalidate: 3600, tags: ["public-career-profile"] },
)

export const getPublicCareerProfile = cache((countryCode: string, careerId: string) =>
  getCachedPublicCareerProfile(countryCode.trim().toUpperCase(), careerId),
)


/** Lean read boundary for canonical Career pages; cross-country recommendations are not rendered there. */
async function loadPublicCareerPageProfile(countryCode: string, careerId: string) {
  const insight = await getCareerMarketInsight({
    countryCode,
    careerId,
    includeRecommendations: false,
  })
  if (!insight?.country) return null
  return toCareerProfile(insight, insight.foundation)
}

const getCachedPublicCareerPageProfile = unstable_cache(
  loadPublicCareerPageProfile,
  ["public-career-page-profile-v1"],
  { revalidate: 3600, tags: ["public-career-page-profile"] },
)

export const getPublicCareerPageProfile = cache((countryCode: string, careerId: string) =>
  getCachedPublicCareerPageProfile(countryCode.trim().toUpperCase(), careerId),
)
