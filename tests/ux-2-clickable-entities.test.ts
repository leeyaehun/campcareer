import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

const entityCard = read("src/components/ui/entity-card.tsx")
const institutionExplorer = read("src/app/(workspace)/institutions/ireland-institutions-explorer.tsx")
const countryDashboard = read("src/app/(workspace)/countries/ireland-country-dashboard.tsx")
const countryPage = read("src/app/(workspace)/countries/ie/page.tsx")
const countryShell = read("src/app/(workspace)/countries/country-dashboard-shell.tsx")
const employmentSection = read("src/app/(workspace)/countries/ireland-employment-ecosystem-section.tsx")
const searchResults = read("src/app/(workspace)/careers/ireland-public-search-results.tsx")

test("EntityCardLink is a semantic, keyboard-accessible link surface", () => {
  assert.match(entityCard, /import Link from "next\/link"/)
  assert.match(entityCard, /function EntityCardLink/)
  assert.match(entityCard, /min-h-11/)
  assert.match(entityCard, /cursor-pointer/)
  assert.match(entityCard, /focus-visible:ring-4/)
  assert.match(entityCard, /hover:border-brand\/40/)
})

test("Ireland institution explorer makes each verified institution card the primary link", () => {
  const card = institutionExplorer.slice(
    institutionExplorer.indexOf("function IrelandInstitutionCard"),
    institutionExplorer.indexOf("export async function IrelandInstitutionsExplorer"),
  )

  assert.match(card, /<EntityCardLink href=\{detailPath\}/)
  assert.doesNotMatch(card, /<Link href=\{detailPath\}/)
  assert.doesNotMatch(card, /View education profile/)
  assert.match(card, /Open \{location\.city\.name\}/)
  assert.match(card, /<a href=\{institution\.websiteUrl\}/)
})

test("Ireland Country institution cards avoid nested links and keep city actions secondary", () => {
  const card = countryDashboard.slice(
    countryDashboard.indexOf("function InstitutionConnectionCard"),
    countryDashboard.indexOf("export function IrelandCountryDashboard"),
  )

  assert.match(card, /<EntityCardLink href=\{detailPath\}/)
  assert.doesNotMatch(card, /<Link href=\{detailPath\}/)
  assert.match(card, /<Link key=\{location\.id\} href=\{location\.city\.path\}/)
  assert.doesNotMatch(card.slice(card.indexOf("<EntityCardLink"), card.indexOf("</EntityCardLink>")), /<Link|<a /)
})

test("Ireland Country city links are limited to the four published city routes", () => {
  assert.match(countryDashboard, /const publishedRegions = explorer\.regions/)
  assert.match(countryDashboard, /cities\.filter\(\(city\) => Boolean\(ieCityPath\(city\)\)\)/)
  assert.match(countryDashboard, /return <Link key=\{city\} href=\{cityPath!\}/)
  assert.doesNotMatch(countryDashboard, /: <span key=\{city\} className=\{className\}/)
  assert.match(countryPage, /PUBLISHED_IE_CITY_SLUGS/)
  assert.match(countryPage, /cityCount=\{PUBLISHED_IE_CITY_SLUGS\.length\}/)
  assert.match(countryShell, /cityCountOverride \?\? explorer\?\.regions/)
})

test("Ireland search results remain full-row canonical links", () => {
  assert.match(searchResults, /<li key=\{result\.id\}>[\s\S]*<Link href=\{result\.href\}/)
  assert.doesNotMatch(searchResults, /onClick=/)
})

test("UX-2 leaves employer and degree relationship architecture unchanged", () => {
  assert.match(employmentSection, /href=\{employer\.careersUrl\}/)
  assert.doesNotMatch(employmentSection, /employerDetailPath|\/employers\//)
  assert.doesNotMatch(countryDashboard, /\/degrees\//)
  assert.doesNotMatch(countryDashboard, /degreeDetailPath/)
})
