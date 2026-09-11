import Link from "next/link"
import {
  ArrowUpRight,
  Building2,
  ExternalLink,
  GraduationCap,
  Landmark,
  MapPin,
} from "lucide-react"
import { InstitutionLogo } from "@/components/institution-logo"
import { getLaunchCountry } from "@/data/launch-countries"
import { auCityPath } from "@/lib/cities/city-routes"
import {
  institutionCountryPath,
} from "@/lib/institutions/institution-search"
import { programDetailPath } from "@/lib/programs/program-search"
import type {
  InstitutionCampusLocation,
  InstitutionCountBreakdown,
  InstitutionDetail,
  InstitutionProgrammePreview,
} from "@/lib/institutions/institution-detail.server"

function verifiedKindLabel(kind: string | null) {
  switch (kind) {
    case "university":
      return "University"
    case "college":
      return "College"
    case "polytechnic":
      return "Polytechnic"
    case "tafe_vet":
      return "TAFE / VET"
    case "other":
      return "Other"
    default:
      return null
  }
}

function ownershipLabel(ownership: string | null) {
  switch (ownership) {
    case "public":
      return "Public"
    case "private":
      return "Private"
    case "private_nonprofit":
      return "Private nonprofit"
    case "private_forprofit":
      return "Private for-profit"
    default:
      return null
  }
}

function safeWebsiteUrl(value: string | null) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null
  } catch {
    return null
  }
}

function cleanStudyAreaLabel(value: string) {
  return value.replace(/\.\s*$/, "")
}

function campusLocationLabel(campus: InstitutionCampusLocation) {
  const city = campus.city ?? campus.reportedCity
  const parts = [city, campus.region].filter(Boolean)
  return parts.length ? parts.join(", ") : "Location not published"
}

function campusAddress(campus: InstitutionCampusLocation) {
  return [campus.address, campus.postalCode].filter(Boolean).join(" ")
}

