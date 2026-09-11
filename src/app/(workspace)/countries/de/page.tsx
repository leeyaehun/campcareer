import { GermanyCountryDashboard } from "../germany-country-dashboard"
import { CountryDashboardShell } from "../country-dashboard-shell"
import { getCountryMetrics } from "@/lib/workspace/country-metrics"

export const revalidate = 3600

export const metadata = {
  title: "Study and Work in Germany",
  description: "Germany salary ranges, student living costs, study intakes, strong fields, institutions and cities with official sources.",
  alternates: { canonical: "/countries/de" },
  robots: { index: true, follow: true } as const,
}

export default async function GermanyPage() {
  const metrics = await getCountryMetrics("DE")
  return <CountryDashboardShell countryCode="DE"><GermanyCountryDashboard metrics={metrics} /></CountryDashboardShell>
}
