import { FranceCountryDashboard } from "../france-country-dashboard"
import { CountryDashboardShell } from "../country-dashboard-shell"
import { getCountryMetrics } from "@/lib/workspace/country-metrics"

export const revalidate = 3600

export const metadata = {
  title: "Study and Work in France",
  description:
    "France salary distribution, student living costs, tuition, study calendar, strong fields, institutions and cities with official sources.",
  alternates: { canonical: "/countries/fr" },
  robots: { index: true, follow: true } as const,
}

export default async function FrancePage() {
  const metrics = await getCountryMetrics("FR")

  return (
    <CountryDashboardShell countryCode="FR">
      <FranceCountryDashboard metrics={metrics} />
    </CountryDashboardShell>
  )
}
