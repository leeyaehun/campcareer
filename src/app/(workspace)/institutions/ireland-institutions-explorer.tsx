import Link from "next/link"
import { Building2, ChevronRight, DatabaseZap, ExternalLink, MapPin } from "lucide-react"
import { EntityCardLink } from "@/components/ui/entity-card"
import { InstitutionCountrySelector } from "./institution-country-selector"
import { institutionDetailPath } from "@/lib/institutions/institution-search"
import { getIrelandInstitutions, type IrelandInstitution } from "@/lib/institutions/ireland-institutions.server"

function IrelandInstitutionCard({ institution }: { institution: IrelandInstitution }) {
  const detailPath = institutionDetailPath("IE", institution.slug)
  const location = institution.locations[0]

  return (
    <div className="space-y-2">
      <EntityCardLink href={detailPath} className="rounded-xl border-[#e7e6e3] bg-white p-5 hover:border-[#cfd9ca] hover:bg-white hover:shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#edf5ea] text-[#3e7a2e]">
          <Building2 className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="inline-flex min-w-0 items-center gap-1.5 text-[16px] font-semibold leading-6 tracking-[-0.01em] text-[#1b1b1b] transition group-hover:text-[#3e7a2e]">
            <span className="truncate">{institution.name}</span>
            <ChevronRight className="size-3.5 shrink-0 text-[#aaa7a0] transition group-hover:translate-x-0.5 group-hover:text-[#3e7a2e]" aria-hidden="true" />
          </div>
          <p className="mt-1 text-[11px] font-medium text-[#6f6d68]">HEA-recognised institution</p>
          {location ? (
            <div className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#2563eb]">
              <MapPin className="size-3.5" aria-hidden="true" />
              {location.city.name}
            </div>
          ) : null}
        </div>
      </div>
      </EntityCardLink>
      <div className="flex flex-wrap items-center gap-4 px-1">
        {location ? <Link href={location.city.path} className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#2563eb] hover:underline">Open {location.city.name} <ChevronRight className="size-3" aria-hidden="true" /></Link> : null}
        <a href={institution.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#6f6d68] hover:text-[#3e7a2e]">
          Official website <ExternalLink className="size-3" aria-hidden="true" />
        </a>
      </div>
    </div>
  )
}

export async function IrelandInstitutionsExplorer() {
  let institutions: readonly IrelandInstitution[] | null = null
  try {
    institutions = await getIrelandInstitutions()
  } catch (error) {
    console.error("Unable to load Ireland institutions explorer", error)
  }

  return (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3e7a2e]">Explore</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-3">
        <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.025em] text-[#1b1b1b] sm:text-3xl">Institutions</h1>
        <InstitutionCountrySelector countryCode="IE" />
      </div>
      <p className="mt-2 max-w-2xl text-[12.5px] leading-5 text-[#77746e]">
        Explore the verified Ireland institution and location cohort. Programme listings are not published from this institution layer.
      </p>

      <section className="mt-6">
        {!institutions ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-[#f0d8d2] bg-[#fff9f7] p-8 text-center">
            <DatabaseZap className="size-6 text-[#b65c45]" aria-hidden="true" />
            <h2 className="mt-3 text-[16px] font-semibold text-[#1b1b1b]">Institution data is temporarily unavailable</h2>
            <p className="mt-2 max-w-lg text-[12px] leading-5 text-[#786b66]">Please try again shortly. No substitute institution data has been shown.</p>
          </div>
        ) : institutions.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[#dcdad4] bg-[#fbfbf9] p-8 text-center">
            <Building2 className="size-6 text-[#3e7a2e]" aria-hidden="true" />
            <h2 className="mt-3 text-[16px] font-semibold text-[#1b1b1b]">Verified institutions are not currently available</h2>
            <p className="mt-2 text-[12px] text-[#77746e]">No legacy catalogue rows have been substituted.</p>
          </div>
        ) : (
          <>
            <p className="text-[12px] font-medium text-[#77746e]">{institutions.length} verified institutions</p>
            <div className="mt-3 space-y-3">{institutions.map((institution) => <IrelandInstitutionCard key={institution.id} institution={institution} />)}</div>
          </>
        )}
      </section>

      <p className="mt-4 text-[10.5px] leading-5 text-[#aaa7a0]">
        This Ireland cohort requires Higher Education Authority recognition and source-backed official location evidence. It is not a complete national institution catalogue, and it does not make any claim about programme availability or international-student eligibility.
      </p>
    </>
  )
}
