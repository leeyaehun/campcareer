import "server-only"

import { cache } from "react"
import {
  IRELAND_EMPLOYMENT_ECOSYSTEM,
  isReviewedIrelandEmploymentCareer,
} from "./ireland-employment-ecosystem-data"
import type {
  IrelandCareerEmploymentContext,
  IrelandEmploymentEcosystem,
  IrelandSelectedEmployer,
} from "./ireland-employment-ecosystem-contract"

async function loadIrelandEmploymentEcosystem(): Promise<IrelandEmploymentEcosystem> {
  return IRELAND_EMPLOYMENT_ECOSYSTEM
}

async function loadIrelandCareerEmploymentContext(careerId: string): Promise<IrelandCareerEmploymentContext | null> {
  if (!isReviewedIrelandEmploymentCareer(careerId)) return null

  const ecosystem = await loadIrelandEmploymentEcosystem()
  const industries = ecosystem.industries.filter((industry) =>
    industry.careers.some((connection) => connection.careerId === careerId),
  )
  if (industries.length === 0) return null

  return {
    industries,
    employers: ecosystem.employers.filter((employer) =>
      employer.careers.some((connection) => connection.careerId === careerId),
    ),
    opportunities: ecosystem.opportunities,
  }
}

async function loadIrelandEmployerBySlug(slug: string): Promise<IrelandSelectedEmployer | null> {
  const ecosystem = await loadIrelandEmploymentEcosystem()
  return ecosystem.employers.find((employer) => employer.slug === slug) ?? null
}

async function loadIrelandEmployersByIndustry(industrySlug: string | null): Promise<readonly IrelandSelectedEmployer[]> {
  const ecosystem = await loadIrelandEmploymentEcosystem()
  if (!industrySlug) return ecosystem.employers
  const industryId = ecosystem.industries.find((industry) => industry.slug === industrySlug)?.id
  if (!industryId) return []
  return ecosystem.employers.filter((employer) => employer.industryId === industryId)
}

/** P1.6 Country read: a small reviewed Industry → Employer → Career graph. */
export const getIrelandEmploymentEcosystem = cache(loadIrelandEmploymentEcosystem)

/** P1.6 Career read: employer context only for one reviewed Ireland Career. */
export const getIrelandCareerEmploymentContext = cache(loadIrelandCareerEmploymentContext)

/** Employer directory: look up one employer by slug. */
export const getIrelandEmployerBySlug = cache(loadIrelandEmployerBySlug)

/** Employer directory: list employers, optionally filtered by industry slug. */
export const getIrelandEmployersByIndustry = cache(loadIrelandEmployersByIndustry)
