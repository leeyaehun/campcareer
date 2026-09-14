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

const GOOGLE_IRELAND = {
  authority: "Google Ireland",
  title: "Google Ireland Blog — Dublin EMEA HQ",
  url: "https://blog.google/intl/en-ie/about/",
  checkedAt: "2026-09-14",
} as const

const APPLE_IRELAND = {
  authority: "Apple Ireland",
  title: "Apple Cork campus — 40 years in Ireland",
  url: "https://www.apple.com/ie/newsroom/2020/11/apples-cork-campus-celebrates-40-years-of-community-and-looks-to-the-future/",
  checkedAt: "2026-09-14",
} as const

const BAM_IRELAND = {
  authority: "BAM Ireland",
  title: "BAM Ireland — construction and infrastructure",
  url: "https://www.bamireland.ie/",
  checkedAt: "2026-09-14",
} as const

const BAM_CIVIL_ENGINEER = {
  authority: "BAM Ireland",
  title: "National Children's Hospital Ireland",
  url: "https://www.bamireland.ie/case-studies/national-childrens-hospital-ireland",
  checkedAt: "2026-09-14",
} as const

const JONES_ENGINEERING = {
  authority: "Jones Engineering Group",
  title: "Jones Engineering Group — Dublin HQ",
  url: "https://joneseng.com/",
  checkedAt: "2026-09-14",
} as const

const ST_JAMES_HOSPITAL = {
  authority: "St James's Hospital",
  title: "Diagnostic Imaging — St James's Hospital",
  url: "https://www.stjames.ie/services/diagim/",
  checkedAt: "2026-09-14",
} as const

