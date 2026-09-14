import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, test } from "node:test"

const TOP_NAV = readFileSync(resolve(__dirname, "../src/components/layout/top-nav.tsx"), "utf8")
const WORKSPACE_TOPBAR = readFileSync(resolve(__dirname, "../src/components/workspace/workspace-topbar.tsx"), "utf8")
const PRIMARY_PRODUCT_NAV = readFileSync(resolve(__dirname, "../src/components/layout/primary-product-nav.tsx"), "utf8")
const COUNTRY_DASHBOARD_SHELL = readFileSync(resolve(__dirname, "../src/app/(workspace)/countries/country-dashboard-shell.tsx"), "utf8")
const IE_CITY_DASHBOARD = readFileSync(resolve(__dirname, "../src/app/(workspace)/cities/ireland-city-dashboard.tsx"), "utf8")
const IE_INSTITUTIONS_EXPLORER = readFileSync(resolve(__dirname, "../src/app/(workspace)/institutions/ireland-institutions-explorer.tsx"), "utf8")
const IE_INSTITUTION_DETAIL = readFileSync(resolve(__dirname, "../src/app/(workspace)/institutions/ireland-institution-detail.tsx"), "utf8")
const IE_EMPLOYMENT_SECTION = readFileSync(resolve(__dirname, "../src/app/(workspace)/countries/ireland-employment-ecosystem-section.tsx"), "utf8")
const IE_VISA_CONTENT = readFileSync(resolve(__dirname, "../src/app/(workspace)/countries/ireland-visa-content.tsx"), "utf8")
const ENTITY_LOGO = readFileSync(resolve(__dirname, "../src/components/ui/entity-logo.tsx"), "utf8")

describe("UX-6 Visual Identity checks", () => {
  test("TopNav header uses brand-tinted background token", () => {
    assert.match(TOP_NAV, /bg-campcareer-surface bg-\[hsl\(var\(--cc-color-accent-subtle\)\)\]/)
  })

  test("WorkspaceTopbar header uses brand-tinted background token", () => {
    assert.match(WORKSPACE_TOPBAR, /bg-campcareer-surface bg-\[hsl\(var\(--cc-color-accent-subtle\)\)\]/)
  })

  test("PrimaryProductNavigation active state uses a contrasting surface pill on the tinted header", () => {
    assert.match(PRIMARY_PRODUCT_NAV, /bg-campcareer-surface text-campcareer-ink shadow-cc-surface/)
  })

  test("PrimaryProductNavigation inactive state hover uses the tinted surface blend", () => {
    assert.match(PRIMARY_PRODUCT_NAV, /hover:bg-campcareer-surface\/70/)
  })

  test("Country dashboard hero renders an optimized above-the-fold hero image via Next/Image", () => {
    assert.match(COUNTRY_DASHBOARD_SHELL, /import Image from "next\/image"/)
    assert.match(COUNTRY_DASHBOARD_SHELL, /heroImage \?/)
    assert.match(COUNTRY_DASHBOARD_SHELL, /sizes="100vw"/)
    assert.match(COUNTRY_DASHBOARD_SHELL, /loading="eager"/)
    assert.match(COUNTRY_DASHBOARD_SHELL, /fetchPriority="high"/)
    assert.match(COUNTRY_DASHBOARD_SHELL, /alt=""/)
    assert.doesNotMatch(COUNTRY_DASHBOARD_SHELL, /priority[=\s]/)
  })

  test("Ireland city hero reuses one regional-discovery image with above-the-fold loading", () => {
    assert.match(IE_CITY_DASHBOARD, /import Image from "next\/image"/)
    assert.match(IE_CITY_DASHBOARD, /regionalDiscoveryFor\("IE"\)/)
    assert.match(IE_CITY_DASHBOARD, /sizes="100vw"/)
    assert.match(IE_CITY_DASHBOARD, /loading="eager"/)
    assert.match(IE_CITY_DASHBOARD, /fetchPriority="high"/)
    assert.match(IE_CITY_DASHBOARD, /alt=""/)
  })

  test("Institutions explorer uses EntityLogo and keeps the page cohort", () => {
    assert.match(IE_INSTITUTIONS_EXPLORER, /<EntityLogo name=\{institution\.name\} size="md" \/>/)
    assert.match(IE_INSTITUTIONS_EXPLORER, /<h1.*>Institutions<\/h1>/)
    assert.match(IE_INSTITUTIONS_EXPLORER, /verified institutions/)
    assert.match(IE_INSTITUTIONS_EXPLORER, /bg-brand-tint/)
  })

  test("Institution detail header uses EntityLogo and preserves HEA-recognised identity", () => {
    assert.match(IE_INSTITUTION_DETAIL, /<EntityLogo name=\{institution\.name\} size="lg" \/>/)
    assert.match(IE_INSTITUTION_DETAIL, /Ireland institution/)
    assert.match(IE_INSTITUTION_DETAIL, /HEA-recognised identity/)
    assert.doesNotMatch(IE_INSTITUTION_DETAIL, /<Building2/)
  })

  test("Employer context block exists with cohort employers and official careers links only", () => {
    assert.match(IE_EMPLOYMENT_SECTION, /Selected employers/)
    assert.match(IE_EMPLOYMENT_SECTION, /ecosystem\.employers\.map/)
    assert.match(IE_EMPLOYMENT_SECTION, /employer\.careersUrl/)
    assert.match(IE_EMPLOYMENT_SECTION, /ExternalLink/)
    assert.match(IE_EMPLOYMENT_SECTION, /not vacancies/)
    assert.doesNotMatch(IE_EMPLOYMENT_SECTION, /apply now/i)
    assert.doesNotMatch(IE_EMPLOYMENT_SECTION, /open positions/)
    assert.doesNotMatch(IE_EMPLOYMENT_SECTION, /job listings/)
  })

  test("Visa directory groups official-route entries by kind with descriptive path headings", () => {
    assert.match(IE_VISA_CONTENT, /KIND_ORDER/)
    assert.match(IE_VISA_CONTENT, /visa-kind-/)
    assert.match(IE_VISA_CONTENT, /Study/)
    assert.match(IE_VISA_CONTENT, /Work/)
    assert.match(IE_VISA_CONTENT, /Working holiday/)
    assert.match(IE_VISA_CONTENT, /Skilled/)
  })

  test("Visa detail uses a tinted brand pill for the pathway kind", () => {
    assert.match(IE_VISA_CONTENT, /rounded-full bg-brand-tint px-3 py-1\.5 text-xs font-semibold text-brand/)
    assert.match(IE_VISA_CONTENT, /\{visa\.kind\} pathway · Ireland/)
  })

  test("EntityLogo is a client-side mark that never links externally by itself", () => {
    assert.match(ENTITY_LOGO, /"use client"/)
    assert.match(ENTITY_LOGO, /institutionInitials/)
    assert.match(ENTITY_LOGO, /aria-hidden="true"/)
    assert.doesNotMatch(ENTITY_LOGO, /<a[\s\S]*<EntityLogo|<EntityLogo[\s\S]*<a/)
    assert.doesNotMatch(ENTITY_LOGO, /referrerpolicy="unsafe-url"/)
  })

  test("No new third-party image packages are introduced on the modified surfaces", () => {
    assert.doesNotMatch(TOP_NAV, /from ["']next\/image["']/)
    assert.doesNotMatch(WORKSPACE_TOPBAR, /from ["']next\/image["']/)
    assert.doesNotMatch(IE_VISA_CONTENT, /from ["']next\/image["']/)
  })
})