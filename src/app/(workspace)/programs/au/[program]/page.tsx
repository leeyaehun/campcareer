import type { Metadata } from "next"
import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import { ArrowLeft, ArrowUpRight, BookOpenCheck, Building2, CalendarDays, Clock3, GraduationCap, Languages, MapPin, ShieldCheck, WalletCards } from "lucide-react"
import { getAuProgramById } from "@/lib/programs/au-programs.server"
import { institutionDetailPath } from "@/lib/institutions/institution-search"
import { isIndexableAuProgramId } from "@/lib/programs/program-routes"
import { parseProgramId, programDetailPath } from "@/lib/programs/program-search"
import {
  formatProgramDuration,
  formatProgramMoney,
  programFactsByKey,
  programFactValue,
  ProgramDetailMetric,
  ProgramFactSection,
  safeProgramUrl,
} from "../../program-detail-components"

const BASE_URL = "https://www.campcareer.com"
export const revalidate = 3600
const CITY_PROFILE_SLUGS = new Set(["sydney", "melbourne", "brisbane", "perth", "adelaide"])

type Params = { params: Promise<{ program: string }> }

async function loadProgram(segment: string) {
  const id = parseProgramId(segment)
  return id ? getAuProgramById(id) : null
}

function programLocationSummary(program: Awaited<ReturnType<typeof loadProgram>>) {
  if (!program) return ""
  if (program.deliveryLocations.length > 0) {
    const cityNames = [
      program.verifiedCitySlugs.includes("sydney") ? "Sydney" : null,
      program.verifiedCitySlugs.includes("melbourne") ? "Melbourne" : null,
      program.verifiedCitySlugs.includes("brisbane") ? "Brisbane" : null,
      program.verifiedCitySlugs.includes("perth") ? "Perth" : null,
      program.verifiedCitySlugs.includes("adelaide") ? "Adelaide" : null,
    ].filter((value): value is string => Boolean(value))

    if (cityNames.length > 0) {
      return `${cityNames.join(" & ")} · ${program.deliveryLocations.length} registered ${
        program.deliveryLocations.length === 1 ? "location" : "locations"
      }`
    }

    const first = program.deliveryLocations[0]
    const primary = [first.locality, first.state].filter(Boolean).join(", ") || first.locationName
    const extra = program.deliveryLocations.length - 1
    return extra > 0 ? `${primary} + ${extra} registered ${extra === 1 ? "location" : "locations"}` : primary
  }
  return [program.city, program.state].filter(Boolean).join(", ")
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { program: segment } = await params
  const program = await loadProgram(segment)
  if (!program) return { title: "Program not found", robots: { index: false, follow: false } }

  const index = isIndexableAuProgramId(program.id) && program.officialUrlStatus === "verified"
  return {
    title: `${program.title} · ${program.institutionName}`,
    description: [program.courseType, program.institutionName, programLocationSummary(program)]
      .filter(Boolean)
      .join(" · "),
    alternates: { canonical: `${BASE_URL}${programDetailPath(program.id, program.title)}` },
    robots: { index, follow: true },
  }
}

