"use client"

import { dictionaries, type Dictionary } from "./dictionaries"
import { useLocale, useRouteLocale } from "./locale-provider"

/**
 * Keep the full translation catalog out of the root locale-state boundary.
 * Public pages that only need the active locale should not download both
 * catalogs before their first render.
 */
export function useTranslations(): Dictionary {
  return dictionaries[useLocale()] ?? dictionaries.en
}

export function useRouteTranslations(): Dictionary {
  return dictionaries[useRouteLocale()] ?? dictionaries.en
}
