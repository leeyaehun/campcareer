import Link from "next/link"
import { Building2, ChevronRight, DatabaseZap, ExternalLink, GraduationCap, MapPin, Search } from "lucide-react"
import { InstitutionLogo } from "@/components/institution-logo"
import { getLaunchCountry } from "@/data/launch-countries"
import { InstitutionCountrySelector } from "./institution-country-selector"
import {
  buildInstitutionExplorerUrl, INSTITUTION_KIND_OPTIONS,
  institutionCountryPath, institutionDetailPath, parseInstitutionSearchParams,
  type InstitutionMvpCountryCode, type InstitutionSearchFilters,
} from "@/lib/institutions/institution-search"
import { searchInstitutions, type InstitutionExplorerItem, type InstitutionSearchResult } from "@/lib/institutions/institutions.server"

function verifiedKindLabel(kind: string | null) {
  switch (kind) {
    case "university": return "University"
    case "college": return "College"
    case "polytechnic": return "Polytechnic"
    case "tafe_vet": return "TAFE / VET"
    case "other": return "Other"
    default: return null
  }
}
function ownershipLabel(ownership: string | null) {
  switch (ownership) {
    case "public": return "Public"
    case "private": return "Private"
    case "private_nonprofit": return "Private nonprofit"
    case "private_forprofit": return "Private for-profit"
    default: return null
  }
}
function safeWebsiteUrl(value: string | null) {
  if (!value) return null
  try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null } catch { return null }
}
function usesLocationLanguage(countryCode: InstitutionMvpCountryCode) { return countryCode !== "AU" }
function hasPendingProgrammeCatalog(countryCode: InstitutionMvpCountryCode) {
  return countryCode === "IE" || countryCode === "NL" || countryCode === "NZ" || countryCode === "SG" || countryCode === "DE"
    || countryCode === "FR" || countryCode === "ES" || countryCode === "BE" || countryCode === "CH"
    || countryCode === "SE" || countryCode === "DK" || countryCode === "FI" || countryCode === "NO"
    || countryCode === "JP" || countryCode === "KR" || countryCode === "AE" || countryCode === "US"
}
function citySummary(institution: InstitutionExplorerItem) {
  const cities = institution.cityNames
  if (cities.length === 0) {
    if (institution.campusCount === 0) return "Location unavailable"
    return usesLocationLanguage(institution.countryCode) ? "Locations available" : "Campus locations available"
  }
  if (cities.length <= 2) return cities.join(", ")
  return `${cities.slice(0, 2).join(", ")} +${cities.length - 2}`
}
function programSummary(institution: InstitutionExplorerItem) {
  if (hasPendingProgrammeCatalog(institution.countryCode) && institution.programCount === 0) return "Program catalog pending"
  return `${institution.programCount.toLocaleString()} programs`
}
function InstitutionCard({ institution }: { institution: InstitutionExplorerItem }) {
  const kind = verifiedKindLabel(institution.institutionKind)
  const ownership = ownershipLabel(institution.ownershipType)
  const website = safeWebsiteUrl(institution.websiteUrl)
  const detailPath = institutionDetailPath(institution.countryCode, institution.slug)
  const locationUnit = usesLocationLanguage(institution.countryCode) ? "locations" : "campuses"
  return (
    <article className="rounded-xl border border-[#e7e6e3] bg-white p-5 transition hover:border-[#cfd9ca] hover:shadow-sm">
      <div className="flex items-start gap-4"><InstitutionLogo name={institution.name} logoUrl={institution.logoUrl} /><div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2"><Link href={detailPath} className="group inline-flex min-w-0 items-center gap-1.5 text-[16px] font-semibold leading-6 tracking-[-0.01em] text-[#1b1b1b] transition hover:text-[#3e7a2e]"><span className="truncate">{institution.name}</span><ChevronRight className="size-3.5 shrink-0 text-[#aaa7a0] transition group-hover:translate-x-0.5 group-hover:text-[#3e7a2e]" /></Link>{kind ? <span className="rounded-full bg-[#f3f4f1] px-2.5 py-1 text-[10.5px] font-semibold text-[#686660]">{kind}</span> : null}{ownership ? <span className="rounded-full border border-[#e7e6e3] px-2.5 py-1 text-[10.5px] font-medium text-[#8b8881]">{ownership}</span> : null}</div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-[#6f6d68]"><span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5 text-[#9c9a94]" />{citySummary(institution)}</span><span className="inline-flex items-center gap-1.5"><GraduationCap className="size-3.5 text-[#9c9a94]" />{programSummary(institution)}</span><span>{institution.campusCount.toLocaleString()} {locationUnit}</span></div>
        <div className="mt-3 flex flex-wrap items-center gap-4"><Link href={detailPath} className="text-[11.5px] font-semibold text-[#3e7a2e] hover:underline">View institution</Link>{website ? <a href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#6f6d68] hover:text-[#3e7a2e]">Official website <ExternalLink className="size-3" /></a> : null}</div>
      </div></div>
    </article>
  )
}

function Pagination({ countryCode, filters, result }: { countryCode: InstitutionMvpCountryCode; filters: InstitutionSearchFilters; result: InstitutionSearchResult }) {
  if (result.pageCount <= 1) return null
  return <nav aria-label="Institution result pages" className="mt-6 flex items-center justify-between rounded-xl border border-[#e7e6e3] bg-white px-4 py-3">{result.page > 1 ? <Link href={buildInstitutionExplorerUrl(countryCode, filters, { page: result.page - 1 })} className="rounded-lg border border-[#deddd8] px-3 py-2 text-[12px] font-semibold text-[#4d4c48] transition hover:border-[#3e7a2e]/50 hover:text-[#3e7a2e]">Previous</Link> : <span />}<p className="text-[11.5px] font-medium text-[#8f8c85]">Page {result.page} of {result.pageCount}</p>{result.page < result.pageCount ? <Link href={buildInstitutionExplorerUrl(countryCode, filters, { page: result.page + 1 })} className="rounded-lg bg-[#3e7a2e] px-3.5 py-2 text-[12px] font-semibold text-white transition hover:bg-[#326625]">Next</Link> : <span />}</nav>
}

export async function InstitutionsExplorer({ countryCode, searchParams }: { countryCode: InstitutionMvpCountryCode; searchParams: Record<string, string | string[] | undefined> }) {
  const country = getLaunchCountry(countryCode)
  const filters = parseInstitutionSearchParams(searchParams)
  const countryPath = institutionCountryPath(countryCode)
  const connectionLabel = usesLocationLanguage(countryCode) ? "location" : "campus"
  const euFastpath = countryCode === "BE" || countryCode === "CH" || countryCode === "SE" || countryCode === "DK"
  const authorityFastpath = countryCode === "FI" || countryCode === "NO" || countryCode === "JP" || countryCode === "KR" || countryCode === "AE"
  let result: InstitutionSearchResult | null = null
  let errorMessage: string | null = null
  try { result = await searchInstitutions(countryCode, filters) } catch (error) { console.error("Unable to load institution explorer", error); errorMessage = "Please try again shortly. No substitute institution data has been shown." }

  return <>
    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3e7a2e]">Explore</p>
    <div className="mt-1.5 flex flex-wrap items-center gap-3"><h1 className="text-[28px] font-semibold leading-tight tracking-[-0.025em] text-[#1b1b1b] sm:text-3xl">Institutions</h1><InstitutionCountrySelector countryCode={countryCode} /></div>
    <p className="mt-2 max-w-2xl text-[12.5px] leading-5 text-[#77746e]">{countryCode === "US" ? "Explore the 25-university US launch cohort selected from the latest NCSES federal science and engineering support table. NCES selection is a publication criterion; official institution identity remains NCES/IPEDS UNITID. The CampCareer US degree-program catalogue is not yet published." : hasPendingProgrammeCatalog(countryCode) ? `Search verified institution identities and source-backed ${connectionLabel} data in ${country?.name ?? countryCode}. The CampCareer ${country?.name ?? countryCode} program catalog is not yet published.` : `Search verified institution identities and their current CampCareer program and ${connectionLabel} connections in ${country?.name ?? countryCode}.`}</p>

    {filters.city ? <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#eef4ff] px-3 py-1.5 text-[11.5px] font-semibold text-[#2755a5]"><MapPin className="size-3.5" />Campuses in {filters.city}<Link href={countryPath} className="ml-1 text-[#2755a5]/70 underline underline-offset-2 hover:text-[#2755a5]">Clear</Link></div> : null}

    <form action={countryPath} method="get" className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_210px_auto]">{filters.city ? <input type="hidden" name="city" value={filters.city} /> : null}<label className="relative block"><Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#a3a19b]" /><input type="search" name="q" defaultValue={filters.q} placeholder="Search institution name…" className="h-12 w-full rounded-xl border border-[#deddd8] bg-white pl-11 pr-4 text-[13.5px] text-[#1b1b1b] outline-none transition placeholder:text-[#aaa8a2] focus:border-[#3e7a2e] focus:ring-2 focus:ring-[#3e7a2e]/10" /></label><select name="kind" defaultValue={filters.kind} aria-label="Verified institution type" className="h-12 rounded-xl border border-[#deddd8] bg-white px-3 text-[12.5px] font-medium text-[#4d4c48] outline-none focus:border-[#3e7a2e]">{INSTITUTION_KIND_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><button type="submit" className="h-12 rounded-xl bg-[#3e7a2e] px-5 text-[12.5px] font-semibold text-white transition hover:bg-[#326625]">Search</button></form>

    <section className="mt-6">{errorMessage ? <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-[#f0d8d2] bg-[#fff9f7] p-8 text-center"><DatabaseZap className="size-6 text-[#b65c45]" /><h2 className="mt-3 text-[16px] font-semibold text-[#1b1b1b]">Institution data is temporarily unavailable</h2><p className="mt-2 max-w-lg text-[12px] leading-5 text-[#786b66]">{errorMessage}</p></div> : result ? <><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-[12px] font-medium text-[#77746e]">{result.total.toLocaleString()} institutions</p>{filters.q || filters.city || filters.kind !== "all" ? <Link href={countryPath} className="text-[11.5px] font-semibold text-[#3e7a2e] hover:underline">Clear filters</Link> : null}</div>{result.institutions.length === 0 ? <div className="mt-3 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[#dcdad4] bg-[#fbfbf9] p-8 text-center"><Building2 className="size-6 text-[#3e7a2e]" /><h2 className="mt-3 text-[16px] font-semibold text-[#1b1b1b]">No institutions match these filters</h2><p className="mt-2 text-[12px] text-[#77746e]">Try a broader name search or clear the verified type filter.</p></div> : <div className="mt-3 space-y-3">{result.institutions.map((institution) => <InstitutionCard key={institution.id} institution={institution} />)}</div>}<Pagination countryCode={countryCode} filters={filters} result={result} /></> : null}</section>

    <p className="mt-4 text-[10.5px] leading-5 text-[#aaa7a0]">{countryCode === "US" ? "The US database retains the broader IPEDS institution universe, but this Explorer intentionally publishes only the 25-institution NCSES launch cohort. The existing US CIP outcome rows are not degree-program records, so zero canonical programs must not be interpreted as no programs offered." : euFastpath || authorityFastpath ? `${country?.name ?? countryCode} institutions use authority-backed official-name identity and city-level publication locations without claiming a complete campus inventory. The program catalogue is pending, so zero canonical program records do not mean a university offers no programs.` : countryCode === "UK" ? "UK location counts prefer institution-official campus and study-location records. Where a full official campus inventory has not yet been normalized, CampCareer falls back to the existing city-level institution location rather than inventing campuses." : countryCode === "NL" ? "Netherlands locations use the DUO/RIO-backed institution location layer. Program counts remain canonical; while the NL program catalogue is pending, zero records must not be read as evidence that an institution offers no programs." : countryCode === "NZ" ? "New Zealand locations use NZQA registry-backed provider cities. The NZ program catalogue is pending, so zero canonical program records must not be read as evidence that a university offers no programs." : countryCode === "SG" ? "Singapore locations use current university-owned contact or campus pages. The SG program catalogue is pending, so zero canonical program records must not be read as evidence that an institution offers no programs." : countryCode === "DE" ? "Germany Tier A uses HRK-verified institutions and DFG-verified Excellence-site cities without claiming a complete campus inventory. The DE program catalogue is pending, so zero canonical program records do not mean a university offers no programs." : countryCode === "FR" ? "France Tier A uses official UAI identities and government or university source-backed registered locations. The FR program catalogue is pending, so zero canonical program records do not mean a university offers no programs." : countryCode === "ES" ? "Spain Tier A uses source-backed current official university names with RUCT registry context and university-owned primary administrative locations. The ES program catalogue is pending, so zero canonical program records do not mean a university offers no programs." : "Institution type and ownership are shown only when they have been normalized from source-backed classifications. Program counts include active canonical programs only; city labels use normalized geography links."}</p>
  </>
}
