import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import test from "node:test"
import { validateDegreeMatchRelation } from "../src/lib/degree-match/contract"
import {
  IRELAND_DEGREE_MATCH_ALIASES,
  IRELAND_DEGREE_MATCH_CAREER_IDS,
  IRELAND_DEGREE_MATCH_DEGREE_IDS,
  IRELAND_DEGREE_MATCH_RELATIONS,
} from "../src/lib/degree-match/ireland-evidence"

const expectedCareers = [
  "software-developer",
  "cybersecurity-analyst",
  "data-engineer",
  "civil-engineer",
  "construction-manager",
  "radiographer",
] as const

const expectedDegrees = [
  "computer-science",
  "cybersecurity",
  "data-science",
  "civil-engineering",
  "construction-management",
  "diagnostic-radiography",
] as const

const expectedPairs: ReadonlyArray<[string, string]> = [
  ["software-developer", "computer-science"],
  ["cybersecurity-analyst", "cybersecurity"],
  ["data-engineer", "data-science"],
  ["civil-engineer", "civil-engineering"],
  ["construction-manager", "construction-management"],
  ["radiographer", "diagnostic-radiography"],
]

test("P3.1: exactly six Ireland Career relations exist for the reviewed cohort", () => {
  assert.equal(IRELAND_DEGREE_MATCH_RELATIONS.length, 6)
  assert.deepEqual(
    IRELAND_DEGREE_MATCH_RELATIONS.map((row) => row.careerId),
    [...expectedCareers],
  )
})

test("P3.1: exactly the six reviewed canonical Degree targets are represented", () => {
  assert.deepEqual(
    IRELAND_DEGREE_MATCH_RELATIONS.map((row) => row.degree.id),
    [...expectedDegrees],
  )
  assert.deepEqual(IRELAND_DEGREE_MATCH_CAREER_IDS, [...expectedCareers])
  assert.deepEqual(IRELAND_DEGREE_MATCH_DEGREE_IDS, [...expectedDegrees])
})

test("P3.1: every relation conforms to the P3.0 contract", () => {
  for (const relation of IRELAND_DEGREE_MATCH_RELATIONS) {
    assert.deepEqual(validateDegreeMatchRelation(relation), [], relation.id)
  }
})

test("P3.1: relationship type and confidence (strength/evidence level) remain separate", () => {
  for (const relation of IRELAND_DEGREE_MATCH_RELATIONS) {
    assert.ok("relationshipType" in relation)
    assert.ok("strength" in relation)
    assert.ok("evidenceLevel" in relation)
    assert.notEqual(relation.relationshipType, relation.evidenceLevel)
  }
  const direct = IRELAND_DEGREE_MATCH_RELATIONS.find((row) => row.careerId === "civil-engineer")!
  assert.equal(direct.relationshipType, "direct")
  assert.equal(direct.strength, "strong")
  assert.equal(direct.evidenceLevel, "verified")
})

test("P3.1: every relation carries explicit Ireland geography", () => {
  for (const relation of IRELAND_DEGREE_MATCH_RELATIONS) {
    assert.equal(relation.countryCode, "IE")
    assert.equal(relation.geography.countryCode, "IE")
    assert.ok(["country_pathway", "country_professional_requirement"].includes(relation.geography.scope))
  }
})

