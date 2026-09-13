import { IrelandCountryDashboard } from "../ireland-country-dashboard"
import { CountryDashboardShell } from "../country-dashboard-shell"
import { IRELAND_OCCUPATION_COUNTRY_PROFILE } from "@/data/ireland-occupation-country-profile"
import { PUBLISHED_IE_CITY_SLUGS } from "@/lib/cities/city-routes"
import { getIrelandCountryDegreeInstitutionConnections } from "@/lib/career-degree/ireland-institution-evidence.server"
import { getIrelandEmploymentEcosystem } from "@/lib/employment/ireland-employment-ecosystem.server"
import { getIrelandInstitutions, type IrelandInstitution } from "@/lib/institutions/ireland-institutions.server"
import { getCountryMetrics } from "@/lib/workspace/country-metrics"

export const revalidate = 3600

export const metadata = {
  title: "Study and Work in Ireland",
  description: "Ireland salary ranges, student living costs, study intakes, strong fields, institutions and cities with official sources.",
  alternates: { canonical: "/countries/ie" },
  robots: { index: true, follow: true } as const,
}

async function getIrelandInstitutionsForCountryPage(): Promise<readonly IrelandInstitution[]> {
  try {
    return await getIrelandInstitutions()
  } catch (error) {
    // A transient institution-directory timeout must not take down the
    // Country Hub. The verified institution cards can be empty for this
    // render while the reviewed Degree/Career relationships remain visible.
    console.error("Unable to load Ireland institutions for Country Hub", error)
    return []
  }
}

export default async function IrelandPage() {
  const [metrics, degreeConnections, institutions, employmentEcosystem] = await Promise.all([
    getCountryMetrics("IE"),
    getIrelandCountryDegreeInstitutionConnections(),
    getIrelandInstitutionsForCountryPage(),
    getIrelandEmploymentEcosystem(),
  ])

  return (
    <CountryDashboardShell
      countryCode="IE"
      summary={IRELAND_OCCUPATION_COUNTRY_PROFILE.introduction}
      showExploreCareers={false}
      cityCount={PUBLISHED_IE_CITY_SLUGS.length}
    >
      <IrelandCountryDashboard
        metrics={metrics}
        degreeConnections={degreeConnections}
        institutions={institutions}
        employmentEcosystem={employmentEcosystem}
      />
    </CountryDashboardShell>
  )
}
