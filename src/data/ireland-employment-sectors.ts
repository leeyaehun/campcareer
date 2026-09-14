/**
 * Ireland's complete broad-sector employment observations from Figure 3.1 of
 * the SOLAS National Skills Bulletin 2025. The source table is expressed in
 * thousands of persons; values below are converted to persons for display.
 */
export const IRELAND_EMPLOYMENT_SECTOR_SOURCE = {
  authority: "SOLAS Skills and Labour Market Research Unit",
  title: "National Skills Bulletin 2025",
  dataset: "Figure 3.1 — Employment by Sector (000s), Quarter 4 2024",
  referencePeriod: "Q4 2024",
  sourceUnit: "thousand persons",
  unit: "persons",
  checkedAt: "2026-09-14",
  url: "https://www.solas.ie/f/70398/x/893ebacfd9/national-skills-bulletin-2025.pdf",
  methodology: "Source values in thousands were multiplied by 1,000; the source excludes instances where the sector of employment was not stated.",
} as const

export type IrelandEmploymentSectorId =
  | "health-social-work"
  | "industry"
  | "wholesale-retail"
  | "education"
  | "professional-services"
  | "accommodation-food"
  | "ict"
  | "construction"
  | "pad"
  | "finance"
  | "other-nace-activities"
  | "transport"
  | "agriculture"
  | "administrative-support"

export type IrelandEmploymentSectorObservation = {
  id: IrelandEmploymentSectorId
  officialLabel: string
  employmentCount: number
  source: typeof IRELAND_EMPLOYMENT_SECTOR_SOURCE
  /** A conceptual continuation into the reviewed Industry graph, not a taxonomy replacement. */
  relatedIndustryId?: "ie-ict" | "ie-construction" | "ie-healthcare"
}

const observation = (
  id: IrelandEmploymentSectorId,
  officialLabel: string,
  employmentCount: number,
  relatedIndustryId?: IrelandEmploymentSectorObservation["relatedIndustryId"],
): IrelandEmploymentSectorObservation => ({
  id,
  officialLabel,
  employmentCount,
  source: IRELAND_EMPLOYMENT_SECTOR_SOURCE,
  ...(relatedIndustryId ? { relatedIndustryId } : {}),
})

/** The full broad-sector cohort published by the source, in source order. */
export const IRELAND_EMPLOYMENT_SECTORS: readonly IrelandEmploymentSectorObservation[] = [
  observation("health-social-work", "Health & social work", 382_500, "ie-healthcare"),
  observation("industry", "Industry", 332_300),
  observation("wholesale-retail", "Wholesale & retail", 326_500),
  observation("education", "Education", 239_800),
  observation("professional-services", "Professional services", 198_500),
  observation("accommodation-food", "Accommodation & food", 184_400),
  observation("ict", "ICT", 182_900, "ie-ict"),
  observation("construction", "Construction", 176_000, "ie-construction"),
  observation("pad", "PAD", 151_400),
  observation("finance", "Finance", 141_500),
  observation("other-nace-activities", "Other NACE activities", 124_400),
  observation("transport", "Transport", 121_800),
  observation("agriculture", "Agriculture", 107_700),
  observation("administrative-support", "Administrative & support", 100_100),
]

/** Sort by employment size, with a stable alphabetical tie-breaker. */
export function getIrelandEmploymentSectorsSorted(
  sectors: readonly IrelandEmploymentSectorObservation[] = IRELAND_EMPLOYMENT_SECTORS,
): IrelandEmploymentSectorObservation[] {
  return [...sectors].sort((a, b) => b.employmentCount - a.employmentCount || a.officialLabel.localeCompare(b.officialLabel, "en"))
}

export function formatIrelandEmploymentCount(count: number): string {
  return new Intl.NumberFormat("en-IE").format(count)
}
