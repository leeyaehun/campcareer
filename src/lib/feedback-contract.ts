export const FEEDBACK_DESCRIPTION_MAX_LENGTH = 2_000
export const FEEDBACK_EMAIL_MAX_LENGTH = 254
export const FEEDBACK_SCREENSHOT_BUCKET = "feedback-screenshots"
export const FEEDBACK_SCREENSHOT_MAX_BYTES = 5 * 1024 * 1024

export const FEEDBACK_SCREENSHOT_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const

import { z } from "zod"

export const FEEDBACK_ISSUE_OPTIONS = [
  { value: "search_filters", label: "Search or filters" },
  { value: "map_location", label: "Map or location" },
  { value: "compare_results", label: "Compare results" },
  { value: "data_accuracy", label: "Country, career or school data" },
  { value: "account_saved_items", label: "Sign in, profile or saved items" },
  { value: "layout_accessibility", label: "Layout or accessibility" },
  { value: "performance_loading", label: "Performance or loading" },
  { value: "data_outdated", label: "Outdated data" },
  { value: "data_incorrect", label: "Incorrect data" },
  { value: "data_wrong_source", label: "Wrong source" },
  { value: "data_missing", label: "Missing data" },
  { value: "other", label: "Other" },
] as const

export type FeedbackType = "issue" | "suggestion"
export type FeedbackIssueCategory = (typeof FEEDBACK_ISSUE_OPTIONS)[number]["value"]
export type FeedbackScreenshotMimeType = (typeof FEEDBACK_SCREENSHOT_MIME_TYPES)[number]

export type FeedbackSystemInfo = {
  pagePath?: string
  locale?: string
  timeZone?: string
  userAgent?: string
  viewportWidth?: number
  viewportHeight?: number
}

export type FeedbackPageContext = {
  pagePath: string
  entityType?: "career" | "country" | "program" | "institution" | "compare" | "source" | "methodology" | "data_policy" | "other"
  entityId?: string
}

export type FeedbackScreenshotReference = {
  bucket: typeof FEEDBACK_SCREENSHOT_BUCKET
  path: string
}

export type ParsedFeedbackSubmission = {
  type: FeedbackType
  category: FeedbackIssueCategory | null
  description: string
  emailConsent: boolean
  email: string | null
  systemInfoConsent: boolean
  systemInfo: FeedbackSystemInfo | null
  context: FeedbackPageContext | null
  screenshot: FeedbackScreenshotReference | null
}

type ValidationFailure = {
  ok: false
  code: string
  error: string
}

