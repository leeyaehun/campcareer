import { CountryDashboardShell } from "./country-dashboard-shell"

export const metadata = {
  title: "Country career context",
  description: "Use country, city, cost, visa and labour-market evidence as context for a specific career decision.",
  alternates: { canonical: "/countries" },
  robots: { index: false, follow: true } as const,
}

export default async function CountriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const q = typeof sp.q === "string" ? sp.q : ""
  return <CountryDashboardShell initialQuery={q} />
}
