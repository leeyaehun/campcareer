import assert from "node:assert/strict"
import test from "node:test"

import { CAREER_CATALOGUE, getCareer } from "../src/lib/career-data-foundation/career-catalogue"
import { toCareerProfile } from "../src/lib/career-data-foundation/career-profile-contract"
import type { CareerMarketInsight } from "../src/lib/workspace/career-market-contract"

test("Career catalogue boundary preserves the reviewed 80 Career identities", () => {
  assert.equal(CAREER_CATALOGUE.length, 80)
  assert.equal(getCareer("electrician")?.id, "electrician")
  assert.equal(getCareer("not-a-career"), null)
})

test("CareerProfile makes a legacy country-occupation fallback explicit", () => {
  const insight = {
    career: {
      id: "registered-nurse",
      label: "Registered Nurse",
      labelKo: "간호사",
      overview: null,
      registration: null,
      mainTasks: [],
      sources: [{ label: "Official source", url: "https://example.com/source" }],
    },
    country: { code: "AU", name: "Australia" },
    profile: {
      officialCodeSystem: "ANZSCO",
      officialCodeVersion: "2022",
      officialUnitGroupCode: "2544",
      officialTitle: "Registered Nurses",
      currency: "AUD",
      registrationRequired: true,
      registrationAuthority: "NMBA",
      registrationUrl: "https://example.com/registration",
      publicationStatus: "decision_ready",
      metric: {
        annualisedMedianSalary: 90000,
        medianHourlyEarnings: null,
        campCareerScore: null,
      },
      links: [],
    },
    foundation: null,
    readModelSource: "legacy_country_occupation",
    demand: null,
    recommendations: [],
    visas: [],
  } as unknown as CareerMarketInsight

  const profile = toCareerProfile(insight, {} as never)
  assert.ok(profile)
  assert.equal(profile.identity.careerId, "registered-nurse")
  assert.equal(profile.identity.countryCode, "AU")
  assert.equal(profile.officialOccupation?.code, "2544")
  assert.equal(profile.pay.annualMedian, 90000)
  assert.equal(profile.dataSource.kind, "legacy_country_occupation")
  assert.equal(profile.dataSource.legacyFallback, true)
  assert.equal(profile.dataSource.foundationAvailableButNotSelected, true)
  assert.equal(profile.readiness.publishReady, true)
})
