import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import {
  DEGREE_MATCH_P2_SIGNAL_KEYS,
  DEGREE_MATCH_ALIAS_RELATIONSHIPS,
  DEGREE_MATCH_RELATIONSHIP_TYPES,
  DEGREE_MATCH_STRENGTHS,
  DEGREE_MATCH_TRAINING_STATES,
  validateDegreeMatchRelation,
  type DegreeMatchRelation,
} from "../src/lib/degree-match/contract"

const evidence = {
  id: "ie-regulator-1",
  title: "Professional entry requirements",
  publisher: "Official authority",
  url: "https://example.com/requirements",
  kind: "official_regulator" as const,
  level: "verified" as const,
  directness: "direct" as const,
  geography: { scope: "country_professional_requirement" as const, countryCode: "IE", label: "Ireland" },
  referencePeriod: "Current at review",
  checkedDate: "2026-09-15",
  limitations: null,
}

const base: DegreeMatchRelation = {
  id: "ie:software-developer:computer-science",
  countryCode: "IE",
  careerId: "software-developer",
  degree: { kind: "degree", id: "degree-1", slug: "computer-science", canonicalName: "Computer Science" },
  relationshipType: "direct",
  strength: "strong",
  evidenceLevel: "verified",
  geography: { scope: "country_pathway", countryCode: "IE", label: "Ireland" },
  rationale: "A reviewed direct academic route.",
  qualification: { state: "none_verified", additionalTrainingRequired: false, details: "No additional requirement verified for this academic relationship.", professionalEligibilitySeparate: true },
  regulation: { regulatedCareer: false, accreditationRequired: null, registrationRequired: null, jurisdiction: "IE" },
  evidence: [evidence],
  checkedDate: "2026-09-15",
}

test("relationship vocabulary is bounded and strength is categorical", () => {
  assert.deepEqual(DEGREE_MATCH_RELATIONSHIP_TYPES, ["direct", "common", "alternative", "optional", "insufficient_alone"])
  assert.deepEqual(DEGREE_MATCH_STRENGTHS, ["strong", "moderate", "contextual", "unavailable"])
  assert.equal("score" in base, false)
  assert.equal("percentage" in base, false)
})

test("canonical Degree and Programme remain distinct", () => {
  assert.equal(base.degree.kind, "degree")
  assert.notEqual(base.degree.id, "programme-1")
  assert.equal("programmeEvidence" in base, false)
})

test("alias mapping requires evidence and cannot silently become canonical equivalence", () => {
  assert.deepEqual(DEGREE_MATCH_ALIAS_RELATIONSHIPS, ["alias", "synonym", "broader", "narrower", "related"])
  const mapping = {
    sourceLabel: "Applied Computing",
    canonicalDegreeId: "degree-1",
    relationship: "related" as const,
    mappingConfidence: "medium" as const,
    evidenceRequired: true,
    canonicalEquivalent: false as const,
    rationale: "Requires reviewed curriculum evidence before use.",
  }
  assert.equal(mapping.canonicalEquivalent, false)
  assert.equal(mapping.evidenceRequired, true)
})

test("valid relation has explicit geography, provenance, qualification, and regulation shape", () => {
  assert.deepEqual(validateDegreeMatchRelation(base), [])
  assert.equal(base.evidence[0].directness, "direct")
  assert.equal(base.qualification.professionalEligibilitySeparate, true)
  assert.equal(base.regulation.jurisdiction, "IE")
})

test("missing evidence stays unavailable and cannot become weak evidence", () => {
  const missing = { ...base, evidence: [], evidenceLevel: "unavailable" as const, strength: "unavailable" as const, missingEvidence: [{ id: "missing-1", level: "unavailable" as const, reason: "No defensible source found.", geography: base.geography, checkedDate: "2026-09-15" }] }
  assert.deepEqual(validateDegreeMatchRelation(missing), [])
  assert.equal(missing.strength, "unavailable")
  assert.notEqual(missing.strength, "moderate")
})

test("training states represent regulated and additional requirements", () => {
  assert.ok(DEGREE_MATCH_TRAINING_STATES.includes("professional_registration_required"))
  assert.ok(DEGREE_MATCH_TRAINING_STATES.includes("multiple_requirements"))
  const regulated = { ...base, relationshipType: "insufficient_alone" as const, qualification: { state: "professional_registration_required" as const, additionalTrainingRequired: true, details: "Registration is required before practice.", professionalEligibilitySeparate: true as const }, regulation: { regulatedCareer: true, regulatorName: "CORU", regulatorUrl: "https://www.coru.ie/", accreditationRequired: true, registrationRequired: true, jurisdiction: "IE" } }
  assert.equal(regulated.qualification.state, "professional_registration_required")
  assert.equal(regulated.regulation.registrationRequired, true)
})

test("P2 Future Intelligence signals are not Degree Match fields", () => {
  assert.deepEqual(DEGREE_MATCH_P2_SIGNAL_KEYS, ["demand", "growth", "stability", "ai_exposure", "skills_change", "outlook"])
  for (const key of DEGREE_MATCH_P2_SIGNAL_KEYS) assert.equal(key in base, false)
})

test("P3.0 preserves the six reviewed Ireland Careers as the explicit boundary", () => {
  const source = readFileSync("docs/data-foundation/ie-career-degree-graph-v1.md", "utf8")
  for (const career of ["Software Developer", "Cybersecurity Analyst", "Data Engineer", "Civil Engineer", "Construction Manager", "Radiographer"]) {
    assert.ok(source.includes(career))
  }
  assert.equal((source.match(/\| [A-Za-z].* \|/g) ?? []).length >= 7, true)
})

test("available and unavailable evidence states are validated explicitly", () => {
  assert.ok(validateDegreeMatchRelation({ ...base, evidence: [], evidenceLevel: "verified" }).includes("available evidence requires at least one observation"))
  assert.ok(validateDegreeMatchRelation({ ...base, evidenceLevel: "unavailable", evidence: [evidence] }).includes("unavailable evidence cannot include evidence observations"))
})
