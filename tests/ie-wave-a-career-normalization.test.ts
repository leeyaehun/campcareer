import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import {
  conservativeIndustryDiversityFromPublishedShares,
  normalizeEmploymentMomentum,
  normalizeProjectedGrowth,
  stagedIrelandCampCareerScore,
} from "../src/lib/career-data-foundation/ireland-wave-a-normalization"

type Component = {
  status: "normalized" | "pending" | "carry_forward_candidate"
  normalizedValue?: number
  scoreValue?: number
  maxScore?: number
  directness?: "direct" | "proxy"
  proxyReason?: string
  reason?: string
}

type Career = {
  careerId: string
  mapping: { relation: string; quality: string }
  labourMarket: {
    annualAverageGrowthPct2019To2024: number
    directness: "direct" | "proxy"
    proxyReason?: string
  }
  projection: {
    employment2021Thousands: number
    netChangeTo2035Thousands: number
    directness: "direct" | "proxy"
    proxyReason?: string
  }
  components: Record<string, Component>
}

type WaveAData = {
  status: string
  benchmarks: {
    recentEmploymentGrowthAnnualAvgPct: number
    projectedNationalGrowthAnnualPct: number
  }
  careers: Career[]
}

const data = JSON.parse(
  readFileSync("data/curated/ie/wave-a-career-foundation.json", "utf8"),
) as WaveAData

const EXPECTED = [
  "software-developer",
  "cybersecurity-analyst",
  "data-engineer",
  "civil-engineer",
  "construction-manager",
  "accountant",
  "architect",
  "radiographer",
]

test("Ireland Wave A contains exactly the eight approved normalization Careers", () => {
  assert.equal(data.status, "staging_only")
  assert.deepEqual(data.careers.map((career) => career.careerId), EXPECTED)
})

test("pending evidence never masquerades as a numeric zero", () => {
  for (const career of data.careers) {
    for (const [componentKey, component] of Object.entries(career.components)) {
      if (component.status !== "pending") continue
      assert.equal(
        component.normalizedValue,
        undefined,
        `${career.careerId} ${componentKey} pending normalizedValue must be absent`,
      )
      assert.equal(
        component.scoreValue,
        undefined,
        `${career.careerId} ${componentKey} pending scoreValue must be absent`,
      )
      assert.ok(component.reason?.trim(), `${career.careerId} ${componentKey} pending evidence needs a reason`)
    }
  }
})

test("every proxy mapping and normalized proxy component explains its scope", () => {
  for (const career of data.careers) {
    if (career.labourMarket.directness === "proxy") {
      assert.ok(career.labourMarket.proxyReason?.trim(), `${career.careerId} labour-market proxy needs a reason`)
    }
    if (career.projection.directness === "proxy") {
      assert.ok(career.projection.proxyReason?.trim(), `${career.careerId} projection proxy needs a reason`)
    }

    for (const [componentKey, component] of Object.entries(career.components)) {
      if (component.status === "pending" || component.directness !== "proxy") continue
      assert.ok(component.proxyReason?.trim(), `${career.careerId} ${componentKey} proxy needs a reason`)
    }
  }
})

test("employment momentum is normalized against the 3.4% Ireland benchmark deterministically", () => {
  const expectedScores: Record<string, number> = {
    "software-developer": 10,
    "cybersecurity-analyst": 10,
    "data-engineer": 10,
    "civil-engineer": 8,
    "construction-manager": 8,
    accountant: 10,
    architect: 7,
    radiographer: 9.5,
  }

  for (const career of data.careers) {
    const result = normalizeEmploymentMomentum({
      occupationAnnualGrowthPct: career.labourMarket.annualAverageGrowthPct2019To2024,
      nationalAnnualGrowthPct: data.benchmarks.recentEmploymentGrowthAnnualAvgPct,
    })
    assert.equal(result.scoreValue, expectedScores[career.careerId], career.careerId)
    assert.equal(career.components.employment_momentum?.normalizedValue, result.excessPp, career.careerId)
    assert.equal(career.components.employment_momentum?.scoreValue, result.scoreValue, career.careerId)
  }
})

test("Cedefop projection proxies normalize reproducibly and retain the source-group boundary", () => {
  const expectedScores: Record<string, number> = {
    "software-developer": 6.94,
    "cybersecurity-analyst": 6.94,
    "data-engineer": 6.94,
    "civil-engineer": 4,
    "construction-manager": 8.71,
    accountant: 6.21,
    architect: 4,
    radiographer: 2.08,
  }

  for (const career of data.careers) {
    const result = normalizeProjectedGrowth({
      startEmployment: career.projection.employment2021Thousands,
      netChange: career.projection.netChangeTo2035Thousands,
      years: 14,
      nationalAnnualGrowthPct: data.benchmarks.projectedNationalGrowthAnnualPct,
    })
    assert.ok(result)
    assert.equal(result.scoreValue, expectedScores[career.careerId], career.careerId)
    assert.equal(career.components.projected_growth?.normalizedValue, result.excessPp, career.careerId)
    assert.equal(career.components.projected_growth?.scoreValue, result.scoreValue, career.careerId)
    assert.equal(career.projection.directness, "proxy")
    assert.ok(career.projection.proxyReason?.trim())
  }
})

