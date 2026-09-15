import { ExternalLink } from "lucide-react"
import type { CareerFutureIntelligenceSignalKey } from "@/lib/career-future-intelligence-contract"
import {
  getIrelandCareerFutureIntelligence,
  getIrelandCareerFutureProvenance,
  type CareerFutureDerivedSignal,
} from "@/lib/career-future-intelligence-model"
import {
  FUTURE_OUTLOOK_SIGNAL_ORDER,
  futureOutlookAiExposureBoundary,
  futureOutlookCardCopy,
  futureOutlookConfidenceLabel,
  futureOutlookDirectionLabel,
  futureOutlookPeriodAndGeography,
  futureOutlookProxyNote,
  futureOutlookSectionCopy,
  futureOutlookSectionVisible,
  futureOutlookSignalDoesNotMean,
  futureOutlookSignalMeaning,
  futureOutlookSignalName,
  futureOutlookSignalUserFacingBoundary,
  futureOutlookStatusLabel,
  futureOutlookUnavailableTitle,
  type FutureOutlookLocale,
} from "@/lib/career-future-intelligence-ui"

type CardCopy = ReturnType<typeof futureOutlookCardCopy>

export function IrelandCareerFutureOutlook({
  countryCode,
  careerId,
  locale,
}: {
  countryCode: string
  careerId: string
  locale: FutureOutlookLocale
}) {
  if (!futureOutlookSectionVisible(countryCode, careerId)) return null

  const intelligence = getIrelandCareerFutureIntelligence(careerId)
  if (!intelligence) return null

  const section = futureOutlookSectionCopy(locale)
  const cardCopy = futureOutlookCardCopy(locale)

  return (
    <section id="future-outlook" className="mt-6 scroll-mt-24 rounded-cc-large border border-campcareer-border bg-campcareer-surface p-5 shadow-cc-surface sm:p-8" aria-labelledby="future-outlook-heading">
      <header className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-campcareer-muted">{section.eyebrow}</p>
        <h2 id="future-outlook-heading" className="mt-2 text-2xl font-bold tracking-[-0.04em] text-campcareer-ink sm:text-3xl">{section.title}</h2>
        <p className="mt-3 text-sm leading-6 text-campcareer-ink-secondary sm:text-base">{section.description}</p>
      </header>

      <div className="mt-7 grid gap-3">
        {FUTURE_OUTLOOK_SIGNAL_ORDER.map((signalKey) => (
          <FutureSignalCard
            key={signalKey}
            signalKey={signalKey}
            derived={intelligence.signals[signalKey]}
            careerId={careerId}
            locale={locale}
            copy={cardCopy}
          />
        ))}
      </div>

      <p className="mt-6 max-w-3xl text-xs leading-5 text-campcareer-muted">
        {locale === "ko"
          ? "이 전망은 공개 점수(CampCareer Score)가 아니며 취업, 승진 또는 개인 결과를 보장하지 않습니다. 수치가 아닌 방향과 한계를 확인하는 데 사용하세요."
          : "This outlook is not a score and does not guarantee employment, promotion or any individual outcome. Treat it as qualified, time-bounded context rather than a number."}
      </p>
    </section>
  )
}

function FutureSignalCard({
  signalKey,
  derived,
  careerId,
  locale,
  copy,
}: {
  signalKey: CareerFutureIntelligenceSignalKey
  derived: CareerFutureDerivedSignal
  careerId: string
  locale: FutureOutlookLocale
  copy: CardCopy
}) {
  const status = derived.status
  const direction = futureOutlookDirectionLabel(derived.direction, locale)
  const unavailableTitle = futureOutlookUnavailableTitle(status, locale)
  const periodGeo = futureOutlookPeriodAndGeography(derived)
  const provenance = getIrelandCareerFutureProvenance(careerId, signalKey)

  return (
    <article className="rounded-cc-surface border border-campcareer-border bg-campcareer-canvas p-5">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h3 className="text-base font-semibold tracking-[-0.01em] text-campcareer-ink">{futureOutlookSignalName(signalKey, locale)}</h3>
        <StatusChip status={status} label={futureOutlookStatusLabel(status, locale)} />
        {direction ? <span className="text-sm font-semibold text-campcareer-ink-secondary">{direction}</span> : null}
      </header>

      {unavailableTitle ? (
        <p className="mt-3 text-sm font-semibold leading-6 text-campcareer-ink">{unavailableTitle}</p>
      ) : derived.displayValue ? (
        <p className="mt-3 text-sm font-semibold leading-6 text-campcareer-ink">{derived.displayValue}</p>
      ) : null}

      <p className="mt-2 text-sm leading-6 text-campcareer-ink-secondary">{derived.interpretation}</p>

      {signalKey === "ai_exposure" ? (
        <p className="mt-2 text-xs leading-5 text-campcareer-muted">{futureOutlookAiExposureBoundary(locale)}</p>
      ) : null}

      <p className="mt-2 text-xs leading-5 text-campcareer-muted">
        {copy.confidence}: {futureOutlookConfidenceLabel(derived.confidence, locale)}
        {periodGeo ? ` · ${copy.referencePeriod}: ${periodGeo}` : ""}
      </p>

      <details className="mt-4">
        <summary className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-brand transition-colors duration-cc-fast hover:text-brand-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
          {copy.whyThisSignal}
        </summary>
        <div className="mt-3">
          <p className="text-sm leading-6 text-campcareer-ink-secondary">{futureOutlookSignalMeaning(signalKey)}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-campcareer-muted">{locale === "ko" ? "이 신호가 의미하지 않는 것" : "What this signal does not mean"}</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-xs leading-5 text-campcareer-ink-secondary">
            {futureOutlookSignalDoesNotMean(signalKey).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs leading-5 text-campcareer-muted">{futureOutlookSignalUserFacingBoundary(signalKey)}</p>

          {provenance.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-campcareer-muted">{copy.sources}</p>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {provenance.map((row) => (
                  <div key={row.evidenceKey} className="rounded-cc-control border border-campcareer-border bg-campcareer-surface p-3">
                    <a href={row.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-press hover:underline">
                      {row.title} <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                    <p className="mt-1 text-xs leading-5 text-campcareer-ink-secondary">{row.publisher}</p>
                    <p className="mt-1 text-xs leading-5 text-campcareer-muted">
                      {row.referencePeriodLabel} · {row.geographyLabel}
                      {futureOutlookProxyNote(row.proxyDisclosure, locale) ? ` · ${futureOutlookProxyNote(row.proxyDisclosure, locale)}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {status === "unavailable" ? (
            <p className="mt-3 text-xs leading-5 text-campcareer-muted">
              {locale === "ko"
                ? "확인된 공식 근거가 없으므로 이 신호는 표시하지 않거나 기본값으로 채우지 않습니다."
                : "Because no defensible official evidence is available, this signal stays unstated rather than receiving a default or average value."}
            </p>
          ) : null}
        </div>
      </details>
    </article>
  )
}

function StatusChip({ status, label }: { status: CareerFutureDerivedSignal["status"]; label: string }) {
  const className =
    status === "available"
      ? "bg-brand-tint text-brand"
      : status === "limited"
        ? "border border-campcareer-border bg-campcareer-surface text-campcareer-caution"
        : "border border-campcareer-border bg-campcareer-canvas text-campcareer-muted"
  return (
    <span className={`inline-flex shrink-0 items-center rounded-cc-control px-2.5 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
  )
}