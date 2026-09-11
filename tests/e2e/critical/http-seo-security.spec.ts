import { expect, test } from "@playwright/test"
import { expectCanonical, observeUnexpectedBrowserErrors } from "./quality-helpers"

test("critical URLs return the right HTTP status, redirects, metadata, and security headers", async ({ page, request }) => {
  const career = await request.get("/career/australia/registered-nurse")
  expect(career.status()).toBe(200)
  expect(career.headers()["x-content-type-options"]).toBe("nosniff")
  expect(career.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin")
  expect(career.headers()["permissions-policy"]).toContain("camera=()")

  const missingCareer = await request.get("/career/australia/not-a-real-career")
  expect(missingCareer.status()).toBe(404)

  const invalidCareerCountry = await request.get("/career/not-a-country/registered-nurse")
  expect(invalidCareerCountry.status()).toBe(404)

  const stateContext = await request.get("/occupation/au/new-south-wales/registered-nurse")
  expect(stateContext.status()).toBe(200)

  const legacyCareer = await request.get("/career?country=AU&occupation=registered-nurse", { maxRedirects: 0 })
  expect(legacyCareer.status()).toBe(308)
  expect(legacyCareer.headers().location).toBe("/career/australia/registered-nurse")

  const malformedCompare = await request.get("/compare?type=career&country=ZZ&profile=invalid&careers=not-a-career")
  expect(malformedCompare.status()).toBe(200)

  const assertNoBrowserErrors = observeUnexpectedBrowserErrors(page)
  await page.goto("/career/australia/registered-nurse")
  await expect(page.getByRole("heading", { name: "Registered Nurse", exact: true })).toBeVisible()
  await expectCanonical(page, "/career/australia/registered-nurse")
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Registered Nurse/)

  await page.goto("/programs/au/1-bachelor-of-arts")
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Macquarie University/)

  await page.goto("/compare?type=career&country=ZZ&profile=invalid&careers=not-a-career")
  await expect(page.getByRole("heading", { name: "Comparison not available" })).toBeVisible()

  await page.goto("/occupation/au/new-south-wales/registered-nurse")
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow")
  assertNoBrowserErrors()
})
