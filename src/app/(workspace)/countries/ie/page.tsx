import { IrelandCountryDashboard } from "../ireland-country-dashboard"
import { CountryDashboardShell } from "../country-dashboard-shell"
import { getCountryMetrics } from "@/lib/workspace/country-metrics"

export const revalidate = 3600

export const metadata = {
  title: "Study and Work in Ireland",
  description: "Ireland salary ranges, student living costs, study intakes, strong fields, institutions and cities with official sources.",
  alternates: { canonical: "/countries/ie" },
  robots: { index: true, follow: true } as const,
}

export default async function IrelandPage() {
  const metrics = await getCountryMetrics("IE")
  return <CountryDashboardShell countryCode="IE"><IrelandCountryDashboard metrics={metrics} /></CountryDashboardShell>
}