test("2025 difficult-to-fill evidence only unlocks conservative vacancy fallbacks where repeated Career evidence exists", () => {
  const normalizedVacancy = new Set([
    "software-developer",
    "cybersecurity-analyst",
    "data-engineer",
    "civil-engineer",
    "construction-manager",
    "accountant",
  ])

  for (const career of data.careers) {
    const vacancy = career.components.vacancy_intensity
    if (normalizedVacancy.has(career.careerId)) {
      assert.equal(vacancy?.status, "normalized", career.careerId)
      assert.equal(vacancy?.normalizedValue, 4, career.careerId)
      assert.equal(vacancy?.scoreValue, 4, career.careerId)
      assert.equal(vacancy?.directness, "proxy", career.careerId)
      assert.ok(vacancy?.proxyReason?.trim(), career.careerId)
    } else {
      assert.equal(vacancy?.status, "pending", career.careerId)
    }
  }
})

test("official CSO Pay evidence is normalized only as a broad Professional-occupation proxy", () => {
  for (const career of data.careers) {
    const pay = career.components.relative_salary
    assert.equal(pay?.status, "normalized", career.careerId)
    assert.equal(pay?.normalizedValue, 1.6832, career.careerId)
    assert.equal(pay?.scoreValue, 10, career.careerId)
    assert.equal(pay?.directness, "proxy", career.careerId)
    assert.ok(pay?.proxyReason?.includes("Professional occupations"), career.careerId)
    assert.ok(pay?.reason?.includes("must not be displayed as an exact Career salary"), career.careerId)
  }
})

test("industry diversity uses a conservative HHI upper bound from published SOLAS sector shares", () => {
  const groupShares: Record<string, number[]> = {
    "software-developer": [65, 9, 8],
    "cybersecurity-analyst": [65, 9, 8],
    "data-engineer": [65, 9, 8],
    "civil-engineer": [73, 13, 5],
    "construction-manager": [73, 13, 5],
    accountant: [31, 22, 9, 8],
    architect: [73, 13, 5],
    radiographer: [87, 7],
  }

  for (const career of data.careers) {
    const derived = conservativeIndustryDiversityFromPublishedShares(groupShares[career.careerId])
    const diversity = career.components.industry_diversity

    if (career.careerId === "accountant") {
      assert.equal(derived, null)
      assert.equal(diversity?.status, "pending")
      assert.ok(diversity?.reason?.includes("70%"))
      continue
    }

    assert.ok(derived, career.careerId)
    assert.equal(diversity?.status, "normalized", career.careerId)
    assert.equal(diversity?.normalizedValue, derived.scoreValue, career.careerId)
    assert.equal(diversity?.scoreValue, derived.scoreValue, career.careerId)
    assert.equal(
      (diversity as Component & { derivedHhiUpperBound?: number }).derivedHhiUpperBound,
      derived.hhiUpperBound,
      career.careerId,
    )
    assert.equal(diversity?.directness, "proxy", career.careerId)
    assert.ok(diversity?.proxyReason?.includes("broader"), career.careerId)
  }
})

test("radiographer vacancy evidence stays conservative without a 2025 persistence bonus", () => {
  const career = data.careers.find((item) => item.careerId === "radiographer")
  assert.ok(career)
  assert.equal(career.components.vacancy_intensity?.status, "normalized")
  assert.equal(career.components.vacancy_intensity?.scoreValue, 3)
  assert.ok(career.components.vacancy_intensity?.reason?.includes("3/15"))
})

test("Architect remains explicitly incomplete where the RAS evidence referred to quantity surveyors", () => {
  const career = data.careers.find((item) => item.careerId === "architect")
  assert.ok(career)
  assert.equal(career.components.vacancy_intensity?.status, "pending")
})


test("Wave A Entry evidence is normalized from official pathway or regulator sources", () => {
  const expected: Record<string, { access: number; burden: number }> = {
    "software-developer": { access: 8, burden: 5 },
    "cybersecurity-analyst": { access: 8, burden: 5 },
    "data-engineer": { access: 8, burden: 5 },
    "civil-engineer": { access: 8, burden: 5 },
    "construction-manager": { access: 6, burden: 4 },
    accountant: { access: 8, burden: 5 },
    architect: { access: 4, burden: 1 },
    radiographer: { access: 6, burden: 1 },
  }

  for (const career of data.careers) {
    const wanted = expected[career.careerId]
    const access = career.components.entry_accessibility
    const burden = career.components.entry_burden
    assert.equal(access?.status, "normalized", career.careerId)
    assert.equal(access?.scoreValue, wanted.access, career.careerId)
    assert.equal(access?.directness, "proxy", career.careerId)
    assert.ok(access?.proxyReason?.includes("CampCareer Entry Accessibility"), career.careerId)
    assert.equal(burden?.status, "normalized", career.careerId)
    assert.equal(burden?.scoreValue, wanted.burden, career.careerId)
    assert.equal(burden?.directness, "proxy", career.careerId)
    assert.ok(burden?.proxyReason?.includes("CampCareer Entry Burden"), career.careerId)
  }
})

