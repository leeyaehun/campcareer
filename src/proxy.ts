import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { DEFAULT_LOCALE, LOCALE_COOKIE, isPublishedLocaleOption, localeForUi, localeFromPathname, localizePath, withoutLocalePrefix } from '@/lib/i18n/config'
import { getLegacyLocaleHomeRedirect } from '@/lib/i18n/legacy-locale-home'
import { isLegacyGonePath } from '@/lib/seo-routes.mjs'

// Authentication protects retention/account surfaces only. Public Career value,
// including the dormant /home redirect to Career discovery, never requires login.
const PROTECTED_PATHS = ['/dashboard', '/saved', '/documents', '/profile', '/settings', '/onboarding']

// 매출에 기여하지 않는 SEO·백링크 분석 크롤러. 검색엔진(Googlebot/Bingbot/
// DuckDuckBot 등)과 소셜 미리보기 봇(Twitterbot, facebookexternalhit,
// LinkedInBot, Slackbot, Discordbot 등)은 의도적으로 제외 — 영향 없음.
const BLOCKED_BOTS_RE =
  /AhrefsBot|SemrushBot|MJ12bot|DotBot|BLEXBot|DataForSeoBot|Barkrowler|SeekportBot/i

const GONE_BODY =
  '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
  '<title>410 Gone</title><meta name="robots" content="noindex"></head>' +
  '<body><h1>410 — Gone</h1><p>This page has been permanently removed.</p>' +
  '<p><a href="/">Go to CampCareer home</a></p></body></html>'

// CampCareer already has a small set of editorial Korean routes under `/ko`.
// Do not redirect those to English counterparts: that would silently replace
// reviewed Korean copy (and its metadata) with the generic fallback.
const DEDICATED_KOREAN_ROUTE_PATTERNS = [
  /^\/ko\/(?:kr|jp|sg|fr)(?:\/jobs)?\/?$/,
  /^\/ko\/fields\/[^/]+\/?$/,
  /^\/ko\/maps\/[^/]+\/[^/]+\/?$/,
  /^\/ko\/routes(?:\/.*)?$/,
]

function isDedicatedKoreanRoute(pathname: string) {
  return DEDICATED_KOREAN_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname))
}

export async function proxy(request: NextRequest) {
  // 차단 대상 봇은 어떤 처리(410 검사·locale·auth)도 하기 전에 즉시 403으로 끊는다.
  // 봇 트래픽이 미들웨어 CPU를 증폭시키므로 가장 비용이 큰 경로를 최상단에서 차단.
  const ua = request.headers.get('user-agent') ?? ''
  if (BLOCKED_BOTS_RE.test(ua)) {
    return new NextResponse(null, { status: 403 })
  }

  // 검증된 폐기 URL은 locale/auth 처리 전에 즉시 410으로 끊는다.
  if (isLegacyGonePath(request.nextUrl.pathname)) {
    return new NextResponse(GONE_BODY, {
      status: 410,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    })
  }

  const requestedPathname = request.nextUrl.pathname
  const routeLocale = localeFromPathname(requestedPathname)
  const locale = routeLocale ? localeForUi(routeLocale) : DEFAULT_LOCALE
  const pathname = withoutLocalePrefix(requestedPathname)
  const legacyHomeRedirect = getLegacyLocaleHomeRedirect(requestedPathname, routeLocale)
  if (legacyHomeRedirect) {
    const destination = request.nextUrl.clone()
    destination.pathname = legacyHomeRedirect
    return NextResponse.redirect(destination, 308)
  }
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p))

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-campcareer-locale', locale)
  requestHeaders.set('x-campcareer-route-locale', routeLocale ?? locale)
  requestHeaders.set('x-campcareer-pathname', requestedPathname)
  const rewriteDestination = request.nextUrl.clone()
  rewriteDestination.pathname = pathname
  const isLocalePrefixed = Boolean(routeLocale)
  const shouldRewriteLocalePath = isLocalePrefixed && !(routeLocale === 'ko' && isDedicatedKoreanRoute(requestedPathname))
  const nextWithLocaleRequest = () => shouldRewriteLocalePath
    ? NextResponse.rewrite(rewriteDestination, { request: { headers: requestHeaders } })
    : NextResponse.next({ request: { headers: requestHeaders } })
  const withLocale = (response: NextResponse) => {
    // Only locale-prefixed URLs need a server-set preference. Setting this on
    // every public response turns otherwise cacheable pages into per-visitor
    // responses and makes the Proxy run needlessly expensive.
    if (routeLocale) {
      response.cookies.set(LOCALE_COOKIE, locale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      })
    }
    // Attribution is optional measurement. Never create these cookies until a
    // visitor has explicitly allowed it in the in-product privacy control.
    if (request.cookies.get('cc_analytics_consent')?.value === 'granted') {
      if (!request.cookies.get('cc_sid')?.value) {
        response.cookies.set('cc_sid', crypto.randomUUID(), { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax', httpOnly: true })
      }
      if (!request.cookies.get('cc_first_path')?.value) {
        response.cookies.set('cc_first_path', pathname, { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax', httpOnly: true })
      }
      for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
        const value = request.nextUrl.searchParams.get(key)
        if (value && !request.cookies.get(`cc_${key}`)?.value) {
          response.cookies.set(`cc_${key}`, value.slice(0, 180), { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax', httpOnly: true })
        }
      }
    }
    // Future locale prefixes exist to make a vetted launch URL-stable. Until
    // their catalogue has editorial approval, serve the safe English fallback
    // without allowing a thin duplicate page into search indexes.
    if (routeLocale && !isPublishedLocaleOption(routeLocale)) {
      response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    }
    return response
  }

  // Public pages should not pay middleware/Supabase auth CPU. This includes
  // /home, whose route now simply redirects to public Career discovery.
  if (!isProtected) {
    return withLocale(nextWithLocaleRequest())
  }

  let supabaseResponse = nextWithLocaleRequest()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = nextWithLocaleRequest()
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && isProtected) {
    const loginPath = localizePath('/login', routeLocale ?? locale)
    const loginUrl = new URL(loginPath, request.url)
    // Preserve the visible locale in the complete auth round-trip.
    loginUrl.searchParams.set('next', `${requestedPathname}${request.nextUrl.search}`)
    return withLocale(NextResponse.redirect(loginUrl))
  }

  return withLocale(supabaseResponse)
}

export const config = {
  matcher: [
    // Locale paths need a rewrite and locale headers. Keep ordinary public
    // pages out of the Node.js Proxy so they can use Vercel's normal cache.
    '/ko/:path*',
    '/zh-hans/:path*',
    '/vi/:path*',
    '/hi/:path*',
    '/es-419/:path*',
    // Retired locale roots and the former default route are canonicalized.
    '/en/:path*',
    '/results/:path*',
    // Account/retention pages need authentication. /home remains matched only
    // so its legacy redirect can run without invoking Supabase auth.
    '/dashboard/:path*',
    '/home/:path*',
    '/planner/:path*',
    '/saved/:path*',
    '/documents/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/onboarding/:path*',
    // Preserve explicit 410 responses for retired URL families without
    // charging every active URL to the Proxy.
    '/category/:path*',
    '/tag/:path*',
    '/author/:path*',
    '/page/:path*',
    '/feed/:path*',
    '/comments/feed/:path*',
    '/sample-page/:path*',
    '/job/:path*',
    '/jobs/:path*',
    '/((?:\\d{4})/(?:\\d{2})(?:/.*)?)',
  ],
}
