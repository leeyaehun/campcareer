import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { VisasExplorer } from "@/app/(workspace)/visas/visas-explorer"
import { loadVisaCatalog } from "@/lib/workspace/visa-catalog-loader"
import { getIrelandCountryVisaRoute } from "@/lib/workspace/visa-routes"

export const dynamic = "force-dynamic"

type IrelandVisaDetailPageProps = { params: Promise<{ visa: string }> }

export async function generateMetadata({ params }: IrelandVisaDetailPageProps): Promise<Metadata> {
  const { visa } = await params
  const route = getIrelandCountryVisaRoute(await loadVisaCatalog(), visa)
  if (!route) return { title: "Ireland visas", robots: { index: false, follow: false } }

  return {
    title: `${route.visa.name} in Ireland`,
    description: route.visa.note,
    alternates: { canonical: route.path },
    robots: { index: true, follow: true },
  }
}

export default async function IrelandVisaDetailPage({ params }: IrelandVisaDetailPageProps) {
  const { visa } = await params
  const catalog = await loadVisaCatalog()
  const route = getIrelandCountryVisaRoute(catalog, visa)
  if (!route) notFound()
  if (visa !== route.slug) permanentRedirect(route.path)

  return (
    <div className="w-full px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <VisasExplorer
          initialQuery=""
          initialCountry="IE"
          initialVisaName={route.visa.name}
          catalog={catalog}
        />
      </div>
    </div>
  )
}