'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { DEFAULT_LOCALE, LOCALE_COOKIE, localeForUi, localeFromPathname, type Locale } from './config'

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
})

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  // `locale` seeds the initial state only. <LocaleInit> then derives the
  // rendered language from the current URL, so a shared /ko link cannot be
  // overridden by an old local preference.
  const [currentLocale, setCurrentLocale] = useState<Locale>(locale)

  const setLocale = useCallback((newLocale: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
    setCurrentLocale(newLocale)
    document.documentElement.lang = newLocale
  }, [])

  return (
    <LocaleContext.Provider value={{ locale: currentLocale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale(): Locale {
  return useContext(LocaleContext).locale
}

export function useSetLocale(): (locale: Locale) => void {
  return useContext(LocaleContext).setLocale
}

/**
 * URL-prefixed locales are explicit and must win over a cookie or a delayed
 * hydration update. This keeps shared Korean product links fully Korean.
 */
export function useRouteLocale(): Locale {
  const pathname = usePathname()
  const selectedLocale = useLocale()
  return localeForUi(localeFromPathname(pathname) ?? selectedLocale)
}
