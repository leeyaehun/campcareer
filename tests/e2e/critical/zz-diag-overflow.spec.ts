import { expect, test } from "@playwright/test"

test("DIAG: report elements with right edge beyond viewport at 640/200% (always passes, prints offenders)", async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 })
  await page.goto("/career/australia/registered-nurse")
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%"
  })
  await expect(page.getByRole("heading", { name: "Registered Nurse", exact: true })).toBeVisible()
  const report = await page.evaluate(() => {
    const clientW = document.documentElement.clientWidth
    const scrollW = document.documentElement.scrollWidth
    const overflow = scrollW - clientW
    const offenders = [...document.querySelectorAll<HTMLElement>("body *")]
      .filter((el) => el.getBoundingClientRect().width > 0 && getComputedStyle(el).visibility !== "hidden")
      .map((el) => {
        const r = el.getBoundingClientRect()
        return {
          right: Math.round(r.right),
          left: Math.round(r.left),
          w: Math.round(r.width),
          cls: (el.className + "").replace(/\s+/g, " ").slice(0, 70),
          tag: el.tagName,
          inHeader: Boolean(el.closest("header")),
        }
      })
      .filter((x) => x.right > clientW)
      .sort((a, b) => b.right - a.right)
      .slice(0, 15)
    return { overflow, clientW, scrollW, offenders }
  })
  console.log(`DIAG_OVERFLOW_COUNT=${report.offenders.length}`)
  console.log(`DIAG_OVERFLOW=${JSON.stringify(report)}`)
  expect(true).toBe(true)
})