const MATER_HOSPITAL = {
  authority: "Mater Misericordiae University Hospital",
  title: "Radiology — Mater Hospital",
  url: "https://www.mater.ie/services/radiology/",
  checkedAt: "2026-09-14",
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

const DUBLIN_GOOGLE_SITE: IrelandEmployerCityConnection = {
  citySlug: asPublishedIrelandCity("dublin"),
  cityName: "Dublin",
  rationale: "Google identifies its Grand Canal Dock campus as its EMEA headquarters. This confirms a location context only.",
  evidence: GOOGLE_IRELAND,
}

const CORK_APPLE_SITE: IrelandEmployerCityConnection = {
  citySlug: asPublishedIrelandCity("cork"),
  cityName: "Cork",
  rationale: "Apple identifies its Cork campus as its European headquarters. This confirms a location context only.",
  evidence: APPLE_IRELAND,
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
      slug: "microsoft-ireland",
      name: "Microsoft Ireland",
      industryId: "ie-ict",
      descriptor: "Software and cloud technology company",
      websiteUrl: "https://www.microsoft.com/en-ie/",
      irelandPresenceDescription: "Microsoft operates an Irish campus at Grand Canal Dock, Dublin. Its Ireland business unit spans engineering, sales, marketing, and support functions.",
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
      id: "ie:google",
      slug: "google-ireland",
      name: "Google Ireland",
      industryId: "ie-ict",
      descriptor: "Internet services and software company",
      websiteUrl: "https://about.google/intl/en-ie/",
      irelandPresenceDescription: "Google's Dublin campus at Grand Canal Dock serves as the company's EMEA headquarters for engineering, sales, and operations teams across Europe, the Middle East, and Africa.",
      irelandPresence: GOOGLE_IRELAND,
      careersUrl: "https://careers.google.com/locations/dublin/",
      careersSourceTitle: "Google Careers — Dublin",
      checkedAt: "2026-09-14",
      careers: [
        {
          careerId: "software-developer",
          rationale: "Google Ireland operates engineering teams at its Dublin EMEA headquarters. This is employer context, not a vacancy claim.",
          evidence: GOOGLE_IRELAND,
        },
      ],
      cities: [DUBLIN_GOOGLE_SITE],
    },
    {
      id: "ie:apple",
      slug: "apple-ireland",
      name: "Apple Ireland",
      industryId: "ie-ict",
      descriptor: "Technology and electronics company",
      websiteUrl: "https://www.apple.com/ie/",
      irelandPresenceDescription: "Apple's European headquarters in Cork has operated since 1980, with engineering, operations, and support teams based on the campus.",
      irelandPresence: APPLE_IRELAND,
      careersUrl: "https://jobs.apple.com/",
      careersSourceTitle: "Apple Careers",
      checkedAt: "2026-09-14",
      careers: [],
      cities: [CORK_APPLE_SITE],
    },
    {
      id: "ie:sisk",
      slug: "sisk",
      name: "Sisk",
      industryId: "ie-construction",
      descriptor: "Construction and building company",
      websiteUrl: "https://sisk.com/",
      irelandPresenceDescription: "Sisk is a major Irish construction company with projects across Ireland, including commercial, residential, healthcare, and infrastructure development.",
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
      id: "ie:bam",
      slug: "bam-ireland",
      name: "BAM Ireland",
      industryId: "ie-construction",
      descriptor: "Construction, infrastructure and facilities management company",
      websiteUrl: "https://www.bamireland.ie/",
      irelandPresenceDescription: "BAM Ireland delivers construction and infrastructure projects across the country, including major healthcare, transport, and education projects.",
      irelandPresence: BAM_IRELAND,
      careersUrl: "https://www.bamireland.ie/",
      careersSourceTitle: "BAM Ireland",
      checkedAt: "2026-09-14",
      careers: [
        {
          careerId: "civil-engineer",
          rationale: "BAM Ireland delivers major infrastructure projects including the National Children's Hospital. This is employer context, not a vacancy claim.",
          evidence: BAM_CIVIL_ENGINEER,
        },
      ],
      cities: [],
    },
    {
      id: "ie:jones",
      slug: "jones-engineering",
      name: "Jones Engineering",
      industryId: "ie-construction",
      descriptor: "Engineering and building services contractor",
      websiteUrl: "https://joneseng.com/",
      irelandPresenceDescription: "Jones Engineering is a Dublin-headquartered engineering contractor delivering mechanical, electrical, and fire protection services across Ireland and internationally.",
      irelandPresence: JONES_ENGINEERING,
      careersUrl: "https://joneseng.com/careers/why-work-with-jones/",
      careersSourceTitle: "Jones Engineering Careers",
      checkedAt: "2026-09-14",
      careers: [],
      cities: [],
    },
    {
      id: "ie:hse",
      slug: "hse",
      name: "Health Service Executive",
      industryId: "ie-healthcare",
      descriptor: "National public health service",
      websiteUrl: "https://www.hse.ie/",
      irelandPresenceDescription: "The HSE is Ireland's national public health service, employing staff across hospitals, community health services, and administrative offices throughout the country.",
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
    {
      id: "ie:st-james",
      slug: "st-james-hospital",
      name: "St James's Hospital",
      industryId: "ie-healthcare",
      descriptor: "Ireland's largest acute teaching hospital",
      websiteUrl: "https://www.stjames.ie/",
      irelandPresenceDescription: "St James's Hospital in Dublin 8 is Ireland's largest acute teaching hospital, providing medical imaging, cancer care, and specialist services across multiple disciplines.",
      irelandPresence: ST_JAMES_HOSPITAL,
      careersUrl: "https://www.stjames.ie/careers/",
      careersSourceTitle: "St James's Hospital Careers",
      checkedAt: "2026-09-14",
      careers: [
        {
          careerId: "radiographer",
          rationale: "St James's Hospital operates a Diagnostic Imaging department providing radiography services. This is employer context, not a vacancy claim.",
          evidence: ST_JAMES_HOSPITAL,
        },
      ],
      cities: [],
    },
    {
      id: "ie:mater",
      slug: "mater-hospital",
      name: "Mater Misericordiae University Hospital",
      industryId: "ie-healthcare",
      descriptor: "Major Dublin teaching and specialist hospital",
      websiteUrl: "https://www.mater.ie/",
      irelandPresenceDescription: "The Mater Hospital on Eccles Street, Dublin 7, is a major acute teaching hospital providing radiology, cardiology, and specialist services, and is a founding member of the Dublin Academic Medical Centre.",
      irelandPresence: MATER_HOSPITAL,
      careersUrl: "https://www.mater.ie/healthcare-professionals/working-at-the-mater/",
      careersSourceTitle: "Mater Hospital Careers",
      checkedAt: "2026-09-14",
      careers: [
        {
          careerId: "radiographer",
          rationale: "The Mater Hospital operates a Radiology Department providing radiography services. This is employer context, not a vacancy claim.",
          evidence: MATER_HOSPITAL,
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
    if (!employer.id || employerIds.has(employer.id) || !industryIds.has(employer.industryId) || !employer.irelandPresence.url || !employer.careersUrl || !employer.descriptor || !employer.websiteUrl || !employer.irelandPresenceDescription) {
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
