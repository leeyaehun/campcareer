import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import {
  IRELAND_DEGREE_MATCH_ALIASES,
  IRELAND_DEGREE_MATCH_CAREER_IDS,
  IRELAND_DEGREE_MATCH_DEGREE_IDS,
  IRELAND_DEGREE_MATCH_RELATIONS,
} from "@/lib/degree-match/ireland-evidence"
import {
  IRELAND_DEGREE_MATCH_MODEL,
  IRELAND_DEGREE_MATCH_MODEL_CAREER_IDS,
  IRELAND_DEGREE_MATCH_MODEL_DEGREE_IDS,
  deriveDegreeMatchStatus,
  getIrelandCareerDegreeMatches,
  getIrelandDegreeCareerMatches,
  getVerifiedIrelandDegreeAlias,
  type IrelandCareerDegreeMatch,
} from "@/lib/degree-match/ireland-model"

const expectedPairs: ReadonlyArray<[string, string]> = [
  ["software-developer", "computer-science"],
  ["cybersecurity-analyst", "cybersecurity"],
  ["data-engineer", "data-science"],
  ["civil-engineer", "civil-engineering"],
  ["construction-manager", "construction-management"],
  ["radiographer", "diagnostic-radiography"],
]

function forbiddenKeys(model: ReadonlyArray<IrelandCareerDegreeMatch>): string[] {
  const pattern = /(^|[_-])(score|percentage|matchScore|normalized|rating|probability)([_-]|$)/i
  const found: string[] = []
  const visit = (value: unknown) => {
    if (!value || typeof value !== "object") return
    for (const [key, child] of Object.entries(value)) {
      if (pattern.test(key)) found.push(key)
      visit(child)
    }
  }
  for (const result of model) visit(result)
  return found
}

test("P3.2: exactly six Ireland relations are supported", () => {
  assert.equal(IRELAND_DEGREE_MATCH_MODEL.length, 6)
  assert.deepEqual(
    IRELAND_DEGREE_MATCH_MODEL.map((result) => result.careerId),
    [...IRELAND_DEGREE_MATCH_MODEL_CAREER_IDS],
  )
  const careerIds = new Set(IRELAND_DEGREE_MATCH_MODEL.map((result) => result.careerId))
  assert.equal(careerIds.size, 6)
})

test("P3.2: exactly the six current canonical Degrees are supported", () => {
  assert.deepEqual(
    IRELAND_DEGREE_MATCH_MODEL.map((result) => result.degreeId),
    [...IRELAND_DEGREE_MATCH_MODEL_DEGREE_IDS],
  )
  const degreeIds = new Set(IRELAND_DEGREE_MATCH_MODEL.map((result) => result.degreeId))
  assert.equal(degreeIds.size, 6)
  assert.deepEqual(IRELAND_DEGREE_MATCH_MODEL_DEGREE_IDS, [...IRELAND_DEGREE_MATCH_DEGREE_IDS])
})

test("P3.2: Career→Degree and Degree→Career share the single underlying relationship truth", () => {
  for (const relation of IRELAND_DEGREE_MATCH_RELATIONS) {
    const fromDegree = getIrelandCareerDegreeMatches(relation.careerId)
    const fromCareer = getIrelandDegreeCareerMatches(relation.degree.id)
    assert.equal(fromDegree.length, 1)
    assert.equal(fromCareer.length, 1)
    assert.equal(fromDegree[0].careerId, relation.careerId)
    assert.equal(fromDegree[0].degreeId, relation.degree.id)
    assert.equal(fromCareer[0].careerId, relation.careerId)
    assert.equal(fromCareer[0].degreeId, relation.degree.id)
  }
})

test("P3.2: bidirectional results are consistent and derived, not duplicated", () => {
  for (const [careerId, degreeId] of expectedPairs) {
    const careerToDegree = getIrelandCareerDegreeMatches(careerId)[0]
    const degreeToCareer = getIrelandDegreeCareerMatches(degreeId)[0]
    assert.deepEqual(careerToDegree, degreeToCareer)
  }
  assert.equal(
    IRELAND_DEGREE_MATCH_RELATIONS.length,
    IRELAND_DEGREE_MATCH_MODEL.length,
  )
})

