"use client"

import { useEffect } from "react"
import { ArrowRight } from "lucide-react"
import { useTranslations } from "@/lib/i18n/use-translations"
import { WISE, AIRALO, partnerExitPath, type Partner } from "@/lib/partners"
import { track } from "@/lib/analytics"

// 제휴 클릭을 GA4 이벤트로 집계 (gtag 는 layout.tsx 에서 로드됨).
function trackAffiliateClick(partnerId: string) {
  track("affiliate_click", { partner: partnerId })
}

// Wise 마크 — 공식 브랜드 SVG
function WiseLogo({ size = 28 }: { size?: number }) {
  return (
    <img
      src="/logos/wise-icon.svg"
      alt="Wise"
      width={size}
      height={size}
      className="shrink-0"
    />
  )
}

// 범용 제휴 CTA 카드 — 로고 + 한 줄 가치제안 + 제휴 버튼.
// rel="sponsored" + 제휴 고지로 affiliate 위생을 지킨다.
export function PartnerCta({
  partner,
  logo,
  title,
  description,
  cta,
}: {
  partner: Partner
  logo: React.ReactNode
  title: string
  description: string
  cta: string
}) {
  const t = useTranslations()
  useEffect(() => {
    track("affiliate_offer_view", { partner: partner.id })
  }, [partner.id])

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2">
        {logo}
        <span className="text-sm font-semibold text-slate-900">{partner.name}</span>
        <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-slate-400">
          {t.map.affiliateNote}
        </span>
      </div>
      <p className="mt-2.5 text-sm font-semibold text-slate-800 leading-snug">{title}</p>
      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>
      <a
        href={partnerExitPath(partner)}
        target="_blank"
        rel="sponsored noopener noreferrer"
        onClick={() => trackAffiliateClick(partner.id)}
        className="mt-3 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
        style={{ backgroundColor: partner.accent, color: partner.accentText }}
      >
        {cta}
        <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  )
}

// Wise 전용 래퍼 — 카드에서는 <WiseCta /> 한 줄로 끝낸다.
export function WiseCta() {
  const t = useTranslations()
  return (
    <PartnerCta
      partner={WISE}
      logo={<WiseLogo />}
      title={t.map.wiseCtaTitle}
      description={t.map.wiseCtaDesc}
      cta={t.map.wiseCtaButton}
    />
  )
}

function AiraloLogo({ size = 28 }: { size?: number }) {
  return (
    <img
      src="/logos/airalo-icon.svg"
      alt="Airalo"
      width={size}
      height={size}
      className="shrink-0"
    />
  )
}

export function AiraloCta() {
  const t = useTranslations()
  return (
    <PartnerCta
      partner={AIRALO}
      logo={<AiraloLogo />}
      title={t.map.airaloCtaTitle}
      description={t.map.airaloCtaDesc}
      cta={t.map.airaloCtaButton}
    />
  )
}

export function AffiliateCtas({ showWise = true }: { showWise?: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      {showWise && <WiseCta />}
      <AiraloCta />
    </div>
  )
}
