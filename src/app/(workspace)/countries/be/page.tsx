import { BelgiumCountryDashboard } from "../belgium-country-dashboard"
import { CountryDashboardShell } from "../country-dashboard-shell"
import { getCountryMetrics } from "@/lib/workspace/country-metrics"

export const revalidate = 3600

export const metadata = {
  title: "Study and Work in Belgium",
  description:
    "Belgium salary ranges, student living costs, tuition, study calendar, strong fields, institutions and cities with official sources.",
  alternates: { canonical: "/countries/be" },
  robots: { index: true, follow: true } as const,
}

export default async function BelgiumPage() {
  const metrics = await getCountryMetrics("BE")

  return (
    <CountryDashboardShell countryCode="BE">
      <BelgiumCountryDashboard metrics={metrics} />
    </CountryDashboardShell>
  )
}
