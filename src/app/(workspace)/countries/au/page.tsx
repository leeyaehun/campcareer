import { Suspense } from "react"
import { AustraliaCountryDashboard } from "../australia-country-dashboard"
import { CountryDashboardShell } from "../country-dashboard-shell"
import { AUSTRALIA_OCCUPATION_COUNTRY_PROFILE } from "@/data/australia-occupation-country-profile"
import { getCountryMetrics } from "@/lib/workspace/country-metrics"

// Country metrics are stable public evidence and are revalidated hourly.
export const revalidate = 3600

export const metadata = {
  title: "Study and Work in Australia",
  description:
    "Australia salary ranges, student living costs, study intakes, strong fields, institutions and cities with official sources.",
  alternates: { canonical: "/countries/au" },
  robots: { index: true, follow: true } as const,
}

function CountryDashboardFallback() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="h-8 w-40 rounded bg-[#f0efec]" />
      <div className="h-40 w-full rounded-2xl bg-[#f0efec]" />
      <div className="h-40 w-full rounded-2xl bg-[#f0efec]" />
    </div>
  )
}

async function CountryDashboardMetrics() {
  const metrics = await getCountryMetrics("AU")
  return <AustraliaCountryDashboard metrics={metrics} />
}

export default function AustraliaPage() {
  return (
    <CountryDashboardShell countryCode="AU">
      <p className="mb-4 max-w-3xl text-[13px] leading-6 text-[#6f6d68]">
        {AUSTRALIA_OCCUPATION_COUNTRY_PROFILE.introduction}
      </p>
      <Suspense fallback={<CountryDashboardFallback />}>
        <CountryDashboardMetrics />
      </Suspense>
    </CountryDashboardShell>
  )
}