function BreakdownList({
  items,
  emptyMessage,
}: {
  items: InstitutionCountBreakdown[]
  emptyMessage: string
}) {
  if (items.length === 0) {
    return <p className="text-[12px] leading-5 text-[#6f6d68]">{emptyMessage}</p>
  }

  return (
    <div className="divide-y divide-[#efeee9]">
      {items.map((item) => (
        <div key={item.name} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
          <p className="text-[12.5px] leading-5 text-[#4d4c48]">{cleanStudyAreaLabel(item.name)}</p>
          <span className="shrink-0 rounded-full bg-[#f4f4f1] px-2.5 py-1 text-[10.5px] font-semibold text-[#6f6d68]">
            {item.count.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

function CampusList({
  campuses,
  total,
  countryCode,
}: {
  campuses: InstitutionCampusLocation[]
  total: number
  countryCode: InstitutionDetail["countryCode"]
}) {
  const isUk = countryCode === "UK"

  if (campuses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#dcdad4] bg-[#fbfbf9] p-6">
        <p className="text-[12px] text-[#77746e]">
          {isUk
            ? "No location records are currently published for this institution."
            : "No campus records are currently published for this institution."}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {campuses.map((campus) => {
          const officialUrl = safeWebsiteUrl(campus.officialUrl)
          const address = campusAddress(campus)
          const cityHref = countryCode === "AU" ? auCityPath(campus.citySlug) : null
          const location = campusLocationLabel(campus)

          return (
            <article key={campus.id} className="rounded-xl border border-[#e7e6e3] bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f2f5ef] text-[#3e7a2e]">
                  <MapPin className="size-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[13px] font-semibold leading-5 text-[#1b1b1b]">
                    {campus.name ?? (isUk ? "Location" : "Campus")}
                  </h3>
                  {cityHref ? (
                    <Link
                      href={cityHref}
                      className="mt-1 inline-flex items-center gap-1 text-[11.5px] font-semibold leading-5 text-[#2563eb] hover:underline"
                    >
                      {location}
                      <ArrowUpRight className="size-3" />
                    </Link>
                  ) : (
                    <p className="mt-1 text-[11.5px] leading-5 text-[#6f6d68]">{location}</p>
                  )}
                  {address ? (
                    <p className="mt-1 text-[10.5px] leading-4 text-[#6f6d68]">{address}</p>
                  ) : null}
                  {officialUrl ? (
                    <a
                      href={officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#3e7a2e] hover:underline"
                    >
                      {isUk ? "Official location page" : "Campus website"}
                      <ExternalLink className="size-3" />
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          )
        })}
      </div>
      {total > campuses.length ? (
        <p className="mt-3 text-[10.5px] text-[#6f6d68]">
          Showing {campuses.length} of {total.toLocaleString()} current {isUk ? "location" : "campus"} records.
        </p>
      ) : null}
    </>
  )
}

function ProgramPreviewContent({ program }: { program: InstitutionProgrammePreview }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        {program.programmeType ? (
          <span className="rounded-md bg-[#f4f4f1] px-2 py-1 text-[9.5px] font-semibold uppercase tracking-wide text-[#6f6d68]">
            {program.programmeType}
          </span>
        ) : null}
      </div>
      <h3 className="mt-2 text-[13px] font-semibold leading-5 text-[#1b1b1b]">
        {program.title}
      </h3>
      {program.fieldName ? (
        <p className="mt-1 line-clamp-2 text-[11px] leading-4.5 text-[#6f6d68]">
          {cleanStudyAreaLabel(program.fieldName)}
        </p>
      ) : null}
    </>
  )
}

function ProgramList({
  programs,
  total,
  countryCode,
}: {
  programs: InstitutionProgrammePreview[]
  total: number
  countryCode: InstitutionDetail["countryCode"]
}) {
  if (programs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#dcdad4] bg-[#fbfbf9] p-6">
        <p className="text-[12px] text-[#6f6d68]">No active program records are currently published for this institution.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {programs.map((program) => {
          const href = countryCode === "AU" && program.legacyProgramId
            ? programDetailPath(program.legacyProgramId, program.title)
            : null

          if (href) {
            return (
              <Link
                key={program.id}
                href={href}
                className="group rounded-xl border border-[#e7e6e3] bg-white p-4 transition hover:border-[#bfcdb9] hover:shadow-sm"
              >
                <ProgramPreviewContent program={program} />
                <span className="mt-3 inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#3e7a2e]">
                  View program
                  <ArrowUpRight className="size-3" />
                </span>
              </Link>
            )
          }

          return (
            <article key={program.id} className="rounded-xl border border-[#e7e6e3] bg-[#fbfbf9] p-4">
              <ProgramPreviewContent program={program} />
              <p className="mt-3 text-[10px] font-medium text-[#6f6d68]">
                Program detail page not yet published
              </p>
            </article>
          )
        })}
      </div>
      {total > programs.length ? (
        <p className="mt-3 text-[10.5px] text-[#6f6d68]">
          Showing {programs.length} of {total.toLocaleString()} active programs.
        </p>
      ) : null}
    </>
  )
}

export function InstitutionDetailView({
  institution,
}: {
  institution: InstitutionDetail
}) {
  const country = getLaunchCountry(institution.countryCode)
  const kind = verifiedKindLabel(institution.institutionKind)
  const ownership = ownershipLabel(institution.ownershipType)
  const website = safeWebsiteUrl(institution.websiteUrl)
  const cricosSource = safeWebsiteUrl(institution.cricosSourceUrl)
  const ukprnSource = safeWebsiteUrl(institution.ukprnSourceUrl)
  const countryPath = institutionCountryPath(institution.countryCode)
  const isUk = institution.countryCode === "UK"

  return (
    <>
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-[#6f6d68]">
        <Link href="/institutions" className="transition hover:text-[#3e7a2e]">Institutions</Link>
        <span>/</span>
        <Link href={countryPath} className="transition hover:text-[#3e7a2e]">
          {country?.name ?? institution.countryCode}
        </Link>
        <span>/</span>
        <span className="truncate text-[#5f5d58]">{institution.name}</span>
      </nav>

      <header className="mt-5 rounded-2xl border border-[#e7e6e3] bg-white p-6 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <InstitutionLogo name={institution.name} logoUrl={institution.logoUrl} size="detail" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3e7a2e]">
                {country?.name ?? institution.countryCode} institution
              </p>
              <h1 className="mt-2 max-w-3xl text-[27px] font-semibold leading-tight tracking-[-0.025em] text-[#1b1b1b] sm:text-3xl">
                {institution.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {kind ? (
                  <span className="rounded-full bg-[#edf5ea] px-3 py-1.5 text-[11px] font-semibold text-[#3e7a2e]">
                    {kind}
                  </span>
                ) : null}
                {ownership ? (
                  <span className="rounded-full border border-[#e3e2dd] px-3 py-1.5 text-[11px] font-medium text-[#686660]">
                    {ownership}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {website ? (
            <a
              href={website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#3e7a2e] px-4 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#326625]"
            >
              Official website
              <ExternalLink className="size-3.5" />
            </a>
          ) : null}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-[#fafaf8] p-4">
            <GraduationCap className="size-4 text-[#3e7a2e]" />
            <p className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-[#1b1b1b]">
              {institution.programCount.toLocaleString()}
            </p>
            <p className="mt-0.5 text-[10.5px] font-medium uppercase tracking-[0.06em] text-[#6f6d68]">Active programs</p>
          </div>
          <div className="rounded-xl bg-[#fafaf8] p-4">
            <Building2 className="size-4 text-[#3e7a2e]" />
            <p className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-[#1b1b1b]">
              {institution.campusCount.toLocaleString()}
            </p>
            <p className="mt-0.5 text-[10.5px] font-medium uppercase tracking-[0.06em] text-[#6f6d68]">
              {isUk ? "Location records" : "Campus records"}
            </p>
          </div>
          <div className="rounded-xl bg-[#fafaf8] p-4">
            <MapPin className="size-4 text-[#3e7a2e]" />
            <p className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-[#1b1b1b]">
              {institution.cityCount.toLocaleString()}
            </p>
            <p className="mt-0.5 text-[10.5px] font-medium uppercase tracking-[0.06em] text-[#6f6d68]">
              {isUk ? "Location areas" : "Normalized cities"}
            </p>
          </div>
        </div>
      </header>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.8fr)] lg:items-start">
        <main className="min-w-0 space-y-5">
          <section className="rounded-2xl border border-[#e7e6e3] bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="size-4 text-[#3e7a2e]" />
              <h2 className="text-[16px] font-semibold text-[#1b1b1b]">Programs</h2>
            </div>
            <p className="mt-1.5 text-[11.5px] leading-5 text-[#6f6d68]">
              {isUk
                ? "Active canonical program records currently connected to this institution. UK program detail pages are not yet published, so these records are shown as previews without invented links."
                : "Active canonical programs connected to this institution. Australian records link directly to the existing CampCareer program detail pages."}
            </p>
            <div className="mt-4">
              <ProgramList
                programs={institution.programs}
                total={institution.programCount}
                countryCode={institution.countryCode}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-[#e7e6e3] bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-[#3e7a2e]" />
              <h2 className="text-[16px] font-semibold text-[#1b1b1b]">
                {isUk ? "Campuses & locations" : "Campuses"}
              </h2>
            </div>
            <p className="mt-1.5 text-[11.5px] leading-5 text-[#6f6d68]">
              {isUk
                ? "Institution-official campus and study-location records are shown where normalized. Otherwise CampCareer keeps the existing city-level institution location rather than inventing a campus."
                : "Current campus records from the canonical institution catalogue. Published Australian city names link to their CampCareer city profiles."}
            </p>
            <div className="mt-4">
              <CampusList
                campuses={institution.campuses}
                total={institution.campusCount}
                countryCode={institution.countryCode}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-[#e7e6e3] bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="size-4 text-[#3e7a2e]" />
              <h2 className="text-[16px] font-semibold text-[#1b1b1b]">Program profile</h2>
            </div>
            <p className="mt-1.5 text-[11.5px] leading-5 text-[#6f6d68]">
              The largest study areas and qualification types among active canonical programs at this institution.
            </p>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6f6d68]">Study areas</h3>
                <BreakdownList items={institution.studyAreas} emptyMessage="Study-area classification is not currently published." />
              </div>
              <div>
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6f6d68]">Program types</h3>
                <BreakdownList items={institution.programmeTypes} emptyMessage="Program-type classification is not currently published." />
              </div>
            </div>
          </section>
        </main>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-[#e7e6e3] bg-white p-5">
            <div className="flex items-center gap-2">
              <Landmark className="size-4 text-[#3e7a2e]" />
              <h2 className="text-[14px] font-semibold text-[#1b1b1b]">Institution information</h2>
            </div>

            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#6f6d68]">Country</dt>
                <dd className="mt-1 text-[12.5px] font-medium text-[#4d4c48]">{country?.name ?? institution.countryCode}</dd>
              </div>
              {kind ? (
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#6f6d68]">Verified type</dt>
                  <dd className="mt-1 text-[12.5px] font-medium text-[#4d4c48]">{kind}</dd>
                </div>
              ) : null}
              {ownership ? (
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#6f6d68]">Ownership</dt>
                  <dd className="mt-1 text-[12.5px] font-medium text-[#4d4c48]">{ownership}</dd>
                </div>
              ) : null}
              {institution.cityNames.length ? (
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#6f6d68]">
                    {isUk ? "Locations" : "Cities"}
                  </dt>
                  <dd className="mt-1 text-[12px] leading-5 text-[#4d4c48]">{institution.cityNames.join(", ")}</dd>
                </div>
              ) : null}
              {isUk && institution.ukprn ? (
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#6f6d68]">UKPRN</dt>
                  <dd className="mt-1 flex items-center gap-2 text-[12.5px] font-semibold text-[#4d4c48]">
                    {institution.ukprn}
                    {ukprnSource ? (
                      <a
                        href={ukprnSource}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Open UKPRN provider source"
                        className="text-[#3e7a2e]"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    ) : null}
                  </dd>
                </div>
              ) : null}
              {institution.cricosProviderCode ? (
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#6f6d68]">CRICOS provider code</dt>
                  <dd className="mt-1 flex items-center gap-2 text-[12.5px] font-semibold text-[#4d4c48]">
                    {institution.cricosProviderCode}
                    {cricosSource ? (
                      <a
                        href={cricosSource}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Open CRICOS provider source"
                        className="text-[#3e7a2e]"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    ) : null}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="rounded-2xl border border-[#e7e6e3] bg-[#fbfbf9] p-5">
            <h2 className="text-[12.5px] font-semibold text-[#4d4c48]">About this profile</h2>
            <p className="mt-2 text-[10.5px] leading-5 text-[#6f6d68]">
              CampCareer shows only source-backed institution identity fields. Missing type, ownership or location details stay unpublished rather than being inferred.
            </p>
          </section>
        </aside>
      </div>
    </>
  )
}
