import assert from "node:assert/strict"
import test from "node:test"
import {
  createFeedbackScreenshotPath,
  FEEDBACK_SCREENSHOT_BUCKET,
  FEEDBACK_SCREENSHOT_MAX_BYTES,
  isFeedbackScreenshotPath,
  parseFeedbackSubmission,
  parseScreenshotUploadRequest,
} from "../src/lib/feedback-contract"

const screenshotPath = "uploads/2026/07/123e4567-e89b-42d3-a456-426614174000.png"

test("accepts a consented issue report and strips URL query details", () => {
  const result = parseFeedbackSubmission({
    type: "issue",
    category: "map_location",
    description: " France is missing from the map. ",
    emailConsent: true,
    email: "reader@example.com",
    systemInfoConsent: true,
    systemInfo: {
      pagePath: "/maps?country=fr#details",
      locale: "en-IE",
      timeZone: "Europe/Dublin",
      userAgent: "test-browser",
      viewportWidth: 390,
      viewportHeight: 844,
    },
    screenshot: { bucket: FEEDBACK_SCREENSHOT_BUCKET, path: screenshotPath },
  })

  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.data.description, "France is missing from the map.")
  assert.equal(result.data.category, "map_location")
  assert.equal(result.data.email, "reader@example.com")
  assert.equal(result.data.systemInfo?.pagePath, "/maps")
  assert.deepEqual(result.data.screenshot, {
    bucket: FEEDBACK_SCREENSHOT_BUCKET,
    path: screenshotPath,
  })
})

test("rejects account-help categories from the legacy form", () => {
  const result = parseFeedbackSubmission({
    type: "issue",
    category: "Recover account/password",
    description: "This category no longer belongs here.",
  })

  assert.deepEqual(result, {
    ok: false,
    code: "CATEGORY_REQUIRED",
    error: "Choose the part of CampCareer affected",
  })
})

test("requires a usable email only when follow-up consent is enabled", () => {
  const invalid = parseFeedbackSubmission({
    type: "suggestion",
    description: "Add a cost breakdown.",
    emailConsent: true,
    email: "not-an-email",
  })
  assert.equal(invalid.ok, false)
  if (!invalid.ok) assert.equal(invalid.code, "VALID_EMAIL_REQUIRED")

  const noConsent = parseFeedbackSubmission({
    type: "suggestion",
    description: "Add a cost breakdown.",
    emailConsent: false,
    email: "should-not-be-stored@example.com",
    systemInfoConsent: false,
    systemInfo: { pagePath: "/compare" },
  })
  assert.equal(noConsent.ok, true)
  if (!noConsent.ok) return
  assert.equal(noConsent.data.email, null)
  assert.equal(noConsent.data.systemInfo, null)
  assert.equal(noConsent.data.category, null)
})

test("validates screenshot upload metadata before issuing a signed token", () => {
  const valid = parseScreenshotUploadRequest({
    contentType: "image/webp",
    sizeBytes: FEEDBACK_SCREENSHOT_MAX_BYTES,
  })
  assert.equal(valid.ok, true)

  const tooLarge = parseScreenshotUploadRequest({
    contentType: "image/png",
    sizeBytes: FEEDBACK_SCREENSHOT_MAX_BYTES + 1,
  })
  assert.equal(tooLarge.ok, false)
  if (!tooLarge.ok) assert.equal(tooLarge.code, "SCREENSHOT_TOO_LARGE")

  const wrongType = parseScreenshotUploadRequest({
    contentType: "image/svg+xml",
    sizeBytes: 100,
  })
  assert.equal(wrongType.ok, false)
  if (!wrongType.ok) assert.equal(wrongType.code, "UNSUPPORTED_SCREENSHOT_TYPE")
})

test("creates opaque, allowlisted screenshot paths", () => {
  const path = createFeedbackScreenshotPath(
    "image/jpeg",
    "123e4567-e89b-42d3-a456-426614174000",
    new Date("2026-07-14T12:00:00Z"),
  )

  assert.equal(path, "uploads/2026/07/123e4567-e89b-42d3-a456-426614174000.jpg")
  assert.equal(isFeedbackScreenshotPath(path), true)
  assert.equal(isFeedbackScreenshotPath("../public/guess.png"), false)
})

test("rejects forged bucket and path references", () => {
  const result = parseFeedbackSubmission({
    type: "suggestion",
    description: "Please add this.",
    screenshot: { bucket: "public", path: "uploads/2026/07/file.png" },
  })

  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.code, "INVALID_SCREENSHOT_REFERENCE")
})

test("accepts bounded page context but never accepts a browser-selected review status", () => {
  const result = parseFeedbackSubmission({
    type: "issue",
    category: "data_outdated",
    description: "The source date needs review.",
    status: "resolved",
    context: { pagePath: "/sources?country=au", entityType: "source" },
  })

  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.deepEqual(result.data.context, { pagePath: "/sources", entityType: "source" })
  assert.equal("status" in result.data, false)
})

test("rejects forged or unbounded page context", () => {
  const result = parseFeedbackSubmission({
    type: "issue",
    category: "data_missing",
    description: "A value is missing.",
    context: { pagePath: "https://outside.example", entityType: "admin" },
  })

  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.code, "INVALID_CONTEXT")
})
