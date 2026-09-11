import { NetherlandsCountryDashboard } from "../netherlands-country-dashboard"
import { CountryDashboardShell } from "../country-dashboard-shell"
import { getCountryMetrics } from "@/lib/workspace/country-metrics"

export const revalidate = 3600

export const metadata = {
  title: "Study and Work in the Netherlands",
  description:
    "Netherlands salary ranges, student living costs, study intakes, strong fields, institutions and cities with official sources.",
  alternates: { canonical: "/countries/nl" },
  robots: { index: true, follow: true } as const,
}

export default async function NetherlandsPage() {
  const metrics = await getCountryMetrics("NL")

  return (
    <CountryDashboardShell countryCode="NL">
      <NetherlandsCountryDashboard metrics={metrics} />
    </CountryDashboardShell>
  )
}
