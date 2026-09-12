import { expect, test } from "@playwright/test"
import {
  expectCanonical,
  expectNoHorizontalPageOverflow,
  observeUnexpectedBrowserErrors,
} from "./quality-helpers"

test("Journey A–B: Career discovery reaches evidence, then a supported Compare context", async ({ page }) => {
  const assertNoBrowserErrors = observeUnexpectedBrowserErrors(page)
  const response = await page.goto("/careers")
  expect(response?.status()).toBe(200)

  await page.getByRole("button", { name: "All countries" }).click()
  await page.getByRole("option", { name: "Australia" }).click()
  await expect(page).toHaveURL(/\/careers\?country=AU$/)

  const search = page.getByRole("searchbox", { name: /Search careers/ })
  await search.fill("Registered Nurse")
  await page.getByRole("button", { name: /^Registered Nurse/ }).click()

  await expect(page).toHaveURL(/\/career\/australia\/registered-nurse$/)
  await expect(page.getByRole("heading", { name: "Registered Nurse", exact: true })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Why this score" })).toBeVisible()
  await expect(page.getByText("Key sources")).toBeVisible()
  await expectCanonical(page, "/career/australia/registered-nurse")
  await expectNoHorizontalPageOverflow(page)

  const career = await page.goto("/career/australia/software-developer")
  expect(career?.status()).toBe(200)
  await expect(page.getByRole("heading", { name: "Software Developer", exact: true })).toBeVisible()

  await page.goto("/compare?type=career&country=AU&profile=starting-from-scratch&careers=software-engineer")
  await expect(page.getByRole("heading", { name: "Compare careers" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Change career from Software Engineer" })).toBeVisible()
  await expect(page.getByText("Select one more career to compare.")).toBeVisible()
  await page.waitForLoadState("networkidle")
  assertNoBrowserErrors()
})

test("Completed Career Compare is shareable without becoming an indexed query page", async ({ page }) => {
  const response = await page.goto("/compare?type=career&country=AU&profile=starting-from-scratch&careers=registered-nurse,software-engineer")
  expect(response?.status()).toBe(200)

  await expect(page).toHaveTitle(/Compare Registered Nurse and Software Engineer/)
  await expect(page.getByRole("button", { name: "Share comparison" })).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow")
  await expectCanonical(page, "/compare")
  await expectNoHorizontalPageOverflow(page)
})


test("Ireland Career MVP links into a reconstructable noindex comparison context", async ({ page }) => {
  const assertNoBrowserErrors = observeUnexpectedBrowserErrors(page)
  const response = await page.goto("/career/ireland/software-developer")
  expect(response?.status()).toBe(200)

  await expect(page.getByRole("heading", { name: "Software Developer", exact: true })).toBeVisible()

  const actions = page.getByLabel("Secondary career actions")
  const compare = actions.getByRole("link", { name: "Compare" })
  await expect(compare).toHaveAttribute(
    "href",
    "/compare?type=career&country=IE&profile=ireland-career-mvp-v1&careers=software-developer",
  )
  await compare.click()

  await expect(page.getByRole("heading", { name: "Compare careers" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Compare reviewed Ireland careers" })).toBeVisible()
  await page.getByLabel("Choose career 2").selectOption("civil-engineer")

  await expect(page).toHaveURL(/country=IE.*careers=software-developer%2Ccivil-engineer/)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow")
  await expectCanonical(page, "/compare")
  await expectNoHorizontalPageOverflow(page)
  assertNoBrowserErrors()
})

test("Journey C: Country context retains its country when opening Career discovery", async ({ page }) => {
  const assertNoBrowserErrors = observeUnexpectedBrowserErrors(page)
  const response = await page.goto("/countries/au")
  expect(response?.status()).toBe(200)
  await expect(page.getByRole("heading", { name: "Australia", exact: true })).toBeVisible()

  const careers = page.getByRole("link", { name: "Explore careers in Australia" })
  await expect(careers).toHaveAttribute("href", "/careers?country=AU")
  await careers.click()
  await expect(page).toHaveURL(/\/careers\?country=AU$/)
  await expect(page.getByRole("button", { name: "Australia" })).toBeVisible()
  await expectNoHorizontalPageOverflow(page)
  assertNoBrowserErrors()
})

test("Journey D: a verified Program keeps its institution relationship", async ({ page }) => {
  const assertNoBrowserErrors = observeUnexpectedBrowserErrors(page)
  const response = await page.goto("/programs/au/1-bachelor-of-arts")
  expect(response?.status()).toBe(200)

  const institution = page.getByRole("link", { name: "Macquarie University" }).first()
  await expect(institution).toHaveAttribute("href", "/institutions/au/macquarie-university")
  await institution.click()
  await expect(page).toHaveURL(/\/institutions\/au\/macquarie-university$/)
  await expect(page.getByRole("heading", { name: "Macquarie University", exact: true })).toBeVisible()
  await expectNoHorizontalPageOverflow(page)
  assertNoBrowserErrors()
})
