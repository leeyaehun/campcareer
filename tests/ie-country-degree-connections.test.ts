import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const contract = readFileSync("src/lib/career-degree/contract.ts", "utf8")
const readModel = readFileSync("src/lib/career-degree/read.ts", "utf8")
const page = readFileSync("src/app/(workspace)/countries/ie/page.tsx", "utf8")
const dashboard = readFileSync("src/app/(workspace)/countries/ireland-country-dashboard.tsx", "utf8")

test("Country Degree read groups reviewed careers from one server-only relation-view query", () => {
  assert.match(contract, /export type CountryDegreeConnection/)
  assert.match(readModel, /import "server-only"/)
  assert.match(readModel, /async function loadCountryDegreeConnections/)
  assert.match(readModel, /const relations = await loadRelations\(country\)/)
  assert.match(readModel, /connectionsByDegree/)
  assert.match(readModel, /getCountryDegreeConnections = cache\(loadCountryDegreeConnections\)/)
  assert.match(readModel, /if \(relationUnavailable\(result\.error\)\) return \[\] as RelationRow\[\]/)
})

test("Ireland Country Hub keeps reviewed Degree connections concise and career-first", () => {
  assert.match(page, /getIrelandCountryDegreeInstitutionConnections\(\)/)
  assert.match(page, /Promise\.all/)
  assert.match(dashboard, /Study areas/)
  assert.match(dashboard, /degreeConnections\.map/)
  assert.match(dashboard, /connection\.careers\.map/)
  assert.match(dashboard, /careerCanonicalPath\("IE", career\.careerId\)/)
  assert.doesNotMatch(dashboard, /Evidence: \{career\.evidence\.authority\}/)
  assert.doesNotMatch(dashboard, /Reviewed evidence institution/)
  assert.doesNotMatch(dashboard, /career\.evidenceInstitution/)
  assert.doesNotMatch(dashboard, /career\.rationale/)
  assert.doesNotMatch(dashboard, /profile\.strongMajors/)
  assert.match(dashboard, /countries\/ie\/degrees/)
  assert.doesNotMatch(dashboard, /\/programs\/ie/)
})
