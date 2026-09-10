"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Bookmark, Check, Scale } from "lucide-react"
import { localizePath } from "@/lib/i18n/config"
import { createClient } from "@/lib/supabase-client"
import type { OverviewSearchValues } from "../home/home-overview-config"
import { buildCareerResultHref, getCareerResultCompareHref } from "./career-result-context"
import { Skeleton } from "@/components/ui/skeleton"

type Locale = "en" | "ko"
type AuthState = "loading" | "signed-out" | "signed-in"

export function CareerResultActions({ query, locale }: { query: OverviewSearchValues; locale: Locale }) {
  const supabase = useMemo(() => createClient(), [])
  const [authState, setAuthState] = useState<AuthState>("loading")
  const [userId, setUserId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [saveBusy, setSaveBusy] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const compareHref = getCareerResultCompareHref(query)
  const resultHref = localizePath(buildCareerResultHref(query), locale)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("saveError") !== "1") return

    setSaveError(true)
    params.delete("saveError")
    const queryString = params.toString()
    const cleanUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash}`
    window.history.replaceState(null, "", cleanUrl)
  }, [])

  useEffect(() => {
    let active = true
    void supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!active) return
      if (!user) {
        setAuthState("signed-out")
        setUserId(null)
        return
      }

      setAuthState("signed-in")
      setUserId(user.id)
      const { data } = await supabase
        .from("saved_career_results")
        .select("id")
        .eq("user_id", user.id)
        .eq("country_code", query.country.toUpperCase())
        .eq("career_id", query.occupation)
        .maybeSingle()

      if (active) setSaved(Boolean(data))
    })
    return () => { active = false }
  }, [query.country, query.occupation, supabase])

  async function toggleSaved() {
    if (!userId || saveBusy) return
    setSaveBusy(true)
    setSaveError(false)

    const countryCode = query.country.toUpperCase()
    const request = saved
      ? supabase
          .from("saved_career_results")
          .delete()
          .eq("user_id", userId)
          .eq("country_code", countryCode)
          .eq("career_id", query.occupation)
      : supabase
          .from("saved_career_results")
          .upsert(
            { user_id: userId, country_code: countryCode, career_id: query.occupation, updated_at: new Date().toISOString() },
            { onConflict: "user_id,country_code,career_id", ignoreDuplicates: false },
          )

    const { error } = await request
    setSaveBusy(false)
    if (error) {
      setSaveError(true)
      return
    }
    setSaved((current) => !current)
  }

  if (authState === "loading") {
    return <Skeleton className="mt-5 h-10 w-44" />
  }

  const saveIntentHref = `${resultHref}${resultHref.includes("?") ? "&" : "?"}save=1`
  const signedOutSaveHref = `${localizePath("/login", locale)}?next=${encodeURIComponent(saveIntentHref)}`

  return (
    <div className="mt-6 border-t border-campcareer-border pt-5" aria-label={locale === "ko" ? "보조 작업" : "Secondary career actions"}>
      <div className="flex flex-wrap items-center gap-2">
        {authState === "signed-out" ? (
          <Link href={signedOutSaveHref} className="inline-flex min-h-10 items-center gap-2 rounded-cc-control border border-campcareer-border bg-campcareer-surface px-3.5 text-sm font-semibold text-campcareer-ink-secondary shadow-cc-surface transition-colors duration-cc-fast hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
            <Bookmark className="size-4" /> {locale === "ko" ? "저장" : "Save"}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => void toggleSaved()}
            disabled={saveBusy}
            aria-pressed={saved}
            className="inline-flex min-h-10 items-center gap-2 rounded-cc-control border border-campcareer-border bg-campcareer-surface px-3.5 text-sm font-semibold text-campcareer-ink-secondary shadow-cc-surface transition-colors duration-cc-fast hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-wait disabled:opacity-60"
          >
            {saved ? <Check className="size-4 text-campcareer-success" /> : <Bookmark className="size-4" />}
            {locale === "ko" ? (saved ? "저장됨" : "저장") : (saved ? "Saved" : "Save")}
          </button>
        )}

        {compareHref ? (
          <Link href={localizePath(compareHref, locale)} className="inline-flex min-h-10 items-center gap-2 rounded-cc-control border border-campcareer-border bg-campcareer-surface px-3.5 text-sm font-semibold text-campcareer-ink-secondary shadow-cc-surface transition-colors duration-cc-fast hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
            <Scale className="size-4" /> {locale === "ko" ? "비교" : "Compare"}
          </Link>
        ) : null}
      </div>
      {saveError ? (
        <p className="mt-2 text-xs font-medium text-rose-700" role="status">
          {locale === "ko" ? "저장하지 못했습니다. 다시 시도해 주세요." : "Could not save this career. Please try again."}
        </p>
      ) : null}
    </div>
  )
}
