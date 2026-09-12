import "server-only"

import { NextResponse } from "next/server"
import {
  FEEDBACK_SCREENSHOT_MAX_BYTES,
  isFeedbackScreenshotMimeType,
  parseFeedbackSubmission,
  type FeedbackScreenshotReference,
} from "@/lib/feedback-contract"
import { getFeedbackAdminClient, readJsonBody } from "@/lib/feedback-server"

const FEEDBACK_REQUEST_MAX_BYTES = 16_384
const NO_STORE_HEADERS = { "Cache-Control": "no-store" }

type StorageDetails = {
  reference: FeedbackScreenshotReference
  contentType: string
  sizeBytes: number
}

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE_HEADERS })
}

function isLegacyFeedbackSchemaError(error: { code?: string; message?: string } | null) {
  if (!error) return false
  return error.code === "42703" || error.code === "PGRST204" || /column.+(feedback|page_path|entity_type|entity_id|status)|schema cache/i.test(error.message ?? "")
}

async function removeUploadedScreenshot(
  supabase: NonNullable<ReturnType<typeof getFeedbackAdminClient>>,
  screenshot: StorageDetails | null,
) {
  if (!screenshot) return
  const { error } = await supabase.storage
    .from(screenshot.reference.bucket)
    .remove([screenshot.reference.path])
  if (error) console.warn("[feedback] failed to remove orphaned screenshot:", error.message)
}

async function verifyScreenshot(
  supabase: NonNullable<ReturnType<typeof getFeedbackAdminClient>>,
  reference: FeedbackScreenshotReference | null,
): Promise<{ screenshot: StorageDetails | null; warning: "SCREENSHOT_NOT_ATTACHED" | null }> {
  if (!reference) return { screenshot: null, warning: null }

  const { data, error } = await supabase.storage.from(reference.bucket).info(reference.path)
  const contentType = data?.contentType
  const sizeBytes = data?.size
  const isValid =
    !error &&
    isFeedbackScreenshotMimeType(contentType) &&
    typeof sizeBytes === "number" &&
    sizeBytes >= 1 &&
    sizeBytes <= FEEDBACK_SCREENSHOT_MAX_BYTES

  if (!isValid) {
    if (error) console.warn("[feedback] screenshot verification failed:", error.message)
    await supabase.storage.from(reference.bucket).remove([reference.path])
    return { screenshot: null, warning: "SCREENSHOT_NOT_ATTACHED" }
  }

  return {
    screenshot: {
      reference,
      contentType,
      sizeBytes,
    },
    warning: null,
  }
}

export async function POST(request: Request) {
  try {
    const jsonBody = await readJsonBody(request, FEEDBACK_REQUEST_MAX_BYTES)
    if (!jsonBody.ok) return json({ ok: false, code: jsonBody.code, error: jsonBody.error }, jsonBody.status)

    const parsed = parseFeedbackSubmission(jsonBody.data)
    if (!parsed.ok) return json({ ok: false, code: parsed.code, error: parsed.error }, 400)

    const supabase = getFeedbackAdminClient()
    if (!supabase) {
      return json(
        {
          ok: false,
          code: "FEEDBACK_UNAVAILABLE",
          error: "Feedback is temporarily unavailable. Please try again later.",
        },
        503,
      )
    }

    const verified = await verifyScreenshot(supabase, parsed.data.screenshot)
    const metadata: Record<string, unknown> = {
      schema_version: 2,
      ...(parsed.data.context ? { page_context: parsed.data.context } : {}),
      ...(parsed.data.systemInfo ? { system_info: parsed.data.systemInfo } : {}),
      ...(verified.warning ? { screenshot_status: "not_attached" } : {}),
    }

    const row = {
      type: parsed.data.type,
      category: parsed.data.category,
      description: parsed.data.description,
      email_consent: parsed.data.emailConsent,
      contact_email: parsed.data.email,
      system_info_consent: parsed.data.systemInfoConsent,
      screenshot_bucket: verified.screenshot?.reference.bucket ?? null,
      screenshot_path: verified.screenshot?.reference.path ?? null,
      screenshot_content_type: verified.screenshot?.contentType ?? null,
      screenshot_size_bytes: verified.screenshot?.sizeBytes ?? null,
      page_path: parsed.data.context?.pagePath ?? null,
      entity_type: parsed.data.context?.entityType ?? null,
      entity_id: parsed.data.context?.entityId ?? null,
      status: "new",
      metadata,
    }

    let { error } = await supabase.from("feedback").insert(row)

    // Keep feedback available while the local migration is awaiting deployment.
    // The legacy metadata column safely carries the newly consented fields.
    if (isLegacyFeedbackSchemaError(error)) {
      const legacyMetadata = {
        ...metadata,
        ...(parsed.data.email ? { contact_email: parsed.data.email } : {}),
        ...(verified.screenshot
          ? {
              screenshot: {
                bucket: verified.screenshot.reference.bucket,
                path: verified.screenshot.reference.path,
                content_type: verified.screenshot.contentType,
                size_bytes: verified.screenshot.sizeBytes,
              },
            }
          : {}),
        system_info_consent: parsed.data.systemInfoConsent,
      }
      const legacyInsert = await supabase.from("feedback").insert({
        type: parsed.data.type,
        category: parsed.data.category,
        description: parsed.data.description,
        email_consent: parsed.data.emailConsent,
        screenshot_url: null,
        metadata: legacyMetadata,
      })
      error = legacyInsert.error
    }

    if (error) {
      console.error("[feedback] insert error:", error)
      await removeUploadedScreenshot(supabase, verified.screenshot)
      return json(
        {
          ok: false,
          code: "FEEDBACK_SAVE_FAILED",
          error: "We couldn't save your feedback. Please try again.",
        },
        500,
      )
    }

    return json({ ok: true, warning: verified.warning })
  } catch (error) {
    console.error("[feedback] unexpected error:", error)
    return json(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        error: "Feedback is temporarily unavailable. Please try again later.",
      },
      500,
    )
  }
}
