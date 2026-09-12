import "server-only"

import { getPublicCareerPageProfile } from "@/lib/career-data-foundation/public-career-profile-read"
import {
  IE_CAREER_COMPARE_IDS,
  type IrelandCareerCompareId,
  type IrelandCareerCompareItem,
} from "@/lib/ireland-career-comparison"

async function getIrelandCareerCompareItem(
  careerId: IrelandCareerCompareId,
): Promise<IrelandCareerCompareItem | null> {
  const profile = await getPublicCareerPageProfile("IE", careerId)
  if (!profile?.score || !profile.readiness.publishReady) return null

  const foundation = profile.compatibility.foundation
  return {
    id: careerId,
    label: profile.identity.label,
    officialTitle: profile.officialOccupation?.title ?? null,
    score: profile.score,
    confidence: foundation?.scoreConfidence ?? "limited_evidence",
    registrationRequired: profile.entryRequirements.registrationRequired,
    sourceCheckedOn: foundation?.sourceCheckedOn ?? profile.sources[0]?.lastVerifiedOn ?? null,
    sourceLabels: profile.sources.slice(0, 3).map((source) => source.label),
  }
}

export async function getIrelandCareerCompareCatalog(): Promise<readonly IrelandCareerCompareItem[]> {
  const rows = await Promise.all(
    IE_CAREER_COMPARE_IDS.map((careerId) => getIrelandCareerCompareItem(careerId)),
  )
  return rows.filter((row): row is IrelandCareerCompareItem => Boolean(row))
}
