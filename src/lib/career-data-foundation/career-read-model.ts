import "server-only"

import { cache } from "react"
import { getCareerDataFoundation } from "./read"
import { getCareerMarketInsight } from "@/lib/workspace/career-market-read"
import { toCareerProfile, type CareerProfile } from "./career-profile-contract"

export const getCareerProfile = cache(async ({
  countryCode,
  careerId,
}: {
  countryCode: string
  careerId: string
}): Promise<CareerProfile | null> => {
  const country = countryCode.trim().toUpperCase()
  const [insight, foundationCandidate] = await Promise.all([
    getCareerMarketInsight({ countryCode: country, careerId }),
    /^[A-Z]{2}$/.test(country)
      ? getCareerDataFoundation({ countryCode: country, careerId })
      : Promise.resolve(null),
  ])
  return insight ? toCareerProfile(insight, foundationCandidate) : null
})