test("P3.2: every derived result traces back to P3.1 evidence", () => {
  for (const result of IRELAND_DEGREE_MATCH_MODEL) {
    const relation = IRELAND_DEGREE_MATCH_RELATIONS.find((row) => row.careerId === result.careerId)!
    assert.ok(result.evidenceReferences.length > 0)
    const rawIds = new Set(relation.evidence.map((item) => item.id))
    for (const reference of result.evidenceReferences) {
      assert.ok(rawIds.has(reference.id), `derived reference ${reference.id} is not in P3.1 evidence`)
      assert.match(reference.url, /^https:\/\//)
      assert.ok(reference.publisher.trim())
      assert.ok(reference.title.trim())
    }
    assert.equal(result.checkedDate, relation.checkedDate)
  }
})

test("P3.2: relationship type and confidence stay separate", () => {
  for (const result of IRELAND_DEGREE_MATCH_MODEL) {
    assert.ok(["direct", "common", "alternative", "optional", "insufficient_alone"].includes(result.relationshipType))
    assert.ok(["strong", "moderate", "contextual", "unavailable"].includes(result.relationshipStrength))
    assert.ok(["verified", "estimated", "limited_evidence", "unavailable"].includes(result.confidence))
    assert.notEqual(result.relationshipType, result.confidence)
  }
  const direct = IRELAND_DEGREE_MATCH_MODEL.find((row) => row.careerId === "civil-engineer")!
  const construction = IRELAND_DEGREE_MATCH_MODEL.find((row) => row.careerId === "construction-manager")!
  assert.equal(direct.relationshipType, "direct")
  assert.equal(direct.confidence, "verified")
  assert.equal(direct.relationshipStrength, "strong")
  assert.equal(construction.relationshipType, "direct")
  assert.equal(construction.confidence, "estimated")
})

test("P3.2: no numeric Degree Match score or percentage exists", () => {
  assert.deepEqual(forbiddenKeys(IRELAND_DEGREE_MATCH_MODEL), [])
  const registry = readFileSync("src/lib/degree-match/ireland-model.ts", "utf8")
  assert.doesNotMatch(registry, /"score"|"percentage"|"matchScore"/)
})

test("P3.2: missing evidence stays missing as limited/unavailable, never weak or neutral", () => {
  for (const careerId of ["software-developer", "cybersecurity-analyst", "data-engineer"]) {
    const result = getIrelandCareerDegreeMatches(careerId)[0]
    assert.ok(result.missingEvidenceReasons.length >= 1)
    for (const reason of result.missingEvidenceReasons) {
      assert.ok(reason.trim().length > 0)
      assert.doesNotMatch(reason, /\bweak\b|\bpoor\b|\bzero\b/i)
    }
    assert.ok(["limited", "available"].includes(result.status), `${careerId} should not be unavailable`)
  }
  assert.equal(deriveDegreeMatchStatus("unavailable"), "unavailable")
  assert.equal(deriveDegreeMatchStatus("estimated"), "limited")
  assert.equal(deriveDegreeMatchStatus("verified"), "available")
})

test("P3.2: Degree and Programme identities remain distinct", () => {
  for (const result of IRELAND_DEGREE_MATCH_MODEL) {
    assert.notEqual(result.degreeId, result.degreeLabel)
    assert.ok(!/bsc|msc|diploma|cert/i.test(result.degreeId))
    assert.ok(!/bsc|msc|diploma|cert/i.test(result.degreeLabel))
    assert.equal("programmeId" in result, false)
    assert.equal("institutionId" in result, false)
  }
})

test("P3.2: programme evidence supports relationships without becoming Programme publication", () => {
  const model = readFileSync("src/lib/degree-match/ireland-model.ts", "utf8")
  assert.doesNotMatch(model, /programme_page|programPublic|publishProgramme/)
  for (const result of IRELAND_DEGREE_MATCH_MODEL) {
    for (const reference of result.evidenceReferences) {
      assert.ok(["official_regulator", "official_institution"].includes(reference.kind))
      assert.ok(["direct", "proxy"].includes(reference.directness))
    }
    assert.equal(result.evidenceReferences.some((ref) => ref.kind === "official_institution"), true)
  }
})

test("P3.2: regulated Career requirements remain explicit", () => {
  const radiographer = getIrelandCareerDegreeMatches("radiographer")[0]
  assert.equal(radiographer.regulation.regulatedCareer, true)
  assert.equal(radiographer.regulation.registrationRequired, true)
  assert.equal(radiographer.regulation.accreditationRequired, true)
  assert.equal(radiographer.regulation.regulatorName, "CORU Radiographers Registration Board")
  assert.equal(radiographer.regulation.jurisdiction, "IE")
  const civil = IRELAND_DEGREE_MATCH_MODEL.find((result) => result.careerId === "civil-engineer")!
  assert.equal(civil.regulation.accreditationRequired, true)
  assert.ok(civil.regulation.regulatorUrl)
  assert.match(civil.regulation.summary, /accreditation/i)
})

test("P3.2: Radiographer Degree does not imply practice eligibility", () => {
  const radiographer = getIrelandCareerDegreeMatches("radiographer")[0]
  assert.equal(radiographer.additionalQualification.state, "professional_registration_required")
  assert.equal(radiographer.additionalQualification.professionalEligibilitySeparate, true)
  assert.match(radiographer.regulation.summary, /does not grant permission to practise/i)
  assert.match(radiographer.rationale, /does not grant permission to practise/i)
})

test("P3.2: non-regulated tech careers do not imply a legally mandatory Degree", () => {
  for (const careerId of ["software-developer", "cybersecurity-analyst", "data-engineer"]) {
    const result = getIrelandCareerDegreeMatches(careerId)[0]
    assert.equal(result.regulation.regulatedCareer, false)
    assert.equal(result.regulation.registrationRequired, false)
    assert.equal(result.additionalQualification.state, "none_verified")
    assert.match(result.regulation.summary, /not regulated|no verified mandatory/i)
    assert.match(result.rationale, /not a verified statutory|not a legal|not a verified legal|is not a verified|no verified official/i)
  }
})

test("P3.2: geography remains explicit and Ireland-scoped", () => {
  for (const result of IRELAND_DEGREE_MATCH_MODEL) {
    assert.equal(result.countryCode, "IE")
    assert.equal(result.geography.countryCode, "IE")
    assert.ok(!result.geography.scope.includes("global"))
  }
  const radiographer = getIrelandCareerDegreeMatches("radiographer")[0]
  assert.equal(radiographer.geography.scope, "country_professional_requirement")
})

test("P3.2: alias mappings only resolve through verified P3.1 mappings", () => {
  assert.ok(IRELAND_DEGREE_MATCH_ALIASES.length >= 4)
  for (const alias of IRELAND_DEGREE_MATCH_ALIASES) {
    assert.equal(alias.evidenceRequired, true)
    assert.equal(alias.canonicalEquivalent, false)
    assert.ok(alias.rationale.trim())
  }
  assert.equal(getVerifiedIrelandDegreeAlias("Computing"), "computer-science")
  assert.equal(getVerifiedIrelandDegreeAlias("Radiography"), "diagnostic-radiography")
  assert.equal(getVerifiedIrelandDegreeAlias("Unverified Label"), null)
  assert.equal(getVerifiedIrelandDegreeAlias("Computer Science"), null)
})

test("P3.2: P2 Future Intelligence is not duplicated into the Degree Match model", () => {
  const p2Keys = ["demand", "growth", "stability", "ai_exposure", "skills_change", "outlook"]
  for (const result of IRELAND_DEGREE_MATCH_MODEL) {
    for (const key of p2Keys) assert.equal(key in result, false, `P2 key ${key} leaked into model`)
  }
  const model = readFileSync("src/lib/degree-match/ireland-model.ts", "utf8")
  assert.doesNotMatch(model, /career-future-intelligence|futureOutlook|aiExposure/)
})

test("P3.2: derived model output is deterministic", () => {
  assert.deepEqual(
    IRELAND_DEGREE_MATCH_MODEL,
    IRELAND_DEGREE_MATCH_MODEL.map((row) => ({ ...row })),
  )
  const first = getIrelandCareerDegreeMatches("radiographer")
  const second = getIrelandCareerDegreeMatches("radiographer")
  assert.deepEqual(first, second)
  assert.equal(getIrelandCareerDegreeMatches("unrelated-career").length, 0)
  assert.equal(getIrelandDegreeCareerMatches("unrelated-degree").length, 0)
})

test("P3.2: no Career, Degree, Institution or Programme cohort expansion", () => {
  assert.equal(IRELAND_DEGREE_MATCH_MODEL.length, 6)
  assert.deepEqual(IRELAND_DEGREE_MATCH_CAREER_IDS, ["software-developer", "cybersecurity-analyst", "data-engineer", "civil-engineer", "construction-manager", "radiographer"])
  assert.deepEqual(IRELAND_DEGREE_MATCH_CAREER_IDS, [...IRELAND_DEGREE_MATCH_MODEL_CAREER_IDS])
  for (const [careerId, degreeId] of expectedPairs) {
    assert.ok(IRELAND_DEGREE_MATCH_MODEL.some((row) => row.careerId === careerId && row.degreeId === degreeId))
  }
  const model = readFileSync("src/lib/degree-match/ireland-model.ts", "utf8")
  assert.doesNotMatch(model, /"accountant"|"architect"|"registered-nurse"/)
})

test("P3.2: model is server-free and adds no routes or UI", () => {
  const model = readFileSync("src/lib/degree-match/ireland-model.ts", "utf8")
  assert.doesNotMatch(model, /from "server-only"/)
  assert.doesNotMatch(model, /"use client"/)
  const modelView = IRELAND_DEGREE_MATCH_MODEL.every((row) => row.countryCode === "IE")
  assert.equal(modelView, true)
})