import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getIrelandEmploymentEcosystem, getIrelandEmployerBySlug } from "@/lib/employment/ireland-employment-ecosystem.server"
import { normalizeEmployerSlug } from "@/lib/employment/ireland-employer-routes"
import { IrelandEmployerDetailView } from "../../../../employers/ireland-employer-detail"

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ employerSlug: string }> }): Promise<Metadata> {
  const { employerSlug } = await params
  const slug = normalizeEmployerSlug(employerSlug)
  const employer = slug ? await getIrelandEmployerBySlug(slug) : null
  if (!employer) return { robots: { index: false, follow: true } }

  return {
    title: `${employer.name} — Employers in Ireland`,
    description: `${employer.descriptor}. Verified Ireland presence context from official sources. CampCareer shows verified employer context, not live hiring, salary or sponsorship information.`,
    robots: { index: false, follow: true },
  }
}

export default async function IrelandEmployerDetailPage({ params }: {
  params: Promise<{ employerSlug: string }>
}) {
  const { employerSlug } = await params
  const slug = normalizeEmployerSlug(employerSlug)
  const employer = slug ? await getIrelandEmployerBySlug(slug) : null
  if (!employer) notFound()

  const ecosystem = await getIrelandEmploymentEcosystem()
  return <IrelandEmployerDetailView employer={employer} ecosystem={ecosystem} />
}