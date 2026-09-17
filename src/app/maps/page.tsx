import { pageMetadata } from "@/lib/seo"
import { getInitialMapShellData } from "@/lib/map-data"
import CampCareerMaps from "@/app/map/CampCareerMaps"

// The map shell reads live Supabase datasets. Render per request so CI static
// generation does not require production service-role credentials.
export const dynamic = "force-dynamic"

export const metadata = pageMetadata({
  title: "Regional career context in Australia | CampCareer",
  description: "Use source-labelled Australian regional signals as context after evaluating a career with CampCareer Score.",
  path: "/maps",
})

export default async function MapsPage() {
  const data = await getInitialMapShellData()

  return (
    <main className="flex h-[calc(100dvh-3.5rem)] w-full flex-col sm:h-[calc(100dvh-4rem)]">
      <div className="min-h-0 flex-1"><CampCareerMaps data={data} auOnly routeMode /></div>
    </main>
  )
}