export type EmploymentEvidence = {
  authority: string
  title: string
  url: string
  checkedAt: string
}

export type IrelandIndustryCareerConnection = {
  careerId: string
  rationale: string
  evidence: EmploymentEvidence
}

export type IrelandEmploymentIndustry = {
  id: string
  slug: string
  name: string
  rationale: string
  evidence: EmploymentEvidence
  careers: readonly IrelandIndustryCareerConnection[]
}

export type IrelandEmployerCareerConnection = {
  careerId: string
  rationale: string
  evidence: EmploymentEvidence
}

/** A city continuation is published only with an explicit employer-site source. */
export type IrelandEmployerCityConnection = {
  citySlug: string
  cityName: string
  rationale: string
  evidence: EmploymentEvidence
}

export type IrelandSelectedEmployer = {
  id: string
  slug: string
  name: string
  industryId: string
  irelandPresence: EmploymentEvidence
  careersUrl: string
  careersSourceTitle: string
  checkedAt: string
  careers: readonly IrelandEmployerCareerConnection[]
  cities: readonly IrelandEmployerCityConnection[]
}

/**
 * P1.6 intentionally publishes no time-sensitive opportunity records. The
 * employer careers URLs above are evergreen continuation context, not jobs.
 */
export type IrelandOpportunityPublication = {
  kind: "evergreen_employer_context_only"
  publishedOpportunities: readonly []
  rationale: string
}

export type IrelandEmploymentEcosystem = {
  countryCode: "IE"
  industries: readonly IrelandEmploymentIndustry[]
  employers: readonly IrelandSelectedEmployer[]
  opportunities: IrelandOpportunityPublication
}

export type IrelandCareerEmploymentContext = {
  industries: readonly IrelandEmploymentIndustry[]
  employers: readonly IrelandSelectedEmployer[]
  opportunities: IrelandOpportunityPublication
}
