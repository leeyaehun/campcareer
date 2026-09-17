import "server-only"

import { unstable_cache } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase-admin"
import {
  INSTITUTION_MVP_COUNTRIES,
  institutionExplorerViewName,
  type InstitutionMvpCountryCode,
} from "@/lib/institutions/institution-search"

export type InstitutionSearchIndexEntry = {
  id: string
  slug: string
  countryCode: InstitutionMvpCountryCode
  name: string
}

type InstitutionIndexRow = {
  institution_id: string
  slug: string
  country_code: string
  canonical_name: string
}

const INSTITUTIONS_PER_COUNTRY = 80

async function loadInstitutionSearchIndex(): Promise<InstitutionSearchIndexEntry[]> {
  const loaded = await Promise.all(
    INSTITUTION_MVP_COUNTRIES.map(async (countryCode) => {
      const query = supabaseAdmin
        .from(institutionExplorerViewName(countryCode))
        .select("institution_id,slug,country_code,canonical_name")
        .eq("country_code", countryCode)
        .order("program_count", { ascending: false })
        .limit(INSTITUTIONS_PER_COUNTRY)

      const { data, error } = await query
      if (error) {
        return []
      }

      const rows = (data ?? []) as unknown as InstitutionIndexRow[]
      return rows
        .filter((row) => row.slug && row.canonical_name)
        .map((row) => ({
          id: row.institution_id,
          slug: row.slug,
          countryCode,
          name: row.canonical_name,
        }))
    }),
  )

  return loaded.flat()
}

const getCachedInstitutionSearchIndex = unstable_cache(
  loadInstitutionSearchIndex,
  ["quick-search-institution-index-v1"],
  { revalidate: 3600, tags: ["quick-search-institution-index"] },
)

export async function getInstitutionSearchIndex() {
  return getCachedInstitutionSearchIndex()
}