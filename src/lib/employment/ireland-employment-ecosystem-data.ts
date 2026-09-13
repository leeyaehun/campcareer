import {
  isPublishedIeCitySlug,
  type PublishedIeCitySlug,
} from "@/lib/cities/city-routes"
import {
  IE_CAREER_COMPARE_IDS,
  type IrelandCareerCompareId,
} from "@/lib/ireland-career-comparison"
import type {
  IrelandEmploymentEcosystem,
  IrelandEmployerCityConnection,
} from "./ireland-employment-ecosystem-contract"

const SOLAS_NSB_2025 = {
  authority: "SOLAS Skills and Labour Market Research Unit",
  title: "National Skills Bulletin 2025",
  url: "https://www.solas.ie/f/70398/x/893ebacfd9/national-skills-bulletin-2025.pdf",
  checkedAt: "2026-09-12",
} as const

const MICROSOFT_IRELAND = {
  authority: "Microsoft Ireland",
  title: "Microsoft Ireland leadership team",
  url: "https://www.microsoft.com/en-ie/aboutireland/managementteam",
  checkedAt: "2026-09-13",
} as const

const SISK_IRELAND = {
  authority: "Sisk",
  title: "Construction across Ireland",
  url: "https://sisk.com/",
  checkedAt: "2026-09-13",
} as const

const SISK_CONSTRUCTION_MANAGER = {
  authority: "Sisk",
  title: "Astellas, Tralee, Co. Kerry",
  url: "https://sisk.com/what-we-do/projects/astellas",
  checkedAt: "2026-09-13",
} as const

const HSE_JOBS = {
  authority: "Health Service Executive",
  title: "Jobs in the HSE",
  url: "https://about.hse.ie/jobs/",
  checkedAt: "2026-09-13",
} as const

const HSE_RADIOGRAPHY = {
  authority: "Health Service Executive",
  title: "Radiography Pathway — HSE Career Hub",
  url: "https://careerhub.hse.ie/pathways_radiography/",
  checkedAt: "2026-09-13",
} as const

const asPublishedIrelandCity = (value: string): PublishedIeCitySlug => {
  if (!isPublishedIeCitySlug(value)) throw new Error(`Unsupported Ireland employer city: ${value}`)
  return value
}

const DUBLIN_MICROSOFT_SITE: IrelandEmployerCityConnection = {
  citySlug: asPublishedIrelandCity("dublin"),
  cityName: "Dublin",
  rationale: "Microsoft Ireland identifies its Microsoft Technology Centre in Dublin. This confirms a location context only.",
  evidence: MICROSOFT_IRELAND,
}

/**
 * Small, reviewed P1.6 source data. It intentionally models relationship
 * provenance, not live vacancies, hiring volume, salary or visa support.
 */
