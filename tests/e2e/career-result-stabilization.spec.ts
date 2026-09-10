import { expect, test } from "@playwright/test"

test("AU Software Developer renders in its supported Career comparison context", async ({ page }) => {
  await page.goto("/career/australia/software-developer")
  await expect(page.getByRole("heading", { name: "Software Developer" })).toBeVisible()

  await page.goto("/compare?type=career&country=AU&profile=starting-from-scratch&careers=software-engineer")
  await expect(page.getByRole("heading", { name: "Compare careers" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Change career from Software Engineer" })).toBeVisible()
})

test("legacy query-style Career URL redirects to the canonical page and preserves attribution", async ({ page }) => {
  await page.goto("/career?country=AU&occupation=registered-nurse&utm_source=tiktok")
  await expect(page).toHaveURL(/\/career\/australia\/registered-nurse\?utm_source=tiktok$/)
})

test("signed-out Save returns through login to the same canonical Career Page", async ({ page }) => {
  await page.goto("/career/australia/registered-nurse")

  const save = page.getByRole("link", { name: "Save" })
  await expect(save).toBeVisible()

  const href = await save.getAttribute("href")
  expect(href).toContain("/login?next=")
  expect(decodeURIComponent(href ?? "")).toContain("/career/australia/registered-nurse?save=1")
})
