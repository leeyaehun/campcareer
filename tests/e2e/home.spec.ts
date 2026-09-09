import { expect, test } from "@playwright/test"

test("home exposes the core CampCareer exploration paths", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByRole("heading", { name: "Make better career and study decisions." })).toBeVisible()
  await expect(page.getByRole("link", { name: /Careers/ })).toHaveAttribute("href", "/career")
  await expect(page.getByRole("link", { name: /Countries/ })).toHaveAttribute("href", "/countries")
  await expect(page.getByRole("link", { name: /Programs/ })).toHaveAttribute("href", "/programs")
  await expect(page.getByRole("link", { name: /Compare/ })).toHaveAttribute("href", "/compare")
})
