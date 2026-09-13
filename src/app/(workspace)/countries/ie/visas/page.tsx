import type { Metadata } from "next"
import { IrelandVisaDirectory } from "@/app/(workspace)/countries/ireland-visa-content"
import { loadVisaCatalog } from "@/lib/workspace/visa-catalog-loader"
import { IRELAND_VISA_DIRECTORY_PATH } from "@/lib/workspace/visa-routes"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Ireland visas and work-rights pathways",
  description: "Official-source context for verified Ireland study, graduate-work and employment-permit pathways.",
  alternates: { canonical: IRELAND_VISA_DIRECTORY_PATH },
  robots: { index: true, follow: true },
}

export default async function IrelandVisasPage() {
  const catalog = await loadVisaCatalog()
  return <IrelandVisaDirectory visas={catalog.filter((visa) => visa.countryCode === "IE")} />
}
