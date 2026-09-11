import { expect, type Page } from "@playwright/test"

export function observeUnexpectedBrowserErrors(page: Page) {
  const errors: string[] = []
  const onPageError = (error: Error) => errors.push(`pageerror: ${error.message}`)
  const onConsole = (message: { type(): string; text(): string }) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`)
  }

  page.on("pageerror", onPageError)
  page.on("console", onConsole)

  return () => {
    page.off("pageerror", onPageError)
    page.off("console", onConsole)
    expect(errors, "critical journeys must not produce unexpected browser errors").toEqual([])
  }
}

export async function expectNoHorizontalPageOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow, "page-level horizontal overflow is not intentional on this surface").toBeLessThanOrEqual(1)
}

export async function expectCanonical(page: Page, pathname: string) {
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `https://www.campcareer.com${pathname}`,
  )
}
