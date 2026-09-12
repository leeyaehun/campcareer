"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouteLocale } from "@/lib/i18n/locale-provider"
import { localizePath, type LocaleOption, withoutLocalePrefix } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"
import { PageFeedback } from "@/components/feedback/page-feedback"

export function SiteFooter({ className }: { className?: string }) {
  const locale = useRouteLocale()
  const pathname = withoutLocalePrefix(usePathname())
  const isKo = locale === "ko"
  const hasCareerPageFeedback = pathname.startsWith("/career/")

  return (
    <footer className={cn("border-t border-[hsl(var(--cc-border))] bg-white", className)}>
      {!hasCareerPageFeedback && <PageFeedback />}
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Link href={localizePath("/", locale)} prefetch={false} className="campcareer-wordmark text-[hsl(var(--cc-ink))]">campcareer</Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[hsl(var(--cc-muted))]">
              {isKo
                ? "커리어, 학업, 국가 선택을 근거 있는 데이터로 비교하세요."
                : "Compare careers, study options, and countries with evidence-backed data."}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[hsl(var(--cc-ink))]">{isKo ? "탐색" : "Explore"}</p>
            <ul className="mt-3 space-y-2.5">
              <FooterLink href="/careers" locale={locale}>{isKo ? "커리어" : "Careers"}</FooterLink>
              <FooterLink href="/countries" locale={locale}>{isKo ? "국가" : "Countries"}</FooterLink>
              <FooterLink href="/programs" locale={locale}>{isKo ? "학위" : "Degrees"}</FooterLink>
              <FooterLink href="/institutions" locale={locale}>{isKo ? "교육" : "Education"}</FooterLink>
              <FooterLink href="/compare" locale={locale}>{isKo ? "비교" : "Compare"}</FooterLink>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-[hsl(var(--cc-ink))]">{isKo ? "정보" : "Info"}</p>
            <ul className="mt-3 space-y-2.5">
              {locale === "en" && <FooterLink href="/blog" locale={locale}>Blog</FooterLink>}
              <FooterLink href="/sources" locale={locale}>{isKo ? "출처" : "Sources"}</FooterLink>
              <FooterLink href="/methodology" locale={locale}>{isKo ? "방법론" : "Methodology"}</FooterLink>
              <FooterLink href="/data-policy" locale={locale}>{isKo ? "데이터 정책" : "Data policy"}</FooterLink>
              <FooterLink href="/privacy" locale={locale}>{isKo ? "개인정보처리방침" : "Privacy policy"}</FooterLink>
              <FooterLink href="/terms" locale={locale}>{isKo ? "이용약관" : "Terms of service"}</FooterLink>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[hsl(var(--cc-border))] pt-6 text-xs text-[hsl(var(--cc-muted))] sm:flex-row">
          <span>&copy; {new Date().getFullYear()} CampCareer</span>
          <span>{isKo ? "명확한 근거. 더 나은 결정." : "Clear evidence. Better decisions."}</span>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, locale, children }: { href: string; locale: LocaleOption; children: React.ReactNode }) {
  return <li><Link href={localizePath(href, locale)} prefetch={false} className="text-sm text-[hsl(var(--cc-muted))] transition hover:text-[hsl(var(--cc-ink))]">{children}</Link></li>
}
