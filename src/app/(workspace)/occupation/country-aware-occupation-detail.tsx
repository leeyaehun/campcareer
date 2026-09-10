import { AlertCircle } from "lucide-react"
import type { CanonicalCareer } from "@/data/career-comparison-catalog"
import type { OccupationDetail } from "@/lib/workspace/occupation-detail"
import type { CountryOccupationProfile } from "@/lib/workspace/country-occupation-contract"
import { CountryOccupationDashboard } from "./country-occupation-dashboard"
import { OccupationDetailPanel as LegacyOccupationDetailPanel } from "./occupation-detail-view"
import { EmptyState, LoadingState } from "@/components/ui/status-state"

type CountryProfileStatus = "idle" | "loading" | "ready" | "missing" | "error"

export function CountryAwareOccupationDetail({
  career,
  detail,
  countryCode,
  countryName,
  countryProfile,
  countryProfileStatus,
}: {
  career: CanonicalCareer
  detail: OccupationDetail | undefined
  countryCode?: string
  countryName?: string
  countryProfile: CountryOccupationProfile | null
  countryProfileStatus: CountryProfileStatus
}) {
  if (!countryCode) {
    return (
      <LegacyOccupationDetailPanel
        career={career}
        detail={detail}
        countryCode={countryCode}
        countryName={countryName}
      />
    )
  }

  if (countryProfileStatus === "loading") {
    return (
      <div className="min-h-[420px] rounded-cc-large border border-campcareer-border bg-campcareer-surface p-10 shadow-cc-surface">
        <LoadingState />
        <p className="mt-5 text-sm font-medium text-campcareer-muted">Loading {countryName ?? countryCode} occupation data…</p>
      </div>
    )
  }

  if (countryProfile) {
    return <CountryOccupationDashboard career={career} profile={countryProfile} />
  }

  return (
    <EmptyState
      icon={<AlertCircle className="size-5" />}
      title={career.label}
      detail={countryProfileStatus === "error"
          ? "This country profile could not be loaded. No data from another country has been substituted."
          : `Verified country-specific salary, demand, pathway and job-market data are not published for this occupation in ${countryName ?? countryCode} yet. No data from another country has been substituted.`}
      className="min-h-[420px]"
    />
  )
}
