"use client"

import { useEffect, useState } from "react"
import { institutionInitials } from "@/lib/programs/institution-brand"

const WRAPPER_SIZES = {
  sm: "size-9 rounded-lg",
  md: "size-11 rounded-xl",
  lg: "size-16 rounded-2xl",
} as const

const MARK_SIZES = {
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-base",
} as const

const IMAGE_SIZES = {
  sm: "size-5",
  md: "size-7",
  lg: "size-10",
} as const

type EntityLogoSize = keyof typeof WRAPPER_SIZES

/**
 * Consistent entity mark for institutions and employers.
 *
 * Only first-party logo assets render (Phase-5 security gate): a third-party
 * domain could set browser state before a visitor deliberately opens the source.
 * The consistent brand-tinted monogram mark is the fallback, so identity is
 * recognised even when no approved logo asset exists yet.
 */
export function EntityLogo({
  name,
  logoUrl,
  size = "md",
}: {
  name: string
  logoUrl?: string | null
  size?: EntityLogoSize
}) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [logoUrl])

  const showLogo =
    Boolean(
      logoUrl && (logoUrl.startsWith("/") || logoUrl.startsWith("https://www.campcareer.com/")),
    ) && !failed

  return (
    <span
      className={`grid ${WRAPPER_SIZES[size]} shrink-0 place-items-center overflow-hidden ${
        showLogo
          ? "border border-campcareer-border bg-campcareer-surface"
          : "bg-brand-tint text-brand"
      }`}
      aria-hidden="true"
      data-entity-mark={showLogo ? "logo" : "initial"}
    >
      {showLogo ? (
        // First-party asset on this origin; Next/Image remote allow-lists do not apply.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl ?? undefined}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className={`${IMAGE_SIZES[size]} object-contain`}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={`${MARK_SIZES[size]} font-bold uppercase tracking-[0.06em]`}>
          {institutionInitials(name) || "CC"}
        </span>
      )}
    </span>
  )
}