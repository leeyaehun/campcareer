import { ArrowUpRight } from "lucide-react"
import type { AuProgramFact } from "@/lib/programs/au-programs.server"

export function safeProgramUrl(value: string | null) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

export function formatProgramMoney(value: number | null) {
  if (value == null) return null
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatProgramDuration(value: number | null) {
  if (value == null) return null
  if (value < 1) return `${Math.round(value * 12)} months`
  return `${new Intl.NumberFormat("en-AU", { maximumFractionDigits: 1 }).format(value)} ${
    value === 1 ? "year" : "years"
  }`
}

export function programFactValue(fact: AuProgramFact | undefined) {
  if (!fact) return null
  if (typeof fact.value === "string") return fact.value
  if (typeof fact.value === "number") return String(fact.value)

  if (fact.value && typeof fact.value === "object") {
    const value = fact.value as Record<string, unknown>

    if (typeof value.amountAud === "number") {
      const fee = formatProgramMoney(value.amountAud)
      const year = typeof value.year === "number" ? ` (${value.year})` : ""
      return fee ? `${fee}${year}` : null
    }

    if (Array.isArray(value.campuses)) {
      const campuses = value.campuses
        .map((campus) => {
          if (!campus || typeof campus !== "object") return null
          const item = campus as Record<string, unknown>
          const name = typeof item.name === "string" ? item.name : null
          const state = typeof item.state === "string" ? item.state : null
          return [name, state].filter(Boolean).join(", ")
        })
        .filter((campus): campus is string => Boolean(campus))

      return campuses.length > 0 ? campuses.join(" · ") : null
    }
  }

  return null
}

export function programFactsByKey(facts: AuProgramFact[]) {
  return new Map(facts.map((fact) => [fact.fieldKey, fact]))
}

export function ProgramDetailMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-[#e7e6e3] bg-white p-4">
      <div className="flex items-center gap-2 text-[#3e7a2e]">
        {icon}
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-[#6f6d68]">
          {label}
        </p>
      </div>
      <p className="mt-2 text-[14px] font-semibold leading-5 text-[#1b1b1b]">{value}</p>
    </div>
  )
}

export function ProgramFactSection({
  icon,
  title,
  fact,
}: {
  icon: React.ReactNode
  title: string
  fact: AuProgramFact | undefined
}) {
  const value = programFactValue(fact)
  if (!value) return null
  const source = safeProgramUrl(fact?.sourceUrl ?? null)

  return (
    <section className="rounded-xl border border-[#e7e6e3] bg-white p-5">
      <div className="flex items-center gap-2 text-[#3e7a2e]">
        {icon}
        <h2 className="text-[14px] font-semibold text-[#1b1b1b]">{title}</h2>
      </div>
      <p className="mt-3 text-[13px] leading-6 text-[#64615b]">{value}</p>
      {source && (
        <a
          href={source}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#3e7a2e] hover:underline"
        >
          Verified source
          <ArrowUpRight className="size-3" />
        </a>
      )}
    </section>
  )
}
