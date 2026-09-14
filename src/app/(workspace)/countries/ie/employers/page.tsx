import type { Metadata } from "next"
import { getIrelandEmploymentEcosystem, getIrelandEmployersByIndustry } from "@/lib/employment/ireland-employment-ecosystem.server"
import { normalizeEmployerSlug } from "@/lib/employment/ireland-employer-routes"
import { IrelandEmployerDirectory } from "../../../employers/ireland-employer-directory"

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Employers in Ireland",
    description:
      "A small trusted layer of verified Ireland employers with official sources. CampCareer shows verified employer context, not live hiring, salary or sponsorship information.",
    robots: { index: false, follow: true },
  }
}

export default async function IrelandEmployersPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const ecosystem = await getIrelandEmploymentEcosystem()
  const raw = (await searchParams).industry
  const industryFilter = normalizeEmployerSlug(Array.isArray(raw) ? raw[0] : raw)
  const filterIsValid = industryFilter === null || ecosystem.industries.some((industry) => industry.slug === industryFilter)
  const employers = await getIrelandEmployersByIndustry(filterIsValid ? industryFilter : null)

  return <IrelandEmployerDirectory ecosystem={ecosystem} industryFilter={filterIsValid ? industryFilter : null} employers={employers} />
}