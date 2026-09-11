import { UnitedStatesCountryDashboard } from "../united-states-country-dashboard"
import { CountryDashboardShell } from "../country-dashboard-shell"
import { getCountryMetrics } from "@/lib/workspace/country-metrics"

export const revalidate = 3600

export const metadata = {
  title: "Study and Work in the United States",
  description:
    "United States salary benchmarks, student living-cost planning, study intakes, strong fields, institutions and cities with official sources.",
  alternates: { canonical: "/countries/us" },
  robots: { index: true, follow: true } as const,
}

export default async function UnitedStatesPage() {
  const metrics = await getCountryMetrics("US")

  return (
    <CountryDashboardShell countryCode="US">
      <UnitedStatesCountryDashboard metrics={metrics} />
    </CountryDashboardShell>
  )
}
