import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"
import { observeUnexpectedBrowserErrors } from "./quality-helpers"

for (const route of [
  "/careers",
  "/career/australia/registered-nurse",
  "/countries/au",
  "/programs/au/1-bachelor-of-arts",
  "/institutions/au/australian-catholic-university",
  "/compare?type=career&country=AU&profile=starting-from-scratch&careers=software-engineer",
  "/sources",
]) {
  test(`automated WCAG 2.2 AA scan: ${route}`, async ({ page }) => {
    const assertNoBrowserErrors = observeUnexpectedBrowserErrors(page)
    const response = await page.goto(route)
    expect(response?.status()).toBe(200)
    await expect(page.getByRole("main").first()).toBeVisible()

    const results = await new AxeBuilder({ page })
      .include("main")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze()

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
    assertNoBrowserErrors()
  })
}
