"use client"

import { useState } from "react"
import { GraduationCap, Briefcase, Landmark, ArrowRight, AlertTriangle, ExternalLink, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { type CountryCode, type LayerMeta, type PrPathway, layerNoteText } from "@/lib/degree-risk"
import { useLocale } from "@/lib/i18n/locale-provider"
import { useTranslations } from "@/lib/i18n/use-translations"

type Level = "bachelor" | "master"
const STUDY_YEARS: Record<Level, number> = { bachelor: 4, master: 1.5 }
type Nationality = "india" | "china" | "other"

export interface ImmigrationTimelineProps {
  country: CountryCode
  postStudyYears: number
  visa: LayerMeta
  /** Verified PR pathway (country_pr_pathways). Falls back to i18n config if null. */
  pr?: PrPathway | null
  level?: Level
  /** Optional caption under the post-study years (e.g. US STEM branch). */
  postStudyCaption?: string
  /** Optional country flag/name header (used in the compare grid). */
  heading?: React.ReactNode
  className?: string
}

export function ImmigrationTimeline({
  country,
  postStudyYears,
  visa,
  pr = null,
  level = "bachelor",
  postStudyCaption,
  heading,
  className,
}: ImmigrationTimelineProps) {
  const t = useTranslations()
  const locale = useLocale()
  const tl = t.degreeRisk.timeline
  const rm = t.degreeRisk.resultMeta
  const [nat, setNat] = useState<Nationality>("india")
  const [expanded, setExpanded] = useState(false)

  const studyYears = STUDY_YEARS[level]
  const visaNote = layerNoteText(visa, locale)
  const verified = visa.confidence === "verified"

  const yearsLabel = (n: number) =>
    (n === 1 ? tl.yearShort : tl.yearsShort).replace("{n}", String(n))

  // ── PR stage: prefer the verified country_pr_pathways row; fall back to the
  // i18n config if the table row is missing (resilience).
  const L: "en" | "ko" = locale === "ko" ? "ko" : "en"
  let prRoute: string
  let prCaveat: string
  let prYears: string | null = null
  let prVerified = false
  let prSource: { text: string; url: string | null } | null = null

  if (pr) {
    prRoute = L === "ko" ? pr.route_ko : pr.route_en
    prYears = L === "ko" ? pr.years_ko : pr.years_en
    prVerified = pr.confidence === "verified"
    prCaveat =
      country === "US" && pr.nationality_variants
        ? pr.nationality_variants[nat][L]
        : L === "ko"
          ? pr.caveat_ko
          : pr.caveat_en
    if (prVerified && pr.source_name) {
      prSource = {
        text: tl.sourceFmt.replace("{source}", pr.source_name).replace("{date}", pr.last_verified ?? ""),
        url: pr.source_url,
      }
    }
  } else {
    const cfg = tl.pr
    if (country === "US") {
      prRoute = cfg.US.route
      prCaveat = nat === "india" ? cfg.US.caveatIndia : nat === "china" ? cfg.US.caveatChina : cfg.US.caveatOther
    } else {
      prRoute = cfg[country].route
      prCaveat = cfg[country].caveat
    }
  }

  // CSS-based entrance (.tl-stage) — always resolves to visible and respects
  // prefers-reduced-motion; staggered via animation-delay.
  const stageStyle = (i: number) => ({ animationDelay: `${i * 0.08}s` })

  const psYears = yearsLabel(postStudyYears)

  return (
    <section aria-label={tl.heading} className={cn("rounded-2xl border-2 border-slate-200 bg-white p-4 md:p-6", className)}>
      {/* Mobile compact toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex md:hidden items-center justify-between w-full text-left"
        aria-expanded={expanded}
      >
        <h3 className="font-display text-base font-semibold text-slate-900">{heading ?? tl.heading}</h3>
        <div className="flex items-center gap-2">
          {!expanded && (
            <span className="text-sm text-slate-500">{studyYears} yr → {psYears} → PR</span>
          )}
          <ChevronDown className={cn("h-4 w-4 text-slate-300 transition-transform", expanded && "rotate-180")} />
        </div>
      </button>
      <h3 className="hidden md:block font-display text-lg font-semibold text-slate-900 mb-4">{heading ?? tl.heading}</h3>

      <div className={cn(expanded ? "block" : "hidden", "md:block")}>
        {/* Proportional bar — desktop only, decorative */}
        <div aria-hidden className="hidden md:flex items-center gap-1 h-3 mb-4">
          <div style={{ flexGrow: studyYears }} className="h-full rounded-l-full bg-slate-300" />
          <div style={{ flexGrow: Math.max(postStudyYears, 0.5) }} className="h-full bg-brand" />
          <div style={{ flexGrow: 2 }} className="relative h-full rounded-r-full border-2 border-dashed border-brand/50">
            <ArrowRight className="absolute -right-1 top-1/2 h-3 w-3 -translate-y-1/2 text-brand/60" />
          </div>
        </div>

        {/* Stages: vertical on mobile, horizontal on desktop */}
        <div className="flex flex-col md:flex-row md:items-stretch gap-3 md:gap-0">
          {/* STUDY */}
          <div style={stageStyle(0)} className="tl-stage flex-1 md:px-3 md:first:pl-0">
            <Stage
              icon={<GraduationCap className="h-4 w-4" />}
              title={tl.study}
              primary={tl.studyDuration.replace("{years}", String(studyYears))}
            />
          </div>

          <Connector />

          {/* POST-STUDY VISA (verified) */}
          <div style={stageStyle(1)} className="tl-stage flex-1 md:px-3">
            <Stage
              icon={<Briefcase className="h-4 w-4" />}
              title={tl.postStudy}
              primary={yearsLabel(postStudyYears)}
              primaryStrong={yearsLabel(postStudyYears)}
              caption={postStudyCaption}
              note={visaNote}
              policyChip={rm.policyChip}
              source={
                verified && visa.source_name
                  ? {
                      text: tl.sourceFmt
                        .replace("{source}", visa.source_name)
                        .replace("{date}", visa.last_verified ?? ""),
                      url: visa.source_url,
                    }
                  : null
              }
            />
          </div>

          <Connector dashed />

          {/* PR PATHWAY (estimate, open-ended) */}
          <div style={stageStyle(2)} className="tl-stage flex-1 md:px-3 md:last:pr-0">
            <Stage
              icon={<Landmark className="h-4 w-4" />}
              title={tl.prPathway}
              dashed
              estimateBadge={prVerified ? undefined : tl.estimate}
              primary={prRoute}
              caption={prYears}
              openLabel={tl.prOpen}
              caveat={prCaveat || null}
              source={prSource}
            >
              {country === "US" && (
                <div className="mt-2">
                  <p className="text-[11px] font-medium text-slate-400 mb-1">{tl.nationalityLabel}</p>
                  <div role="group" aria-label={tl.nationalityLabel} className="inline-flex rounded-lg border border-slate-200 p-0.5">
                    {([
                      ["india", tl.natIndia],
                      ["china", tl.natChina],
                      ["other", tl.natOther],
                    ] as const).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        aria-pressed={nat === val}
                        onClick={() => setNat(val)}
                        className={cn(
                          "min-h-[44px] rounded-md px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
                          nat === val ? "bg-brand text-brand-foreground" : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Stage>
          </div>
        </div>
      </div>
    </section>
  )
}

function Connector({ dashed = false }: { dashed?: boolean }) {
  return (
    <div aria-hidden className="flex items-center justify-center shrink-0">
      {/* horizontal on desktop, vertical on mobile */}
      <span
        className={cn(
          "hidden md:block w-6 border-t-2 text-brand/50",
          dashed ? "border-dashed border-brand/40" : "border-slate-300"
        )}
      />
      <span
        className={cn(
          "md:hidden h-4 border-l-2 ml-5",
          dashed ? "border-dashed border-brand/40" : "border-slate-300"
        )}
      />
    </div>
  )
}

function Stage({
  icon,
  title,
  primary,
  primaryStrong,
  caption,
  dashed = false,
  estimateBadge,
  source,
  note,
  policyChip,
  openLabel,
  caveat,
  children,
}: {
  icon: React.ReactNode
  title: string
  primary: string
  primaryStrong?: string
  caption?: string | null
  dashed?: boolean
  estimateBadge?: string
  source?: { text: string; url: string | null } | null
  note?: string | null
  policyChip?: string
  openLabel?: string
  caveat?: string | null
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "h-full rounded-xl border p-3.5",
        dashed ? "border-2 border-dashed border-brand/40 bg-brand-tint/40" : "border-slate-200 bg-white"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/10 text-brand">{icon}</span>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
        {estimateBadge && (
          <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {estimateBadge}
          </span>
        )}
      </div>

      <p className="mt-2 text-sm leading-relaxed text-slate-700">
        {primaryStrong ? <strong className="text-slate-900">{primaryStrong}</strong> : primary}
      </p>

      {caption && <p className="mt-1 text-xs text-slate-500">{caption}</p>}

      {openLabel && <p className="mt-1 text-xs italic text-slate-400">{openLabel}</p>}

      {note && policyChip && (
        <div className="mt-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200">
            <AlertTriangle className="h-2.5 w-2.5" />
            {policyChip}
          </span>
          <p className="mt-1.5 text-xs leading-relaxed text-amber-800">{note}</p>
        </div>
      )}

      {caveat && (
        <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-slate-500">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
          <span>{caveat}</span>
        </p>
      )}

      {source && (
        <p className="mt-2 text-[11px] text-slate-400">
          {source.url ? (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 underline underline-offset-2 hover:text-slate-600"
            >
              {source.text}
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          ) : (
            source.text
          )}
        </p>
      )}

      {children}
    </div>
  )
}
