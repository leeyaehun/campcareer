"use client"

import { useEffect, useState } from "react"
import { Building2 } from "lucide-react"

export function InstitutionLogo({
  name,
  logoUrl,
  size = "card",
}: {
  name: string
  logoUrl: string | null
  size?: "card" | "detail"
}) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [logoUrl])

  // Loading an institution favicon from its source domain lets that third party
  // set browser state before a visitor has chosen to open the source. Render
  // only first-party logo assets; the neutral institution mark is the fallback.
  const showLogo = Boolean(
    logoUrl && (logoUrl.startsWith("/") || logoUrl.startsWith("https://www.campcareer.com/")),
  ) && !failed
  const wrapperSize = size === "detail" ? "size-16 rounded-2xl" : "size-11 rounded-xl"
  const imageSize = size === "detail" ? "size-11" : "size-8"
  const iconSize = size === "detail" ? "size-6" : "size-5"

  return (
    <span
      className={`grid ${wrapperSize} shrink-0 place-items-center ${
        showLogo
          ? "border border-[#e7e6e3] bg-white"
          : "bg-[#edf5ea] text-[#3e7a2e]"
      }`}
      title={showLogo ? `${name} official site mark` : undefined}
    >
      {showLogo ? (
        // Official institution domains are dynamic, so Next/Image remote host allow-lists are not practical here.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl ?? undefined}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className={`${imageSize} object-contain`}
          onError={() => setFailed(true)}
        />
      ) : (
        <Building2 className={iconSize} aria-hidden="true" />
      )}
    </span>
  )
}
