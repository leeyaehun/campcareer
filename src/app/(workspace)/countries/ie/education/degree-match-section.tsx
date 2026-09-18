import { GraduationCap } from "lucide-react"
import Link from "next/link"
import {
  degreeMatchBoundaryNote,
  degreeMatchCareerOutlook,
  degreeMatchConfidenceLabel,
  degreeMatchQualificationLabel,
  degreeMatchQualificationNote,
  degreeMatchRegulationNote,
  degreeMatchRelationshipTypeLabel,
  degreeMatchReverseSectionCopy,
  degreeMatchStrengthLabel,
  type DegreeMatchLocale,
} from "@/lib/degree-match/ireland-degree-match-ui"
import { getIrelandDegreeCareerMatches, IRELAND_DEGREE_MATCH_MODEL } from "@/lib/degree-match/ireland-model"
import { careerCanonicalPath } from "@/lib/workspace/occupation-routes"

/**
 * Degree → Career block for the Ireland education hub. Each canonical Degree
 * card answers "What Careers can this Degree lead toward?" through the P3.2
 * reverse API. Country context is IE by construction of the page.
 */
export function IrelandDegreeMatchSection({ locale = "en" }: { locale?: DegreeMatchLocale }) {
  const copy = degreeMatchReverseSectionCopy(locale)
  const boundary = degreeMatchBoundaryNote(locale)

  return (
    <section aria-labelledby="degree-match-heading">
      <div className="flex items-center gap-2">
        <GraduationCap className="size-4 text-brand" />
        <h2 id="degree-match-heading" className="text-[20px] font-semibold tracking-[-0.02em] text-campcareer-ink">
          {copy.title}
        </h2>
      </div>
      <p className="mt-1 text-[12px] leading-5 text-campcareer-muted">{copy.description}</p>
      <p className="mt-1 text-[12px] leading-5 text-campcareer-muted">{boundary}</p>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {IRELAND_DEGREE_MATCH_MODEL.map((result) => {
          const careerMatches = getIrelandDegreeCareerMatches(result.degreeId)
          return (
            <article
              key={result.degreeId}
              id={`degree-${result.degreeId}`}
              className="scroll-mt-24 rounded-xl border border-campcareer-border bg-campcareer-surface p-5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-campcareer-muted">
                {locale === "ko" ? "학위" : "Degree"}
              </p>
              <h3 className="mt-1 text-[16px] font-semibold tracking-[-0.01em] text-campcareer-ink">{result.degreeLabel}</h3>

              <p className="mt-1.5 text-xs font-semibold text-campcareer-ink-secondary">
                {degreeMatchRelationshipTypeLabel(result.relationshipType, locale)} ·{" "}
                {degreeMatchStrengthLabel(result.relationshipStrength, locale)}
              </p>
              <p className="mt-0.5 text-xs text-campcareer-muted">
                {degreeMatchConfidenceLabel(result.confidence, locale)}
              </p>

              {result.additionalQualification.state !== "none_verified" ? (
                <p className="mt-3 text-xs font-semibold leading-5 text-campcareer-ink">
                  {degreeMatchQualificationNote(locale)}:{" "}
                  {degreeMatchQualificationLabel(result.additionalQualification.state, locale)}
                </p>
              ) : null}

              {result.regulation.regulatedCareer ? (
                <p className="mt-1.5 text-xs leading-5 text-campcareer-muted">
                  {degreeMatchRegulationNote(locale)}: {result.regulation.summary}
                </p>
              ) : null}

              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-campcareer-muted">
                {locale === "ko" ? "이어지는 커리어" : "Careers it can lead toward"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {careerMatches.map((match) => {
                  const outlook = degreeMatchCareerOutlook(match.careerId, locale)
                  return (
                    <Link
                      key={match.careerId}
                      href={careerCanonicalPath(match.countryCode, match.careerId)}
                      className="inline-flex items-center gap-1 rounded-md border border-campcareer-border bg-campcareer-canvas px-2.5 py-1.5 text-[11px] font-semibold text-brand hover:border-brand/40 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                    >
                      {match.careerLabel}
                      {outlook.length > 0 ? (
                        <span className="hidden font-medium text-campcareer-muted sm:inline">
                          {" · "}
                          {outlook.join(" · ")}
                        </span>
                      ) : null}
                    </Link>
                  )
                })}
              </div>
              {careerMatches.length > 0 && (
                <p className="mt-2 text-[11px] leading-5 text-campcareer-muted sm:hidden">
                  {[...new Set(careerMatches.flatMap((match) => degreeMatchCareerOutlook(match.careerId, locale)))].join(" · ")}
                </p>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}