test("regulated Wave A Careers retain materially lower Entry Burden scores", () => {
  const architect = data.careers.find((item) => item.careerId === "architect")
  const radiographer = data.careers.find((item) => item.careerId === "radiographer")
  assert.equal(architect?.components.entry_burden?.scoreValue, 1)
  assert.equal(radiographer?.components.entry_burden?.scoreValue, 1)
  assert.ok(architect?.components.entry_burden?.reason?.includes("protected title"))
  assert.ok(radiographer?.components.entry_burden?.reason?.includes("CORU"))
})


test("only fully normalized Wave A Careers receive a staged CampCareer Score candidate", () => {
  const expected: Record<string, number | null> = {
    "software-developer": 78,
    "cybersecurity-analyst": 78,
    "data-engineer": 78,
    "civil-engineer": 74,
    "construction-manager": 72,
    accountant: null,
    architect: null,
    radiographer: 51,
  }

  for (const career of data.careers) {
    const score = stagedIrelandCampCareerScore(career.components)
    assert.equal(score?.total ?? null, expected[career.careerId], career.careerId)

    if (score) {
      assert.equal(score.total, score.demand * 4 + score.pay * 3 + score.entry * 3, career.careerId)
    }
  }
})

test("incomplete Careers stay unscored instead of converting pending evidence to zero", () => {
  for (const careerId of ["accountant", "architect"]) {
    const career = data.careers.find((item) => item.careerId === careerId)
    assert.ok(career)
    assert.equal(stagedIrelandCampCareerScore(career.components), null)
  }
})


test("vacancy persistence keeps both official survey periods in lineage", () => {
  for (const careerId of [
    "software-developer",
    "cybersecurity-analyst",
    "data-engineer",
    "civil-engineer",
    "construction-manager",
    "accountant",
  ]) {
    const career = data.careers.find((item) => item.careerId === careerId)
    assert.ok(career)
    assert.deepEqual(
      (career.components.vacancy_intensity as Component & { sourceRefs?: string[] }).sourceRefs,
      ["solasRas2024", "solasRas2025"],
      careerId,
    )
  }

  const radiographer = data.careers.find((item) => item.careerId === "radiographer")
  assert.ok(radiographer)
  assert.deepEqual(
    (radiographer.components.vacancy_intensity as Component & { sourceRefs?: string[] }).sourceRefs,
    ["solasRas2024"],
  )
})

test("visa evidence is normalized as context but remains outside the public Score", () => {
  for (const career of data.careers) {
    const visa = career.components.visa_accessibility
    assert.equal(visa?.status, "normalized", career.careerId)
    assert.ok(visa?.reason?.includes("does not contribute to CampCareer Score v1"), career.careerId)
  }
  assert.equal(
    data.careers.find((item) => item.careerId === "accountant")?.components.visa_accessibility?.scoreValue,
    8,
  )
})

test("machine-readable readiness exposes six complete and two incomplete Wave A Careers", () => {
  const readiness = (data as WaveAData & {
    readiness: {
      careers: Record<string, {
        careerDecisionReady: boolean
        pendingPublicComponents: string[]
        visaContextReady: boolean
      }>
    }
  }).readiness

  const ready = Object.entries(readiness.careers)
    .filter(([, value]) => value.careerDecisionReady)
    .map(([careerId]) => careerId)

  assert.deepEqual(ready, [
    "software-developer",
    "cybersecurity-analyst",
    "data-engineer",
    "civil-engineer",
    "construction-manager",
    "radiographer",
  ])
  assert.deepEqual(readiness.careers.accountant.pendingPublicComponents, ["industry_diversity"])
  assert.deepEqual(readiness.careers.architect.pendingPublicComponents, ["shortage_signal", "vacancy_intensity"])
  assert.deepEqual(readiness.careers.radiographer.pendingPublicComponents, [])
})


test("Accountant and Radiographer use pressure without claiming a confirmed shortage", () => {
  for (const careerId of ["accountant", "radiographer"]) {
    const career = data.careers.find((item) => item.careerId === careerId)
    assert.ok(career)
    const shortage = career.components.shortage_signal
    assert.equal(shortage?.status, "normalized")
    assert.equal(shortage?.scoreValue, 5)
    assert.ok(shortage?.reason?.includes("pressure"))
    assert.ok(shortage?.reason?.includes("not") || shortage?.reason?.includes("not represented"))
  }
})
