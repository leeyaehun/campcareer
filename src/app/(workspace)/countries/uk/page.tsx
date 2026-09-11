import { UnitedKingdomCountryDashboard } from "../united-kingdom-country-dashboard"
import { CountryDashboardShell } from "../country-dashboard-shell"
import { getCountryMetrics } from "@/lib/workspace/country-metrics"

export const revalidate = 3600

export const metadata = {
  title: "Study and Work in the United Kingdom",
  description:
    "United Kingdom salary ranges, student living-cost requirements, study intakes, strong fields, institutions and cities with official sources.",
  alternates: { canonical: "/countries/uk" },
  robots: { index: true, follow: true } as const,
}

export default async function UnitedKingdomPage() {
  const metrics = await getCountryMetrics("UK")

  return (
    <CountryDashboardShell countryCode="UK">
      <UnitedKingdomCountryDashboard metrics={metrics} />
    </CountryDashboardShell>
  )
}