type ValidationSuccess<T> = {
  ok: true
  data: T
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

const feedbackPageContextSchema = z.object({
  pagePath: z.string().trim().min(1).max(500).refine((value) => value.startsWith("/"), "page path must begin with /").transform((value) => value.split(/[?#]/, 1)[0]),
  entityType: z.enum(["career", "country", "program", "institution", "compare", "source", "methodology", "data_policy", "other"]).optional(),
  entityId: z.string().trim().min(1).max(120).regex(/^[a-zA-Z0-9_./:-]+$/).optional(),
}).strict()

export function parseFeedbackPageContext(value: unknown): ValidationResult<FeedbackPageContext | null> {
  if (value === undefined || value === null) return { ok: true, data: null }
  const parsed = feedbackPageContextSchema.safeParse(value)
  if (!parsed.success) return { ok: false, code: "INVALID_CONTEXT", error: "Invalid page context" }
  return { ok: true, data: parsed.data }
}

function isIssueCategory(value: unknown): value is FeedbackIssueCategory {
  return FEEDBACK_ISSUE_OPTIONS.some((option) => option.value === value)
}

export function isFeedbackScreenshotMimeType(
  value: unknown,
): value is FeedbackScreenshotMimeType {
  return FEEDBACK_SCREENSHOT_MIME_TYPES.includes(value as FeedbackScreenshotMimeType)
}

function clipString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, maxLength)
}

function boundedInteger(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined
  const integer = Math.round(value)
  return integer >= 1 && integer <= 10_000 ? integer : undefined
}

export function sanitizeFeedbackSystemInfo(value: unknown): FeedbackSystemInfo | null {
  if (!isRecord(value)) return null

  const pagePathValue = clipString(value.pagePath, 500)
  const pagePath = pagePathValue?.startsWith("/") ? pagePathValue.split(/[?#]/, 1)[0] : undefined
  const locale = clipString(value.locale, 32)
  const timeZone = clipString(value.timeZone, 100)
  const userAgent = clipString(value.userAgent, 512)
  const viewportWidth = boundedInteger(value.viewportWidth)
  const viewportHeight = boundedInteger(value.viewportHeight)

  const systemInfo: FeedbackSystemInfo = {
    ...(pagePath ? { pagePath } : {}),
    ...(locale ? { locale } : {}),
    ...(timeZone ? { timeZone } : {}),
    ...(userAgent ? { userAgent } : {}),
    ...(viewportWidth ? { viewportWidth } : {}),
    ...(viewportHeight ? { viewportHeight } : {}),
  }

  return Object.keys(systemInfo).length > 0 ? systemInfo : null
}

export function screenshotExtensionForMimeType(type: FeedbackScreenshotMimeType) {
  if (type === "image/png") return "png"
  if (type === "image/webp") return "webp"
  return "jpg"
}

export function createFeedbackScreenshotPath(
  contentType: FeedbackScreenshotMimeType,
  id: string,
  now = new Date(),
) {
  const year = now.getUTCFullYear().toString().padStart(4, "0")
  const month = (now.getUTCMonth() + 1).toString().padStart(2, "0")
  return `uploads/${year}/${month}/${id}.${screenshotExtensionForMimeType(contentType)}`
}

export function isFeedbackScreenshotPath(value: unknown): value is string {
  return typeof value === "string" && /^uploads\/20\d{2}\/(?:0[1-9]|1[0-2])\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:png|jpg|webp)$/.test(value)
}

export function parseScreenshotUploadRequest(
  value: unknown,
): ValidationResult<{ contentType: FeedbackScreenshotMimeType; sizeBytes: number }> {
  if (!isRecord(value)) {
    return { ok: false, code: "INVALID_UPLOAD_REQUEST", error: "Invalid upload request" }
  }

  if (!isFeedbackScreenshotMimeType(value.contentType)) {
    return {
      ok: false,
      code: "UNSUPPORTED_SCREENSHOT_TYPE",
      error: "Screenshots must be PNG, JPEG or WebP",
    }
  }

  if (!Number.isInteger(value.sizeBytes) || Number(value.sizeBytes) < 1) {
    return { ok: false, code: "INVALID_SCREENSHOT_SIZE", error: "Screenshot is empty" }
  }

  const sizeBytes = Number(value.sizeBytes)
  if (sizeBytes > FEEDBACK_SCREENSHOT_MAX_BYTES) {
    return {
      ok: false,
      code: "SCREENSHOT_TOO_LARGE",
      error: "Screenshot must be 5 MB or smaller",
    }
  }

  return { ok: true, data: { contentType: value.contentType, sizeBytes } }
}

function isValidEmail(value: string) {
  return value.length <= FEEDBACK_EMAIL_MAX_LENGTH && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function parseFeedbackSubmission(
  value: unknown,
): ValidationResult<ParsedFeedbackSubmission> {
  if (!isRecord(value)) {
    return { ok: false, code: "INVALID_PAYLOAD", error: "Invalid feedback request" }
  }

  if (value.type !== "issue" && value.type !== "suggestion") {
    return { ok: false, code: "INVALID_TYPE", error: "Choose a feedback type" }
  }

  const description = typeof value.description === "string" ? value.description.trim() : ""
  if (!description) {
    return { ok: false, code: "DESCRIPTION_REQUIRED", error: "Description is required" }
  }
  if (description.length > FEEDBACK_DESCRIPTION_MAX_LENGTH) {
    return {
      ok: false,
      code: "DESCRIPTION_TOO_LONG",
      error: `Description must be ${FEEDBACK_DESCRIPTION_MAX_LENGTH.toLocaleString("en-US")} characters or fewer`,
    }
  }

  let category: FeedbackIssueCategory | null = null
  if (value.type === "issue") {
    if (!isIssueCategory(value.category)) {
      return { ok: false, code: "CATEGORY_REQUIRED", error: "Choose the part of CampCareer affected" }
    }
    category = value.category
  }

  const emailConsent = value.emailConsent === true
  const emailValue = typeof value.email === "string" ? value.email.trim() : ""
  if (emailConsent && !isValidEmail(emailValue)) {
    return {
      ok: false,
      code: "VALID_EMAIL_REQUIRED",
      error: "Enter a valid email address or turn off email follow-up",
    }
  }

  const systemInfoConsent = value.systemInfoConsent === true
  const systemInfo = systemInfoConsent ? sanitizeFeedbackSystemInfo(value.systemInfo) : null
  const context = parseFeedbackPageContext(value.context)
  if (!context.ok) return context

  let screenshot: FeedbackScreenshotReference | null = null
  if (value.screenshot !== undefined && value.screenshot !== null) {
    if (
      !isRecord(value.screenshot) ||
      value.screenshot.bucket !== FEEDBACK_SCREENSHOT_BUCKET ||
      !isFeedbackScreenshotPath(value.screenshot.path)
    ) {
      return {
        ok: false,
        code: "INVALID_SCREENSHOT_REFERENCE",
        error: "Invalid screenshot reference",
      }
    }
    screenshot = {
      bucket: FEEDBACK_SCREENSHOT_BUCKET,
      path: value.screenshot.path,
    }
  }

  return {
    ok: true,
    data: {
      type: value.type,
      category,
      description,
      emailConsent,
      email: emailConsent ? emailValue : null,
      systemInfoConsent,
      systemInfo,
      context: context.data,
      screenshot,
    },
  }
}
