import { z } from "zod"
import { normalizeCountryCode, normalizeRouteField, type RouteGoal } from "@/lib/route-search"
import { isIsoCountryCode } from "@/lib/study-product/countries"

const routeGoals = ["study", "work", "study-to-work"] as const
const requestKinds = ["route_research", "guide_interest"] as const

const rawRouteRequestSchema = z.object({
  citizenship: z.string().max(8).catch("").default(""),
  destination: z.string().max(8).catch("").default(""),
  goal: z.enum(routeGoals).optional().catch(undefined),
  field: z.string().max(512).catch("").default(""),
  locale: z.enum(["en", "ko"]).catch("ko").default("ko"),
  requestKind: z.enum(requestKinds).catch("route_research").default("route_research"),
  email: z.string().max(320).catch("").default(""),
  notificationConsent: z.boolean().catch(false).default(false),
  company: z.string().max(200).catch("").default(""),
}).passthrough()

const normalizedRouteRequestSchema = z.object({
  citizenshipCode: z.string().refine(isIsoCountryCode, "citizenship must be an ISO country code"),
  destinationCode: z.string().refine(isIsoCountryCode, "destination must be an ISO country code"),
  goal: z.enum(routeGoals),
  field: z.string().min(1).max(80),
  locale: z.enum(["en", "ko"]),
  requestKind: z.enum(requestKinds),
  notificationEmail: z.string().email().max(320).nullable(),
  notificationConsent: z.boolean(),
}).superRefine((input, context) => {
  if ((input.notificationConsent || input.requestKind === "guide_interest") && !input.notificationEmail) {
    context.addIssue({ code: "custom", message: "email is required when notifications are requested" })
  }
  if (input.requestKind === "guide_interest" && !input.notificationConsent) {
    context.addIssue({ code: "custom", message: "guide interest requires notification consent" })
  }
})

export type RouteRequestInput = {
  citizenshipCode: string
  destinationCode: string
  goal: RouteGoal
  field: string
  locale: "en" | "ko"
  requestKind: "route_research" | "guide_interest"
  notificationEmail: string | null
  notificationConsent: boolean
}

/**
 * Runtime boundary for the public route-interest form. Keep malformed bodies
 * indistinguishable at the HTTP layer; callers use the parsed value only after
 * this function returns success.
 */
export function parseRouteRequestInput(value: unknown): { input: RouteRequestInput | null; honeypot: boolean } {
  const raw = rawRouteRequestSchema.safeParse(value)
  if (!raw.success) return { input: null, honeypot: false }

  const honeypot = raw.data.company.trim().length > 0
  const notificationEmail = raw.data.notificationConsent ? raw.data.email.trim().toLowerCase() || null : null
  const normalized = normalizedRouteRequestSchema.safeParse({
    citizenshipCode: normalizeCountryCode(raw.data.citizenship),
    destinationCode: normalizeCountryCode(raw.data.destination),
    goal: raw.data.goal,
    field: normalizeRouteField(raw.data.field),
    locale: raw.data.locale,
    requestKind: raw.data.requestKind,
    notificationEmail,
    notificationConsent: raw.data.notificationConsent,
  })

  return { input: normalized.success ? normalized.data : null, honeypot }
}
