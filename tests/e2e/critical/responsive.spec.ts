import { expect, test } from "@playwright/test"
import { expectNoHorizontalPageOverflow, observeUnexpectedBrowserErrors } from "./quality-helpers"

const responsiveSurfaces = [
  { route: "/", width: 360, height: 800, name: "home" },
  { route: "/careers", width: 390, height: 844, name: "Careers" },
  { route: "/career/australia/registered-nurse", width: 768, height: 900, name: "Career" },
  { route: "/countries/au", width: 1024, height: 900, name: "Country" },
  { route: "/programs/au/1-bachelor-of-arts", width: 1280, height: 900, name: "Program" },
  { route: "/institutions/au/australian-catholic-university", width: 1440, height: 900, name: "Institution" },
  {
    route: "/compare?type=career&country=AU&profile=starting-from-scratch&careers=software-engineer",
    width: 390,
    height: 844,
    name: "Compare",
  },
]

test("representative surfaces have no page-level horizontal overflow at release breakpoints", async ({ page, browserName }, testInfo) => {
  test.skip(browserName !== "chromium" || testInfo.project.name !== "chromium", "Responsive matrix is measured once in desktop Chromium.")
  const assertNoBrowserErrors = observeUnexpectedBrowserErrors(page)

  for (const surface of responsiveSurfaces) {
    await page.setViewportSize({ width: surface.width, height: surface.height })
    const response = await page.goto(surface.route)
    expect(response?.status(), `${surface.name} must load at ${surface.width}px`).toBe(200)
    await expect(page.getByRole("main").first()).toBeVisible()
    await expectNoHorizontalPageOverflow(page)
  }

  assertNoBrowserErrors()
})
