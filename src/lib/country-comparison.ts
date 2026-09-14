import {
  getCountryCompareCountry,
  type CountryCompareCode,
} from "@/data/country-comparison/locations"
import {
  REGISTERED_NURSE_COMPARE_GOAL,
  REGISTERED_NURSE_COMPARE_PROFILE,
  type CountryCompareGoal,
  type CountryCompareProfile,
} from "@/data/country-comparison/registered-nurse"
import {
  CANONICAL_COUNTRY_CODES,
  toCanonicalCountryCode,
  toProductCountryCode,
} from "@/lib/data-foundation/entity-aliases"

export const COUNTRY_COMPARE_TYPE = "country" as const
export const COUNTRY_COMPARE_MAX_COUNTRIES = 3
export const COUNTRY_COMPARE_MIN_COUNTRIES = 2

export type CountryCompareSlot = {
  countryCode: CountryCompareCode | null
  optional: boolean
}

export type CountryComparisonContextState = "supported" | "unsupported"

export type CountryComparisonState = {
  type: typeof COUNTRY_COMPARE_TYPE
  contextState: CountryComparisonContextState
  goal: CountryCompareGoal | null
  profile: CountryCompareProfile | null
  countries: readonly CountryCompareCode[]
}

export type ComparisonPageType = "program" | "country" | "career" | "unsupported"

export function resolveComparisonPageType(rawType: string | null): ComparisonPageType {
  if (rawType === null || rawType === "program") return "program"
  if (rawType === COUNTRY_COMPARE_TYPE) return "country"
  if (rawType === "career") return "career"
  return "unsupported"
}

export function toExternalIsoCountryCode(countryCode: CountryCompareCode): "AU" | "IE" | "GB" {
  return toCanonicalCountryCode(countryCode)!
}

export function fromExternalIsoCountryCode(value: string): CountryCompareCode | null {
  const normalized = value.trim().toUpperCase()
  if (!(CANONICAL_COUNTRY_CODES as readonly string[]).includes(normalized)) return null
  return toProductCountryCode(normalized) as CountryCompareCode
}

export function normalizeCountryCodes(raw: string | readonly string[] | null): CountryCompareCode[] {
  const values = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",") : []
  const selected: CountryCompareCode[] = []
  for (const value of values) {
    const code = value.trim().toUpperCase() as CountryCompareCode
    if (!getCountryCompareCountry(code) || selected.includes(code)) continue
    selected.push(code)
    if (selected.length >= COUNTRY_COMPARE_MAX_COUNTRIES) break
  }
  return selected
}

export function parseCountryComparisonState(searchParams: Pick<URLSearchParams, "get">): CountryComparisonState {
  const goal = searchParams.get("goal")
  const profile = searchParams.get("profile")
  const validGoal = goal === REGISTERED_NURSE_COMPARE_GOAL ? goal : null
  const validProfile = profile === REGISTERED_NURSE_COMPARE_PROFILE ? profile : null
  const contextState: CountryComparisonContextState = validGoal && validProfile ? "supported" : "unsupported"

  return {
    type: COUNTRY_COMPARE_TYPE,
    contextState,
    goal: validGoal,
    profile: validProfile,
    countries: contextState === "supported" ? normalizeCountryCodes(searchParams.get("countries")) : [],
  }
}

export function buildCountryCompareHref(countries: readonly CountryCompareCode[] = []): string {
  const codes = normalizeCountryCodes(countries).sort()
  const base = `/compare?type=${COUNTRY_COMPARE_TYPE}&goal=${REGISTERED_NURSE_COMPARE_GOAL}&profile=${REGISTERED_NURSE_COMPARE_PROFILE}`
  return codes.length ? `${base}&countries=${codes.join(",")}` : base
}

export function slotsFromCountryCodes(codes: readonly CountryCompareCode[]): CountryCompareSlot[] {
  const slots: CountryCompareSlot[] = codes.map((countryCode) => ({
    countryCode,
    optional: false,
  }))
  while (slots.length < COUNTRY_COMPARE_MIN_COUNTRIES) {
    slots.push({ countryCode: null, optional: false })
  }
  return slots
}

export function completeCountryCodes(slots: readonly CountryCompareSlot[]): CountryCompareCode[] {
  return normalizeCountryCodes(
    slots
      .filter((slot): slot is CountryCompareSlot & { countryCode: CountryCompareCode } => Boolean(slot.countryCode))
      .map((slot) => slot.countryCode)
      .join(","),
  )
}

export function replaceCountryInSlot(
  slots: readonly CountryCompareSlot[],
  index: number,
  countryCode: CountryCompareCode,
): CountryCompareSlot[] {
  if (index < 0 || index >= slots.length) return [...slots]
  if (slots.some((slot, slotIndex) => slotIndex !== index && slot.countryCode === countryCode)) return [...slots]
  return slots.map((slot, slotIndex) => slotIndex === index
    ? { countryCode, optional: slot.optional }
    : { ...slot })
}

export function removeCountrySlot(slots: readonly CountryCompareSlot[], index: number): CountryCompareSlot[] {
  if (index < 0 || index >= slots.length) return [...slots]
  const next = slots.filter((_, slotIndex) => slotIndex !== index).map((slot) => ({ ...slot }))
  while (next.length < COUNTRY_COMPARE_MIN_COUNTRIES) {
    next.push({ countryCode: null, optional: false })
  }
  return next
}

export function addCountrySlot(slots: readonly CountryCompareSlot[]): CountryCompareSlot[] {
  if (slots.length >= COUNTRY_COMPARE_MAX_COUNTRIES) return [...slots]
  return [...slots.map((slot) => ({ ...slot })), { countryCode: null, optional: true }]
}

export function cancelEmptyCountrySlot(slots: readonly CountryCompareSlot[], index: number): CountryCompareSlot[] {
  if (index < 0 || index >= slots.length || slots[index].countryCode || !slots[index].optional) return [...slots]
  return slots.filter((_, slotIndex) => slotIndex !== index).map((slot) => ({ ...slot }))
}

export { getCountryCompareCountry as getCountryCompareCountryOption }
