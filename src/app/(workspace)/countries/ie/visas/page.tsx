import type { Metadata } from "next"
import { VisasExplorer } from "@/app/(workspace)/visas/visas-explorer"
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
  return (
    <div className="w-full px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <VisasExplorer initialQuery="" initialCountry="IE" catalog={catalog} />
      </div>
    </div>
  )
}