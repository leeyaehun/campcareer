import { CanadaCountryDashboard } from "../canada-country-dashboard"
import { CountryDashboardShell } from "../country-dashboard-shell"
import { getCountryMetrics } from "@/lib/workspace/country-metrics"

export const revalidate = 3600

export const metadata = {
  title: "Study and Work in Canada",
  description:
    "Canada salary ranges, student living-cost planning, study intakes, strong fields, institutions and cities with official sources.",
  alternates: { canonical: "/countries/ca" },
  robots: { index: true, follow: true } as const,
}

export default async function CanadaPage() {
  const metrics = await getCountryMetrics("CA")

  return (
    <CountryDashboardShell countryCode="CA">
      <CanadaCountryDashboard metrics={metrics} />
    </CountryDashboardShell>
  )
}
