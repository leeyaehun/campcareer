import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const auProgramServer = readFileSync("src/lib/programs/au-programs.server.ts", "utf8")
const auProgramPage = readFileSync("src/app/(workspace)/programs/au/[program]/page.tsx", "utf8")
const careerCore = readFileSync("src/app/(workspace)/career/career-core-sections.tsx", "utf8")
const occupationRead = readFileSync("src/lib/workspace/country-occupation-read.ts", "utf8")
const occupationContract = readFileSync("src/lib/workspace/country-occupation-contract.ts", "utf8")
const careerMarketRead = readFileSync("src/lib/workspace/career-market-read.ts", "utf8")

test("AU Program detail resolves reviewed reverse Career relations", () => {
  assert.match(auProgramServer, /from\("country_occupation_program_links"\)/)
  assert.match(auProgramServer, /eq\("program_ref", `au-program:\$\{id\}`\)/)
  assert.match(auProgramServer, /like\("profile_key", "AU:%"\)/)
  assert.match(auProgramServer, /careerLinks: careerLinkRows\.flatMap/)
  assert.match(auProgramServer, /\["au-program-detail-v2"\]/)
})

test("AU Program links only to published canonical Career routes", () => {
  assert.match(auProgramPage, /getIndexableCareerRoute\("AU", link\.careerId\)/)
  assert.match(auProgramPage, /href=\{route\.path\}/)
  assert.match(auProgramPage, /Related CampCareer careers/)
  assert.match(auProgramPage, /relationType\.replaceAll\("_", " "\)/)
})

test("Career study cards prefer indexable internal Program canonicals", () => {
  assert.match(occupationContract, /canonicalPath: string \| null/)
  assert.match(occupationRead, /isIndexableAuProgramId\(id\) && row\.official_url_status === "verified"/)
  assert.match(occupationRead, /programDetailPath\(id, row\.title \?\? "Untitled program"\)/)
  assert.match(careerCore, /const href = link\.program\.canonicalPath \?\? link\.program\.url/)
  assert.match(careerCore, /resource\.href\.startsWith\("\/"\)/)
  assert.match(careerCore, /<Link href=\{resource\.href\}/)
})

test("Foundation Career pages retain reviewed AU Program links", () => {
  assert.match(occupationRead, /export async function getCountryOccupationProgramLinks/)
  assert.match(occupationRead, /eq\("profile_key", \`\$\{country\}:\$\{career\}\`\)/)
  assert.match(careerMarketRead, /getCountryOccupationProgramLinks\(country, careerId\)/)
  assert.match(careerMarketRead, /programLinks: CareerMarketProfile\["programLinks"\] = \[\]/)
  assert.match(careerMarketRead, /profile: toFoundationCompatibilityProfile\(foundation, reviewedProgramLinks\)/)
})
