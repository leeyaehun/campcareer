import type { Metadata } from "next"
import { permanentRedirect } from "next/navigation"
import { getIndexableOccupationRoute } from "@/lib/workspace/occupation-routes"
import { OccupationExplorer } from "../occupation/occupation-explorer"

export const metadata: Metadata = {
  title: "Careers",
  description: "Explore CampCareer's career catalogue by field, country and keyword.",
  alternates: { canonical: "/careers" },
  robots: { index: false, follow: true },
}

export default async function CareersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const q = typeof sp.q === "string" ? sp.q : ""
  const occupation = typeof sp.occupation === "string" ? sp.occupation : ""
  const country = typeof sp.country === "string" ? sp.country : ""
  const category = typeof sp.category === "string" ? sp.category : ""
  const canonicalRoute = country && occupation
    ? getIndexableOccupationRoute(country, occupation)
    : null

  if (canonicalRoute) permanentRedirect(canonicalRoute.path)

  return (
    <OccupationExplorer
      basePath="/careers"
      initialQuery={q}
      initialOccupation={occupation}
      initialCountry={country.toUpperCase() === "GB" ? "UK" : country.toUpperCase()}
      initialCategory={category}
    />
  )
}