test("P3.1: every evidence source has publisher, title, URL, provenance and checked date", () => {
  for (const relation of IRELAND_DEGREE_MATCH_RELATIONS) {
    assert.match(relation.checkedDate, /^\d{4}-\d{2}-\d{2}$/)
    assert.ok(relation.evidence.length > 0)
    for (const item of relation.evidence) {
      assert.ok(item.publisher.trim())
      assert.ok(item.title.trim())
      assert.match(item.url, /^https:\/\//)
      assert.match(item.checkedDate, /^\d{4}-\d{2}-\d{2}$/)
      assert.ok(item.referencePeriod.trim())
      assert.equal(item.geography.countryCode, "IE")
    }
  }
})

test("P3.1: Degree and Programme identities remain separate", () => {
  for (const relation of IRELAND_DEGREE_MATCH_RELATIONS) {
    assert.equal(relation.degree.kind, "degree")
    assert.ok(!/bsc|msc|diploma|cert/i.test(relation.degree.id))
    assert.ok(!/bsc|msc|diploma|cert/i.test(relation.degree.slug))
  }
  assert.ok(IRELAND_DEGREE_MATCH_RELATIONS.every((row) => !("programmeId" in row.degree)))
})

test("P3.1: provider programme evidence is evidence, not Programme publication", () => {
  const registry = readFileSync("src/lib/degree-match/ireland-evidence.ts", "utf8")
  assert.match(registry, /official_institution/)
  for (const relation of IRELAND_DEGREE_MATCH_RELATIONS) {
    assert.equal("programmeEvidence" in relation, false)
    assert.ok(relation.evidence.length > 0)
    assert.ok(relation.evidence.every((item) => ["verified", "estimated", "limited_evidence"].includes(item.level)))
  }
  assert.equal(existsSync("src/app/(workspace)/programs/ie/[program]/page.tsx"), false)
  assert.ok(registry.includes("not a public Programme publication"))
})

test("P3.1: alias mapping is explicit, evidence-gated and never silent equivalence", () => {
  assert.ok(IRELAND_DEGREE_MATCH_ALIASES.length >= 4)
  for (const alias of IRELAND_DEGREE_MATCH_ALIASES) {
    assert.equal(alias.evidenceRequired, true)
    assert.equal(alias.canonicalEquivalent, false)
    assert.ok(alias.rationale.trim())
    assert.ok(["alias", "synonym", "broader", "narrower", "related"].includes(alias.relationship))
    assert.ok(["high", "medium", "low", "unavailable"].includes(alias.mappingConfidence))
  }
})

test("P3.1: missing evidence stays missing and never becomes a weak, negative or zero match", () => {
  const techRows = IRELAND_DEGREE_MATCH_RELATIONS.filter((row) =>
    ["software-developer", "cybersecurity-analyst", "data-engineer"].includes(row.careerId),
  )
  for (const relation of techRows) {
    assert.ok((relation.missingEvidence?.length ?? 0) >= 1)
    for (const item of relation.missingEvidence ?? []) {
      assert.equal(item.level, "unavailable")
      assert.ok(item.reason.trim())
      assert.equal(item.geography.countryCode, "IE")
    }
  }
  const radiographer = IRELAND_DEGREE_MATCH_RELATIONS.find((row) => row.careerId === "radiographer")!
  assert.equal((radiographer.missingEvidence?.length ?? 0), 0)
  assert.ok(IRELAND_DEGREE_MATCH_RELATIONS.every((row) => row.evidenceLevel !== "unavailable" || row.evidence.length === 0))
})

test("P3.1: no arbitrary numeric Degree Match score or percentage exists", () => {
  for (const relation of IRELAND_DEGREE_MATCH_RELATIONS) {
    assert.equal("score" in relation, false)
    assert.equal("percentage" in relation, false)
    assert.equal("matchScore" in relation, false)
  }
  const contract = readFileSync("src/lib/degree-match/contract.ts", "utf8")
  assert.match(contract, /no ranking, percentage, or numeric match score/)
})

test("P3.1: regulation and qualification requirements are representable and populated where verified", () => {
  const radiographer = IRELAND_DEGREE_MATCH_RELATIONS.find((row) => row.careerId === "radiographer")!
  const civil = IRELAND_DEGREE_MATCH_RELATIONS.find((row) => row.careerId === "civil-engineer")!
  assert.equal(radiographer.regulation.regulatedCareer, true)
  assert.equal(radiographer.regulation.accreditationRequired, true)
  assert.equal(radiographer.regulation.registrationRequired, true)
  assert.equal(radiographer.qualification.professionalEligibilitySeparate, true)
  assert.equal(civil.regulation.accreditationRequired, true)
  assert.ok(civil.regulation.regulatorUrl)
  for (const relation of IRELAND_DEGREE_MATCH_RELATIONS) {
    assert.ok(relation.qualification.state)
    assert.equal(relation.qualification.professionalEligibilitySeparate, true)
    assert.ok(relation.regulation.jurisdiction)
  }
})

test("P3.1: Radiographer Degree alone does not imply practice eligibility", () => {
  const relation = IRELAND_DEGREE_MATCH_RELATIONS.find((row) => row.careerId === "radiographer")!
  assert.equal(relation.qualification.state, "professional_registration_required")
  assert.equal(relation.qualification.additionalTrainingRequired, true)
  assert.equal(relation.regulation.regulatorName, "CORU Radiographers Registration Board")
  assert.equal(relation.regulation.registrationRequired, true)
  assert.match(relation.rationale, /does not grant permission to practise/i)
  assert.match(relation.qualification.details, /registration/i)
})

test("P3.1: non-regulated tech careers do not imply a legally mandatory Degree", () => {
  for (const careerId of ["software-developer", "cybersecurity-analyst", "data-engineer"]) {
    const relation = IRELAND_DEGREE_MATCH_RELATIONS.find((row) => row.careerId === careerId)!
    assert.equal(relation.regulation.regulatedCareer, false)
    assert.equal(relation.regulation.registrationRequired, false)
    assert.match(relation.qualification.details, /mandatory|not a legal|no universal/i)
    assert.match(relation.rationale, /not a verified statutory|not a legal|not.*mandatory|not a verified legal|no verified official source/i)
  }
  const cybersecurity = IRELAND_DEGREE_MATCH_RELATIONS.find((row) => row.careerId === "cybersecurity-analyst")!
  assert.equal(cybersecurity.relationshipType, "common")
})

test("P3.1: no Career, Institution or Programme cohort expansion", () => {
  assert.equal(IRELAND_DEGREE_MATCH_RELATIONS.length, 6)
  assert.deepEqual(IRELAND_DEGREE_MATCH_CAREER_IDS, [...expectedCareers])
  assert.deepEqual(IRELAND_DEGREE_MATCH_DEGREE_IDS, [...expectedDegrees])
  for (const [careerId, degreeId] of expectedPairs) {
    assert.ok(IRELAND_DEGREE_MATCH_RELATIONS.some((row) => row.careerId === careerId && row.degree.id === degreeId))
  }
  const registry = readFileSync("src/lib/degree-match/ireland-evidence.ts", "utf8")
  assert.doesNotMatch(registry, /institutionId/)
  for (const careerId of ["accountant", "architect", "registered-nurse"]) {
    assert.doesNotMatch(registry, new RegExp(careerId))
  }
})

test("P3.1: no UI or routes are added", () => {
  const pages = [
    "src/app/(workspace)/degree-match/page.tsx",
    "src/app/(workspace)/degrees/page.tsx",
    "src/app/(workspace)/degrees/[degree]/page.tsx",
    "src/app/(workspace)/career/[country]/[career]/degree-match/page.tsx",
  ]
  for (const page of pages) {
    assert.equal(existsSync(page), false)
  }
  const registry = readFileSync("src/lib/degree-match/ireland-evidence.ts", "utf8")
  assert.doesNotMatch(registry, /from "server-only"/)
  assert.doesNotMatch(registry, /"use client"/)
})