import type { LaunchCountryCode } from "@/data/launch-countries"
import type { CareerFoundationScoreComponent, FoundationComponentKey } from "@/lib/career-data-foundation/types"

export type ScoreReadyCareerProfile = {
  countryCode: LaunchCountryCode
  careerId: string
  sourceCheckedAt: string
}

/**
 * Public CampCareer Score readiness inventory.
 *
 * Keep this aligned with docs/CAREER_COVERAGE_INVENTORY.md. A legacy profile,
 * provisional component total or SEO route is not enough to make a public
 * CampCareer Score ready. Missing evidence must remain Score not ready yet.
 */
export const SCORE_READY_CAREER_PROFILES: readonly ScoreReadyCareerProfile[] = [
  { countryCode: "AU", careerId: "care-worker", sourceCheckedAt: "2026-08-14" },
  { countryCode: "AU", careerId: "carpenter", sourceCheckedAt: "2026-08-06" },
  { countryCode: "AU", careerId: "electrician", sourceCheckedAt: "2026-08-06" },
  { countryCode: "AU", careerId: "medical-laboratory-technician", sourceCheckedAt: "2026-08-15" },
  { countryCode: "AU", careerId: "midwife", sourceCheckedAt: "2026-08-07" },
  { countryCode: "AU", careerId: "occupational-therapist", sourceCheckedAt: "2026-08-08" },
  { countryCode: "AU", careerId: "pharmacist", sourceCheckedAt: "2026-08-15" },
  { countryCode: "AU", careerId: "physiotherapist", sourceCheckedAt: "2026-08-07" },
  { countryCode: "AU", careerId: "radiographer", sourceCheckedAt: "2026-08-15" },
  { countryCode: "AU", careerId: "registered-nurse", sourceCheckedAt: "2026-08-06" },
  { countryCode: "AU", careerId: "welder", sourceCheckedAt: "2026-08-14" },
  { countryCode: "IE", careerId: "civil-engineer", sourceCheckedAt: "2026-09-12" },
  { countryCode: "IE", careerId: "construction-manager", sourceCheckedAt: "2026-09-12" },
  { countryCode: "IE", careerId: "cybersecurity-analyst", sourceCheckedAt: "2026-09-12" },
  { countryCode: "IE", careerId: "data-engineer", sourceCheckedAt: "2026-09-12" },
  { countryCode: "IE", careerId: "radiographer", sourceCheckedAt: "2026-09-12" },
  { countryCode: "IE", careerId: "software-developer", sourceCheckedAt: "2026-09-12" },
] as const

const scoreReadyKeys = new Set(
  SCORE_READY_CAREER_PROFILES.map(({ countryCode, careerId }) => `${countryCode}:${careerId}`),
)

const PUBLIC_FOUNDATION_COMPONENTS: readonly FoundationComponentKey[] = [
  "shortage_signal",
  "vacancy_intensity",
  "industry_diversity",
  "employment_momentum",
  "projected_growth",
  "relative_salary",
  "entry_accessibility",
  "entry_burden",
] as const

const FOUNDATION_MISSING_EVIDENCE = new Set([
  "no_evidence_found",
  "insufficient_industry_coverage",
])

export function isCareerScoreReady(countryCode: string, careerId: string) {
  const key = `${countryCode.trim().toUpperCase()}:${careerId.trim().toLowerCase()}`
  return scoreReadyKeys.has(key)
}

/**
 * Foundation `scoreReady` is an internal-engine readiness flag. Public Score
 * requires stricter evidence semantics: every non-visa public component must
 * actually have evidence rather than a placeholder zero for missing coverage.
 */
export function hasStrictFoundationPublicScoreEvidence(
  components: readonly CareerFoundationScoreComponent[],
) {
  const byKey = new Map(components.map((component) => [component.componentKey, component]))
  return PUBLIC_FOUNDATION_COMPONENTS.every((key) => {
    const component = byKey.get(key)
    return Boolean(
      component
      && component.availability === "available"
      && component.scoreValue != null
      && Number.isFinite(component.scoreValue)
      && !FOUNDATION_MISSING_EVIDENCE.has(component.evidenceStatus),
    )
  })
}
