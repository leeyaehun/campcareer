import Link from "next/link"
import { ExternalLink } from "lucide-react"
import type { IrelandEmploymentEcosystem } from "@/lib/employment/ireland-employment-ecosystem-contract"
import {
  formatIrelandEmploymentCount,
  getIrelandEmploymentSectorsSorted,
  IRELAND_EMPLOYMENT_SECTOR_SOURCE,
} from "@/data/ireland-employment-sectors"
import { careerCanonicalPath } from "@/lib/workspace/occupation-routes"
import { CANONICAL_CAREER_BY_ID } from "@/data/career-comparison-catalog"

const MAX_BAR_WIDTH = Math.max(...getIrelandEmploymentSectorsSorted().map((sector) => sector.employmentCount))

export function IrelandEmploymentSectorChart({ ecosystem }: { ecosystem: IrelandEmploymentEcosystem }) {
  const sectors = getIrelandEmploymentSectorsSorted()
  const relatedSectors = sectors.filter((sector) => sector.relatedIndustryId)

  return (
    <section className="mt-12 rounded-xl border border-[#e7e6e3] bg-white p-5 sm:p-6" aria-labelledby="ireland-employment-sector-heading">
      <div className="max-w-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8f8c85]">National employment structure</p>
        <h2 id="ireland-employment-sector-heading" className="mt-1 text-[20px] font-semibold tracking-[-0.02em] text-[#1b1b1b]">Where people work in Ireland</h2>
        <p className="mt-1 text-[12px] text-[#6f6d68]">Employment by broad economic sector · Q4 2024</p>
      </div>

      <p className="mt-4 rounded-lg border border-[#e8ecf5] bg-[#f8faff] px-4 py-3 text-[12px] leading-5 text-[#475467]" role="note">
        Sector employment shows economic scale, not individual career demand, salary, hiring probability or visa eligibility.
      </p>

      <div className="mt-5 space-y-4" role="list" aria-label="Ireland employment by broad economic sector">
        {sectors.map((sector) => {
          const width = `${(sector.employmentCount / MAX_BAR_WIDTH) * 100}%`
          return (
            <div key={sector.id} role="listitem" className="min-w-0">
              <div className="flex items-baseline justify-between gap-4">
                <span className="min-w-0 text-[12px] font-semibold text-[#303030]">{sector.officialLabel}</span>
                <span className="shrink-0 text-[12px] tabular-nums text-[#475467]">{formatIrelandEmploymentCount(sector.employmentCount)} people</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#edf0f5]" aria-hidden="true">
                <div className="h-full rounded-full bg-[#2557e0]" style={{ width }} />
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-5 text-[11px] leading-5 text-[#77746e]">
        Source: {IRELAND_EMPLOYMENT_SECTOR_SOURCE.authority} · {IRELAND_EMPLOYMENT_SECTOR_SOURCE.title} · {IRELAND_EMPLOYMENT_SECTOR_SOURCE.dataset}. Values are shown in persons after converting the source&apos;s thousands unit; the source excludes employment where sector was not stated. <a href={IRELAND_EMPLOYMENT_SECTOR_SOURCE.url} target="_blank" rel="noreferrer" className="font-semibold text-[#2563eb] hover:underline">Open official source <ExternalLink className="inline size-3" aria-hidden="true" /></a>
      </p>

      <div className="mt-7 rounded-lg border border-[#e7e6e3] bg-[#fafaf8] p-4" aria-labelledby="ireland-sector-context-heading">
        <p id="ireland-sector-context-heading" className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#66805f]">CampCareer context</p>
        <p className="mt-1 text-[11.5px] leading-5 text-[#6f6d68]">The official sector classification is separate from CampCareer&apos;s reviewed Industry graph. These are restrained conceptual correspondences; the chart categories and values stay unchanged.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {relatedSectors.map((sector) => {
            const industry = ecosystem.industries.find((candidate) => candidate.id === sector.relatedIndustryId)
            if (!industry) return null
            return (
              <div key={sector.id} className="min-w-0 rounded-md border border-[#dfe8db] bg-white p-3">
                <p className="text-[11px] font-semibold leading-4 text-[#254d1e]">{sector.officialLabel} <span className="text-[#8f8c85]">→</span> {industry.name}</p>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#66805f]">Reviewed careers</p>
                <div className="mt-1 flex flex-wrap gap-x-2.5 gap-y-1.5">
                  {industry.careers.map((connection) => (
                    <Link key={connection.careerId} href={careerCanonicalPath("IE", connection.careerId)} className="text-[11px] font-semibold text-[#2563eb] hover:underline">
                      {CANONICAL_CAREER_BY_ID.get(connection.careerId)?.label ?? connection.careerId}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
