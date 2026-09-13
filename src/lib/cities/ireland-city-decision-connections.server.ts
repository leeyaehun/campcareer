import "server-only"

import { cache } from "react"
import type {
  CareerDegreePath,
  IrelandInstitutionCareerDegreeEvidence,
} from "@/lib/career-degree/contract"
import { getIrelandCountryDegreeInstitutionConnections } from "@/lib/career-degree/ireland-institution-evidence.server"
import {
  isPublishedIeCitySlug,
  normalizeCitySlug,
} from "@/lib/cities/city-routes"
import {
  getIrelandInstitutions,
  type IrelandInstitution,
} from "@/lib/institutions/ireland-institutions.server"

export type IrelandCityDecisionConnections = {
  institutions: readonly IrelandInstitution[]
  careerDegreeEvidence: readonly IrelandInstitutionCareerDegreeEvidence[]
}

const EMPTY_CONNECTIONS: IrelandCityDecisionConnections = {
  institutions: [],
  careerDegreeEvidence: [],
}

const strengthOrder: Record<CareerDegreePath["relationshipStrength"], number> = {
  primary: 0,
  strong: 1,
  supporting: 2,
}

function institutionLocationsInCity(
  institutions: readonly IrelandInstitution[],
  citySlug: string,
) {
  return institutions
    .flatMap((institution) => {
      const locations = institution.locations.filter((location) => location.city.slug === citySlug)
      return locations.length > 0 ? [{ ...institution, locations }] : []
    })
    .sort((left, right) => left.name.localeCompare(right.name))
}

async function loadIrelandCityDecisionConnections(
  city: string,
): Promise<IrelandCityDecisionConnections> {
  const citySlug = normalizeCitySlug(city)
  if (!citySlug || !isPublishedIeCitySlug(citySlug)) return EMPTY_CONNECTIONS

  try {
    // These are country-level, cached reads. Filtering their already-reviewed
    // results avoids issuing one relation request for every institution.
    const [allInstitutions, countryConnections] = await Promise.all([
      getIrelandInstitutions(),
      getIrelandCountryDegreeInstitutionConnections(),
    ])
    const institutions = institutionLocationsInCity(allInstitutions, citySlug)
    const institutionSlugs = new Set(institutions.map((institution) => institution.slug))

    const careerDegreeEvidence = countryConnections
      .flatMap((connection) => connection.careers.flatMap((career) => {
        const institution = career.evidenceInstitution
        return institution && institutionSlugs.has(institution.slug)
          ? [{ degree: connection.degree, career, institution }]
          : []
      }))
      .sort((left, right) => (
        strengthOrder[left.career.relationshipStrength] - strengthOrder[right.career.relationshipStrength]
        || left.degree.name.localeCompare(right.degree.name)
        || left.career.careerName.localeCompare(right.career.careerName)
      ))

    return { institutions, careerDegreeEvidence }
  } catch (error) {
    // Keep the verified city context available if the optional continuation
    // sources are temporarily unavailable, matching the Country Hub fallback.
    console.error("Unable to load Ireland City decision connections", error)
    return EMPTY_CONNECTIONS
  }
}

/**
 * P1.5 City read: verified Institution locations and only their existing
 * reviewed Degree → Career evidence. It never infers programme delivery.
 */
export const getIrelandCityDecisionConnections = cache(loadIrelandCityDecisionConnections)
