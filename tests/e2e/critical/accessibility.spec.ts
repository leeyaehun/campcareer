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


test("keyboard-only navigation keeps a visible focus indicator", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "desktop keyboard smoke runs once in Chromium")
  await page.goto("/careers")
  await expect(page.getByRole("main").first()).toBeVisible()

  for (let index = 0; index < 8; index += 1) {
    await page.keyboard.press("Tab")
    const focus = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null
      if (!active || active === document.body) return { interactive: false, visible: false }
      const style = getComputedStyle(active)
      const rect = active.getBoundingClientRect()
      return {
        interactive: /^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(active.tagName) || active.tabIndex >= 0,
        visible: style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth || "0") >= 1,
        rectVisible: rect.width > 0 && rect.height > 0,
      }
    })
    expect(focus.interactive).toBe(true)
    expect(focus.visible).toBe(true)
    expect(focus.rectVisible).toBe(true)
  }
})

test("high text scaling keeps representative content usable without page overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "text scaling smoke runs once in Chromium")
  await page.setViewportSize({ width: 640, height: 900 })
  await page.goto("/career/australia/registered-nurse")
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%"
  })
  await expect(page.getByRole("heading", { name: "Registered Nurse", exact: true })).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})

test("reduced-motion preference collapses animations and transitions", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "reduced-motion smoke runs once in Chromium")
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/careers")
  const offenders = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("body *")]
      .filter((element) => {
        const style = getComputedStyle(element)
        const durations = [...style.animationDuration.split(","), ...style.transitionDuration.split(",")]
          .map((value) => Number.parseFloat(value) * (value.includes("ms") ? 0.001 : 1))
        return durations.some((duration) => Number.isFinite(duration) && duration > 0.02)
      })
      .slice(0, 10)
      .map((element) => element.outerHTML.slice(0, 180))
  )
  expect(offenders, JSON.stringify(offenders, null, 2)).toEqual([])
})

test("mobile form controls meet the WCAG 2.2 minimum target size", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "touch-target smoke runs on the mobile profile")
  await page.goto("/countries/au")
  await expect(page.getByRole("main").first()).toBeVisible()

  const undersized = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("button, input, select, textarea, [role=button]")]
      .filter((element) => {
        const rect = element.getBoundingClientRect()
        const style = getComputedStyle(element)
        if (style.display === "none" || style.visibility === "hidden" || rect.width === 0 || rect.height === 0) return false
        return rect.width < 24 || rect.height < 24
      })
      .slice(0, 20)
      .map((element) => ({
        tag: element.tagName,
        text: element.textContent?.trim().slice(0, 60) ?? "",
        ariaLabel: element.getAttribute("aria-label"),
        rect: element.getBoundingClientRect().toJSON(),
      }))
  )
  expect(undersized, JSON.stringify(undersized, null, 2)).toEqual([])
})
