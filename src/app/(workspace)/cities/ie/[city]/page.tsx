import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { IrelandCityDashboard } from "@/app/(workspace)/cities/ireland-city-dashboard"
import { getIrelandCityDecisionConnections } from "@/lib/cities/ireland-city-decision-connections.server"
import { getIeCityProfile } from "@/lib/cities/ie-city-profile.server"
import {
  PUBLISHED_IE_CITY_NAMES,
  PUBLISHED_IE_CITY_SLUGS,
  isPublishedIeCitySlug,
} from "@/lib/cities/city-routes"

export const dynamic = "force-dynamic"

export function generateStaticParams() {
  return PUBLISHED_IE_CITY_SLUGS.map((city) => ({ city }))
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params
  const normalized = city.trim().toLowerCase()
  if (!isPublishedIeCitySlug(normalized)) {
    return { robots: { index: false, follow: false } }
  }

  const name = PUBLISHED_IE_CITY_NAMES[normalized]
  return {
    title: `Study in ${name}, Ireland`,
    description: `Explore ${name} student living costs, transport, Stamp 2 work context, verified institutions and current programme-delivery coverage.`,
    alternates: { canonical: `/cities/ie/${normalized}` },
    robots: { index: true, follow: true },
  }
}

export default async function IrelandCityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  const normalized = city.trim().toLowerCase()
  if (!isPublishedIeCitySlug(normalized)) notFound()

  const [profile, decisionConnections] = await Promise.all([
    getIeCityProfile(normalized),
    getIrelandCityDecisionConnections(normalized),
  ])
  if (!profile) notFound()

  return <IrelandCityDashboard profile={profile} decisionConnections={decisionConnections} />
}
