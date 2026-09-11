"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { createPortal } from "react-dom"
import {
  AlertCircle,
  Bug,
  CheckCircle2,
  ChevronLeft,
  Lightbulb,
  LoaderCircle,
  Paperclip,
  Trash2,
  X,
} from "lucide-react"
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type RefObject,
} from "react"
import { createClient } from "@/lib/supabase-client"
import { localeFromPathname, localizePath } from "@/lib/i18n/config"
import {
  FEEDBACK_DESCRIPTION_MAX_LENGTH,
  FEEDBACK_ISSUE_OPTIONS,
  FEEDBACK_SCREENSHOT_BUCKET,
  FEEDBACK_SCREENSHOT_MAX_BYTES,
  FEEDBACK_SCREENSHOT_MIME_TYPES,
  isFeedbackScreenshotMimeType,
  type FeedbackIssueCategory,
  type FeedbackScreenshotReference,
  type FeedbackSystemInfo,
  type FeedbackType,
} from "@/lib/feedback-contract"

type Step = "home" | FeedbackType
type SubmissionState = "idle" | "uploading" | "submitting" | "success" | "error"

type UploadContract = {
  bucket: typeof FEEDBACK_SCREENSHOT_BUCKET
  path: string
  token: string
}

const SCREENSHOT_ACCEPT = FEEDBACK_SCREENSHOT_MIME_TYPES.join(",")
const SCREENSHOT_MAX_MB = FEEDBACK_SCREENSHOT_MAX_BYTES / (1024 * 1024)

function collectSystemInfo(): FeedbackSystemInfo {
  let timeZone: string | undefined
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    timeZone = undefined
  }

  return {
    pagePath: window.location.pathname,
    locale: navigator.language,
    timeZone,
    userAgent: navigator.userAgent,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  }
}

async function responseMessage(response: Response, fallback: string) {
  const body = await response.json().catch(() => null)
  if (body && typeof body === "object" && "error" in body && typeof body.error === "string") {
    return body.error
  }
  return fallback
}

function withTimeout<T>(promise: Promise<T>, milliseconds: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), milliseconds)
    promise.then(
      (value) => {
        window.clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        window.clearTimeout(timer)
        reject(error)
      },
    )
  })
}

async function uploadScreenshot(file: File): Promise<FeedbackScreenshotReference> {
  const requestResponse = await fetch("/api/v1/feedback/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type, sizeBytes: file.size }),
  })

  if (!requestResponse.ok) {
    throw new Error(await responseMessage(requestResponse, "Screenshot upload is unavailable."))
  }

  const requestBody = await requestResponse.json().catch(() => null)
  const upload = requestBody?.upload as Partial<UploadContract> | undefined
  if (
    upload?.bucket !== FEEDBACK_SCREENSHOT_BUCKET ||
    typeof upload.path !== "string" ||
    typeof upload.token !== "string"
  ) {
    throw new Error("Screenshot upload is unavailable.")
  }

  const supabase = createClient()
  const result = await withTimeout(
    supabase.storage
      .from(upload.bucket)
      .uploadToSignedUrl(upload.path, upload.token, file, {
        cacheControl: "0",
        contentType: file.type,
      }),
    30_000,
    "Screenshot upload timed out.",
  )

  if (result.error) throw new Error(result.error.message)
  return { bucket: upload.bucket, path: upload.path }
}