export default async function ProgramDetailPage({ params }: Params) {
  const { program: segment } = await params
  const program = await loadProgram(segment)
  if (!program) notFound()

  const canonicalPath = programDetailPath(program.id, program.title)
  const canonicalSegment = canonicalPath.split("/").pop()
  if (segment !== canonicalSegment) permanentRedirect(canonicalPath)

  const facts = programFactsByKey(program.facts)
  const location = programLocationSummary(program)
  const campus = programFactValue(facts.get("campus"))
  const duration = programFactValue(facts.get("duration")) ?? formatProgramDuration(program.durationYears)
  const tuition = programFactValue(facts.get("annual_tuition_aud")) ?? formatProgramMoney(program.tuitionFeeAud)
  const officialUrl = safeProgramUrl(program.officialCourseUrl)
  const cricosUrl = safeProgramUrl(program.cricosUrl)
  const institutionUrl = safeProgramUrl(program.institutionWebsite)
  const institutionProfilePath = program.institutionSlug
    ? institutionDetailPath("AU", program.institutionSlug)
    : null
  const verified = program.officialUrlStatus === "verified"
  const locationsVerified = program.deliveryLocations.length > 0

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/programs" prefetch={false} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#6f6d68] hover:text-[#3e7a2e]">
        <ArrowLeft className="size-3.5" /> Back to Australian programs
      </Link>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <main className="min-w-0">
          <header className="rounded-2xl border border-[#dfe6dc] bg-gradient-to-br from-[#f4f8f2] via-white to-[#eef4ff] p-6 sm:p-8">
            <div className="flex flex-wrap gap-2 text-[10.5px] font-semibold">
              {program.courseType && <span className="rounded-full bg-white px-3 py-1">{program.courseType}</span>}
              <span className="inline-flex items-center gap-1 rounded-full bg-[#eef4ff] px-3 py-1 text-[#2563eb]"><ShieldCheck className="size-3" />Active CRICOS</span>
              {verified && <span className="rounded-full bg-[#3e7a2e] px-3 py-1 text-white">Official page verified</span>}
              {locationsVerified && <span className="rounded-full bg-[#eaf1ff] px-3 py-1 text-[#2563eb]">Delivery locations verified</span>}
            </div>
            <h1 className="mt-5 text-[28px] font-semibold leading-tight tracking-[-0.03em] text-[#1b1b1b] sm:text-[36px]">{program.title}</h1>
            {institutionProfilePath ? (
              <Link href={institutionProfilePath} prefetch={false} className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#4f4d48] transition hover:text-[#3e7a2e] hover:underline">
                <Building2 className="size-4" />{program.institutionName}
              </Link>
            ) : (
              <p className="mt-3 text-[14px] font-semibold text-[#4f4d48]">{program.institutionName}</p>
            )}
            {location && <p className="mt-2 flex items-center gap-2 text-[12.5px] text-[#6f6d68]"><MapPin className="size-4" />{location}</p>}
            {program.fieldName && <p className="mt-5 hidden text-[13px] leading-6 text-[#65625c] sm:block">{program.fieldName}</p>}
          </header>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <ProgramDetailMetric icon={<GraduationCap className="size-4" />} label="Study level" value={program.courseType ?? `AQF level ${program.aqfLevel ?? "—"}`} />
            <ProgramDetailMetric icon={<Clock3 className="size-4" />} label="Duration" value={duration ?? "Not published"} />
            <ProgramDetailMetric icon={<WalletCards className="size-4" />} label="Annual tuition" value={tuition ?? "Not published"} />
            <ProgramDetailMetric icon={<MapPin className="size-4" />} label="Location" value={locationsVerified ? `${program.deliveryLocations.length} registered ${program.deliveryLocations.length === 1 ? "location" : "locations"}` : campus ?? location ?? "Not published"} />
          </div>

          {locationsVerified && (
            <section className="mt-5 rounded-xl border border-[#d9e3f7] bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <MapPin className="size-4 text-[#2563eb]" />
                <h2 className="text-[14.5px] font-semibold text-[#1b1b1b]">Registered delivery locations</h2>
                <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[10px] font-semibold text-[#2563eb]">Official CRICOS</span>
              </div>
              <p className="mt-2 text-[11.5px] leading-5 text-[#6f6d68]">
                These locations come from the Australian Government CRICOS Course Locations register, not the institution&apos;s representative city.
              </p>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {program.deliveryLocations.map((item, index) => {
                  const address = [item.locality, item.state, item.postcode].filter(Boolean).join(" ")
                  const cityHref = item.citySlug && CITY_PROFILE_SLUGS.has(item.citySlug) ? `/cities/au/${item.citySlug}` : null
                  const cityLabel = item.canonicalCity ?? (item.citySlug ? item.citySlug.charAt(0).toUpperCase() + item.citySlug.slice(1) : null)
                  const body = (
                    <>
                      <p className="text-[12px] font-semibold leading-5 text-[#1b1b1b]">{item.locationName}</p>
                      {address && <p className="mt-1 text-[10.5px] text-[#6f6d68]">{address}</p>}
                      {cityHref && <p className="mt-2 text-[10px] font-semibold text-[#2563eb]">Greater {cityLabel} · open city profile →</p>}
                    </>
                  )
                  return cityHref ? (
                    <Link key={item.campusId ?? `${item.locationName}-${index}`} href={cityHref} prefetch={false} className="rounded-lg border border-[#dbe5f7] bg-[#f8faff] p-3.5 transition hover:border-[#9db7e8] hover:bg-white">{body}</Link>
                  ) : (
                    <div key={item.campusId ?? `${item.locationName}-${index}`} className="rounded-lg border border-[#eeece8] bg-[#fafaf8] p-3.5">{body}</div>
                  )
                })}
              </div>
              {program.locationSourceLastModified && (
                <p className="mt-3 text-[10px] text-[#6f6d68]">CRICOS location dataset updated {new Date(program.locationSourceLastModified).toLocaleDateString("en-AU")}</p>
              )}
            </section>
          )}

          <div className="mt-5 grid gap-3">
            <ProgramFactSection icon={<BookOpenCheck className="size-4" />} title="Entry requirements" fact={facts.get("entry_requirements")} />
            <ProgramFactSection icon={<Languages className="size-4" />} title="English requirement" fact={facts.get("english_requirement")} />
            <ProgramFactSection icon={<CalendarDays className="size-4" />} title="Intakes" fact={facts.get("intakes")} />
            <ProgramFactSection icon={<CalendarDays className="size-4" />} title="Application deadline" fact={facts.get("application_deadline")} />
          </div>

          {program.facts.length === 0 && (
            <section className="mt-5 rounded-xl border border-dashed border-[#dcdad4] bg-[#fbfbf9] p-5">
              <h2 className="text-[14px] font-semibold">Detailed admission facts are under review</h2>
            <p className="mt-2 text-[12.5px] leading-5 text-[#6f6d68]">The active CRICOS record and registered delivery locations are available now. Entry requirements and intakes appear after the institution page is verified.</p>
            </section>
          )}
        </main>

        <aside className="rounded-2xl border border-[#e7e6e3] bg-white p-5 lg:sticky lg:top-20">
          <h2 className="text-[14px] font-semibold">At a glance</h2>
          <dl className="mt-4 space-y-3 text-[11.5px]">
            <div className="flex justify-between gap-4"><dt className="text-[#6f6d68]">Provider code</dt><dd className="font-semibold">{program.cricosCode ?? "—"}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-[#6f6d68]">CRICOS course</dt><dd className="font-semibold">{program.courseCode ?? "—"}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-[#6f6d68]">AQF level</dt><dd className="font-semibold">{program.aqfLevel ?? "—"}</dd></div>
          </dl>
          <div className="mt-5 space-y-2">
            {institutionProfilePath && (
              <Link href={institutionProfilePath} prefetch={false} className="flex items-center justify-center gap-2 rounded-lg border border-[#cfd9ca] bg-[#f7faf5] px-4 py-2.5 text-[12px] font-semibold text-[#3e7a2e] transition hover:bg-[#edf5ea]">
                Institution profile<Building2 className="size-3.5" />
              </Link>
            )}
            {officialUrl && <SourceLink href={officialUrl} primary>{verified ? "Official program page" : "Provider page · unverified"}</SourceLink>}
            {cricosUrl && <SourceLink href={cricosUrl}>View CRICOS record</SourceLink>}
            {institutionUrl && <SourceLink href={institutionUrl}>Institution website</SourceLink>}
          </div>
          <p className="mt-4 text-[10.5px] leading-5 text-[#6f6d68]">Fees and admission requirements can change. Confirm current information with the institution before applying.</p>
        </aside>
      </div>
    </div>
  )
}

function SourceLink({ href, primary = false, children }: { href: string; primary?: boolean; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={primary ? "flex items-center justify-center gap-2 rounded-lg bg-[#3e7a2e] px-4 py-2.5 text-[12px] font-semibold text-white" : "flex items-center justify-center gap-2 rounded-lg border border-[#cfd9ca] px-4 py-2.5 text-[12px] font-semibold text-[#3e7a2e]"}>
      {children}<ArrowUpRight className="size-3.5" />
    </a>
  )
}
