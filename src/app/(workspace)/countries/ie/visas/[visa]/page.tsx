import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { IrelandVisaDetail } from "@/app/(workspace)/countries/ireland-visa-content"
import { getVisaDetail } from "@/lib/workspace/visa-detail-resolver"
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
  const route = getIrelandCountryVisaRoute(await loadVisaCatalog(), visa)
  if (!route) notFound()
  if (visa !== route.slug) permanentRedirect(route.path)

  return <IrelandVisaDetail visa={route.visa} detail={getVisaDetail("IE", route.visa.name)} />
}
