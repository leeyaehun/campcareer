import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { RootOAuthCallbackFallback } from "@/components/auth/root-oauth-callback-fallback"
import { HOME_CANONICAL_PATH } from "@/lib/seo-routes.mjs"

export const metadata: Metadata = {
  title: { absolute: "CampCareer | Career, Country, Degree & Education Decisions" },
  description: "Explore careers, country context, degrees and education providers with evidence-backed data.",
  alternates: { canonical: HOME_CANONICAL_PATH },
  robots: { index: true, follow: true },
}

const destinations = [
  {
    href: "/careers",
    title: "Careers",
    description: "Explore career outcomes, demand, pay, and pathways.",
  },
  {
    href: "/countries",
    title: "Countries",
    description: "Compare where studying and working could take you.",
  },
  {
    href: "/programs",
    title: "Degrees",
    description: "Explore programs and qualifications connected to career outcomes.",
  },
  {
    href: "/institutions",
    title: "Education",
    description: "Explore institutions and the programs they provide.",
  },
] as const

export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <RootOAuthCallbackFallback />
      </Suspense>

      <main className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 sm:py-24">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">CampCareer</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[hsl(var(--cc-ink))] sm:text-6xl">
            From campus to career, with evidence.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[hsl(var(--cc-muted))]">
            Start with a career, then explore the country context, degree options, and education providers that support the path.
          </p>
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-2" aria-label="Explore CampCareer">
          {destinations.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-[hsl(var(--cc-border))] bg-white p-6 transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-sm"
            >
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-[hsl(var(--cc-ink))]">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--cc-muted))]">{item.description}</p>
            </Link>
          ))}
        </section>
      </main>
    </>
  )
}
