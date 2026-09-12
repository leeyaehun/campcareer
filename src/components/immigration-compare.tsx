"use client"

import { useState } from "react"
import Link from "next/link"
import { GraduationCap, Briefcase, Landmark, ArrowRight, AlertTriangle, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  type CountryCode,
  type LayerMeta,
  type PrPathway,
  COUNTRY_META,
  layerNoteText,
} from "@/lib/degree-risk"
import { useLocale } from "@/lib/i18n/locale-provider"
import { useTranslations } from "@/lib/i18n/use-translations"

type Nationality = "india" | "china" | "other"
const STUDY_YEARS = 4 // bachelor default, mirrors ImmigrationTimeline

export interface CompareCol {
  country: CountryCode
  detailHref: string
  // null when this major isn't scored in this country yet.
  data: { postStudyYears: number; visa: LayerMeta; pr: PrPathway | null } | null
}

// Stage-aligned immigration comparison: each row is one stage (study →
// post-study visa → PR), each column a country, so the same stage is contrasted
// left-to-right. The full per-country timeline (dashed bar, long source
// sentences, prose) lives on the single-country result view, linked per header.
export function ImmigrationCompare({ cols }: { cols: CompareCol[] }) {
  const t = useTranslations()
  const tl = t.degreeRisk.timeline
  const rm = t.degreeRisk.resultMeta
  const rr = t.degreeRisk.result
  const tc = t.compare
  const locale = useLocale()
  const [nat, setNat] = useState<Nationality>("india")

  const stages = ["study", "postStudy", "pr"] as const
  const stageMeta = {
    study: { icon: GraduationCap, label: tl.study },
    postStudy: { icon: Briefcase, label: tl.postStudy },
    pr: { icon: Landmark, label: tl.prPathway },
  } as const

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Country header row, each with a link to its full single-country view */}
      <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-200 bg-slate-50/60">
        {cols.map((col) => (
          <div key={col.country} className="flex items-center justify-between gap-2 px-4 py-3">
            <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-800">
              <span className="leading-none">{COUNTRY_META[col.country].flag}</span>
              <span className="truncate">{rr.countries[col.country]}</span>
            </span>
            <Link
              href={col.detailHref}
              className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              {tc.seeDetail}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ))}
      </div>

      {/* One block per stage: full-width label, then the two aligned cells */}
      {stages.map((stage) => {
        const { icon: Icon, label } = stageMeta[stage]
        return (
          <div key={stage} className="border-b border-slate-100 last:border-b-0">
            <div className="flex items-center gap-1.5 px-4 pt-3 pb-1">
              <Icon className="h-3.5 w-3.5 text-brand/70" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-100">
              {cols.map((col) => (
                <div key={col.country} className="px-4 py-3">
                  {col.data ? (
                    <StageCell
                      stage={stage}
                      country={col.country}
                      data={col.data}
                      nat={nat}
                      setNat={setNat}
                      locale={locale}
                      tl={tl}
                      rm={rm}
                    />
                  ) : (
                    <p className="text-sm text-slate-400">{tc.notScoredTitle}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MiniSource({ source }: { source: { text: string; url: string | null } | null }) {
  if (!source) return null
  return (
    <p className="mt-1.5 text-[10px] text-slate-400">
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
  )
}

function StageCell({
  stage,
  country,
  data,
  nat,
  setNat,
  locale,
  tl,
  rm,
}: {
  stage: "study" | "postStudy" | "pr"
  country: CountryCode
  data: { postStudyYears: number; visa: LayerMeta; pr: PrPathway | null }
  nat: Nationality
  setNat: (n: Nationality) => void
  locale: ReturnType<typeof useLocale>
  tl: ReturnType<typeof useTranslations>["degreeRisk"]["timeline"]
  rm: ReturnType<typeof useTranslations>["degreeRisk"]["resultMeta"]
}) {
  const yearsLabel = (n: number) => (n === 1 ? tl.yearShort : tl.yearsShort).replace("{n}", String(n))

  if (stage === "study") {
    return <p className="text-sm text-slate-700">{tl.studyDuration.replace("{years}", String(STUDY_YEARS))}</p>
  }

  if (stage === "postStudy") {
    const note = layerNoteText(data.visa, locale)
    const verified = data.visa.confidence === "verified"
    const source =
      verified && data.visa.source_name
        ? {
            text: tl.sourceFmt
              .replace("{source}", data.visa.source_name)
              .replace("{date}", data.visa.last_verified ?? ""),
            url: data.visa.source_url,
          }
        : null
    return (
      <>
        <p className="text-sm text-slate-700">
          <strong className="text-slate-900">{yearsLabel(data.postStudyYears)}</strong>
        </p>
        {note && (
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200">
            <AlertTriangle className="h-2.5 w-2.5" />
            {rm.policyChip}
          </span>
        )}
        <MiniSource source={source} />
      </>
    )
  }

  // PR stage — mirror ImmigrationTimeline's pathway resolution (verified row →
  // i18n fallback), minus the dashed bar / open-ended prose.
  const L: "en" | "ko" = locale === "ko" ? "ko" : "en"
  const pr = data.pr
  let route: string
  let years: string | null = null
  let verified = false
  let caveat: string
  let source: { text: string; url: string | null } | null = null

  if (pr) {
    route = L === "ko" ? pr.route_ko : pr.route_en
    years = L === "ko" ? pr.years_ko : pr.years_en
    verified = pr.confidence === "verified"
    caveat =
      country === "US" && pr.nationality_variants
        ? pr.nationality_variants[nat][L]
        : L === "ko"
          ? pr.caveat_ko
          : pr.caveat_en
    if (verified && pr.source_name) {
      source = {
        text: tl.sourceFmt.replace("{source}", pr.source_name).replace("{date}", pr.last_verified ?? ""),
        url: pr.source_url,
      }
    }
  } else {
    const cfg = tl.pr
    if (country === "US") {
      route = cfg.US.route
      caveat = nat === "india" ? cfg.US.caveatIndia : nat === "china" ? cfg.US.caveatChina : cfg.US.caveatOther
    } else {
      route = cfg[country].route
      caveat = cfg[country].caveat
    }
  }

  return (
    <>
      <div className="flex items-start gap-1.5">
        <p className="flex-1 text-sm text-slate-700">{route}</p>
        {!verified && (
          <span className="mt-0.5 shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
            {tl.estimate}
          </span>
        )}
      </div>
      {years && <p className="mt-0.5 text-xs text-slate-500">{years}</p>}

      {country === "US" && (
        <div className="mt-2">
          <p className="mb-1 text-[10px] font-medium text-slate-400">{tl.nationalityLabel}</p>
          <div role="group" aria-label={tl.nationalityLabel} className="inline-flex rounded-lg border border-slate-200 p-0.5">
            {(
              [
                ["india", tl.natIndia],
                ["china", tl.natChina],
                ["other", tl.natOther],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                aria-pressed={nat === val}
                onClick={() => setNat(val)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
                  nat === val ? "bg-brand text-brand-foreground" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {caveat && (
        <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-slate-500">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
          <span>{caveat}</span>
        </p>
      )}

      <MiniSource source={source} />
    </>
  )
}
