import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import {
  normalizeEmploymentMomentum,
  normalizeProjectedGrowth,
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

test("no Wave A Career is falsely declared score-ready while Industry Diversity remains pending", () => {
  for (const career of data.careers) {
    assert.equal(career.components.industry_diversity?.status, "pending", career.careerId)
  }
})
