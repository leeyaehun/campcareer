import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import test from "node:test"
import { resolveCompareModeType, COMPARE_MODE_NAV_ITEMS } from "../src/lib/compare-navigation"
import { findNavCountryContext } from "../src/lib/navigation/nav-country-context"
import { compareModeLabel } from "../src/lib/workspace/sidebar-i18n"
import {
  DECISION_TOOL_DESTINATIONS,
  isCurrentPath,
  PRIMARY_DESTINATIONS,
} from "../src/components/layout/primary-product-nav"

function source(path: string) {
  return readFileSync(path, "utf8")
}

const primaryNav = source("src/components/layout/primary-product-nav.tsx")
const mobileNav = source("src/components/layout/mobile-navigation.tsx")
const indicator = source("src/components/layout/country-context-indicator.tsx")
const contextHelper = source("src/lib/navigation/nav-country-context.ts")

test("primary navigation exposes the four core exploration areas", () => {
  assert.deepEqual(
    PRIMARY_DESTINATIONS.map((item) => item.label.en),
    ["Countries", "Careers", "Education", "Degrees"],
  )
  for (const label of ["Countries", "Careers", "Education", "Degrees"]) {
    assert.ok(primaryNav.includes(`en: "${label}"`))
  }
  assert.ok(PRIMARY_DESTINATIONS.every((item) => item.lane === "primary"))
})

test("decision tools expose Maps and Compare as a distinct group", () => {
  assert.deepEqual(
    DECISION_TOOL_DESTINATIONS.map((item) => item.href),
    ["/maps", "/compare"],
  )
  for (const label of ["Maps", "Compare"]) {
    assert.ok(primaryNav.includes(`en: "${label}"`))
  }
  assert.ok(DECISION_TOOL_DESTINATIONS.every((item) => item.lane === "decision-tool"))
  assert.ok(primaryNav.includes('label: { en: "Maps"'))
  assert.ok(primaryNav.includes('label: { en: "Compare"'))
})

test("desktop nav renders two landmarks with a visual separator", () => {
  assert.ok(primaryNav.includes('aria-label={locale === "ko" ? "주요 탐색" : "Primary navigation"}'))
  assert.ok(primaryNav.includes('aria-label={locale === "ko" ? "의사 결정 도구" : "Decision tools"}'))
  assert.ok(primaryNav.includes('hidden items-center gap-1 lg:flex'))
})

test("mobile navigation surfaces every desktop destination", () => {
  const allHrefs = [...PRIMARY_DESTINATIONS, ...DECISION_TOOL_DESTINATIONS].map((item) => item.href)
  assert.equal(allHrefs.length, 6)
  assert.ok(mobileNav.includes('from "./primary-product-nav"'))
  assert.ok(mobileNav.includes("PRIMARY_DESTINATIONS.map"))
  assert.ok(mobileNav.includes("DECISION_TOOL_DESTINATIONS.map"))
  assert.ok(mobileNav.includes('import Link from "next/link"'))
})

test("navigation hrefs preserve the existing route set", () => {
  assert.deepEqual(
    [...PRIMARY_DESTINATIONS, ...DECISION_TOOL_DESTINATIONS]
      .map((item) => item.href)
      .slice()
      .sort(),
    ["/careers", "/compare", "/countries", "/institutions", "/maps", "/programs"].sort(),
  )
  assert.ok(primaryNav.includes('href: "/compare"'))
  assert.ok(primaryNav.includes('href: "/maps"'))
})

test("active state resolves for every navigation lane", () => {
  for (const item of PRIMARY_DESTINATIONS) {
    for (const match of item.matches) {
      assert.equal(isCurrentPath(match, item.matches), true)
    }
  }
  assert.equal(isCurrentPath("/countries/ie/degrees", ["/countries"]), true)
  assert.equal(isCurrentPath("/career/ireland/software-developer", ["/careers", "/career"]), true)
  assert.equal(isCurrentPath("/careers", ["/careers", "/career"]), true)
  assert.equal(isCurrentPath("/compare", ["/compare"]), true)
  assert.equal(isCurrentPath("/maps", ["/maps"]), true)
  assert.equal(isCurrentPath("/institutions/ie/university-college-dublin", ["/institutions"]), true)
  assert.equal(isCurrentPath("/programs/ie/software-development", ["/programs", "/courses"]), true)
  assert.equal(isCurrentPath("/home", ["/careers", "/career"]), false)
  assert.ok(primaryNav.includes('aria-current={active ? "page" : undefined}'))
  assert.ok(mobileNav.includes('aria-current={active ? "page" : undefined}'))
})

test("country context is derived from the route and links to the country dashboard", () => {
  const dublin = findNavCountryContext("/cities/ie/dublin")
  assert.ok(dublin)
  assert.equal(dublin.code, "IE")
  assert.equal(dublin.slug, "ireland")

  const career = findNavCountryContext("/career/ireland/software-developer")
  assert.ok(career)
  assert.equal(career.code, "IE")

  const degrees = findNavCountryContext("/countries/ie/degrees")
  assert.ok(degrees)
  assert.equal(degrees.code, "IE")

  const visa = findNavCountryContext("/countries/ie/visas/student-visa")
  assert.ok(visa)
  assert.equal(visa.code, "IE")

  const auCampus = findNavCountryContext("/programs/au/some-program")
  assert.ok(auCampus)
  assert.equal(auCampus.code, "AU")

  assert.equal(findNavCountryContext("/countries"), null)
  assert.equal(findNavCountryContext("/"), null)
  assert.equal(findNavCountryContext("/compare"), null)
  assert.equal(findNavCountryContext("/maps"), null)
  assert.equal(findNavCountryContext("/careers"), null)

  assert.ok(contextHelper.includes('from "@/data/launch-countries"'))
  assert.ok(indicator.includes("/countries/${country.code.toLowerCase()}"))
  assert.ok(indicator.includes("localizePath"))
})

