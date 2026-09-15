/**
 * P2.4 "Future outlook" comparison section for /compare.
 *
 * Renders all six derived signals as bounded cell copy for whichever reviewed
 * Ireland careers are being compared. Cells always come from the P2.2 derived
 * model: status, direction, confidence and proxy boundary are shown explicitly,
 * and unavailable evidence renders as an explicit not-enough-evidence state
 * rather than a zero or a negative.
 */

import {
  getIrelandCareerFutureIntelligence,
  isIrelandCareerFutureCareerId,
  type CareerFutureDerivedSignal,
} from "@/lib/career-future-intelligence-model"
import type { CareerFutureIntelligenceSignalKey } from "@/lib/career-future-intelligence-contract"
import {
  futureOutlookConfidenceLabel,
  futureOutlookDirectionLabel,
  futureOutlookProxyNote,
  futureOutlookSignalName,
  futureOutlookStatusLabel,
  futureOutlookUnavailableTitle,
  FUTURE_OUTLOOK_SIGNAL_ORDER,
} from "@/lib/career-future-intelligence-ui"

export type IrelandFutureCompareRow = {
  signal: CareerFutureIntelligenceSignalKey
  label: string
  values: readonly string[]
}

export function futureCompareSectionVisible(careerIds: readonly string[]): boolean {
  return careerIds.some(isIrelandCareerFutureCareerId)
}

/** Bounded cell copy for one derived signal. Unavailable is explicit, never negative. */
export function futureCompareCellText(signal: CareerFutureDerivedSignal): string {
  if (signal.status === "unavailable") {
    const title = futureOutlookUnavailableTitle("unavailable", "en")
    return [futureOutlookStatusLabel("unavailable", "en"), title].filter(Boolean).join(" · ")
  }
  const direction = futureOutlookDirectionLabel(signal.direction, "en")
  const parts: string[] = []
  if (direction) parts.push(direction)
  parts.push(futureOutlookConfidenceLabel(signal.confidence, "en"))
  const proxy = futureOutlookProxyNote(signal.proxyDisclosure, "en")
  if (proxy) parts.push(proxy)
  return parts.join(" · ")
}

/**
 * Builds the six Future outlook rows for the careers currently compared. Only
 * supported reviews Ireland careers contribute cells; unsupported ids are
 * dropped so they can never enter this section by URL.
 */
export function buildIrelandFutureCompareRows(careerIds: readonly string[]): IrelandFutureCompareRow[] {
  const supported = careerIds.filter(isIrelandCareerFutureCareerId)
  if (supported.length === 0) return []
  return FUTURE_OUTLOOK_SIGNAL_ORDER.map((signal) => {
    const label = futureOutlookSignalName(signal, "en")
    const values = supported.map((careerId) => {
      const intelligence = getIrelandCareerFutureIntelligence(careerId)
      if (!intelligence) return "—"
      return futureCompareCellText(intelligence.signals[signal])
    })
    return { signal, label, values }
  })
}

export { FUTURE_OUTLOOK_SIGNAL_ORDER }