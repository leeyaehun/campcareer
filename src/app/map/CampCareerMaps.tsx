"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { RotateCcw, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ExternalLink, Search, Bookmark, Share2, DollarSign, GraduationCap, SlidersHorizontal } from "lucide-react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/i18n/locale-provider"
import { useTranslations } from "@/lib/i18n/use-translations"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { STATE_CODES, STATE_NAMES, US_STATE_CODES, US_STATE_NAMES, IE_COUNTY_CODES, IE_COUNTY_NAMES, IE_CITY_TO_COUNTY, CA_PROVINCE_CODES, CA_PROVINCE_NAMES, UK_REGION_CODES, UK_REGION_NAMES, DE_BUNDESLAND_CODES, DE_BUNDESLAND_NAMES, NL_PROVINCE_CODES, NL_PROVINCE_NAMES, BE_REGION_CODES, BE_REGION_NAMES, JP_PREFECTURE_CODES, JP_PREFECTURE_NAMES, KR_SIDO_CODES, KR_SIDO_NAMES, FR_REGION_CODES, FR_REGION_NAMES, NZ_REGION_NAMES, NO_REGION_NAMES, SE_REGION_NAMES, DK_REGION_NAMES, FI_REGION_NAMES, CH_CANTON_NAMES, AE_EMIRATE_CODES, AE_EMIRATE_NAMES, type StateCode, type NZRegionCode, type NORegionCode, type SERegionCode, type DKRegionCode, type FIRegionCode, type CHCantonCode, type AEEmirateCode } from "./states"
import { SA4_BY_STATE, type SA4Region } from "@/data/sa4-regions"
import { WHV_REGIONS } from "@/data/whv-regions"
import { WHV_SPECIFIED_WORK } from "@/data/whv-occupations"
import { WHV_JOB_LINKS, WHV_GENERAL_JOBS } from "@/data/whv-job-links"
import { JOB_SEARCH_LINKS } from "@/data/job-search-links"
import { WHV_POSTCODES } from "@/data/whv-postcodes"
import { WHV_REGION_EMPLOYERS } from "@/data/whv-region-employers"
import POSTCODE_TO_SA4 from "@/data/postcode-to-sa4"
import { getPathway, TAFE_BY_STATE, VET_PORTALS, cricosSearchUrl } from "@/lib/au-pathway"
import { track } from "@/lib/analytics"
import { AffiliateCtas } from "@/components/partners/partner-cta"
import { ToolNavActions } from "@/components/layout/tool-nav-actions"
import JobListings from "./JobListings"
import { EMPLOYMENT_OCCUPATIONS } from "@/data/employment-occupations"
import { EMPLOYMENT_SALARIES } from "@/data/employment-salaries"
import type { MapData, StateOccupation, USOccupation, HighPayOccupation, USCollege, StateSalaryMult, OccRow, StateShortageByOcc, CourseLite, USStateInfo, StateMajorDensity, USRankedCollege, AURankedCollege, CACollege, CACity, CAOccRow, CAHighPayOccupation, UKOccRow, UKRegionOccupation, UKCollege, UKCity, DECollege, DECity, DERegionOccupation, DEOccRow, NLCollege, NLCity, NLRegionOccupation, NLOccRow, BERegionOccupation, BEOccRow } from "@/lib/map-data"
import type { MapsV1Envelope } from "@/lib/maps-v1-contract"
import { createClient } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"
import { getShortageOccupations } from "@/lib/ie-shortage-occupations"
import { getIscBroadField } from "@/lib/ie-fields"
import { getJapanCareerLinks } from "@/lib/jp-occupation-card-contract"
import { getSingaporeCareerLinks, SG_DEMAND_OCCUPATIONS, type SingaporeDemandOccupation, type SingaporeWageOccupation } from "@/data/sg-map-data"
import { koreaJobSearchLinks, type KoreaOccupation, type KoreaUniversity } from "@/data/kr-map-data"
import { FR_DEMAND_BY_CODE, FR_PCS_LABELS, franceJobSearchUrl, type FranceCity, type FranceDemandOccupation, type FranceSalaryGroup, type FranceUniversity } from "@/data/fr-map-data"
import { spainJobSearchUrl, type SpainCity, type SpainOccupation, type SpainSalaryGroup, type SpainUniversity } from "@/data/es-map-data"
import { type NZRegion, type NZOccupation, type NZUniversity, NZ_OCCUPATION_BY_CODE, NZ_REGIONS } from "@/data/nz-map-data"
import { type NORegion, type NOOccupation, type NOUniversity, NO_OCCUPATION_BY_CODE } from "@/data/no-map-data"
import { type SERegion, type SEOccupation, type SEUniversity, SE_OCCUPATION_BY_CODE, seJobSearchUrl } from "@/data/se-map-data"
import { type DKRegion, type DKOccupation, type DKUniversity, DK_OCCUPATION_BY_CODE, dkJobSearchUrl } from "@/data/dk-map-data"
import { type FIRegion, type FIOccupation, type FIUniversity, FI_OCCUPATION_BY_CODE, fiJobSearchUrl } from "@/data/fi-map-data"
import { type CHRegion, type CHUniversity, type CHOccupationGroup } from "@/data/ch-map-data"

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse" />,
})

const STATE_SEEK_PATH: Record<string, string> = {
  NSW: "New-South-Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  SA: "South-Australia",
  WA: "Western-Australia",
  TAS: "Tasmania",
  NT: "Northern-Territory",
  ACT: "Australian-Capital-Territory",
}

type Tab = "stateInfo" | "shortage" | "pay" | "employment" | "whv"
type ActiveCountry = "AU" | "US" | "CA" | "IE" | "UK" | "DE" | "NL" | "BE" | "JP" | "SG" | "KR" | "FR" | "ES" | "NZ" | "NO" | "SE" | "DK" | "FI" | "CH" | "AE" | null

type NeroOccupation = { a4: string; name: string; emp: number }
type NeroData = Record<string, NeroOccupation[]>
type AuLabourMarket = {
  regional: { state: string; sa4_code: string; sa4_name: string; employment_total: number | null; annual_change: number | null; annual_change_pct: number | null; five_year_change: number | null; five_year_change_pct: number | null; period: string }[]
  vacancies: { state: string; period: string; vacancy_count: number | null }[]
  sources: { regional: string; vacancies: string }
}

// 지역(SA4) 단위 직업군 데이터 — public/region-occupations.json (IVI 채용공고 + 인구조사 고소득).
type RegionGroup = { code?: string; title: string; value: number }
type RegionEntry = { demand: RegionGroup[]; demandMetro: boolean; pay: RegionGroup[] }
type RegionOccData = Record<string, RegionEntry>
export default function CampCareerMaps({
  data: initialData,
  initialState,
  initialTab,
  initialSA4,
  initialUniversity,
  auOnly = false,
  routeMode = false,
}: {
  data: MapData
  initialState?: string
  initialTab?: Tab
  initialSA4?: string
  initialUniversity?: string
  auOnly?: boolean
  routeMode?: boolean
}) {
  const t = useTranslations()
  const locale = useLocale()
  // /maps는 호주 비치헤드의 front door다 → 진입 즉시 주/지역 선택(검색) 바가 보이도록
  // 기본을 "AU"로 둔다. 월드맵(다른 국가)은 "전체 보기"로 빠져나가 볼 수 있다.
  const [activeCountry, setActiveCountry] = useState<ActiveCountry>("AU")
  const [data, setData] = useState<MapData>(initialData)
  const loadedCountries = useRef(new Set<Exclude<ActiveCountry, null>>(["AU"]))
  const [countryDataLoading, setCountryDataLoading] = useState(false)
  const [countryDataError, setCountryDataError] = useState<string | null>(null)
  const [jpProfilesByCode, setJpProfilesByCode] = useState<MapData["jpJobTagProfilesByWageCode"]>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedSA4, setSelectedSA4] = useState<SA4Region | null>(null)
  const [tab, setTab] = useState<Tab>("shortage")
  const [neroData, setNeroData] = useState<NeroData | null>(null)
  const neroFetched = useRef(false)
  const [regionData, setRegionData] = useState<RegionOccData | null>(null)
  const regionFetched = useRef(false)
  const initialOccLoaded = useRef(false)
  // The static Maps page reads its initial deep-link on the client. It must be
  // applied once only: country bundles arrive asynchronously, and re-reading
  // an old `?country=us` after every bundle response would undo a map click.
  const initialUrlApplied = useRef(false)
  // 직업 카드 열림 상태 — 툴바의 직업 검색에서도 열 수 있도록 최상위로 끌어올림.
  const [selectedOccCode, setSelectedOccCode] = useState<string | null>(null)
  const [auLabourMarket, setAuLabourMarket] = useState<AuLabourMarket | null>(null)
  const [selectedJPCityArea, setSelectedJPCityArea] = useState<string | null>(null)
  const [selectedFRCityCode, setSelectedFRCityCode] = useState<string | null>(null)
  const [selectedESCityCode, setSelectedESCityCode] = useState<string | null>(null)
  const [selectedUsOcc, setSelectedUsOcc] = useState<USOccupation | null>(null)
  const [selectedUniv, setSelectedUniv] = useState<USRankedCollege | AURankedCollege | CACollege | UKCollege | DECollege | NLCollege | KoreaUniversity | FranceUniversity | SpainUniversity | NZUniversity | NOUniversity | SEUniversity | DKUniversity | FIUniversity | CHUniversity | null>(null)
  const [selectedNeroA4, setSelectedNeroA4] = useState<string | null>(null)
  const initialNeroLoaded = useRef(false)
  const initialSA4Ref = useRef<string | null>(null)
  // 모바일에서는 우측 패널 대신 구글맵식 바텀시트(드래그로 확장)를 쓴다.
  const [isMobile, setIsMobile] = useState(false)
  // 모바일 접이식 툴바 상태
  const [expanded, setExpanded] = useState(false)
  // 모바일 시트 닫힘 상태 — 닫아도 selected(지역)는 유지하여 지도가 해당 지역에 고정되도록
  const [mobileSheetHidden, setMobileSheetHidden] = useState(false)
  const [jobSearch, setJobSearch] = useState("")
  const [jobSearchOpen, setJobSearchOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    if (!activeCountry || loadedCountries.current.has(activeCountry)) return
    const controller = new AbortController()
    setCountryDataLoading(true)
    setCountryDataError(null)
    fetch(`/api/v1/maps/${activeCountry.toLowerCase()}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Map data request failed (${response.status})`)
        return response.json() as Promise<MapsV1Envelope<Partial<MapData>>>
      })
      .then((payload) => {
        if (
          payload.country !== activeCountry ||
          !payload.data ||
          typeof payload.data !== "object" ||
          !payload.dataVersion ||
          !payload.methodologyVersion ||
          !payload.generatedAt ||
          !Array.isArray(payload.evidence) ||
          !["decision_ready", "discovery", "review_required"].includes(payload.readiness)
        ) {
          throw new Error("Map data response did not match the v1 country bundle contract")
        }
        setData((current) => ({ ...current, ...payload.data }))
        loadedCountries.current.add(activeCountry)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        setCountryDataError(locale === "ko" ? "국가 데이터를 불러오지 못했습니다." : "Unable to load this country dataset.")
      })
      .finally(() => setCountryDataLoading(false))
    return () => controller.abort()
  }, [activeCountry, locale])

  useEffect(() => {
    if (activeCountry !== "JP" || !selectedOccCode?.startsWith("jp-wage-")) return
    const code = selectedOccCode.slice("jp-wage-".length)
    if (jpProfilesByCode[code]) return
    const controller = new AbortController()
    fetch(`/api/maps/data/jp/jobtag/${encodeURIComponent(code)}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Job profile request failed")))
      .then((payload: { profiles: MapData["jpJobTagProfilesByWageCode"][string] }) => {
        setJpProfilesByCode((current) => ({ ...current, [code]: payload.profiles }))
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setCountryDataError(locale === "ko" ? "직업 상세 자료를 불러오지 못했습니다." : "Unable to load occupation details.")
      })
    return () => controller.abort()
  }, [activeCountry, jpProfilesByCode, locale, selectedOccCode])

  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [savedOccCodes, setSavedOccCodes] = useState<Set<string>>(new Set())
  const [savedUnivSlugs, setSavedUnivSlugs] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (routeMode) return
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeMode])

  useEffect(() => {
    if (routeMode) return
    if (!user) { setSavedOccCodes(new Set()); setSavedUnivSlugs(new Set()); return }
    supabase
      .from("saved_occupations")
      .select("occ_code")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setSavedOccCodes(new Set(data.map((r) => r.occ_code)))
      })
    supabase
      .from("saved_universities")
      .select("univ_slug")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setSavedUnivSlugs(new Set(data.map((r) => r.univ_slug)))
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeMode, user])

  const toggleSaveOcc = async (occCode: string, occTitle: string) => {
    if (!user) { window.location.href = "/login"; return }
    const isSaved = savedOccCodes.has(occCode)
    if (isSaved) {
      await supabase
        .from("saved_occupations")
        .delete()
        .eq("user_id", user.id)
        .eq("occ_code", occCode)
      setSavedOccCodes((prev) => { const next = new Set(prev); next.delete(occCode); return next })
    } else {
      await supabase.from("saved_occupations").upsert({
        user_id: user.id,
        occ_code: occCode,
        occ_title: occTitle,
        country: activeCountry ?? "",
      })
      setSavedOccCodes((prev) => new Set(prev).add(occCode))
    }
  }

  const toggleSaveUniv = async (slug: string, name: string) => {
    if (!user) { window.location.href = "/login"; return }
    const isSaved = savedUnivSlugs.has(slug)
    if (isSaved) {
      await supabase
        .from("saved_universities")
        .delete()
        .eq("user_id", user.id)
        .eq("univ_slug", slug)
      setSavedUnivSlugs((prev) => { const next = new Set(prev); next.delete(slug); return next })
    } else {
      await supabase.from("saved_universities").upsert({
        user_id: user.id,
        univ_slug: slug,
        univ_name: name,
      })
      setSavedUnivSlugs((prev) => new Set(prev).add(slug))
    }
  }

  const shareUniv = (slug: string) => {
    if (!selectedUniv) return
    const cc = activeCountry?.toLowerCase() ?? "au"
    const shareUrl = `${window.location.origin}/map/${cc}/university/${slug}`
    if (navigator.share) {
      navigator.share({ url: shareUrl })
    } else {
      navigator.clipboard.writeText(shareUrl)
    }
  }

  const shareOcc = () => {
    const url = new URL(window.location.href)
    url.searchParams.set("country", activeCountry?.toLowerCase() ?? "au")
    if (selected) url.searchParams.set("state", selected)
    const shareUrl = url.toString()
    if (isMobile && navigator.share) {
      navigator.share({ title: occLabel || stateLabel, url: shareUrl }).catch(() => {})
    } else {
      setShareOpen(true)
      setCopiedLink(false)
    }
  }

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)")
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  // 페이지가 정적(force-static)이므로 ?country=au&state=NSW&tab=pay 딥링크는 서버가 아니라
  // 여기서 마운트 후 읽어 반영한다. 전용 페이지(/map/au/employment/nsw 등)에서 initialState /
  // initialTab prop이 넘어오면 URL searchParams보다 우선한다.
  useEffect(() => {
    if (initialUrlApplied.current) return
    initialUrlApplied.current = true
    if (initialState) {
      setActiveCountry("AU")
      setSelected(initialState)
      if (initialTab) setTab(initialTab)
      if (initialSA4) initialSA4Ref.current = initialSA4
      return
    }
    const p = new URLSearchParams(window.location.search)
    const countryRaw = p.get("country")?.toLowerCase()
    const raw = p.get("state")?.toUpperCase()
    if (countryRaw === "es") {
      setActiveCountry("ES")
      const community = data.esCommunities.find((item) => item.code === raw || item.slug === p.get("state"))
      setSelected(community?.code ?? null)
      const city = data.esCities.find((item) => item.code === p.get("city") || item.slug === p.get("city"))
      setSelectedESCityCode(city?.regionCode === community?.code ? city?.code ?? null : null)
      setTab("stateInfo")
    } else if (countryRaw === "fr") {
      setActiveCountry("FR")
      const region = raw && (FR_REGION_CODES as readonly string[]).includes(raw) ? raw : null
      setSelected(region)
      const city = data.frCities.find((item) => item.code === p.get("city") || item.slug === p.get("city"))
      setSelectedFRCityCode(city?.regionCode === region ? city.code : null)
      setTab("stateInfo")
    } else if (countryRaw === "us") {
      setActiveCountry("US")
      if (raw && (US_STATE_CODES as readonly string[]).includes(raw)) setSelected(raw)
    } else if (countryRaw === "au") {
      setActiveCountry("AU")
      if (raw && ((STATE_CODES as readonly string[]).includes(raw) || raw === "WHV")) {
        setSelected(raw)
        if (raw === "WHV") setTab("whv")
      }
    } else if (countryRaw === "ie") {
      setActiveCountry("IE")
    } else if (countryRaw === "uk") {
      setActiveCountry("UK")
      if (raw && (UK_REGION_CODES as readonly string[]).includes(raw)) setSelected(raw)
    } else if (countryRaw === "ca") {
      setActiveCountry("CA")
      if (raw && (CA_PROVINCE_CODES as readonly string[]).includes(raw)) setSelected(raw)
    } else if (countryRaw === "de") {
      setActiveCountry("DE")
      if (raw && (DE_BUNDESLAND_CODES as readonly string[]).includes(raw)) setSelected(raw)
    } else if (countryRaw === "jp") {
      setActiveCountry("JP")
      if (raw && (JP_PREFECTURE_CODES as readonly string[]).includes(raw)) setSelected(raw)
      setTab("stateInfo")
    } else if (countryRaw === "sg") {
      setActiveCountry("SG")
      const area = data.sgAreas.find((item) => item.code === p.get("area"))?.code ?? "central"
      setSelected(area)
      setTab("stateInfo")
    } else if (countryRaw === "kr") {
      setActiveCountry("KR")
      if (raw && (KR_SIDO_CODES as readonly string[]).includes(raw)) setSelected(raw)
      setTab("stateInfo")
    } else if (countryRaw === "nz") {
      setActiveCountry("NZ")
      setTab("stateInfo")
    } else if (countryRaw === "no") {
      setActiveCountry("NO")
      const region = data.noRegions.find((item) => item.code === raw || item.slug === p.get("state"))
      setSelected(region?.code ?? null)
      setTab("stateInfo")
    } else if (countryRaw === "se") {
      setActiveCountry("SE")
      const region = data.seRegions.find((item) => item.code === raw || item.slug === p.get("state"))
      setSelected(region?.code ?? null)
      setTab("stateInfo")
    } else if (countryRaw === "dk") {
      setActiveCountry("DK")
      const region = data.dkRegions.find((item) => item.code === raw || item.slug === p.get("state"))
      setSelected(region?.code ?? null)
      setTab("stateInfo")
    } else if (countryRaw === "fi") {
      setActiveCountry("FI")
      const region = data.fiRegions.find((item) => item.code === raw || item.slug === p.get("state"))
      setSelected(region?.code ?? null)
      setTab("stateInfo")
    } else if (countryRaw === "ch") {
      setActiveCountry("CH")
      const canton = data.chRegions.find((item) => item.code === raw || item.slug === p.get("state"))
      setSelected(canton?.code ?? null)
      setTab("stateInfo")
    } else if (countryRaw === "ae") {
      setActiveCountry("AE")
      if (raw && (AE_EMIRATE_CODES as readonly string[]).includes(raw)) setSelected(raw)
      setTab("stateInfo")
    }
    const tabParam = p.get("tab")
    if (tabParam === "pay") setTab("pay")
    else if (tabParam === "employment") setTab("employment")
    else if (tabParam === "whv") setTab("whv")
  }, [initialState, initialTab, initialSA4, data.sgAreas, data.frCities, data.esCities, data.esCommunities, data.noRegions, data.seRegions, data.dkRegions, data.fiRegions, data.chRegions])

  useEffect(() => {
    if (!selected || neroFetched.current) return
    neroFetched.current = true
    fetch("/nero-sa4.json")
      .then((r) => r.json())
      .then((d: NeroData) => setNeroData(d))
      .catch(() => {})
  }, [selected])

  useEffect(() => {
    if (!selected || regionFetched.current) return
    regionFetched.current = true
    fetch("/region-occupations.json")
      .then((r) => r.json())
      .then((d: RegionOccData) => setRegionData(d))
      .catch(() => {})
  }, [selected])

  const [ieSchools, setIeSchools] = useState<Array<{
    id: number; slug: string; name_en: string; name_ko: string | null;
    city: string; lat: number | null; lng: number | null;
    price_range_week: string | null; accreditation: string[] | null;
    description_ko: string | null;
  }> | null>(null)

  useEffect(() => {
    if (activeCountry !== "IE") { setIeSchools(null); return }
    fetch("/api/ie/language-schools")
      .then((r) => r.json())
      .then((d) => setIeSchools(d.schools ?? []))
      .catch(() => setIeSchools([]))
  }, [activeCountry])

  useEffect(() => {
    setSelectedSA4(null)

  }, [selected])

  // initialSA4 prop → selectedSA4 (selected-clear effect 이후에 적용)
  useEffect(() => {
    if (initialSA4Ref.current && selected) {
      const code = initialSA4Ref.current
      initialSA4Ref.current = null
      const regions = Object.values(SA4_BY_STATE).flat()
      const region = regions.find((r) => r.code === code) ?? null
      if (region) setSelectedSA4(region)
    }

  }, [selected])

  // occ(직업 코드) URL 파라미터 ↔ state 동기화.
  // 최초 마운트 시 URL의 ?occ=… 를 읽어 자동 선택하고,
  // 이후 state가 바뀌면 URL을 갱신한다.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const urlOcc = p.get("occ") ?? null
    const stateOcc = selectedOccCode ?? selectedUsOcc?.occ_code ?? null

    // URL → state (최초 1회)
    if (!initialOccLoaded.current && urlOcc && !stateOcc && activeCountry && selected) {
      initialOccLoaded.current = true
      if (activeCountry === "AU") {
        if (data.auOccupations[urlOcc]) setSelectedOccCode(urlOcc)
      } else {
        const occ = data.usShortageByState[selected]?.find((o) => o.occ_code === urlOcc) ?? null
        if (occ) setSelectedUsOcc(occ)
      }
      return
    }

    // occ가 없는 URL → 초기 적재 완료로 표시
    if (!initialOccLoaded.current && !urlOcc) {
      initialOccLoaded.current = true
    }

    // state → URL (동기화)
    if (initialOccLoaded.current && stateOcc !== urlOcc) {
      if (stateOcc) {
        p.set("occ", stateOcc)
      } else {
        p.delete("occ")
      }
      window.history.replaceState(null, "", `?${p.toString()}`)
    }
  }, [selectedOccCode, selectedUsOcc, activeCountry, selected, data])

  useEffect(() => {
    if (activeCountry !== "AU" || !selectedOccCode || !selected || selected === "WHV") {
      setAuLabourMarket(null)
      return
    }
    const controller = new AbortController()
    setAuLabourMarket(null)
    fetch(`/api/maps/au/labour-market?occupation=${encodeURIComponent(selectedOccCode)}&state=${encodeURIComponent(selected)}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<AuLabourMarket> : Promise.reject(new Error(`Labour market request failed (${response.status})`)))
      .then((payload) => setAuLabourMarket(payload))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setAuLabourMarket(null)
      })
    return () => controller.abort()
  }, [activeCountry, selectedOccCode, selected])

  // nero(NERO 고용 코드) URL 파라미터 ↔ state 동기화.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const urlNero = p.get("nero") ?? null

    if (!initialNeroLoaded.current && urlNero && tab === "employment") {
      initialNeroLoaded.current = true
      setSelectedNeroA4(urlNero)
      return
    }

    if (!initialNeroLoaded.current && !urlNero) {
      initialNeroLoaded.current = true
    }

    if (!initialNeroLoaded.current) return

    if (tab === "employment") {
      if (selectedNeroA4 !== urlNero) {
        if (selectedNeroA4) {
          p.set("nero", selectedNeroA4)
        } else {
          p.delete("nero")
        }
        window.history.replaceState(null, "", `?${p.toString()}`)
      }
    } else if (urlNero) {
      p.delete("nero")
      window.history.replaceState(null, "", `?${p.toString()}`)
    }
  }, [selectedNeroA4, tab])

  // region(WHV 지역 코드) URL 파라미터 ↔ state 동기화.
  const regionInitialLoaded = useRef(false)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const urlRegion = p.get("region") ?? null
    const regionCode = selectedSA4?.code ?? null

    if (!regionInitialLoaded.current && urlRegion && tab === "whv") {
      regionInitialLoaded.current = true
      const regions = Object.values(SA4_BY_STATE).flat()
      const region = regions.find((r) => r.code === urlRegion) ?? null
      if (region) setSelectedSA4(region)
      return
    }

    if (!regionInitialLoaded.current && !urlRegion) {
      regionInitialLoaded.current = true
    }

    if (!regionInitialLoaded.current) return

    if (tab === "whv") {
      if (regionCode !== urlRegion) {
        if (regionCode) {
          p.set("region", regionCode)
        } else {
          p.delete("region")
        }
        window.history.replaceState(null, "", `?${p.toString()}`)
      }
    } else if (urlRegion) {
      p.delete("region")
      window.history.replaceState(null, "", `?${p.toString()}`)
    }
  }, [selectedSA4, tab])

  const onSelectSA4 = useCallback((code: string) => {
    const regions = selected && selected !== "WHV"
      ? SA4_BY_STATE[selected as StateCode] ?? []
      : Object.values(SA4_BY_STATE).flat()
    const region = regions.find((r) => r.code === code) ?? null
    setSelectedSA4(region)
    setMobileSheetHidden(false)
    if (region) track("select_region", { state: selected ?? "", region: region.name })
  }, [selected])

  const onSelectState = useCallback((s: string) => {
    setSelected(s)
    setMobileSheetHidden(false)
    if (activeCountry === "JP") setSelectedJPCityArea(null)
    if (activeCountry === "FR") setSelectedFRCityCode(null)
    if (activeCountry === "ES") setSelectedESCityCode(null)
    if (s === "WHV") setTab("whv")
    else if (activeCountry === "US") setTab("stateInfo")
    else if (activeCountry === "UK") setTab("stateInfo")
    else if (activeCountry === "JP") setTab("stateInfo")
    else if (activeCountry === "SG") setTab("stateInfo")
    else if (activeCountry === "KR") setTab("stateInfo")
    else if (activeCountry === "FR") setTab("stateInfo")
    else if (activeCountry === "ES") setTab("stateInfo")
    else if (activeCountry === "NZ") setTab("stateInfo")
    else if (activeCountry === "NO") setTab("stateInfo")
    else if (activeCountry === "SE" || activeCountry === "DK" || activeCountry === "FI" || activeCountry === "CH") setTab("stateInfo")
    track("select_state", { country: activeCountry ?? "AU", state: s })
  }, [activeCountry])

  const onSelectCountry = useCallback((country: Exclude<ActiveCountry, null>) => {
    setActiveCountry(country)
    setSelected(country === "SG" ? "central" : null)
    setMobileSheetHidden(false)
    setSelectedJPCityArea(null)
    setSelectedFRCityCode(null)
    setSelectedESCityCode(null)
    setSelectedSA4(null)
    if (country === "SG" || country === "JP" || country === "KR" || country === "FR" || country === "ES" || country === "NZ" || country === "NO" || country === "SE" || country === "DK" || country === "FI" || country === "CH") setTab("stateInfo")
  }, [])

  // When a US state is already selected and country changes to US, switch to stateInfo
  useEffect(() => {
    if (activeCountry === "US" && selected) setTab("stateInfo")
    if (activeCountry === "JP" && selected) setTab("stateInfo")
    if (activeCountry === "SG" && selected) setTab("stateInfo")
    if (activeCountry === "KR" && selected) setTab("stateInfo")
    if (activeCountry === "FR" && selected) setTab("stateInfo")
    if (activeCountry === "ES" && selected) setTab("stateInfo")
    if (activeCountry === "NZ" && selected) setTab("stateInfo")
    if (activeCountry === "NO" && selected) setTab("stateInfo")
    if ((activeCountry === "SE" || activeCountry === "DK" || activeCountry === "FI" || activeCountry === "CH") && selected) setTab("stateInfo")
  }, [activeCountry, selected])

  // UK has no shortage tab — reset to pay if needed
  useEffect(() => {
    if (activeCountry === "UK" && tab === "shortage") setTab("pay")
  }, [activeCountry, tab])

  // Handle initialUniversity prop — find the college and show its info
  useEffect(() => {
    if (!initialUniversity) return
    const usUniv = data.usRankedColleges.find((c) => c.slug === initialUniversity)
    if (usUniv) {
      setSelectedUniv(usUniv)
      setActiveCountry("US")
      setSelected(usUniv.college_state)
      return
    }
    const auUniv = data.auRankedColleges.find((c) => c.slug === initialUniversity)
    if (auUniv) {
      setSelectedUniv(auUniv)
      setActiveCountry("AU")
      setSelected(auUniv.college_state)
      return
    }
    const caUniv = data.caColleges.find((c) => c.slug === initialUniversity)
    if (caUniv) {
      setSelectedUniv(caUniv)
      setActiveCountry("CA")
      setSelected(caUniv.province)
      return
    }
    const ukUniv = data.ukColleges?.find((c) => c.slug === initialUniversity)
    if (ukUniv) {
      setSelectedUniv(ukUniv)
      setActiveCountry("UK")
      setSelected(ukUniv.region)
      return
    }
    const deUniv = data.deColleges?.find((c) => c.slug === initialUniversity)
    if (deUniv) {
      setSelectedUniv(deUniv)
      setActiveCountry("DE")
      setSelected(deUniv.region)
      return
    }
    const nlUniv = data.nlColleges?.find((c) => c.slug === initialUniversity)
    if (nlUniv) {
      setSelectedUniv(nlUniv)
      setActiveCountry("NL")
      setSelected(nlUniv.province)
      return
    }
    const krUniv = data.krUniversities.find((c) => c.slug === initialUniversity)
    if (krUniv) {
      setSelectedUniv(krUniv)
      setActiveCountry("KR")
      setSelected(krUniv.regionCode)
    }
    const noUniv = data.noUniversities.find((c) => c.slug === initialUniversity)
    if (noUniv) {
      setSelectedUniv(noUniv)
      setActiveCountry("NO")
      setSelected(noUniv.regionCode)
    }
    const seUniv = data.seUniversities.find((c) => c.slug === initialUniversity)
    if (seUniv) { setSelectedUniv(seUniv); setActiveCountry("SE"); setSelected(seUniv.regionCode); return }
    const dkUniv = data.dkUniversities.find((c) => c.slug === initialUniversity)
    if (dkUniv) { setSelectedUniv(dkUniv); setActiveCountry("DK"); setSelected(dkUniv.regionCode); return }
    const fiUniv = data.fiUniversities.find((c) => c.slug === initialUniversity)
    if (fiUniv) { setSelectedUniv(fiUniv); setActiveCountry("FI"); setSelected(fiUniv.regionCode) }
    const chUniv = data.chUniversities.find((c) => c.slug === initialUniversity)
    if (chUniv) { setSelectedUniv(chUniv); setActiveCountry("CH"); setSelected(chUniv.cantonCode) }
  }, [initialUniversity, data.usRankedColleges, data.auRankedColleges, data.caColleges, data.ukColleges, data.deColleges, data.nlColleges, data.krUniversities, data.noUniversities, data.seUniversities, data.dkUniversities, data.fiUniversities, data.chUniversities])

  const onReset = useCallback(() => {
    if (selected !== null) {
      setSelected(null)
      setSelectedSA4(null)
      setTab("shortage")
    } else if (activeCountry !== null) {
      setActiveCountry(null)
      setIeSchools(null)
    }
  }, [selected, activeCountry])

  const onClosePanel = useCallback(() => {
    if (selectedUniv) {
      setSelectedUniv(null)
      return
    }
    const hadDetail = selectedOccCode !== null || selectedUsOcc !== null || selectedNeroA4 !== null
    if (hadDetail) {
      setSelectedOccCode(null)
      setSelectedUsOcc(null)
      setSelectedNeroA4(null)
    }
    if (isMobile) {
      setMobileSheetHidden(true)
      setExpanded(false)
    } else if (!hadDetail) {
      onReset()
    }
  }, [selectedUniv, selectedOccCode, selectedUsOcc, selectedNeroA4, isMobile, onReset])

  const hasMapDetail = Boolean(selectedUniv || selectedOccCode || selectedUsOcc || selectedNeroA4)
  const hasPanelOpen = Boolean(selected || activeCountry === "IE" || activeCountry === "UK" || selectedUniv || hasMapDetail)

  const handleMapToolbarBack = useCallback(() => {
    if (selectedUniv) {
      setSelectedUniv(null)
      return
    }
    if (selectedUsOcc) {
      setSelectedUsOcc(null)
      return
    }
    if (selectedNeroA4) {
      setSelectedNeroA4(null)
      return
    }
    setSelectedOccCode(null)
  }, [selectedNeroA4, selectedOccCode, selectedUniv, selectedUsOcc])

  const handleMapToolbarClose = useCallback(() => {
    setJobSearch("")
    setJobSearchOpen(false)
    onClosePanel()
  }, [onClosePanel])

  const stateItems = useMemo(() => ({
    ...STATE_NAMES,
    WHV: "Second Visa",
  } as Record<string, string>), [])

  const auShortageItems = useMemo<Record<string, string>>(() => {
    if (!selected) return {}
    const occs = data.shortageByState[selected as StateCode] ?? []
    return Object.fromEntries(
      occs.map((o) => [
        o.anzsco_code,
        `${o.occupation_en}${o.median_salary_aud != null ? ` · $${o.median_salary_aud.toLocaleString()}` : ""}`,
      ]),
    )
  }, [data.shortageByState, selected])

  const allAuOccupations = useMemo(() => {
    const seen = new Map<string, { code: string; title: string; salary: number | null }>()
    for (const state of Object.values(data.shortageByState)) {
      for (const occ of state) {
        if (!seen.has(occ.anzsco_code)) {
          seen.set(occ.anzsco_code, { code: occ.anzsco_code, title: occ.occupation_en, salary: occ.median_salary_aud })
        }
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.title.localeCompare(b.title))
  }, [data.shortageByState])

  const filteredAuJobs = useMemo(() => {
    if (!jobSearch.trim()) return allAuOccupations.slice(0, 20)
    const q = jobSearch.toLowerCase()
    return allAuOccupations.filter((o) => o.title.toLowerCase().includes(q) || o.code.includes(q)).slice(0, 20)
  }, [allAuOccupations, jobSearch])

  const usShortageItems = useMemo<Record<string, string>>(() => {
    if (!selected) return {}
    const occs = data.usShortageByState[selected] ?? []
    return Object.fromEntries(
      occs.map((o) => [
        o.occ_code,
        `${o.occ_title}${o.median_wage != null ? ` · $${o.median_wage.toLocaleString()}` : ""}`,
      ]),
    )
  }, [data.usShortageByState, selected])

  const caShortageItems = useMemo<Record<string, string>>(() => {
    const occs = selected ? Object.values(data.caOccupations).filter((o) => o.occupation_en) : []
    return Object.fromEntries(
      occs.map((o) => [
        o.noc_code,
        `${o.occupation_en}${o.median_salary_cad != null ? ` · C$${o.median_salary_cad.toLocaleString()}` : ""}`,
      ]),
    )
  }, [data.caOccupations, selected])

  const ukShortageItems = useMemo<Record<string, string>>(() => {
    if (!selected) return {}
    const occs = data.ukShortageByRegion[selected] ?? []
    return Object.fromEntries(
      occs.map((o) => [
        o.soc_code,
        `${o.occupation_en}${o.median_salary_gbp != null ? ` · £${o.median_salary_gbp.toLocaleString()}` : ""}`,
      ]),
    )
  }, [data.ukShortageByRegion, selected])

  const deShortageItems = useMemo<Record<string, string>>(() => {
    if (!selected) return {}
    const occs = data.deShortageByRegion?.[selected] ?? []
    return Object.fromEntries(
      occs.map((o) => [
        o.kldb_code,
        `${o.occupation_en}${o.median_salary_eur != null ? ` · €${o.median_salary_eur.toLocaleString()}` : ""}`,
      ]),
    )
  }, [data.deShortageByRegion, selected])

  const nlShortageItems = useMemo<Record<string, string>>(() => {
    if (!selected) return {}
    const occs = data.nlShortageByRegion?.[selected] ?? []
    return Object.fromEntries(
      occs.map((o) => [
        o.sbc_code,
        `${o.occupation_en}${o.median_salary_eur != null ? ` · €${o.median_salary_eur.toLocaleString()}` : ""}`,
      ]),
    )
  }, [data.nlShortageByRegion, selected])

  const beShortageItems = useMemo<Record<string, string>>(() => {
    if (!selected) return {}
    const occs = data.beShortageByRegion?.[selected] ?? []
    return Object.fromEntries(
      occs.map((o) => [
        o.occupation_code,
        `${o.occupation_en}${o.median_salary_eur != null ? ` · €${o.median_salary_eur.toLocaleString()}` : ""}`,
      ]),
    )
  }, [data.beShortageByRegion, selected])

  const filteredIESchools = useMemo(() => {
    if (!ieSchools) return null
    if (!selected || activeCountry !== "IE") return ieSchools
    return ieSchools.filter((s) => IE_CITY_TO_COUNTY[s.city] === selected)
  }, [ieSchools, selected, activeCountry])

  const countryLabel = activeCountry === "AU" ? "🇦🇺 Australia" : activeCountry === "US" ? "🇺🇸 United States" : activeCountry === "CA" ? "🇨🇦 Canada" : activeCountry === "IE" ? "🇮🇪 Ireland" : activeCountry === "UK" ? "🇬🇧 United Kingdom" : activeCountry === "DE" ? "🇩🇪 Germany" : activeCountry === "NL" ? "🇳🇱 Netherlands" : activeCountry === "BE" ? "🇧🇪 Belgium" : activeCountry === "JP" ? "🇯🇵 Japan" : activeCountry === "SG" ? "🇸🇬 Singapore" : activeCountry === "KR" ? "🇰🇷 South Korea" : activeCountry === "FR" ? "🇫🇷 France" : activeCountry === "NZ" ? "🇳🇿 New Zealand" : activeCountry === "NO" ? "🇳🇴 Norway" : activeCountry === "SE" ? "🇸🇪 Sweden" : activeCountry === "DK" ? "🇩🇰 Denmark" : activeCountry === "FI" ? "🇫🇮 Finland" : activeCountry === "CH" ? "🇨🇭 Switzerland" : activeCountry === "AE" ? "🇦🇪 UAE" : ""
  const stateLabel = selected
    ? activeCountry === "AU"
      ? STATE_NAMES[selected as StateCode]
      : activeCountry === "CA"
        ? CA_PROVINCE_NAMES[selected] ?? selected
        : activeCountry === "IE"
          ? IE_COUNTY_NAMES[selected] ?? selected
          : activeCountry === "UK"
            ? UK_REGION_NAMES[selected] ?? selected
            : activeCountry === "DE"
              ? DE_BUNDESLAND_NAMES[selected] ?? selected
              : activeCountry === "NL"
                ? NL_PROVINCE_NAMES[selected] ?? selected
                : activeCountry === "BE"
                  ? BE_REGION_NAMES[selected] ?? selected
                  : activeCountry === "JP"
                    ? JP_PREFECTURE_NAMES[selected as keyof typeof JP_PREFECTURE_NAMES]?.en ?? selected
                    : activeCountry === "SG"
                      ? data.sgAreas.find((area) => area.code === selected)?.nameEn ?? selected
                    : activeCountry === "KR"
                      ? KR_SIDO_NAMES[selected as keyof typeof KR_SIDO_NAMES]?.en ?? selected
                    : activeCountry === "FR"
                      ? FR_REGION_NAMES[selected as keyof typeof FR_REGION_NAMES] ?? selected
                    : activeCountry === "NZ"
                      ? NZ_REGION_NAMES[selected as NZRegionCode] ?? selected
                      : activeCountry === "NO"
                        ? NO_REGION_NAMES[selected as NORegionCode] ?? selected
                        : activeCountry === "SE"
                          ? SE_REGION_NAMES[selected as SERegionCode] ?? selected
                          : activeCountry === "DK"
                            ? DK_REGION_NAMES[selected as DKRegionCode] ?? selected
                            : activeCountry === "FI"
                              ? FI_REGION_NAMES[selected as FIRegionCode] ?? selected
                        : US_STATE_NAMES[selected]
    : ""
  const occLabel = selectedOccCode
    ? activeCountry === "AU"
      ? data.shortageByState[selected as StateCode]?.find((o) => o.anzsco_code === selectedOccCode)?.occupation_en
      : activeCountry === "CA"
        ? data.caOccupations[selectedOccCode]?.occupation_en
    : activeCountry === "DE"
      ? data.deShortageByRegion?.[selected!]?.find((o) => o.kldb_code === selectedOccCode)?.occupation_en
      : activeCountry === "NL"
        ? data.nlShortageByRegion?.[selected!]?.find((o) => o.sbc_code === selectedOccCode)?.occupation_en
        : activeCountry === "NO"
          ? NO_OCCUPATION_BY_CODE.get(selectedOccCode.replace(/^no-/, ""))?.nameEn
        : activeCountry === "KR"
          ? data.krOccupations.find((occupation) => occupation.kscoCode === selectedOccCode)?.nameKo
        : selectedUsOcc?.occ_title
    : ""
  const toolbarSummary = [countryLabel, stateLabel, occLabel].filter(Boolean).join(" · ")

  const toolbarExpanded = !isMobile || expanded

  return (
    <div className={cn("relative h-full w-full overflow-hidden", routeMode && "route-map-mode")}>
        {auOnly ? (
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[2200] p-3">
        <div className="pointer-events-auto flex min-w-0 items-center justify-between gap-2">
          <div className="relative min-w-0 flex-1 max-w-[380px]">
            <div className="flex items-center h-11 rounded-full bg-white shadow-lg ring-1 ring-slate-200/60 px-4 gap-2.5">
              {!isMobile && hasPanelOpen ? (
                <button
                  type="button"
                  onClick={handleMapToolbarBack}
                  aria-label={locale === "ko" ? "이전 정보로 돌아가기" : "Back to map results"}
                  className="shrink-0 rounded-full p-1 hover:bg-slate-100"
                >
                  <ChevronLeft className="h-4 w-4 text-slate-500" />
                </button>
              ) : jobSearchOpen ? (
                <button type="button" onClick={() => { setJobSearch(""); setJobSearchOpen(false) }} className="shrink-0 p-0.5 rounded-full hover:bg-slate-100">
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              ) : (
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
              )}
              {!isMobile && hasPanelOpen && occLabel ? (
                <span className="flex-1 truncate text-sm font-semibold text-slate-800">{occLabel}</span>
              ) : (
                <input
                  type="text"
                  placeholder={locale === "ko" ? "직업 검색" : "Search Jobs"}
                  value={jobSearch}
                  onChange={(e) => { setJobSearch(e.target.value); setJobSearchOpen(true) }}
                  onFocus={() => setJobSearchOpen(true)}
                  onBlur={() => setTimeout(() => setJobSearchOpen(false), 200)}
                  className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              )}
              {!isMobile && hasPanelOpen ? (
                <button
                  type="button"
                  onClick={handleMapToolbarClose}
                  aria-label={locale === "ko" ? "정보 창 닫기" : "Close map information"}
                  className="shrink-0 rounded-full p-1 hover:bg-slate-100"
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setJobSearch(""); setJobSearchOpen(jobSearchOpen ? false : true) }}
                  className="shrink-0 p-1 rounded-full hover:bg-slate-100"
                  aria-label={jobSearchOpen ? "Close filter" : "Open filter"}
                >
                  {jobSearchOpen ? <X className="h-4 w-4 text-slate-400" /> : <SlidersHorizontal className="h-4 w-4 text-slate-400" />}
                </button>
              )}
            </div>
            {jobSearchOpen && (
              <div className="absolute top-full left-0 right-0 z-[2300] mt-1 max-h-80 overflow-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                {!jobSearch.trim() && (
                  <div className="px-4 pt-3 pb-2">
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{locale === "ko" ? "추천 직업" : "Popular Jobs"}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(locale === "ko"
                        ? ["Registered Nurse", "Software Developer", "Construction Worker", "Mining Worker", "Electrician", "Chef"]
                        : ["Registered Nurse", "Software Developer", "Construction Worker", "Mining Worker", "Electrician", "Chef"]
                      ).map((title) => {
                        const match = allAuOccupations.find((o) => o.title === title)
                        if (!match) return null
                        return (
                          <button
                            key={match.code}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setJobSearch(match.title)
                              setSelectedOccCode(match.code)
                              setJobSearchOpen(false)
                              track("click_occupation", { type: "au_search", code: match.code, name: match.title })
                              if (isMobile) setExpanded(false)
                            }}
                            className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                          >
                            {match.title}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
                {filteredAuJobs.length > 0 && (
                  <div className={cn(!jobSearch.trim() && "border-t border-slate-100")}>
                    {!jobSearch.trim() && <div className="px-4 pt-2 pb-1"><p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{locale === "ko" ? "전체 직업" : "All Jobs"}</p></div>}
                    {filteredAuJobs.map((job) => (
                      <button
                        key={job.code}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setJobSearch(job.title)
                          setJobSearchOpen(false)
                          setSelectedOccCode(job.code)
                          track("click_occupation", { type: "au_search", code: job.code, name: job.title })
                          if (isMobile) setExpanded(false)
                        }}
                        className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors"
                      >
                        <span className="truncate text-slate-700">{job.title}</span>
                        <span className="shrink-0 text-xs text-slate-400">{job.code}</span>
                      </button>
                    ))}
                  </div>
                )}
                {filteredAuJobs.length === 0 && jobSearch.trim() && (
                  <p className="px-4 py-6 text-center text-sm text-slate-400">{locale === "ko" ? "검색 결과 없음" : "No results found"}</p>
                )}
              </div>
            )}
          </div>
          {!routeMode && <ToolNavActions minimal className="shrink-0 self-center" />}
        </div>
      </div>
        ) : (
        (activeCountry === "AU" || activeCountry === "US" || activeCountry === "CA" || activeCountry === "IE" || activeCountry === "UK" || activeCountry === "DE" || activeCountry === "NL" || activeCountry === "BE" || activeCountry === "JP" || activeCountry === "SG" || activeCountry === "KR" || activeCountry === "FR" || activeCountry === "ES" || activeCountry === "NZ" || activeCountry === "NO" || activeCountry === "SE" || activeCountry === "DK" || activeCountry === "FI" || activeCountry === "CH" || activeCountry === "AE") && (
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[2200] p-3">
      <div className={cn("pointer-events-auto flex min-h-14 rounded-2xl border border-slate-200 bg-white/95 shadow-[0_14px_35px_rgba(15,23,42,.10)] backdrop-blur-md", isMobile && toolbarExpanded ? "flex-col items-stretch" : "items-center")}>
           {!routeMode && <ToolNavActions className={cn("ml-3 self-center", isMobile && toolbarExpanded && "order-1 mt-3 self-end")} />}
          {!toolbarExpanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="flex min-w-0 flex-1 items-center gap-2 px-4 py-3 text-left text-sm font-medium text-slate-700"
          >
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="truncate">{toolbarSummary || t.map.selectCountryPlaceholder}</span>
            <ChevronDown className="ml-auto h-4 w-4 text-slate-400" />
          </button>
        )}

          {toolbarExpanded && (
      <div className={cn("flex min-w-0 flex-1 flex-wrap items-end gap-3 px-4 py-3", isMobile && "w-full", isMobile && toolbarExpanded && "order-2")}>
        {!auOnly && (
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">{t.map.selectCountry}</span>
          <Select
            items={{ AU: "🇦🇺 Australia", US: "🇺🇸 United States", CA: "🇨🇦 Canada", IE: "🇮🇪 Ireland", UK: "🇬🇧 United Kingdom", DE: "🇩🇪 Germany", NL: "🇳🇱 Netherlands", BE: "🇧🇪 Belgium", JP: "🇯🇵 Japan", SG: "🇸🇬 Singapore", KR: "🇰🇷 South Korea", FR: "🇫🇷 France", ES: "🇪🇸 Spain", NZ: "🇳🇿 New Zealand", NO: "🇳🇴 Norway", SE: "🇸🇪 Sweden", DK: "🇩🇰 Denmark", FI: "🇫🇮 Finland", CH: "🇨🇭 Switzerland" }}
            value={activeCountry ?? undefined}
            onValueChange={(v) => v && onSelectCountry(v as Exclude<ActiveCountry, null>)}
          >
            <SelectTrigger className="h-10 w-44 rounded-lg border-slate-200 text-sm">
              <SelectValue placeholder={t.map.selectCountryPlaceholder} />
            </SelectTrigger>
            <SelectContent className="z-[2000]">
              <SelectItem value="AU">🇦🇺 Australia</SelectItem>
              <SelectItem value="US">🇺🇸 United States</SelectItem>
              <SelectItem value="CA">🇨🇦 Canada</SelectItem>
              <SelectItem value="IE">🇮🇪 Ireland</SelectItem>
              <SelectItem value="UK">🇬🇧 United Kingdom</SelectItem>
              <SelectItem value="DE">🇩🇪 Germany</SelectItem>
              <SelectItem value="NL">🇳🇱 Netherlands</SelectItem>
              <SelectItem value="BE">🇧🇪 Belgium</SelectItem>
              <SelectItem value="JP">🇯🇵 Japan</SelectItem>
              <SelectItem value="SG">🇸🇬 Singapore</SelectItem>
              <SelectItem value="KR">🇰🇷 South Korea</SelectItem>
              <SelectItem value="FR">🇫🇷 France</SelectItem>
              <SelectItem value="ES">🇪🇸 Spain</SelectItem>
              <SelectItem value="NZ">🇳🇿 New Zealand</SelectItem>
              <SelectItem value="NO">🇳🇴 Norway</SelectItem>
              <SelectItem value="SE">🇸🇪 Sweden</SelectItem>
              <SelectItem value="DK">🇩🇰 Denmark</SelectItem>
              <SelectItem value="FI">🇫🇮 Finland</SelectItem>
              <SelectItem value="CH">🇨🇭 Switzerland</SelectItem>
              <SelectItem value="AE">🇦🇪 UAE</SelectItem>
            </SelectContent>
          </Select>
        </label>
        )}

        {activeCountry === "FR" ? (
          <>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">{locale === "ko" ? "레지옹" : "Region"}</span>
              <Select items={FR_REGION_NAMES} value={selected} onValueChange={(value) => { if (value) onSelectState(value) }}>
                <SelectTrigger className="h-10 w-64 rounded-lg border-slate-200 text-sm"><SelectValue placeholder="Select a region" /></SelectTrigger>
                <SelectContent className="z-[2000] max-h-72">{FR_REGION_CODES.map((code) => <SelectItem key={code} value={code}>{FR_REGION_NAMES[code]}</SelectItem>)}</SelectContent>
              </Select>
            </label>
            {selected && (
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">{locale === "ko" ? "도시" : "City"}</span>
                <Select items={Object.fromEntries(data.frCities.filter((city) => city.regionCode === selected).map((city) => [city.code, city.nameFr]))} value={selectedFRCityCode ?? undefined} onValueChange={(value) => setSelectedFRCityCode(value)}>
                  <SelectTrigger className="h-10 w-56 rounded-lg border-slate-200 text-sm"><SelectValue placeholder="Select a city" /></SelectTrigger>
                  <SelectContent className="z-[2000] max-h-72">{data.frCities.filter((city) => city.regionCode === selected).map((city) => <SelectItem key={city.code} value={city.code}>{city.nameFr}</SelectItem>)}</SelectContent>
                </Select>
              </label>
            )}
          </>
        ) : activeCountry === "ES" ? (
          <>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">{locale === "ko" ? "자치주" : "Autonomous community"}</span>
              <Select items={Object.fromEntries(data.esCommunities.map((community) => [community.code, `${community.nameEn} · ${community.nameKo}`]))} value={selected} onValueChange={(value) => { if (value) onSelectState(value) }}>
                <SelectTrigger className="h-10 w-64 rounded-lg border-slate-200 text-sm"><SelectValue placeholder="Select a community" /></SelectTrigger>
                <SelectContent className="z-[2000] max-h-72">{data.esCommunities.map((community) => <SelectItem key={community.code} value={community.code}>{community.nameEn} · {community.nameKo}</SelectItem>)}</SelectContent>
              </Select>
            </label>
            {selected && (
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">{locale === "ko" ? "도시" : "City"}</span>
                <Select items={Object.fromEntries(data.esCities.filter((city) => city.regionCode === selected).map((city) => [city.code, city.nameEs]))} value={selectedESCityCode ?? undefined} onValueChange={(value) => setSelectedESCityCode(value)}>
                  <SelectTrigger className="h-10 w-56 rounded-lg border-slate-200 text-sm"><SelectValue placeholder="Select a city" /></SelectTrigger>
                  <SelectContent className="z-[2000] max-h-72">{data.esCities.filter((city) => city.regionCode === selected).map((city) => <SelectItem key={city.code} value={city.code}>{city.nameEs}</SelectItem>)}</SelectContent>
                </Select>
              </label>
            )}
          </>
        ) : activeCountry === "KR" ? (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">시·도</span>
            <Select items={Object.fromEntries(KR_SIDO_CODES.map((code) => [code, `${KR_SIDO_NAMES[code].ko} · ${KR_SIDO_NAMES[code].en}`]))} value={selected} onValueChange={(value) => { if (value) onSelectState(value) }}>
              <SelectTrigger className="h-10 w-64 rounded-lg border-slate-200 text-sm"><SelectValue placeholder="시·도를 선택하세요" /></SelectTrigger>
              <SelectContent className="z-[2000] max-h-72">{KR_SIDO_CODES.map((code) => <SelectItem key={code} value={code}>{KR_SIDO_NAMES[code].ko} · {KR_SIDO_NAMES[code].en}</SelectItem>)}</SelectContent>
            </Select>
          </label>
        ) : activeCountry === "SG" ? (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">Area</span>
            <Select items={Object.fromEntries(data.sgAreas.map((area) => [area.code, `${area.nameEn} · ${area.nameKo}`]))} value={selected} onValueChange={(value) => { if (value) { setSelected(value); setTab("stateInfo") } }}>
              <SelectTrigger className="h-10 w-64 rounded-lg border-slate-200 text-sm"><SelectValue placeholder="Select an area" /></SelectTrigger>
              <SelectContent className="z-[2000]">{data.sgAreas.map((area) => <SelectItem key={area.code} value={area.code}>{area.nameEn} · {area.nameKo}</SelectItem>)}</SelectContent>
            </Select>
          </label>
        ) : activeCountry === "JP" ? (
          <>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">Prefecture</span>
            <Select items={Object.fromEntries(JP_PREFECTURE_CODES.map((code) => [code, `${JP_PREFECTURE_NAMES[code].en} · ${JP_PREFECTURE_NAMES[code].ja}`]))} value={selected} onValueChange={(v) => { if (v) { setSelected(v); setSelectedJPCityArea(null); setTab("stateInfo") } }}>
              <SelectTrigger className="h-10 w-64 rounded-lg border-slate-200 text-sm"><SelectValue placeholder="Select a prefecture" /></SelectTrigger>
              <SelectContent className="z-[2000] max-h-72">
                {JP_PREFECTURE_CODES.map((code) => <SelectItem key={code} value={code}>{JP_PREFECTURE_NAMES[code].en} · {JP_PREFECTURE_NAMES[code].ja}</SelectItem>)}
              </SelectContent>
            </Select>
          </label>
          {selected && (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">Major city</span>
              <Select items={Object.fromEntries(data.jpCities.filter((city) => city.prefectureCode === selected).map((city) => [city.areaCode, `${city.nameEn} · ${city.nameJa}`]))} value={selectedJPCityArea} onValueChange={setSelectedJPCityArea}>
                <SelectTrigger className="h-10 w-64 rounded-lg border-slate-200 text-sm"><SelectValue placeholder="Select a major city" /></SelectTrigger>
                <SelectContent className="z-[2000]">{data.jpCities.filter((city) => city.prefectureCode === selected).map((city) => <SelectItem key={city.areaCode} value={city.areaCode}>{city.nameEn} · {city.nameJa}</SelectItem>)}</SelectContent>
              </Select>
            </label>
          )}
          </>
        ) : activeCountry === "UK" ? (
          <>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">Region</span>
            <Select
              items={UK_REGION_NAMES}
              value={selected}
              onValueChange={(v) => v && setSelected(v)}
            >
              <SelectTrigger className="h-10 w-56 rounded-lg border-slate-200 text-sm">
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent className="z-[2000]">
                {UK_REGION_CODES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {UK_REGION_NAMES[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          {selected && (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">{t.map.selectOccupation}</span>
              <Select
                items={ukShortageItems}
                value={selectedOccCode ?? null}
                onValueChange={(v) => {
                  if (!v) return
                  setSelectedOccCode(v)
                  if (isMobile) setExpanded(false)
                }}
              >
                <SelectTrigger className="h-10 w-72 xl:w-[min(36vw,34rem)] rounded-lg border-slate-200 text-sm">
                  <SelectValue placeholder={t.map.selectStatePlaceholder} />
                </SelectTrigger>
                <SelectContent className="z-[2000] max-h-72">
                  {(data.ukShortageByRegion[selected] ?? []).map((occ) => {
                    const code = occ.soc_code
                    const title = occ.occupation_en
                    const salary = occ.median_salary_gbp
                    return (
                      <SelectItem key={code} value={code}>
                        <span className="flex items-center justify-between gap-3">
                          <span className="truncate">{title}</span>
                          {salary != null && (
                            <span className="shrink-0 text-xs text-slate-400">
                              £{salary.toLocaleString()}
                            </span>
                          )}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </label>
          )}
          </>
        ) : activeCountry === "DE" ? (
          <>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">Bundesland</span>
            <Select
              items={DE_BUNDESLAND_NAMES}
              value={selected}
              onValueChange={(v) => v && setSelected(v)}
            >
              <SelectTrigger className="h-10 w-56 rounded-lg border-slate-200 text-sm">
                <SelectValue placeholder="Select a Bundesland">
                  {selected ? DE_BUNDESLAND_NAMES[selected] : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="z-[2000]">
                {DE_BUNDESLAND_CODES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {DE_BUNDESLAND_NAMES[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          {selected && (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">{t.map.selectOccupation}</span>
              <Select
                items={deShortageItems}
                value={selectedOccCode ?? null}
                onValueChange={(v) => {
                  if (!v) return
                  const name = data.deOccupations[v]?.occupation_en ?? v
                  track("click_occupation", { type: "de", code: v, name, state: selected ?? undefined })
                  setSelectedOccCode(v)
                  if (isMobile) setExpanded(false)
                }}
              >
                <SelectTrigger className="h-10 w-72 xl:w-[min(36vw,34rem)] rounded-lg border-slate-200 text-sm">
                  <SelectValue placeholder={t.map.selectStatePlaceholder} />
                </SelectTrigger>
                <SelectContent className="z-[2000] max-h-72">
                  {(data.deShortageByRegion?.[selected] ?? []).map((occ) => (
                    <SelectItem key={occ.kldb_code} value={occ.kldb_code}>
                      <span className="flex items-center justify-between gap-3">
                        <span className="truncate">{occ.occupation_en}</span>
                        {occ.median_salary_eur != null && (
                          <span className="shrink-0 text-xs text-slate-400">
                            €{occ.median_salary_eur.toLocaleString()}
                          </span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          )}
          </>
        ) : activeCountry === "BE" ? (
          <>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">Region</span>
            <Select
              items={BE_REGION_NAMES}
              value={selected}
              onValueChange={(v) => v && setSelected(v)}
            >
              <SelectTrigger className="h-10 w-56 rounded-lg border-slate-200 text-sm">
                <SelectValue placeholder="Select a region">
                  {selected ? BE_REGION_NAMES[selected] : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="z-[2000]">
                {BE_REGION_CODES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {BE_REGION_NAMES[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          {selected && (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">{t.map.selectOccupation}</span>
              <Select
                items={beShortageItems}
                value={selectedOccCode ?? null}
                onValueChange={(v) => {
                  if (!v) return
                  const name = data.beOccupations[v]?.occupation_en ?? v
                  track("click_occupation", { type: "be", code: v, name, state: selected ?? undefined })
                  setSelectedOccCode(v)
                  if (isMobile) setExpanded(false)
                }}
              >
                <SelectTrigger className="h-10 w-72 xl:w-[min(36vw,34rem)] rounded-lg border-slate-200 text-sm">
                  <SelectValue placeholder={t.map.selectStatePlaceholder} />
                </SelectTrigger>
                <SelectContent className="z-[2000] max-h-72">
                  {(data.beShortageByRegion?.[selected] ?? []).map((occ) => (
                    <SelectItem key={occ.occupation_code} value={occ.occupation_code}>
                      <span className="flex items-center justify-between gap-3">
                        <span className="truncate">{occ.occupation_en}</span>
                        {occ.median_salary_eur != null && (
                          <span className="shrink-0 text-xs text-slate-400">
                            €{occ.median_salary_eur.toLocaleString()}
                          </span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          )}
          </>
        ) : activeCountry === "NL" ? (
          <>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">Provincie</span>
            <Select
              items={NL_PROVINCE_NAMES}
              value={selected}
              onValueChange={(v) => v && setSelected(v)}
            >
              <SelectTrigger className="h-10 w-56 rounded-lg border-slate-200 text-sm">
                <SelectValue placeholder="Select a province">
                  {selected ? NL_PROVINCE_NAMES[selected] : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="z-[2000]">
                {NL_PROVINCE_CODES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {NL_PROVINCE_NAMES[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          {selected && (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">{t.map.selectOccupation}</span>
              <Select
                items={nlShortageItems}
                value={selectedOccCode ?? null}
                onValueChange={(v) => {
                  if (!v) return
                  const name = data.nlOccupations[v]?.occupation_en ?? v
                  track("click_occupation", { type: "nl", code: v, name, state: selected ?? undefined })
                  setSelectedOccCode(v)
                  if (isMobile) setExpanded(false)
                }}
              >
                <SelectTrigger className="h-10 w-72 xl:w-[min(36vw,34rem)] rounded-lg border-slate-200 text-sm">
                  <SelectValue placeholder={t.map.selectStatePlaceholder} />
                </SelectTrigger>
                <SelectContent className="z-[2000] max-h-72">
                  {(data.nlShortageByRegion?.[selected] ?? []).map((occ) => (
                    <SelectItem key={occ.sbc_code} value={occ.sbc_code}>
                      <span className="flex items-center justify-between gap-3">
                        <span className="truncate">{occ.occupation_en}</span>
                        {occ.median_salary_eur != null && (
                          <span className="shrink-0 text-xs text-slate-400">
                            €{occ.median_salary_eur.toLocaleString()}
                          </span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          )}
          </>
        ) : activeCountry === "IE" ? (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">County</span>
            <Select
              items={IE_COUNTY_NAMES}
              value={selected}
              onValueChange={(v) => v && setSelected(v)}
            >
              <SelectTrigger className="h-10 w-56 rounded-lg border-slate-200 text-sm">
                <SelectValue placeholder="Select a county" />
              </SelectTrigger>
              <SelectContent className="z-[2000]">
                {IE_COUNTY_CODES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {IE_COUNTY_NAMES[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        ) : activeCountry === "NZ" ? (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">Region</span>
            <Select
              items={Object.fromEntries((data.nzRegions ?? []).map((r) => [r.code, r.nameEn]))}
              value={selected}
              onValueChange={(v) => v && setSelected(v)}
            >
              <SelectTrigger className="h-10 w-56 rounded-lg border-slate-200 text-sm">
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent className="z-[2000]">
                {(data.nzRegions ?? []).map((r) => (
                  <SelectItem key={r.code} value={r.code}>
                    {r.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        ) : activeCountry === "NO" ? (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">Region</span>
            <Select
              items={Object.fromEntries((data.noRegions ?? []).map((r) => [r.code, r.nameEn]))}
              value={selected}
              onValueChange={(v) => v && setSelected(v)}
            >
              <SelectTrigger className="h-10 w-56 rounded-lg border-slate-200 text-sm">
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent className="z-[2000]">
                {(data.noRegions ?? []).map((r) => (
                  <SelectItem key={r.code} value={r.code}>
                    {r.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        ) : activeCountry === "SE" ? (
          <label className="block"><span className="mb-1 block text-xs font-medium text-slate-500">Region</span><Select items={Object.fromEntries((data.seRegions ?? []).map((r) => [r.code, r.nameEn]))} value={selected} onValueChange={(v) => v && onSelectState(v)}><SelectTrigger className="h-10 w-56 rounded-lg border-slate-200 text-sm"><SelectValue placeholder="Select a region" /></SelectTrigger><SelectContent className="z-[2000] max-h-72">{(data.seRegions ?? []).map((r) => <SelectItem key={r.code} value={r.code}>{r.nameEn}</SelectItem>)}</SelectContent></Select></label>
        ) : activeCountry === "DK" ? (
          <label className="block"><span className="mb-1 block text-xs font-medium text-slate-500">Region</span><Select items={Object.fromEntries((data.dkRegions ?? []).map((r) => [r.code, r.nameEn]))} value={selected} onValueChange={(v) => v && onSelectState(v)}><SelectTrigger className="h-10 w-56 rounded-lg border-slate-200 text-sm"><SelectValue placeholder="Select a region" /></SelectTrigger><SelectContent className="z-[2000] max-h-72">{(data.dkRegions ?? []).map((r) => <SelectItem key={r.code} value={r.code}>{r.nameEn}</SelectItem>)}</SelectContent></Select></label>
        ) : activeCountry === "FI" ? (
          <label className="block"><span className="mb-1 block text-xs font-medium text-slate-500">Region</span><Select items={Object.fromEntries((data.fiRegions ?? []).map((r) => [r.code, r.nameEn]))} value={selected} onValueChange={(v) => v && onSelectState(v)}><SelectTrigger className="h-10 w-56 rounded-lg border-slate-200 text-sm"><SelectValue placeholder="Select a region" /></SelectTrigger><SelectContent className="z-[2000] max-h-72">{(data.fiRegions ?? []).map((r) => <SelectItem key={r.code} value={r.code}>{r.nameEn}</SelectItem>)}</SelectContent></Select></label>
        ) : activeCountry === "CH" ? (
          <label className="block"><span className="mb-1 block text-xs font-medium text-slate-500">{locale === "ko" ? "칸톤" : "Canton"}</span><Select items={Object.fromEntries((data.chRegions ?? []).map((r) => [r.code, `${r.nameEn} · ${r.nameLocal}`]))} value={selected} onValueChange={(v) => v && onSelectState(v)}><SelectTrigger className="h-10 w-64 rounded-lg border-slate-200 text-sm"><SelectValue placeholder={locale === "ko" ? "칸톤 선택" : "Select a canton"} /></SelectTrigger><SelectContent className="z-[2000] max-h-72">{(data.chRegions ?? []).map((r) => <SelectItem key={r.code} value={r.code}>{r.nameEn} · {r.nameLocal}</SelectItem>)}</SelectContent></Select></label>
        ) : activeCountry === "AE" ? (
          <label className="block"><span className="mb-1 block text-xs font-medium text-slate-500">{locale === "ko" ? "에미리트" : "Emirate"}</span><Select value={selected} onValueChange={(v) => v && onSelectState(v)}><SelectTrigger className="h-10 w-56 rounded-lg border-slate-200 text-sm"><SelectValue placeholder={locale === "ko" ? "에미리트 선택" : "Select an emirate"} /></SelectTrigger><SelectContent className="z-[2000] max-h-72">{AE_EMIRATE_CODES.map((code) => <SelectItem key={code} value={code}>{AE_EMIRATE_NAMES[code].ko} · {AE_EMIRATE_NAMES[code].en}</SelectItem>)}</SelectContent></Select></label>
        ) : (
        <>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">{t.map.selectState}</span>
            <Select
              items={activeCountry === "AU" ? stateItems : activeCountry === "CA" ? CA_PROVINCE_NAMES : US_STATE_NAMES}
              value={selected}
              onValueChange={(v) => {
                if (!v) return
                if (activeCountry === "AU") onSelectState(v)
                else setSelected(v)
              }}
            >
              <SelectTrigger className="h-10 w-56 rounded-lg border-slate-200 text-sm">
                <SelectValue placeholder={t.map.selectStatePlaceholder} />
              </SelectTrigger>
              <SelectContent className="z-[2000]">
                {(activeCountry === "AU" ? STATE_CODES : activeCountry === "CA" ? CA_PROVINCE_CODES : US_STATE_CODES).map((c) => (
                  <SelectItem key={c} value={c}>
                    {activeCountry === "AU" ? STATE_NAMES[c as StateCode] : activeCountry === "CA" ? CA_PROVINCE_NAMES[c] : US_STATE_NAMES[c]}
                  </SelectItem>
                ))}
                {activeCountry === "AU" && (
                  <SelectItem value="WHV">Second Visa</SelectItem>
                )}
              </SelectContent>
            </Select>
          </label>

          {selected !== "WHV" && (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">{t.map.selectOccupation}</span>
              {selected ? (
                <Select
                  items={activeCountry === "AU" ? auShortageItems : activeCountry === "CA" ? caShortageItems : usShortageItems}
                  value={activeCountry === "US" && selectedUsOcc ? selectedUsOcc.occ_code : selectedOccCode ?? null}
                  onValueChange={(v) => {
                    if (!v) return
                    if (activeCountry === "AU") setSelectedOccCode(v)
                    else if (activeCountry === "CA") setSelectedOccCode(v)
                    else {
                      const occ = data.usShortageByState[selected]?.find((o) => o.occ_code === v) ?? null
                      setSelectedUsOcc(occ)
                    }
                    if (isMobile) setExpanded(false)
                  }}
                >
                  <SelectTrigger className="h-10 w-72 xl:w-[min(36vw,34rem)] rounded-lg border-slate-200 text-sm">
                    <SelectValue placeholder={t.map.selectStatePlaceholder} />
                  </SelectTrigger>
                  <SelectContent className="z-[2000] max-h-72">
                    {(activeCountry === "AU"
                      ? data.shortageByState[selected as StateCode] ?? []
                      : activeCountry === "CA"
                        ? Object.values(data.caOccupations)
                        : data.usShortageByState[selected] ?? []
                    ).map((occ) => {
                      const code = activeCountry === "AU" ? (occ as StateOccupation).anzsco_code : activeCountry === "CA" ? (occ as CAOccRow).noc_code : (occ as USOccupation).occ_code
                      const title = activeCountry === "AU" ? (occ as StateOccupation).occupation_en : activeCountry === "CA" ? (occ as CAOccRow).occupation_en : (occ as USOccupation).occ_title
                      const salary = activeCountry === "AU" ? (occ as StateOccupation).median_salary_aud : activeCountry === "CA" ? (occ as CAOccRow).median_salary_cad : (occ as USOccupation).median_wage
                      return (
                        <SelectItem key={code} value={code}>
                          <span className="flex items-center justify-between gap-3">
                            <span className="truncate">{title}</span>
                            {salary != null && (
                              <span className="shrink-0 text-xs text-slate-400">
                                {activeCountry === "CA" ? "C$" : "$"}{salary.toLocaleString()}
                              </span>
                            )}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex h-10 w-72 cursor-not-allowed items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400">
                  {t.map.selectStateFirst}
                </div>
              )}
            </label>
          )}
        </>
        )}

        {isMobile && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100"
          >
            <ChevronUp className="h-5 w-5 text-slate-400" />
          </button>
        )}

        {selected && (
          <button
            type="button"
            onClick={onReset}
            className="mb-0.5 inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t.map.reset}
          </button>
        )}
      </div>
          )}
      </div>
      </div>
    ))}


      <div className="absolute inset-0 z-0">
        {countryDataLoading && (
          <div className="absolute inset-x-4 top-4 z-[1600] mx-auto max-w-sm rounded-xl border border-blue-200 bg-white/95 px-4 py-3 text-center text-sm font-semibold text-blue-800 shadow-lg backdrop-blur" role="status">
            {locale === "ko" ? "국가 데이터를 불러오는 중입니다…" : "Loading country dataset…"}
          </div>
        )}
        {countryDataError && !countryDataLoading && (
          <div className="absolute inset-x-4 top-4 z-[1600] mx-auto max-w-sm rounded-xl border border-red-200 bg-white/95 px-4 py-3 text-center text-sm font-semibold text-red-700 shadow-lg backdrop-blur" role="alert">
            {countryDataError}
          </div>
        )}
        <LeafletMap
          data={data}
          selected={selected}
          selectedSA4={activeCountry === "AU" ? selectedSA4 : null}
          activeCountry={activeCountry}
          selectedFranceCity={selectedFRCityCode}
          selectedSpainCity={selectedESCityCode}
          ieSchools={filteredIESchools ?? undefined}
          onSelectState={onSelectState}
          onSelectCountry={onSelectCountry}
          onSelectSA4={onSelectSA4}
          onSelectFranceCity={(code) => setSelectedFRCityCode(code)}
          onSelectSpainCity={(code) => setSelectedESCityCode(code)}
          showUniversities={!routeMode}
          onSelectUniversity={routeMode ? undefined : (slug: string) => {
            const usUniv = data.usRankedColleges.find((c) => c.slug === slug)
            if (usUniv) {
              setSelectedUniv(usUniv)
              setActiveCountry("US")
              setSelected(usUniv.college_state)
              return
            }
            const auUniv = data.auRankedColleges.find((c) => c.slug === slug)
            if (auUniv) {
              setSelectedUniv(auUniv)
              setActiveCountry("AU")
              setSelected(auUniv.college_state)
              return
            }
            const caUniv = data.caColleges.find((c) => c.slug === slug)
            if (caUniv) {
              setSelectedUniv(caUniv)
              setActiveCountry("CA")
              setSelected(caUniv.province)
              return
            }
            const ukUniv = data.ukColleges.find((c) => c.slug === slug)
            if (ukUniv) {
              setSelectedUniv(ukUniv)
              setActiveCountry("UK")
              setSelected(ukUniv.region)
              return
            }
            const deUniv = data.deColleges.find((c) => c.slug === slug)
            if (deUniv) {
              setSelectedUniv(deUniv)
              setActiveCountry("DE")
              setSelected(deUniv.region)
              return
            }
            const nlUniv = data.nlColleges.find((c) => c.slug === slug)
            if (nlUniv) {
              setSelectedUniv(nlUniv)
              setActiveCountry("NL")
              setSelected(nlUniv.province)
              return
            }
            const krUniv = data.krUniversities.find((c) => c.slug === slug)
            if (krUniv) {
              setSelectedUniv(krUniv)
              setActiveCountry("KR")
              setSelected(krUniv.regionCode)
              return
            }
            const frUniv = data.frUniversities.find((c) => c.slug === slug)
            if (frUniv) {
              setSelectedUniv(frUniv)
              setActiveCountry("FR")
              setSelected(frUniv.regionCode)
              return
            }
            const esUniv = data.esUniversities.find((c) => c.slug === slug)
            if (esUniv) {
              setSelectedUniv(esUniv)
              setActiveCountry("ES")
              setSelected(esUniv.regionCode)
              return
            }
            const nzUniv = data.nzUniversities?.find((c) => c.slug === slug)
            if (nzUniv) {
              setSelectedUniv(nzUniv)
              setActiveCountry("NZ")
              setSelected(nzUniv.regionCode)
              return
            }
            const noUniv = data.noUniversities?.find((c) => c.slug === slug)
            if (noUniv) {
              setSelectedUniv(noUniv)
              setActiveCountry("NO")
              setSelected(noUniv.regionCode)
              return
            }
            const seUniv = data.seUniversities?.find((c) => c.slug === slug)
            if (seUniv) { setSelectedUniv(seUniv); setActiveCountry("SE"); setSelected(seUniv.regionCode); return }
            const dkUniv = data.dkUniversities?.find((c) => c.slug === slug)
            if (dkUniv) { setSelectedUniv(dkUniv); setActiveCountry("DK"); setSelected(dkUniv.regionCode); return }
            const fiUniv = data.fiUniversities?.find((c) => c.slug === slug)
            if (fiUniv) { setSelectedUniv(fiUniv); setActiveCountry("FI"); setSelected(fiUniv.regionCode); return }
            const chUniv = data.chUniversities?.find((c) => c.slug === slug)
            if (chUniv) { setSelectedUniv(chUniv); setActiveCountry("CH"); setSelected(chUniv.cantonCode) }
          }}
          onReset={onReset}
          tab={tab}
        />

        {((selected && !(isMobile && mobileSheetHidden)) || activeCountry === "IE" || activeCountry === "UK" || selectedUniv || hasMapDetail) && (() => {
          const deCity = activeCountry === "DE" && selectedUniv
            ? data.deCities.find((c) => c.name.toLowerCase() === (selectedUniv as DECollege).city_name.toLowerCase())
            : undefined
          const deRegionOccs = activeCountry === "DE" && selectedUniv
            ? (data.deHighPayByRegion[(selectedUniv as DECollege).region] ?? [])
            : undefined
          const nlCity = activeCountry === "NL" && selectedUniv
            ? data.nlCities.find((c) => c.name.toLowerCase() === (selectedUniv as NLCollege).city_name.toLowerCase())
            : undefined
          const nlRegionOccs = activeCountry === "NL" && selectedUniv
            ? (data.nlHighPayByRegion[(selectedUniv as NLCollege).province] ?? [])
            : undefined
          const panel = selectedUniv && activeCountry === "KR" ? (
            <KRUniversityInfoCard university={selectedUniv as KoreaUniversity} onClose={() => setSelectedUniv(null)} />
          ) : selectedUniv && activeCountry === "FR" ? (
            <FRUniversityInfoCard university={selectedUniv as FranceUniversity} onClose={() => setSelectedUniv(null)} />
          ) : selectedUniv && activeCountry === "ES" ? (
            <ESUniversityInfoCard university={selectedUniv as SpainUniversity} onClose={() => setSelectedUniv(null)} />
          ) : selectedUniv && activeCountry === "NZ" ? (
            <NZUniversityInfoCard university={selectedUniv as NZUniversity} onClose={() => setSelectedUniv(null)} locale={locale} />
          ) : selectedUniv && activeCountry === "NO" ? (
            <NOUniversityInfoCard university={selectedUniv as NOUniversity} onClose={() => setSelectedUniv(null)} locale={locale} />
          ) : selectedUniv && (activeCountry === "SE" || activeCountry === "DK" || activeCountry === "FI") ? (
            <NordicUniversityInfoCard university={selectedUniv as SEUniversity | DKUniversity | FIUniversity} onClose={() => setSelectedUniv(null)} locale={locale} />
          ) : selectedUniv && activeCountry === "CH" ? (
            <CHUniversityInfoCard university={selectedUniv as CHUniversity} onClose={() => setSelectedUniv(null)} locale={locale} />
          ) : selectedUniv ? (
            <UniversityInfoCard
              college={selectedUniv as USRankedCollege | AURankedCollege | CACollege | UKCollege | DECollege | NLCollege}
              onClose={() => setSelectedUniv(null)}
              showInlineClose={!auOnly}
              isSaved={savedUnivSlugs.has(selectedUniv.slug)}
              onToggleSave={toggleSaveUniv}
              onShare={shareUniv}
              country={activeCountry}
              deCity={deCity}
              deRegionOccs={deRegionOccs}
              nlCity={nlCity}
              nlRegionOccs={nlRegionOccs}
            />
          ) : activeCountry === "IE" ? (
            <IEPanel
              schools={filteredIESchools}
              countyName={selected ? stateLabel : undefined}
              onClose={onClosePanel}
            />
          ) : (
            <Panel
              data={data}
              selected={selected!}
              selectedSA4={activeCountry === "AU" ? selectedSA4 : null}
              tab={tab}
              onTab={setTab}
              onClose={onClosePanel}
              neroData={activeCountry === "AU" ? neroData : null}
              regionData={activeCountry === "AU" ? regionData : null}
              activeCountry={activeCountry}
              selectedJPCity={activeCountry === "JP" ? data.jpCities.find((city) => city.areaCode === selectedJPCityArea) ?? null : null}
              selectedFRCity={activeCountry === "FR" ? data.frCities.find((city) => city.code === selectedFRCityCode) ?? null : null}
              selectedESCity={activeCountry === "ES" ? data.esCities.find((city) => city.code === selectedESCityCode) ?? null : null}
              jpProfilesByCode={jpProfilesByCode}
              selectedOccCode={selectedOccCode}
              setSelectedOccCode={setSelectedOccCode}
              selectedUsOcc={selectedUsOcc}
              setSelectedUsOcc={setSelectedUsOcc}
              savedOccCodes={savedOccCodes}
              onToggleSave={toggleSaveOcc}
              onShare={shareOcc}
              auLabourMarket={activeCountry === "AU" ? auLabourMarket : null}
              selectedNeroA4={selectedNeroA4}
              setSelectedNeroA4={setSelectedNeroA4}
              routeMode={routeMode}
              onSelectCollege={(c) => {
                setSelectedUniv(c)
                setActiveCountry("UK")
                setSelected(c.region)
              }}
              searchBarDetailControls={auOnly}
            />
          )
          return isMobile ? (
            <MobileSheet onBack={handleMapToolbarBack} onClose={handleMapToolbarClose}>{panel}</MobileSheet>
          ) : (
            <div className={cn("absolute left-4 z-[1000] flex w-[380px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl", auOnly && hasPanelOpen ? "top-16 max-h-[calc(100%-4rem)]" : "top-4 max-h-[calc(100%-2rem)]")}>
              {panel}
            </div>
          )
        })()}
      </div>

      {shareOpen && (() => {
        const shareUrl = (() => {
          const url = new URL(window.location.href)
          url.searchParams.set("country", activeCountry?.toLowerCase() ?? "au")
          if (selected) url.searchParams.set("state", selected)
          return url.toString()
        })()
        const shareOccRow = selectedOccCode
          ? activeCountry === "AU"
            ? data.shortageByState[selected as StateCode]?.find((o) => o.anzsco_code === selectedOccCode)
            : activeCountry === "CA"
              ? data.caOccupations[selectedOccCode]
              : activeCountry === "UK"
                ? data.ukShortageByRegion?.[selected!]?.find((o) => o.soc_code === selectedOccCode)
                : activeCountry === "DE"
                  ? data.deShortageByRegion?.[selected!]?.find((o) => o.kldb_code === selectedOccCode)
                  : activeCountry === "NL"
                    ? data.nlShortageByRegion?.[selected!]?.find((o) => o.sbc_code === selectedOccCode)
                    : null
          : null
        const _r = shareOccRow as unknown as Record<string, unknown> | null
        const salary = _r
          ? (_r.median_salary_aud as number | null)
            ?? (_r.median_salary_cad as number | null)
            ?? (_r.median_salary_gbp as number | null)
            ?? (_r.median_salary_eur as number | null)
            ?? null
          : null
        const currency = activeCountry === "AU" ? "A$" : activeCountry === "CA" ? "C$" : activeCountry === "UK" ? "£" : "€"
        const shareTitle = occLabel || stateLabel || countryLabel
        const parts = [stateLabel, salary != null ? `${currency}${salary.toLocaleString()}` : null].filter(Boolean)
        return (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShareOpen(false)}>
            <div className="w-full max-w-md mx-4 rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Share</h3>
                <button type="button" onClick={() => setShareOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mb-4">
                <p className="text-base font-semibold text-slate-900">{shareTitle}</p>
                {parts.length > 0 && (
                  <p className="text-sm text-slate-500 mt-0.5">{parts.join(" · ")}</p>
                )}
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 mb-4">
                <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="flex-1 truncate text-sm text-slate-600">{shareUrl}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl)
                  setCopiedLink(true)
                  setTimeout(() => setCopiedLink(false), 2000)
                }}
                className={cn(
                  "w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                  copiedLink ? "bg-emerald-500 text-white" : "bg-slate-900 text-white hover:bg-slate-800"
                )}
              >
                {copiedLink ? (locale === "ko" ? "클립보드에 복사됨" : "COPIED TO CLIPBOARD") : (locale === "ko" ? "링크 복사" : "COPY LINK")}
              </button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

function KRUniversityInfoCard({ university, onClose }: { university: KoreaUniversity; onClose: () => void }) {
  const region = KR_SIDO_NAMES[university.regionCode as keyof typeof KR_SIDO_NAMES]
  return <><div className="flex items-start justify-between border-b border-slate-200 px-5 py-4"><div><p className="text-xs text-slate-500">{region?.ko ?? university.regionCode} · {university.cityName}</p><h2 className="mt-1 text-lg font-semibold text-slate-950">{university.nameKo}</h2><p className="text-sm text-slate-500">{university.nameEn}</p></div><button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div><div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4"><div className="rounded-lg border border-violet-200 bg-violet-50 p-4"><p className="text-xs font-medium text-violet-700">QS World University Rankings 2027</p><p className="mt-1 text-2xl font-semibold text-violet-950">#{university.qsRank2027}</p><a href={university.qsRankSourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:underline">QS 출처 <ExternalLink className="h-3 w-3" /></a></div>{university.averageTuitionKrw != null ? <div className="rounded-lg border border-slate-200 p-4"><p className="text-xs text-slate-500">평균 등록금</p><p className="mt-1 font-semibold">KRW {university.averageTuitionKrw.toLocaleString()}</p></div> : <p className="rounded-lg border border-slate-200 p-4 text-sm text-slate-500">대학알리미 원자료와 이용 조건이 확인되면 평균 등록금을 표시합니다.</p>}<a href={university.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">공식 사이트 <ExternalLink className="h-3.5 w-3.5" /></a></div></>
}

function FRUniversityInfoCard({ university, onClose }: { university: FranceUniversity; onClose: () => void }) {
  const regionName = FR_REGION_NAMES[university.regionCode as keyof typeof FR_REGION_NAMES] ?? university.regionName
  return <><div className="flex items-start justify-between border-b border-slate-200 px-5 py-4"><div><p className="text-xs text-slate-500">{regionName} · {university.cityName}</p><h2 className="mt-1 text-lg font-semibold text-slate-950">{university.nameFr}</h2><p className="text-sm text-slate-500">{university.nameEn}</p></div><button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div><div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">{university.qsRank2027 != null && <div className="rounded-lg border border-violet-200 bg-violet-50 p-4"><p className="text-xs font-medium text-violet-700">QS World University Rankings 2027</p><p className="mt-1 text-2xl font-semibold text-violet-950">#{university.qsRank2027}</p>{university.qsRankSourceUrl && <a href={university.qsRankSourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:underline">QS source <ExternalLink className="h-3 w-3" /></a>}</div>}<div className="rounded-lg border border-slate-200 p-4"><p className="text-xs text-slate-500">Institution type</p><p className="mt-1 font-semibold text-slate-950">{university.institutionType}</p>{university.studentCount != null && <p className="mt-2 text-sm text-slate-600">{university.studentCount.toLocaleString()} enrolled students</p>}</div><a href={university.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">Official site <ExternalLink className="h-3.5 w-3.5" /></a><a href={university.sourceUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-slate-500 hover:underline">MESR source · checked {university.lastChecked}</a></div></>
}

function ESUniversityInfoCard({ university, onClose }: { university: SpainUniversity; onClose: () => void }) {
  return <><div className="flex items-start justify-between border-b border-slate-200 px-5 py-4"><div><p className="text-xs text-slate-500">{university.regionName} · {university.cityName}</p><h2 className="mt-1 text-lg font-semibold text-slate-950">{university.nameEs}</h2><p className="text-sm text-slate-500">{university.nameEn}</p></div><button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div><div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4"><div className="rounded-lg border border-slate-200 p-4"><p className="text-xs text-slate-500">Institution type</p><p className="mt-1 font-semibold text-slate-950">{university.institutionType}</p>{university.relatedFields.length > 0 && <p className="mt-2 text-sm text-slate-600">{university.relatedFields.join(" · ")}</p>}</div><a href={university.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">Official site <ExternalLink className="h-3.5 w-3.5" /></a><a href={university.sourceUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-slate-500 hover:underline">RUCT source · checked {university.lastChecked}</a></div></>
}

function NZInfoPanel({ region, universities, shortageCount, locale }: { region: NZRegion | null; universities: NZUniversity[]; shortageCount: number; locale: string }) {
  if (!region) {
    return <p className="py-8 text-center text-sm text-slate-400">{locale === "ko" ? "지역을 선택하세요" : "Select a region"}</p>
  }
  return (
    <div className="space-y-4 px-4 py-3">
      <div className="rounded-lg border border-slate-200 p-4">
        <p className="text-xs font-medium text-slate-500">{locale === "ko" ? "지역 정보" : "Region Info"}</p>
        <h3 className="mt-1 text-lg font-semibold text-slate-950">{region.nameEn}</h3>
        {region.rent.status === "available" && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">{locale === "ko" ? "주간 렌트비" : "Weekly Rent"}</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">NZ${region.rent.weeklyNzd.toLocaleString()}</p>
              <p className="mt-0.5 text-[10px] text-slate-400">{region.rent.period}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">{locale === "ko" ? "월간 렌트비" : "Monthly Rent"}</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">NZ${region.rent.monthlyNzd.toLocaleString()}</p>
              <p className="mt-0.5 text-[10px] text-slate-400">{region.rent.definition}</p>
            </div>
          </div>
        )}
        {shortageCount > 0 && (
          <div className="mt-3 rounded-lg bg-violet-50 p-3">
            <p className="text-xs text-violet-700">{locale === "ko" ? "부족 직종 수" : "Shortage Occupations"}</p>
            <p className="mt-1 text-lg font-semibold text-violet-950">{shortageCount}</p>
              </div>
            )}
          </div>
      {universities.length > 0 && (
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500">{locale === "ko" ? "대학교" : "Universities"}</p>
          <ul className="mt-2 space-y-2">
            {universities.map((u) => (
              <li key={u.slug} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-slate-800">{u.nameEn}</p>
                  <p className="text-xs text-slate-500">{u.cityName}{u.worldRanking ? ` · QS #${u.worldRanking}` : ""}</p>
                </div>
                <a href={u.officialUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-violet-700 hover:underline">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function NZShortageList({ rows, locale, onSelectOcc }: { rows: NZOccupation[]; locale: string; onSelectOcc?: (code: string) => void }) {
  const [limit, setLimit] = useState(10)
  const visible = rows.slice(0, limit)
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">{locale === "ko" ? "부족 직종 데이터가 없습니다" : "No shortage data available"}</p>
  }
  return (
    <ol>
      {visible.map((occ, i) => (
        <li key={occ.anzscoCode}>
          <button
            type="button"
            onClick={() => onSelectOcc?.(occ.anzscoCode)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
          >
            <span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{i + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-800">
                {locale === "ko" ? occ.nameKo : occ.nameEn}
              </span>
              <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  occ.shortageRating >= 4 ? "bg-red-100 text-red-700" : occ.shortageRating >= 3 ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                )}>
                  {locale === "ko" ? `부족도 ${occ.shortageRating}` : `Shortage ${occ.shortageRating}`}
                </span>
                <span className="text-[10px] text-slate-400">{occ.relatedField}</span>
              </span>
            </span>
            <span className="shrink-0 text-right text-sm font-semibold tabular-nums text-slate-700">
              ${(occ.medianSalaryNzd / 1000).toFixed(0)}k
            </span>
          </button>
        </li>
      ))}
      {limit < rows.length && (
        <li>
          <button
            type="button"
            onClick={() => setLimit((p) => Math.min(p + 10, rows.length))}
            className="flex w-full items-center justify-center gap-1 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            {locale === "ko" ? "더보기" : "Show more"} ({rows.length - limit})
          </button>
        </li>
      )}
    </ol>
  )
}

function NZHighPayList({ rows, locale, onSelectOcc }: { rows: NZOccupation[]; locale: string; onSelectOcc?: (code: string) => void }) {
  const [limit, setLimit] = useState(10)
  const visible = rows.slice(0, limit)
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">{locale === "ko" ? "급여 데이터가 없습니다" : "No salary data available"}</p>
  }
  return (
    <ol>
      {visible.map((occ, i) => (
        <li key={occ.anzscoCode}>
          <button
            type="button"
            onClick={() => onSelectOcc?.(occ.anzscoCode)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
          >
            <span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{i + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-800">
                {locale === "ko" ? occ.nameKo : occ.nameEn}
              </span>
              <span className="mt-0.5 text-[10px] text-slate-400">{occ.relatedField}</span>
            </span>
            <span className="shrink-0 text-right text-sm font-semibold tabular-nums text-slate-700">
              ${(occ.medianSalaryNzd / 1000).toFixed(0)}k
            </span>
          </button>
        </li>
      ))}
      {limit < rows.length && (
        <li>
          <button
            type="button"
            onClick={() => setLimit((p) => Math.min(p + 10, rows.length))}
            className="flex w-full items-center justify-center gap-1 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            {locale === "ko" ? "더보기" : "Show more"} ({rows.length - limit})
          </button>
        </li>
      )}
    </ol>
  )
}

function NZUniversityInfoCard({ university, onClose, locale }: { university: NZUniversity; onClose: () => void; locale: string }) {
  return (
    <>
      <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <p className="text-xs text-slate-500">{NZ_REGION_NAMES[university.regionCode as NZRegionCode] ?? university.regionCode} · {university.cityName}</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">{university.nameEn}</h2>
          <p className="text-sm text-slate-500">{university.nameKo}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {university.worldRanking && (
          <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
            <p className="text-xs font-medium text-violet-700">QS World University Rankings 2027</p>
            <p className="mt-1 text-2xl font-semibold text-violet-950">#{university.worldRanking}</p>
          </div>
        )}
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-500">{locale === "ko" ? "기관 유형" : "Institution type"}</p>
          <p className="mt-1 font-semibold text-slate-950">{university.institutionType}</p>
          {university.relatedFields.length > 0 && (
            <p className="mt-2 text-sm text-slate-600">{university.relatedFields.join(" · ")}</p>
          )}
        </div>
        <a href={university.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
          {locale === "ko" ? "공식 사이트" : "Official site"} <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </>
  )
}

function NOUniversityInfoCard({ university, onClose, locale }: { university: NOUniversity; onClose: () => void; locale: string }) {
  return <><div className="flex items-start justify-between border-b border-slate-200 px-5 py-4"><div><p className="text-xs text-slate-500">{NO_REGION_NAMES[university.regionCode as NORegionCode] ?? university.regionCode} · {university.cityName}</p><h2 className="mt-1 text-lg font-semibold text-slate-950">{university.nameEn}</h2><p className="text-sm text-slate-500">{university.nameKo}</p></div><button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div><div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">{university.worldRanking && <div className="rounded-lg border border-violet-200 bg-violet-50 p-4"><p className="text-xs font-medium text-violet-700">QS World University Rankings</p><p className="mt-1 text-2xl font-semibold text-violet-950">#{university.worldRanking}</p></div>}<div className="rounded-lg border border-slate-200 p-4"><p className="text-xs text-slate-500">{locale === "ko" ? "기관 유형" : "Institution type"}</p><p className="mt-1 font-semibold text-slate-950">{university.institutionType}</p>{university.relatedFields.length > 0 && <p className="mt-2 text-sm text-slate-600">{university.relatedFields.join(" · ")}</p>}</div><a href={university.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">{locale === "ko" ? "공식 사이트" : "Official site"} <ExternalLink className="h-3.5 w-3.5" /></a></div></>
}

function NordicUniversityInfoCard({ university, onClose, locale }: { university: SEUniversity | DKUniversity | FIUniversity; onClose: () => void; locale: string }) {
  return <><div className="flex items-start justify-between border-b border-slate-200 px-5 py-4"><div><p className="text-xs text-slate-500">{university.cityName}</p><h2 className="mt-1 text-lg font-semibold text-slate-950">{university.nameEn}</h2><p className="text-sm text-slate-500">{university.nameKo}</p></div><button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div><div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">{university.worldRanking && <div className="rounded-lg border border-violet-200 bg-violet-50 p-4"><p className="text-xs font-medium text-violet-700">QS World University Rankings</p><p className="mt-1 text-2xl font-semibold text-violet-950">#{university.worldRanking}</p></div>}<div className="rounded-lg border border-slate-200 p-4"><p className="text-xs text-slate-500">{locale === "ko" ? "기관 유형" : "Institution type"}</p><p className="mt-1 font-semibold text-slate-950">{university.institutionType}</p>{university.relatedFields.length > 0 && <p className="mt-2 text-sm text-slate-600">{university.relatedFields.join(" · ")}</p>}</div><a href={university.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">{locale === "ko" ? "공식 사이트" : "Official site"} <ExternalLink className="h-3.5 w-3.5" /></a></div></>
}

function nzJobSearchUrls(occ: NZOccupation, regionName?: string): Array<{ label: string; url: string }> {
  const q = encodeURIComponent([occ.nameEn, regionName].filter(Boolean).join(" "))
  return [
    { label: "Seek", url: `https://www.seek.co.nz/${occ.nameEn.toLowerCase().replace(/\s+/g, "-")}-jobs?search=${q}` },
    { label: "Indeed", url: `https://nz.indeed.com/jobs?q=${q}` },
    { label: "Immigration NZ", url: "https://www.immigration.govt.nz/work/requirements-for-work-visas/green-list-occupations-qualifications-and-skills/green-list-roles-jobs-we-need-people-for-in-new-zealand/" },
    { label: "Careers NZ", url: `https://www.careers.govt.nz/jobs-search?search=${q}` },
  ]
}

function NZOccupationDetail({
  occ,
  regionName,
  regionCode,
  universities,
  locale,
  onBack,
  onClose,
}: {
  occ: NZOccupation | null
  regionName: string
  regionCode: string
  universities: NZUniversity[]
  locale: string
  onBack: () => void
  onClose: () => void
}) {
  const name = occ ? (locale === "ko" ? occ.nameKo : occ.nameEn) : regionName
  const shortageWidth = occ ? Math.round((occ.shortageRating / 5) * 100) : 0
  const nzUnivsByField = occ
    ? universities.filter((u) => u.relatedFields.includes(occ.relatedField))
    : universities
  const jobLinks = occ ? nzJobSearchUrls(occ, regionName) : []

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-4">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          {null}
        </button>
        <button type="button" onClick={onClose} aria-label="Close" className="-mr-1 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {occ ? (
          <>
            <h2 className="font-sans text-lg font-semibold text-slate-900 tracking-tight">{name}</h2>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Badge tone="gray">ANZSCO {occ.anzscoCode}</Badge>
              {occ.shortageRating >= 4 && <Badge tone="gray">{locale === "ko" ? "높은 부족" : "High Shortage"}</Badge>}
              {occ.shortageRating >= 3 && occ.shortageRating < 4 && <Badge tone="amber">{locale === "ko" ? "부족" : "Shortage"}</Badge>}
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{locale === "ko" ? "중위 급여 (NZD)" : "Median Salary (NZD)"}</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-slate-800">NZ${occ.medianSalaryNzd.toLocaleString()}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">{occ.employmentThousands.toLocaleString()}k {locale === "ko" ? "고용" : "employed"}</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{locale === "ko" ? "국가 부족도" : "National Shortage"}</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", occ.shortageRating >= 4 ? "bg-red-500" : occ.shortageRating >= 3 ? "bg-amber-500" : "bg-blue-500")} style={{ width: `${shortageWidth}%` }} />
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-700">{occ.shortageRating}/5</span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{locale === "ko" ? "관련 분야" : "Related Field"}</p>
                <p className="mt-1 text-sm font-medium text-slate-800">{occ.relatedField}</p>
                {regionName && (
                  <p className="mt-0.5 text-[10px] text-slate-400">{locale === "ko" ? `${regionName} 지역` : `${regionName} region`}</p>
                )}
              </div>

              {nzUnivsByField.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">{locale === "ko" ? "관련 대학" : "Related Universities"}</p>
                  <div className="space-y-2">
                    {nzUnivsByField.map((u) => (
                      <a key={u.slug} href={u.officialUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-md border border-slate-100 bg-white p-2.5 transition-colors hover:border-slate-300 hover:bg-slate-50">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{u.nameEn}</p>
                          <p className="text-[10px] text-slate-400">{u.cityName}{u.worldRanking ? ` · QS #${u.worldRanking}` : ""}</p>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {jobLinks.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">{locale === "ko" ? "구인 사이트" : "Job Search"}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                    {jobLinks.map((link) => (
                      <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-[11px] text-blue-600 hover:text-blue-800 underline underline-offset-2">
                        <ExternalLink className="h-3 w-3" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </>
        ) : (
          <p className="py-8 text-center text-sm text-slate-400">{locale === "ko" ? "직업을 선택하세요" : "Select an occupation"}</p>
        )}
      </div>

      <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
        Sources: Immigration NZ · Seek · Stats NZ · QS World University Rankings
      </p>
    </>
  )
}

function NOInfoPanel({ region, cities, universities, shortageCount, locale }: { region: NORegion | null; cities: MapData["noCities"]; universities: NOUniversity[]; shortageCount: number; locale: string }) {
  if (!region) return <p className="py-8 text-center text-sm text-slate-400">{locale === "ko" ? "지역을 선택하세요" : "Select a region"}</p>
  return <div className="space-y-4 px-4 py-3">
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="text-xs font-medium text-slate-500">{locale === "ko" ? "지역 정보" : "Region info"}</p>
      <h3 className="mt-1 text-lg font-semibold text-slate-950">{region.nameEn}</h3>
      {region.rent.status === "available" && <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{locale === "ko" ? "주간 렌트비" : "Weekly rent"}</p><p className="mt-1 text-lg font-semibold text-slate-950">NOK {region.rent.weeklyNok.toLocaleString()}</p><p className="mt-0.5 text-[10px] text-slate-400">{region.rent.period}</p></div>
        <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{locale === "ko" ? "월간 렌트비" : "Monthly rent"}</p><p className="mt-1 text-lg font-semibold text-slate-950">NOK {region.rent.monthlyNok.toLocaleString()}</p><p className="mt-0.5 text-[10px] text-slate-400">{region.rent.definition}</p></div>
      </div>}
      <div className="mt-3 rounded-lg bg-violet-50 p-3"><p className="text-xs text-violet-700">{locale === "ko" ? "표시 가능한 부족 직종" : "Listed shortage occupations"}</p><p className="mt-1 text-lg font-semibold text-violet-950">{shortageCount}</p></div>
    </div>
    {cities.length > 0 && <div className="rounded-lg border border-slate-200 p-4"><p className="text-xs font-medium text-slate-500">{locale === "ko" ? "대표 도시" : "Representative cities"}</p><ul className="mt-2 space-y-2">{cities.map((city) => <li key={city.code} className="rounded-lg bg-slate-50 px-3 py-2"><p className="text-sm font-medium text-slate-800">{locale === "ko" ? city.nameKo : city.nameEn}</p>{city.rent.status === "available" && city.rent.monthlyNok != null && <p className="mt-0.5 text-xs text-slate-500">{locale === "ko" ? "월 렌트" : "Monthly rent"} · NOK {city.rent.monthlyNok.toLocaleString()}</p>}</li>)}</ul></div>}
    <NOUniversities universities={universities} locale={locale} />
  </div>
}

function NOUniversities({ universities, locale }: { universities: NOUniversity[]; locale: string }) {
  if (universities.length === 0) return null
  return <div className="rounded-lg border border-slate-200 p-4"><p className="text-xs font-medium text-slate-500">{locale === "ko" ? "대학교" : "Universities"}</p><ul className="mt-2 space-y-2">{universities.map((university) => <li key={university.slug} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"><div><p className="text-sm font-medium text-slate-800">{university.nameEn}</p><p className="text-xs text-slate-500">{university.cityName}{university.worldRanking ? ` · QS #${university.worldRanking}` : ""}</p></div><a href={university.officialUrl} target="_blank" rel="noopener noreferrer" aria-label={`${university.nameEn} official site`} className="text-xs font-semibold text-violet-700 hover:underline"><ExternalLink className="h-3.5 w-3.5" /></a></li>)}</ul></div>
}

function NOShortageList({ rows, locale, onSelectOcc }: { rows: NOOccupation[]; locale: string; onSelectOcc: (code: string) => void }) {
  if (rows.length === 0) return <p className="py-8 text-center text-sm text-slate-400">{locale === "ko" ? "부족 직종 데이터가 없습니다" : "No shortage data available"}</p>
  return <ol>{rows.slice(0, 20).map((occ, index) => <li key={occ.stykrCode}><button type="button" onClick={() => onSelectOcc(occ.stykrCode)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-slate-50"><span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{index + 1}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-800">{locale === "ko" ? occ.nameKo : occ.nameEn}</span><span className="mt-0.5 block text-[10px] text-slate-400">STYRK-08 {occ.stykrCode} · {occ.relatedField}</span></span><span className="shrink-0 text-xs font-semibold text-rose-700">{locale === "ko" ? `부족도 ${occ.shortageRating}` : `Shortage ${occ.shortageRating}`}</span></button></li>)}</ol>
}

function NOHighPayList({ rows, locale, onSelectOcc }: { rows: NOOccupation[]; locale: string; onSelectOcc: (code: string) => void }) {
  if (rows.length === 0) return <p className="py-8 text-center text-sm text-slate-400">{locale === "ko" ? "급여 데이터가 없습니다" : "No salary data available"}</p>
  return <ol>{rows.slice(0, 20).map((occ, index) => <li key={occ.stykrCode}><button type="button" onClick={() => onSelectOcc(occ.stykrCode)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-slate-50"><span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{index + 1}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-800">{locale === "ko" ? occ.nameKo : occ.nameEn}</span><span className="mt-0.5 block text-[10px] text-slate-400">STYRK-08 {occ.stykrCode} · {occ.relatedField}</span></span><span className="shrink-0 text-sm font-semibold tabular-nums text-slate-700">NOK {(occ.medianSalaryNok / 1000).toFixed(0)}k</span></button></li>)}</ol>
}

function NOOccupationDetail({ occ, regionName, universities, locale, onBack, onClose }: { occ: NOOccupation | null; regionName: string; universities: NOUniversity[]; locale: string; onBack: () => void; onClose: () => void }) {
  if (!occ) return <p className="py-8 text-center text-sm text-slate-400">{locale === "ko" ? "직업을 선택하세요" : "Select an occupation"}</p>
  const relatedUniversities = universities.filter((university) => university.relatedFields.includes(occ.relatedField))
  return <><div className="flex items-center justify-between border-b border-slate-200 px-5 py-3"><button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"><ChevronLeft className="h-4 w-4" />Back</button><button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div><div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4"><div><p className="text-xs text-slate-500">{regionName} · STYRK-08 {occ.stykrCode}</p><h2 className="mt-1 text-xl font-semibold text-slate-950">{locale === "ko" ? occ.nameKo : occ.nameEn}</h2><p className="mt-1 text-sm text-slate-500">{locale === "ko" ? occ.nameEn : occ.nameKo}</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-[11px] text-slate-500">{locale === "ko" ? "중위 연봉" : "Median salary"}</p><p className="mt-1 text-base font-semibold">NOK {occ.medianSalaryNok.toLocaleString()}</p><p className="mt-1 text-[11px] text-slate-500">{occ.sourceYear}</p></div><div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-[11px] text-slate-500">{locale === "ko" ? "부족도" : "Shortage rating"}</p><p className="mt-1 text-base font-semibold">{occ.shortageRating}/5</p><p className="mt-1 text-[11px] text-slate-500">{occ.employmentThousands.toLocaleString()}k employed</p></div></div><div className="rounded-lg border border-slate-200 p-3"><p className="text-xs text-slate-500">Related field</p><p className="mt-1 text-sm font-medium">{occ.relatedField}</p></div><NOUniversities universities={relatedUniversities} locale={locale} /><a href={`https://www.finn.no/job/fulltime/search.html?q=${encodeURIComponent(occ.nameEn)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">FINN job search <ExternalLink className="h-3.5 w-3.5" /></a></div></>
}

type NordicMapOccupation = {
  code: string; classification: string; nameEn: string; nameKo: string; medianSalary: number; employmentThousands: number; shortageRating: number; relatedField: string; sourceYear: string
}
type NordicMapCity = { code: string; nameEn: string; nameKo: string; monthlyRent: number | null }
type NordicMapUniversity = { slug: string; nameEn: string; cityName: string; officialUrl: string; worldRanking: number | null; institutionType: string; relatedFields: string[] }
type NordicMapRegion = { nameEn: string; monthlyRent: number; weeklyRent: number; period: string; definition: string }

function NordicInfoPanel({ region, cities, universities, shortageCount, currency, locale }: { region: NordicMapRegion | null; cities: NordicMapCity[]; universities: NordicMapUniversity[]; shortageCount: number; currency: string; locale: string }) {
  if (!region) return <p className="py-8 text-center text-sm text-slate-400">{locale === "ko" ? "지역을 선택하세요" : "Select a region"}</p>
  return <div className="space-y-4 px-4 py-3"><div className="rounded-lg border border-slate-200 p-4"><p className="text-xs font-medium text-slate-500">{locale === "ko" ? "지역 정보" : "Region information"}</p><h3 className="mt-1 text-lg font-semibold text-slate-950">{region.nameEn}</h3><div className="mt-3 grid grid-cols-2 gap-3"><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{locale === "ko" ? "주간 평균 렌트" : "Weekly rent"}</p><p className="mt-1 text-lg font-semibold text-slate-950">{currency} {region.weeklyRent.toLocaleString()}</p><p className="mt-0.5 text-[10px] text-slate-400">{region.period}</p></div><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{locale === "ko" ? "월간 평균 렌트" : "Monthly rent"}</p><p className="mt-1 text-lg font-semibold text-slate-950">{currency} {region.monthlyRent.toLocaleString()}</p><p className="mt-0.5 text-[10px] text-slate-400">{region.definition}</p></div></div><div className="mt-3 rounded-lg bg-violet-50 p-3"><p className="text-xs text-violet-700">{locale === "ko" ? "표시 가능한 부족 직종" : "Listed shortage occupations"}</p><p className="mt-1 text-lg font-semibold text-violet-950">{shortageCount}</p></div></div>{cities.length > 0 && <div className="rounded-lg border border-slate-200 p-4"><p className="text-xs font-medium text-slate-500">{locale === "ko" ? "대표 도시" : "Representative cities"}</p><ul className="mt-2 space-y-2">{cities.map((city) => <li key={city.code} className="rounded-lg bg-slate-50 px-3 py-2"><p className="text-sm font-medium text-slate-800">{locale === "ko" ? city.nameKo : city.nameEn}</p>{city.monthlyRent != null && <p className="mt-0.5 text-xs text-slate-500">{locale === "ko" ? "월 렌트" : "Monthly rent"} · {currency} {city.monthlyRent.toLocaleString()}</p>}</li>)}</ul></div>}<NordicUniversities universities={universities} locale={locale} /></div>
}

function NordicUniversities({ universities, locale }: { universities: NordicMapUniversity[]; locale: string }) {
  if (!universities.length) return null
  return <div className="rounded-lg border border-slate-200 p-4"><p className="text-xs font-medium text-slate-500">{locale === "ko" ? "대학교" : "Universities"}</p><ul className="mt-2 space-y-2">{universities.map((university) => <li key={university.slug} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"><div><p className="text-sm font-medium text-slate-800">{university.nameEn}</p><p className="text-xs text-slate-500">{university.cityName}{university.worldRanking ? ` · QS #${university.worldRanking}` : ""}</p></div><a href={university.officialUrl} target="_blank" rel="noopener noreferrer" aria-label={`${university.nameEn} official site`} className="text-xs font-semibold text-violet-700 hover:underline"><ExternalLink className="h-3.5 w-3.5" /></a></li>)}</ul></div>
}

function NordicOccupationList({ rows, kind, currency, locale, onSelect }: { rows: NordicMapOccupation[]; kind: "shortage" | "pay"; currency: string; locale: string; onSelect: (code: string) => void }) {
  if (!rows.length) return <p className="py-8 text-center text-sm text-slate-400">{locale === "ko" ? "표시할 데이터가 없습니다" : "No data available"}</p>
  return <ol>{rows.slice(0, 20).map((occ, index) => <li key={occ.code}><button type="button" onClick={() => onSelect(occ.code)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-slate-50"><span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{index + 1}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-800">{locale === "ko" ? occ.nameKo : occ.nameEn}</span><span className="mt-0.5 block text-[10px] text-slate-400">{occ.classification} {occ.code} · {occ.relatedField}</span></span><span className={kind === "shortage" ? "shrink-0 text-xs font-semibold text-rose-700" : "shrink-0 text-sm font-semibold tabular-nums text-slate-700"}>{kind === "shortage" ? (locale === "ko" ? `부족도 ${occ.shortageRating}` : `Shortage ${occ.shortageRating}`) : `${currency} ${(occ.medianSalary / 1000).toFixed(0)}k`}</span></button></li>)}</ol>
}

function NordicOccupationDetail({ occ, regionName, universities, currency, locale, jobSearchUrl, onBack, onClose }: { occ: NordicMapOccupation | null; regionName: string; universities: NordicMapUniversity[]; currency: string; locale: string; jobSearchUrl: string; onBack: () => void; onClose: () => void }) {
  if (!occ) return <p className="py-8 text-center text-sm text-slate-400">{locale === "ko" ? "직업을 선택하세요" : "Select an occupation"}</p>
  const related = universities.filter((university) => university.relatedFields.includes(occ.relatedField))
  return <><div className="flex items-center justify-between border-b border-slate-200 px-5 py-3"><button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"><ChevronLeft className="h-4 w-4" />Back</button><button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div><div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4"><div><p className="text-xs text-slate-500">{regionName} · {occ.classification} {occ.code}</p><h2 className="mt-1 text-xl font-semibold text-slate-950">{locale === "ko" ? occ.nameKo : occ.nameEn}</h2><p className="mt-1 text-sm text-slate-500">{locale === "ko" ? occ.nameEn : occ.nameKo}</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-[11px] text-slate-500">{locale === "ko" ? "중위 연봉" : "Median salary"}</p><p className="mt-1 text-base font-semibold">{currency} {occ.medianSalary.toLocaleString()}</p><p className="mt-1 text-[11px] text-slate-500">{occ.sourceYear}</p></div><div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-[11px] text-slate-500">{locale === "ko" ? "부족도" : "Shortage rating"}</p><p className="mt-1 text-base font-semibold">{occ.shortageRating}/5</p><p className="mt-1 text-[11px] text-slate-500">{occ.employmentThousands.toLocaleString()}k employed</p></div></div><div className="rounded-lg border border-slate-200 p-3"><p className="text-xs text-slate-500">Related field</p><p className="mt-1 text-sm font-medium">{occ.relatedField}</p></div><NordicUniversities universities={related} locale={locale} /><a href={jobSearchUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">{locale === "ko" ? "구인 검색" : "Job search"} <ExternalLink className="h-3.5 w-3.5" /></a></div></>
}

function CHInfoPanel({ region, cities, universities, shortageCount, locale }: { region: CHRegion | null; cities: MapData["chCities"]; universities: CHUniversity[]; shortageCount: number; locale: string }) {
  if (!region) return <p className="py-8 text-center text-sm text-slate-400">{locale === "ko" ? "칸톤을 선택하세요" : "Select a canton"}</p>
  return <div className="space-y-4 px-4 py-3">
    <section className="rounded-lg border border-slate-200 p-4">
      <p className="text-xs font-medium text-slate-500">{locale === "ko" ? "칸톤 정보" : "Canton information"}</p>
      <h3 className="mt-1 text-lg font-semibold text-slate-950">{region.nameEn} <span className="font-normal text-slate-500">· {region.nameLocal}</span></h3>
      <p className="mt-2 text-xs text-slate-500">{locale === "ko" ? "공용 언어" : "Official language(s)"} · {region.officialLanguages.join(", ")}</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{locale === "ko" ? "월 렌트" : "Monthly rent"}</p><p className="mt-1 text-sm font-semibold text-slate-800">{region.rent.monthlyChf == null ? (locale === "ko" ? "공식 비교 수치 없음" : "Not available") : `CHF ${region.rent.monthlyChf.toLocaleString()}`}</p><p className="mt-1 text-[10px] text-slate-400">{region.rent.definition}</p></div>
        <div className="rounded-lg bg-violet-50 p-3"><p className="text-xs text-violet-700">{locale === "ko" ? "검증된 부족 직군" : "Verified shortage occupations"}</p><p className="mt-1 text-lg font-semibold text-violet-950">{shortageCount}</p><p className="mt-1 text-[10px] text-violet-700">{locale === "ko" ? "칸톤별 공식 원본만 표시" : "Canton-level official data only"}</p></div>
      </div>
    </section>
    {cities.length > 0 && <section className="rounded-lg border border-slate-200 p-4"><p className="text-xs font-medium text-slate-500">{locale === "ko" ? "대표 도시" : "Representative city"}</p>{cities.map((city) => <div key={city.code} className="mt-2 rounded-lg bg-slate-50 px-3 py-2"><p className="text-sm font-medium text-slate-800">{locale === "ko" ? city.nameKo : city.nameEn}</p><p className="text-xs text-slate-500">{city.nameLocal}</p></div>)}</section>}
    <CHUniversities universities={universities} locale={locale} />
    <p className="px-1 text-[11px] leading-5 text-slate-500">{locale === "ko" ? "경계: " : "Boundaries: "}<a className="underline hover:text-slate-800" href="https://www.swisstopo.admin.ch/en/landscape-model-swissboundaries3d" target="_blank" rel="noopener noreferrer">swisstopo swissBOUNDARIES3D</a> · {locale === "ko" ? "교육기관: " : "Institutions: "}<a className="underline hover:text-slate-800" href="https://www.swissuniversities.ch/en/topics/studying/accredited-swiss-higher-education-institutions" target="_blank" rel="noopener noreferrer">swissuniversities</a> · {locale === "ko" ? "렌트: " : "Rent: "}<a className="underline hover:text-slate-800" href="https://www.bfs.admin.ch/bfs/en/home/statistics/construction-housing/dwellings/rents.html" target="_blank" rel="noopener noreferrer">FSO</a></p>
  </div>
}

function CHUniversities({ universities, locale }: { universities: CHUniversity[]; locale: string }) {
  if (!universities.length) return null
  return <section className="rounded-lg border border-slate-200 p-4"><p className="text-xs font-medium text-slate-500">{locale === "ko" ? "공인 고등교육기관" : "Accredited higher-education institutions"}</p><ul className="mt-2 space-y-2">{universities.map((university) => <li key={university.slug} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"><div><p className="text-sm font-medium text-slate-800">{university.nameEn}</p><p className="text-xs text-slate-500">{university.institutionType} · {university.cityName}</p></div><a href={university.officialUrl} target="_blank" rel="noopener noreferrer" aria-label={`${university.nameEn} official website`} className="text-violet-700 hover:text-violet-900"><ExternalLink className="h-4 w-4" /></a></li>)}</ul></section>
}

function CHHighPayList({ rows, locale }: { rows: CHOccupationGroup[]; locale: string }) {
  return <div className="space-y-3"><div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">{locale === "ko" ? "FSO의 2024년 스위스 전국 CH-ISCO 직업군 중위 월급입니다. 칸톤별 또는 개별 직업 연봉이 아닙니다." : "FSO 2024 Switzerland-wide CH-ISCO occupation-group median monthly wages; not canton or individual-career salaries."} <a className="font-semibold underline" href="https://www.pxweb.bfs.admin.ch/pxweb/fr/px-x-0304010000_205/px-x-0304010000_205.px/" target="_blank" rel="noopener noreferrer">FSO source</a></div><ol>{rows.map((row, index) => <li key={row.chIscoCode} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50"><span className="w-5 text-sm tabular-nums text-slate-400">{index + 1}</span><span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-800">{locale === "ko" ? row.nameKo : row.nameEn}</span><span className="block text-[10px] text-slate-400">CH-ISCO-19 {row.chIscoCode} · {row.sourceYear}</span></span><span className="shrink-0 text-sm font-semibold tabular-nums text-slate-700">CHF {row.medianMonthlyChf.toLocaleString()}</span></li>)}</ol></div>
}

function CHShortageNotice({ locale }: { locale: string }) {
  return <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600"><p className="font-medium text-slate-800">{locale === "ko" ? "공식 칸톤별 부족직군 수치가 없습니다" : "No official canton-by-occupation shortage dataset is available"}</p><p className="mt-2 text-xs leading-5">{locale === "ko" ? "SECO의 직업 신고 의무 목록은 실업률 기준 자료이므로 부족직군 순위로 사용하지 않습니다." : "SECO job-registration data is unemployment-based and is not shown as a shortage ranking."} <a className="underline hover:text-slate-800" href="https://www.arbeit.swiss/en/employers/job-registration-requirement-and-check-up-for-2026" target="_blank" rel="noopener noreferrer">SECO</a></p></div>
}

function AEInfoPanel({ emirate, locale }: { emirate: import("@/data/ae-map-data").UAEEmirate | null; locale: string }) {
  if (!emirate) return <p className="py-8 text-center text-sm text-slate-400">{locale === "ko" ? "에미리트를 선택하세요" : "Select an emirate"}</p>
  return (
    <div className="space-y-4 px-4 py-3">
      <section className="rounded-lg border border-slate-200 p-4">
        <p className="text-xs font-medium text-slate-500">{locale === "ko" ? "에미리트 정보" : "Emirate information"}</p>
        <h3 className="mt-1 text-lg font-semibold text-slate-950">{locale === "ko" ? emirate.nameKo : emirate.nameEn} <span className="font-normal text-slate-500">· {emirate.nameEn}</span></h3>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{locale === "ko" ? "면적" : "Area"}</p><p className="mt-1 text-sm font-semibold text-slate-800">{emirate.areaSqkm.toLocaleString()} km²</p></div>
          <div className="rounded-lg bg-amber-50 p-3"><p className="text-xs text-amber-700">{locale === "ko" ? "부족 직군 수" : "Shortage occupations"}</p><p className="mt-1 text-lg font-semibold text-amber-950">39</p><p className="mt-1 text-[10px] text-amber-700">{locale === "ko" ? "전국 통계 (에미리트별 미분리)" : "National total (not split by emirate)"}</p></div>
        </div>
        <div className="mt-3 rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">{locale === "ko" ? "공식 언어" : "Official language"}</p>
          <p className="mt-1 text-sm font-medium text-slate-800">{locale === "ko" ? "아랍어 (공식), 영어 (비즈니스)" : "Arabic (official), English (business)"}</p>
        </div>
        <div className="mt-3 rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">{locale === "ko" ? "통화" : "Currency"}</p>
          <p className="mt-1 text-sm font-medium text-slate-800">AED (Dirham) — {locale === "ko" ? "소득세 없음" : "No income tax"}</p>
        </div>
      </section>
      <section className="rounded-lg border border-slate-200 p-4">
        <p className="text-xs font-medium text-slate-500">{locale === "ko" ? "골든비자 요건" : "Golden Visa eligibility"}</p>
        <p className="mt-1 text-sm text-slate-700">{locale === "ko" ? "특정 전문직 종사자, 투자자, 우수 인재에게 5~10년 장기 거주 비자를 발급합니다." : "5-10 year long-term residence visa for eligible professionals, investors, and outstanding talents."}</p>
        <p className="mt-2 text-[10px] text-slate-400">{locale === "ko" ? "MOHRE Level 1-2 직종, 월 AED 30,000 이상 조건" : "MOHRE Level 1-2 occupations, monthly salary ≥ AED 30,000"}</p>
      </section>
      <p className="px-1 text-[11px] leading-5 text-slate-500">{locale === "ko" ? "경계: " : "Boundaries: "}<a className="underline hover:text-slate-800" href="https://data.humdata.org/dataset/cod-ab-are" target="_blank" rel="noopener noreferrer">HDX COD-AB ARE</a> · {locale === "ko" ? "직업: " : "Occupations: "}<a className="underline hover:text-slate-800" href="https://www.mohre.gov.ae/en/services.aspx" target="_blank" rel="noopener noreferrer">MOHRE</a> · {locale === "ko" ? "급여: " : "Salary: "}<a className="underline hover:text-slate-800" href="https://www.cooperfitch.com/salary-guide" target="_blank" rel="noopener noreferrer">Cooper Fitch</a></p>
    </div>
  )
}

function AEShortageList({ data: aeShortage, locale }: { data: typeof import("@/data/ae-map-data").AE_SHORTAGE_OCCUPATIONS; locale: string }) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const categories = Object.entries(aeShortage.categories) as Array<[string, { total_demand_occupations: number; top_demand: Array<{ rank: number; occupation: string; occupation_ko: string; mohre_level: number; min_salary_aed: number; demand_reason: string; golden_visa_eligible: boolean }> }]>
  const categoryLabels: Record<string, { en: string; ko: string }> = {
    healthcare: { en: "Healthcare", ko: "의료" },
    engineering_technology: { en: "Engineering & Technology", ko: "공학·기술" },
    finance_banking: { en: "Finance & Banking", ko: "금융·은행" },
    education: { en: "Education", ko: "교육" },
    legal: { en: "Legal", ko: "법률" },
    science_research: { en: "Science & Research", ko: "과학·연구" },
    creative_design: { en: "Creative & Design", ko: "크리에이티브·디자인" },
    telecommunications: { en: "Telecommunications", ko: "통신" },
  }
  return (
    <div className="space-y-2 px-4 py-3">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        {locale === "ko" ? `전체 ${aeShortage.summary.total_demand_occupations}개 부족 직종 · 골든비자 대상 ${aeShortage.summary.golden_visa_eligible_count}개` : `${aeShortage.summary.total_demand_occupations} demand occupations · ${aeShortage.summary.golden_visa_eligible_count} Golden Visa eligible`}
      </div>
      {categories.map(([key, cat]) => {
        const label = categoryLabels[key] ?? { en: key, ko: key }
        const isExpanded = expandedCategory === key
        return (
          <div key={key} className="rounded-lg border border-slate-200">
            <button type="button" onClick={() => setExpandedCategory(isExpanded ? null : key)} className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-slate-50">
              <span className="text-sm font-medium text-slate-800">{locale === "ko" ? label.ko : label.en}</span>
              <span className="flex items-center gap-2"><span className="text-xs text-slate-400">{cat.top_demand.length}</span>{isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}</span>
            </button>
            {isExpanded && (
              <div className="border-t border-slate-100 px-3 py-2">
                {cat.top_demand.map((occ) => (
                  <div key={occ.rank} className="flex items-start gap-2 py-1.5">
                    <span className="w-5 shrink-0 text-xs tabular-nums text-slate-400">{occ.rank}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800">{occ.occupation}</p>
                      <p className="text-[10px] text-slate-400">{occ.occupation_ko}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {occ.golden_visa_eligible && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">GV</span>}
                      <span className="text-[10px] text-slate-400">MOHRE L{occ.mohre_level}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function AEHighPayList({ data: aeHighPay, locale }: { data: typeof import("@/data/ae-map-data").AE_HIGH_INCOME_OCCUPATIONS; locale: string }) {
  return (
    <div className="space-y-3 px-4 py-3">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        {locale === "ko" ? "UAE 연봉 상위 10개 직종 (Cooper Fitch 2024). UAE는 소득세가 없습니다." : "Top 10 highest-paying occupations in UAE (Cooper Fitch 2024). UAE has no personal income tax."}
      </div>
      <ol>
        {aeHighPay.top_10_high_income_occupations.map((occ) => (
          <li key={occ.rank} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50">
            <span className="w-5 text-sm tabular-nums text-slate-400">{occ.rank}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-slate-800">{occ.occupation}</span>
              <span className="block text-[10px] text-slate-400">{occ.sector}</span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-sm font-semibold tabular-nums text-slate-700">AED {(occ.monthly_min_aed / 1000).toFixed(0)}K–{(occ.monthly_max_aed / 1000).toFixed(0)}K</span>
              <span className="block text-[10px] text-slate-400">{locale === "ko" ? "/월" : "/mo"}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function CHUniversityInfoCard({ university, onClose, locale }: { university: CHUniversity; onClose: () => void; locale: string }) {
  return <div className="px-5 py-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-violet-700">{university.institutionType}</p><h2 className="mt-1 text-xl font-semibold text-slate-950">{university.nameEn}</h2><p className="mt-1 text-sm text-slate-500">{university.nameKo} · {university.cityName}</p></div><button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div><div className="mt-5 rounded-lg border border-slate-200 p-4"><p className="text-xs text-slate-500">{locale === "ko" ? "국제학생 이용 가능 여부" : "International-student availability"}</p><p className="mt-1 text-sm font-medium">{university.internationalStudentAvailability}</p><p className="mt-3 text-xs text-slate-500">{locale === "ko" ? "과정별 자격은 학교 공식 페이지에서 확인하세요." : "Confirm programme-specific eligibility on the institution’s official site."}</p></div><a href={university.officialUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 hover:underline">{locale === "ko" ? "공식 웹사이트" : "Official website"}<ExternalLink className="h-3.5 w-3.5" /></a></div>
}

function KRInfoPanel({
  region,
  universities,
  demandCount,
}: {
  region: MapData["krRegions"][number] | null
  universities: MapData["krUniversities"]
  demandCount: number
}) {
  if (!region) return <p className="py-8 text-center text-sm text-slate-400">시·도를 선택하세요.</p>
  const rent = region.rent
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-900">주거비: 아파트 40~85㎡</p>
        {rent.status === "available" ? (
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm"><div className="rounded-md bg-slate-50 p-3"><p className="text-xs text-slate-500">월세</p><p className="mt-1 font-semibold">KRW {rent.monthlyRentKrw?.toLocaleString()}/월</p><p className="mt-1 text-xs text-slate-500">보증금 KRW {rent.monthlyDepositKrw?.toLocaleString()}</p></div><div className="rounded-md bg-slate-50 p-3"><p className="text-xs text-slate-500">전세</p><p className="mt-1 font-semibold">KRW {rent.jeonseDepositKrw?.toLocaleString()}</p><p className="mt-1 text-xs text-slate-500">월세로 환산하지 않음</p></div></div>
        ) : <p className="mt-2 text-sm leading-6 text-slate-500">최근 12개월 실거래 표본과 상업 이용 조건을 확인 중입니다. 월세와 전세는 절대 임의 환산하지 않습니다.</p>}
      </div>
      <div className="rounded-lg border border-slate-200 p-4"><p className="text-sm font-semibold text-slate-900">직업·산업 신호</p><p className="mt-2 text-sm text-slate-600">공개 후보 직업 {demandCount}개</p>{region.promisingIndustries.length > 0 ? <ul className="mt-3 space-y-2 text-sm">{region.promisingIndustries.slice(0, 3).map((industry) => <li key={industry.nameKo} className="rounded-md bg-slate-50 p-2"><span className="font-medium">{industry.nameKo}</span><span className="ml-2 text-xs text-slate-500">고용 증가·채용·특화도 근거</span></li>)}</ul> : <p className="mt-2 text-sm text-slate-500">고용 증가율, 채용·공석, 산업 특화도 세 근거가 모두 확인되면 유망 업종을 표시합니다.</p>}</div>
      <div className="rounded-lg border border-slate-200 p-4"><p className="text-sm font-semibold text-slate-900">QS Top 500 대학 핀</p>{universities.length > 0 ? <div className="mt-3 space-y-2">{universities.map((university) => <a key={university.slug} href={`/map/kr/university/${university.slug}`} className="block rounded-md bg-slate-50 p-2 text-sm hover:bg-slate-100"><span className="font-medium">{university.nameKo}</span><span className="ml-2 text-slate-500">QS #{university.qsRank2027}</span></a>)}</div> : <p className="mt-2 text-sm text-slate-500">이 지역의 검증된 QS 대학 핀이 아직 없습니다.</p>}</div>
    </div>
  )
}

function FRInfoPanel({ region, city, universities, demandCount, locale }: { region: MapData["frRegions"][number] | null; city: FranceCity | null; universities: FranceUniversity[]; demandCount: number; locale: "en" | "ko" }) {
  const isKo = locale === "ko"
  if (!region) return <p className="py-8 text-center text-sm text-slate-400">{isKo ? "프랑스 레지옹을 선택하세요." : "Select a French region."}</p>
  const rent = city?.rent ?? region.rent
  const value = rent.advertisedRentEurM2
  return <div className="space-y-4">
    <div className="rounded-lg border border-slate-200 p-4"><p className="text-sm font-semibold text-slate-900">{city ? `${city.nameFr} ${isKo ? "주거비 기준" : "housing reference"}` : isKo ? "지역 주거비 기준" : "Regional housing reference"}</p>{value != null ? <><p className="mt-2 text-2xl font-semibold text-slate-950">€{Math.round(value * 30).toLocaleString()}/month</p><p className="mt-1 text-xs leading-5 text-slate-500">{isKo ? "공식 임대광고 지표를 30㎡ 기준 월 임대료로 환산한 참고값입니다. 실제 평균 월세나 실시간 매물가는 아닙니다." : "30 m² monthly reference derived from the official advertised-rent indicator. It is not an observed average or live listing price."} {city ? `${city.rent.observationCount?.toLocaleString() ?? "n/a"} listings · R² ${city.rent.r2Adjusted?.toFixed(2) ?? "n/a"}` : `${region.rent.cityCoverage}/${region.rent.sourceCityCount} eligible release cities`}</p></> : <p className="mt-2 text-sm text-slate-500">{isKo ? "품질 기준을 충족한 임대료 지표가 없습니다." : "A quality-eligible rent indicator is not available for this selection."}</p>}</div>
    <div className="rounded-lg border border-slate-200 p-4"><p className="text-sm font-semibold text-slate-900">{isKo ? "고용 수요 범위" : "Labour-market coverage"}</p><p className="mt-2 text-sm text-slate-600">{city ? `${city.basinName} ${isKo ? "고용권역" : "employment basin"}` : `${demandCount} ${isKo ? "개 공개 BMO 직업군" : "published BMO occupation groups"}`}</p><p className="mt-1 text-xs leading-5 text-slate-500">{isKo ? "France Travail BMO는 고용주의 채용 의향을 기록한 자료이며, 법정 부족직업 목록은 아닙니다." : "France Travail BMO records employer recruitment intentions. It is not a statutory shortage-occupation list."}</p></div>
    <div className="rounded-lg border border-slate-200 p-4"><p className="text-sm font-semibold text-slate-900">{isKo ? "공공 고등교육기관 핀" : "Public higher-education pins"}</p>{universities.length > 0 ? <div className="mt-3 space-y-2">{universities.slice(0, 6).map((university) => <a key={university.slug} href={`/map/fr/university/${university.slug}`} className="block rounded-md bg-slate-50 p-2 text-sm hover:bg-slate-100"><span className="font-medium">{university.nameFr}</span>{university.qsRank2027 != null ? <span className="ml-2 text-xs text-violet-700">QS #{university.qsRank2027}</span> : <span className="ml-2 text-xs text-slate-500">{university.cityName}</span>}</a>)}</div> : <p className="mt-2 text-sm text-slate-500">{isKo ? "이 지역의 검증된 공공기관 핀이 없습니다." : "No validated public institution pins are available for this region."}</p>}</div>
  </div>
}

function FRDemandList({ rows, onSelect, locale }: { rows: Array<FranceDemandOccupation & { regionalProjects: number }>; onSelect: (code: string) => void; locale: "en" | "ko" }) {
  const isKo = locale === "ko"
  return <div className="space-y-2">{rows.slice(0, 20).map((occupation, index) => <button type="button" key={occupation.bmoCode} onClick={() => onSelect(occupation.bmoCode)} className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-left hover:border-slate-400 hover:bg-slate-50"><span className="w-5 shrink-0 text-xs font-semibold text-slate-400">{index + 1}</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900">{isKo ? occupation.nameKo ?? occupation.localName : occupation.nameEn ?? occupation.localName}</span><span className="mt-0.5 block text-xs text-slate-500">{isKo ? occupation.nameEn ?? occupation.localName : occupation.nameKo ?? occupation.localName} · FAP2021</span></span><span className="shrink-0 text-right text-xs font-semibold text-rose-800">{occupation.regionalProjects.toLocaleString()}<span className="block text-[10px] font-normal text-slate-500">{isKo ? "채용계획" : "projects"}</span></span></button>)}</div>
}

function FRSalaryList({ rows, onSelect, locale }: { rows: FranceSalaryGroup[]; onSelect: (code: string) => void; locale: "en" | "ko" }) {
  const isKo = locale === "ko"
  return <div className="space-y-2">{rows.map((salary) => { const label = FR_PCS_LABELS[salary.pcsCode]; return <button type="button" key={salary.pcsCode} onClick={() => onSelect(salary.pcsCode)} className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-left hover:border-slate-400 hover:bg-slate-50"><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900">{isKo ? label.nameKo : label.nameEn}</span><span className="mt-0.5 block text-xs text-slate-500">{isKo ? label.nameEn : label.nameKo} · PCS {salary.pcsCode}</span></span><span className="shrink-0 text-right text-xs font-semibold text-emerald-800">€{Math.round(salary.monthlyNetEur).toLocaleString()}<span className="block text-[10px] font-normal text-slate-500">{isKo ? "월 순임금" : "net / month"}</span></span></button> })}</div>
}

function ESInfoPanel({ community, city, universities, shortageCount }: { community: MapData["esCommunities"][number] | null; city: SpainCity | null; universities: SpainUniversity[]; shortageCount: number }) {
  if (!community) return <p className="py-8 text-center text-sm text-slate-400">Select an autonomous community.</p>
  const monthlyRent = community.rent.monthlyEur
  return <div className="space-y-4">
    <div className="rounded-lg border border-slate-200 p-4"><p className="text-sm font-semibold text-slate-900">{city ? `${city.nameEs} housing reference` : "Regional housing reference"}</p>{monthlyRent != null ? <><p className="mt-2 text-2xl font-semibold text-slate-950">€{Math.round(monthlyRent).toLocaleString()}/month</p><p className="mt-1 text-xs leading-5 text-slate-500">Official SERPAVI average monthly rent reference for {community.nameEs}. It is not a live listing price.</p></> : <p className="mt-2 text-sm text-slate-500">No published official monthly-rent reference is available for this selection.</p>}</div>
    <div className="rounded-lg border border-slate-200 p-4"><p className="text-sm font-semibold text-slate-900">Work opportunity signals</p><p className="mt-2 text-sm text-slate-600">{shortageCount} hard-to-fill occupation groups with a SEPE source signal.</p><p className="mt-1 text-xs leading-5 text-slate-500">A province-listing can support an employer work-permit application, but does not guarantee a visa or an offer.</p></div>
    <div className="rounded-lg border border-slate-200 p-4"><p className="text-sm font-semibold text-slate-900">University pins</p>{universities.length > 0 ? <div className="mt-3 space-y-2">{universities.slice(0, 6).map((university) => <a key={university.slug} href={`/map/es/university/${university.slug}`} className="block rounded-md bg-slate-50 p-2 text-sm hover:bg-slate-100"><span className="font-medium">{university.nameEs}</span><span className="ml-2 text-xs text-slate-500">{university.cityName}</span></a>)}</div> : <p className="mt-2 text-sm text-slate-500">No validated RUCT university pins are available for this community.</p>}</div>
  </div>
}

function ESShortageList({ rows, onSelect }: { rows: SpainOccupation[]; onSelect: (code: string) => void }) {
  return <div className="space-y-2">{rows.slice(0, 20).map((occupation, index) => <button type="button" key={occupation.code} onClick={() => onSelect(occupation.code)} className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-left hover:border-slate-400 hover:bg-slate-50"><span className="w-5 shrink-0 text-xs font-semibold text-slate-400">{index + 1}</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900">{occupation.nameEn ?? occupation.localName}</span><span className="mt-0.5 block text-xs text-slate-500">{occupation.nameKo ?? occupation.localName} · {occupation.localName}</span></span><span className="shrink-0 text-right text-xs font-semibold text-rose-800">SEPE<span className="block text-[10px] font-normal text-slate-500">hard to fill</span></span></button>)}</div>
}

function ESHighPayList({ rows, onSelect }: { rows: SpainSalaryGroup[]; onSelect: (salary: SpainSalaryGroup) => void }) {
  return <div className="space-y-2">{rows.slice(0, 20).map((salary) => <button type="button" key={salary.cnoCode} onClick={() => onSelect(salary)} className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-left hover:border-slate-400 hover:bg-slate-50"><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900">{salary.nameEn}</span><span className="mt-0.5 block text-xs text-slate-500">{salary.nameKo} · {salary.nameEs} · CNO {salary.cnoCode}</span></span><span className="shrink-0 text-right text-xs font-semibold text-emerald-800">€{Math.round(salary.regionalAnnualGrossEur ?? salary.annualGrossEur ?? 0).toLocaleString()}<span className="block text-[10px] font-normal text-slate-500">gross / year</span></span></button>)}</div>
}

function ESShortageOccupationDetail({ occupation, communityName, province, onBack, onClose }: { occupation: SpainOccupation; communityName: string; province: MapData["esProvinces"][number] | null; onBack: () => void; onClose: () => void }) {
  const jobUrl = spainJobSearchUrl(occupation, province)
  return <><div className="flex items-center justify-between border-b border-slate-200 px-5 py-3"><button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"><ChevronLeft className="h-4 w-4" />목록</button><button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div><div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4"><div><p className="text-xs text-slate-500">{communityName} · {occupation.sourceQuarter} · SEPE</p><h2 className="mt-1 text-xl font-semibold text-slate-950">{occupation.nameEn ?? occupation.localName}</h2><p className="mt-1 text-sm text-slate-500">{occupation.nameKo ?? "한국어 번역 검토 대기"} · {occupation.localName}</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-[11px] text-slate-500">Foreign-hiring signal</p><p className="mt-1 text-base font-semibold">SEPE listed</p><p className="mt-1 text-[11px] text-slate-500">{occupation.provinceCodes.length} provinces</p></div><div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-[11px] text-slate-500">Study fields</p><p className="mt-1 text-base font-semibold">{occupation.studyFields.length > 0 ? occupation.studyFields.join(", ") : "Review pending"}</p></div></div><div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">SEPE listing is an employment-access signal that may support an employer work-permit application. It does not guarantee a visa, sponsorship, or a job offer. Regulated professions may require degree recognition.</div><a href={jobUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3 hover:bg-emerald-100"><span><span className="block text-sm font-semibold text-emerald-950">Spain official job search</span><span className="mt-1 block text-xs text-emerald-700">Search {occupation.localName}{province ? ` in ${province.nameEs}` : ""}</span></span><ExternalLink className="h-4 w-4 text-emerald-700" /></a><a href="https://www.sepe.es/HomeSepe/empresas/informacion-para-empresas/profesiones-de-dificil-cobertura/profesiones-mas-demandadas" target="_blank" rel="noopener noreferrer" className="block text-xs text-slate-500 hover:underline">SEPE source · checked {occupation.sourceQuarter}</a><AffiliateCtas /></div></>
}

function ESSalaryOccupationDetail({ salary, communityName, onBack, onClose }: { salary: SpainSalaryGroup; communityName: string; onBack: () => void; onClose: () => void }) {
  return <><div className="flex items-center justify-between border-b border-slate-200 px-5 py-3"><button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"><ChevronLeft className="h-4 w-4" />목록</button><button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div><div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4"><div><p className="text-xs text-slate-500">{communityName} · INE EAES {salary.period}</p><h2 className="mt-1 text-xl font-semibold text-slate-950">{salary.nameEn}</h2><p className="mt-1 text-sm text-slate-500">{salary.nameKo} · {salary.nameEs} · CNO {salary.cnoCode}</p></div><div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4"><p className="text-xs text-emerald-700">Regional annual gross wage reference</p><p className="mt-1 text-2xl font-semibold text-emerald-950">€{Math.round(salary.regionalAnnualGrossEur ?? salary.annualGrossEur ?? 0).toLocaleString()}</p><p className="mt-2 text-xs leading-5 text-emerald-800">CNO major-group wage, adjusted using the official regional all-worker wage factor. This is not an individual job offer or a guaranteed foreign-worker salary.</p></div><div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-600">{salary.definition}</div><a href={salary.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:underline">INE source <ExternalLink className="h-3.5 w-3.5" /></a><AffiliateCtas /></div></>
}

function FRDemandOccupationDetail({ occupation, city, regionName, onBack, onClose }: { occupation: FranceDemandOccupation; city: FranceCity | null; regionName: string; onBack: () => void; onClose: () => void }) {
  const cityProjects = city?.topDemand.find((row) => row.code === occupation.bmoCode)?.recruitmentProjects ?? null
  const jobsUrl = franceJobSearchUrl(occupation, city)
  return <><div className="flex items-center justify-between border-b border-slate-200 px-5 py-3"><button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"><ChevronLeft className="h-4 w-4" />Back</button><button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div><div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4"><div><p className="text-xs text-slate-500">{city ? `${city.nameFr} · ${city.basinName}` : regionName} · FAP2021</p><h2 className="mt-1 text-xl font-semibold text-slate-950">{occupation.nameKo ?? occupation.localName}</h2><p className="mt-1 text-sm text-slate-500">{occupation.nameEn ?? occupation.localName}</p><p className="mt-1 text-sm text-slate-500">{occupation.localName}</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-[11px] text-slate-500">Recruitment projects</p><p className="mt-1 text-base font-semibold">{(cityProjects ?? occupation.recruitmentProjects).toLocaleString()}</p><p className="mt-1 text-[11px] text-slate-500">{city ? "BMO employment basin" : "France, 2026"}</p></div><div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-[11px] text-slate-500">Recruitment difficulty</p><p className="mt-1 text-base font-semibold">{occupation.recruitmentDifficultyPct?.toFixed(1) ?? "n/a"}%</p><p className="mt-1 text-[11px] text-slate-500">National BMO indicator</p></div></div><div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">This is an employer recruitment-intention signal, not a visa pathway or guaranteed job availability. Salary is intentionally shown in the separate INSEE PCS tab because BMO FAP job families and PCS salary groups are not a one-to-one mapping.</div><a href={jobsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3 hover:bg-emerald-100"><span><span className="block text-sm font-semibold text-emerald-950">France Travail job search</span><span className="mt-1 block text-xs text-emerald-700">Open an official search for this occupation{city ? ` in ${city.nameFr}` : ""}</span></span><ExternalLink className="h-4 w-4 text-emerald-700" /></a><a href="https://statistiques.francetravail.org/bmo/" target="_blank" rel="noopener noreferrer" className="block text-xs text-slate-500 hover:underline">Source: France Travail BMO 2026 · checked 2026-07-10</a><AffiliateCtas /></div></>
}

function FRSalaryGroupDetail({ salary, regionName, onBack, onClose }: { salary: FranceSalaryGroup; regionName: string; onBack: () => void; onClose: () => void }) {
  const label = FR_PCS_LABELS[salary.pcsCode]
  return <><div className="flex items-center justify-between border-b border-slate-200 px-5 py-3"><button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"><ChevronLeft className="h-4 w-4" />Back</button><button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div><div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4"><div><p className="text-xs text-slate-500">{regionName} · INSEE PCS {salary.pcsCode}</p><h2 className="mt-1 text-xl font-semibold text-slate-950">{label.nameKo}</h2><p className="mt-1 text-sm text-slate-500">{label.nameEn}</p><p className="mt-1 text-sm text-slate-500">{label.nameFr}</p></div><div className="rounded-lg border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">Monthly net salary</p><p className="mt-1 text-2xl font-semibold text-slate-950">€{Math.round(salary.monthlyNetEur).toLocaleString()}</p><p className="mt-2 text-xs leading-5 text-slate-500">Average private-sector net salary in full-time equivalent, 2023. This is a PCS group, not an individual BMO occupation salary.</p></div><a href={salary.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:underline">INSEE source <ExternalLink className="h-3.5 w-3.5" /></a><AffiliateCtas /></div></>
}

function KROccupationList({ rows, kind, onSelect }: { rows: KoreaOccupation[]; kind: "demand" | "pay"; onSelect: (code: string) => void }) {
  if (rows.length === 0) return <p className="py-8 text-center text-sm text-slate-400">공식 수치와 상업 이용 조건을 검증한 뒤 공개됩니다.</p>
  return <div className="space-y-2">{rows.slice(0, 20).map((occupation) => <button type="button" key={`${occupation.kscoCode}-${occupation.regionCode}`} onClick={() => onSelect(occupation.kscoCode)} className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-left hover:border-slate-400 hover:bg-slate-50"><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900">{occupation.nameKo}</span><span className="mt-0.5 block text-xs text-slate-500">{occupation.nameEn ?? "영문명 검토 대기"} · KSCO {occupation.kscoCode}</span></span><span className="shrink-0 text-right text-xs font-semibold text-rose-800">{kind === "pay" && occupation.monthlyWageKrw != null ? `KRW ${occupation.monthlyWageKrw.toLocaleString()}/월` : occupation.demandScore != null ? `${occupation.demandScore}/100` : occupation.demandKind === "official-shortage" ? "공식 부족" : "채용 수요"}</span></button>)}</div>
}

function KROccupationDetail({ occupation, regionName, onBack, onClose }: { occupation: KoreaOccupation; regionName: string; onBack: () => void; onClose: () => void }) {
  const links = koreaJobSearchLinks(occupation)
  return <><div className="flex items-center justify-between border-b border-slate-200 px-5 py-3"><button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"><ChevronLeft className="h-4 w-4" />목록</button><button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div><div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4"><div><p className="text-xs text-slate-500">{regionName} · KSCO {occupation.kscoCode}</p><h2 className="mt-1 text-xl font-semibold text-slate-950">{occupation.nameKo}</h2><p className="mt-1 text-sm text-slate-500">{occupation.nameEn ?? "영문명 검토 대기"}</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-[11px] text-slate-500">월 임금</p><p className="mt-1 text-base font-semibold">{occupation.monthlyWageKrw != null ? `KRW ${occupation.monthlyWageKrw.toLocaleString()}` : "검증 대기"}</p><p className="mt-1 text-[11px] text-slate-500">{occupation.wageKind === "official-regional-wage" ? "공식 지역 임금" : "국가 임금 × 지역 계수 추정"}</p></div><div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-[11px] text-slate-500">지역 수요</p><p className="mt-1 text-base font-semibold">{occupation.demandScore != null ? `${occupation.demandScore}/100` : "검증 대기"}</p><p className="mt-1 text-[11px] text-slate-500">{occupation.demandKind === "official-shortage" ? "공식 부족 지표" : "채용 수요 상위"}</p></div></div>{occupation.wageFormula && <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"><b>추정 계산식:</b> {occupation.wageFormula}</div>}<section className="rounded-lg border border-slate-200 p-4"><h3 className="text-sm font-semibold">관련 학과·핵심 역량</h3>{occupation.relatedMajors.length > 0 ? <p className="mt-2 text-sm text-slate-600">관련 학과: {occupation.relatedMajors.join(", ")}</p> : <p className="mt-2 text-sm text-slate-500">공식 연결 데이터 없음</p>}{occupation.coreSkills.length > 0 && <p className="mt-2 text-sm text-slate-600">핵심 역량: {occupation.coreSkills.join(", ")}</p>}<p className="mt-2 text-xs text-slate-400">CareerNet API의 상업 이용 범위가 확인된 행만 학과·역량을 공개합니다.</p></section><section className="rounded-lg border border-slate-200 p-4"><h3 className="text-sm font-semibold">공식 채용 검색</h3><p className="mt-1 text-xs leading-5 text-slate-500">개별 공고, 기업, 지원자 정보는 저장하거나 순위화하지 않습니다.</p><div className="mt-3 flex flex-wrap gap-2"><a href={links.jobKorea} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50">JobKorea 검색 <ExternalLink className="h-3 w-3" /></a><a href={links.work24} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50">Work24 열기 <ExternalLink className="h-3 w-3" /></a></div></section><div className="rounded-lg border border-slate-200 p-3 text-xs text-slate-500">출처 코드: {occupation.sourceCodes.join(", ")} · 확인일 {occupation.lastChecked} · {occupation.reviewStatus}</div><AffiliateCtas /></div></>
}



function Panel({
  data,
  selected,
  selectedSA4,
  tab,
  onTab,
  onClose,
  neroData,
  regionData,
  activeCountry,
  selectedJPCity,
  selectedFRCity,
  selectedESCity,
  jpProfilesByCode,
  selectedOccCode,
  setSelectedOccCode,
  selectedUsOcc,
  setSelectedUsOcc,
  savedOccCodes,
  onToggleSave,
  onShare,
  auLabourMarket,
  selectedNeroA4,
  setSelectedNeroA4,
  onSelectCollege,
  searchBarDetailControls = false,
  routeMode = false,
}: {
  data: MapData
  selected: string
  selectedSA4: SA4Region | null
  tab: Tab
  onTab: (t: Tab) => void
  onClose: () => void
  neroData: Record<string, NeroOccupation[]> | null
  regionData: RegionOccData | null
  activeCountry: ActiveCountry
  selectedJPCity: import("@/data/jp-map-data").JPRentArea | null
  selectedFRCity: FranceCity | null
  selectedESCity: SpainCity | null
  jpProfilesByCode: MapData["jpJobTagProfilesByWageCode"]
  selectedOccCode: string | null
  setSelectedOccCode: (code: string | null) => void
  selectedUsOcc: USOccupation | null
  setSelectedUsOcc: (occ: USOccupation | null) => void
  savedOccCodes: Set<string>
  onToggleSave: (occCode: string, occTitle: string) => void
  onShare: () => void
  auLabourMarket: AuLabourMarket | null
  selectedNeroA4: string | null
  setSelectedNeroA4: (a4: string | null) => void
  onSelectCollege?: (college: UKCollege) => void
  searchBarDetailControls?: boolean
  routeMode?: boolean
}) {
  const t = useTranslations()
  const locale = useLocale()
  const isAU = activeCountry === "AU"
  const isUS = activeCountry === "US"
  const isUK = activeCountry === "UK"
  const isJP = activeCountry === "JP"
  const isSG = activeCountry === "SG"
  const isKR = activeCountry === "KR"
  const isFR = activeCountry === "FR"
  const isES = activeCountry === "ES"
  const isNZ = activeCountry === "NZ"
  const isNO = activeCountry === "NO"
  const isSE = activeCountry === "SE"
  const isDK = activeCountry === "DK"
  const isFI = activeCountry === "FI"
  const isCH = activeCountry === "CH"
  const isAE = activeCountry === "AE"
  const isWhv = selected === "WHV"
  const stateName = isWhv ? "Second Visa"
    : isAU ? STATE_NAMES[selected as StateCode] ?? selected
    : activeCountry === "CA" ? CA_PROVINCE_NAMES[selected] ?? selected
    : isUK ? UK_REGION_NAMES[selected] ?? selected
    : activeCountry === "DE" ? DE_BUNDESLAND_NAMES[selected] ?? selected
    : activeCountry === "NL" ? NL_PROVINCE_NAMES[selected] ?? selected
    : activeCountry === "BE" ? BE_REGION_NAMES[selected] ?? selected
    : activeCountry === "JP" ? JP_PREFECTURE_NAMES[selected as keyof typeof JP_PREFECTURE_NAMES]?.en ?? selected
    : activeCountry === "SG" ? data.sgAreas.find((area) => area.code === selected)?.nameEn ?? selected
    : activeCountry === "KR" ? KR_SIDO_NAMES[selected as keyof typeof KR_SIDO_NAMES]?.ko ?? selected
    : activeCountry === "FR" ? FR_REGION_NAMES[selected as keyof typeof FR_REGION_NAMES] ?? selected
    : activeCountry === "ES" ? data.esCommunities.find((community) => community.code === selected)?.nameEn ?? selected
    : isNZ ? NZ_REGION_NAMES[selected as NZRegionCode] ?? selected
    : isNO ? NO_REGION_NAMES[selected as NORegionCode] ?? selected
    : isSE ? SE_REGION_NAMES[selected as SERegionCode] ?? selected
    : isDK ? DK_REGION_NAMES[selected as DKRegionCode] ?? selected
    : isFI ? FI_REGION_NAMES[selected as FIRegionCode] ?? selected
    : isCH ? CH_CANTON_NAMES[selected as CHCantonCode] ?? selected
    : isAE ? AE_EMIRATE_NAMES[selected as AEEmirateCode]?.ko ?? selected
    : US_STATE_NAMES[selected] ?? selected

  const [deExpLevel, setDeExpLevel] = useState<"fachkräfte" | "spezialisten" | "experten">("fachkräfte")

  const auShortage = isAU ? (data.shortageByState[selected as StateCode] ?? []) : []
  const usShortage = isUS ? (data.usShortageByState[selected] ?? []) : []
  const usHighPay = isUS ? (data.usHighPayByState[selected] ?? []) : []
  const ukHighPay = isUK ? (data.ukHighPayByRegion[selected] ?? []) : []
  const jpShortage = isJP ? (data.jpShortageByPrefecture[selected] ?? []) : []
  const jpRent = isJP ? data.jpRentByPrefecture[selected] ?? null : null
  const jpCities = isJP ? data.jpCities.filter((city) => city.prefectureCode === selected) : []
  const sgArea = isSG ? data.sgAreas.find((area) => area.code === selected) ?? null : null
  const krRegion = isKR ? data.krRegions.find((region) => region.code === selected) ?? null : null
  const krDemand = isKR ? data.krOccupationsByRegion[selected] ?? [] : []
  const krHighPay = isKR ? data.krHighPayByRegion[selected] ?? [] : []
  const frRegion = isFR ? data.frRegions.find((region) => region.code === selected) ?? null : null
  const frDemand = isFR ? data.frDemandByRegion[selected] ?? [] : []
  const frSalary = isFR ? data.frSalaryByRegion[selected] ?? [] : []
  const esCommunity = isES ? data.esCommunities.find((community) => community.code === selected) ?? null : null
  const esShortage = isES ? data.esShortageByCommunity[selected] ?? [] : []
  const esHighPay = isES ? data.esHighPayByCommunity[selected] ?? [] : []
  const nzRegion = isNZ ? (data.nzRegions ?? []).find((r) => r.code === selected) ?? null : null
  const nzShortage = isNZ ? (data.nzShortageByRegion?.[selected] ?? []) : []
  const nzHighPay = isNZ ? (data.nzHighPayByRegion?.[selected] ?? []) : []
  const nzUnivs = isNZ ? (data.nzUniversities ?? []).filter((u) => u.regionCode === selected) : []
  const noRegion = isNO ? (data.noRegions ?? []).find((region) => region.code === selected) ?? null : null
  const noShortage = isNO ? (data.noShortageByRegion?.[selected] ?? []) : []
  const noHighPay = isNO ? (data.noHighPayByRegion?.[selected] ?? []) : []
  const noUnivs = isNO ? (data.noUniversities ?? []).filter((university) => university.regionCode === selected) : []
  const noCities = isNO ? (data.noCities ?? []).filter((city) => city.regionCode === selected) : []
  const seRegion = isSE ? (data.seRegions ?? []).find((region) => region.code === selected) ?? null : null
  const seShortage = isSE ? (data.seShortageByRegion?.[selected] ?? []) : []
  const seHighPay = isSE ? (data.seHighPayByRegion?.[selected] ?? []) : []
  const seUnivs = isSE ? (data.seUniversities ?? []).filter((university) => university.regionCode === selected) : []
  const seCities = isSE ? (data.seCities ?? []).filter((city) => city.regionCode === selected) : []
  const dkRegion = isDK ? (data.dkRegions ?? []).find((region) => region.code === selected) ?? null : null
  const dkShortage = isDK ? (data.dkShortageByRegion?.[selected] ?? []) : []
  const dkHighPay = isDK ? (data.dkHighPayByRegion?.[selected] ?? []) : []
  const dkUnivs = isDK ? (data.dkUniversities ?? []).filter((university) => university.regionCode === selected) : []
  const dkCities = isDK ? (data.dkCities ?? []).filter((city) => city.regionCode === selected) : []
  const fiRegion = isFI ? (data.fiRegions ?? []).find((region) => region.code === selected) ?? null : null
  const fiShortage = isFI ? (data.fiShortageByRegion?.[selected] ?? []) : []
  const fiHighPay = isFI ? (data.fiHighPayByRegion?.[selected] ?? []) : []
  const fiUnivs = isFI ? (data.fiUniversities ?? []).filter((university) => university.regionCode === selected) : []
  const fiCities = isFI ? (data.fiCities ?? []).filter((city) => city.regionCode === selected) : []
  const chRegion = isCH ? (data.chRegions ?? []).find((region) => region.code === selected) ?? null : null
  const chCities = isCH ? (data.chCities ?? []).filter((city) => city.cantonCode === selected) : []
  const chUnivs = isCH ? (data.chUniversities ?? []).filter((university) => university.cantonCode === selected) : []
  const chShortage = isCH ? data.chShortageByCanton?.[selected] ?? [] : []
  const aeEmirate = isAE ? data.aeEmirates.find((e) => e.code === selected) ?? null : null
  const deSalaryField = deExpLevel === "fachkräfte" ? "median_salary_eur" : deExpLevel === "spezialisten" ? "median_salary_spezialist_eur" : "median_salary_experte_eur"
  const deShortageField = deExpLevel === "fachkräfte" ? "shortage_rating" : deExpLevel === "spezialisten" ? "shortage_rating_spezialist" : "shortage_rating_experte"
  const deHighPayForLevel = useMemo(() => {
    if (activeCountry !== "DE" || !selected) return []
    const all = data.deShortageByRegion?.[selected] ?? []
    return all
      .filter((o) => o[deSalaryField as keyof DERegionOccupation] != null)
      .sort((a, b) => ((b[deSalaryField as keyof DERegionOccupation] ?? 0) as number) - ((a[deSalaryField as keyof DERegionOccupation] ?? 0) as number))
      .slice(0, 12)
  }, [data.deShortageByRegion, selected, deSalaryField, activeCountry])
  const panelSa4Regions = isAU
    ? isWhv
      ? Object.values(SA4_BY_STATE).flat()
      : SA4_BY_STATE[selected as StateCode] ?? []
    : []

  const occ = selectedOccCode && !isUK ? data.auOccupations[selectedOccCode] : null
  const stateShortages = selectedOccCode ? data.auStateShortages[selectedOccCode] ?? [] : []
  const caProvinceShortages = selectedOccCode ? data.caProvinceShortages[selectedOccCode] ?? [] : []

  // 일부 ANZSCO 코드가 occupations_au 테이블에 없어 occ가 null인 경우
  // shortageByState(occupation_state_au 기반)에서 직업 데이터를 찾아 fallback OccRow 생성
  const allOccupations = useMemo(
    () => Object.values(data.auOccupations).filter((o) => o.anzsco_code != null && o.median_salary_aud != null),
    [data.auOccupations],
  )

  const resolvedOcc = useMemo<OccRow | null>(() => {
    if (isUK || !selectedOccCode || !isAU) return null
    if (occ) return occ
    const fallback = (data.shortageByState[selected as StateCode] ?? []).find(
      (s) => s.anzsco_code === selectedOccCode,
    )
    if (!fallback) return null
    return {
      anzsco_code: fallback.anzsco_code,
      anzsco_v13: fallback.anzsco_v13,
      occupation_en: fallback.occupation_en,
      occupation_ko: fallback.occupation_ko,
      shortage_rating: null,
      median_salary_aud: fallback.median_salary_aud,
      on_csol: fallback.on_csol,
      confidence: fallback.confidence,
      related_broad_field: null,
      pr_note_ko: null,
      source_name: null,
      source_url: null,
      last_verified: null,
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [occ, selectedOccCode, isAU, selected])

  const resolvedCAOcc = useMemo<CAOccRow | null>(() => {
    if (!selectedOccCode || activeCountry !== "CA") return null
    return data.caOccupations[selectedOccCode] ?? null
  }, [selectedOccCode, activeCountry, data.caOccupations])

  const resolvedUKOcc = useMemo<UKOccRow | null>(() => {
    if (!selectedOccCode || activeCountry !== "UK") return null
    return data.ukOccupations[selectedOccCode] ?? null
  }, [selectedOccCode, activeCountry, data.ukOccupations])

  const resolvedDEOcc = useMemo<DEOccRow | null>(() => {
    if (!selectedOccCode || activeCountry !== "DE") return null
    return data.deOccupations[selectedOccCode] ?? null
  }, [selectedOccCode, activeCountry, data.deOccupations])

  const resolvedNLOcc = useMemo<NLOccRow | null>(() => {
    if (!selectedOccCode || activeCountry !== "NL") return null
    return data.nlOccupations[selectedOccCode] ?? null
  }, [selectedOccCode, activeCountry, data.nlOccupations])

  const resolvedBEOcc = useMemo<BEOccRow | null>(() => {
    if (!selectedOccCode || activeCountry !== "BE") return null
    return data.beOccupations[selectedOccCode] ?? null
  }, [selectedOccCode, activeCountry, data.beOccupations])

  const selectedJPWage = useMemo(() => {
    if (activeCountry !== "JP" || !selectedOccCode?.startsWith("jp-wage-")) return null
    const occupationCode = selectedOccCode.slice("jp-wage-".length)
    const wage = data.jpHighPayOccupations.find((row) => row.occupationCode === occupationCode) ?? null
    return wage ? { wage, profiles: jpProfilesByCode[occupationCode] ?? [] } : null
  }, [activeCountry, selectedOccCode, data.jpHighPayOccupations, jpProfilesByCode])
  const selectedJPShortageGroup = useMemo(() => {
    if (activeCountry !== "JP" || !selectedOccCode?.startsWith("jp-shortage-")) return null
    return (data.jpShortageByPrefecture[selected] ?? []).find((row) => row.shortageGroupCode === selectedOccCode.slice("jp-shortage-".length)) ?? null
  }, [activeCountry, selectedOccCode, selected, data.jpShortageByPrefecture])
  const selectedSGDemand = useMemo(() => {
    if (!isSG || !selectedOccCode?.startsWith("sg-demand-")) return null
    return data.sgDemandOccupations.find((row) => row.sourceCode === selectedOccCode.slice("sg-demand-".length)) ?? null
  }, [isSG, selectedOccCode, data.sgDemandOccupations])
  const selectedSGHighPay = useMemo(() => {
    if (!isSG || !selectedOccCode?.startsWith("sg-wage-")) return null
    return data.sgHighPayOccupations.find((row) => row.ssocCode === selectedOccCode.slice("sg-wage-".length)) ?? null
  }, [isSG, selectedOccCode, data.sgHighPayOccupations])
  const selectedKROccupation = useMemo(() => {
    if (!isKR || !selectedOccCode) return null
    return data.krOccupations.find((occupation) => occupation.kscoCode === selectedOccCode && occupation.regionCode === selected) ?? null
  }, [isKR, selectedOccCode, selected, data.krOccupations])
  const selectedFRDemand = useMemo(() => {
    if (!isFR || !selectedOccCode?.startsWith("fr-demand-")) return null
    return FR_DEMAND_BY_CODE.get(selectedOccCode.slice("fr-demand-".length)) ?? null
  }, [isFR, selectedOccCode])
  const selectedFRSalary = useMemo(() => {
    if (!isFR || !selectedOccCode?.startsWith("fr-pay-")) return null
    const [, , pcsCode] = selectedOccCode.split("-")
    return data.frSalaryByRegion[selected].find((salary) => salary.pcsCode === pcsCode) ?? null
  }, [isFR, selectedOccCode, selected, data.frSalaryByRegion])
  const selectedESOccupation = useMemo(() => {
    if (!isES || !selectedOccCode?.startsWith("es-shortage-")) return null
    return data.esOccupations.find((occupation) => occupation.code === selectedOccCode.slice("es-shortage-".length)) ?? null
  }, [isES, selectedOccCode, data.esOccupations])
  const selectedESSalary = useMemo(() => {
    if (!isES || !selectedOccCode?.startsWith("es-pay-")) return null
    const [, , regionCode, cnoCode] = selectedOccCode.split("-")
    return data.esHighPayByCommunity[regionCode]?.find((salary) => salary.cnoCode === cnoCode) ?? null
  }, [isES, selectedOccCode, data.esHighPayByCommunity])

  const handleSelectOcc = (code: string) => {
    const name = data.auOccupations[code]?.occupation_en ?? code
    track("click_occupation", { type: "au", code, name, state: selected })
    setSelectedOccCode(code)
  }
  const handleUSSelectOcc = (occ: USOccupation) => {
    track("click_occupation", { type: "us", code: occ.occ_code, name: occ.occ_title, state: selected })
    setSelectedUsOcc(occ)
  }
  const handleSelectCAOcc = (code: string) => {
    const name = data.caOccupations[code]?.occupation_en ?? code
    track("click_occupation", { type: "ca", code, name, province: selected })
    setSelectedOccCode(code)
  }
  const handleSelectUKOcc = (code: string) => {
    const name = data.ukOccupations[code]?.occupation_en ?? code
    track("click_occupation", { type: "uk", code, name, region: selected })
    setSelectedOccCode(code)
  }
  const handleSelectDEOcc = (code: string) => {
    const name = data.deOccupations[code]?.occupation_en ?? code
    track("click_occupation", { type: "de", code, name, state: selected })
    setSelectedOccCode(code)
  }
  const handleSelectNLOcc = (code: string) => {
    const name = data.nlOccupations[code]?.occupation_en ?? code
    track("click_occupation", { type: "nl", code, name, state: selected })
    setSelectedOccCode(code)
  }
  const handleSelectBEOcc = (code: string) => {
    const name = data.beOccupations[code]?.occupation_en ?? code
    track("click_occupation", { type: "be", code, name, state: selected })
    setSelectedOccCode(code)
  }
  const handleSelectJPWage = (code: string) => {
    const wage = data.jpHighPayOccupations.find((row) => row.occupationCode === code)
    track("click_occupation", { type: "jp", code, name: wage?.localName ?? code, prefecture: selected })
    setSelectedOccCode(`jp-wage-${code}`)
  }
  const handleSelectJPShortageGroup = (code: string) => {
    const group = data.jpShortageByPrefecture[selected]?.find((row) => row.shortageGroupCode === code)
    track("click_occupation", { type: "jp-shortage", code, name: group?.localName ?? code, prefecture: selected })
    setSelectedOccCode(`jp-shortage-${code}`)
  }
  const handleSelectSGDemand = (sourceCode: string) => {
    const occupation = data.sgDemandOccupations.find((row) => row.sourceCode === sourceCode)
    track("click_occupation", { type: "sg-demand", code: sourceCode, name: occupation?.nameEn ?? sourceCode, area: selected })
    setSelectedOccCode(`sg-demand-${sourceCode}`)
  }
  const handleSelectSGHighPay = (ssocCode: string) => {
    const occupation = data.sgHighPayOccupations.find((row) => row.ssocCode === ssocCode)
    track("click_occupation", { type: "sg-wage", code: ssocCode, name: occupation?.nameEn ?? ssocCode, area: selected })
    setSelectedOccCode(`sg-wage-${ssocCode}`)
  }
  const handleSelectKROccupation = (kscoCode: string) => {
    const occupation = data.krOccupations.find((row) => row.kscoCode === kscoCode && row.regionCode === selected)
    track("click_occupation", { type: "kr", code: kscoCode, name: occupation?.nameKo ?? kscoCode, region: selected })
    setSelectedOccCode(kscoCode)
  }
  const handleSelectFRDemand = (code: string) => {
    const occupation = FR_DEMAND_BY_CODE.get(code)
    track("click_occupation", { type: "fr-demand", code, name: occupation?.nameEn ?? occupation?.localName ?? code, region: selected, city: selectedFRCity?.nameFr ?? "" })
    setSelectedOccCode(`fr-demand-${code}`)
  }
  const handleSelectFRSalary = (pcsCode: string) => {
    track("click_occupation", { type: "fr-salary-group", code: pcsCode, name: FR_PCS_LABELS[pcsCode as keyof typeof FR_PCS_LABELS]?.nameEn ?? pcsCode, region: selected })
    setSelectedOccCode(`fr-pay-${pcsCode}`)
  }
  const handleSelectESShortage = (code: string) => {
    const occupation = data.esOccupations.find((row) => row.code === code)
    track("click_occupation", { type: "es-shortage", code, name: occupation?.nameEn ?? code, region: selected })
    setSelectedOccCode(`es-shortage-${code}`)
  }
  const handleSelectESSalary = (salary: SpainSalaryGroup) => {
    track("click_occupation", { type: "es-high-pay", code: salary.cnoCode, name: salary.nameEn, region: selected })
    setSelectedOccCode(`es-pay-${selected}-${salary.cnoCode}`)
  }
  const handleSelectNZOcc = (code: string) => {
    const occ = NZ_OCCUPATION_BY_CODE.get(code)
    track("click_occupation", { type: "nz", code, name: occ?.nameEn ?? code, region: selected })
    setSelectedOccCode(`nz-${code}`)
  }
  const handleSelectNOOcc = (code: string) => {
    const occ = NO_OCCUPATION_BY_CODE.get(code)
    track("click_occupation", { type: "no", code, name: occ?.nameEn ?? code, region: selected })
    setSelectedOccCode(`no-${code}`)
  }
  const handleSelectSEOcc = (code: string) => setSelectedOccCode(`se-${code}`)
  const handleSelectDKOcc = (code: string) => setSelectedOccCode(`dk-${code}`)
  const handleSelectFIOcc = (code: string) => setSelectedOccCode(`fi-${code}`)
  const handleBack = () => setSelectedOccCode(null)
  const handleBackNero = () => setSelectedNeroA4(null)

  if (selectedUsOcc) {
    return (
      <USOccupationDetail
        occ={selectedUsOcc}
        stateName={stateName}
        stateCode={selected}
        colleges={data.usColleges}
        onBack={() => setSelectedUsOcc(null)}
        onClose={onClose}
        t={t}
        savedOccCodes={savedOccCodes}
        onToggleSave={onToggleSave}
        onShare={onShare}
      />
    )
  }

  if (selectedJPWage) {
    return (
      <JPWageOccupationDetail
        wage={selectedJPWage.wage}
        profiles={selectedJPWage.profiles}
        prefectureName={stateName}
        onBack={handleBack}
        onClose={onClose}
      />
    )
  }

  if (selectedJPShortageGroup) {
    return (
      <JPShortageOccupationDetail
        group={selectedJPShortageGroup}
        prefectureName={stateName}
        prefectureJa={JP_PREFECTURE_NAMES[selected as keyof typeof JP_PREFECTURE_NAMES]?.ja ?? null}
        onBack={handleBack}
        onClose={onClose}
      />
    )
  }

  if (selectedSGDemand) {
    return <SGDemandOccupationDetail occupation={selectedSGDemand} areaName={stateName} pathways={data.sgWorkPassPathways.pathways} onBack={handleBack} onClose={onClose} />
  }

  if (selectedSGHighPay) {
    return <SGHighPayOccupationDetail occupation={selectedSGHighPay} pathways={data.sgWorkPassPathways.pathways} onBack={handleBack} onClose={onClose} />
  }

  if (selectedKROccupation) {
    return <KROccupationDetail occupation={selectedKROccupation} regionName={stateName} onBack={handleBack} onClose={onClose} />
  }
  if (selectedFRDemand) {
    return <FRDemandOccupationDetail occupation={selectedFRDemand} city={selectedFRCity} regionName={stateName} onBack={handleBack} onClose={onClose} />
  }
  if (selectedFRSalary) {
    return <FRSalaryGroupDetail salary={selectedFRSalary} regionName={stateName} onBack={handleBack} onClose={onClose} />
  }
  if (selectedESOccupation) {
    return <ESShortageOccupationDetail occupation={selectedESOccupation} communityName={stateName} province={data.esProvinces.find((province) => province.code === selectedESOccupation.provinceCodes[0]) ?? null} onBack={handleBack} onClose={onClose} />
  }
  if (selectedESSalary) {
    return <ESSalaryOccupationDetail salary={selectedESSalary} communityName={stateName} onBack={handleBack} onClose={onClose} />
  }

  const isNzOccSelected = selectedOccCode?.startsWith("nz-") ?? false
  const nzSelectedOcc = isNzOccSelected ? NZ_OCCUPATION_BY_CODE.get(selectedOccCode!.slice(3)) ?? null : null
  if (isNzOccSelected) {
    return (
      <NZOccupationDetail
        occ={nzSelectedOcc}
        regionName={stateName}
        regionCode={selected}
        universities={nzUnivs}
        locale={locale}
        onBack={handleBack}
        onClose={onClose}
      />
    )
  }

  const isNoOccSelected = selectedOccCode?.startsWith("no-") ?? false
  const noSelectedOcc = isNoOccSelected ? NO_OCCUPATION_BY_CODE.get(selectedOccCode!.slice(3)) ?? null : null
  if (isNoOccSelected) {
    return <NOOccupationDetail occ={noSelectedOcc} regionName={stateName} universities={noUnivs} locale={locale} onBack={handleBack} onClose={onClose} />
  }

  const seSelectedOcc = selectedOccCode?.startsWith("se-") ? SE_OCCUPATION_BY_CODE.get(selectedOccCode.slice(3)) ?? null : null
  if (selectedOccCode?.startsWith("se-")) return <NordicOccupationDetail occ={seSelectedOcc ? { code: seSelectedOcc.ssykCode, classification: "SSYK 2012", nameEn: seSelectedOcc.nameEn, nameKo: seSelectedOcc.nameKo, medianSalary: seSelectedOcc.medianSalarySek, employmentThousands: seSelectedOcc.employmentThousands, shortageRating: seSelectedOcc.shortageRating, relatedField: seSelectedOcc.relatedField, sourceYear: seSelectedOcc.sourceYear } : null} regionName={stateName} universities={seUnivs} currency="SEK" locale={locale} jobSearchUrl={seSelectedOcc ? seJobSearchUrl(seSelectedOcc, seRegion) : "https://arbetsformedlingen.se/platsbanken"} onBack={handleBack} onClose={onClose} />
  const dkSelectedOcc = selectedOccCode?.startsWith("dk-") ? DK_OCCUPATION_BY_CODE.get(selectedOccCode.slice(3)) ?? null : null
  if (selectedOccCode?.startsWith("dk-")) return <NordicOccupationDetail occ={dkSelectedOcc ? { code: dkSelectedOcc.dosCode, classification: "DISCO-08", nameEn: dkSelectedOcc.nameEn, nameKo: dkSelectedOcc.nameKo, medianSalary: dkSelectedOcc.medianSalaryDkk, employmentThousands: dkSelectedOcc.employmentThousands, shortageRating: dkSelectedOcc.shortageRating, relatedField: dkSelectedOcc.relatedField, sourceYear: dkSelectedOcc.sourceYear } : null} regionName={stateName} universities={dkUnivs} currency="DKK" locale={locale} jobSearchUrl={dkSelectedOcc ? dkJobSearchUrl(dkSelectedOcc, dkRegion) : "https://jobnet.dk"} onBack={handleBack} onClose={onClose} />
  const fiSelectedOcc = selectedOccCode?.startsWith("fi-") ? FI_OCCUPATION_BY_CODE.get(selectedOccCode.slice(3)) ?? null : null
  if (selectedOccCode?.startsWith("fi-")) return <NordicOccupationDetail occ={fiSelectedOcc ? { code: fiSelectedOcc.iscoCode, classification: "ISCO-08", nameEn: fiSelectedOcc.nameEn, nameKo: fiSelectedOcc.nameKo, medianSalary: fiSelectedOcc.medianSalaryEur, employmentThousands: fiSelectedOcc.employmentThousands, shortageRating: fiSelectedOcc.shortageRating, relatedField: fiSelectedOcc.relatedField, sourceYear: fiSelectedOcc.sourceYear } : null} regionName={stateName} universities={fiUnivs} currency="EUR" locale={locale} jobSearchUrl={fiSelectedOcc ? fiJobSearchUrl(fiSelectedOcc, fiRegion) : "https://tyopaikat.oikotie.fi"} onBack={handleBack} onClose={onClose} />

  if (selectedOccCode && resolvedCAOcc) {
    return (
      <CAOccupationDetail
        occ={resolvedCAOcc}
        provinceShortages={caProvinceShortages}
        currentProvince={selected}
        onBack={handleBack}
        onClose={onClose}
        t={t}
        savedOccCodes={savedOccCodes}
        onToggleSave={onToggleSave}
        onShare={onShare}
      />
    )
  }

  if (selectedOccCode && resolvedUKOcc) {
    return (
      <UKOccupationDetail
        occ={resolvedUKOcc}
        regionName={stateName}
        regionCode={selected}
        data={data}
        onBack={handleBack}
        onClose={onClose}
        savedOccCodes={savedOccCodes}
        onToggleSave={onToggleSave}
        onShare={onShare}
      />
    )
  }

  if (selectedOccCode && resolvedDEOcc) {
    return (
      <DEOccupationDetail
        occ={resolvedDEOcc}
        regionName={stateName}
        regionCode={selected}
        data={data}
        onBack={handleBack}
        onClose={onClose}
        savedOccCodes={savedOccCodes}
        onToggleSave={onToggleSave}
        onShare={onShare}
        deExpLevel={deExpLevel}
      />
    )
  }

  if (selectedOccCode && resolvedNLOcc) {
    return (
      <NLOccupationDetail
        occ={resolvedNLOcc}
        regionName={stateName}
        regionCode={selected}
        data={data}
        onBack={handleBack}
        onClose={onClose}
        savedOccCodes={savedOccCodes}
        onToggleSave={onToggleSave}
        onShare={onShare}
      />
    )
  }

  if (selectedOccCode && resolvedBEOcc) {
    return (
      <BEOccupationDetail
        occ={resolvedBEOcc}
        regionName={stateName}
        regionCode={selected}
        data={data}
        onBack={handleBack}
        onClose={onClose}
        savedOccCodes={savedOccCodes}
        onToggleSave={onToggleSave}
        onShare={onShare}
      />
    )
  }

  if (selectedOccCode && resolvedOcc) {
    return (
      <OccupationDetail
        occ={resolvedOcc}
        stateShortages={stateShortages}
        onBack={handleBack}
        onClose={onClose}
        t={t}
        currentState={selected as StateCode}
        data={data}
        savedOccCodes={savedOccCodes}
        onToggleSave={onToggleSave}
        onShare={onShare}
        labourMarket={auLabourMarket}
        showInlineControls={!searchBarDetailControls}
        routeMode={routeMode}
      />
    )
  }

  if (selectedNeroA4 && neroData && isAU) {
    return (
      <NeroOccupationDetail
        a4={selectedNeroA4}
        stateCode={selected as StateCode}
        neroData={neroData}
        sa4Regions={panelSa4Regions}
        auOccupations={data.auOccupations}
        stateSalaryMult={data.stateSalaryMult}
        coursesByFieldState={data.coursesByFieldState}
        onBack={handleBackNero}
        onClose={onClose}
        t={t}
        savedOccCodes={savedOccCodes}
        onToggleSave={onToggleSave}
        onShare={onShare}
        showInlineControls={!searchBarDetailControls}
      />
    )
  }

  return (
    <>
      <div className="flex items-start justify-between gap-2 px-5 pt-4">
        <div>
          <h2 className="font-sans text-lg font-semibold text-slate-900 tracking-tight">
            {selectedSA4 ? selectedSA4.name : stateName}
          </h2>
          {selectedSA4 && isAU && !isWhv && (
            <p className="text-xs text-slate-400">{STATE_NAMES[selected as StateCode]}</p>
          )}
          {selectedSA4 && isWhv && (
            <p className="text-xs text-slate-400">Second Visa · Australia</p>
          )}
          {!selectedSA4 && isWhv && (
            <p className="text-xs text-slate-400">{locale === "ko" ? "전국 지도 — 지역을 클릭하면 상세 정보를 볼 수 있습니다" : "National view — click a region for details"}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.map.close}
          className="-mr-1 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {!isWhv && (
      <div className="px-5 pt-3">
        <div className="inline-flex rounded-lg bg-slate-100 p-1 text-sm">
          {(isUS || activeCountry === "CA" || isUK || activeCountry === "BE" || isJP || isSG || isKR || isFR || isES || isNZ || isNO || isSE || isDK || isFI || isCH || isAE) && (
            <TabButton active={tab === "stateInfo"} onClick={() => { onTab("stateInfo"); track("switch_tab", { tab: "stateInfo", state: selected }) }}>
              {(activeCountry === "CA" || activeCountry === "BE" || isJP || isSG || isKR || isFR || isES || isNZ || isNO || isSE || isDK || isFI || isCH || isAE) ? (locale === "ko" ? "정보" : "Info") : t.map.tabStateInfo}
            </TabButton>
          )}
          {!isUK && (
            <TabButton active={tab === "shortage"} onClick={() => { onTab("shortage"); track("switch_tab", { tab: "shortage", state: selected }) }}>
              {t.map.tabShortage}
            </TabButton>
          )}
          <TabButton active={tab === "pay"} onClick={() => { onTab("pay"); track("switch_tab", { tab: "pay", state: selected }) }}>
            {t.map.tabPay}
          </TabButton>
          {isAU && (
            <TabButton active={tab === "employment"} onClick={() => { onTab("employment"); track("switch_tab", { tab: "employment", state: selected }) }}>
              {t.map.tabEmployment}
            </TabButton>
          )}
          {isAU && (
            <TabButton active={tab === "whv"} onClick={() => { onTab("whv"); track("switch_tab", { tab: "whv", state: selected }) }}>
              {t.map.tabWhv}
            </TabButton>
          )}
        </div>
      </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {tab === "stateInfo" && isUS && (
          <StateInfoPanel
            stateInfo={data.usStateInfo[selected] ?? null}
            majors={data.usMajorDensity[selected] ?? []}
          />
        )}
        {tab === "stateInfo" && activeCountry === "CA" && (
          <div className="space-y-5">
            <CACitiesPanel
              cities={data.caCities}
              province={selected}
            />
            <CACollegesPanel
              colleges={data.caColleges}
              province={selected}
            />
          </div>
        )}
        {tab === "stateInfo" && isUK && (
          <div className="space-y-5">
            <UKCitiesPanel
              cities={data.ukCities}
              region={selected}
            />
            <UKCollegesPanel
              colleges={data.ukColleges}
              region={selected}
              onSelect={(c) => onSelectCollege?.(c)}
            />
          </div>
        )}
{tab === "stateInfo" && activeCountry === "BE" && (
  <BEInfoPanel stateInfo={data.beStateInfo[selected] ?? null} cities={data.beCities} regionCode={selected} taxRates={data.beTaxRates as Record<string, unknown>} />
)}
        {tab === "stateInfo" && isJP && (
          <JPInfoPanel rent={jpRent} cities={jpCities} selectedCity={selectedJPCity} shortageCount={jpShortage.length} />
        )}
        {tab === "stateInfo" && isSG && <SGInfoPanel area={sgArea} demandCount={data.sgDemandOccupations.length} pathways={data.sgWorkPassPathways.pathways} />}
        {tab === "stateInfo" && isKR && <KRInfoPanel region={krRegion} universities={data.krUniversities.filter((university) => university.regionCode === selected)} demandCount={krDemand.length} />}
        {tab === "stateInfo" && isFR && <FRInfoPanel region={frRegion} city={selectedFRCity} universities={data.frUniversities.filter((university) => university.regionCode === selected)} demandCount={frDemand.length} locale={locale} />}
        {tab === "stateInfo" && isES && <ESInfoPanel community={esCommunity} city={selectedESCity} universities={data.esUniversities.filter((university) => university.regionCode === selected)} shortageCount={esShortage.length} />}
        {tab === "stateInfo" && isNZ && (
          <NZInfoPanel region={nzRegion} universities={nzUnivs} shortageCount={nzShortage.length} locale={locale} />
        )}
        {tab === "stateInfo" && isNO && (
          <NOInfoPanel region={noRegion} cities={noCities} universities={noUnivs} shortageCount={noShortage.length} locale={locale} />
        )}
        {tab === "stateInfo" && isSE && <NordicInfoPanel region={seRegion ? { nameEn: seRegion.nameEn, monthlyRent: seRegion.rent.monthlySek, weeklyRent: seRegion.rent.weeklySek, period: seRegion.rent.period, definition: seRegion.rent.definition } : null} cities={seCities.map((city) => ({ code: city.code, nameEn: city.nameEn, nameKo: city.nameKo, monthlyRent: city.rent.monthlySek }))} universities={seUnivs} shortageCount={seShortage.length} currency="SEK" locale={locale} />}
        {tab === "stateInfo" && isDK && <NordicInfoPanel region={dkRegion ? { nameEn: dkRegion.nameEn, monthlyRent: dkRegion.rent.monthlyDkk, weeklyRent: dkRegion.rent.weeklyDkk, period: dkRegion.rent.period, definition: dkRegion.rent.definition } : null} cities={dkCities.map((city) => ({ code: city.code, nameEn: city.nameEn, nameKo: city.nameKo, monthlyRent: city.rent.monthlyDkk }))} universities={dkUnivs} shortageCount={dkShortage.length} currency="DKK" locale={locale} />}
        {tab === "stateInfo" && isFI && <NordicInfoPanel region={fiRegion ? { nameEn: fiRegion.nameEn, monthlyRent: fiRegion.rent.monthlyEur, weeklyRent: fiRegion.rent.weeklyEur, period: fiRegion.rent.period, definition: fiRegion.rent.definition } : null} cities={fiCities.map((city) => ({ code: city.code, nameEn: city.nameEn, nameKo: city.nameKo, monthlyRent: city.rent.monthlyEur }))} universities={fiUnivs} shortageCount={fiShortage.length} currency="EUR" locale={locale} />}
        {tab === "stateInfo" && isCH && <CHInfoPanel region={chRegion} cities={chCities} universities={chUnivs} shortageCount={chShortage.length} locale={locale} />}
        {tab === "stateInfo" && isAE && <AEInfoPanel emirate={aeEmirate} locale={locale} />}
        {tab === "shortage" && isAU && (
          selectedSA4 ? (
            <RegionGroupList
              kind="demand"
              key={selectedSA4.code}
              entry={regionData?.[selectedSA4.code]}
              occupations={auShortage}
              allOccupations={allOccupations}
              onSelectOcc={handleSelectOcc}
              selected={selected as StateCode}
              stateSalaryMult={data.stateSalaryMult}
              highPay={data.highPay}
              t={t}
            />
          ) : (
            <ShortageList rows={auShortage} onSelectOcc={handleSelectOcc} />
          )
        )}
        {tab === "shortage" && isUS && <USShortageList rows={usShortage} onSelectOcc={handleUSSelectOcc} />}
        {tab === "shortage" && activeCountry === "DE" && (
          selected ? (
            <DEShortageList rows={data.deShortageByRegion?.[selected] ?? []} onSelectOcc={handleSelectDEOcc} />
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">{t.map.selectStateFirst}</p>
          )
        )}
        {tab === "shortage" && activeCountry === "NL" && (
          selected ? (
            <NLShortageList rows={data.nlShortageByRegion?.[selected] ?? []} onSelectOcc={handleSelectNLOcc} />
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">{t.map.selectStateFirst}</p>
          )
        )}
        {tab === "shortage" && activeCountry === "BE" && (
          selected ? (
            <BEShortageList rows={data.beShortageByRegion?.[selected] ?? []} onSelectOcc={handleSelectBEOcc} />
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">{t.map.selectStateFirst}</p>
          )
        )}
        {tab === "shortage" && isJP && <JPShortageList rows={jpShortage} onSelectGroup={handleSelectJPShortageGroup} />}
        {tab === "shortage" && isSG && <SGShortageList rows={data.sgDemandOccupations} onSelect={handleSelectSGDemand} />}
        {tab === "shortage" && isKR && <KROccupationList rows={krDemand} kind="demand" onSelect={handleSelectKROccupation} />}
        {tab === "shortage" && isFR && <FRDemandList rows={selectedFRCity ? selectedFRCity.topDemand.map((row) => ({ ...FR_DEMAND_BY_CODE.get(row.code)!, regionalProjects: row.recruitmentProjects })).filter(Boolean) : frDemand} onSelect={handleSelectFRDemand} locale={locale} />}
        {tab === "shortage" && isES && <ESShortageList rows={esShortage} onSelect={handleSelectESShortage} />}
        {tab === "shortage" && !isAU && !isUS && activeCountry !== "CA" && activeCountry !== "UK" && activeCountry !== "DE" && activeCountry !== "NL" && activeCountry !== "BE" && activeCountry !== "JP" && activeCountry !== "SG" && activeCountry !== "KR" && activeCountry !== "FR" && activeCountry !== "ES" && !isNZ && !isNO && !isCH && !isAE && <p className="py-8 text-center text-sm text-slate-400">{t.map.noShortageData}</p>}
        {tab === "shortage" && isNZ && (
          selected ? (
            <NZShortageList rows={nzShortage} locale={locale} onSelectOcc={handleSelectNZOcc} />
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">{t.map.selectStateFirst}</p>
          )
        )}
        {tab === "shortage" && isNO && (
          selected ? <NOShortageList rows={noShortage} locale={locale} onSelectOcc={handleSelectNOOcc} /> : <p className="py-8 text-center text-sm text-slate-400">{t.map.selectStateFirst}</p>
        )}
        {tab === "shortage" && isSE && (selected ? <NordicOccupationList rows={seShortage.map((occ) => ({ code: occ.ssykCode, classification: "SSYK 2012", nameEn: occ.nameEn, nameKo: occ.nameKo, medianSalary: occ.medianSalarySek, employmentThousands: occ.employmentThousands, shortageRating: occ.shortageRating, relatedField: occ.relatedField, sourceYear: occ.sourceYear }))} kind="shortage" currency="SEK" locale={locale} onSelect={handleSelectSEOcc} /> : <p className="py-8 text-center text-sm text-slate-400">{t.map.selectStateFirst}</p>)}
        {tab === "shortage" && isDK && (selected ? <NordicOccupationList rows={dkShortage.map((occ) => ({ code: occ.dosCode, classification: "DISCO-08", nameEn: occ.nameEn, nameKo: occ.nameKo, medianSalary: occ.medianSalaryDkk, employmentThousands: occ.employmentThousands, shortageRating: occ.shortageRating, relatedField: occ.relatedField, sourceYear: occ.sourceYear }))} kind="shortage" currency="DKK" locale={locale} onSelect={handleSelectDKOcc} /> : <p className="py-8 text-center text-sm text-slate-400">{t.map.selectStateFirst}</p>)}
        {tab === "shortage" && isFI && (selected ? <NordicOccupationList rows={fiShortage.map((occ) => ({ code: occ.iscoCode, classification: "ISCO-08", nameEn: occ.nameEn, nameKo: occ.nameKo, medianSalary: occ.medianSalaryEur, employmentThousands: occ.employmentThousands, shortageRating: occ.shortageRating, relatedField: occ.relatedField, sourceYear: occ.sourceYear }))} kind="shortage" currency="EUR" locale={locale} onSelect={handleSelectFIOcc} /> : <p className="py-8 text-center text-sm text-slate-400">{t.map.selectStateFirst}</p>)}
        {tab === "shortage" && isCH && <CHShortageNotice locale={locale} />}
        {tab === "shortage" && isAE && <AEShortageList data={data.aeShortageOccupations} locale={locale} />}
        {tab === "shortage" && activeCountry === "CA" && <CAShortageList rows={Object.values(data.caOccupations)} onSelectOcc={handleSelectCAOcc} />}
        {tab === "pay" && isAU && (
          selectedSA4 ? (
            <RegionGroupList
              kind="pay"
              key={selectedSA4.code}
              entry={regionData?.[selectedSA4.code]}
              occupations={auShortage}
              allOccupations={allOccupations}
              onSelectOcc={handleSelectOcc}
              selected={selected as StateCode}
              stateSalaryMult={data.stateSalaryMult}
              highPay={data.highPay}
              t={t}
            />
          ) : (
            <HighPayList
              rows={data.highPay}
              stateRows={auShortage}
              selected={selected as StateCode}
              stateSalaryMult={data.stateSalaryMult}
              onSelectOcc={handleSelectOcc}
            />
          )
        )}
        {tab === "pay" && isUS && <USHighPayList rows={usHighPay} onSelectOcc={handleUSSelectOcc} />}
        {tab === "pay" && activeCountry === "DE" && (
          selected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
                {(["fachkräfte", "spezialisten", "experten"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDeExpLevel(level)}
                    className={`flex-1 rounded-md px-3 py-1.5 capitalize transition-colors ${
                      deExpLevel === level
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <DEHighPayList rows={deHighPayForLevel} salaryField={deSalaryField} ratingField={deShortageField} onSelectOcc={handleSelectDEOcc} />
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">{t.map.selectStateFirst}</p>
          )
        )}
        {tab === "pay" && activeCountry === "NL" && (
          selected ? (
            <NLHighPayList rows={data.nlHighPayByRegion?.[selected] ?? []} onSelectOcc={handleSelectNLOcc} />
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">{t.map.selectStateFirst}</p>
          )
        )}
        {tab === "pay" && activeCountry === "BE" && (
          selected ? (
            <BEHighPayList rows={data.beHighPayByRegion?.[selected] ?? []} onSelectOcc={handleSelectBEOcc} />
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">{t.map.selectStateFirst}</p>
          )
        )}
        {tab === "pay" && isJP && <JPHighPayList rows={data.jpHighPayOccupations} onSelectWage={handleSelectJPWage} />}
        {tab === "pay" && isSG && <SGHighPayList rows={data.sgHighPayOccupations} onSelect={handleSelectSGHighPay} />}
        {tab === "pay" && isKR && <KROccupationList rows={krHighPay} kind="pay" onSelect={handleSelectKROccupation} />}
        {tab === "pay" && isFR && <FRSalaryList rows={frSalary} onSelect={handleSelectFRSalary} locale={locale} />}
        {tab === "pay" && isES && <ESHighPayList rows={esHighPay} onSelect={handleSelectESSalary} />}
        {tab === "pay" && isNZ && (
          selected ? (
            <NZHighPayList rows={nzHighPay} locale={locale} onSelectOcc={handleSelectNZOcc} />
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">{t.map.selectStateFirst}</p>
          )
        )}
        {tab === "pay" && isNO && (
          selected ? <NOHighPayList rows={noHighPay} locale={locale} onSelectOcc={handleSelectNOOcc} /> : <p className="py-8 text-center text-sm text-slate-400">{t.map.selectStateFirst}</p>
        )}
        {tab === "pay" && isSE && (selected ? <NordicOccupationList rows={seHighPay.map((occ) => ({ code: occ.ssykCode, classification: "SSYK 2012", nameEn: occ.nameEn, nameKo: occ.nameKo, medianSalary: occ.medianSalarySek, employmentThousands: occ.employmentThousands, shortageRating: occ.shortageRating, relatedField: occ.relatedField, sourceYear: occ.sourceYear }))} kind="pay" currency="SEK" locale={locale} onSelect={handleSelectSEOcc} /> : <p className="py-8 text-center text-sm text-slate-400">{t.map.selectStateFirst}</p>)}
        {tab === "pay" && isDK && (selected ? <NordicOccupationList rows={dkHighPay.map((occ) => ({ code: occ.dosCode, classification: "DISCO-08", nameEn: occ.nameEn, nameKo: occ.nameKo, medianSalary: occ.medianSalaryDkk, employmentThousands: occ.employmentThousands, shortageRating: occ.shortageRating, relatedField: occ.relatedField, sourceYear: occ.sourceYear }))} kind="pay" currency="DKK" locale={locale} onSelect={handleSelectDKOcc} /> : <p className="py-8 text-center text-sm text-slate-400">{t.map.selectStateFirst}</p>)}
        {tab === "pay" && isFI && (selected ? <NordicOccupationList rows={fiHighPay.map((occ) => ({ code: occ.iscoCode, classification: "ISCO-08", nameEn: occ.nameEn, nameKo: occ.nameKo, medianSalary: occ.medianSalaryEur, employmentThousands: occ.employmentThousands, shortageRating: occ.shortageRating, relatedField: occ.relatedField, sourceYear: occ.sourceYear }))} kind="pay" currency="EUR" locale={locale} onSelect={handleSelectFIOcc} /> : <p className="py-8 text-center text-sm text-slate-400">{t.map.selectStateFirst}</p>)}
        {tab === "pay" && isCH && <CHHighPayList rows={data.chHighPayNational ?? []} locale={locale} />}
        {tab === "pay" && isAE && <AEHighPayList data={data.aeHighIncomeOccupations} locale={locale} />}
        {tab === "pay" && !isAU && !isUS && activeCountry !== "CA" && activeCountry !== "UK" && activeCountry !== "DE" && activeCountry !== "NL" && activeCountry !== "BE" && activeCountry !== "JP" && activeCountry !== "SG" && activeCountry !== "KR" && activeCountry !== "FR" && activeCountry !== "ES" && !isNZ && !isNO && !isCH && !isAE && <p className="py-8 text-center text-sm text-slate-400">{t.map.noShortageData}</p>}
        {tab === "pay" && activeCountry === "CA" && <CAHighPayList rows={data.caHighPay} provinceRows={selected ? data.caHighPayByProvince[selected] ?? [] : []} onSelectOcc={handleSelectCAOcc} />}
        {tab === "pay" && isUK && <UKHighPayList rows={ukHighPay} onSelectOcc={handleSelectUKOcc} />}
        {tab === "employment" && (
          <EmploymentList
            sa4={selectedSA4}
            stateCode={isAU ? (selected as StateCode) : null}
            sa4Regions={panelSa4Regions}
            neroData={neroData}
            onSelectNero={(a4) => setSelectedNeroA4(a4)}
          />
        )}
        {tab === "whv" && isAU && (
          <WHVPanel
            selectedSA4={selectedSA4}
            selected={selected as StateCode}
            sa4Regions={panelSa4Regions}
            onToggleSave={onToggleSave}
            onShare={onShare}
            savedOccCodes={savedOccCodes}
          />
        )}
      </div>

      <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
        {isCH ? "Sources: swisstopo swissBOUNDARIES3D · swissuniversities · FSO · SECO" : isJP ? "Sources: MHLW · Statistics Bureau of Japan · JILPT Job Tag" : isSG ? "Sources: MOM · URA · SkillsFuture Singapore" : isKR ? "Sources: MOEL · KOSIS · MOLIT · CareerNet · QS" : isFR ? "Sources: France Travail BMO · INSEE · MESR · API Geo" : isAE ? "Sources: MOHRE · Cooper Fitch · HDX COD-AB · Golden Visa List" : t.map.source}
      </p>
    </>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 font-medium transition-colors",
        active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700",
      )}
    >
      {children}
    </button>
  )
}

// 모바일 바텀시트 — 구글맵 모바일처럼 손잡이를 위/아래로 끌어 높이를 조절한다.
// 스냅: peek(맵을 넓게) · 기본(절반) · full(화면 거의 전체). 콘텐츠 영역은 따로 스크롤.
function MobileSheet({ children, onBack, onClose }: { children: React.ReactNode; onBack?: () => void; onClose?: () => void }) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)
  const liveH = useRef(0)
  const drag = useRef<{ startY: number; startH: number } | null>(null)

  const snaps = useCallback(() => {
    const ph = sheetRef.current?.parentElement?.clientHeight ?? 640
    return {
      peek: Math.round(ph * 0.3),
      half: Math.round(ph * 0.62),
      full: Math.max(0, ph - 10),
    }
  }, [])

  useEffect(() => {
    const { half } = snaps()
    liveH.current = half
    setHeight(half)
    const onResize = () => {
      const { peek, full } = snaps()
      setHeight((h) => {
        const next = h == null ? snaps().half : Math.min(full, Math.max(peek, h))
        liveH.current = next
        return next
      })
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [snaps])

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { startY: e.clientY, startH: sheetRef.current?.offsetHeight ?? liveH.current }
    setDragging(true)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    const { peek, full } = snaps()
    const next = Math.min(full, Math.max(peek, drag.current.startH + (drag.current.startY - e.clientY)))
    liveH.current = next
    setHeight(next)
  }
  const endDrag = () => {
    if (!drag.current) return
    drag.current = null
    setDragging(false)
    const { peek, half, full } = snaps()
    const h = liveH.current
    const nearest = [peek, half, full].reduce((a, b) => (Math.abs(b - h) < Math.abs(a - h) ? b : a))
    liveH.current = nearest
    setHeight(nearest)
  }

  return (
    <div
      ref={sheetRef}
      className={cn(
        "absolute inset-x-0 bottom-0 z-[1000] flex flex-col overflow-hidden rounded-t-2xl border-t border-slate-200 bg-white shadow-[0_-6px_24px_rgba(15,23,42,0.14)]",
        !dragging && "transition-[height] duration-200 ease-out",
      )}
      style={{ height: height ?? "55%" }}
    >
      {/* ── 크롬 바: 백/닫기 + 손잡이 ── */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="flex shrink-0 cursor-grab touch-none items-center justify-between px-3 pt-2.5 pb-1 active:cursor-grabbing"
      >
        <div className="flex items-center gap-1">
          {onBack && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onBack() }}
              onPointerDown={(e) => e.stopPropagation()}
              className="rounded-full p-1.5 hover:bg-slate-100 active:bg-slate-200"
              aria-label="Back"
            >
              <ChevronLeft className="h-4 w-4 text-slate-500" />
            </button>
          )}
        </div>
        <span className="h-1.5 w-10 rounded-full bg-slate-300" />
        <div className="flex items-center gap-1">
          {onClose && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClose() }}
              onPointerDown={(e) => e.stopPropagation()}
              className="rounded-full p-1.5 hover:bg-slate-100 active:bg-slate-200"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          )}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col [&_button[aria-label='Close']]:hidden [&_button[aria-label='닫기']]:hidden">{children}</div>
    </div>
  )
}

function ShortageList({
  rows,
  onSelectOcc,
  hint,
}: {
  rows: StateOccupation[]
  onSelectOcc: (code: string) => void
  hint?: string
}) {
  const t = useTranslations()
  const locale = useLocale()
  const [limit, setLimit] = useState(10)
  const visible = rows.slice(0, limit)
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">{t.map.noShortageData}</p>
  }
  return (
    <ol>
      {hint && <li className="mb-1 px-3 text-xs text-slate-400">{hint}</li>}
      {visible.map((r, i) => (
        <li key={r.anzsco_code}>
          <button
            type="button"
            onClick={() => onSelectOcc(r.anzsco_code)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
          >
            <span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{i + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-800">
                {locale === "ko" ? (r.occupation_ko ?? r.occupation_en) : r.occupation_en}
              </span>
              <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                {r.state_count === 1 && <Badge tone="blue">{t.map.regionalSpecific}</Badge>}
                {r.on_csol && <Badge tone="green">{t.map.visaEligible}</Badge>}
              </span>
              <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-slate-100">
                <span
                  className="block h-full rounded-full bg-violet-500 transition-all"
                  style={{ width: `${r.state_shortage_rating >= 3 ? 100 : r.state_shortage_rating >= 2 ? 66 : 33}%` }}
                />
              </span>
            </span>
            <ShortageLabel rating={r.state_shortage_rating} />
          </button>
        </li>
      ))}
      {limit < rows.length && (
        <li>
          <button
            type="button"
            onClick={() => setLimit((p) => Math.min(p + 10, rows.length))}
            className="flex w-full items-center justify-center gap-1 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            {locale === "ko" ? "더보기" : "Show more"} ({rows.length - limit})
          </button>
        </li>
      )}
    </ol>
  )
}

// fallback용: shortage 데이터 없이 occupations_au (salary 존재)에서 직접 가져온 목록
function DemandOnlyList({
  rows,
  onSelectOcc,
}: {
  rows: OccRow[]
  onSelectOcc: (code: string) => void
}) {
  const locale = useLocale()
  const [limit, setLimit] = useState(10)
  const visible = rows.slice(0, limit)
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">이 직업군에 해당하는 데이터가 없습니다.</p>
  }
  return (
    <div>
      <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 leading-relaxed">
        이 직군은 기술 이민(189/190/491) 부족직종에 포함되지 않습니다.
        {' '}고용주 스폰서(482 비자) 또는 워킹홀리데이 비자로 취업이 가능합니다.
      </p>
      <ol>
        {visible.map((r, i) => (
          <li key={r.anzsco_code}>
            <button
              type="button"
              onClick={() => onSelectOcc(r.anzsco_code!)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
            >
              <span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-800">
                  {locale === "ko" ? (r.occupation_ko ?? r.occupation_en) : r.occupation_en}
                </span>
                <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  {r.on_csol ? (
                    <Badge tone="amber">Employer Sponsored (482)</Badge>
                  ) : (
                    <Badge tone="blue">High Demand</Badge>
                  )}
                </span>
              </span>
              <span className="shrink-0 text-right text-sm font-semibold tabular-nums text-slate-700">
                {r.median_salary_aud != null ? `$${(r.median_salary_aud / 1000).toFixed(0)}k` : ""}
              </span>
            </button>
          </li>
        ))}
        {limit < rows.length && (
          <li>
            <button
              type="button"
              onClick={() => setLimit((p) => Math.min(p + 10, rows.length))}
              className="flex w-full items-center justify-center gap-1 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            >
              {locale === "ko" ? "더보기" : "Show more"} ({rows.length - limit})
            </button>
          </li>
        )}
      </ol>
    </div>
  )
}

// 지역(SA4) 부족/고소득 탭 — 보라색 분야(직업군) 막대 차트.
// 분야를 누르면 그 ANZSCO 2자리에 속한 주(state) 직종으로 펼쳐지고(부족=ShortageList, 고소득=HighPayList)
// 직업 클릭 시 상세 카드로 연결된다.
function RegionGroupList({
  kind,
  entry,
  occupations,
  allOccupations,
  onSelectOcc,
  selected,
  stateSalaryMult,
  highPay,
  t,
}: {
  kind: "demand" | "pay"
  entry: RegionEntry | undefined
  occupations: StateOccupation[]
  allOccupations: OccRow[]
  onSelectOcc: (code: string) => void
  selected: StateCode
  stateSalaryMult: StateSalaryMult
  highPay: HighPayOccupation[]
  t: ReturnType<typeof useTranslations>
}) {
  const [openGroup, setOpenGroup] = useState<RegionGroup | null>(null)
  const rows = (kind === "demand" ? entry?.demand : entry?.pay) ?? []
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">{t.map.regionNoData}</p>
  }

  // 분야 드릴다운
  if (openGroup?.code) {
    const shortageGroup = occupations.filter((o) => (o.anzsco_v13 || o.anzsco_code).startsWith(openGroup.code!))
    const fallbackGroup = allOccupations.filter(
      (o) => o.anzsco_code != null && (o.anzsco_v13 || o.anzsco_code).startsWith(openGroup.code!),
    )
    const useShortage = shortageGroup.length > 0 && kind === "demand"
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpenGroup(null)}
          className="mb-1 inline-flex max-w-full items-center gap-1 px-3 text-sm text-slate-500 transition-colors hover:text-slate-800"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" />
          <span className="truncate">{openGroup.title}</span>
        </button>
        {useShortage ? (
          <ShortageList rows={shortageGroup} onSelectOcc={onSelectOcc} />
        ) : kind === "pay" ? (
          shortageGroup.length > 0 ? (
            <HighPayList
              rows={highPay}
              stateRows={shortageGroup}
              selected={selected}
              stateSalaryMult={stateSalaryMult}
              onSelectOcc={onSelectOcc}
            />
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">{t.map.regionGroupNoOcc}</p>
          )
        ) : (
          <DemandOnlyList rows={fallbackGroup} onSelectOcc={onSelectOcc} />
        )}
      </div>
    )
  }

  const max = Math.max(...rows.map((r) => r.value), 1)
  const metro = kind === "demand" && !!entry?.demandMetro
  return (
    <div>
      <p className="px-3 pb-2 text-xs text-slate-400">
        {kind === "demand" ? t.map.regionDemandHint : t.map.regionPayHint}
        {metro ? ` · ${t.map.regionMetroNote}` : ""}
      </p>
      <ol>
        {rows.map((r, i) => {
          const shortageCount = r.code ? occupations.filter((o) => (o.anzsco_v13 || o.anzsco_code).startsWith(r.code!)).length : 0
          const fallbackCount = r.code ? allOccupations.filter(
            (o) => o.anzsco_code != null && (o.anzsco_v13 || o.anzsco_code).startsWith(r.code!),
          ).length : 0
          const matchCount = kind === "demand" ? (shortageCount > 0 ? shortageCount : fallbackCount) : shortageCount
          const inner = (
            <>
              <span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-800">{r.title}</span>
                <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className="block h-full rounded-full bg-violet-500 transition-all"
                    style={{ width: `${Math.round((r.value / max) * 100)}%` }}
                  />
                </span>
              </span>
              <span className="shrink-0 text-right text-sm font-semibold tabular-nums text-slate-700">
                {r.value.toLocaleString()}
              </span>
              {matchCount > 0 && <ChevronRight className="ml-1 h-4 w-4 shrink-0 text-slate-300" />}
            </>
          )
          return (
            <li key={r.title}>
              {matchCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setOpenGroup(r)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
                >
                  {inner}
                </button>
              ) : (
                <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">{inner}</div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function adjustedSalary(
  salary: number | null,
  anzscoCode: string,
  state: string | null,
  mult: StateSalaryMult,
): { value: number | null; adjusted: boolean } {
  if (salary == null || !state) return { value: salary, adjusted: false }
  const digit = anzscoCode[0]
  const factor = mult[state]?.[digit]
  if (!factor || factor === 1) return { value: salary, adjusted: false }
  return { value: Math.round(salary * factor), adjusted: true }
}

function HighPayList({
  rows,
  stateRows,
  selected,
  stateSalaryMult,
  onSelectOcc,
}: {
  rows: HighPayOccupation[]
  stateRows: StateOccupation[]
  selected: StateCode
  stateSalaryMult: StateSalaryMult
  onSelectOcc: (code: string) => void
}) {
  const t = useTranslations()
  const locale = useLocale()
  const hasStateRows = stateRows.length > 0

  // state 선택 시: 이 주의 부족직종 중 보정 연봉 순으로 정렬 후 상위 12
  type DisplayRow = { anzsco_code: string; occupation_ko: string | null; occupation_en: string; on_csol: boolean; median_salary_aud: number | null; state_count?: number }
  const displayRows: DisplayRow[] = hasStateRows
    ? [...stateRows]
        .filter((r) => r.median_salary_aud != null)
        .sort((a, b) => {
          const adjA = adjustedSalary(a.median_salary_aud, a.anzsco_code, selected, stateSalaryMult).value ?? 0
          const adjB = adjustedSalary(b.median_salary_aud, b.anzsco_code, selected, stateSalaryMult).value ?? 0
          return adjB - adjA
        })
        .slice(0, 12)
    : rows

  const hint = hasStateRows ? t.map.payHintState : t.map.payHintNational

  const computed = displayRows.map((r) => ({
    r,
    ...adjustedSalary(r.median_salary_aud, r.anzsco_code, hasStateRows ? selected : null, stateSalaryMult),
  }))
  const maxAdj = Math.max(...computed.map((c) => c.value ?? 0), 1)

  return (
    <div>
      <p className="mb-1 px-3 text-xs text-slate-400">{hint}</p>
      <ol>
        {computed.map(({ r, value: adj, adjusted }, i) => {
          return (
            <li key={r.anzsco_code}>
              <button
                type="button"
                onClick={() => onSelectOcc(r.anzsco_code)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
              >
                <span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-800">
                    {locale === "ko" ? (r.occupation_ko ?? r.occupation_en) : r.occupation_en}
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    {r.on_csol && <Badge tone="green">{t.map.visaEligible}</Badge>}
                    {"state_count" in r && r.state_count === 1 && (
                      <Badge tone="blue">{t.map.regionalSpecific}</Badge>
                    )}
                  </span>
                  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <span
                      className="block h-full rounded-full bg-violet-500 transition-all"
                      style={{ width: `${adj ? Math.round((adj / maxAdj) * 100) : 0}%` }}
                    />
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-semibold tabular-nums text-slate-700">
                    {adj != null ? `A$${adj.toLocaleString()}` : "—"}
                  </span>
                  {adjusted && (
                    <span className="block text-[10px] text-slate-400">{selected} {t.map.salaryAdjusted} · Census 2021</span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function EmploymentList({
  sa4,
  stateCode,
  sa4Regions,
  neroData,
  onSelectNero,
}: {
  sa4: SA4Region | null
  stateCode: StateCode | null
  sa4Regions: SA4Region[]
  neroData: Record<string, NeroOccupation[]> | null
  onSelectNero: (a4: string) => void
}) {
  const t = useTranslations()

  if (!neroData) {
    return (
      <div className="flex flex-col items-center gap-2 py-10">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-violet-500" />
        <p className="text-sm text-slate-400">{t.map.loadingEmployment}</p>
      </div>
    )
  }

  let occs: NeroOccupation[]

  if (sa4) {
    occs = neroData[sa4.code] ?? []
  } else if (stateCode && sa4Regions.length > 0) {
    const agg = new Map<string, { a4: string; name: string; emp: number }>()
    for (const region of sa4Regions) {
      const rows = neroData[region.code] ?? []
      for (const r of rows) {
        const existing = agg.get(r.a4)
        if (existing) {
          existing.emp += r.emp
        } else {
          agg.set(r.a4, { a4: r.a4, name: r.name, emp: r.emp })
        }
      }
    }
    occs = Array.from(agg.values()).sort((a, b) => b.emp - a.emp)
  } else {
    return <p className="py-8 text-center text-sm text-slate-400">{t.map.noEmploymentData}</p>
  }

  if (occs.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">{t.map.noEmploymentData}</p>
  }

  const maxEmp = occs[0].emp

  return (
    <div>
      <p className="mb-1 px-3 text-xs text-slate-400">
        {t.map.employmentSource}
      </p>
      <ol>
        {occs.map((r, i) => (
          <li key={r.a4}>
            <button
              type="button"
              onClick={() => onSelectNero(r.a4)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-50"
            >
              <span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-800">{r.name}</span>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-violet-400"
                    style={{ width: `${Math.round((r.emp / maxEmp) * 100)}%` }}
                  />
                </div>
              </span>
              <span className="ml-2 shrink-0 text-xs tabular-nums text-slate-500">
                {t.map.peopleFmt.replace('{n}', r.emp.toLocaleString())}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

function getStateForSA4(code: string): StateCode | null {
  for (const [state, regions] of Object.entries(SA4_BY_STATE)) {
    if (regions.some((r) => r.code === code)) return state as StateCode
  }
  return null
}

function padPostcode(n: number): string {
  return n.toString().padStart(4, "0")
}

function formatPostcodeList(entries: typeof WHV_POSTCODES[string]): string {
  const codes: number[] = []
  for (const e of entries) {
    codes.push(...e.postcodes)
    if (e.ranges) {
      for (const [lo, hi] of e.ranges) {
        for (let i = lo; i <= hi; i++) codes.push(i)
      }
    }
  }
  const sorted = Array.from(new Set(codes)).sort((a, b) => a - b)
  if (sorted.length === 0) return ""
  const parts: string[] = []
  let start = sorted[0]
  let end = sorted[0]
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) { end = sorted[i]; continue }
    parts.push(start === end ? padPostcode(start) : `${padPostcode(start)}–${padPostcode(end)}`)
    start = sorted[i]; end = sorted[i]
  }
  parts.push(start === end ? padPostcode(start) : `${padPostcode(start)}–${padPostcode(end)}`)
  return parts.join(", ")
}

// Expand all eligible postcodes for a state into a flat sorted array
function expandStatePostcodes(stateCode: StateCode): number[] {
  const entries = WHV_POSTCODES[stateCode]
  if (!entries) return []
  const codes: number[] = []
  for (const e of entries) {
    codes.push(...e.postcodes)
    if (e.ranges) {
      for (const [lo, hi] of e.ranges) {
        for (let i = lo; i <= hi; i++) codes.push(i)
      }
    }
  }
  return Array.from(new Set(codes)).sort((a, b) => a - b)
}

// Get only the eligible postcodes that fall within a specific SA4
function getPostcodesForSA4(sa4Code: string, stateCode: StateCode): number[] {
  const allEligible = expandStatePostcodes(stateCode)
  return allEligible.filter((pc) => POSTCODE_TO_SA4[pc] === sa4Code)
}

// Format an array of postcodes as compact range string (4-digit padded)
function formatSA4Postcodes(pcs: number[]): string {
  if (pcs.length === 0) return ""
  const sorted = Array.from(new Set(pcs)).sort((a, b) => a - b)
  const parts: string[] = []
  let start = sorted[0]
  let end = sorted[0]
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) { end = sorted[i]; continue }
    parts.push(start === end ? padPostcode(start) : `${padPostcode(start)}–${padPostcode(end)}`)
    start = sorted[i]; end = sorted[i]
  }
  parts.push(start === end ? padPostcode(start) : `${padPostcode(start)}–${padPostcode(end)}`)
  return parts.join(", ")
}

function WHVPanel({
  selectedSA4,
  selected,
  sa4Regions,
  onToggleSave,
  onShare,
  savedOccCodes,
}: {
  selectedSA4: SA4Region | null
  selected: StateCode | null
  sa4Regions: SA4Region[]
  onToggleSave?: (code: string, title: string) => void
  onShare?: (title: string) => void
  savedOccCodes?: Set<string>
}) {
  const locale = useLocale()

  if (selectedSA4) {
    const whv = WHV_REGIONS[selectedSA4.code]
    const labels: Record<string, string> = {
      eligible: locale === "ko" ? "세컨비자 가능" : "Second Visa Eligible",
      partial: locale === "ko" ? "일부 가능" : "Partially Eligible",
      none: locale === "ko" ? "불가능" : "Not Eligible",
    }
    const colors: Record<string, string> = { eligible: "text-violet-600", partial: "text-violet-400", none: "text-slate-400" }
    const stateCode = getStateForSA4(selectedSA4.code)
    const sa4Postcodes = stateCode && whv && whv.category === "partial"
      ? getPostcodesForSA4(selectedSA4.code, stateCode)
      : undefined

    return (
      <div className="space-y-3 px-3">
        <p className="text-xs text-slate-400">
          {locale === "ko"
              ? "선택한 지역의 세컨비자(417/462) 지정 근무 가능 여부입니다."
              : "Second Visa (417/462) specified work eligibility for the selected SA4 region."}
        </p>
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800">{selectedSA4.name}</p>
              <p className={`mt-1 text-sm font-semibold ${colors[whv?.category ?? "none"]}`}>
                {whv ? labels[whv.category] : labels.none}
              </p>
              {whv && whv.pct < 100 && (
                <p className="mt-1 text-xs text-slate-400">
                  {whv.pct}% of postcodes in this region are WHV-eligible
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {onToggleSave && (
                <button type="button"
                  onClick={() => onToggleSave(selectedSA4.code, selectedSA4.name)}
                  aria-label={locale === "ko" ? "저장" : "Save"}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <Bookmark className="h-4 w-4" fill={savedOccCodes?.has(selectedSA4.code) ? "currentColor" : "none"} />
                </button>
              )}
              {onShare && (
                <button type="button"
                  onClick={() => onShare(selectedSA4.name)}
                  aria-label={locale === "ko" ? "공유" : "Share"}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {whv && whv.workCategories && whv.workCategories.length > 0 && (
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs font-medium text-slate-500 mb-2">
              {locale === "ko" ? "세컨비자 지정 근무 가능 직종" : "Eligible specified work"}
            </p>
            <a
              href={WHV_GENERAL_JOBS.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-3 flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-100"
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              {locale === "ko" ? WHV_GENERAL_JOBS.label_ko : WHV_GENERAL_JOBS.label_en}
            </a>
            <div className="space-y-2">
              {whv.workCategories.map((key) => {
                const work = WHV_SPECIFIED_WORK.find((w) => w.key === key)
                if (!work) return null
                const examples = locale === "ko" ? work.examples_ko : work.examples_en
                const label = locale === "ko" ? work.label_ko : work.label_en
                const links = WHV_JOB_LINKS[key]
                return (
                  <div key={key}>
                    <p className="text-sm font-medium text-slate-700">{label}</p>
                    <p className="text-xs text-slate-400">{examples.join(" · ")}</p>
                    {links && links.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {links.map((link, i) => (
                          <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 rounded bg-blue-50 px-1.5 py-0.5 text-[11px] text-blue-700 transition-colors hover:bg-blue-100"
                          >
                            <ExternalLink className="h-2.5 w-2.5" />
                            {locale === "ko" ? link.label_ko : link.label_en}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {(() => {
          const employers = WHV_REGION_EMPLOYERS[selectedSA4.code]
          if (!employers || employers.length === 0) return null
          const catLabels: Record<string, { en: string; ko: string }> = {
            mine: { en: "Mining", ko: "광업" },
            hotel: { en: "Hospitality", ko: "관광/호스피탈리티" },
            farm: { en: "Agriculture", ko: "농업" },
            factory: { en: "Manufacturing", ko: "제조업" },
          }
          const catColors: Record<string, string> = {
            mine: "bg-amber-100 text-amber-700",
            hotel: "bg-blue-100 text-blue-700",
            farm: "bg-green-100 text-green-700",
            factory: "bg-purple-100 text-purple-700",
          }
          return (
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="mb-2 text-xs font-medium text-slate-500">
                {locale === "ko" ? "지역 고용주" : "Regional Employers"}
              </p>
              <div className="space-y-2">
                {employers.map((emp, i) => (
                  <div key={i} className="rounded-md border border-slate-100 bg-slate-50/50 p-2.5 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-800">{emp.name}</p>
                      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${catColors[emp.category]}`}>
                        {locale === "ko" ? catLabels[emp.category].ko : catLabels[emp.category].en}
                      </span>
                    </div>
                    <p className="mt-0.5 text-slate-500">{emp.town}</p>
                    <p className="mt-0.5 text-slate-600">{emp.description}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <a href={emp.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-700 transition-colors hover:bg-slate-200">
                        <ExternalLink className="h-2.5 w-2.5" /> {locale === "ko" ? "웹사이트" : "Website"}
                      </a>
                      <a href={emp.seekUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 rounded bg-rose-50 px-1.5 py-0.5 text-[11px] text-rose-700 transition-colors hover:bg-rose-100">
                        <ExternalLink className="h-2.5 w-2.5" /> Seek
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {sa4Postcodes && sa4Postcodes.length > 0 && (
          <details className="rounded-lg border border-slate-200 p-3 text-xs text-slate-500 open:pb-3">
            <summary className="cursor-pointer font-medium text-slate-700">
              {locale === "ko" ? `${selectedSA4.name} 세컨비자 가능 포스트코드` : `${selectedSA4.name} eligible postcodes`}
            </summary>
            <p className="mt-2 font-mono text-slate-600 leading-relaxed">{formatSA4Postcodes(sa4Postcodes)}</p>
          </details>
        )}
        <AffiliateCtas />
      </div>
    )
  }

  if (selected && sa4Regions.length > 0) {
    const eligible = sa4Regions.filter((r) => WHV_REGIONS[r.code]?.category === "eligible").length
    const partial = sa4Regions.filter((r) => WHV_REGIONS[r.code]?.category === "partial").length
    const none = sa4Regions.filter((r) => WHV_REGIONS[r.code]?.category === "none").length
    const statePostcodes = WHV_POSTCODES[selected]
    return (
      <div className="space-y-3 px-3">
        <p className="text-xs text-slate-400">
          {locale === "ko"
            ? "해당 주(State)의 SA4 지역별 세컨비자 지정 근무 가능 지역입니다. 지역을 클릭하면 자세한 정보를 볼 수 있습니다."
            : "Second Visa specified work eligibility by SA4 region. Click a region for details."}
        </p>
        <div className="rounded-lg border border-slate-200 p-3 text-sm">
          {eligible > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-violet-600" />
                {locale === "ko" ? "가능" : "Eligible"}
              </span>
              <span className="font-medium text-slate-700">{eligible}</span>
            </div>
          )}
          {partial > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-violet-400" />
                {locale === "ko" ? "일부 가능" : "Partially eligible"}
              </span>
              <span className="font-medium text-slate-700">{partial}</span>
            </div>
          )}
          {none > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-slate-400" />
                {locale === "ko" ? "불가능" : "Not eligible"}
              </span>
              <span className="font-medium text-slate-700">{none}</span>
            </div>
          )}
        </div>

        {statePostcodes && (
          <details className="rounded-lg border border-slate-200 p-3 text-xs text-slate-500 open:pb-3">
            <summary className="cursor-pointer font-medium text-slate-700">
              {locale === "ko" ? `${selected} 세컨비자 가능 포스트코드` : `${selected} eligible postcodes`}
            </summary>
            <div className="mt-2 space-y-2">
              {statePostcodes.map((entry, i) => {
                const expanded = formatPostcodeList([entry])
                if (!expanded) {
                  return (
                    <p key={i} className="text-slate-500">
                      {locale === "ko" ? entry.note_ko : entry.note_en}
                    </p>
                  )
                }
                return (
                  <div key={i}>
                    <p className="text-slate-500">{locale === "ko" ? entry.note_ko : entry.note_en}</p>
                    <p className="mt-0.5 font-mono text-xs text-slate-600 leading-relaxed">{expanded}</p>
                  </div>
                )
              })}
            </div>
          </details>
        )}
        <AffiliateCtas />
      </div>
    )
  }

  return (
    <p className="py-8 text-center text-sm text-slate-400">
      {locale === "ko" ? "주와 지역을 선택해주세요." : "Select a state and region to view WHV eligibility."}
    </p>
  )
}

function UniversityInfoCard({
  college,
  onClose,
  showInlineClose = true,
  isSaved,
  onToggleSave,
  onShare,
  country,
  deCity,
  deRegionOccs,
  nlCity,
  nlRegionOccs,
}: {
  college: USRankedCollege | AURankedCollege | CACollege | UKCollege | DECollege | NLCollege
  onClose: () => void
  showInlineClose?: boolean
  isSaved: boolean
  onToggleSave: (slug: string, name: string) => void
  onShare: (slug: string) => void
  country?: string | null
  deCity?: DECity | null
  deRegionOccs?: DERegionOccupation[]
  nlCity?: NLCity | null
  nlRegionOccs?: NLRegionOccupation[]
}) {
  const isUK = "region" in college && country === "UK"
  const isDE = "region" in college && country === "DE"
  const isNL = "province" in college && country === "NL"
  const isCA = "province" in college && country === "CA"
  const isUS = "college_id" in college
  const stateOrProv = "college_id" in college ? (college as USRankedCollege | AURankedCollege).college_state : "province" in college ? (isCA ? (college as CACollege).province : NL_PROVINCE_NAMES[(college as NLCollege).province] ?? (college as NLCollege).province) : "region" in college ? (college as UKCollege | DECollege).region : ""
  const qsRank = "qsRank" in college ? (college as USRankedCollege | AURankedCollege).qsRank : (college as CACollege | UKCollege | DECollege | NLCollege).qs_rank
  const tuition = isDE ? (college as DECollege).tuition ?? null : isNL ? (college as NLCollege).tuition ?? null : "avg_net_price" in college ? (college as CACollege).avg_net_price : "tuition" in college ? (college as USRankedCollege | UKCollege).tuition : null
  const hasEarningsAndCost = !isDE && !isNL && "median_earnings" in college && college.median_earnings != null && ("tuition" in college ? college.tuition != null : "avg_net_price" in college ? college.avg_net_price != null : false)
  const netSalary = hasEarningsAndCost
    ? "tuition" in college
      ? college.median_earnings! - college.tuition!
      : college.median_earnings! - (college as CACollege).avg_net_price!
    : "net_salary" in college ? (college as USRankedCollege).net_salary : null
  const roiScore = hasEarningsAndCost
    ? "tuition" in college && college.tuition != null
      ? Math.round((college.median_earnings! / college.tuition!) * 10) / 10
      : Math.round((college.median_earnings! / (college as CACollege).avg_net_price!) * 10) / 10
    : "roi_score" in college ? (college as USRankedCollege).roi_score : null
  const currency = isDE || isNL ? "€" : isUK ? "£" : isCA ? "C$" : isUS ? "$" : "A$"

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-slate-900">{college.college_name}</h2>
          <p className="text-xs text-slate-500">{college.city_name}, {stateOrProv}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onToggleSave(college.slug, college.college_name)}
            aria-label="Save university"
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            onClick={() => onShare(college.slug)}
            aria-label="Share university"
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <Share2 className="h-4 w-4" />
          </button>
          {showInlineClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-1 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {qsRank != null && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-700">
            QS #{qsRank}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {(isDE || isNL) && tuition == null ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-600">Tuition</p>
              <p className="mt-1 text-lg font-bold text-emerald-700">Tuition-Free</p>
            </div>
          ) : tuition != null ? (
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Tuition</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">
                {currency}{tuition.toLocaleString()}
              </p>
            </div>
          ) : null}
          {"median_earnings" in college && college.median_earnings != null && (
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Median Earnings</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">
                {currency}{college.median_earnings.toLocaleString()}
              </p>
            </div>
          )}
          {netSalary != null && (
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Net Salary</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">
                {currency}{netSalary.toLocaleString()}
              </p>
            </div>
          )}
          {"graduation_rate" in college && college.graduation_rate != null && (
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Graduation Rate</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">
                {Math.round(college.graduation_rate * 100)}%
              </p>
            </div>
          )}
          {roiScore != null && (
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">ROI Score</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">
                {roiScore}
              </p>
            </div>
          )}
        </div>

        {isDE && deCity && (
          <div className="mt-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">City Living Cost</p>
            <div className="grid grid-cols-2 gap-2">
              {deCity.rent_median != null && (
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Median Rent</p>
                  <p className="mt-0.5 text-base font-bold tabular-nums text-slate-900">
                    €{deCity.rent_median.toLocaleString()}/mo
                  </p>
                </div>
              )}
              {deCity.cost_of_living_index != null && (
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Cost of Living</p>
                  <p className="mt-0.5 text-base font-bold tabular-nums text-slate-900">
                    {deCity.cost_of_living_index.toFixed(1)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {isDE && deRegionOccs && deRegionOccs.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Top-paying jobs in {stateOrProv}
            </p>
            <div className="space-y-1.5">
              {deRegionOccs.slice(0, 4).map((occ) => (
                <div key={occ.kldb_code} className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2">
                  <span className="text-xs text-slate-700 truncate mr-2">{occ.occupation_en}</span>
                  <span className="text-xs font-semibold tabular-nums text-slate-900 shrink-0">
                    {occ.median_salary_eur != null ? `€${occ.median_salary_eur.toLocaleString()}` : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isNL && nlCity && (
          <div className="mt-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">City Living Cost</p>
            <div className="grid grid-cols-2 gap-2">
              {nlCity.rent_median != null && (
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Median Rent</p>
                  <p className="mt-0.5 text-base font-bold tabular-nums text-slate-900">
                    €{nlCity.rent_median.toLocaleString()}/mo
                  </p>
                </div>
              )}
              {nlCity.cost_of_living_index != null && (
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Cost of Living</p>
                  <p className="mt-0.5 text-base font-bold tabular-nums text-slate-900">
                    {nlCity.cost_of_living_index.toFixed(1)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {isNL && nlRegionOccs && nlRegionOccs.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Top-paying jobs in {stateOrProv}
            </p>
            <div className="space-y-1.5">
              {nlRegionOccs.slice(0, 4).map((occ) => (
                <div key={occ.sbc_code} className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2">
                  <span className="text-xs text-slate-700 truncate mr-2">{occ.occupation_en}</span>
                  <span className="text-xs font-semibold tabular-nums text-slate-900 shrink-0">
                    {occ.median_salary_eur != null ? `€${occ.median_salary_eur.toLocaleString()}` : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {college.website && (
          <a
            href={college.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            <ExternalLink className="h-4 w-4" />
            Visit official website
          </a>
        )}
      </div>
    </>
  )
}

function StateInfoPanel({
  stateInfo,
  majors,
}: {
  stateInfo: USStateInfo | null
  majors: StateMajorDensity[]
}) {
  return (
    <div className="space-y-5">
      {stateInfo && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Affordability
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Median Rent</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">
                {stateInfo.medianRent != null ? `$${stateInfo.medianRent.toLocaleString()}/mo` : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Median Income</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">
                {stateInfo.medianIncome != null ? `$${stateInfo.medianIncome.toLocaleString()}/yr` : "—"}
              </p>
            </div>
          </div>
          {stateInfo.rentIncomeRatio != null && (
            <div className="mt-3 rounded-lg border p-3" style={{
              borderColor: stateInfo.rentIncomeRatio > 0.3 ? "#fecaca" : stateInfo.rentIncomeRatio > 0.22 ? "#fed7aa" : "#bbf7d0",
              backgroundColor: stateInfo.rentIncomeRatio > 0.3 ? "#fef2f2" : stateInfo.rentIncomeRatio > 0.22 ? "#fff7ed" : "#f0fdf4",
            }}>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Rent-to-Income Ratio</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">
                {Math.round(stateInfo.rentIncomeRatio * 100)}%
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {stateInfo.rentIncomeRatio > 0.3
                  ? "High cost — rent takes over 30% of income"
                  : stateInfo.rentIncomeRatio > 0.22
                    ? "Moderate cost — rent takes 22–30% of income"
                    : "Affordable — rent under 22% of income"}
              </p>
            </div>
          )}
          {stateInfo.rentByBedrooms && (
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Median Rent by Bedrooms</p>
              <div className="grid grid-cols-5 gap-1.5">
                {(["studio", "1br", "2br", "3br", "4br"] as const).map((b) => (
                  <div key={b} className="rounded border border-slate-100 bg-white p-2 text-center">
                    <p className="text-[10px] text-slate-400">{b === "studio" ? "Studio" : b.toUpperCase()}</p>
                    <p className="mt-0.5 text-xs font-semibold tabular-nums text-slate-800">
                      {stateInfo.rentByBedrooms?.[b] != null ? `$${stateInfo.rentByBedrooms[b].toLocaleString()}` : "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
      {!stateInfo && (
        <p className="py-4 text-center text-sm text-slate-400">No affordability data for this state yet.</p>
      )}

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Top Majors in This State
        </h3>
        {majors.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">No major data for this state yet.</p>
        ) : (
          <ol>
            {majors.slice(0, 10).map((m, i) => (
              <li key={m.slug}>
                <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-50">
                  <span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-800">{m.label}</span>
                    <span className="mt-0.5 text-xs text-slate-400">
                      {m.occupationCount} occupation{m.occupationCount > 1 ? "s" : ""} · {m.totalEmp.toLocaleString()} employed
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-sm font-semibold tabular-nums text-slate-700">
                    ${m.avgWage.toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}

function CACitiesPanel({
  cities,
  province,
}: {
  cities: CACity[]
  province: string | null
}) {
  const filtered = province ? cities.filter((c) => c.province === province) : cities
  if (filtered.length === 0) return null

  const maxRent = Math.max(...filtered.map((c) => c.rent_median ?? 0), 1)
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Cost of Living</h3>
      <div className="space-y-1">
        {filtered.map((c) => {
          const barPct = c.rent_median != null ? (c.rent_median / maxRent) * 100 : 0
          const affordability =
            c.cost_of_living_index != null
              ? c.cost_of_living_index > 90 ? "High" : c.cost_of_living_index > 75 ? "Moderate" : "Low"
              : null
          return (
            <div key={c.name} className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-50">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-800">{c.name}</span>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${barPct}%`,
                        backgroundColor: barPct > 80 ? "#ef4444" : barPct > 50 ? "#f59e0b" : "#22c55e",
                      }}
                    />
                  </div>
                  {affordability && (
                    <span className="shrink-0 text-[10px] font-medium" style={{
                      color: affordability === "High" ? "#ef4444" : affordability === "Moderate" ? "#f59e0b" : "#22c55e",
                    }}>
                      {affordability}
                    </span>
                  )}
                </div>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-sm font-semibold tabular-nums text-slate-700">
                  {c.rent_median != null ? `$${c.rent_median.toLocaleString()}` : "—"}
                </span>
                <span className="block text-[10px] text-slate-400">/mo</span>
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function UKCitiesPanel({
  cities,
  region,
}: {
  cities: UKCity[]
  region: string | null
}) {
  const filtered = region ? cities.filter((c) => c.region === region) : cities
  if (filtered.length === 0) return null

  const sorted = [...filtered].sort((a, b) => (b.rent_median ?? 0) - (a.rent_median ?? 0))
  const maxRent = Math.max(...filtered.map((c) => c.rent_median ?? 0), 1)
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Cost of Living</h3>
      <div className="space-y-1">
        {sorted.map((c) => {
          const barPct = c.rent_median != null ? (c.rent_median / maxRent) * 100 : 0
          const affordability =
            c.cost_of_living_index != null
              ? c.cost_of_living_index > 90 ? "High" : c.cost_of_living_index > 75 ? "Moderate" : "Low"
              : null
          return (
            <div key={c.name} className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-50">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-800">{c.name}</span>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${barPct}%`,
                        backgroundColor: barPct > 80 ? "#ef4444" : barPct > 50 ? "#f59e0b" : "#22c55e",
                      }}
                    />
                  </div>
                  {affordability && (
                    <span className="shrink-0 text-[10px] font-medium" style={{
                      color: affordability === "High" ? "#ef4444" : affordability === "Moderate" ? "#f59e0b" : "#22c55e",
                    }}>
                      {affordability}
                    </span>
                  )}
                </div>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-sm font-semibold tabular-nums text-slate-700">
                  {c.rent_median != null ? `£${c.rent_median.toLocaleString()}` : "—"}
                </span>
                <span className="block text-[10px] text-slate-400">/mo</span>
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function CACollegesPanel({
  colleges,
  province,
}: {
  colleges: CACollege[]
  province: string | null
}) {
  const filtered = province ? colleges.filter((c) => c.province === province) : colleges
  if (filtered.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">No university data for this province yet.</p>
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">{filtered.length} universities{province ? ` in ${CA_PROVINCE_NAMES[province] ?? province}` : ""}</p>
      <ol>
        {filtered.map((c, i) => (
          <li key={c.institution_id}>
            <Link
              href={`/map/ca/university/${c.slug}`}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
            >
              <span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-800">{c.college_name}</span>
                <span className="mt-0.5 text-xs text-slate-400">{c.city_name}</span>
              </span>
              <span className="shrink-0 text-right text-sm font-semibold tabular-nums text-slate-700">
                {c.median_earnings != null ? `$${c.median_earnings.toLocaleString()}` : "—"}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}

function UKCollegesPanel({
  colleges,
  region,
  onSelect,
}: {
  colleges: UKCollege[]
  region: string | null
  onSelect: (college: UKCollege) => void
}) {
  const filtered = region ? colleges.filter((c) => c.region === region) : colleges
  if (filtered.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">No university data for this region yet.</p>
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">{filtered.length} universities{region ? ` in ${UK_REGION_NAMES[region] ?? region}` : ""}</p>
      <ol>
        {filtered.map((c, i) => (
          <li key={c.institution_id}>
            <button
              onClick={() => onSelect(c)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
            >
              <span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-800">{c.college_name}</span>
                <span className="mt-0.5 text-xs text-slate-400">{c.city_name}</span>
              </span>
              <span className="shrink-0 text-right text-sm font-semibold tabular-nums text-slate-700">
                {c.median_earnings != null ? `£${c.median_earnings.toLocaleString()}` : "—"}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

function CAOccupationDetail({
  occ,
  provinceShortages,
  currentProvince,
  onBack,
  onClose,
  t,
  savedOccCodes,
  onToggleSave,
  onShare,
}: {
  occ: CAOccRow
  provinceShortages: StateShortageByOcc[]
  currentProvince: string | null
  onBack: () => void
  onClose: () => void
  t: ReturnType<typeof useTranslations>
  savedOccCodes: Set<string>
  onToggleSave: (occCode: string, occTitle: string) => void
  onShare: (occTitle: string) => void
}) {
  const locale = useLocale()
  const name = locale === "ko" && occ.occupation_ko ? occ.occupation_ko : occ.occupation_en

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {null}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.map.close}
          className="-mr-1 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-sans text-lg font-semibold text-slate-900 tracking-tight">
            {name}
          </h2>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onToggleSave(occ.noc_code, name)}
              aria-label="Save occupation"
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <Bookmark className="h-4 w-4" fill={savedOccCodes.has(occ.noc_code) ? "currentColor" : "none"} />
            </button>
            <button
              type="button"
              onClick={() => onShare(name)}
              aria-label="Share occupation"
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Badge tone="gray">NOC {occ.noc_code}</Badge>
          {occ.confidence && <Badge tone="blue">{occ.confidence}</Badge>}
        </div>

        {occ.noc_code && (
          <Link
            href="/career"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            자세히 보기
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}

        <div className="mt-5 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {t.map.detailMedianSalary}
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums text-slate-800">
              {occ.median_salary_cad != null ? `C$${occ.median_salary_cad.toLocaleString()}` : "—"}
            </p>
            {(occ.low_wage_cad != null || occ.high_wage_cad != null) && (
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                {occ.low_wage_cad != null && <span>Low: C${occ.low_wage_cad.toLocaleString()}</span>}
                {occ.high_wage_cad != null && <span>High: C${occ.high_wage_cad.toLocaleString()}</span>}
              </div>
            )}
          </div>

          {occ.shortage_rating != null && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Shortage Rating
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", shortageColor(occ.shortage_rating))}
                    style={{ width: `${Math.round((occ.shortage_rating / 5) * 100)}%` }}
                  />
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-700">
                  {occ.shortage_rating}/5
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{shortageLabel(occ.shortage_rating, t)}</p>
            </div>
          )}

          {provinceShortages.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Shortage by Province
              </p>
              <div className="mt-2 space-y-1">
                {provinceShortages.map((ps) => (
                  <div
                    key={ps.state}
                    className={cn(
                      "flex items-center justify-between rounded px-2 py-1",
                      ps.state === currentProvince && "bg-blue-100"
                    )}
                  >
                    <span className="text-xs font-medium text-slate-600">{ps.state}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs tabular-nums text-slate-500">{ps.rating}/5</span>
                      <span className={cn("h-2 w-8 rounded-full", shortageBar(ps.rating))} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {occ.data_source && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Source</p>
              <p className="mt-1 text-xs text-slate-600">{occ.data_source}</p>
              {occ.last_verified && (
                <p className="mt-0.5 text-[10px] text-slate-400">Verified: {occ.last_verified}</p>
              )}
            </div>
          )}

          <AffiliateCtas />
        </div>
      </div>
    </>
  )
}

function CAShortageList({ rows, onSelectOcc }: { rows: CAOccRow[]; onSelectOcc?: (code: string) => void }) {
  const t = useTranslations()
  const locale = useLocale()
  const [limit, setLimit] = useState(10)
  const sorted = [...rows]
    .filter((r) => r.shortage_rating != null)
    .sort((a, b) => (b.shortage_rating ?? 0) - (a.shortage_rating ?? 0))
  const visible = sorted.slice(0, limit)
  if (visible.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">{t.map.noShortageData}</p>
  }
  return (
    <ol>
      {visible.map((r, i) => (
        <li key={r.noc_code}>
          <button
            type="button"
            onClick={() => onSelectOcc?.(r.noc_code)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
          >
            <span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{i + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-800">
                {locale === "ko" ? (r.occupation_ko ?? r.occupation_en) : r.occupation_en}
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-sm font-semibold tabular-nums text-slate-700">
                {r.median_salary_cad != null ? `C$${r.median_salary_cad.toLocaleString()}` : "—"}
              </span>
              <span className="text-[10px] text-slate-400">Shortage: {r.shortage_rating}/5</span>
            </span>
          </button>
        </li>
      ))}
      {limit < sorted.length && (
        <li>
          <button
            type="button"
            onClick={() => setLimit((p) => Math.min(p + 10, sorted.length))}
            className="flex w-full items-center justify-center gap-1 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            {locale === "ko" ? "더보기" : "Show more"} ({sorted.length - limit})
          </button>
        </li>
      )}
    </ol>
  )
}

function CAHighPayList({ rows, provinceRows, onSelectOcc }: { rows: CAHighPayOccupation[]; provinceRows?: CAHighPayOccupation[]; onSelectOcc?: (code: string) => void }) {
  const t = useTranslations()
  const locale = useLocale()
  const display = provinceRows && provinceRows.length > 0 ? provinceRows : rows
  if (display.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">{t.map.noShortageData}</p>
  }
  return (
    <ol>
      {display.map((r, i) => (
        <li key={r.noc_code}>
          <button
            type="button"
            onClick={() => onSelectOcc?.(r.noc_code)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
          >
            <span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{i + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-800">
                {locale === "ko" ? (r.occupation_ko ?? r.occupation_en) : r.occupation_en}
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-sm font-semibold tabular-nums text-slate-700">
                {r.median_salary_cad != null ? `C$${r.median_salary_cad.toLocaleString()}` : "—"}
              </span>
              {r.shortage_rating != null && (
                <span className="text-[10px] text-slate-400">Shortage: {r.shortage_rating}/5</span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}

function USShortageList({ rows, onSelectOcc }: { rows: USOccupation[]; onSelectOcc: (occ: USOccupation) => void }) {
  const t = useTranslations()
  const locale = useLocale()
  const [limit, setLimit] = useState(10)
  const visible = rows.slice(0, limit)
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">{t.map.noShortageData}</p>
  }
  return (
    <ol>
      {visible.map((r, i) => (
        <li key={r.occ_code}>
          <button
            type="button"
            onClick={() => onSelectOcc(r)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
          >
            <span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{i + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-800">
                {r.occ_title}
              </span>
              <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                {r.pct_change > 0 && <span>Growth: +{r.pct_change}%</span>}
                {r.annual_openings > 0 && <span>· Openings: {r.annual_openings.toLocaleString()}</span>}
              </span>
            </span>
            <span className="shrink-0 text-right text-sm font-semibold tabular-nums text-slate-700">
              ${r.median_wage.toLocaleString()}
            </span>
          </button>
        </li>
      ))}
      {limit < rows.length && (
        <li>
          <button
            type="button"
            onClick={() => setLimit((p) => Math.min(p + 10, rows.length))}
            className="flex w-full items-center justify-center gap-1 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            {locale === "ko" ? "더보기" : "Show more"} ({rows.length - limit})
          </button>
        </li>
      )}
    </ol>
  )
}

function USHighPayList({ rows, onSelectOcc }: { rows: USOccupation[]; onSelectOcc: (occ: USOccupation) => void }) {
  const t = useTranslations()
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">{t.map.noShortageData}</p>
  }
  return (
    <ol>
      {rows.map((r, i) => (
        <li key={r.occ_code}>
          <button
            type="button"
            onClick={() => onSelectOcc(r)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
          >
            <span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{i + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-800">
                {r.occ_title}
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-sm font-semibold tabular-nums text-slate-700">
                ${r.median_wage.toLocaleString()}
              </span>
              {r.pct_change > 0 && (
                <span className="text-[10px] text-emerald-600">+{r.pct_change}% growth</span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}

function shortageLabel(score: number | null, t: ReturnType<typeof useTranslations>): string {
  if (score == null || score < 3) return t.map.detailLevelLow
  if (score >= 5) return t.map.detailLevelStrong
  if (score >= 4) return t.map.detailLevelHigh
  return t.map.detailLevelMedium
}

function shortageColor(score: number | null): string {
  if (score == null || score < 3) return "bg-slate-300"
  if (score >= 5) return "bg-rose-500"
  if (score >= 4) return "bg-orange-400"
  return "bg-amber-300"
}

function shortageBar(score: number | null): string {
  return shortageColor(score)
}

// 코스의 "관련 학과" 링크 — 대학 공식 도메인(website_url) 안에서 코스명으로 사이트 검색.
// 별도 URL 데이터 없이도 학교 홈페이지가 아니라 해당 프로그램 페이지로 바로 안내한다.
function courseProgramUrl(websiteUrl: string | null, title: string): string | null {
  if (!websiteUrl) return null
  let domain: string
  try {
    domain = new URL(websiteUrl).hostname.replace(/^www\./, "")
  } catch {
    return null
  }
  if (!domain) return null
  return `https://www.google.com/search?q=${encodeURIComponent(`${title} site:${domain}`)}`
}

// 미국 대학은 데이터에 공식 URL이 없어, 학교명 검색으로 공식 사이트까지 안내한다.
function collegeSearchUrl(name: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(name)}`
}

function aqfLabel(level: number | null): string {
  if (!level) return ""
  if (level >= 10) return "Doctoral"
  if (level === 9) return "Master"
  if (level === 8) return "Grad Cert"
  if (level === 7) return "Bachelor"
  if (level === 6) return "Adv Dip"
  if (level === 5) return "Diploma"
  return `Cert ${level}`
}

function OccupationDetail({
  occ,
  stateShortages,
  onBack,
  onClose,
  t,
  currentState,
  data,
  savedOccCodes,
  onToggleSave,
  onShare,
  labourMarket,
  showInlineControls = true,
  routeMode = false,
}: {
  occ: OccRow
  stateShortages: StateShortageByOcc[]
  onBack: () => void
  onClose: () => void
  t: ReturnType<typeof useTranslations>
  currentState: StateCode
  data: MapData
  savedOccCodes: Set<string>
  onToggleSave: (occCode: string, occTitle: string) => void
  onShare: (occTitle: string) => void
  labourMarket: AuLabourMarket | null
  showInlineControls?: boolean
  /** Route-result handoffs keep only occupation and regional evidence. */
  routeMode?: boolean
}) {
  const locale = useLocale()
  const name = locale === "ko" && occ.occupation_ko ? occ.occupation_ko : occ.occupation_en

  const currentStateShortage = stateShortages.find((s) => s.state === currentState)
  const stateRating = currentStateShortage?.rating ?? 0

  const hasNational = occ.shortage_rating != null && occ.shortage_rating > 0
  const nationalWidth = hasNational ? Math.round((occ.shortage_rating! / 5) * 100) : 0

  // "공부하는 곳"·"비자"는 모두 맵 초기 데이터(data)에서 동기적으로 계산한다 → 카드 열면 즉시.
  // (예전엔 /api/occupations/related 를 카드 열 때 fetch 해서 몇 초 지연이 있었다.)
  const pathway = getPathway(occ.anzsco_code)
  const relatedData = {
    pathway,
    courses:
      pathway === "degree" && occ.related_broad_field
        ? data.coursesByFieldState[occ.related_broad_field]?.[currentState] ?? []
        : [],
    tafe: pathway === "vet" ? TAFE_BY_STATE[currentState] : null,
    vetPortals: pathway === "vet" ? VET_PORTALS : [],
    cricosSearch: cricosSearchUrl(),

  }
  const latestVacancy = labourMarket?.vacancies.at(-1) ?? null
  const quarterAgoVacancy = labourMarket?.vacancies.at(-4) ?? null
  const vacancyChange = latestVacancy?.vacancy_count != null && quarterAgoVacancy?.vacancy_count != null && quarterAgoVacancy.vacancy_count !== 0
    ? ((latestVacancy.vacancy_count - quarterAgoVacancy.vacancy_count) / quarterAgoVacancy.vacancy_count) * 100
    : null
  const vacancyBars = labourMarket?.vacancies.slice(-12) ?? []
  const maxVacancy = Math.max(1, ...vacancyBars.map((item) => item.vacancy_count ?? 0))

  return (
    <>
      {showInlineControls && (
        <div className="flex items-center justify-between px-5 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {null}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.map.close}
            className="-mr-1 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-sans text-lg font-semibold text-slate-900 tracking-tight">
            {name}
          </h2>
          <div className="flex items-center gap-1 shrink-0">
            {!routeMode && <button
              type="button"
              onClick={() => onToggleSave(occ.anzsco_code ?? "", name)}
              aria-label="Save occupation"
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <Bookmark className="h-4 w-4" fill={savedOccCodes.has(occ.anzsco_code ?? "") ? "currentColor" : "none"} />
            </button>}
            <button
              type="button"
              onClick={() => onShare(name)}
              aria-label="Share occupation"
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Badge tone="gray">ANZSCO {occ.anzsco_code}</Badge>
          {occ.on_csol && <Badge tone="green">{t.map.visaEligible}</Badge>}
        </div>

        {!routeMode && occ.anzsco_code && (
          <Link
            href="/career"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            자세히 보기
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}

        <div className="mt-5 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {t.map.detailMedianSalary}
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums text-slate-800">
              {occ.median_salary_aud != null ? `A$${occ.median_salary_aud.toLocaleString()}` : "—"}
            </p>
          </div>

          {stateRating > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                {currentState} {t.map.detailStateShortages}
              </p>
              <div className="mt-2">
                <ShortageLabel rating={stateRating} />
              </div>
            </div>
          )}

          {stateShortages.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">
                {t.map.detailStateShortages} ({locale === "ko" ? "전체주" : "all states"})
              </p>
              <div className="flex flex-wrap gap-x-2 gap-y-1.5">
                {stateShortages.map((s) => (
                  <span key={s.state} className="inline-flex items-center gap-1 text-xs text-slate-700">
                    <span className={cn("font-medium", s.state === currentState && "text-slate-900 underline")}>
                      {s.state}
                    </span>
                    <ShortageLabel rating={s.rating} className="!text-[10px]" />
                  </span>
                ))}
              </div>
            </div>
          )}

          {hasNational && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                {t.map.detailNationalShortage}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", shortageColor(occ.shortage_rating))}
                    style={{ width: `${nationalWidth}%` }}
                  />
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-700">
                  {occ.shortage_rating}/5
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{shortageLabel(occ.shortage_rating, t)}</p>
            </div>
          )}

          {labourMarket && (
            <section className="rounded-lg border border-violet-200 bg-violet-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-violet-700">JSA regional demand</p>
                  <p className="mt-1 text-xs leading-5 text-violet-900">{labourMarket.sources.regional}</p>
                </div>
                {latestVacancy?.vacancy_count != null && <div className="shrink-0 text-right"><p className="text-lg font-bold tabular-nums text-violet-950">{Math.round(latestVacancy.vacancy_count).toLocaleString()}</p><p className="text-[10px] text-violet-700">latest IVI</p></div>}
              </div>
              {vacancyBars.length > 0 && <div className="mt-3"><div className="flex h-10 items-end gap-1">{vacancyBars.map((point) => <div key={point.period} className="min-w-0 flex-1 rounded-t bg-violet-400" title={`${point.period}: ${point.vacancy_count?.toLocaleString() ?? "—"}`} style={{ height: `${Math.max(5, Math.round(((point.vacancy_count ?? 0) / maxVacancy) * 100))}%` }} />)}</div><div className="mt-1 flex justify-between text-[10px] text-violet-700"><span>{new Date(vacancyBars[0].period).toLocaleDateString("en-AU", { month: "short", year: "2-digit" })}</span><span>{vacancyChange != null ? `${vacancyChange >= 0 ? "+" : ""}${vacancyChange.toFixed(0)}% over 90 days` : labourMarket.sources.vacancies}</span><span>{new Date(vacancyBars.at(-1)!.period).toLocaleDateString("en-AU", { month: "short", year: "2-digit" })}</span></div></div>}
              {labourMarket.regional.length > 0 && <div className="mt-4 border-t border-violet-200 pt-3"><p className="text-[11px] font-medium uppercase tracking-wider text-violet-700">Top SA4 areas in {currentState}</p><ol className="mt-2 space-y-2">{labourMarket.regional.slice(0, 5).map((region, index) => <li key={region.sa4_code} className="flex items-center gap-2 text-xs"><span className="w-4 text-violet-500">{index + 1}</span><span className="min-w-0 flex-1 truncate font-medium text-slate-800">{region.sa4_name}</span><span className="shrink-0 font-semibold tabular-nums text-slate-800">{region.employment_total?.toLocaleString() ?? "—"}</span><span className={`w-12 text-right tabular-nums ${region.annual_change_pct != null && region.annual_change_pct > 0 ? "text-emerald-700" : "text-slate-500"}`}>{region.annual_change_pct != null ? `${region.annual_change_pct > 0 ? "+" : ""}${region.annual_change_pct}%` : "—"}</span></li>)}</ol><p className="mt-2 text-[10px] text-violet-700">Estimated employed · annual change · JSA NERO</p></div>}
            </section>
          )}

          {!routeMode && (relatedData.pathway === "degree" ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">
                {t.map.detailDegreesInState.replace("{state}", currentState)}
              </p>
              {relatedData.courses.length > 0 ? (
              <div className="space-y-2">
                {relatedData.courses.map((c) => {
                  const href = c.institution_id ? "/programs" : null
                  const programUrl = courseProgramUrl(c.website_url, c.title)
                  const info = (
                    <>
                      <p className="text-sm font-medium text-slate-800 leading-snug">{c.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {c.institution_name && <>{c.institution_name} · </>}
                        {c.aqf_level != null && <>{aqfLabel(c.aqf_level)} · </>}
                        {c.duration_years != null && (
                          <>{c.duration_years} yr{c.duration_years > 1 ? "s" : ""} · </>
                        )}
                        {c.tuition_fee_aud != null && <>A${c.tuition_fee_aud.toLocaleString()}/yr</>}
                      </p>
                    </>
                  )
                  // 코스 카드는 Programs 탐색과 외부(CRICOS/홈페이지) 링크를 형제로 둔다.
                  // (앵커 중첩 = 잘못된 HTML 이라 hydration 에러가 난다.)
                  return (
                    <div
                      key={c.id}
                      className="rounded-md border border-slate-100 bg-white p-2.5"
                    >
                      {href ? (
                        <Link href={href} className="block transition-opacity hover:opacity-70">
                          {info}
                        </Link>
                      ) : (
                        info
                      )}
                      {(programUrl || c.cricos_url || c.website_url) && (
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {programUrl && (
                            <a
                              href={programUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 text-[11px] text-blue-600 hover:text-blue-800 underline underline-offset-2"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {t.map.detailCoursePage}
                            </a>
                          )}
                          {c.cricos_url && (
                            <a
                              href={c.cricos_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 text-[11px] text-blue-600 hover:text-blue-800 underline underline-offset-2"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {t.map.detailCricosLink}
                            </a>
                          )}
                          {c.website_url && (
                            <a
                              href={c.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 text-[11px] text-blue-600 hover:text-blue-800 underline underline-offset-2"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {t.map.detailCollegeWebsite}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              ) : (
                <div className="text-xs text-slate-500 leading-relaxed">
                  <p>{t.map.detailNoStateDegrees.replace("{state}", currentState)}</p>
                  {relatedData.cricosSearch && (
                    <a
                      href={relatedData.cricosSearch}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-0.5 text-[11px] text-blue-600 hover:text-blue-800 underline underline-offset-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {t.map.detailCricosLink}
                    </a>
                  )}
                </div>
              )}
              {relatedData.courses.length > 0 && relatedData.cricosSearch && (
                <a
                  href={relatedData.cricosSearch}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-0.5 text-[11px] text-blue-600 hover:text-blue-800 underline underline-offset-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  {t.map.detailCricosMore}
                </a>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">
                {t.map.detailVetInState.replace("{state}", currentState)}
              </p>
              {relatedData.tafe && (
                <a
                  href={relatedData.tafe.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md border border-slate-100 bg-white p-2.5 transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                  <span className="text-sm font-medium text-slate-800">{relatedData.tafe.name}</span>
                  <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-400">
                    {t.map.detailOfficialTafe}
                  </span>
                </a>
              )}
              {relatedData.vetPortals.length > 0 && (
                <div className="mt-2">
                  <p className="mb-1 text-[11px] text-slate-400">{t.map.detailVetPortals}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                    {relatedData.vetPortals.map((p) => (
                      <a
                        key={p.url}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-[11px] text-blue-600 hover:text-blue-800 underline underline-offset-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {p.name}
                      </a>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400">{t.map.detailVetHint}</p>
                </div>
              )}
            </div>
          ))}



          {occ.last_verified && (
            <p className="text-xs text-slate-400">
              {t.map.detailUpdated}: {occ.last_verified}
            </p>
          )}

          <JobListings what={name} where={currentState} country="AU" />

          {!routeMode && <AffiliateCtas />}
        </div>
      </div>

      <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
        {t.map.source}
      </p>
    </>
  )
}

// 미국 직업 상세 카드 — AU OccupationDetail 와 같은 패널 크롬을 쓰되, 우리가 이미 로드한
// 데이터(임금·고용·부족점수)와 외부 링크(O*NET/BLS), 주별 ROI 상위 대학으로 구성한다.
function USOccupationDetail({
  occ,
  stateName,
  stateCode,
  colleges,
  onBack,
  onClose,
  t,
  savedOccCodes,
  onToggleSave,
  onShare,
}: {
  occ: USOccupation
  stateName: string
  stateCode: string
  colleges: USCollege[]
  onBack: () => void
  onClose: () => void
  t: ReturnType<typeof useTranslations>
  savedOccCodes: Set<string>
  onToggleSave: (occCode: string, occTitle: string) => void
  onShare: (occTitle: string) => void
}) {
  // SOC 코드(예: 15-1252) → O*NET 8자리(.00), BLS OEWS(하이픈 제거) 공식 페이지로 연결.
  const onetUrl = `https://www.onetonline.org/link/summary/${occ.occ_code}.00`
  const blsUrl = `https://www.bls.gov/oes/current/oes${occ.occ_code.replace("-", "")}.htm`

  const topSchools = colleges
    .filter((c) => c.college_state === stateCode && c.roi_score != null)
    .sort((a, b) => (b.roi_score ?? 0) - (a.roi_score ?? 0))
    .slice(0, 6)

  const shortageWidth = Math.max(0, Math.min(100, Math.round(occ.shortage_score)))

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {null}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.map.close}
          className="-mr-1 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-sans text-lg font-semibold text-slate-900 tracking-tight">
            {occ.occ_title}
          </h2>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onToggleSave(occ.occ_code, occ.occ_title)}
              aria-label="Save occupation"
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <Bookmark className="h-4 w-4" fill={savedOccCodes.has(occ.occ_code) ? "currentColor" : "none"} />
            </button>
            <button
              type="button"
              onClick={() => onShare(occ.occ_title)}
              aria-label="Share occupation"
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Badge tone="gray">{t.map.detailSoc} {occ.occ_code}</Badge>
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {t.map.detailMedianSalary}
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums text-slate-800">
              ${occ.median_wage.toLocaleString()}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">
              {t.map.detailEmployment}
            </p>
            <dl className="space-y-1.5 text-sm">
              {occ.tot_emp > 0 && (
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">{t.map.detailEmployed}</dt>
                  <dd className="font-medium tabular-nums text-slate-700">{occ.tot_emp.toLocaleString()}</dd>
                </div>
              )}
              {occ.pct_change !== 0 && (
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">{t.map.detailGrowth}</dt>
                  <dd className={cn("font-medium tabular-nums", occ.pct_change > 0 ? "text-emerald-600" : "text-slate-700")}>
                    {occ.pct_change > 0 ? "+" : ""}{occ.pct_change}%
                  </dd>
                </div>
              )}
              {occ.annual_openings > 0 && (
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">{t.map.detailAnnualOpenings}</dt>
                  <dd className="font-medium tabular-nums text-slate-700">{occ.annual_openings.toLocaleString()}</dd>
                </div>
              )}
            </dl>
            {occ.shortage_score > 0 && (
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{t.map.detailShortageScore}</span>
                  <span className="tabular-nums">{Math.round(occ.shortage_score)}/100</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-rose-500 transition-all" style={{ width: `${shortageWidth}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">
              {t.map.detailLearnMore}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={onetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[11px] text-blue-600 hover:text-blue-800 underline underline-offset-2"
              >
                <ExternalLink className="h-3 w-3" />
                {t.map.detailOnet}
              </a>
              <a
                href={blsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[11px] text-blue-600 hover:text-blue-800 underline underline-offset-2"
              >
                <ExternalLink className="h-3 w-3" />
                {t.map.detailBls}
              </a>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100">
              <Link
                href="/career"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                자세히 보기
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">
              {t.map.detailTopSchools.replace("{state}", stateName)}
            </p>
            {topSchools.length > 0 ? (
              <div className="space-y-2">
                {topSchools.map((c) => (
                  <a
                    key={c.college_id}
                    href={collegeSearchUrl(c.college_name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-md border border-slate-100 bg-white p-2.5 transition-opacity hover:opacity-70"
                  >
                    <p className="flex items-center gap-1 text-sm font-medium text-slate-800 leading-snug">
                      {c.college_name}
                      <ExternalLink className="h-3 w-3 shrink-0 text-slate-400" />
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {c.city_name && <>{c.city_name} · </>}
                      {c.roi_score != null && <>ROI {c.roi_score.toFixed(1)}</>}
                      {c.net_salary != null && <> · ${Math.round(c.net_salary).toLocaleString()}</>}
                    </p>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">{t.map.detailNoSchools}</p>
            )}
          </div>

          <JobListings what={occ.occ_title} where={stateCode} country="US" />

          <AffiliateCtas />
        </div>
      </div>

      <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
        {t.map.source}
      </p>
    </>
  )
}

function NeroOccupationDetail({
  a4,
  stateCode,
  neroData,
  sa4Regions,
  auOccupations,
  stateSalaryMult,
  coursesByFieldState,
  onBack,
  onClose,
  t,
  savedOccCodes,
  onToggleSave,
  onShare,
  showInlineControls = true,
}: {
  a4: string
  stateCode: StateCode
  neroData: Record<string, NeroOccupation[]>
  sa4Regions: SA4Region[]
  auOccupations: Record<string, OccRow>
  stateSalaryMult: StateSalaryMult
  coursesByFieldState: Record<string, Record<string, CourseLite[]>>
  onBack: () => void
  onClose: () => void
  t: ReturnType<typeof useTranslations>
  savedOccCodes: Set<string>
  onToggleSave: (occCode: string, occTitle: string) => void
  onShare: (occTitle: string) => void
  showInlineControls?: boolean
}) {
  const occ = useMemo(() => {
    for (const region of sa4Regions) {
      const rows = neroData[region.code] ?? []
      const found = rows.find((r) => r.a4 === a4)
      if (found) return found
    }
    for (const code of Object.keys(neroData)) {
      const rows = neroData[code] ?? []
      const found = rows.find((r) => r.a4 === a4)
      if (found) return found
    }
    return null
  }, [a4, neroData, sa4Regions])

  const name = occ?.name ?? a4

  const enrich = useMemo(() => {
    const mapping = EMPLOYMENT_OCCUPATIONS.find((o) => o.a4 === a4)
    if (!mapping) return { broad_field: null, medianSalary: null, estimatedSalary: null }

    let occRow: OccRow | null = null
    let matchedCode: string | null = null

    if (mapping.representative_osca_code) {
      occRow = auOccupations[mapping.representative_osca_code] ?? null
      if (occRow) matchedCode = mapping.representative_osca_code
    }

    if (!occRow) {
      const fallback = Object.values(auOccupations).find(
        (o) => o.anzsco_v13?.startsWith(a4) && o.median_salary_aud != null,
      )
      if (fallback?.anzsco_code) {
        occRow = fallback
        matchedCode = fallback.anzsco_code
      }
    }

    let medianSalary = occRow?.median_salary_aud ?? null
    let estimatedSalary: number | null = null

    if (medianSalary == null) {
      let entry = EMPLOYMENT_SALARIES.find((e) => e.a4 === a4)
      if (!entry && name) {
        entry = EMPLOYMENT_SALARIES.find((e) => {
          const m = EMPLOYMENT_OCCUPATIONS.find((o) => o.a4 === e.a4)
          return m?.name === name
        })
      }
      if (entry?.median_salary_aud) {
        medianSalary = entry.median_salary_aud
        if (stateCode) {
          const d1 = a4.charAt(0)
          const mult = stateSalaryMult[stateCode]?.[d1] ?? 1
          estimatedSalary = Math.round(medianSalary * mult)
        }
      }
    } else if (medianSalary != null && stateCode && matchedCode) {
      const d1 = matchedCode.charAt(0)
      const mult = stateSalaryMult[stateCode]?.[d1] ?? 1
      estimatedSalary = Math.round(medianSalary * mult)
    }
    return { broad_field: mapping.broad_field, medianSalary, estimatedSalary }
  }, [a4, name, stateCode, auOccupations, stateSalaryMult])

  const courses = useMemo(() => {
    if (!enrich.broad_field || !stateCode) return []
    return (coursesByFieldState[enrich.broad_field]?.[stateCode] ?? []).slice(0, 4)
  }, [enrich.broad_field, stateCode, coursesByFieldState])

  const seekUrl = useMemo(() => {
    const byA4 = JOB_SEARCH_LINKS.find((l) => l.a4 === a4)
    if (byA4) return byA4.seek_url
    const byName = JOB_SEARCH_LINKS.find((l) => l.name === name)
    if (byName) return byName.seek_url
    return null
  }, [a4, name])

  function getStateSeekUrl(baseUrl: string): string {
    const path = STATE_SEEK_PATH[stateCode]
    if (!path) return baseUrl
    return `${baseUrl}/in-${path}`
  }

  function getStateIndeedUrl(name: string): string {
    const q = name.toLowerCase().replace(/[^a-z0-9]+/g, "+").replace(/(^\+|\+$)/g, "")
    const base = `https://au.indeed.com/jobs?q=${q}`
    const l = STATE_NAMES[stateCode]
    if (!l) return base
    return `${base}&l=${encodeURIComponent(l)}`
  }

  return (
    <>
      {showInlineControls && (
        <div className="flex items-center justify-between px-5 pt-4">
          <button type="button" onClick={onBack}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors">
            <ChevronLeft className="h-4 w-4" />
            {null}
          </button>
          <button type="button" onClick={onClose}
            aria-label={t.map.close}
            className="-mr-1 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-sans text-lg font-semibold text-slate-900 tracking-tight">{name}</h2>
          <div className="flex items-center gap-1 shrink-0">
            <button type="button"
              onClick={() => onToggleSave(a4, name)}
              aria-label="Save occupation"
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <Bookmark className="h-4 w-4"
                fill={savedOccCodes.has(a4) ? "currentColor" : "none"} />
            </button>
            <button type="button"
              onClick={() => onShare(name)}
              aria-label="Share occupation"
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {/* Salary */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {t.employment.salary}
            </p>
            <div className="mt-2 space-y-1">
              {enrich.medianSalary != null && (
                <p className="flex items-center gap-1.5 text-sm text-slate-700">
                  <DollarSign className="h-3.5 w-3.5 text-green-600" />
                  {t.employment.nationalMedian.replace('{amount}', enrich.medianSalary.toLocaleString())}
                </p>
              )}
              {enrich.estimatedSalary != null && (
                <p className="flex items-center gap-1.5 text-sm text-slate-700">
                  <DollarSign className="h-3.5 w-3.5 text-green-600" />
                  {t.employment.stateEstimate.replace('{stateName}', STATE_NAMES[stateCode] ?? stateCode).replace('{amount}', enrich.estimatedSalary.toLocaleString())}
                </p>
              )}
              {enrich.medianSalary == null && (
                <p className="text-sm text-slate-400">{t.employment.salaryNotAvailable}</p>
              )}
            </div>
          </div>

          {/* Related study */}
          {enrich.broad_field && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                {t.employment.relatedStudy}
              </p>
              <p className="mt-2 text-sm text-slate-700">
                {enrich.broad_field}
              </p>
              {courses.length > 0 && (
                <div className="mt-3 space-y-2">
                  {courses.map((course) => (
                    <a
                      key={course.id}
                      href={course.cricos_url ?? course.website_url ?? "#"}
                      target={course.cricos_url || course.website_url ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 rounded-md border border-slate-100 bg-white px-3 py-2.5 text-sm transition-colors hover:bg-blue-50"
                    >
                      <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-700">{course.title}</p>
                        <p className="text-xs text-slate-400">
                          {course.institution_name}
                          {course.duration_years != null && ` · ${course.duration_years} yr`}
                          {course.tuition_fee_aud != null && ` · A$${course.tuition_fee_aud.toLocaleString()}`}
                        </p>
                      </div>
                      {(course.cricos_url || course.website_url) && <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Related job links */}
          {seekUrl && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                {t.employment.relatedJobs}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={getStateSeekUrl(seekUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-blue-50 border border-slate-200"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {t.employment.seek}
                </a>
                <a
                  href={getStateIndeedUrl(name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-blue-50 border border-slate-200"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {t.employment.indeed}
                </a>
              </div>
            </div>
          )}

          {/* Job openings */}
          <JobListings what={name} where={STATE_NAMES[stateCode] ?? stateCode} country="AU" />

          <AffiliateCtas />
        </div>
      </div>

      <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
        {t.map.source}
      </p>
    </>
  )
}

type IESchool = {
  id: number; slug: string; name_en: string; name_ko: string | null;
  city: string; lat: number | null; lng: number | null;
  price_range_week: string | null; accreditation: string[] | null;
  description_ko: string | null;
}

function IEPanel({
  schools,
  countyName,
  onClose,
}: {
  schools: IESchool[] | null
  countyName?: string
  onClose: () => void
}) {
  const t = useTranslations()
  const [ietab, setIetab] = useState<"schools" | "shortage">("schools")
  const [selectedSchool, setSelectedSchool] = useState<IESchool | null>(null)

  if (selectedSchool) {
    return (
      <>
        <div className="flex items-center justify-between px-5 pt-4">
          <button
            type="button"
            onClick={() => setSelectedSchool(null)}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {t.map.ieBack}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.map.close}
            className="-mr-1 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <h2 className="font-sans text-lg font-semibold text-slate-900 tracking-tight">
            {selectedSchool.name_en}
          </h2>
          {selectedSchool.name_ko && (
            <p className="text-sm text-muted-foreground mt-0.5">{selectedSchool.name_ko}</p>
          )}
          <p className="text-xs text-slate-400 mt-1">{selectedSchool.city}</p>

          {selectedSchool.price_range_week && (
            <p className="mt-3 text-sm font-medium text-slate-700">
              {selectedSchool.price_range_week}
              <span className="text-xs text-slate-400 font-normal ml-1">{t.map.iePerWeek}</span>
            </p>
          )}

          {selectedSchool.accreditation && selectedSchool.accreditation.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {selectedSchool.accreditation.map((a: string) => (
                <span key={a} className="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-500">
                  {a}
                </span>
              ))}
            </div>
          )}

          {selectedSchool.description_ko && (
            <div className="mt-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{t.map.ieDescription}</p>
              <p className="text-sm text-slate-700 leading-relaxed">{selectedSchool.description_ko}</p>
            </div>
          )}
      </div>
    </>
  )
}

  return (
    <>
      <div className="flex items-start justify-between gap-2 px-5 pt-4">
        <div>
          <h2 className="font-sans text-lg font-semibold text-slate-900 tracking-tight">
            🇮🇪 {countyName ? `${countyName}` : t.map.ieIreland}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{countyName ? `${countyName} · ` : ""}{t.map.ieIreland}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.map.close}
          className="-mr-1 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 pt-3">
        <div className="inline-flex rounded-lg bg-slate-100 p-1 text-sm">
          <TabButton active={ietab === "schools"} onClick={() => setIetab("schools")}>
            {t.map.ieTabSchools}
          </TabButton>
          <TabButton active={ietab === "shortage"} onClick={() => setIetab("shortage")}>
            {t.map.ieTabShortage}
          </TabButton>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {ietab === "schools" && (
          schools === null ? (
            <div className="flex flex-col items-center gap-2 py-10">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-violet-500" />
              <p className="text-sm text-slate-400">{t.map.ieLoading}</p>
            </div>
          ) : schools.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">{t.map.ieNoSchools}</p>
          ) : (
            <div className="space-y-2">
              {schools.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSchool(s)}
                  className="w-full text-left rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{s.name_en}</p>
                      {s.name_ko && <p className="text-xs text-muted-foreground">{s.name_ko}</p>}
                      <p className="mt-0.5 text-xs text-slate-400">{s.city}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 mt-1" />
                  </div>
                  {s.price_range_week && (
                    <p className="mt-1 text-xs font-medium text-slate-600">{s.price_range_week}{t.map.iePerWeek}</p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-1">
                    {s.accreditation?.slice(0, 2).map((a) => (
                      <span key={a} className="inline-flex items-center rounded-full border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-500">{a}</span>
                    ))}
                  </div>
                  {s.description_ko && (
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{s.description_ko}</p>
                  )}
                </button>
              ))}
            </div>
          )
        )}
        {ietab === "shortage" && <IEShortageList />}
      </div>

      {ietab === "schools" && (
        <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
          <Link href="/programs" className="text-blue-600 hover:underline">
            {t.map.ieViewAll}
          </Link>
        </p>
      )}
    </>
  )
}

function IEShortageList() {
  const t = useTranslations()
  const locale = useLocale()
  const occupations = useMemo(() => getShortageOccupations(), [])
  const [limit, setLimit] = useState(10)
  const visible = occupations.slice(0, limit)
  if (occupations.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">{t.map.ieNoShortageData || t.map.noShortageData}</p>
  }
  return (
    <ol>
      {visible.map((r, i) => {
        const field = r.relatedBroadField ? getIscBroadField(r.relatedBroadField) : null
        return (
          <li key={r.socCode}>
            <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
              <span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-slate-800">
                  {r.category}
                </span>
                <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                  <span className="font-mono">SOC {r.socCode}</span>
                  {field && <span>· {locale === "ko" ? field.nameKo : field.nameEn}</span>}
                </span>
                {r.employments.length > 0 && (
                  <p className="mt-1 text-xs text-slate-500 line-clamp-1">{r.employments.slice(0, 3).join(", ")}</p>
                )}
              </span>
              <Badge tone={r.socLevel === "SOC-4" ? "blue" : "gray"}>{r.socLevel}</Badge>
            </div>
          </li>
        )
      })}
      {limit < occupations.length && (
        <li>
          <button
            type="button"
            onClick={() => setLimit((p) => Math.min(p + 10, occupations.length))}
            className="flex w-full items-center justify-center gap-1 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            {t.map.ieShowMore} ({occupations.length - limit})
          </button>
        </li>
      )}
    </ol>
  )
}

function ShortageLabel({ rating, className }: { rating: number; className?: string }) {
  const locale = useLocale()
  const isKo = locale === "ko"
  if (rating >= 3) {
    return (
      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200", className)}>
        {isKo ? "상" : "High"}
      </span>
    )
  }
  if (rating >= 2) {
    return (
      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200", className)}>
        {isKo ? "중" : "Mid"}
      </span>
    )
  }
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200", className)}>
      {isKo ? "하" : "Low"}
    </span>
  )
}

function Badge({ tone, children }: { tone: "green" | "gray" | "blue" | "amber"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        tone === "green"
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : tone === "blue"
            ? "bg-blue-50 text-blue-700 border border-blue-200"
            : tone === "amber"
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-slate-100 text-slate-500",
      )}
    >
      {children}
    </span>
  )
}

// ── UK components ──────────────────────────────────────────────────────────────

function UKHighPayList({ rows, onSelectOcc }: { rows: UKRegionOccupation[]; onSelectOcc?: (code: string) => void }) {
  const t = useTranslations()
  const locale = useLocale()
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">{t.map.noShortageData}</p>
  }
  return (
    <ol>
      {rows.map((r, i) => (
        <li key={r.soc_code}>
          <button
            type="button"
            onClick={() => onSelectOcc?.(r.soc_code)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
          >
            <span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{i + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-800">
                {locale === "ko" ? (r.occupation_ko ?? r.occupation_en) : r.occupation_en}
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-sm font-semibold tabular-nums text-slate-700">
                {r.median_salary_gbp != null ? `£${r.median_salary_gbp.toLocaleString()}` : "—"}
              </span>
              {r.shortage_rating != null && (
                <span className="text-[10px] text-slate-400">Shortage: {r.shortage_rating}/5</span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}

function DEShortageList({ rows, onSelectOcc }: { rows: DERegionOccupation[]; onSelectOcc?: (code: string) => void }) {
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">...</p>
  }
  return (
    <ol>
      {rows.map((r, i) => (
        <li key={r.kldb_code}>
          <button
            type="button"
            onClick={() => onSelectOcc?.(r.kldb_code)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
          >
            <span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{i + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-800">
                {r.occupation_en}
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-sm font-semibold tabular-nums text-slate-700">
                {r.shortage_rating != null ? `${r.shortage_rating.toFixed(1)}/4` : "—"}
              </span>
              {r.median_salary_eur != null && (
                <span className="text-[10px] text-slate-400">€{r.median_salary_eur.toLocaleString()}</span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}

function DEHighPayList({ rows, salaryField, ratingField, onSelectOcc }: {
  rows: DERegionOccupation[]; salaryField: string; ratingField: string; onSelectOcc?: (code: string) => void
}) {
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">...</p>
  }
  return (
    <ol>
      {rows.map((r, i) => {
        const salary = (r as unknown as Record<string, unknown>)[salaryField] as number | null
        const rating = (r as unknown as Record<string, unknown>)[ratingField] as number | null
        return (
        <li key={r.kldb_code}>
          <button
            type="button"
            onClick={() => onSelectOcc?.(r.kldb_code)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
          >
            <span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{i + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-800">
                {r.occupation_en}
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-sm font-semibold tabular-nums text-slate-700">
                {salary != null ? `€${salary.toLocaleString()}` : "—"}
              </span>
              {rating != null && (
                <span className="text-[10px] text-slate-400">Shortage: {rating.toFixed(1)}/4</span>
              )}
            </span>
          </button>
        </li>
        )
      })}
    </ol>
  )
}

function NLShortageList({ rows, onSelectOcc }: { rows: NLRegionOccupation[]; onSelectOcc?: (code: string) => void }) {
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">...</p>
  }
  return (
    <ol>
      {rows.map((r, i) => (
        <li key={r.sbc_code}>
          <button
            type="button"
            onClick={() => onSelectOcc?.(r.sbc_code)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
          >
            <span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{i + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-800">
                {r.occupation_en}
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-sm font-semibold tabular-nums text-slate-700">
                {r.shortage_rating != null ? `${r.shortage_rating.toFixed(1)}/5` : "—"}
              </span>
              {r.median_salary_eur != null && (
                <span className="text-[10px] text-slate-400">€{r.median_salary_eur.toLocaleString()}</span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}

function NLHighPayList({ rows, onSelectOcc }: { rows: NLRegionOccupation[]; onSelectOcc?: (code: string) => void }) {
  const sorted = [...rows]
    .filter((r) => r.median_salary_eur != null)
    .sort((a, b) => (b.median_salary_eur ?? 0) - (a.median_salary_eur ?? 0))
  if (sorted.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">...</p>
  }
  return (
    <ol>
      {sorted.map((r, i) => (
        <li key={r.sbc_code}>
          <button
            type="button"
            onClick={() => onSelectOcc?.(r.sbc_code)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
          >
            <span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{i + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-800">
                {r.occupation_en}
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-sm font-semibold tabular-nums text-slate-700">
                {r.median_salary_eur != null ? `€${r.median_salary_eur.toLocaleString()}` : "—"}
              </span>
              {r.shortage_rating != null && (
                <span className="text-[10px] text-slate-400">Shortage: {r.shortage_rating.toFixed(1)}/5</span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}

function SGInfoPanel({
  area,
  demandCount,
  pathways,
}: {
  area: import("@/data/sg-map-data").SingaporeMapArea | null
  demandCount: number
  pathways: import("@/data/sg-map-data").SingaporeWorkPassPathway[]
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 px-3 py-2.5">
          <p className="text-[11px] text-slate-500">URA rental market proxy</p>
          <p className="text-lg font-bold text-slate-900">{area ? `${area.uraSegment} ${area.rentalIndex.toFixed(1)}` : "-"}</p>
          <p className="mt-1 text-[10px] text-slate-400">1Q 2026 rental index, not monthly rent</p>
        </div>
        <div className="rounded-lg bg-amber-50 px-3 py-2.5">
          <p className="text-[11px] text-amber-700">Official demand cards</p>
          <p className="text-lg font-bold text-amber-900">{demandCount}</p>
          <p className="mt-1 text-[10px] text-amber-700">MOM Job Vacancies 2025</p>
        </div>
      </div>
      {area && <div className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700"><p className="font-medium">{area.nameEn} · {area.nameKo}</p><p className="mt-1 text-xs leading-relaxed text-slate-500">{area.focus}. This uses the URA {area.uraSegment} market segment as a transparent location proxy. Singapore does not publish occupation shortages by these areas, so job-demand cards remain national.</p></div>}
      <section className="rounded-lg border border-slate-200 p-3">
        <p className="text-sm font-medium text-slate-800">Foreign work-pass context</p>
        <div className="mt-2 space-y-2">
          {pathways.map((pathway) => <a key={pathway.code} href={pathway.sourceUrl} target="_blank" rel="noopener noreferrer" className="block rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600 hover:bg-slate-100"><span className="font-medium text-slate-800">{pathway.name}</span> · {pathway.note}</a>)}
        </div>
      </section>
    </div>
  )
}

function SGShortageList({ rows, onSelect }: { rows: SingaporeDemandOccupation[]; onSelect: (sourceCode: string) => void }) {
  const locale = useLocale()
  const isKo = locale === "ko"
  return (
    <div className="space-y-3">
      <p className="px-3 text-[11px] leading-relaxed text-slate-500">{isKo ? "MOM 2025 전국 상위 공석 직업입니다. 점수는 PMET 또는 Non-PMET 상위 10개 목록 안에서의 정규화된 순위이며, 지역별 공석률이 아닙니다." : "National MOM 2025 top-vacancy occupations. The score is each occupation's normalized rank within the published PMET or non-PMET top-10 list, not a local-area vacancy rate."}</p>
      <ol>
        {rows.map((row, index) => <li key={row.sourceCode}><button type="button" onClick={() => onSelect(row.sourceCode)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-amber-50"><span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{index + 1}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-800">{isKo ? row.nameKo : row.nameEn}</span><span className="block truncate text-[10px] text-slate-400">{isKo ? row.nameEn : row.nameKo} · {row.category}</span></span><span className="shrink-0 text-right"><span className="block text-sm font-semibold tabular-nums text-amber-700">S${row.offeredWageLowSgd.toLocaleString()}-{row.offeredWageHighSgd.toLocaleString()}</span><span className="text-[10px] text-slate-400">MOM offer range/mo</span></span></button></li>)}
      </ol>
    </div>
  )
}

function SGHighPayList({ rows, onSelect }: { rows: SingaporeWageOccupation[]; onSelect: (ssocCode: string) => void }) {
  return (
    <div className="space-y-3">
      <p className="px-3 text-[11px] leading-relaxed text-slate-500">MOM median monthly gross wages for full-time resident employees, June 2025. This is not an expatriate salary offer or a work-pass approval threshold.</p>
      <ol>
        {rows.slice(0, 20).map((row, index) => <li key={row.ssocCode}><button type="button" onClick={() => onSelect(row.ssocCode)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"><span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{index + 1}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-800">{row.nameEn}</span><span className="block text-[10px] text-slate-400">SSOC 2024 {row.ssocCode}</span></span><span className="shrink-0 text-right"><span className="block text-sm font-semibold tabular-nums text-slate-700">S${row.medianGrossWageSgd.toLocaleString()}/mo</span><span className="text-[10px] text-slate-400">median gross wage</span></span></button></li>)}
      </ol>
    </div>
  )
}

function SGDemandOccupationDetail({
  occupation,
  areaName,
  pathways,
  onBack,
  onClose,
}: {
  occupation: SingaporeDemandOccupation
  areaName: string
  pathways: import("@/data/sg-map-data").SingaporeWorkPassPathway[]
  onBack: () => void
  onClose: () => void
}) {
  const locale = useLocale()
  const isKo = locale === "ko"
  const links = getSingaporeCareerLinks(occupation)
  return (
    <>
      <div className="flex items-center gap-2 px-5 pt-4"><button type="button" onClick={onBack} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Back"><ChevronLeft className="h-4 w-4" /></button><button type="button" onClick={onClose} className="ml-auto rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close"><X className="h-4 w-4" /></button></div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
        <p className="text-[11px] font-medium text-amber-700">{isKo ? "MOM 전국 수요 카드" : "MOM national demand card"} · {occupation.category} rank #{occupation.rank}</p>
        <h3 className="mt-1 text-lg font-semibold text-slate-900">{isKo ? occupation.nameKo : occupation.nameEn}</h3>
        <p className="mt-1 text-xs text-slate-500">{isKo ? occupation.nameEn : occupation.nameKo} · {areaName} {isKo ? "생활비 비교" : "living comparison"}</p>
        <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-lg bg-amber-50 px-3 py-2.5"><p className="text-[11px] text-amber-700">Employer offer range</p><p className="text-base font-bold text-amber-900">S${occupation.offeredWageLowSgd.toLocaleString()}-{occupation.offeredWageHighSgd.toLocaleString()}</p><p className="text-[10px] text-amber-700">monthly, MOM report</p></div><div className="rounded-lg bg-slate-50 px-3 py-2.5"><p className="text-[11px] text-slate-500">Typical experience</p><p className="mt-1 text-sm font-bold text-slate-900">{occupation.commonExperience}</p><p className="text-[10px] text-slate-400">{occupation.commonQualification}</p></div></div>
        <section className="mt-5 rounded-lg border border-slate-200 p-3"><p className="text-sm font-medium text-slate-800">{isKo ? "MOM이 제시한 핵심 스킬" : "MOM-identified core skills"}</p><div className="mt-2 flex flex-wrap gap-1.5">{occupation.skills.map((skill) => <span key={skill} className="rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-800">{skill}</span>)}</div><a href={links.skillsFramework} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"><ExternalLink className="h-3 w-3" />{isKo ? "공식 Skills Framework 열기" : "Open official Skills Framework"}</a></section>
        <SGCareerActions links={links} locale={locale} />
        <section className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3"><p className="text-sm font-medium text-rose-900">Work-pass caution</p><p className="mt-1 text-xs leading-relaxed text-rose-800">A national demand signal does not mean a foreign applicant can obtain a pass. An employer must apply, and EP/S Pass criteria and COMPASS are assessed for the actual role and applicant.</p><div className="mt-2 flex flex-wrap gap-2">{pathways.filter((pathway) => pathway.code === "ep" || pathway.code === "spass" || pathway.code === "compass-sol").map((pathway) => <a key={pathway.code} href={pathway.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-rose-800 hover:underline">{pathway.name}</a>)}</div></section>
        <AffiliateCtas />
      </div>
      <p className="border-t border-slate-100 px-5 py-3 text-[10px] leading-relaxed text-slate-400">Source: MOM Job Vacancies 2025. Salary is the published employer offer range for vacancies in this occupation, not an individual offer or guaranteed work-pass outcome.</p>
    </>
  )
}

function SGCareerActions({ links, locale }: { links: ReturnType<typeof getSingaporeCareerLinks>; locale: string }) {
  const isKo = locale === "ko"
  return (
    <section className="mt-4 grid gap-3 sm:grid-cols-2">
      <a href={links.learningPathways} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-blue-200 bg-blue-50 p-3 transition-colors hover:bg-blue-100"><p className="text-sm font-medium text-blue-950">{isKo ? "관련 코스·학위 탐색" : "Courses and study pathways"}</p><p className="mt-1 text-xs leading-relaxed text-blue-800">{isKo ? "SkillsFuture의 공식 학습·훈련 경로를 확인합니다." : "Browse SkillsFuture's official learning and training pathways."}</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-800"><GraduationCap className="h-3 w-3" />{isKo ? "코스 탐색" : "Explore courses"}</span></a>
      <a href={links.jobSearch} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 transition-colors hover:bg-emerald-100"><p className="text-sm font-medium text-emerald-950">{isKo ? "관련 채용 공고" : "Related job listings"}</p><p className="mt-1 text-xs leading-relaxed text-emerald-800">{isKo ? "MyCareersFuture에서 현재 관련 공고를 검색합니다." : "Search current matching listings on MyCareersFuture."}</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-800"><ExternalLink className="h-3 w-3" />{isKo ? "채용 공고 보기" : "View job listings"}</span></a>
    </section>
  )
}

function SGHighPayOccupationDetail({ occupation, pathways, onBack, onClose }: { occupation: SingaporeWageOccupation; pathways: import("@/data/sg-map-data").SingaporeWorkPassPathway[]; onBack: () => void; onClose: () => void }) {
  const locale = useLocale()
  const isKo = locale === "ko"
  const links = getSingaporeCareerLinks(occupation)
  const demandProfile = SG_DEMAND_OCCUPATIONS.find((row) => row.ssocCode === occupation.ssocCode) ?? null
  const annualGrossWage = occupation.medianGrossWageSgd * 12
  return (
    <>
      <div className="flex items-center gap-2 px-5 pt-4"><button type="button" onClick={onBack} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Back"><ChevronLeft className="h-4 w-4" /></button><button type="button" onClick={onClose} className="ml-auto rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close"><X className="h-4 w-4" /></button></div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3"><p className="text-[11px] font-medium text-rose-700">{isKo ? "MOM 고소득 직업 카드" : "MOM high-pay occupation card"}</p><h3 className="mt-1 text-lg font-semibold text-slate-900">{occupation.nameEn}</h3><p className="mt-1 text-xs text-slate-500">SSOC 2024 {occupation.ssocCode} · {isKo ? "정규직 현지 거주자" : "full-time resident employees"}</p><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-lg bg-slate-50 px-3 py-2.5"><p className="text-[11px] text-slate-500">Median gross wage</p><p className="text-lg font-bold text-slate-900">S${occupation.medianGrossWageSgd.toLocaleString()}/mo</p><p className="text-[10px] text-slate-400">S${annualGrossWage.toLocaleString()}/yr · 12 months</p></div><div className="rounded-lg bg-slate-50 px-3 py-2.5"><p className="text-[11px] text-slate-500">Median basic wage</p><p className="text-lg font-bold text-slate-900">S${occupation.medianBasicWageSgd.toLocaleString()}/mo</p><p className="text-[10px] text-slate-400">{isKo ? "공개 직업군 내 임금 백분위" : "wage percentile in published occupations"}: {occupation.salaryScore}/100</p></div></div>{demandProfile ? <section className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3"><p className="text-sm font-medium text-amber-950">{isKo ? "MOM 수요 데이터도 확인됨" : "Also present in MOM demand data"}</p><p className="mt-1 text-xs text-amber-800">{isKo ? "공고 임금 범위" : "Published offer range"}: S${demandProfile.offeredWageLowSgd.toLocaleString()}-{demandProfile.offeredWageHighSgd.toLocaleString()}/mo · {demandProfile.commonQualification} · {demandProfile.commonExperience}</p><div className="mt-2 flex flex-wrap gap-1.5">{demandProfile.skills.map((skill) => <span key={skill} className="rounded-md bg-white px-2 py-1 text-xs text-amber-900">{skill}</span>)}</div></section> : <section className="mt-4 rounded-lg border border-slate-200 p-3"><p className="text-sm font-medium text-slate-800">{isKo ? "직무 스킬 데이터 상태" : "Occupation-skill data status"}</p><p className="mt-1 text-xs leading-relaxed text-slate-500">{isKo ? "이 직업은 MOM 임금 표에는 있지만, 이번 MOM 상위 공석 표에는 직접 매핑되지 않았습니다. 임금 수치만으로 요구 스킬, 학위, 외국인 채용 가능성을 추정하지 않습니다." : "This occupation appears in MOM's wage table but is not directly mapped to the published top-vacancy list. CampCareer does not infer required skills, degrees, or foreign-worker access from wage data alone."}</p><a href={links.skillsFramework} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-rose-700 hover:underline"><ExternalLink className="h-3 w-3" />{isKo ? "공식 Skills Framework 확인" : "Check official Skills Framework"}</a></section>}<SGCareerActions links={links} locale={locale} /><section className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3"><p className="text-sm font-medium text-rose-900">{isKo ? "외국인 취업 경로 주의" : "Foreign work-pass caution"}</p><p className="mt-1 text-xs leading-relaxed text-rose-800">{isKo ? "이 임금 기준은 취업비자 승인 기준이나 외국인 제안 연봉이 아닙니다. 고용주 신청과 실제 직무·지원자 기준의 EP/S Pass·COMPASS 심사가 별도로 필요합니다." : "This wage benchmark is not a work-pass threshold or a foreign-worker offer. An employer application and role- and applicant-specific EP/S Pass and COMPASS assessment remain necessary."}</p><div className="mt-2 flex flex-wrap gap-2">{pathways.filter((pathway) => pathway.code === "ep" || pathway.code === "spass" || pathway.code === "compass-sol").map((pathway) => <a key={pathway.code} href={pathway.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-rose-800 hover:underline">{pathway.name}</a>)}</div></section><a href={links.wageSource} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:underline"><ExternalLink className="h-3 w-3" />{isKo ? "MOM 임금 원본 데이터" : "MOM wage source"}</a><AffiliateCtas /></div>
      <p className="border-t border-slate-100 px-5 py-3 text-[10px] leading-relaxed text-slate-400">Source: MOM Occupational Wages 2025, June 2025. This resident wage benchmark is not an employer offer, a foreign-worker salary, or a work-pass threshold.</p>
    </>
  )
}

function JPInfoPanel({
  rent,
  cities,
  selectedCity,
  shortageCount,
}: {
  rent: import("@/data/jp-map-data").JPRentArea | null
  cities: import("@/data/jp-map-data").JPRentArea[]
  selectedCity: import("@/data/jp-map-data").JPRentArea | null
  shortageCount: number
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 px-3 py-2.5">
          <p className="text-[11px] text-slate-500">Median rent band</p>
          <p className="text-base font-bold text-slate-900">{rent?.medianRentBandLabel ?? "—"}</p>
          <p className="mt-1 text-[10px] text-slate-400">2023 private rentals</p>
        </div>
        <div className="rounded-lg bg-amber-50 px-3 py-2.5">
          <p className="text-[11px] text-amber-700">Occupation groups</p>
          <p className="text-lg font-bold text-amber-800">{shortageCount || "—"}</p>
          <p className="mt-1 text-[10px] text-amber-700">with FY2025 demand data</p>
        </div>
      </div>
      {cities.length > 0 && (
        <div className="rounded-lg border border-slate-200 px-4 py-3">
          <p className="mb-2 text-[11px] text-slate-500">Major city rent bands</p>
          <div className="space-y-2">
            {cities.map((city) => (
              <div key={city.areaCode} className="flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-600">{city.nameEn} <span className="text-slate-400">{city.nameJa}</span></span>
                <span className="shrink-0 font-semibold text-slate-700">{city.medianRentBandLabel}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedCity && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold">{selectedCity.nameEn} · {selectedCity.nameJa}</p>
          <p className="mt-1">Official median rent band: <b>{selectedCity.medianRentBandLabel}</b></p>
        </div>
      )}
      <p className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] leading-relaxed text-slate-500">
        Rent is the lower edge of the official median monthly private-rental band, not an average. Source: Statistics Bureau of Japan, 2023 Housing and Land Survey.
      </p>
    </div>
  )
}

function JPShortageList({
  rows,
  onSelectGroup,
}: {
  rows: import("@/data/jp-map-data").JPShortageGroup[]
  onSelectGroup: (shortageGroupCode: string) => void
}) {
  if (rows.length === 0) return <p className="py-8 text-center text-sm text-slate-400">No verified MHLW occupation-group data is available for this prefecture.</p>
  return (
    <ol>
      {rows.slice(0, 15).map((row, index) => (
        <li key={row.shortageGroupCode}>
          <button type="button" onClick={() => onSelectGroup(row.shortageGroupCode)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-amber-50">
            <span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{index + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-800">{row.localName}</span>
              <span className="block text-[10px] text-slate-400">Openings {row.jobOpenings.toLocaleString()} · seekers {row.applicants.toLocaleString()}</span>
            </span>
            <span className="shrink-0 text-right"><span className="block text-sm font-semibold tabular-nums text-amber-700">{row.openingsToApplicantsRatio.toFixed(2)}x</span><span className="text-[10px] text-slate-400">openings / seekers</span></span>
          </button>
        </li>
      ))}
    </ol>
  )
}

function JPShortageOccupationDetail({
  group,
  prefectureName,
  prefectureJa,
  onBack,
  onClose,
}: {
  group: import("@/data/jp-map-data").JPShortageGroup
  prefectureName: string
  prefectureJa: string | null
  onBack: () => void
  onClose: () => void
}) {
  const locale = useLocale()
  const links = getJapanCareerLinks(group.localName, prefectureJa)
  return (
    <>
      <div className="flex items-center gap-2 px-5 pt-4">
        <button type="button" onClick={onBack} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Back"><ChevronLeft className="h-4 w-4" /></button>
        <button type="button" onClick={onClose} className="ml-auto rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close"><X className="h-4 w-4" /></button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
        <p className="text-[11px] font-medium text-amber-700">{locale === "ko" ? "부족직군 카드" : "Shortage occupation-group card"}</p>
        <h3 className="mt-1 text-lg font-semibold text-slate-900">{group.localName}</h3>
        <p className="mt-1 text-xs text-slate-500">{prefectureName} · FY2025 MHLW annual average</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-amber-50 px-3 py-2.5"><p className="text-[11px] text-amber-700">Effective openings</p><p className="text-lg font-bold text-amber-900">{group.jobOpenings.toLocaleString()}</p></div>
          <div className="rounded-lg bg-amber-50 px-3 py-2.5"><p className="text-[11px] text-amber-700">Job seekers</p><p className="text-lg font-bold text-amber-900">{group.applicants.toLocaleString()}</p></div>
          <div className="col-span-2 rounded-lg bg-slate-50 px-3 py-2.5"><p className="text-[11px] text-slate-500">Openings-to-seekers ratio</p><p className="text-xl font-bold text-slate-900">{group.openingsToApplicantsRatio.toFixed(2)}x</p><p className="text-[10px] text-slate-400">Effective openings ÷ effective job seekers</p></div>
        </div>
        <section className="mt-5 rounded-lg border border-slate-200 p-3">
          <p className="text-sm font-medium text-slate-800">Explore roles, skills and study paths</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">This MHLW statistic is an occupation group, not one specific Job Tag role. Skills and qualifications must be checked for the individual role before making a study decision.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={links.jobTagSearch} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:underline"><ExternalLink className="h-3 w-3" />Job Tag roles</a>
            <a href={links.indeedJapan} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:underline"><ExternalLink className="h-3 w-3" />Current jobs</a>
            <a href={links.jassoStudySearch} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:underline"><ExternalLink className="h-3 w-3" />Study options</a>
          </div>
        </section>
        <AffiliateCtas />
      </div>
      <p className="border-t border-slate-100 px-5 py-3 text-[10px] leading-relaxed text-slate-400">Source: MHLW Employment-related indicators by occupation, FY2025. The group-to-specific-role selection is intentionally left to Job Tag instead of inferred by CampCareer.</p>
    </>
  )
}

function JPHighPayList({
  rows,
  onSelectWage,
}: {
  rows: import("@/data/jp-map-data").JPHighPayOccupation[]
  onSelectWage: (occupationCode: string) => void
}) {
  return (
    <div className="space-y-3">
      <p className="px-3 text-[11px] leading-relaxed text-slate-500">National MHLW hourly baseline. Annual figure is a transparent estimate using hourly baseline × 160 hours/month × 12 months; it is not a reported annual salary.</p>
      <ol>
        {rows.slice(0, 15).map((row, index) => (
          <li key={row.occupationCode}>
            <button type="button" onClick={() => onSelectWage(row.occupationCode)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50">
              <span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{index + 1}</span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-800">{row.localName}</span><span className="block text-[10px] text-slate-400">MHLW occupation code {row.occupationCode}</span></span>
              <span className="shrink-0 text-right"><span className="block text-sm font-semibold tabular-nums text-slate-700">JPY {row.hourlyBaseWageYen.toLocaleString()}/hr</span><span className="text-[10px] text-slate-400">est. JPY {row.annualizedBaseSalaryYen.toLocaleString()}/yr</span></span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

function JPWageOccupationDetail({
  wage,
  profiles,
  prefectureName,
  onBack,
  onClose,
}: {
  wage: import("@/data/jp-map-data").JPHighPayOccupation
  profiles: import("@/data/jp-map-data").JPJobTagProfile[]
  prefectureName: string
  onBack: () => void
  onClose: () => void
}) {
  const locale = useLocale()
  const isKo = locale === "ko"
  const title = isKo ? "고소득 직업 카드" : "High-pay occupation card"
  const fallbackLinks = getJapanCareerLinks(wage.localName)
  return (
    <>
      <div className="flex items-center gap-2 px-5 pt-4">
        <button type="button" onClick={onBack} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Back"><ChevronLeft className="h-4 w-4" /></button>
        <button type="button" onClick={onClose} className="ml-auto rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close"><X className="h-4 w-4" /></button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
        <p className="text-[11px] font-medium text-rose-700">{title}</p>
        <h3 className="mt-1 text-lg font-semibold text-slate-900">{wage.localName}</h3>
        <p className="mt-1 text-xs text-slate-500">{prefectureName} · national MHLW wage baseline</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-50 px-3 py-2.5"><p className="text-[11px] text-slate-500">Hourly baseline</p><p className="text-lg font-bold text-slate-900">JPY {wage.hourlyBaseWageYen.toLocaleString()}</p></div>
          <div className="rounded-lg bg-slate-50 px-3 py-2.5"><p className="text-[11px] text-slate-500">Annual estimate</p><p className="text-lg font-bold text-slate-900">JPY {wage.annualizedBaseSalaryYen.toLocaleString()}</p><p className="text-[10px] text-slate-400">160 hr × 12</p></div>
        </div>
        {profiles.length === 0 ? (
          <div className="mt-5 space-y-4">
            <section className="rounded-lg border border-slate-200 p-3"><p className="text-sm font-medium text-slate-800">{isKo ? "직무 정보 상태" : "Occupation information status"}</p><p className="mt-1 text-xs leading-relaxed text-slate-500">{isKo ? "이 임금 분류에는 아직 Job Tag 세부 직업 프로필이 연결되지 않았습니다. 연봉만으로 필요한 스킬, 학위 또는 비자 가능성을 추정하지 않습니다." : "No Job Tag role profile is mapped to this wage classification yet. CampCareer does not infer required skills, degree paths, or visa access from the wage figure alone."}</p></section>
            <JPCareerActions links={fallbackLinks} locale={locale} />
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {profiles.slice(0, 6).map((profile) => {
              const links = getJapanCareerLinks(profile.localName)
              return (
                <section key={profile.recordNumber} className="rounded-lg border border-slate-200 p-3">
                  <h4 className="font-medium text-slate-900">{profile.localName}</h4>
                  {profile.entryPathJa && <p className="mt-1 text-xs leading-relaxed text-slate-500">{isKo ? "일본 직업 진입 경로" : "Japanese entry path"}: {profile.entryPathJa}</p>}
                  {profile.skills.length > 0 && <div className="mt-3">
                    <p className="text-[11px] font-medium text-slate-500">Top skills</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">{profile.skills.slice(0, 4).map((skill) => <span key={skill.nameJa} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">{skill.nameJa}</span>)}</div>
                  </div>}
                  {profile.knowledge.length > 0 && <div className="mt-3">
                    <p className="text-[11px] font-medium text-slate-500">Recommended study focus</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">{profile.knowledge.slice(0, 3).map((knowledge) => <span key={knowledge.nameJa} className="rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-800">{knowledge.nameJa}</span>)}</div>
                  </div>}
                  {profile.qualificationsJa.length > 0 && <div className="mt-3"><p className="text-[11px] font-medium text-slate-500">Related qualifications</p><p className="mt-1 text-xs leading-relaxed text-slate-700">{profile.qualificationsJa.slice(0, 4).join(" · ")}</p></div>}
                  <JPCareerActions links={links} locale={locale} />
                </section>
              )
            })}
          </div>
        )}
        <a href={wage.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:underline"><ExternalLink className="h-3 w-3" />{isKo ? "MHLW 임금 원본 데이터" : "MHLW wage source"}</a>
        <AffiliateCtas />
      </div>
      <p className="border-t border-slate-100 px-5 py-3 text-[10px] leading-relaxed text-slate-400">Source: MHLW Wage Structure Basic Statistical Survey for the wage baseline; Job Tag v7.01/v7.00 for linked role skills and qualifications. The annual figure is a transparent calculation, not a reported annual salary.</p>
    </>
  )
}

function JPCareerActions({ links, locale }: { links: ReturnType<typeof getJapanCareerLinks>; locale: string }) {
  const isKo = locale === "ko"
  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-3">
      <a href={links.jobTagSearch} target="_blank" rel="noopener noreferrer" className="rounded-md border border-slate-200 bg-slate-50 p-2.5 hover:bg-slate-100"><p className="text-xs font-medium text-slate-800">{isKo ? "직무·스킬 정보" : "Role and skills"}</p><span className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-600"><ExternalLink className="h-3 w-3" />Job Tag</span></a>
      <a href={links.jassoStudySearch} target="_blank" rel="noopener noreferrer" className="rounded-md border border-blue-200 bg-blue-50 p-2.5 hover:bg-blue-100"><p className="text-xs font-medium text-blue-950">{isKo ? "관련 코스·학위" : "Courses and degrees"}</p><span className="mt-1 inline-flex items-center gap-1 text-[11px] text-blue-700"><GraduationCap className="h-3 w-3" />JASSO</span></a>
      <a href={links.indeedJapan} target="_blank" rel="noopener noreferrer" className="rounded-md border border-emerald-200 bg-emerald-50 p-2.5 hover:bg-emerald-100"><p className="text-xs font-medium text-emerald-950">{isKo ? "관련 채용 공고" : "Current job listings"}</p><span className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-700"><ExternalLink className="h-3 w-3" />{isKo ? "공고 검색" : "Search jobs"}</span></a>
    </div>
  )
}

function BEInfoPanel({
  stateInfo,
  cities,
  regionCode,
  taxRates,
}: {
  stateInfo: import("@/lib/map-data").BEStateInfo | null
  cities: import("@/lib/map-data").BECity[]
  regionCode: string | null
  taxRates: Record<string, unknown>
}) {
  const regionCities = useMemo(() => {
    return cities.filter((c) => c.region === regionCode && c.rent_median != null)
      .sort((a, b) => (b.rent_median ?? 0) - (a.rent_median ?? 0))
  }, [cities, regionCode])

  if (!stateInfo) {
    return <p className="py-8 text-center text-sm text-slate-400">No info available for this region.</p>
  }

  return (
    <div className="space-y-4">
      {/* Region Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 px-3 py-2.5">
          <p className="text-[11px] text-slate-500">Avg Monthly Rent</p>
          <p className="text-lg font-bold text-slate-900">
            {stateInfo.average_rent_eur != null ? `€${stateInfo.average_rent_eur.toLocaleString()}` : "—"}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2.5">
          <p className="text-[11px] text-slate-500">Avg Gross Salary</p>
          <p className="text-lg font-bold text-slate-900">
            {stateInfo.average_salary_eur != null ? `€${stateInfo.average_salary_eur.toLocaleString()}` : "—"}
          </p>
          <p className="text-[10px] text-slate-400">per month</p>
        </div>
      </div>

      {/* Rent by City */}
      {regionCities.length > 0 && (
        <div className="rounded-lg border border-slate-200 px-4 py-3">
          <p className="text-[11px] text-slate-500 mb-2">Median Rent by City</p>
          <div className="space-y-2">
            {regionCities.map((city) => (
              <div key={city.name} className="flex items-center justify-between text-xs">
                <span className="text-slate-600">{city.name}</span>
                <span className="font-semibold text-slate-700">€{city.rent_median?.toLocaleString()}/mo</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Salary vs Rent Overview */}
      {stateInfo.average_salary_eur != null && stateInfo.average_rent_eur != null && (
        <div className="rounded-lg border border-slate-200 px-4 py-3">
          <p className="text-[11px] text-slate-500 mb-2">Salary vs Rent</p>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Monthly Gross</span>
              <span className="font-medium text-slate-700">€{stateInfo.average_salary_eur.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Avg Rent</span>
              <span className="font-medium text-slate-700">€{stateInfo.average_rent_eur.toLocaleString()}/mo</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-1.5">
              <span className="text-slate-600">Rent Multiple</span>
              <span className="font-bold text-emerald-600">
                {(stateInfo.average_salary_eur / 12 / stateInfo.average_rent_eur).toFixed(1)}x
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Top Shortage Occupations */}
      {stateInfo.shortage_occupations && stateInfo.shortage_occupations.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-[11px] text-amber-600 font-medium mb-2">Top Shortage Occupations</p>
          <ul className="space-y-1">
            {stateInfo.shortage_occupations.slice(0, 5).map((occ, i) => (
              <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                <span className="text-amber-500 mt-0.5">•</span>
                {occ}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tax Brackets */}
      {(() => {
        const brackets = taxRates?.brackets as Array<{ rate: number; from: number; to: number | null }> | undefined
        if (!brackets || brackets.length === 0) return null
        return (
          <div className="rounded-lg border border-slate-200 px-4 py-3">
            <p className="text-[11px] text-slate-500 mb-2">Income Tax Brackets (2025)</p>
            <div className="space-y-1.5">
              {brackets.map((b, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">
                    €{b.from.toLocaleString()} {b.to != null ? `– €${b.to.toLocaleString()}` : "+"}
                  </span>
                  <span className="font-medium text-slate-700">{b.rate}%</span>
                </div>
              ))}
            </div>
            {taxRates?.personal_tax_allowance != null && (
              <p className="text-[10px] text-slate-400 mt-2">
                Personal allowance: €{(taxRates.personal_tax_allowance as number).toLocaleString()}
              </p>
            )}
            {taxRates?.social_security_rate != null && (
              <p className="text-[10px] text-slate-400">
                Social security: {taxRates.social_security_rate as number}% of gross
              </p>
            )}
            <a
              href="https://fin.belgium.be/en/individuals/taxation/tax-rates/income-tax-rates"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-violet-500 hover:text-violet-700 hover:underline mt-1.5"
            >
              <ExternalLink className="h-2.5 w-2.5" />
              fin.belgium.be
            </a>
          </div>
        )
      })()}

      <div className="rounded-lg border border-slate-200 px-3 py-2">
        <p className="text-[11px] text-slate-500">Source</p>
        <p className="text-xs text-slate-700">Numbeo, Statbel, VDAB / CIB 2025</p>
      </div>
    </div>
  )
}

function BEShortageList({ rows, onSelectOcc }: { rows: BERegionOccupation[]; onSelectOcc?: (code: string) => void }) {
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">No shortage data available for this region.</p>
  }
  return (
    <ol>
      {rows.map((r, i) => (
        <li key={r.occupation_code}>
          <button
            type="button"
            onClick={() => onSelectOcc?.(r.occupation_code)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
          >
            <span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{i + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-800">
                {r.occupation_en}
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-sm font-semibold tabular-nums text-slate-700">
                {r.shortage_rating != null ? `${r.shortage_rating.toFixed(1)}/5` : "—"}
              </span>
              {r.median_salary_eur != null && (
                <span className="text-[10px] text-slate-400">€{r.median_salary_eur.toLocaleString()}</span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}

function BEHighPayList({ rows, onSelectOcc }: { rows: BERegionOccupation[]; onSelectOcc?: (code: string) => void }) {
  const sorted = [...rows]
    .filter((r) => r.median_salary_eur != null)
    .sort((a, b) => (b.median_salary_eur ?? 0) - (a.median_salary_eur ?? 0))
  if (sorted.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">No salary data available for this region.</p>
  }
  return (
    <ol>
      {sorted.map((r, i) => (
        <li key={r.occupation_code}>
          <button
            type="button"
            onClick={() => onSelectOcc?.(r.occupation_code)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
          >
            <span className="w-5 shrink-0 text-sm tabular-nums text-slate-400">{i + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-800">
                {r.occupation_en}
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-sm font-semibold tabular-nums text-slate-700">
                {r.median_salary_eur != null ? `€${r.median_salary_eur.toLocaleString()}` : "—"}
              </span>
              {r.shortage_rating != null && (
                <span className="text-[10px] text-slate-400">Shortage: {r.shortage_rating.toFixed(1)}/5</span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}

function BEOccupationDetail({
  occ,
  regionName,
  regionCode,
  data,
  onBack,
  onClose,
  savedOccCodes,
  onToggleSave,
  onShare,
}: {
  occ: BEOccRow
  regionName: string
  regionCode: string | null
  data: MapData
  onBack: () => void
  onClose: () => void
  savedOccCodes: Set<string>
  onToggleSave: (occCode: string, occTitle: string) => void
  onShare: () => void
}) {
  const isSaved = savedOccCodes.has(occ.occupation_code)

  const regionColleges = useMemo(() => {
    return (data.beColleges ?? [])
      .filter((c) => c.region === regionCode)
      .sort((a, b) => (b.median_earnings ?? 0) - (a.median_earnings ?? 0))
      .slice(0, 5)
  }, [data.beColleges, regionCode])

  const regionCities = useMemo(() => {
    return (data.beCities ?? []).filter((c) => c.region === regionCode)
  }, [data.beCities, regionCode])

  return (
    <>
      <div className="flex items-center gap-2 px-5 pt-4">
        <button type="button" onClick={onBack} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button type="button" onClick={onClose} className="ml-auto rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{occ.occupation_en}</h3>
          {occ.occupation_nl && <p className="text-sm text-slate-500">{occ.occupation_nl}</p>}
          {occ.occupation_fr && <p className="text-xs text-slate-400">{occ.occupation_fr}</p>}
          <p className="text-xs text-slate-400 mt-1">{regionName}</p>
        </div>

        {/* Salary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-50 px-3 py-2.5">
            <p className="text-[11px] text-slate-500">Median Salary</p>
            <p className="text-lg font-bold text-slate-900">
              {occ.median_salary_eur != null ? `€${occ.median_salary_eur.toLocaleString()}` : "—"}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2.5">
            <p className="text-[11px] text-slate-500">Mean Salary</p>
            <p className="text-lg font-bold text-slate-900">
              {occ.mean_salary_eur != null ? `€${occ.mean_salary_eur.toLocaleString()}` : "—"}
            </p>
          </div>
          {occ.shortage_rating != null && (
            <div className="rounded-lg bg-amber-50 px-3 py-2.5">
              <p className="text-[11px] text-amber-600">Shortage Rating</p>
              <p className="text-lg font-bold text-amber-700">
                {occ.shortage_rating.toFixed(1)}/5
              </p>
            </div>
          )}
          {occ.related_broad_field && (
            <div className="rounded-lg bg-slate-50 px-3 py-2.5">
              <p className="text-[11px] text-slate-500">Field</p>
              <p className="text-sm font-semibold text-slate-900">{occ.related_broad_field}</p>
            </div>
          )}
        </div>

        {/* Salary vs Cost of Living */}
        {regionCities.length > 0 && occ.median_salary_eur != null && (
          <div className="rounded-lg border border-slate-200 px-4 py-3">
            <p className="text-[11px] text-slate-500 mb-2">Salary vs Cost of Living in {regionName}</p>
            <div className="space-y-2">
              {regionCities.slice(0, 4).map((city) => {
                const rentRatio = city.rent_median != null
                  ? Math.round(occ.median_salary_eur! / 12 / city.rent_median)
                  : null
                return (
                  <div key={city.name} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">{city.name}</span>
                    <div className="text-right">
                      {city.rent_median != null && (
                        <span className="text-slate-500">Rent €{city.rent_median}/mo</span>
                      )}
                      {rentRatio != null && (
                        <span className="ml-2 font-medium text-emerald-600">
                          {rentRatio}x
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Rent multiple = monthly median salary ÷ median rent
            </p>
          </div>
        )}

        {/* Related Universities */}
        {regionColleges.length > 0 && (
          <div className="rounded-lg border border-slate-200 px-4 py-3">
            <p className="text-[11px] text-slate-500 mb-2">Top Universities in {regionName}</p>
            <div className="space-y-2">
              {regionColleges.map((c) => (
                <div key={c.institution_id} className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-slate-700">{c.college_name}</span>
                    {c.qs_rank != null && (
                      <span className="ml-1.5 text-slate-400">#{c.qs_rank}</span>
                    )}
                  </div>
                  <span className="font-semibold text-slate-600">
                    {c.median_earnings != null ? `€${c.median_earnings.toLocaleString()}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Jobat Career & Course Links */}
        {(() => {
          const jobatLink = data.beJobatLinks?.[occ.occupation_code]
          if (!jobatLink) return null
          return (
            <div className="rounded-lg border border-slate-200 px-4 py-3">
              <p className="text-[11px] text-slate-500 mb-2">Career & Courses on Jobat.be</p>
              <div className="space-y-2">
                <a
                  href={jobatLink.jobat_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-800 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Career Info: {jobatLink.occupation_en}
                </a>
                <a
                  href={jobatLink.salary_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-800 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Salary Details
                </a>
                {jobatLink.course_url && (
                  <a
                    href={jobatLink.course_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-800 hover:underline"
                  >
                    <GraduationCap className="h-3 w-3" />
                    Related Courses
                  </a>
                )}
              </div>
            </div>
          )
        })()}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onToggleSave(occ.occupation_code, occ.occupation_en)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-violet-500 text-violet-500" : ""}`} />
            {isSaved ? "Saved" : "Save"}
          </button>
          <button type="button" onClick={onShare} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>
        </div>

        <div className="rounded-lg border border-slate-200 px-3 py-2">
          <p className="text-[11px] text-slate-500">Source</p>
          <p className="text-xs text-slate-700">Statbel / VDAB / Actiris / Jobat.be</p>
        </div>
        <AffiliateCtas />
      </div>
    </>
  )
}

function UKOccupationDetail({
  occ,
  regionName,
  regionCode,
  data,
  onBack,
  onClose,
  savedOccCodes,
  onToggleSave,
  onShare,
}: {
  occ: UKOccRow
  regionName: string
  regionCode: string
  data: MapData
  onBack: () => void
  onClose: () => void
  savedOccCodes: Set<string>
  onToggleSave: (occCode: string, occTitle: string) => void
  onShare: () => void
}) {
  const isSaved = savedOccCodes.has(occ.soc_code)
  const hasRange = occ.q1_salary_gbp != null && occ.q3_salary_gbp != null
  const midSalary = occ.median_salary_gbp ?? occ.mean_salary_gbp
  const maxRange = occ.q3_salary_gbp ?? occ.mean_salary_gbp ?? occ.median_salary_gbp ?? 1
  const barMax = Math.max(maxRange, occ.mean_salary_gbp ?? 0)

  // Related universities in the same region
  const regionColleges = data.ukColleges
    .filter((c) => c.region === regionCode && c.median_earnings != null)
    .sort((a, b) => (b.median_earnings ?? 0) - (a.median_earnings ?? 0))
    .slice(0, 5)

  // Cities in the region with rent data
  const regionCities = data.ukCities
    .filter((c) => c.region === regionCode && c.rent_median != null)
    .sort((a, b) => (b.rent_median ?? 0) - (a.rent_median ?? 0))

  return (
    <>
      <div className="flex items-center gap-2 px-5 pt-4">
        <button type="button" onClick={onBack} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button type="button" onClick={onClose} className="ml-auto rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{occ.occupation_en}</h3>
          {occ.occupation_ko && <p className="text-sm text-slate-500">{occ.occupation_ko}</p>}
          <p className="text-xs text-slate-400 mt-1">{regionName} · SOC {occ.soc_code}</p>
        </div>

        {/* Salary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-50 px-3 py-2.5">
            <p className="text-[11px] text-slate-500">Median Salary</p>
            <p className="text-lg font-bold text-slate-900">
              {occ.median_salary_gbp != null ? `£${occ.median_salary_gbp.toLocaleString()}` : "—"}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2.5">
            <p className="text-[11px] text-slate-500">Mean Salary</p>
            <p className="text-lg font-bold text-slate-900">
              {occ.mean_salary_gbp != null ? `£${occ.mean_salary_gbp.toLocaleString()}` : "—"}
            </p>
          </div>
          {occ.employment_thousands != null && (
            <div className="rounded-lg bg-slate-50 px-3 py-2.5">
              <p className="text-[11px] text-slate-500">Employed (UK)</p>
              <p className="text-lg font-bold text-slate-900">
                {(occ.employment_thousands * 1000).toLocaleString()}
              </p>
            </div>
          )}
          {occ.on_sol && (
            <div className="rounded-lg bg-emerald-50 px-3 py-2.5">
              <p className="text-[11px] text-emerald-600">Shortage Occupation</p>
              <p className="text-lg font-bold text-emerald-700">SOL</p>
            </div>
          )}
          {occ.on_isl && (
            <div className="rounded-lg bg-blue-50 px-3 py-2.5">
              <p className="text-[11px] text-blue-600">Immigration Salary List</p>
              <p className="text-lg font-bold text-blue-700">ISL</p>
            </div>
          )}
        </div>

        {/* Salary range bar */}
        {hasRange && (
          <div className="rounded-lg border border-slate-200 px-4 py-3">
            <p className="text-[11px] text-slate-500 mb-2">Salary Range (Q1 → Q3)</p>
            <div className="relative h-2 rounded-full bg-slate-100">
              <div
                className="absolute h-2 rounded-full bg-violet-200"
                style={{
                  left: `${(occ.q1_salary_gbp! / barMax) * 100}%`,
                  right: `${100 - (occ.q3_salary_gbp! / barMax) * 100}%`,
                }}
              />
              {midSalary != null && (
                <div
                  className="absolute top-1/2 -mt-1.5 h-3 w-0.5 rounded bg-violet-600"
                  style={{ left: `${(midSalary / barMax) * 100}%` }}
                />
              )}
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>£{occ.q1_salary_gbp!.toLocaleString()}</span>
              <span className="font-semibold text-violet-700">
                {occ.median_salary_gbp != null ? `£${occ.median_salary_gbp.toLocaleString()}` : ""}
              </span>
              <span>£{occ.q3_salary_gbp!.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Salary vs Cost of Living */}
        {regionCities.length > 0 && occ.median_salary_gbp != null && (
          <div className="rounded-lg border border-slate-200 px-4 py-3">
            <p className="text-[11px] text-slate-500 mb-2">Salary vs Cost of Living in {regionName}</p>
            <div className="space-y-2">
              {regionCities.slice(0, 3).map((city) => {
                const rentRatio = city.rent_median != null
                  ? Math.round(occ.median_salary_gbp! / 12 / city.rent_median)
                  : null
                return (
                  <div key={city.name} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">{city.name}</span>
                    <div className="text-right">
                      {city.rent_median != null && (
                        <span className="text-slate-500">Rent £{city.rent_median}/mo</span>
                      )}
                      {rentRatio != null && (
                        <span className="ml-2 font-medium text-emerald-600">
                          {rentRatio}x
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Rent multiple = monthly median salary ÷ median rent
            </p>
          </div>
        )}

        {/* Related Universities */}
        {regionColleges.length > 0 && (
          <div className="rounded-lg border border-slate-200 px-4 py-3">
            <p className="text-[11px] text-slate-500 mb-2">Top Universities in {regionName}</p>
            <div className="space-y-2">
              {regionColleges.map((c) => (
                <div key={c.institution_id} className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-slate-700">{c.college_name}</span>
                    {c.qs_rank != null && (
                      <span className="ml-1.5 text-slate-400">#{c.qs_rank}</span>
                    )}
                  </div>
                  <span className="font-semibold text-slate-600">
                    {c.median_earnings != null ? `£${c.median_earnings.toLocaleString()}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onToggleSave(occ.soc_code, occ.occupation_en)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-violet-500 text-violet-500" : ""}`} />
            {isSaved ? "Saved" : "Save"}
          </button>
          <button type="button" onClick={onShare} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>
        </div>

        {occ.source_name && (
          <div className="rounded-lg border border-slate-200 px-3 py-2">
            <p className="text-[11px] text-slate-500">Source</p>
            <p className="text-xs text-slate-700">{occ.source_name}</p>
          </div>
        )}
        <AffiliateCtas />
      </div>
    </>
  )
}

function DEOccupationDetail({
  occ,
  regionName,
  regionCode,
  data,
  onBack,
  onClose,
  savedOccCodes,
  onToggleSave,
  onShare,
  deExpLevel,
}: {
  occ: DEOccRow
  regionName: string
  regionCode: string
  data: MapData
  onBack: () => void
  onClose: () => void
  savedOccCodes: Set<string>
  onToggleSave: (occCode: string, occTitle: string) => void
  onShare: () => void
  deExpLevel: "fachkräfte" | "spezialisten" | "experten"
}) {
  const isSaved = savedOccCodes.has(occ.kldb_code)
  const hasRange = occ.q1_salary_eur != null && occ.q3_salary_eur != null
  const midSalary = occ.median_salary_eur ?? occ.mean_salary_eur
  const maxRange = occ.q3_salary_eur ?? occ.mean_salary_eur ?? occ.median_salary_eur ?? 1
  const barMax = Math.max(maxRange, occ.mean_salary_eur ?? 0)

  const salaryField = deExpLevel === "fachkräfte" ? "median_salary_eur" : deExpLevel === "spezialisten" ? "median_salary_spezialist_eur" : "median_salary_experte_eur"
  const ratingField = deExpLevel === "fachkräfte" ? "shortage_rating" : deExpLevel === "spezialisten" ? "shortage_rating_spezialist" : "shortage_rating_experte"
  const displaySalary = (occ as unknown as Record<string, unknown>)[salaryField] as number | null
  const displayRating = (occ as unknown as Record<string, unknown>)[ratingField] as number | null
  const levelLabel = deExpLevel === "fachkräfte" ? "Fachkräfte" : deExpLevel === "spezialisten" ? "Spezialisten" : "Experten"

  const regionColleges = data.deColleges
    .filter((c) => c.region === regionCode && c.median_earnings != null)
    .sort((a, b) => (b.median_earnings ?? 0) - (a.median_earnings ?? 0))
    .slice(0, 5)

  return (
    <>
      <div className="flex items-center gap-2 px-5 pt-4">
        <button type="button" onClick={onBack} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button type="button" onClick={onClose} className="ml-auto rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{occ.occupation_en}</h3>
          {occ.occupation_de && <p className="text-sm text-slate-500">{occ.occupation_de}</p>}
          <p className="text-xs text-slate-400 mt-1">{regionName} · KldB {occ.kldb_code}</p>
          {occ.on_blue_card_list && (
            <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
              <span className="text-sm font-bold text-blue-700">EU Blue Card</span>
              <span className="text-xs text-blue-600">✓ Eligible occupation</span>
            </div>
          )}
        </div>

        {/* Salary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-50 px-3 py-2.5">
            <p className="text-[11px] text-slate-500">{levelLabel} Salary</p>
            <p className="text-lg font-bold text-slate-900">
              {displaySalary != null ? `€${displaySalary.toLocaleString()}` : "—"}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2.5">
            <p className="text-[11px] text-slate-500">Shortage Rating</p>
            <p className="text-lg font-bold text-slate-900">
              {displayRating != null ? `${displayRating.toFixed(1)}/4` : "—"}
            </p>
          </div>
          {occ.on_blue_card_list && (
            <div className="rounded-lg bg-blue-50 px-3 py-2.5">
              <p className="text-[11px] text-blue-600">Blue Card</p>
              <p className="text-lg font-bold text-blue-700">Eligible</p>
            </div>
          )}
          {occ.employment_thousands != null && (
            <div className="rounded-lg bg-slate-50 px-3 py-2.5">
              <p className="text-[11px] text-slate-500">Employed (DE)</p>
              <p className="text-lg font-bold text-slate-900">
                {(occ.employment_thousands * 1000).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Salary range bar */}
        {hasRange && (
          <div className="rounded-lg border border-slate-200 px-4 py-3">
            <p className="text-[11px] text-slate-500 mb-2">Salary Range (Q1 → Q3, all levels)</p>
            <div className="relative h-2 rounded-full bg-slate-100">
              <div
                className="absolute h-2 rounded-full bg-violet-200"
                style={{
                  left: `${(occ.q1_salary_eur! / barMax) * 100}%`,
                  right: `${100 - (occ.q3_salary_eur! / barMax) * 100}%`,
                }}
              />
              {midSalary != null && (
                <div
                  className="absolute top-1/2 -mt-1.5 h-3 w-0.5 rounded bg-violet-600"
                  style={{ left: `${(midSalary / barMax) * 100}%` }}
                />
              )}
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>€{occ.q1_salary_eur!.toLocaleString()}</span>
              <span className="font-semibold text-violet-700">
                {occ.median_salary_eur != null ? `€${occ.median_salary_eur.toLocaleString()}` : ""}
              </span>
              <span>€{occ.q3_salary_eur!.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Related Universities */}
        {regionColleges.length > 0 && (
          <div className="rounded-lg border border-slate-200 px-4 py-3">
            <p className="text-[11px] text-slate-500 mb-2">Top Universities in {regionName}</p>
            <div className="space-y-2">
              {regionColleges.map((c) => (
                <div key={c.institution_id} className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-slate-700">{c.college_name}</span>
                    {c.qs_rank != null && (
                      <span className="ml-1.5 text-slate-400">#{c.qs_rank}</span>
                    )}
                  </div>
                  <span className="font-semibold text-slate-600">
                    {c.median_earnings != null ? `€${c.median_earnings.toLocaleString()}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onToggleSave(occ.kldb_code, occ.occupation_en)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-violet-500 text-violet-500" : ""}`} />
            {isSaved ? "Saved" : "Save"}
          </button>
          <button type="button" onClick={onShare} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>
        </div>

        <div className="rounded-lg border border-slate-200 px-3 py-2">
          <p className="text-[11px] text-slate-500">Source</p>
          <p className="text-xs text-slate-700">BA Entgeltatlas 2024 / BA Engpassanalyse 2025</p>
        </div>
        <AffiliateCtas />
      </div>
    </>
  )
}

function NLOccupationDetail({
  occ,
  regionName,
  regionCode,
  data,
  onBack,
  onClose,
  savedOccCodes,
  onToggleSave,
  onShare,
}: {
  occ: NLOccRow
  regionName: string
  regionCode: string
  data: MapData
  onBack: () => void
  onClose: () => void
  savedOccCodes: Set<string>
  onToggleSave: (occCode: string, occTitle: string) => void
  onShare: () => void
}) {
  const isSaved = savedOccCodes.has(occ.sbc_code)
  const hasRange = occ.q1_salary_eur != null && occ.q3_salary_eur != null
  const midSalary = occ.median_salary_eur ?? occ.mean_salary_eur
  const maxRange = occ.q3_salary_eur ?? occ.mean_salary_eur ?? occ.median_salary_eur ?? 1
  const barMax = Math.max(maxRange, occ.mean_salary_eur ?? 0)

  const regionColleges = data.nlColleges
    .filter((c) => c.province === regionCode && c.median_earnings != null)
    .sort((a, b) => (b.median_earnings ?? 0) - (a.median_earnings ?? 0))
    .slice(0, 5)

  return (
    <>
      <div className="flex items-center gap-2 px-5 pt-4">
        <button type="button" onClick={onBack} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button type="button" onClick={onClose} className="ml-auto rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{occ.occupation_en}</h3>
          {occ.occupation_nl && <p className="text-sm text-slate-500">{occ.occupation_nl}</p>}
          <p className="text-xs text-slate-400 mt-1">{regionName} · SBC {occ.sbc_code}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-50 px-3 py-2.5">
            <p className="text-[11px] text-slate-500">Median Salary</p>
            <p className="text-lg font-bold text-slate-900">
              {occ.median_salary_eur != null ? `€${occ.median_salary_eur.toLocaleString()}` : "—"}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2.5">
            <p className="text-[11px] text-slate-500">Shortage Rating</p>
            <p className="text-lg font-bold text-slate-900">
              {occ.shortage_rating != null ? `${occ.shortage_rating.toFixed(1)}/5` : "—"}
            </p>
          </div>
          {occ.employment_thousands != null && (
            <div className="rounded-lg bg-slate-50 px-3 py-2.5">
              <p className="text-[11px] text-slate-500">Employed (NL)</p>
              <p className="text-lg font-bold text-slate-900">
                {(occ.employment_thousands * 1000).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {hasRange && (
          <div className="rounded-lg border border-slate-200 px-4 py-3">
            <p className="text-[11px] text-slate-500 mb-2">Salary Range (Q1 → Q3)</p>
            <div className="relative h-2 rounded-full bg-slate-100">
              <div
                className="absolute h-2 rounded-full bg-violet-200"
                style={{
                  left: `${(occ.q1_salary_eur! / barMax) * 100}%`,
                  right: `${100 - (occ.q3_salary_eur! / barMax) * 100}%`,
                }}
              />
              {midSalary != null && (
                <div
                  className="absolute top-1/2 -mt-1.5 h-3 w-0.5 rounded bg-violet-600"
                  style={{ left: `${(midSalary / barMax) * 100}%` }}
                />
              )}
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>€{occ.q1_salary_eur!.toLocaleString()}</span>
              <span className="font-semibold text-violet-700">
                {occ.median_salary_eur != null ? `€${occ.median_salary_eur.toLocaleString()}` : ""}
              </span>
              <span>€{occ.q3_salary_eur!.toLocaleString()}</span>
            </div>
          </div>
        )}

        {regionColleges.length > 0 && (
          <div className="rounded-lg border border-slate-200 px-4 py-3">
            <p className="text-[11px] text-slate-500 mb-2">Top Universities in {regionName}</p>
            <div className="space-y-2">
              {regionColleges.map((c) => (
                <div key={c.institution_id} className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-slate-700">{c.college_name}</span>
                    {c.qs_rank != null && (
                      <span className="ml-1.5 text-slate-400">#{c.qs_rank}</span>
                    )}
                  </div>
                  <span className="font-semibold text-slate-600">
                    {c.median_earnings != null ? `€${c.median_earnings.toLocaleString()}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onToggleSave(occ.sbc_code, occ.occupation_en)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-violet-500 text-violet-500" : ""}`} />
            {isSaved ? "Saved" : "Save"}
          </button>
          <button type="button" onClick={onShare} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>
        </div>

        <div className="rounded-lg border border-slate-200 px-3 py-2">
          <p className="text-[11px] text-slate-500">Source</p>
          <p className="text-xs text-slate-700">CBS 2024 / UWV Spanningsindicator 2025</p>
        </div>
        <AffiliateCtas />
      </div>
    </>
  )
}