test("Compare keeps all five modes and its discoverable entry unchanged", () => {
  assert.deepEqual(
    COMPARE_MODE_NAV_ITEMS.map((item) => item.type),
    ["program", "country", "city", "career", "degree"],
  )
  for (const mode of ["program", "country", "city", "career", "degree"]) {
    assert.equal(resolveCompareModeType(mode), mode)
  }
  assert.equal(resolveCompareModeType("unknown"), "unsupported")
  assert.equal(compareModeLabel("en", "degree"), "Degrees")
  assert.ok(primaryNav.includes('href: "/compare"'))
  assert.ok(DECISION_TOOL_DESTINATIONS.some((item) => item.href === "/compare"))
  assert.ok(mobileNav.includes("DECISION_TOOL_DESTINATIONS.map"))
})

test("Maps keeps its surface and entry points", () => {
  const maps = DECISION_TOOL_DESTINATIONS.find((item) => item.href === "/maps")
  assert.ok(maps)
  assert.deepEqual(maps.matches, ["/maps"])
  assert.ok(primaryNav.includes('href: "/maps"'))
  assert.ok(mobileNav.includes("DECISION_TOOL_DESTINATIONS.map"))
})

test("no navigation-only SEO pages or routes were added", () => {
  const surfaceDirs = readdirSync("src/app/(workspace)", { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
  assert.deepEqual(surfaceDirs, [
    "career",
    "careers",
    "cities",
    "compare",
    "countries",
    "courses",
    "employers",
    "home",
    "institutions",
    "occupation",
    "programs",
    "study",
    "visas",
  ])
  for (const file of [primaryNav, mobileNav, indicator]) {
    assert.ok(!file.includes("generateMetadata"))
    assert.ok(!file.includes('export default'))
  }
})

test("navigation foundation adds no new data models", () => {
  assert.ok(contextHelper.includes('from "@/data/launch-countries"'))
  assert.ok(!contextHelper.includes("createServerComponentClient"))
  assert.ok(!contextHelper.includes("localStorage"))
  assert.ok(!contextHelper.includes("useState"))
})

test("mobile menu is keyboard accessible with escape, focus and scroll handling", () => {
  assert.ok(mobileNav.includes('aria-haspopup="dialog"'))
  assert.ok(mobileNav.includes("aria-expanded={open}"))
  assert.ok(mobileNav.includes("aria-controls={open ? panelId : undefined}"))
  assert.ok(mobileNav.includes('role="dialog"'))
  assert.ok(mobileNav.includes('aria-modal="true"'))
  assert.ok(mobileNav.includes('event.key === "Escape"'))
  assert.ok(mobileNav.includes('document.body.style.overflow = "hidden"'))
  assert.ok(mobileNav.includes("closeButtonRef.current?.focus()"))
  assert.ok(mobileNav.includes("buttonRef.current?.focus()"))
})

test("mobile menu cannot overflow the viewport", () => {
  assert.ok(mobileNav.includes("max-w-[calc(100vw-1rem)]"))
  assert.ok(mobileNav.includes("overflow-y-auto"))
  assert.ok(mobileNav.includes("min-h-11"))
  assert.ok(primaryNav.includes("hidden items-center gap-1 lg:flex"))
})

test("mobile menu sits left of the CampCareer logo in every shell", () => {
  const topNav = source("src/components/layout/top-nav.tsx")
  const workspaceTopbar = source("src/components/workspace/workspace-topbar.tsx")
  for (const shell of [topNav, workspaceTopbar]) {
    const mobileIndex = shell.indexOf("<MobileNavigation")
    const wordmarkIndex = shell.indexOf("CampCareer")
    assert.ok(mobileIndex !== -1, "shell missing MobileNavigation")
    assert.ok(wordmarkIndex !== -1)
    assert.ok(mobileIndex < wordmarkIndex, "MobileNavigation must render before the wordmark")
  }
})

test("mobile menu distinguishes sections with minimal line icons, black text and a separator line", () => {
  assert.ok(mobileNav.includes('DESTINATION_ICONS: Record<string, LucideIcon>'))
  for (const icon of ["Globe", "Briefcase", "School", "GraduationCap", "Map", "Scale"]) {
    assert.ok(mobileNav.includes(icon), `missing icon ${icon}`)
  }
  assert.ok(mobileNav.includes('text-campcareer-ink hover:bg-campcareer-surface/70'))
  assert.ok(mobileNav.includes("strokeWidth"))
  assert.ok(mobileNav.includes('border-t border-campcareer-border pt-6'))
  assert.ok(mobileNav.includes('text-xs font-semibold uppercase tracking-wide text-campcareer-muted'))
})

test("mobile drawer slides in from the left", () => {
  assert.ok(mobileNav.includes('absolute left-0 top-0'))
  assert.ok(mobileNav.includes('"-translate-x-full"'))
  assert.ok(mobileNav.includes('"translate-x-0"'))
  assert.ok(mobileNav.includes("transition-transform duration-cc-standard motion-reduce:transition-none"))
  assert.ok(mobileNav.includes('open ? "visible" : "invisible pointer-events-none"'))
})