import {
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  MapPinned,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react"
import type { CampCareerScore, CampCareerVerdict } from "@/lib/campcareer-score"
import type { CanonicalCareer } from "@/data/career-comparison-catalog"
import { AU_VOCATIONAL_PROGRAM_SHORTLIST } from "@/data/au-vocational-program-shortlist"
import { getLaunchCountry } from "@/data/launch-countries"
import { getOccupationEditorial } from "@/data/occupation-editorial"
import { AUSTRALIA_NURSING_PROGRAMS } from "@/data/programs/australia-nursing"
import type { CountryOccupationProfile } from "@/lib/workspace/country-occupation-contract"
import { Score } from "@/components/ui/data-display"

const compact = (value: number | null) =>
  value == null
    ? "—"
    : new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)

const number = (value: number | null) =>
  value == null ? "—" : new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)

const percent = (value: number | null) =>
  value == null ? "—" : `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value)}%`

const money = (currency: string, value: number | null) =>
  value == null
    ? "—"
    : new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(value)

const VERDICT_LABEL: Record<CampCareerVerdict, string> = {
  excellent: "Excellent",
  strong: "Strong",
  mixed: "Mixed",
  challenging: "Challenging",
  tough: "Tough",
}

function MetricCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint: string
}) {
  return (
    <article className="rounded-cc-surface border border-campcareer-border bg-campcareer-surface p-4 shadow-cc-surface">
      <div className="flex items-center gap-2 text-brand">
        {icon}
        <p className="text-xs font-semibold tracking-[0.08em] text-campcareer-muted">
          {label}
        </p>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.025em] tabular-nums text-campcareer-ink">{value}</p>
      <p className="mt-1.5 text-xs leading-5 text-campcareer-muted">{hint}</p>
    </article>
  )
}

