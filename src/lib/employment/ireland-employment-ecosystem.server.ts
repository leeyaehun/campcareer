import "server-only"

import { cache } from "react"
import {
  IRELAND_EMPLOYMENT_ECOSYSTEM,
  isReviewedIrelandEmploymentCareer,
} from "./ireland-employment-ecosystem-data"
import type {
  IrelandCareerEmploymentContext,
  IrelandEmploymentEcosystem,
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

/** P1.6 Country read: a small reviewed Industry → Employer → Career graph. */
export const getIrelandEmploymentEcosystem = cache(loadIrelandEmploymentEcosystem)

/** P1.6 Career read: employer context only for one reviewed Ireland Career. */
export const getIrelandCareerEmploymentContext = cache(loadIrelandCareerEmploymentContext)
