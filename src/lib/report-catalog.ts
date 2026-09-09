/**
 * CampCareer Australia report catalogue.
 *
 * This is a product contract, not a checkout implementation. `contentStatus`
 * describes whether the underlying report itself is finished; `salesStatus`
 * stays `contracted` until payment and fulfilment are wired and verified.
 */

export const REPORT_CATALOG_COUNTRY = "AU" as const
export const REPORT_CATALOG_CURRENCY = "AUD" as const

export type ReportProductId =
  | "australia-topic-deep-dive"
  | "australia-study-roi-index-2026"
  | "my-australia-roi-decision-report"
  | "australia-expert-review"

export type TopicReportScope = "field" | "city" | "university"
export type ReportFulfilment = "digital-report" | "expert-review"
export type ReportSalesStatus = "contracted" | "available"
export type ReportContentStatus = "planned" | "ready"

export type ReportPageCount = {
  min: number
  max: number
  target: number
}

export type ReportProduct = {
  id: ReportProductId
  country: typeof REPORT_CATALOG_COUNTRY
  currency: typeof REPORT_CATALOG_CURRENCY
  amountAudCents: number
  title: string
  titleKo: string
  description: string
  descriptionKo: string
  fulfilment: ReportFulfilment
  salesStatus: ReportSalesStatus
  contentStatus?: ReportContentStatus
  edition?: string
  region?: string
  dataReviewedOn?: string
  pageCount?: ReportPageCount
  topicScopes?: readonly TopicReportScope[]
  upgrade?: {
    /** A paid source order is required before the lower upgrade price applies. */
    fromProductId: ReportProductId
    additionalAmountAudCents: number
  }
  expertSettlement?: {
    expertPayoutAudCents: number
    platformGrossAudCents: number
  }
}

export const TOPIC_REPORT_SCOPES: readonly TopicReportScope[] = ["field", "city", "university"]

export const PERSONALIZED_ROI_INPUTS = [
  "age",
  "education-and-work-history",
  "english-level",
  "maximum-budget",
  "expected-scholarship",
  "family-accompaniment",
  "preferred-cities",
  "metro-or-regional-preference",
  "target-occupation",
  "post-study-goal",
  "risk-tolerance",
  "desired-payback-period",
] as const

export type PersonalizedRoiInput = (typeof PERSONALIZED_ROI_INPUTS)[number]

export const AUSTRALIA_ROI_INDEX_SECTIONS = [
  "Australia-wide major ROI ranking",
  "Bachelor, master and VET rankings",
  "Provider tuition-to-outcome comparison",
  "Short- and mid-term graduate earnings",
  "Employment and job-relevance outcomes",
  "City cost-of-living adjusted ROI",
  "Tuition payback period",
  "Occupation demand and shortage persistence",
  "AI automation exposure",
  "2026 policy and market changes",
  "Methodology and data sources",
  "High-salary, low-ROI traps",
] as const

export const PERSONALIZED_ROI_REPORT_SECTIONS = [
  "Executive decision",
  "Profile and decision criteria",
  "Option A, B and C comparison",
  "Base, optimistic and conservative ROI scenarios",
  "Option fit, risks and verification items",
  "90-day action plan",
  "Data confidence, sources and assumptions",
] as const

export const REPORT_PRODUCTS: readonly ReportProduct[] = [
  {
    id: "australia-topic-deep-dive",
    country: "AU",
    currency: "AUD",
    amountAudCents: 900,
    title: "Australia Deep-Dive Report",
    titleKo: "호주 세부 주제 심층 리포트",
    description: "A focused report for one Australian field, city or university.",
    descriptionKo: "호주의 하나의 분야, 도시 또는 대학을 깊이 분석하는 리포트입니다.",
    fulfilment: "digital-report",
    salesStatus: "contracted",
    pageCount: { min: 15, max: 25, target: 20 },
    topicScopes: TOPIC_REPORT_SCOPES,
  },
  {
    id: "australia-study-roi-index-2026",
    country: "AU",
    currency: "AUD",
    amountAudCents: 2900,
    title: "Australia Study ROI Index 2026",
    titleKo: "호주 유학·커리어 ROI 랭킹 리포트 2026",
    description: "The data-driven guide to degrees, careers and payback in Australia.",
    descriptionKo: "학비, 생활비, 취업률, 연봉을 반영해 호주 학업·커리어의 투자회수를 비교하는 데이터 가이드입니다.",
    fulfilment: "digital-report",
    salesStatus: "contracted",
    pageCount: { min: 35, max: 60, target: 50 },
  },
  {
    id: "my-australia-roi-decision-report",
    country: "AU",
    currency: "AUD",
    amountAudCents: 5900,
    title: "My Australia ROI Decision Report",
    titleKo: "나의 호주 ROI 의사결정 리포트",
    description: "A personalised recommendation, scenario analysis and 90-day action plan based on the customer's saved options.",
    descriptionKo: "사용자 조건과 저장한 선택지를 바탕으로 우선순위, 시나리오 분석, 90일 실행계획을 제시하는 개인화 리포트입니다.",
    fulfilment: "digital-report",
    salesStatus: "contracted",
    pageCount: { min: 18, max: 30, target: 24 },
    upgrade: {
      fromProductId: "australia-study-roi-index-2026",
      additionalAmountAudCents: 3000,
    },
  },
  {
    id: "australia-expert-review",
    country: "AU",
    currency: "AUD",
    amountAudCents: 14900,
    title: "Australia Expert Review",
    titleKo: "호주 전문가 검토",
    description: "A booked expert review and concrete next-step consultation after a customer has prepared their decision context.",
    descriptionKo: "고객의 의사결정 맥락을 바탕으로 전문가가 검토하고 구체적인 실행 방향을 상담하는 서비스입니다.",
    fulfilment: "expert-review",
    salesStatus: "contracted",
    expertSettlement: {
      expertPayoutAudCents: 10000,
      platformGrossAudCents: 4900,
    },
  },
] as const

const reportProductById = new Map(REPORT_PRODUCTS.map((product) => [product.id, product]))

export function getReportProduct(id: string): ReportProduct | null {
  return reportProductById.get(id as ReportProductId) ?? null
}

export function formatAud(amountAudCents: number): string {
  return `A$${(amountAudCents / 100).toFixed(0)}`
}