function CampCareerScorePanel({ score }: { score: CampCareerScore | null }) {
  if (!score) {
    return (
      <section className="rounded-cc-large border border-campcareer-border bg-campcareer-surface p-6 shadow-cc-surface">
        <p className="text-xs font-semibold tracking-[0.08em] text-brand">CampCareer Score</p>
        <h3 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-campcareer-ink">Score not ready yet</h3>
        <p className="mt-2 max-w-2xl text-xs leading-5 text-campcareer-muted">
          Demand, Pay and Entry all need usable evidence before CampCareer publishes a total. Missing evidence is not replaced with an average.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-cc-large border border-campcareer-border bg-campcareer-surface p-6 shadow-cc-surface">
      <Score total={score.total} verdict={VERDICT_LABEL[score.verdict]} dimensions={[{ label: "Demand", value: score.demand }, { label: "Pay", value: score.pay }, { label: "Entry", value: score.entry }]} />
      <p className="mt-4 text-xs leading-5 text-campcareer-muted">
        Visa and personal eligibility are handled in the pathway, not in the public score. The historical nine-factor model remains internal evidence only.
      </p>
    </section>
  )
}

type ProgramCard = {
  id: string
  title: string
  provider: string
  url: string
  meta: string
  note?: string
}

function getProgramCards(profile: CountryOccupationProfile): ProgramCard[] {
  if (profile.countryCode !== "AU") return []

  const programRefs = new Set(profile.programLinks.map((link) => link.programRef))
  const canonicalCards: ProgramCard[] = profile.programLinks.flatMap((link) => {
    const program = link.program
    if (!program?.url) return []

    const duration =
      program.durationYears == null
        ? "Duration —"
        : `${program.durationYears} ${program.durationYears === 1 ? "year" : "years"}`
    const relationNote =
      link.relationType === "graduate_entry"
        ? "Graduate-entry pathway"
        : link.relationType === "progression"
          ? "Progression pathway"
          : link.relationType === "related"
            ? "Related study option"
            : "Direct entry-to-practice pathway"

    return [
      {
        id: link.programRef,
        title: program.title,
        provider: program.provider,
        url: program.url,
        meta: `${duration} · ${money("AUD", program.tuitionFeeAud)} annual tuition`,
        note: relationNote,
      },
    ]
  })

  const nursingCards: ProgramCard[] = AUSTRALIA_NURSING_PROGRAMS.filter((program) =>
    programRefs.has(program.id)
  ).map((program) => ({
    id: program.id,
    title: program.programName,
    provider: program.institutionName,
    url: program.source.url,
    meta: `${program.durationLabel} · ${program.tuitionLabel}`,
    note: program.registrationOutcome,
  }))

  const vocationalCards: ProgramCard[] = AU_VOCATIONAL_PROGRAM_SHORTLIST.filter((program) =>
    programRefs.has(program.id)
  ).map((program) => {
    const fee =
      program.tuitionAmount && program.tuitionCurrency
        ? money(program.tuitionCurrency, program.tuitionAmount)
        : program.internationalEligible
          ? "Check current fee"
          : "Apprenticeship / domestic pathway"
    const duration = program.durationMonths ? `${program.durationMonths} months` : program.qualificationLevel

    return {
      id: program.id,
      title: program.title,
      provider: program.providerName,
      url: program.officialUrl,
      meta: `${duration} · ${fee}`,
      note: program.eligibilityNote,
    }
  })

  return [...canonicalCards, ...nursingCards, ...vocationalCards]
}

type ProfileLink = CountryOccupationProfile["links"][number]

function LinkList({ links, hoverClass = "hover:border-brand/40 hover:bg-brand-tint" }: { links: ProfileLink[]; hoverClass?: string }) {
  return (
    <div className="mt-4 space-y-2">
      {links.map((link) => (
        <a
          key={`${link.linkType}-${link.url}`}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className={`flex min-h-10 items-center justify-between rounded-cc-control border border-campcareer-border bg-campcareer-surface px-3.5 py-2.5 text-xs font-medium text-campcareer-ink shadow-cc-surface transition-colors duration-cc-fast ${hoverClass}`}
        >
          <span className="min-w-0 truncate">{link.label}</span>
          <ArrowUpRight className="ml-3 size-3.5 shrink-0 text-campcareer-muted" />
        </a>
      ))}
    </div>
  )
}

export function CountryOccupationDashboard({
  career,
  profile,
}: {
  career: CanonicalCareer
  profile: CountryOccupationProfile
}) {
  const editorial = getOccupationEditorial(career.id)
  const countryEditorial = editorial?.countries[profile.countryCode]
  const metric = profile.metric
  const publicScore = metric.campCareerScore
  const countryName = getLaunchCountry(profile.countryCode)?.name ?? profile.countryCode
  const jobLinks = profile.links.filter((link) => link.linkType === "job_search")
  const employers = profile.links.filter((link) => link.linkType === "employer")
  const entryLinks = profile.links.filter(
    (link) => link.linkType === "entry_program" || link.linkType === "graduate_program"
  )
  const programs = getProgramCards(profile)
  const rankedRegions = [...profile.regions].sort((first, second) => (second.vacancyCount ?? -1) - (first.vacancyCount ?? -1))

  return (
    <div className="space-y-4">
      <section className="rounded-cc-large border border-campcareer-border bg-campcareer-surface p-6 shadow-cc-surface sm:p-7">
        <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-tint px-2.5 py-1 text-xs font-semibold text-brand">
                {countryName} · {profile.officialCodeSystem} {profile.officialUnitGroupCode}
              </span>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-campcareer-ink-secondary">
                {profile.specialisations.length} official occupations
              </span>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-campcareer-ink">
              {profile.officialTitle}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-campcareer-ink-secondary">
              {countryEditorial?.headline ?? editorial?.overview}
            </p>
          </div>
          <div className="rounded-cc-surface border border-campcareer-border bg-campcareer-canvas px-5 py-4 text-center">
            <p className="text-xs font-semibold tracking-[0.08em] text-brand">CampCareer Score</p>
            {publicScore ? (
              <>
                <p className="mt-1 text-4xl font-semibold leading-none tabular-nums text-campcareer-ink">{publicScore.total}</p>
                <p className="mt-1.5 text-xs font-semibold text-campcareer-ink-secondary">{VERDICT_LABEL[publicScore.verdict]} · 100</p>
              </>
            ) : (
              <p className="mt-2 text-sm font-semibold text-campcareer-ink-secondary">Not ready</p>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<Banknote className="size-4" />}
          label="Median earnings"
          value={money(profile.currency, metric.annualisedMedianSalary)}
          hint={`${money(profile.currency, metric.medianWeeklyEarnings)} weekly · full-time non-managerial median`}
        />
        <MetricCard
          icon={<BriefcaseBusiness className="size-4" />}
          label="Online vacancies"
          value={number(metric.vacanciesThreeMonthAvg)}
          hint={`3-month average · ${metric.vacancyPeriod ?? "latest period"} · ${percent(metric.vacancyYoyPct)} year on year`}
        />
        <MetricCard
          icon={<Users className="size-4" />}
          label="Employment"
          value={compact(metric.employmentTotal)}
          hint={`${percent(metric.partTimeSharePct)} part-time · median age ${metric.medianAge ?? "—"}`}
        />
        <MetricCard
          icon={<TrendingUp className="size-4" />}
          label="Career outlook"
          value={percent(metric.employmentGrowth10yPct)}
          hint={`${percent(metric.employmentGrowth5yPct)} projected growth over five years`}
        />
      </div>

      <CampCareerScorePanel score={publicScore} />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-cc-large border border-campcareer-border bg-campcareer-surface p-6 shadow-cc-surface">
          <div className="flex items-center gap-2 text-brand">
            <GraduationCap className="size-4" />
            <h3 className="text-[15px] font-semibold">Entry pathway</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-campcareer-ink-secondary">{countryEditorial?.entryPathway}</p>
          <div className="mt-4 flex items-start gap-3 rounded-cc-surface border border-campcareer-border bg-brand-tint p-4">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
            <p className="text-xs leading-5 text-campcareer-ink-secondary">{countryEditorial?.registration}</p>
          </div>
          {programs.length > 0 && (
            <div className="mt-4 space-y-2">
              {programs.map((program) => (
                <a
                  key={program.id}
                  href={program.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-cc-surface border border-campcareer-border bg-campcareer-surface p-3.5 shadow-cc-surface transition-colors duration-cc-fast hover:border-brand/40 hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-campcareer-ink">{program.title}</p>
                      <p className="mt-0.5 text-xs text-campcareer-muted">{program.provider}</p>
                    </div>
                    <ArrowUpRight className="size-3.5 shrink-0 text-campcareer-muted" />
                  </div>
                  <p className="mt-2 text-xs text-campcareer-muted">{program.meta}</p>
                  {program.note && (
                    <p className="mt-1.5 text-xs leading-5 text-campcareer-ink-secondary">{program.note}</p>
                  )}
                </a>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-cc-large border border-campcareer-border bg-campcareer-surface p-6 shadow-cc-surface">
          <div className="flex items-center gap-2 text-brand">
            <BadgeCheck className="size-4" />
            <h3 className="text-[15px] font-semibold">Official occupations included</h3>
          </div>
          <div className="mt-4 space-y-2">
            {profile.specialisations.map((item) => (
              <div key={item.officialCode} className="rounded-cc-surface border border-campcareer-border bg-campcareer-canvas px-3.5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-campcareer-ink">{item.officialTitle}</p>
                  <span className="rounded-full bg-campcareer-surface px-2 py-0.5 text-xs font-bold text-brand">
                    {item.officialCode}
                  </span>
                </div>
                <p className="mt-1 text-xs text-campcareer-muted">
                  {item.legacyCodeSystem && item.legacyCode
                    ? `Legacy ${item.legacyCodeSystem} ${item.legacyCode} · `
                    : ""}
                  {item.visaEligible ? "visa-list eligible" : "verify visa status"}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-cc-large border border-campcareer-border bg-campcareer-surface p-6 shadow-cc-surface">
        <div className="flex items-center gap-2 text-brand">
          <MapPinned className="size-4" />
          <h3 className="text-[15px] font-semibold">State demand ranking</h3>
        </div>
        <p className="mt-1.5 text-xs leading-5 text-campcareer-muted">Ranked by published 3-month vacancies — not a personal outcome or visa ranking.</p>
        <div className="mt-4 grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2">
          {rankedRegions.map((region, index) => {
            const rank = index + 1
            return <div key={region.regionCode} className="relative rounded-cc-surface border border-campcareer-border bg-campcareer-canvas p-2.5 text-center sm:p-3">
              <span className="absolute left-2 top-1.5 text-[9px] font-bold text-campcareer-muted sm:left-2.5 sm:top-2">#{rank}</span>
              <p className="text-xs font-bold text-brand">{region.regionCode}</p>
              <p className="mt-1 text-base font-semibold tabular-nums text-campcareer-ink sm:text-lg">{number(region.vacancyCount)}</p>
              <p className="mt-0.5 text-[9px] leading-3 text-campcareer-muted sm:text-[10px] sm:leading-normal">
                3-mo vacancies · shortage {region.shortageRating ?? "—"}/3
              </p>
            </div>
          })}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-cc-large border border-campcareer-border bg-campcareer-surface p-6 shadow-cc-surface">
          <div className="flex items-center gap-2 text-brand">
            <BriefcaseBusiness className="size-4" />
            <h3 className="text-[15px] font-semibold">Jobs and entry pathways</h3>
          </div>
          {countryEditorial?.jobMarketNote && (
            <p className="mt-3 text-sm leading-5 text-campcareer-ink-secondary">{countryEditorial.jobMarketNote}</p>
          )}
          <LinkList links={[...jobLinks, ...entryLinks]} />
        </section>

        <section className="rounded-cc-large border border-campcareer-border bg-campcareer-surface p-6 shadow-cc-surface">
          <div className="flex items-center gap-2 text-brand">
            <Building2 className="size-4" />
            <h3 className="text-[15px] font-semibold">Major employers</h3>
          </div>
          <p className="mt-3 text-xs leading-5 text-campcareer-muted">
            Major organisations and employer networks with official career pages relevant to this occupation.
          </p>
          <LinkList links={employers} />
        </section>
      </div>
    </div>
  )
}
