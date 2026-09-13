import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { getIndexableVisaRoutes, visaPublicCanonicalPath } from "../src/lib/workspace/visa-routes"
import { getCompletedVisaCatalog } from "../src/lib/workspace/visa-catalog-complete"

function source(path: string) {
  return readFileSync(path, "utf8")
}

test("global navigation uses the five requested durable categories", () => {
  const primaryNav = source("src/components/layout/primary-product-nav.tsx")
  const landing = source("src/app/page.tsx")

  for (const label of ["Countries", "Careers", "Education", "Degrees", "Compare"]) {
    assert.ok(primaryNav.includes(`en: "${label}"`))
    assert.ok(landing.includes(`title: "${label}"`))
  }
  assert.ok(primaryNav.includes('href: "/compare"'))
})

test("Ireland country hub has stable local decision links without a duplicate career CTA", () => {
  const ireland = source("src/app/(workspace)/countries/ireland-country-dashboard.tsx")
  const countryPage = source("src/app/(workspace)/countries/ie/page.tsx")

  for (const href of ['href="#overview"', 'href="#careers"', 'href="#education"', 'href="#cities"', 'href="#industries"', 'href="/countries/ie/visas"']) {
    assert.ok(ireland.includes(href))
  }
  assert.ok(countryPage.includes("showExploreCareers={false}"))
})

test("Ireland career and city pages preserve a deterministic country return path", () => {
  const career = source("src/app/(workspace)/career/[country]/[career]/page.tsx")
  const city = source("src/app/(workspace)/cities/ireland-city-dashboard.tsx")

  assert.ok(career.includes('route.country.code === "IE" ? "/countries/ie"'))
  assert.ok(career.includes("Browse ${route.country.name} careers"))
  assert.ok(city.includes('href="/countries/ie"'))
})

test("Ireland visas use country-scoped canonical paths and leave other countries unchanged", () => {
  assert.equal(visaPublicCanonicalPath("IE", "Student visa"), "/countries/ie/visas/student-visa")
  assert.equal(visaPublicCanonicalPath("AU", "Student visa"), "/visas/au/student-visa")

  const routes = getIndexableVisaRoutes(getCompletedVisaCatalog())
  assert.ok(routes.some((route) => route.path === "/countries/ie/visas/student-visa"))
  assert.ok(!routes.some((route) => route.path === "/visas/ie/student-visa"))

  const legacyDetail = source("src/app/(workspace)/visas/[country]/[visa]/page.tsx")
  assert.ok(legacyDetail.includes('route.country.code === "IE"'))
  assert.ok(legacyDetail.includes("permanentRedirect(visaPublicCanonicalPath"))
})
