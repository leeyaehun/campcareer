import type { Locale } from "@/lib/i18n/config"
import type { LaunchCountry } from "@/data/launch-countries"
import type { NavItem } from "./navigation"
import type { CompareModeType } from "@/lib/compare-navigation"

const NAV_LABELS: Record<Locale, Record<string, string>> = {
  en: {
    home: "Home",
    map: "Map",
    compare: "Compare",
    countries: "Countries",
    visas: "Visas",
    occupation: "Occupation",
    programs: "Programs",
    institutions: "Institutions",
  },
  ko: {
    home: "홈",
    map: "지도",
    compare: "비교",
    countries: "국가",
    visas: "비자",
    occupation: "직업",
    programs: "과정",
    institutions: "교육기관",
  },
}

const COMPARE_LABELS: Record<Locale, Record<CompareModeType, string>> = {
  en: { program: "Programs", country: "Countries", city: "Cities", career: "Careers", degree: "Degrees" },
  ko: { program: "과정", country: "국가", city: "도시", career: "직업", degree: "학위" },
}

const REGION_CODE_OVERRIDES: Record<string, string> = { UK: "GB" }

export function workspaceNavLabel(locale: Locale, item: NavItem) {
  return NAV_LABELS[locale][item.id] ?? item.label
}

export function compareModeLabel(locale: Locale, type: CompareModeType) {
  return COMPARE_LABELS[locale][type]
}

export function workspaceCountryLabel(locale: Locale, country: LaunchCountry) {
  if (locale !== "ko") return country.name
  const code = REGION_CODE_OVERRIDES[country.code] ?? country.code
  return new Intl.DisplayNames("ko-KR", { type: "region" }).of(code) ?? country.name
}

export function workspaceSidebarCopy(locale: Locale) {
  if (locale === "ko") {
    return {
      country: "국가",
      allCountries: "전체 국가",
      selectedCountryAria: "선택한 국가",
      followSelected: (countryName: string) => `비자, 직업, 과정 정보는 ${countryName} 기준으로 연결됩니다.`,
      followDefault: "비자, 직업, 과정 정보는 선택한 국가 기준으로 연결됩니다.",
      tagline: "계획하고, 비교하고, 실행하세요.",
    }
  }

  return {
    country: "Country",
    allCountries: "All countries",
    selectedCountryAria: "Selected country",
    followSelected: (countryName: string) => `Visas, occupation and programs follow ${countryName}.`,
    followDefault: "Visas, occupation and programs follow the selected country.",
    tagline: "Plan. Compare. Go.",
  }
}
