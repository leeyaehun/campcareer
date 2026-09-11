import { AustraliaCountryDashboard } from "../australia-country-dashboard"
import { CountryDashboardShell } from "../country-dashboard-shell"
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

export default async function AustraliaPage() {
  const metrics = await getCountryMetrics("AU")

  return (
    <CountryDashboardShell countryCode="AU">
      <AustraliaCountryDashboard metrics={metrics} />
    </CountryDashboardShell>
  )
}