function FeedbackSuccess({ warning, onClose }: { warning: string | null; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center px-1 py-5 text-center" role="status" aria-live="polite">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300">
        <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-slate-950 dark:text-slate-50">
        Thanks — your feedback was sent.
      </h3>
      <p className="mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-300">
        We review every report as we improve CampCareer.
      </p>
      {warning && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-left text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          {warning}
        </p>
      )}
      <button
        type="button"
        onClick={onClose}
        className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:ring-offset-slate-950"
      >
        Done
      </button>
    </div>
  )
}
function FeedbackForm({
  type,
  onClose,
  onBusyChange,
}: {
  type: FeedbackType
  onClose: () => void
  onBusyChange: (busy: boolean) => void
}) {
  const id = useId()
  const pathname = usePathname()
  const pathLocale = localeFromPathname(pathname) ?? "en"
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [category, setCategory] = useState<FeedbackIssueCategory | "">("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [emailConsent, setEmailConsent] = useState(false)
  const [email, setEmail] = useState("")
  const [systemInfoConsent, setSystemInfoConsent] = useState(false)
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle")
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [successWarning, setSuccessWarning] = useState<string | null>(null)

  const busy = submissionState === "uploading" || submissionState === "submitting"
  const canSubmit =
    description.trim().length > 0 &&
    description.trim().length <= FEEDBACK_DESCRIPTION_MAX_LENGTH &&
    (type === "suggestion" || category !== "") &&
    (!emailConsent || email.trim().length > 0) &&
    !fileError &&
    !busy

  useEffect(() => {
    onBusyChange(busy)
    return () => onBusyChange(false)
  }, [busy, onBusyChange])

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null
    setFileError(null)

    if (!selectedFile) {
      setFile(null)
      return
    }
    if (!isFeedbackScreenshotMimeType(selectedFile.type)) {
      setFile(null)
      setFileError("Choose a PNG, JPEG or WebP image.")
      event.target.value = ""
      return
    }
    if (selectedFile.size > FEEDBACK_SCREENSHOT_MAX_BYTES) {
      setFile(null)
      setFileError(`Screenshot must be ${SCREENSHOT_MAX_MB} MB or smaller.`)
      event.target.value = ""
      return
    }
    setFile(selectedFile)
  }, [])

  const removeFile = useCallback(() => {
    setFile(null)
    setFileError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return

    setSubmissionError(null)
    setSuccessWarning(null)
    let screenshot: FeedbackScreenshotReference | null = null
    let attachmentWarning: string | null = null

    if (file) {
      setSubmissionState("uploading")
      try {
        screenshot = await uploadScreenshot(file)
      } catch (error) {
        console.warn("[feedback] screenshot was not attached:", error)
        attachmentWarning = "Your feedback was saved, but the screenshot could not be attached."
      }
    }

    setSubmissionState("submitting")
    try {
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), 20_000)
      let response: Response
      try {
        response = await fetch("/api/v1/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            type,
            category: type === "issue" ? category : null,
            description: description.trim(),
            emailConsent,
            email: emailConsent ? email.trim() : null,
            systemInfoConsent,
            systemInfo: systemInfoConsent ? collectSystemInfo() : null,
            screenshot,
          }),
        })
      } finally {
        window.clearTimeout(timeout)
      }

      if (!response.ok) {
        throw new Error(await responseMessage(response, "We couldn't send your feedback. Please try again."))
      }

      const responseBody = await response.json().catch(() => null)
      if (responseBody?.warning === "SCREENSHOT_NOT_ATTACHED") {
        attachmentWarning = "Your feedback was saved, but the screenshot could not be attached."
      }
      setSuccessWarning(attachmentWarning)
      setSubmissionState("success")
    } catch (error) {
      const message = error instanceof DOMException && error.name === "AbortError"
        ? "The request timed out. Check your connection and try again."
        : error instanceof Error
          ? error.message
          : "We couldn't send your feedback. Please try again."
      setSubmissionError(message)
      setSubmissionState("error")
    }
  }, [canSubmit, category, description, email, emailConsent, file, systemInfoConsent, type])

  if (submissionState === "success") {
    return <FeedbackSuccess warning={successWarning} onClose={onClose} />
  }

  const statusMessage = submissionState === "uploading"
    ? "Uploading screenshot…"
    : submissionState === "submitting"
      ? "Sending feedback…"
      : null

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {type === "issue" && (
        <div>
          <label htmlFor={`${id}-category`} className="text-sm font-medium text-slate-800 dark:text-slate-200">
            What part of CampCareer was affected? <span className="text-red-500">*</span>
          </label>
          <select
            id={`${id}-category`}
            data-feedback-initial-focus
            value={category}
            required
            disabled={busy}
            onChange={(event) => setCategory(event.target.value as FeedbackIssueCategory | "")}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">Choose an area</option>
            {FEEDBACK_ISSUE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <div className="flex items-end justify-between gap-3">
          <label htmlFor={`${id}-description`} className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {type === "issue" ? "What happened?" : "What should we improve?"} <span className="text-red-500">*</span>
          </label>
          <span className="text-[11px] text-slate-400">
            {description.length.toLocaleString("en-US")}/{FEEDBACK_DESCRIPTION_MAX_LENGTH.toLocaleString("en-US")}
          </span>
        </div>
        <textarea
          id={`${id}-description`}
          data-feedback-initial-focus={type === "suggestion" ? "true" : undefined}
          value={description}
          disabled={busy}
          maxLength={FEEDBACK_DESCRIPTION_MAX_LENGTH}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={type === "issue" ? "Tell us what you expected and what went wrong" : "Tell us what would make CampCareer more useful"}
          rows={4}
          required
          className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <p className="mt-1.5 flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Don&apos;t include passwords, payment details or immigration document numbers.
        </p>
      </div>

      <div>
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Screenshot <span className="font-normal text-slate-400">(optional)</span></span>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            id={`${id}-screenshot`}
            type="file"
            accept={SCREENSHOT_ACCEPT}
            disabled={busy}
            onChange={handleFileChange}
            className="sr-only"
          />
          <label
            htmlFor={`${id}-screenshot`}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500/25 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            <Paperclip className="h-4 w-4" aria-hidden="true" />
            {file ? "Replace screenshot" : "Attach screenshot"}
          </label>
          {file && (
            <span className="flex min-w-0 items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <span className="max-w-[14rem] truncate">{file.name}</span>
              <button
                type="button"
                onClick={removeFile}
                disabled={busy}
                aria-label={`Remove ${file.name}`}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-slate-800"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </span>
          )}
        </div>
        <p className="mt-1 text-[11px] text-slate-400">PNG, JPEG or WebP, up to {SCREENSHOT_MAX_MB} MB. Stored privately for up to 180 days.</p>
        {fileError && <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">{fileError}</p>}
      </div>

      <fieldset className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/60">
        <legend className="px-1 text-xs font-semibold text-slate-700 dark:text-slate-300">Optional follow-up and diagnostics</legend>
        <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={emailConsent}
            disabled={busy}
            onChange={(event) => {
              setEmailConsent(event.target.checked)
              if (!event.target.checked) setEmail("")
            }}
            className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Allow CampCareer to email me about this feedback
        </label>
        {emailConsent && (
          <div className="pl-6">
            <label htmlFor={`${id}-email`} className="sr-only">Email address</label>
            <input
              id={`${id}-email`}
              type="email"
              autoComplete="email"
              value={email}
              disabled={busy}
              required
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
        )}
        <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={systemInfoConsent}
            disabled={busy}
            onChange={(event) => setSystemInfoConsent(event.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span>
            Include technical details
            <span className="mt-0.5 block text-[11px] text-slate-400">Page path, browser, language, timezone and viewport. URL queries are excluded.</span>
          </span>
        </label>
      </fieldset>

      <p className="text-[11px] leading-relaxed text-slate-400">
        We only include optional details you select. See our{" "}
        <Link href={localizePath("/privacy", pathLocale)} prefetch={false} className="underline hover:text-slate-600 dark:hover:text-slate-200" target="_blank" rel="noreferrer">Privacy Policy</Link>
        {" "}and{" "}
        <Link href={localizePath("/terms", pathLocale)} prefetch={false} className="underline hover:text-slate-600 dark:hover:text-slate-200" target="_blank" rel="noreferrer">Terms of Service</Link>.
      </p>

      <div className="min-h-5" aria-live="polite" aria-atomic="true">
        {statusMessage && (
          <p className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-300">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            {statusMessage}
          </p>
        )}
        {submissionError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200" role="alert">
            {submissionError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 dark:ring-offset-slate-950 dark:disabled:bg-slate-700"
      >
        {busy && <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
        {submissionState === "uploading" ? "Uploading…" : submissionState === "submitting" ? "Sending…" : submissionState === "error" ? "Try again" : "Send feedback"}
      </button>
    </form>
  )
}

function FeedbackDialog({
  open,
  step,
  setStep,
  onClose,
  returnFocusRef,
}: {
  open: boolean
  step: Step
  setStep: (step: Step) => void
  onClose: () => void
  returnFocusRef: RefObject<HTMLButtonElement | null>
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const wasOpenRef = useRef(false)
  const [portalReady, setPortalReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => setPortalReady(true), [])

  useEffect(() => {
    if (!portalReady) return
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
      wasOpenRef.current = true
    } else if (!open && dialog.open) {
      dialog.close()
    }

    if (!open && wasOpenRef.current) {
      wasOpenRef.current = false
      window.requestAnimationFrame(() => returnFocusRef.current?.focus())
    }
  }, [open, portalReady, returnFocusRef])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open || !portalReady) return
    setBusy(false)
    const frame = window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLElement>("[data-feedback-initial-focus]")?.focus()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [open, portalReady, step])

  const requestClose = useCallback(() => {
    if (!busy) onClose()
  }, [busy, onClose])

  if (!portalReady) return null

  const title = step === "home" ? "Send feedback to CampCareer" : step === "issue" ? "Report an issue" : "Suggest an idea"

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault()
        requestClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose()
      }}
      className="z-[2147483647] m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-hidden rounded-xl border-0 bg-transparent p-0 shadow-2xl backdrop:bg-slate-950/60"
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50">
        <p id={descriptionId} className="sr-only">Report a problem or suggest an improvement to CampCareer.</p>
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3.5 dark:border-slate-800 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            {step !== "home" && (
              <button
                type="button"
                onClick={() => setStep("home")}
                disabled={busy}
                aria-label="Back to feedback options"
                className="-ml-1 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <h2 id={titleId} className="truncate text-sm font-semibold text-slate-950 dark:text-slate-50">{title}</h2>
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={busy}
            aria-label="Close feedback dialog"
            className="-mr-1 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          {step === "home" && (
            <div className="flex flex-col gap-2">
              <p className="mb-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Tell us what went wrong or what would make your study-abroad decision easier.
              </p>
              <button
                type="button"
                data-feedback-initial-focus
                onClick={() => setStep("issue")}
                className="group flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-800 transition-colors hover:border-blue-300 hover:bg-blue-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:text-slate-100 dark:hover:border-blue-700 dark:hover:bg-blue-950/30"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-300">
                  <Bug className="h-4 w-4" aria-hidden="true" />
                </span>
                <span>
                  Report an issue
                  <span className="mt-0.5 block text-xs font-normal text-slate-500 dark:text-slate-400">Broken UI, incorrect data, search, maps or comparison</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStep("suggestion")}
                className="group flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-800 transition-colors hover:border-blue-300 hover:bg-blue-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:text-slate-100 dark:hover:border-blue-700 dark:hover:bg-blue-950/30"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300">
                  <Lightbulb className="h-4 w-4" aria-hidden="true" />
                </span>
                <span>
                  Suggest an idea
                  <span className="mt-0.5 block text-xs font-normal text-slate-500 dark:text-slate-400">A feature or explanation that would help you decide</span>
                </span>
              </button>
            </div>
          )}
          {step === "issue" && (
            <FeedbackForm key="issue" type="issue" onClose={onClose} onBusyChange={setBusy} />
          )}
          {step === "suggestion" && (
            <FeedbackForm key="suggestion" type="suggestion" onClose={onClose} onBusyChange={setBusy} />
          )}
        </div>
      </div>
    </dialog>,
    document.body,
  )
}

export function FeedbackWidget({ className, label = "Feedback" }: { className?: string; label?: string }) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>("home")

  const handleOpen = useCallback(() => {
    setStep("home")
    setOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
    setStep("home")
  }, [])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`transition-colors hover:text-slate-600 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:text-slate-200 ${className ?? ""}`}
      >
        {label}
      </button>
      <FeedbackDialog
        open={open}
        step={step}
        setStep={setStep}
        onClose={handleClose}
        returnFocusRef={triggerRef}
      />
    </>
  )
}