export const IRELAND_EMPLOYMENT_ECOSYSTEM: IrelandEmploymentEcosystem = {
  countryCode: "IE",
  industries: [
    {
      id: "ie-ict",
      slug: "ict",
      name: "Information and communication technology",
      rationale: "SOLAS sector-share evidence for the broader ICT occupational family supports this bounded career context; it is not a current-hiring measure.",
      evidence: SOLAS_NSB_2025,
      careers: [
        {
          careerId: "software-developer",
          rationale: "SOLAS uses broader ICT occupational-family evidence for this reviewed Career's industry context.",
          evidence: SOLAS_NSB_2025,
        },
        {
          careerId: "cybersecurity-analyst",
          rationale: "SOLAS uses broader ICT occupational-family evidence for this reviewed Career's industry context.",
          evidence: SOLAS_NSB_2025,
        },
        {
          careerId: "data-engineer",
          rationale: "SOLAS uses broader ICT occupational-family evidence for this reviewed Career's industry context.",
          evidence: SOLAS_NSB_2025,
        },
      ],
    },
    {
      id: "ie-construction",
      slug: "construction",
      name: "Construction",
      rationale: "SOLAS sector-share evidence for the broader construction occupational family supports this bounded career context; it is not a current-hiring measure.",
      evidence: SOLAS_NSB_2025,
      careers: [
        {
          careerId: "civil-engineer",
          rationale: "SOLAS uses broader construction occupational-family evidence for this reviewed Career's industry context.",
          evidence: SOLAS_NSB_2025,
        },
        {
          careerId: "construction-manager",
          rationale: "SOLAS uses broader construction occupational-family evidence for this reviewed Career's industry context.",
          evidence: SOLAS_NSB_2025,
        },
      ],
    },
    {
      id: "ie-healthcare",
      slug: "healthcare",
      name: "Healthcare",
      rationale: "SOLAS sector-share evidence for the broader healthcare occupational family supports this bounded career context; it is not a current-hiring measure.",
      evidence: SOLAS_NSB_2025,
      careers: [
        {
          careerId: "radiographer",
          rationale: "SOLAS uses broader healthcare occupational-family evidence for this reviewed Career's industry context.",
          evidence: SOLAS_NSB_2025,
        },
      ],
    },
  ],
  employers: [
    {
      id: "ie:microsoft",
      slug: "microsoft",
      name: "Microsoft Ireland",
      industryId: "ie-ict",
      irelandPresence: MICROSOFT_IRELAND,
      careersUrl: "https://careers.microsoft.com/v2/global/en/home.html",
      careersSourceTitle: "Microsoft Careers",
      checkedAt: "2026-09-13",
      careers: [
        {
          careerId: "software-developer",
          rationale: "Microsoft Ireland identifies Software Engineering among its Ireland business-unit footprint. This is employer context, not a vacancy claim.",
          evidence: MICROSOFT_IRELAND,
        },
      ],
      cities: [DUBLIN_MICROSOFT_SITE],
    },
    {
      id: "ie:sisk",
      slug: "sisk",
      name: "Sisk",
      industryId: "ie-construction",
      irelandPresence: SISK_IRELAND,
      careersUrl: "https://sisk.com/careers/",
      careersSourceTitle: "Sisk Careers",
      checkedAt: "2026-09-13",
      careers: [
        {
          careerId: "construction-manager",
          rationale: "Sisk identifies its Construction Manager role on an Ireland project. This is employer context, not a vacancy claim.",
          evidence: SISK_CONSTRUCTION_MANAGER,
        },
      ],
      cities: [],
    },
    {
      id: "ie:hse",
      slug: "hse",
      name: "Health Service Executive",
      industryId: "ie-healthcare",
      irelandPresence: HSE_JOBS,
      careersUrl: "https://about.hse.ie/jobs/",
      careersSourceTitle: "HSE careers",
      checkedAt: "2026-09-13",
      careers: [
        {
          careerId: "radiographer",
          rationale: "The HSE's radiography pathway explicitly describes the radiographer role with the HSE. This is employer context, not a vacancy claim.",
          evidence: HSE_RADIOGRAPHY,
        },
      ],
      cities: [],
    },
  ],
  opportunities: {
    kind: "evergreen_employer_context_only",
    publishedOpportunities: [],
    rationale: "No Ireland time-sensitive opportunity is published because the existing opportunity table has no verified Ireland rows or expiry-safe employer identity model. Official employer careers URLs remain evergreen continuation context only.",
  },
}

export function isReviewedIrelandEmploymentCareer(value: string): value is IrelandCareerCompareId {
  return (IE_CAREER_COMPARE_IDS as readonly string[]).includes(value)
}

export function assertIrelandEmploymentEcosystem(data: IrelandEmploymentEcosystem) {
  if (data.countryCode !== "IE" || data.opportunities.kind !== "evergreen_employer_context_only" || data.opportunities.publishedOpportunities.length !== 0) {
    throw new Error("Ireland employment publication boundary is invalid")
  }

  const industryIds = new Set<string>()
  const employerIds = new Set<string>()
  const careers = new Set<string>()

  for (const industry of data.industries) {
    if (!industry.id || industryIds.has(industry.id) || !industry.evidence.url || industry.careers.length === 0) {
      throw new Error("Ireland industry evidence is invalid")
    }
    industryIds.add(industry.id)
    for (const connection of industry.careers) {
      if (!isReviewedIrelandEmploymentCareer(connection.careerId) || !connection.evidence.url || !connection.rationale) {
        throw new Error(`Ireland industry-career evidence is invalid: ${connection.careerId}`)
      }
      careers.add(connection.careerId)
    }
  }

  for (const employer of data.employers) {
    if (!employer.id || employerIds.has(employer.id) || !industryIds.has(employer.industryId) || !employer.irelandPresence.url || !employer.careersUrl) {
      throw new Error(`Ireland selected employer is invalid: ${employer.id}`)
    }
    employerIds.add(employer.id)
    for (const connection of employer.careers) {
      if (!careers.has(connection.careerId) || !connection.evidence.url || !connection.rationale) {
        throw new Error(`Ireland employer-career evidence is invalid: ${connection.careerId}`)
      }
    }
    for (const city of employer.cities) {
      if (!isPublishedIeCitySlug(city.citySlug) || !city.evidence.url || !city.rationale) {
        throw new Error(`Ireland employer-city evidence is invalid: ${city.citySlug}`)
      }
    }
  }

  return data
}

assertIrelandEmploymentEcosystem(IRELAND_EMPLOYMENT_ECOSYSTEM)
