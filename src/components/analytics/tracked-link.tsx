"use client"

import Link from "next/link"
import { trackAnalyticsEvent } from "@/lib/analytics"

export function MethodologyLink({ sourceSurface, href = "/methodology", children, className }: { sourceSurface: "sources" | "career" | "data_policy"; href?: string; children: React.ReactNode; className?: string }) {
  return <Link href={href} className={className} onClick={() => trackAnalyticsEvent({ name: "methodology_open", params: { source_surface: sourceSurface } })}>{children}</Link>
}

export function SourceLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={() => trackAnalyticsEvent({ name: "source_open", params: { source_surface: "sources" } })}>{children}</a>
}
