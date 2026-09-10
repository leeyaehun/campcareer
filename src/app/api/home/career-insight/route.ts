import { NextRequest, NextResponse } from "next/server"
import { getPublicCareerProfile } from "@/lib/career-data-foundation/public-career-profile-read"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const country = (request.nextUrl.searchParams.get("country") ?? "").trim().toUpperCase()
  const career = (request.nextUrl.searchParams.get("career") ?? "").trim()

  if ((!/^[A-Z]{2}$/.test(country) && country !== "NOT-SURE") || !career) {
    return NextResponse.json({ error: "A country choice and occupation are required." }, { status: 400 })
  }

  try {
    const profile = await getPublicCareerProfile(country, career)
    if (!profile) return NextResponse.json({ error: "This career could not be found." }, { status: 404 })
    return NextResponse.json(profile)
  } catch (error) {
    console.error("[career-profile] read failed", error)
    return NextResponse.json({ error: "Career profile could not be loaded." }, { status: 500 })
  }
}
