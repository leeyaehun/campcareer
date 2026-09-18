import {
  degreeMatchBoundaryNote,
  degreeMatchConfidenceLabel,
  degreeMatchDegreeDetailPath,
  degreeMatchQualificationLabel,
  degreeMatchQualificationNote,
  degreeMatchRegulationNote,
  degreeMatchRelationshipTypeLabel,
  degreeMatchSectionCopy,
  degreeMatchSectionVisible,
  degreeMatchStatusLabel,
  degreeMatchStrengthLabel,
  type DegreeMatchLocale,
} from "@/lib/degree-match/ireland-degree-match-ui"
import { getIrelandCareerDegreeMatches } from "@/lib/degree-match/ireland-model"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

/**
 * Career → Degree block for the Career Page `#study` section.
 * Consumes the P3.2 derived model only; renders categorical labels, never a
 * numeric Match Score. Returns null when the career has no reviewed relation.
 */
export function CareerDegreeMatchSection({
  countryCode,
  careerId,
  locale,
}: {
  countryCode: string
  careerId: string
  locale: DegreeMatchLocale
}) {
  if (!degreeMatchSectionVisible(countryCode, careerId)) return null
  const matches = getIrelandCareerDegreeMatches(careerId)
  if (!matches.length) return null

  const copy = degreeMatchSectionCopy(locale)
  const boundary = degreeMatchBoundaryNote(locale)

  return (
    <div className="mt-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-campcareer-muted">{copy.eyebrow}</p>
      <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-campcareer-ink">{copy.title}</h3>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-campcareer-ink-secondary">{copy.description}</p>
      <p className="mt-1.5 text-xs leading-5 text-campcareer-muted">{boundary}</p>

      <div className="mt-4 grid gap-3">
        {matches.map((match) => (
          <DegreeMatchCard key={match.degreeId} {...match} locale={locale} />
        ))}
      </div>
    </div>
  )
}

type DegreeMatchCardProps = NonNullable<ReturnType<typeof getIrelandCareerDegreeMatches>[number]> & {
  locale: DegreeMatchLocale
}

function DegreeMatchCard(props: DegreeMatchCardProps) {
  const {
    degreeLabel,
    relationshipType,
    relationshipStrength,
    confidence,
    status,
    interpretation,
    additionalQualification,
    regulation,
    locale,
    degreeId,
  } = props

  const detailPath = degreeMatchDegreeDetailPath(degreeId)
  const qualificationLabel = degreeMatchQualificationLabel(additionalQualification.state, locale)
  const showRegulation = regulation.regulatedCareer || Boolean(regulation.regulatorName)

  return (
    <article className="rounded-cc-surface border border-campcareer-border bg-campcareer-canvas p-5">
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-campcareer-muted">
            {locale === "ko" ? "학위" : "Degree"}
          </p>
          <h4 className="mt-1 text-base font-semibold tracking-[-0.01em] text-campcareer-ink">{degreeLabel}</h4>
        </div>
        <p className="text-xs font-semibold text-campcareer-muted">
          {degreeMatchRelationshipTypeLabel(relationshipType, locale)}
        </p>
      </header>

      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-3">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-campcareer-muted">
            {locale === "ko" ? "관계 강도" : "Relationship strength"}
          </dt>
          <dd className="mt-0.5 text-sm font-semibold text-campcareer-ink">{degreeMatchStrengthLabel(relationshipStrength, locale)}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-campcareer-muted">
            {locale === "ko" ? "근거 수준" : "Evidence confidence"}
          </dt>
          <dd className="mt-0.5 text-sm font-semibold text-campcareer-ink">{degreeMatchConfidenceLabel(confidence, locale)}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-campcareer-muted">
            {locale === "ko" ? "상태" : "Status"}
          </dt>
          <dd className="mt-0.5 text-sm font-semibold text-campcareer-ink">{degreeMatchStatusLabel(status, locale)}</dd>
        </div>
      </dl>

      {interpretation ? <p className="mt-3 text-sm leading-6 text-campcareer-ink-secondary">{interpretation}</p> : null}

      {qualificationLabel ? (
        <p className="mt-3 text-sm font-semibold leading-6 text-campcareer-ink">
          {degreeMatchQualificationNote(locale)}: {qualificationLabel}
        </p>
      ) : null}

      {showRegulation ? (
        <p className="mt-1.5 text-xs leading-5 text-campcareer-muted">
          {degreeMatchRegulationNote(locale)}: {regulation.summary}
          {regulation.regulatorUrl ? (
            <>
              {" "}
              <a
                href={regulation.regulatorUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand hover:text-brand-press hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                {regulation.regulatorName ?? (locale === "ko" ? "공식 기관" : "Regulator")} <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            </>
          ) : null}
        </p>
      ) : null}

      {detailPath ? (
        <Link
          href={detailPath}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand transition-colors duration-cc-fast hover:text-brand-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          {locale === "ko"
            ? "이 학위가 이어지는 커리어 보기"
            : "See the Careers this Degree can lead toward"}
        </Link>
      ) : null}
    </article>
  )
}