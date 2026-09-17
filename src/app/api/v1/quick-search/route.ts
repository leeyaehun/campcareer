import { NextRequest, NextResponse } from "next/server"
import { quickSearch } from "@/lib/search/quick-search-index"
import { getInstitutionSearchIndex } from "@/lib/search/institution-index.server"

export const dynamic = "force-dynamic"

const MAX_QUERY_LENGTH = 80

export async function GET(request: NextRequest) {
  const rawQuery = request.nextUrl.searchParams.get("q") ?? ""
  if (rawQuery.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ error: "Query is too long" }, { status: 400 })
  }

  const query = rawQuery.trim()
  if (query.length < 2) {
    return NextResponse.json(
      { query, countries: [], majors: [], careers: [], institutions: [] },
      { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
    )
  }

  const institutionIndex = await getInstitutionSearchIndex()
  const results = quickSearch(query, institutionIndex)

  return NextResponse.json(results, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      "X-Content-Type-Options": "nosniff",
    },
  })
}