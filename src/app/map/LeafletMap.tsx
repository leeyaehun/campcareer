"use client"

import "leaflet/dist/leaflet.css"
import { useEffect, useRef, useState, type MutableRefObject } from "react"
import L from "leaflet"
import { Maximize2 } from "lucide-react"
import { STATE_CODES, STATE_NAMES, IE_COUNTY_NAMES, IE_GEOJSON_COUNTY_TO_CODE, IE_CITY_TO_COUNTY, UK_GEOJSON_ITL1_TO_NAME, DE_BUNDESLAND_NAMES, NL_PROVINCE_NAMES, BE_REGION_NAMES, JP_PREFECTURE_NAMES, KR_SIDO_NAMES, FR_REGION_NAMES, AE_EMIRATE_NAMES, type StateCode, type IECountyCode, type AEEmirateCode } from "./states"
import { SA4_BY_STATE, type SA4Region } from "@/data/sa4-regions"
import { WHV_REGIONS } from "@/data/whv-regions"
import { useTranslations } from "@/lib/i18n/use-translations"
import type { MapData } from "@/lib/map-data"
import { metropolitanFranceOnly } from "./france-geometry"

// SA4 코드 → 지역명 (툴팁/하이라이트용)
const SA4_NAME_BY_CODE: Record<string, string> = Object.fromEntries(
  Object.values(SA4_BY_STATE)
    .flat()
    .map((r) => [r.code, r.name]),
)

const AU_BOUNDS = L.latLngBounds([-44, 112], [-10, 154])
const US_BOUNDS = L.latLngBounds([24, -125], [49, -66])
const CA_BOUNDS = L.latLngBounds([41, -145], [85, -50])
const IE_BOUNDS = L.latLngBounds([51.3, -10.5], [55.5, -5.8])
const UK_BOUNDS = L.latLngBounds([49.9, -8.2], [60.9, 1.8])
const DE_BOUNDS = L.latLngBounds([47.3, 5.9], [55.1, 15.0])
const NL_BOUNDS = L.latLngBounds([50.7, 3.3], [53.6, 7.2])
const BE_BOUNDS = L.latLngBounds([49.5, 2.5], [51.5, 6.4])
const JP_BOUNDS = L.latLngBounds([24.0, 122.0], [46.5, 146.5])
const SG_BOUNDS = L.latLngBounds([1.16, 103.55], [1.48, 104.06])
const KR_BOUNDS = L.latLngBounds([33.0, 124.5], [39.3, 132.2])
const FR_BOUNDS = L.latLngBounds([41.0, -5.6], [51.3, 9.8])
const ES_BOUNDS = L.latLngBounds([35.5, -10.5], [44.5, 4.5])
const NZ_BOUNDS = L.latLngBounds([-47.5, 166.0], [-34.0, 179.0])
const NO_BOUNDS = L.latLngBounds([57.7, 4.0], [71.5, 32.0])
const SE_BOUNDS = L.latLngBounds([55.2, 10.4], [69.2, 24.4])
const DK_BOUNDS = L.latLngBounds([54.3, 7.5], [57.9, 15.3])
const FI_BOUNDS = L.latLngBounds([59.4, 19.0], [70.2, 32.0])
const CH_BOUNDS = L.latLngBounds([45.7, 5.8], [47.9, 10.6])
const AE_BOUNDS = L.latLngBounds([22.6, 51.6], [26.1, 56.4])
const WORLD_BOUNDS = L.latLngBounds([-90, -180], [90, 180])

const RAMP_LIGHT = [237, 233, 254]
const RAMP_DARK = [109, 40, 217]

function lerpColor(t: number): string {
  const c = RAMP_LIGHT.map((a, i) => Math.round(a + (RAMP_DARK[i] - a) * t))
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
}

function isAustralia(properties: Record<string, unknown>): boolean {
  return properties?.ISO_A3 === "AUS" || properties?.ADM0_A3 === "AUS"
}

function isUSA(properties: Record<string, unknown>): boolean {
  return properties?.ISO_A3 === "USA" || properties?.ADM0_A3 === "USA"
}

function isCanada(properties: Record<string, unknown>): boolean {
  return properties?.ISO_A3 === "CAN" || properties?.ADM0_A3 === "CAN"
}

function isIreland(properties: Record<string, unknown>): boolean {
  return properties?.ISO_A3 === "IRL" || properties?.ADM0_A3 === "IRL"
}

function isUK(properties: Record<string, unknown>): boolean {
  return properties?.ISO_A3 === "GBR" || properties?.ADM0_A3 === "GBR"
}

function isGermany(properties: Record<string, unknown>): boolean {
  return properties?.ISO_A3 === "DEU" || properties?.ADM0_A3 === "DEU"
}

function isNetherlands(properties: Record<string, unknown>): boolean {
  return properties?.ISO_A3 === "NLD" || properties?.ADM0_A3 === "NLD"
}

function isBelgium(properties: Record<string, unknown>): boolean {
  return properties?.ISO_A3 === "BEL" || properties?.ADM0_A3 === "BEL"
}

function isJapan(properties: Record<string, unknown>): boolean {
  return properties?.ISO_A3 === "JPN" || properties?.ADM0_A3 === "JPN"
}

function isSingapore(properties: Record<string, unknown>): boolean {
  return properties?.ISO_A3 === "SGP" || properties?.ADM0_A3 === "SGP"
}

function isKorea(properties: Record<string, unknown>): boolean {
  return properties?.ISO_A3 === "KOR" || properties?.ADM0_A3 === "KOR"
}

function isFrance(properties: Record<string, unknown>): boolean {
  return properties?.ISO_A3 === "FRA" || properties?.ADM0_A3 === "FRA"
}

function isSpain(properties: Record<string, unknown>): boolean {
  return properties?.ISO_A3 === "ESP" || properties?.ADM0_A3 === "ESP"
}

function isNewZealand(properties: Record<string, unknown>): boolean {
  return properties?.ISO_A3 === "NZL" || properties?.ADM0_A3 === "NZL"
}

function isNorway(properties: Record<string, unknown>): boolean {
  return properties?.ISO_A3 === "NOR" || properties?.ADM0_A3 === "NOR"
}
function isSweden(properties: Record<string, unknown>): boolean { return properties?.ISO_A3 === "SWE" || properties?.ADM0_A3 === "SWE" }
function isDenmark(properties: Record<string, unknown>): boolean { return properties?.ISO_A3 === "DNK" || properties?.ADM0_A3 === "DNK" }
function isFinland(properties: Record<string, unknown>): boolean { return properties?.ISO_A3 === "FIN" || properties?.ADM0_A3 === "FIN" }
function isSwitzerland(properties: Record<string, unknown>): boolean { return properties?.ISO_A3 === "CHE" || properties?.ADM0_A3 === "CHE" }
function isUAE(properties: Record<string, unknown>): boolean { return properties?.ISO_A3 === "ARE" || properties?.ADM0_A3 === "ARE" }

export default function LeafletMap({
  data,
  selected,
  selectedSA4,
  activeCountry,
  selectedFranceCity,
  selectedSpainCity,
  ieSchools,
  onSelectState,
  onSelectCountry,
  onSelectSA4,
  onSelectFranceCity,
  onSelectSpainCity,
  onSelectUniversity,
  showUniversities = true,
  onReset,
  tab,
}: {
  data: MapData
  selected: string | null
  selectedSA4: SA4Region | null
  activeCountry: "AU" | "US" | "CA" | "IE" | "UK" | "DE" | "NL" | "BE" | "JP" | "SG" | "KR" | "FR" | "ES" | "NZ" | "NO" | "SE" | "DK" | "FI" | "CH" | "AE" | null
  selectedFranceCity?: string | null
  selectedSpainCity?: string | null
  ieSchools?: Array<{
    id: number; slug: string; name_en: string; name_ko: string | null;
    city: string; lat: number | null; lng: number | null;
    price_range_week: string | null; accreditation: string[] | null;
    description_ko: string | null;
  }>
  onSelectState: (s: string) => void
  onSelectCountry: (c: "AU" | "US" | "CA" | "IE" | "UK" | "DE" | "NL" | "BE" | "JP" | "SG" | "KR" | "FR" | "ES" | "NZ" | "NO" | "SE" | "DK" | "FI" | "CH" | "AE") => void
  onSelectSA4: (code: string) => void
  onSelectFranceCity?: (code: string) => void
  onSelectSpainCity?: (code: string) => void
  onSelectUniversity?: (slug: string) => void
  showUniversities?: boolean
  onReset: () => void
  tab?: string
}) {
  const t = useTranslations()
  const [krBoundaryReady, setKrBoundaryReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const auLayerRef = useRef<L.GeoJSON | null>(null)
  const usLayerRef = useRef<L.GeoJSON | null>(null)
  const caLayerRef = useRef<L.GeoJSON | null>(null)
  const worldLayerRef = useRef<L.GeoJSON | null>(null)
  const markerLayerRef = useRef<L.LayerGroup | null>(null)
  const ieMarkerLayerRef = useRef<L.LayerGroup | null>(null)
  const sgLayerRef = useRef<L.GeoJSON | null>(null)
  const krLayerRef = useRef<L.GeoJSON | null>(null)
  const frLayerRef = useRef<L.GeoJSON | null>(null)
  const frCityLayerRef = useRef<L.GeoJSON | null>(null)
  const esLayerRef = useRef<L.GeoJSON | null>(null)
  const esCityLayerRef = useRef<L.GeoJSON | null>(null)
  const nzLayerRef = useRef<L.GeoJSON | null>(null)
  const noLayerRef = useRef<L.GeoJSON | null>(null)
  const seLayerRef = useRef<L.GeoJSON | null>(null)
  const dkLayerRef = useRef<L.GeoJSON | null>(null)
  const fiLayerRef = useRef<L.GeoJSON | null>(null)
  const chLayerRef = useRef<L.GeoJSON | null>(null)
  const aeLayerRef = useRef<L.GeoJSON | null>(null)
  const aeRegionByCode = useRef<Record<string, L.Polygon>>({})
  const nzRegionByCode = useRef<Record<string, L.Polygon>>({})
  const noRegionByCode = useRef<Record<string, L.Polygon>>({})
  const seRegionByCode = useRef<Record<string, L.Polygon>>({})
  const dkRegionByCode = useRef<Record<string, L.Polygon>>({})
  const fiRegionByCode = useRef<Record<string, L.Polygon>>({})
  const chRegionByCode = useRef<Record<string, L.Polygon>>({})
  const layersByCode = useRef<Partial<Record<StateCode, L.Polygon>>>({})
  const ieLayerRef = useRef<L.GeoJSON | null>(null)
  const ieCountyByCode = useRef<Record<string, L.Polygon>>({})
  const ukLayerRef = useRef<L.GeoJSON | null>(null)
  const ukRegionByCode = useRef<Record<string, L.Polygon>>({})
  const deLayerRef = useRef<L.GeoJSON | null>(null)
  const deRegionByCode = useRef<Record<string, L.Polygon>>({})
    const nlLayerRef = useRef<L.GeoJSON | null>(null)
    const nlRegionByCode = useRef<Record<string, L.Polygon>>({})
    const beLayerRef = useRef<L.GeoJSON | null>(null)
    const beRegionByCode = useRef<Record<string, L.Polygon>>({})
    const jpLayerRef = useRef<L.GeoJSON | null>(null)
    const jpRegionByCode = useRef<Record<string, L.Polygon>>({})
  const krRegionByCode = useRef<Record<string, L.Polygon>>({})
  const frRegionByCode = useRef<Record<string, L.Polygon>>({})
  const esRegionByCode = useRef<Record<string, L.Polygon>>({})
  // SA4(지역) 드릴다운: 전체 지오메트리는 한 번만 로드(sa4GeoRef)하고, 선택된 주의 지역만
  // sa4Layer 로 렌더한다. sa4ByCode 로 선택 지역 bounds 를 찾아 줌인한다.
  const sa4GeoRef = useRef<GeoJSON.FeatureCollection | null>(null)
  const sa4LayerRef = useRef<L.GeoJSON | null>(null)
  const sa4ByCode = useRef<Record<string, L.Polygon>>({})
  const selectedRef = useRef<string | null>(selected)
  const selectedSA4Ref = useRef<SA4Region | null>(selectedSA4)
  const activeCountryRef = useRef(activeCountry)
  const tabRef = useRef(tab)
  const didFitRef = useRef(false)
  const onSelectStateRef = useRef(onSelectState)
  const onSelectCountryRef = useRef(onSelectCountry)
  const onSelectSA4Ref = useRef(onSelectSA4)
  const onSelectFranceCityRef = useRef(onSelectFranceCity)
  const onSelectSpainCityRef = useRef(onSelectSpainCity)
  const onSelectUniversityRef = useRef(onSelectUniversity)
  // Keep async GeoJSON loaders aligned with the latest render. Updating this
  // during render prevents an initial AU effect from repainting over a deep
  // link such as /map?country=fi.
  activeCountryRef.current = activeCountry
  onSelectStateRef.current = onSelectState
  onSelectCountryRef.current = onSelectCountry
  onSelectSA4Ref.current = onSelectSA4
  onSelectFranceCityRef.current = onSelectFranceCity
  onSelectSpainCityRef.current = onSelectSpainCity
  onSelectUniversityRef.current = onSelectUniversity
  tabRef.current = tab

  const dataRef = useRef(data)
  dataRef.current = data

  const ieSchoolsRef = useRef(ieSchools)
  ieSchoolsRef.current = ieSchools

  // Keep the world overview visible until the selected country's detailed
  // boundary has finished loading. Country GeoJSON files resolve independently
  // of React's country switch, so hiding the overview unconditionally creates
  // a blank country (most noticeable for the larger CA and FR bundles).
  const refreshWorldCountryStyle = () => {
    const worldLayer = worldLayerRef.current
    if (!worldLayer) return

    const country = activeCountryRef.current
    worldLayer.setStyle((feature) => {
      const props = feature?.properties as Record<string, unknown> | undefined
      if (!props) return {}
      const isAU = isAustralia(props)
      const isUS = isUSA(props)
      const isCA = isCanada(props)
      const isIE = isIreland(props)
      const isGB = isUK(props)
      const isDE = isGermany(props)
      const isNL = isNetherlands(props)
      const isBE = isBelgium(props)
      const isJP = isJapan(props)
      const isSG = isSingapore(props)
      const isKR = isKorea(props)
      const isFR = isFrance(props)
      const isES = isSpain(props)
      const isNZ = isNewZealand(props)
      const isNO = isNorway(props)
      const isSE = isSweden(props)
      const isDK = isDenmark(props)
      const isFI = isFinland(props)
      const isCH = isSwitzerland(props)
      const isAE = isUAE(props)
      const hide = (country === "AU" && isAU && auLayerRef.current != null)
        || (country === "US" && isUS && usLayerRef.current != null)
        || (country === "CA" && isCA && caLayerRef.current != null)
        || (country === "IE" && isIE && ieLayerRef.current != null)
        || (country === "UK" && isGB && ukLayerRef.current != null)
        || (country === "DE" && isDE && deLayerRef.current != null)
        || (country === "NL" && isNL && nlLayerRef.current != null)
        || (country === "BE" && isBE && beLayerRef.current != null)
        || (country === "JP" && isJP && jpLayerRef.current != null)
        || (country === "SG" && isSG && sgLayerRef.current != null)
        || (country === "KR" && isKR && krLayerRef.current != null)
        || (country === "FR" && isFR && frLayerRef.current != null)
        || (country === "ES" && isES && esLayerRef.current != null)
        || (country === "NZ" && isNZ && nzLayerRef.current != null)
        || (country === "NO" && isNO && noLayerRef.current != null)
        || (country === "SE" && isSE && seLayerRef.current != null)
        || (country === "DK" && isDK && dkLayerRef.current != null)
        || (country === "FI" && isFI && fiLayerRef.current != null)
        || (country === "CH" && isCH && chLayerRef.current != null)
        || (country === "AE" && isAE && aeLayerRef.current != null)
      if (hide) return { opacity: 0, fillOpacity: 0, weight: 0 }
      if (isAU) return { fillColor: "#e0e7ff", color: "#6366f1", weight: 2, fillOpacity: 0.5 }
      if (isUS) return { fillColor: "#dcfce7", color: "#22c55e", weight: 2, fillOpacity: 0.5 }
      if (isCA) return { fillColor: "#fce7f3", color: "#ec4899", weight: 2, fillOpacity: 0.5 }
      if (isIE) return { fillColor: "#fef3c7", color: "#f59e0b", weight: 2, fillOpacity: 0.5 }
      if (isGB) return { fillColor: "#dbeafe", color: "#3b82f6", weight: 2, fillOpacity: 0.5 }
      if (isDE) return { fillColor: "#bbf7d0", color: "#22c55e", weight: 2, fillOpacity: 0.4 }
      if (isNL) return { fillColor: "#fce7f3", color: "#d946ef", weight: 2, fillOpacity: 0.4 }
      if (isBE) return { fillColor: "#fef9c3", color: "#eab308", weight: 2, fillOpacity: 0.5 }
      if (isJP) return { fillColor: "#fee2e2", color: "#ef4444", weight: 2, fillOpacity: 0.5 }
      if (isSG) return { fillColor: "#ccfbf1", color: "#0f766e", weight: 2, fillOpacity: 0.7 }
      if (isKR) return { fillColor: "#ffe4e6", color: "#e11d48", weight: 2, fillOpacity: 0.55 }
      if (isFR) return { fillColor: "#dbeafe", color: "#2563eb", weight: 2, fillOpacity: 0.55 }
      if (isES) return { fillColor: "#ffedd5", color: "#ea580c", weight: 2, fillOpacity: 0.55 }
      if (isNZ) return { fillColor: "#dbeafe", color: "#1d4ed8", weight: 2, fillOpacity: 0.55 }
      if (isNO) return { fillColor: "#ede9fe", color: "#6d28d9", weight: 2, fillOpacity: 0.55 }
      if (isSE) return { fillColor: "#ccfbf1", color: "#0f766e", weight: 2, fillOpacity: 0.55 }
      if (isDK) return { fillColor: "#fef3c7", color: "#b45309", weight: 2, fillOpacity: 0.55 }
      if (isFI) return { fillColor: "#e0f2fe", color: "#0369a1", weight: 2, fillOpacity: 0.55 }
      if (isCH) return { fillColor: "#fce7f3", color: "#be185d", weight: 2, fillOpacity: 0.55 }
      if (isAE) return { fillColor: "#fef3c7", color: "#d97706", weight: 2, fillOpacity: 0.55 }
      return { fillColor: "#f8fafc", color: "#cbd5e1", weight: 0.8, fillOpacity: 0.6 }
    })
  }

  const counts = STATE_CODES.map((c) => data.shortageByState[c]?.length ?? 0)
  const minCount = Math.min(...counts)
  const maxCount = Math.max(...counts)

  function colorFor(code: StateCode): string {
    const n = dataRef.current.shortageByState[code]?.length ?? 0
    const t = maxCount === minCount ? 0.6 : (n - minCount) / (maxCount - minCount)
    return lerpColor(t)
  }

  function styleFor(code: StateCode): L.PathOptions {
    const sel = selectedRef.current
    const isSel = sel === code
    const isWhv = sel === "WHV"
    return {
      fillColor: colorFor(code),
      fillOpacity: isSel ? 0.95 : isWhv ? 0.5 : 0.8,
      color: isSel ? "#1e293b" : isWhv ? "#94a3b8" : "#ffffff",
      weight: isSel ? 3 : isWhv ? 1 : 1,
    }
  }

  const UNIV_PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 30">
  <ellipse cx="11" cy="29" rx="5" ry="1.5" fill="rgba(0,0,0,0.1)"/>
  <path d="M11 2C5.5 2 2 5.8 2 11c0 6.5 9 16 9 16s9-9.5 9-16C20 5.8 16.5 2 11 2z" fill="#7c3aed" stroke="#fff" stroke-width="1.8"/>
  <g transform="translate(2.5, 2) scale(0.7)">
    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" fill="#fff" stroke="#475569" stroke-width="1.5" stroke-linejoin="round"/>
  </g>
</svg>`

  // Leaflet divIcon class override — injected once
  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = ".univ-pin-icon { background: transparent !important; border: none !important; }"
    document.head.appendChild(style)
    return () => { style.remove() }
  }, [])

  function buildMarkers(country: "US" | "AU" | "CA" | "UK" | "DE" | "NL" | "KR" | "FR" | "NZ" | "NO" | "SE" | "DK" | "FI" | "CH"): L.LayerGroup {
    const group = L.layerGroup()
    const colleges = country === "AU"
      ? dataRef.current.auRankedColleges
      : country === "CA"
      ? dataRef.current.caColleges
      : country === "UK"
      ? dataRef.current.ukColleges
      : country === "DE"
      ? dataRef.current.deColleges
      : country === "NL"
      ? dataRef.current.nlColleges
      : country === "KR"
      ? dataRef.current.krUniversities.map((university) => ({ college_name: university.nameEn, lat: university.lat, lng: university.lng, slug: university.slug }))
      : country === "FR"
      ? dataRef.current.frUniversities.map((university) => ({ college_name: university.nameFr, lat: university.lat, lng: university.lng, slug: university.slug }))
      : country === "NZ"
      ? dataRef.current.nzUniversities.map((u) => ({ college_name: u.nameEn, lat: u.lat, lng: u.lng, slug: u.slug }))
      : country === "NO"
      ? dataRef.current.noUniversities.map((u) => ({ college_name: u.nameEn, lat: u.lat, lng: u.lng, slug: u.slug }))
      : country === "SE"
      ? dataRef.current.seUniversities.map((u) => ({ college_name: u.nameEn, lat: u.lat, lng: u.lng, slug: u.slug }))
      : country === "DK"
      ? dataRef.current.dkUniversities.map((u) => ({ college_name: u.nameEn, lat: u.lat, lng: u.lng, slug: u.slug }))
      : country === "FI"
      ? dataRef.current.fiUniversities.map((u) => ({ college_name: u.nameEn, lat: u.lat, lng: u.lng, slug: u.slug }))
      : country === "CH"
      ? dataRef.current.chUniversities.map((u) => ({ college_name: u.nameEn, lat: u.lat, lng: u.lng, slug: u.slug }))
      : dataRef.current.usRankedColleges
    const placed: Array<{ key: string; slug: string }> = []
    for (const c of colleges) {
      if (c.lat === 0 && c.lng === 0) continue
      const key = `${c.lat.toFixed(3)},${c.lng.toFixed(3)}`
      const sameLoc = placed.filter((p) => p.key === key)
      const offset = sameLoc.length * 0.006
      const lat = c.lat + offset
      const lng = c.lng + (sameLoc.length % 2 === 0 ? offset : -offset)
      const icon = L.divIcon({
        className: "univ-pin-icon",
        html: UNIV_PIN_SVG,
        iconSize: [22, 30],
        iconAnchor: [11, 28],
      })
      const marker = L.marker([lat, lng], { icon })
      const tooltipText = `${c.college_name}`
      marker.bindTooltip(tooltipText, {
        sticky: true,
        direction: "top",
        className: "!rounded-md !border-0 !bg-slate-900 !px-2 !py-1 !text-xs !text-white !shadow-md",
      })
      marker.on("click", () => onSelectUniversityRef.current?.(c.slug))
      placed.push({ key, slug: c.slug })
      group.addLayer(marker)
    }
    return group
  }

  function updateMarkers() {
    const map = mapRef.current
    if (!map) return
    if (markerLayerRef.current) {
      map.removeLayer(markerLayerRef.current)
      markerLayerRef.current = null
    }
    if (!showUniversities) return
    if (activeCountryRef.current === "US" && map.getZoom() >= 5) {
      const group = buildMarkers("US")
      group.addTo(map)
      markerLayerRef.current = group
    }
    if (activeCountryRef.current === "AU" && map.getZoom() >= 5) {
      const group = buildMarkers("AU")
      group.addTo(map)
      markerLayerRef.current = group
    }
    if (activeCountryRef.current === "CA" && map.getZoom() >= 5) {
      const group = buildMarkers("CA")
      group.addTo(map)
      markerLayerRef.current = group
    }
    if (activeCountryRef.current === "UK" && map.getZoom() >= 6) {
      const group = buildMarkers("UK")
      group.addTo(map)
      markerLayerRef.current = group
    }
    if (activeCountryRef.current === "DE" && map.getZoom() >= 6) {
      const group = buildMarkers("DE")
      group.addTo(map)
      markerLayerRef.current = group
    }
    if (activeCountryRef.current === "NL" && map.getZoom() >= 7) {
      const group = buildMarkers("NL")
      group.addTo(map)
      markerLayerRef.current = group
    }
    if (activeCountryRef.current === "KR" && map.getZoom() >= 6) {
      const group = buildMarkers("KR")
      group.addTo(map)
      markerLayerRef.current = group
    }
    if (activeCountryRef.current === "FR" && map.getZoom() >= 6) {
      const group = buildMarkers("FR")
      group.addTo(map)
      markerLayerRef.current = group
    }
    if (activeCountryRef.current === "NZ" && map.getZoom() >= 5) {
      const group = buildMarkers("NZ")
      group.addTo(map)
      markerLayerRef.current = group
    }
    if (activeCountryRef.current === "NO" && map.getZoom() >= 5) {
      const group = buildMarkers("NO")
      group.addTo(map)
      markerLayerRef.current = group
    }
    if (activeCountryRef.current === "SE" && map.getZoom() >= 5) { const group = buildMarkers("SE"); group.addTo(map); markerLayerRef.current = group }
    if (activeCountryRef.current === "DK" && map.getZoom() >= 6) { const group = buildMarkers("DK"); group.addTo(map); markerLayerRef.current = group }
    if (activeCountryRef.current === "FI" && map.getZoom() >= 5) { const group = buildMarkers("FI"); group.addTo(map); markerLayerRef.current = group }
    // Switzerland is fitted with maxZoom 6. Keeping this threshold at 5 makes
    // accredited-institution pins available as soon as the canton map opens,
    // rather than requiring an unreachable zoom level.
    if (activeCountryRef.current === "CH" && map.getZoom() >= 5) { const group = buildMarkers("CH"); group.addTo(map); markerLayerRef.current = group }
  }

  function buildIEMarkers(): L.LayerGroup {
    const group = L.layerGroup()
    const schools = ieSchoolsRef.current ?? []
    const countyCode = selectedRef.current
    const filtered = countyCode
      ? schools.filter((s) => s.city && IE_CITY_TO_COUNTY[s.city] === countyCode)
      : schools
    for (const s of filtered) {
      if (s.lat == null || s.lng == null) continue
      const marker = L.circleMarker([s.lat, s.lng], {
        radius: 6,
        fillColor: "#f59e0b",
        fillOpacity: 0.8,
        color: "#ffffff",
        weight: 1.5,
      })
      marker.bindTooltip(s.name_en, {
        sticky: true,
        direction: "top",
        className: "!rounded-md !border-0 !bg-slate-900 !px-2 !py-1 !text-xs !text-white !shadow-md",
      })
      marker.bindPopup(
        `<div class="text-sm leading-relaxed">${s.name_en}${s.name_ko ? `<br>${s.name_ko}` : ""}<br>${s.city}${s.price_range_week ? ` · ${s.price_range_week}` : ""}</div>`,
      )
      group.addLayer(marker)
    }
    return group
  }

  function updateIEMarkers() {
    const map = mapRef.current
    if (!map) return
    if (ieMarkerLayerRef.current) {
      map.removeLayer(ieMarkerLayerRef.current)
      ieMarkerLayerRef.current = null
    }
    if (activeCountryRef.current === "IE" && selectedRef.current) {
      const group = buildIEMarkers()
      group.addTo(map)
      ieMarkerLayerRef.current = group
    }
  }

  // 컨테이너가 아직 0폭(레이아웃 전)이면 leaflet 의 zoom 계산이 NaN LatLng 를 만들어
  // flyToBounds/fitBounds 가 throw 한다. 그래서 모든 bounds 이동은 이 가드를 통과시킨다.
  // (딥링크로 selected 가 마운트 직후 null→NSW 로 바뀔 때 특히 중요 — 초기 fit 도 line 376
  // 에서 같은 clientWidth>0 조건을 본다.)
  function safeBounds(bounds: L.LatLngBoundsExpression): L.LatLngBounds | null {
    const container = containerRef.current
    if (!mapRef.current || !container || container.clientWidth === 0) return null
    const b = L.latLngBounds(bounds as L.LatLngBoundsLiteral)
    return b.isValid() ? b : null
  }

  function fitToBounds(bounds: L.LatLngBoundsExpression, animate: boolean) {
    const map = mapRef.current
    const b = safeBounds(bounds)
    if (!map || !b) return
    if (animate) map.flyToBounds(b, { padding: [30, 30], maxZoom: 6, duration: 0.6 })
    else map.fitBounds(b, { padding: [20, 20], maxZoom: 6 })
  }

  function sa4StyleFor(code: string): L.PathOptions {
    const isSel = selectedSA4Ref.current?.code === code
    if (tabRef.current === "whv") {
      const whv = WHV_REGIONS[code]
      if (!whv || whv.category === "none") {
        return {
          fillColor: "#94a3b8",
          fillOpacity: 0.12,
          color: "#cbd5e1",
          weight: 0.5,
        }
      }
      const fillColor = whv.category === "eligible" ? lerpColor(1.0) : lerpColor(0.45)
      return {
        fillColor,
        fillOpacity: isSel ? 0.55 : 0.30,
        color: isSel ? "#1e293b" : "#ffffff",
        weight: isSel ? 2.5 : 1,
      }
    }
    return {
      fillColor: "#7c3aed",
      fillOpacity: isSel ? 0.45 : 0.08,
      color: isSel ? "#4c1d95" : "#ffffff",
      weight: isSel ? 2.5 : 1,
    }
  }

  // 선택된 주의 SA4 지역만 주 폴리곤 위(sa4Pane)에 렌더한다.
  // "WHV"(Second Visa) 모드면 모든 주의 SA4를 한꺼번에 렌더한다.
  function renderSA4() {
    const map = mapRef.current
    if (!map) return
    if (sa4LayerRef.current) {
      map.removeLayer(sa4LayerRef.current)
      sa4LayerRef.current = null
    }
    sa4ByCode.current = {}
    const stateCode = selectedRef.current
    if (activeCountryRef.current !== "AU" || !stateCode || !sa4GeoRef.current) return

    const isWHVMode = stateCode === "WHV"
    const fc: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: isWHVMode
        ? sa4GeoRef.current.features
        : sa4GeoRef.current.features.filter(
            (f) => f.properties?.STATE_CODE === stateCode,
          ),
    }
    const layer = L.geoJSON(fc, {
      pane: "sa4Pane",
      style: (feature) => sa4StyleFor(feature?.properties?.SA4_CODE as string),
      onEachFeature: (feature, lyr) => {
        const code = feature?.properties?.SA4_CODE as string
        if (!code) return
        sa4ByCode.current[code] = lyr as L.Polygon
        const isWhvNone = tabRef.current === "whv" && WHV_REGIONS[code]?.category === "none"
        if (!isWhvNone) {
          lyr.bindTooltip(SA4_NAME_BY_CODE[code] ?? code, {
            sticky: true,
            direction: "top",
            className: "!rounded-md !border-0 !bg-slate-900 !px-2 !py-1 !text-xs !text-white !shadow-md",
          })
        }
        lyr.on({
          click: () => {
            if (isWhvNone) return
            onSelectSA4Ref.current(code)
          },
          mouseover: () => {
            if (isWhvNone) return
            if (selectedSA4Ref.current?.code !== code) (lyr as L.Path).setStyle(sa4StyleFor(code))
          },
          mouseout: () => {
            if (isWhvNone) return
            if (selectedSA4Ref.current?.code !== code) (lyr as L.Path).setStyle(sa4StyleFor(code))
          },
        })
      },
    })
    sa4LayerRef.current = layer
    map.addLayer(layer)

    layer.eachLayer((l) => {
      const el = (l as L.Path).getElement() as SVGElement | null
      const code = (l as L.GeoJSON & { feature?: GeoJSON.Feature }).feature?.properties
        ?.SA4_CODE as string | undefined
      if (!el || !code) return
      if (tabRef.current === "whv" && WHV_REGIONS[code]?.category === "none") return
      el.setAttribute("tabindex", "0")
      el.setAttribute("role", "button")
      el.setAttribute("aria-label", SA4_NAME_BY_CODE[code] ?? code)
      el.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelectSA4Ref.current(code)
        }
      })
    })
  }

  // Init map, load all GeoJSON layers
  useEffect(() => {
    const container = containerRef.current
    if (!container || mapRef.current) return
    const map = L.map(container, {
      attributionControl: false,
      zoomControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      minZoom: 2,
      maxZoom: 10,
      maxBounds: WORLD_BOUNDS.pad(0.3),
      maxBoundsViscosity: 0.8,
    })
    const zoomControl = L.control.zoom({ position: "bottomright" }).addTo(map)
    zoomControl.getContainer()?.classList.add("campcareer-map-zoom")
    mapRef.current = map
    map.fitBounds(WORLD_BOUNDS)

    // 월드(국가) 레이어를 주(state) 레이어보다 항상 아래에 그리도록 전용 pane 을 둔다.
    // 두 GeoJSON 은 독립 fetch 로 로드되는데, 큰 world-countries.geojson 이 나중에
    // 끝나면 호주 폴리곤이 주 위에 깔려 첫 클릭이 "국가 선택"으로 새던 버그를 막는다.
    // (overlayPane 기본 zIndex=400 → basePane 350 으로 낮춘다.)
    map.createPane("basePane")
    const basePane = map.getPane("basePane")
    if (basePane) basePane.style.zIndex = "350"

    // SA4(지역) 레이어는 주 폴리곤(overlayPane 400) 위에 올린다.
    map.createPane("sa4Pane")
    const sa4Pane = map.getPane("sa4Pane")
    if (sa4Pane) sa4Pane.style.zIndex = "401"

    const ro = new ResizeObserver(() => {
      if (mapRef.current !== map) return
      map.invalidateSize()
      if (!didFitRef.current && container.clientWidth > 0) {
        if (activeCountryRef.current === "AU") map.fitBounds(AU_BOUNDS)
        else if (activeCountryRef.current === "US") map.fitBounds(US_BOUNDS)
        else if (activeCountryRef.current === "CA") map.fitBounds(CA_BOUNDS)
        else if (activeCountryRef.current === "IE") map.fitBounds(IE_BOUNDS)
        else if (activeCountryRef.current === "UK") map.fitBounds(UK_BOUNDS)
        else if (activeCountryRef.current === "DE") map.fitBounds(DE_BOUNDS)
        else if (activeCountryRef.current === "NL") map.fitBounds(NL_BOUNDS)
        else if (activeCountryRef.current === "BE") map.fitBounds(BE_BOUNDS)
        else if (activeCountryRef.current === "JP") map.fitBounds(JP_BOUNDS)
        else if (activeCountryRef.current === "SG") map.fitBounds(SG_BOUNDS)
        else if (activeCountryRef.current === "KR") map.fitBounds(KR_BOUNDS)
        else if (activeCountryRef.current === "FR") map.fitBounds(FR_BOUNDS)
        else if (activeCountryRef.current === "ES") map.fitBounds(ES_BOUNDS)
        else if (activeCountryRef.current === "NZ") map.fitBounds(NZ_BOUNDS)
        else if (activeCountryRef.current === "NO") map.fitBounds(NO_BOUNDS)
        else if (activeCountryRef.current === "SE") map.fitBounds(SE_BOUNDS)
        else if (activeCountryRef.current === "DK") map.fitBounds(DK_BOUNDS)
        else if (activeCountryRef.current === "FI") map.fitBounds(FI_BOUNDS)
        else if (activeCountryRef.current === "CH") map.fitBounds(CH_BOUNDS)
        else map.fitBounds(WORLD_BOUNDS)
        didFitRef.current = true
      }
    })
    ro.observe(container)

    // Zoom change → update marker visibility
    map.on("zoomend", () => {
      const c = activeCountryRef.current
      if (c === "US" || c === "AU" || c === "CA" || c === "UK" || c === "DE" || c === "NL" || c === "KR" || c === "FR" || c === "ES" || c === "NZ" || c === "NO" || c === "SE" || c === "DK" || c === "FI" || c === "CH") updateMarkers()
    })

    // World countries layer
    fetch("/world-countries.geojson")
      .then((r) => r.json())
      .then((geo: GeoJSON.FeatureCollection) => {
        if (mapRef.current !== map) return
        const worldLayer = L.geoJSON(metropolitanFranceOnly(geo), {
          pane: "basePane",
          style: (feature) => {
            if (feature && isAustralia(feature.properties as Record<string, unknown>)) {
              return { fillColor: "#e0e7ff", color: "#6366f1", weight: 2, fillOpacity: 0.5 }
            }
            if (feature && isUSA(feature.properties as Record<string, unknown>)) {
              return { fillColor: "#dcfce7", color: "#22c55e", weight: 2, fillOpacity: 0.5 }
            }
            if (feature && isCanada(feature.properties as Record<string, unknown>)) {
              return { fillColor: "#fce7f3", color: "#ec4899", weight: 2, fillOpacity: 0.5 }
            }
            if (feature && isIreland(feature.properties as Record<string, unknown>)) {
              return { fillColor: "#fef3c7", color: "#f59e0b", weight: 2, fillOpacity: 0.5 }
            }
            if (feature && isUK(feature.properties as Record<string, unknown>)) {
              return { fillColor: "#dbeafe", color: "#3b82f6", weight: 2, fillOpacity: 0.5 }
            }
            if (feature && isBelgium(feature.properties as Record<string, unknown>)) {
              return { fillColor: "#fef9c3", color: "#eab308", weight: 2, fillOpacity: 0.5 }
            }
            if (feature && isJapan(feature.properties as Record<string, unknown>)) {
              return { fillColor: "#fee2e2", color: "#ef4444", weight: 2, fillOpacity: 0.5 }
            }
            if (feature && isSingapore(feature.properties as Record<string, unknown>)) {
              return { fillColor: "#ccfbf1", color: "#0f766e", weight: 2, fillOpacity: 0.7 }
            }
            if (feature && isFrance(feature.properties as Record<string, unknown>)) {
              return { fillColor: "#dbeafe", color: "#2563eb", weight: 2, fillOpacity: 0.55 }
            }
            if (feature && isSpain(feature.properties as Record<string, unknown>)) {
              return { fillColor: "#ffedd5", color: "#ea580c", weight: 2, fillOpacity: 0.55 }
            }
            if (feature && isNorway(feature.properties as Record<string, unknown>)) {
              return { fillColor: "#ede9fe", color: "#6d28d9", weight: 2, fillOpacity: 0.55 }
            }
            if (feature && isSweden(feature.properties as Record<string, unknown>)) {
              return { fillColor: "#ccfbf1", color: "#0f766e", weight: 2, fillOpacity: 0.55 }
            }
            if (feature && isDenmark(feature.properties as Record<string, unknown>)) {
              return { fillColor: "#fef3c7", color: "#b45309", weight: 2, fillOpacity: 0.55 }
            }
            if (feature && isFinland(feature.properties as Record<string, unknown>)) {
              return { fillColor: "#e0f2fe", color: "#0369a1", weight: 2, fillOpacity: 0.55 }
            }
            if (feature && isSwitzerland(feature.properties as Record<string, unknown>)) {
              return { fillColor: "#fce7f3", color: "#be185d", weight: 2, fillOpacity: 0.55 }
            }
            if (feature && isUAE(feature.properties as Record<string, unknown>)) {
              return { fillColor: "#fef3c7", color: "#d97706", weight: 2, fillOpacity: 0.55 }
            }
            return { fillColor: "#f8fafc", color: "#cbd5e1", weight: 0.8, fillOpacity: 0.6 }
          },
          onEachFeature: (feature, lyr) => {
            const props = feature.properties as Record<string, unknown>
            const isAU = isAustralia(props)
            const isUS = isUSA(props)
            const isCA = isCanada(props)
            const isIE = isIreland(props)
            const isGB = isUK(props)
            const isDE = isGermany(props)
            const isNL = isNetherlands(props)
            const isBE = isBelgium(props)
            const isJP = isJapan(props)
            const isSG = isSingapore(props)
            const isKR = isKorea(props)
            const isFR = isFrance(props)
            const isES = isSpain(props)
            const isNZ = isNewZealand(props)
            const isNO = isNorway(props)
            const isSE = isSweden(props)
            const isDK = isDenmark(props)
            const isFI = isFinland(props)
            const isCH = isSwitzerland(props)
            const isAE = isUAE(props)
            if (!isAU && !isUS && !isCA && !isIE && !isGB && !isDE && !isNL && !isBE && !isJP && !isSG && !isKR && !isFR && !isES && !isNZ && !isNO && !isSE && !isDK && !isFI && !isCH && !isAE) return

            const country = isAU ? "AU" : isUS ? "US" : isCA ? "CA" : isIE ? "IE" : isGB ? "UK" : isDE ? "DE" : isNL ? "NL" : isBE ? "BE" : isJP ? "JP" : isSG ? "SG" : isKR ? "KR" : isFR ? "FR" : isES ? "ES" : isNZ ? "NZ" : isNO ? "NO" : isSE ? "SE" : isDK ? "DK" : isFI ? "FI" : isAE ? "AE" : "CH"
            const name = isAU ? "Australia" : isUS ? "United States" : isCA ? "Canada" : isIE ? "Ireland" : isGB ? "United Kingdom" : isDE ? "Germany" : isNL ? "Netherlands" : isBE ? "Belgium" : isJP ? "Japan" : isSG ? "Singapore" : isKR ? "South Korea" : isFR ? "France" : isES ? "Spain" : isNZ ? "New Zealand" : isNO ? "Norway" : isSE ? "Sweden" : isDK ? "Denmark" : isFI ? "Finland" : isAE ? "United Arab Emirates" : "Switzerland"
            lyr.bindTooltip(name, {
              sticky: true,
              direction: "top",
              className: "!rounded-md !border-0 !bg-slate-900 !px-2 !py-1 !text-xs !text-white !shadow-md",
            })
            lyr.on({
              click: () => onSelectCountryRef.current(country),
              mouseover: () => (lyr as L.Path).setStyle({ weight: 3, fillOpacity: 0.7 }),
              mouseout: () => {
                const baseStyle = isAU
                  ? { fillColor: "#e0e7ff", color: "#6366f1", weight: 2, fillOpacity: 0.5 }
                  : isIE
                    ? { fillColor: "#fef3c7", color: "#f59e0b", weight: 2, fillOpacity: 0.5 }
                    : isGB
                      ? { fillColor: "#dbeafe", color: "#3b82f6", weight: 2, fillOpacity: 0.5 }
                      : isDE
                        ? { fillColor: "#bbf7d0", color: "#22c55e", weight: 2, fillOpacity: 0.4 }
                        : isNL
                          ? { fillColor: "#fce7f3", color: "#d946ef", weight: 2, fillOpacity: 0.4 }
                          : isBE
                            ? { fillColor: "#fef9c3", color: "#eab308", weight: 2, fillOpacity: 0.5 }
                            : isJP
                              ? { fillColor: "#fee2e2", color: "#ef4444", weight: 2, fillOpacity: 0.5 }
                              : isSG
                                ? { fillColor: "#ccfbf1", color: "#0f766e", weight: 2, fillOpacity: 0.7 }
                                : isFR
                                  ? { fillColor: "#dbeafe", color: "#2563eb", weight: 2, fillOpacity: 0.55 }
                                  : isES
                                    ? { fillColor: "#ffedd5", color: "#ea580c", weight: 2, fillOpacity: 0.55 }
                                    : isNZ
                                      ? { fillColor: "#dbeafe", color: "#1d4ed8", weight: 2, fillOpacity: 0.55 }
                                    : isNO
                                      ? { fillColor: "#ede9fe", color: "#6d28d9", weight: 2, fillOpacity: 0.55 }
                                      : isSE
                                        ? { fillColor: "#ccfbf1", color: "#0f766e", weight: 2, fillOpacity: 0.55 }
                                        : isDK
                                          ? { fillColor: "#fef3c7", color: "#b45309", weight: 2, fillOpacity: 0.55 }
                                          : isFI
                                            ? { fillColor: "#e0f2fe", color: "#0369a1", weight: 2, fillOpacity: 0.55 }
                                            : isCH
                                              ? { fillColor: "#fce7f3", color: "#be185d", weight: 2, fillOpacity: 0.55 }
                                              : isAE
                                                ? { fillColor: "#fef3c7", color: "#d97706", weight: 2, fillOpacity: 0.55 }
                                            : isCA
                                              ? { fillColor: "#fce7f3", color: "#ec4899", weight: 2, fillOpacity: 0.5 }
                                : { fillColor: "#dcfce7", color: "#22c55e", weight: 2, fillOpacity: 0.5 }
                ;(lyr as L.Path).setStyle(baseStyle)
              },
            })
            const el = (lyr as L.Path).getElement() as SVGElement | null
            if (el) {
              el.setAttribute("tabindex", "0")
              el.setAttribute("role", "button")
              el.setAttribute("aria-label", name)
              el.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onSelectCountryRef.current(country)
                }
              })
            }
          },
        }).addTo(map)
        worldLayerRef.current = worldLayer
        refreshWorldCountryStyle()
      })
      .catch((err) => console.error("[LeafletMap] world geojson load failed:", err))

    // AU states layer
    fetch("/au-states.geojson")
      .then((r) => r.json())
      .then((geo: GeoJSON.FeatureCollection) => {
        if (mapRef.current !== map) return
        const auLayer = L.geoJSON(geo, {
          style: (feature) => styleFor(feature?.properties?.STATE_CODE as StateCode),
          onEachFeature: (feature, lyr) => {
            const code = feature?.properties?.STATE_CODE as StateCode
            layersByCode.current[code] = lyr as L.Polygon
            const count = dataRef.current.shortageByState[code]?.length ?? 0
            lyr.bindTooltip(`${STATE_NAMES[code]} · ${count}`, {
              sticky: true,
              direction: "top",
              className: "!rounded-md !border-0 !bg-slate-900 !px-2 !py-1 !text-xs !text-white !shadow-md",
            })
            lyr.on({
              click: () => {
                if (selectedRef.current === "WHV") return
                onSelectStateRef.current(code)
              },
              mouseover: () => {
                if (selectedRef.current === "WHV") return
                if (selectedRef.current !== code) (lyr as L.Path).setStyle({ weight: 2, fillOpacity: 0.95 })
              },
              mouseout: () => {
                if (selectedRef.current === "WHV") return
                if (selectedRef.current !== code) (lyr as L.Path).setStyle(styleFor(code))
              },
            })
          },
        })
        auLayerRef.current = auLayer

        if (activeCountryRef.current === "AU") {
          map.addLayer(auLayer)
          if (!didFitRef.current && container.clientWidth > 0) {
            // 딥링크(?state=NSW)로 이미 주가 선택돼 있으면 그 주로, 아니면 호주 전체로 맞춘다.
            const sel = selectedRef.current
            const selLyr = sel ? layersByCode.current[sel as StateCode] : undefined
            fitToBounds(selLyr ? selLyr.getBounds() : AU_BOUNDS, false)
            didFitRef.current = true
          }
        }

        auLayer.eachLayer((l) => {
          const path = (l as L.Path).getElement() as SVGElement | null
          const code = (l as L.GeoJSON & { feature?: GeoJSON.Feature }).feature?.properties
            ?.STATE_CODE as StateCode | undefined
          if (!path || !code) return
          if (selectedRef.current !== "WHV") {
            path.setAttribute("tabindex", "0")
            path.setAttribute("role", "button")
            path.setAttribute("aria-label", STATE_NAMES[code])
          }
          path.addEventListener("keydown", (e: KeyboardEvent) => {
            if (selectedRef.current === "WHV") return
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              onSelectStateRef.current(code)
            }
          })
        })
      })
      .catch((err) => console.error("[LeafletMap] au geojson load failed:", err))

    // US states layer
    fetch("/us-states.geojson")
      .then((r) => r.json())
      .then((geo: GeoJSON.FeatureCollection) => {
        if (mapRef.current !== map) return
        const usLayer = L.geoJSON(geo, {
          style: (feature) => {
            const postal = feature?.properties?.postal as string | undefined
            const isSel = selectedRef.current === postal
            const ratio = postal ? dataRef.current.usStateInfo?.[postal]?.rentIncomeRatio ?? null : null
            const fillColor = ratio != null
              ? ratio > 0.30 ? "#fecaca"
                : ratio > 0.22 ? "#fed7aa"
                : "#bbf7d0"
              : "#e0f2fe"
            return {
              fillColor,
              fillOpacity: isSel ? 0.8 : 0.5,
              color: isSel ? "#1e293b" : "#475569",
              weight: isSel ? 3 : 1,
            }
          },
          onEachFeature: (feature, lyr) => {
            const postal = feature?.properties?.postal as string | undefined
            const name = feature?.properties?.name as string | undefined
            if (postal) {
              const ratio = dataRef.current.usStateInfo?.[postal]?.rentIncomeRatio ?? null
              const tooltip = ratio != null
                ? `${name} · ${Math.round(ratio * 100)}% rent/income`
                : name ?? postal
              lyr.bindTooltip(tooltip, {
                sticky: true,
                direction: "top",
                className: "!rounded-md !border-0 !bg-slate-900 !px-2 !py-1 !text-xs !text-white !shadow-md",
              })
            }
            ;(lyr as L.Path).on({
              click: () => {
                if (postal) {
                  onSelectCountryRef.current("US")
                  onSelectStateRef.current(postal)
                }
              },
              mouseover: () => (lyr as L.Path).setStyle({ weight: 2, fillOpacity: 0.6 }),
              mouseout: () => {
                const ratio = postal ? dataRef.current.usStateInfo?.[postal]?.rentIncomeRatio ?? null : null
                const fillColor = ratio != null
                  ? ratio > 0.30 ? "#fecaca"
                    : ratio > 0.22 ? "#fed7aa"
                    : "#bbf7d0"
                  : "#e0f2fe"
                ;(lyr as L.Path).setStyle({
                  fillColor,
                  fillOpacity: selectedRef.current === postal ? 0.8 : 0.5,
                  color: selectedRef.current === postal ? "#1e293b" : "#475569",
                  weight: selectedRef.current === postal ? 3 : 1,
                })
              },
            })
            const el = (lyr as L.Path).getElement() as SVGElement | null
            if (el && postal) {
              el.setAttribute("tabindex", "0")
              el.setAttribute("role", "button")
              el.setAttribute("aria-label", (feature?.properties?.name as string) ?? postal)
              el.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onSelectStateRef.current(postal)
                }
              })
            }
          },
        })
        usLayerRef.current = usLayer

        if (activeCountryRef.current === "US") {
          map.addLayer(usLayer)
          if (!didFitRef.current && container.clientWidth > 0) {
            fitToBounds(US_BOUNDS, false)
            didFitRef.current = true
          }
        }
      })
      .catch((err) => console.error("[LeafletMap] us geojson load failed:", err))

    // Canada provinces layer
    fetch("/ca-provinces.geojson")
      .then((r) => r.json())
      .then((geo: GeoJSON.FeatureCollection) => {
        if (mapRef.current !== map) return
        const caLayer = L.geoJSON(geo, {
          style: (feature) => {
            const postal = feature?.properties?.postal as string | undefined
            const isSel = selectedRef.current === postal
            return {
              fillColor: "#fce7f3",
              fillOpacity: isSel ? 0.8 : 0.4,
              color: isSel ? "#1e293b" : "#ec4899",
              weight: isSel ? 3 : 1,
            }
          },
          onEachFeature: (feature, lyr) => {
            const postal = feature?.properties?.postal as string | undefined
            const name = feature?.properties?.name as string | undefined
            ;(lyr as L.Path).on({
              click: () => {
                if (postal) {
                  onSelectCountryRef.current("CA")
                  onSelectStateRef.current(postal)
                }
              },
              mouseover: () => (lyr as L.Path).setStyle({ weight: 2, fillOpacity: 0.6 }),
              mouseout: () => {
                (lyr as L.Path).setStyle({
                  fillColor: "#fce7f3",
                  fillOpacity: selectedRef.current === postal ? 0.8 : 0.4,
                  color: selectedRef.current === postal ? "#1e293b" : "#ec4899",
                  weight: selectedRef.current === postal ? 3 : 1,
                })
              },
            })
            const el = (lyr as L.Path).getElement() as SVGElement | null
            if (el && postal) {
              el.setAttribute("tabindex", "0")
              el.setAttribute("role", "button")
              el.setAttribute("aria-label", name ?? postal)
              el.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onSelectStateRef.current(postal)
                }
              })
            }
          },
        })
        caLayerRef.current = caLayer

        if (activeCountryRef.current === "CA") {
          map.addLayer(caLayer)
          if (!didFitRef.current && container.clientWidth > 0) {
            fitToBounds(CA_BOUNDS, false)
            didFitRef.current = true
          }
        }
        refreshWorldCountryStyle()
      })
      .catch((err) => console.error("[LeafletMap] ca geojson load failed:", err))

    // IE counties layer
    fetch("/ie-counties.geojson")
      .then((r) => r.json())
      .then((geo: GeoJSON.FeatureCollection) => {
        if (mapRef.current !== map) return
        const ieLayer = L.geoJSON(geo, {
          style: (feature) => {
            const rawName = (feature?.properties?.county as string ?? "").replace(" County", "")
            const code = IE_GEOJSON_COUNTY_TO_CODE[rawName as IECountyCode] ?? ""
            const isSel = selectedRef.current === code
            return {
              fillColor: "#fef3c7",
              fillOpacity: isSel ? 0.8 : 0.4,
              color: isSel ? "#1e293b" : "#f59e0b",
              weight: isSel ? 3 : 1,
            }
          },
          onEachFeature: (feature, lyr) => {
            const rawName = (feature?.properties?.county as string ?? "").replace(" County", "")
            const code = IE_GEOJSON_COUNTY_TO_CODE[rawName as IECountyCode] ?? ""
            const name = IE_COUNTY_NAMES[code] ?? rawName
            if (code) ieCountyByCode.current[code] = lyr as L.Polygon
            ;(lyr as L.Path).on({
              click: () => {
                if (code) onSelectStateRef.current(code)
              },
              mouseover: () => {
                if (selectedRef.current !== code) (lyr as L.Path).setStyle({ weight: 2, fillOpacity: 0.6 })
              },
              mouseout: () => {
                if (selectedRef.current !== code) {
                  ;(lyr as L.Path).setStyle({
                    fillColor: "#fef3c7",
                    fillOpacity: selectedRef.current === code ? 0.8 : 0.4,
                    color: selectedRef.current === code ? "#1e293b" : "#f59e0b",
                    weight: selectedRef.current === code ? 3 : 1,
                  })
                }
              },
            })
            lyr.bindTooltip(name, {
              sticky: true,
              direction: "top",
              className: "!rounded-md !border-0 !bg-slate-900 !px-2 !py-1 !text-xs !text-white !shadow-md",
            })
            const el = (lyr as L.Path).getElement() as SVGElement | null
            if (el && code) {
              el.setAttribute("tabindex", "0")
              el.setAttribute("role", "button")
              el.setAttribute("aria-label", name)
              el.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onSelectStateRef.current(code)
                }
              })
            }
          },
        })
        ieLayerRef.current = ieLayer
        if (activeCountryRef.current === "IE") {
          map.addLayer(ieLayer)
        }
      })
      .catch((err) => console.error("[LeafletMap] ie geojson load failed:", err))

    // UK regions layer
    fetch("/uk-regions.geojson")
      .then((r) => r.json())
      .then((geo: GeoJSON.FeatureCollection) => {
        if (mapRef.current !== map) return
        const ukLayer = L.geoJSON(geo, {
          style: (feature) => {
            const props = feature?.properties as Record<string, string> | undefined
            const itl1Code = props?.ITL121CD ?? ""
            const isSel = selectedRef.current === itl1Code
            return {
              fillColor: "#dbeafe",
              fillOpacity: isSel ? 0.8 : 0.4,
              color: isSel ? "#1e293b" : "#3b82f6",
              weight: isSel ? 3 : 1,
            }
          },
          onEachFeature: (feature, lyr) => {
            const props = feature?.properties as Record<string, string> | undefined
            const itl1Code = props?.ITL121CD ?? ""
            const itl1Name = UK_GEOJSON_ITL1_TO_NAME[itl1Code] ?? props?.ITL121NM ?? itl1Code
            if (itl1Code) ukRegionByCode.current[itl1Code] = lyr as L.Polygon
            ;(lyr as L.Path).on({
              click: () => {
                if (itl1Code) {
                  onSelectCountryRef.current("UK")
                  onSelectStateRef.current(itl1Code)
                }
              },
              mouseover: () => {
                if (selectedRef.current !== itl1Code) (lyr as L.Path).setStyle({ weight: 2, fillOpacity: 0.6 })
              },
              mouseout: () => {
                if (selectedRef.current !== itl1Code) {
                  ;(lyr as L.Path).setStyle({
                    fillColor: "#dbeafe",
                    fillOpacity: selectedRef.current === itl1Code ? 0.8 : 0.4,
                    color: selectedRef.current === itl1Code ? "#1e293b" : "#3b82f6",
                    weight: selectedRef.current === itl1Code ? 3 : 1,
                  })
                }
              },
            })
            lyr.bindTooltip(itl1Name, {
              sticky: true,
              direction: "top",
              className: "!rounded-md !border-0 !bg-slate-900 !px-2 !py-1 !text-xs !text-white !shadow-md",
            })
            const el = (lyr as L.Path).getElement() as SVGElement | null
            if (el && itl1Code) {
              el.setAttribute("tabindex", "0")
              el.setAttribute("role", "button")
              el.setAttribute("aria-label", itl1Name)
              el.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onSelectCountryRef.current("UK")
                  onSelectStateRef.current(itl1Code)
                }
              })
            }
          },
        })
        ukLayerRef.current = ukLayer
        if (activeCountryRef.current === "UK") {
          map.addLayer(ukLayer)
        }
      })
      .catch((err) => console.error("[LeafletMap] uk geojson load failed:", err))

    // DE Bundesländer layer
    fetch("/de-bundeslander.geojson")
      .then((r) => r.json())
      .then((geo: GeoJSON.FeatureCollection) => {
        if (mapRef.current !== map) return
        const deLayer = L.geoJSON(geo, {
          style: () => ({
            fillColor: "#bbf7d0",
            fillOpacity: 0.3,
            color: "#22c55e",
            weight: 1.5,
          }),
          onEachFeature: (feature, lyr) => {
            const props = feature?.properties as Record<string, string> | undefined
            const isoCode = props?.iso_3166_2 ?? ""
            const code = isoCode.startsWith("DE-") ? isoCode.slice(3) : ""
            const name = DE_BUNDESLAND_NAMES[code] ?? props?.name ?? code
            if (code) deRegionByCode.current[code] = lyr as L.Polygon
            ;(lyr as L.Path).on({
              click: () => {
                if (code) {
                  onSelectCountryRef.current("DE")
                  onSelectStateRef.current(code)
                }
              },
              mouseover: () => {
                if (selectedRef.current !== code) (lyr as L.Path).setStyle({ weight: 2.5, fillOpacity: 0.5 })
              },
              mouseout: () => {
                if (selectedRef.current !== code) {
                  ;(lyr as L.Path).setStyle({
                    fillColor: "#bbf7d0",
                    fillOpacity: selectedRef.current === code ? 0.6 : 0.3,
                    color: selectedRef.current === code ? "#1e293b" : "#22c55e",
                    weight: selectedRef.current === code ? 3 : 1.5,
                  })
                }
              },
            })
            lyr.bindTooltip(name, {
              sticky: true,
              direction: "top",
              className: "!rounded-md !border-0 !bg-slate-900 !px-2 !py-1 !text-xs !text-white !shadow-md",
            })
            const el = (lyr as L.Path).getElement() as SVGElement | null
            if (el && code) {
              el.setAttribute("tabindex", "0")
              el.setAttribute("role", "button")
              el.setAttribute("aria-label", name)
              el.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onSelectCountryRef.current("DE")
                  onSelectStateRef.current(code)
                }
              })
            }
          },
        })
        deLayerRef.current = deLayer
        if (activeCountryRef.current === "DE") {
          map.addLayer(deLayer)
        }
      })
      .catch((err) => console.error("[LeafletMap] de geojson load failed:", err))

    // NL Provinces layer
    fetch("/nl-provinces.geojson")
      .then((r) => r.json())
      .then((geo: GeoJSON.FeatureCollection) => {
        if (mapRef.current !== map) return
        const nlLayer = L.geoJSON(geo, {
          style: () => ({
            fillColor: "#fce7f3",
            fillOpacity: 0.3,
            color: "#d946ef",
            weight: 1.5,
          }),
          onEachFeature: (feature, lyr) => {
            const props = feature?.properties as Record<string, string> | undefined
            const code = props?.code ?? ""
            const name = NL_PROVINCE_NAMES[code] ?? props?.name ?? code
            if (code) nlRegionByCode.current[code] = lyr as L.Polygon
            ;(lyr as L.Path).on({
              click: () => {
                if (code) {
                  onSelectCountryRef.current("NL")
                  onSelectStateRef.current(code)
                }
              },
              mouseover: () => {
                if (selectedRef.current !== code) (lyr as L.Path).setStyle({ weight: 2.5, fillOpacity: 0.5 })
              },
              mouseout: () => {
                if (selectedRef.current !== code) {
                  ;(lyr as L.Path).setStyle({
                    fillColor: "#fce7f3",
                    fillOpacity: selectedRef.current === code ? 0.6 : 0.3,
                    color: selectedRef.current === code ? "#1e293b" : "#d946ef",
                    weight: selectedRef.current === code ? 3 : 1.5,
                  })
                }
              },
            })
            lyr.bindTooltip(name, {
              sticky: true,
              direction: "top",
              className: "!rounded-md !border-0 !bg-slate-900 !px-2 !py-1 !text-xs !text-white !shadow-md",
            })
            const el = (lyr as L.Path).getElement() as SVGElement | null
            if (el && code) {
              el.setAttribute("tabindex", "0")
              el.setAttribute("role", "button")
              el.setAttribute("aria-label", name)
              el.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onSelectCountryRef.current("NL")
                  onSelectStateRef.current(code)
                }
              })
            }
          },
        })
        nlLayerRef.current = nlLayer
        if (activeCountryRef.current === "NL") {
          map.addLayer(nlLayer)
        }
      })
      .catch((err) => console.error("[LeafletMap] nl geojson load failed:", err))

    // Belgium Regions layer
    fetch("/be-regions.geojson")
      .then((r) => r.json())
      .then((geo: GeoJSON.FeatureCollection) => {
        if (mapRef.current !== map) return
        const beLayer = L.geoJSON(geo, {
          style: () => ({
            fillColor: "#fef9c3",
            fillOpacity: 0.3,
            color: "#eab308",
            weight: 1.5,
          }),
          onEachFeature: (feature, lyr) => {
            const props = feature?.properties as Record<string, string> | undefined
            const code = props?.code ?? ""
            const name = BE_REGION_NAMES[code as keyof typeof BE_REGION_NAMES] ?? props?.name ?? code
            if (code) beRegionByCode.current[code] = lyr as L.Polygon
            ;(lyr as L.Path).on({
              click: () => {
                if (code) {
                  onSelectCountryRef.current("BE")
                  onSelectStateRef.current(code)
                }
              },
              mouseover: () => {
                if (selectedRef.current !== code) (lyr as L.Path).setStyle({ weight: 2.5, fillOpacity: 0.5 })
              },
              mouseout: () => {
                if (selectedRef.current !== code) {
                  ;(lyr as L.Path).setStyle({
                    fillColor: "#fef9c3",
                    fillOpacity: selectedRef.current === code ? 0.6 : 0.3,
                    color: selectedRef.current === code ? "#1e293b" : "#eab308",
                    weight: selectedRef.current === code ? 3 : 1.5,
                  })
                }
              },
            })
            lyr.bindTooltip(name, {
              sticky: true,
              direction: "top",
              className: "!rounded-md !border-0 !bg-slate-900 !px-2 !py-1 !text-xs !text-white !shadow-md",
            })
            const el = (lyr as L.Path).getElement() as SVGElement | null
            if (el && code) {
              el.setAttribute("tabindex", "0")
              el.setAttribute("role", "button")
              el.setAttribute("aria-label", name)
              el.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onSelectCountryRef.current("BE")
                  onSelectStateRef.current(code)
                }
              })
            }
          },
        })
        beLayerRef.current = beLayer
        if (activeCountryRef.current === "BE") {
          map.addLayer(beLayer)
        }
      })
      .catch((err) => console.error("[LeafletMap] be geojson load failed:", err))

    // Japan prefectures. Boundary geometry is a presentation layer only; all
    // labour and rent values shown in the panel come from the official sources.
    fetch("/jp-prefectures.geojson")
      .then((r) => r.json())
      .then((geo: GeoJSON.FeatureCollection) => {
        if (mapRef.current !== map) return
        const jpLayer = L.geoJSON(geo, {
          style: () => ({ fillColor: "#fee2e2", fillOpacity: 0.35, color: "#ef4444", weight: 1.2 }),
          onEachFeature: (feature, lyr) => {
            const props = feature?.properties as { id?: number | string; nam?: string; nam_ja?: string } | undefined
            const code = String(props?.id ?? "").padStart(2, "0")
            const name = JP_PREFECTURE_NAMES[code as keyof typeof JP_PREFECTURE_NAMES]?.en ?? props?.nam ?? code
            if (code) jpRegionByCode.current[code] = lyr as L.Polygon
            ;(lyr as L.Path).on({
              click: () => {
                if (code) {
                  onSelectCountryRef.current("JP")
                  onSelectStateRef.current(code)
                }
              },
              mouseover: () => {
                if (selectedRef.current !== code) (lyr as L.Path).setStyle({ weight: 2.5, fillOpacity: 0.55 })
              },
              mouseout: () => {
                if (selectedRef.current !== code) (lyr as L.Path).setStyle({ fillColor: "#fee2e2", fillOpacity: 0.35, color: "#ef4444", weight: 1.2 })
              },
            })
            lyr.bindTooltip(`${name}${props?.nam_ja ? ` · ${props.nam_ja}` : ""}`, { sticky: true, direction: "top", className: "!rounded-md !border-0 !bg-slate-900 !px-2 !py-1 !text-xs !text-white !shadow-md" })
          },
        })
        jpLayerRef.current = jpLayer
        if (activeCountryRef.current === "JP") map.addLayer(jpLayer)
      })
      .catch((err) => console.error("[LeafletMap] jp geojson load failed:", err))

    // Official si/do geometry is served only by the server-side API proxy so
    // the data.go.kr key never reaches the browser. The map remains usable via
    // the region selector when the official boundary source is not configured.
    fetch("/api/maps/kr-boundaries")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((geo: GeoJSON.FeatureCollection) => {
        if (mapRef.current !== map) return
        const krLayer = L.geoJSON(geo, {
          style: () => ({ fillColor: "#ffe4e6", fillOpacity: 0.55, color: "#e11d48", weight: 1.2 }),
          onEachFeature: (feature, layer) => {
            const props = feature?.properties as { sidoCode?: string | number; CTPRVN_CD?: string | number; code?: string | number; name?: string } | undefined
            const code = String(props?.sidoCode ?? props?.CTPRVN_CD ?? props?.code ?? "")
            const name = KR_SIDO_NAMES[code as keyof typeof KR_SIDO_NAMES]?.en ?? props?.name ?? code
            if (code) krRegionByCode.current[code] = layer as L.Polygon
            const path = layer as L.Path
            path.on({
              click: () => { if (code) { onSelectCountryRef.current("KR"); onSelectStateRef.current(code) } },
              mouseover: () => { if (selectedRef.current !== code) path.setStyle({ weight: 2.5, fillOpacity: 0.72 }) },
              mouseout: () => { if (selectedRef.current !== code) path.setStyle({ fillColor: "#ffe4e6", fillOpacity: 0.55, color: "#e11d48", weight: 1.2 }) },
            })
            layer.bindTooltip(name, { sticky: true, direction: "top", className: "!rounded-md !border-0 !bg-slate-900 !px-2 !py-1 !text-xs !text-white !shadow-md" })
          },
        })
        krLayerRef.current = krLayer
        setKrBoundaryReady(true)
        if (activeCountryRef.current === "KR") map.addLayer(krLayer)
      })
      .catch(() => setKrBoundaryReady(false))

    fetch("/fr-regions.geojson")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((geo: GeoJSON.FeatureCollection) => {
        if (mapRef.current !== map) return
        const frLayer = L.geoJSON(geo, {
          style: () => ({ fillColor: "#dbeafe", fillOpacity: 0.52, color: "#2563eb", weight: 1.2 }),
          onEachFeature: (feature, layer) => {
            const props = feature?.properties as { code?: string; nameFr?: string } | undefined
            const code = typeof props?.code === "string" ? props.code : ""
            const name = FR_REGION_NAMES[code as keyof typeof FR_REGION_NAMES] ?? props?.nameFr ?? code
            if (code) frRegionByCode.current[code] = layer as L.Polygon
            const path = layer as L.Path
            path.on({
              click: () => { if (code) { onSelectCountryRef.current("FR"); onSelectStateRef.current(code) } },
              mouseover: () => { if (selectedRef.current !== code) path.setStyle({ weight: 2.5, fillOpacity: 0.72 }) },
              mouseout: () => { if (selectedRef.current !== code) path.setStyle({ fillColor: "#dbeafe", fillOpacity: 0.52, color: "#2563eb", weight: 1.2 }) },
            })
            layer.bindTooltip(name, { sticky: true, direction: "top", className: "!rounded-md !border-0 !bg-slate-900 !px-2 !py-1 !text-xs !text-white !shadow-md" })
          },
        })
        frLayerRef.current = frLayer
        if (activeCountryRef.current === "FR") map.addLayer(frLayer)
        refreshWorldCountryStyle()
      })
      .catch((error) => console.error("[LeafletMap] France region GeoJSON load failed:", error))

    fetch("/fr-cities.geojson")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((geo: GeoJSON.FeatureCollection) => {
        if (mapRef.current !== map) return
        const cityLayer = L.geoJSON(geo, {
          style: () => ({ fillColor: "#fbbf24", fillOpacity: 0.18, color: "#b45309", weight: 1 }),
          onEachFeature: (feature, layer) => {
            const props = feature?.properties as { code?: string; name?: string; regionCode?: string } | undefined
            const name = props?.name ?? "French city"
            layer.bindTooltip(name, { sticky: true, direction: "top", className: "!rounded-md !border-0 !bg-slate-900 !px-2 !py-1 !text-xs !text-white !shadow-md" })
            layer.on("click", () => {
              if (!props?.regionCode || !props.code) return
              onSelectCountryRef.current("FR")
              onSelectStateRef.current(props.regionCode)
              onSelectFranceCityRef.current?.(props.code)
            })
          },
        })
        frCityLayerRef.current = cityLayer
        if (activeCountryRef.current === "FR") map.addLayer(cityLayer)
        refreshWorldCountryStyle()
      })
      .catch((error) => console.error("[LeafletMap] France city GeoJSON load failed:", error))

    fetch("/es-communities.geojson")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((geo: GeoJSON.FeatureCollection) => {
        if (mapRef.current !== map) return
        const esLayer = L.geoJSON(geo, {
          style: () => ({ fillColor: "#ffedd5", fillOpacity: 0.55, color: "#ea580c", weight: 1.2 }),
          onEachFeature: (feature, layer) => {
            const props = feature?.properties as { code?: string; nameEs?: string; nameEn?: string } | undefined
            const code = String(props?.code ?? "")
            if (code) esRegionByCode.current[code] = layer as L.Polygon
            const path = layer as L.Path
            path.on({
              click: () => { if (code) { onSelectCountryRef.current("ES"); onSelectStateRef.current(code) } },
              mouseover: () => { if (selectedRef.current !== code) path.setStyle({ weight: 2.5, fillOpacity: 0.72 }) },
              mouseout: () => { if (selectedRef.current !== code) path.setStyle({ fillColor: "#ffedd5", fillOpacity: 0.55, color: "#ea580c", weight: 1.2 }) },
            })
            layer.bindTooltip(props?.nameEn ?? props?.nameEs ?? code, { sticky: true, direction: "top", className: "!rounded-md !border-0 !bg-slate-900 !px-2 !py-1 !text-xs !text-white !shadow-md" })
          },
        })
        esLayerRef.current = esLayer
        if (activeCountryRef.current === "ES") map.addLayer(esLayer)
      })
      .catch((error) => console.error("[LeafletMap] Spain community GeoJSON load failed:", error))

    fetch("/es-cities.geojson")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((geo: GeoJSON.FeatureCollection) => {
        if (mapRef.current !== map) return
        const cityLayer = L.geoJSON(geo, {
          pointToLayer: (_feature, latlng) => L.circleMarker(latlng, { radius: 4, fillColor: "#9a3412", color: "#fff7ed", weight: 1, fillOpacity: 0.9 }),
          onEachFeature: (feature, layer) => {
            const props = feature?.properties as { code?: string; nameEs?: string; name?: string; regionCode?: string } | undefined
            layer.bindTooltip(props?.nameEs ?? props?.name ?? "Spanish city", { sticky: true, direction: "top", className: "!rounded-md !border-0 !bg-slate-900 !px-2 !py-1 !text-xs !text-white !shadow-md" })
            layer.on("click", () => {
              if (!props?.regionCode || !props.code) return
              onSelectCountryRef.current("ES")
              onSelectStateRef.current(props.regionCode)
              onSelectSpainCityRef.current?.(props.code)
            })
          },
        })
        esCityLayerRef.current = cityLayer
        if (activeCountryRef.current === "ES") map.addLayer(cityLayer)
      })
      .catch((error) => console.error("[LeafletMap] Spain city GeoJSON load failed:", error))

    // Singapore is too small for the world-country geometry used elsewhere.
    // This is the SLA National Map Polygon coastal outline, trimmed to the
    // Singapore features so the map remains responsive and visibly clickable.
    fetch("/sg-boundary.geojson")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((geo: GeoJSON.FeatureCollection) => {
        if (mapRef.current !== map) return
        const singaporeLayer = L.geoJSON(geo, {
          style: () => ({ fillColor: "#0f766e", fillOpacity: 0.62, color: "#0f172a", weight: 1.8 }),
          onEachFeature: (_feature, layer) => {
            const path = layer as L.Path
            path.on({
              click: () => onSelectStateRef.current("central"),
              mouseover: () => path.setStyle({ fillOpacity: 0.82, weight: 2.5 }),
              mouseout: () => path.setStyle({ fillOpacity: 0.62, weight: 1.8 }),
            })
          },
        })
        singaporeLayer.bindTooltip("Singapore", {
          permanent: true,
          direction: "top",
          className: "!rounded-md !border-0 !bg-slate-900 !px-2 !py-1 !text-xs !text-white !shadow-md",
        })
        sgLayerRef.current = singaporeLayer
        if (activeCountryRef.current === "SG") singaporeLayer.addTo(map)
      })
      .catch((err) => console.error("[LeafletMap] Singapore boundary load failed:", err))

    // NZ regions layer
    fetch("/nz-regions.geojson")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((geo: GeoJSON.FeatureCollection) => {
        if (mapRef.current !== map) return
        const nzLayer = L.geoJSON(geo, {
          style: () => ({ fillColor: "#dbeafe", fillOpacity: 0.55, color: "#1d4ed8", weight: 1.2 }),
          onEachFeature: (feature, layer) => {
            const props = feature?.properties as { code?: string | null; name?: string } | undefined
            const code = typeof props?.code === "string" ? props.code : ""
            if (code) nzRegionByCode.current[code] = layer as L.Polygon
            const path = layer as L.Path
            path.on({
              click: () => { if (code) { onSelectCountryRef.current("NZ"); onSelectStateRef.current(code) } },
              mouseover: () => { if (selectedRef.current !== code) path.setStyle({ weight: 2.5, fillOpacity: 0.72 }) },
              mouseout: () => { if (selectedRef.current !== code) path.setStyle({ fillColor: "#dbeafe", fillOpacity: 0.55, color: "#1d4ed8", weight: 1.2 }) },
            })
            layer.bindTooltip(props?.name ?? code, { sticky: true, direction: "top", className: "!rounded-md !border-0 !bg-slate-900 !px-2 !py-1 !text-xs !text-white !shadow-md" })
          },
        })
        nzLayerRef.current = nzLayer
        if (activeCountryRef.current === "NZ") map.addLayer(nzLayer)
      })
      .catch((error) => console.error("[LeafletMap] NZ region GeoJSON load failed:", error))

    fetch("/no-regions.geojson")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((geo: GeoJSON.FeatureCollection) => {
        if (mapRef.current !== map) return
        const noLayer = L.geoJSON(geo, {
          style: () => ({ fillColor: "#ede9fe", fillOpacity: 0.58, color: "#6d28d9", weight: 1.2 }),
          onEachFeature: (feature, layer) => {
            const props = feature?.properties as { code?: string; name?: string } | undefined
            const code = String(props?.code ?? "")
            if (code) noRegionByCode.current[code] = layer as L.Polygon
            const path = layer as L.Path
            path.on({
              click: () => { if (code) { onSelectCountryRef.current("NO"); onSelectStateRef.current(code) } },
              mouseover: () => { if (selectedRef.current !== code) path.setStyle({ weight: 2.5, fillOpacity: 0.75 }) },
              mouseout: () => { if (selectedRef.current !== code) path.setStyle({ fillColor: "#ede9fe", fillOpacity: 0.58, color: "#6d28d9", weight: 1.2 }) },
            })
            layer.bindTooltip(props?.name ?? code, { sticky: true, direction: "top", className: "!rounded-md !border-0 !bg-slate-900 !px-2 !py-1 !text-xs !text-white !shadow-md" })
          },
        })
        noLayerRef.current = noLayer
        showOnlyNordicLayer("NO", noLayer)
      })
      .catch((error) => console.error("[LeafletMap] NO region GeoJSON load failed:", error))

    // Boundary requests finish independently. When a user changes country while
    // one is still downloading, never leave the previously loaded country on
    // the map: the last resolved layer must honour the currently selected one.
    const showOnlyNordicLayer = (country: "NO" | "SE" | "DK" | "FI" | "CH", layer: L.GeoJSON) => {
      if (activeCountryRef.current !== country) return
      for (const detailLayer of [noLayerRef.current, seLayerRef.current, dkLayerRef.current, fiLayerRef.current, chLayerRef.current]) {
        if (detailLayer && detailLayer !== layer && map.hasLayer(detailLayer)) map.removeLayer(detailLayer)
      }
      if (!map.hasLayer(layer)) layer.addTo(map)
      if (country === "CH" && worldLayerRef.current) {
        worldLayerRef.current.eachLayer((worldFeature) => {
          const props = (worldFeature as L.GeoJSON & { feature?: GeoJSON.Feature }).feature?.properties as Record<string, unknown> | undefined
          if (props && isSwitzerland(props)) (worldFeature as L.Path).setStyle({ opacity: 0, fillOpacity: 0, weight: 0 })
        })
      }
    }

    const loadNordicRegions = (country: "SE" | "DK" | "FI" | "CH", file: string, color: string, layerRef: MutableRefObject<L.GeoJSON | null>, byCode: MutableRefObject<Record<string, L.Polygon>>) => {
      fetch(file).then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      }).then((geo: GeoJSON.FeatureCollection) => {
        if (mapRef.current !== map) return
        const countryLayer = L.geoJSON(geo, {
          style: () => ({ fillColor: color, fillOpacity: 0.58, color, weight: 1.2 }),
          onEachFeature: (feature, layer) => {
            const props = feature?.properties as { code?: string | null; name?: string } | undefined
            const code = typeof props?.code === "string" ? props.code : ""
            if (code) byCode.current[code] = layer as L.Polygon
            const path = layer as L.Path
            path.on({
              click: () => { if (code) { onSelectCountryRef.current(country); onSelectStateRef.current(code) } },
              mouseover: () => { if (selectedRef.current !== code) path.setStyle({ weight: 2.5, fillOpacity: 0.76 }) },
              mouseout: () => { if (selectedRef.current !== code) path.setStyle({ fillColor: color, fillOpacity: 0.58, color, weight: 1.2 }) },
            })
            layer.bindTooltip(props?.name ?? code, { sticky: true, direction: "top", className: "!rounded-md !border-0 !bg-slate-900 !px-2 !py-1 !text-xs !text-white !shadow-md" })
          },
        })
        layerRef.current = countryLayer
        showOnlyNordicLayer(country, countryLayer)
      }).catch((error) => console.error(`[LeafletMap] ${country} region GeoJSON load failed:`, error))
    }
    loadNordicRegions("SE", "/se-regions.geojson", "#0f766e", seLayerRef, seRegionByCode)
    loadNordicRegions("DK", "/dk-regions.geojson", "#b45309", dkLayerRef, dkRegionByCode)
    loadNordicRegions("FI", "/fi-regions.geojson", "#0369a1", fiLayerRef, fiRegionByCode)
    loadNordicRegions("CH", "/ch-cantons.geojson", "#be185d", chLayerRef, chRegionByCode)

    // UAE emirates layer
    fetch("/ae-emirates.geojson")
      .then((r) => r.json())
      .then((geo: GeoJSON.FeatureCollection) => {
        if (mapRef.current !== map) return
        const aeLayer = L.geoJSON(geo, {
          style: () => ({ fillColor: "#fef3c7", fillOpacity: 0.55, color: "#d97706", weight: 1.2 }),
          onEachFeature: (feature, layer) => {
            const props = feature?.properties as { code?: string; name?: string } | undefined
            const code = String(props?.code ?? "")
            if (code) aeRegionByCode.current[code] = layer as L.Polygon
            const path = layer as L.Path
            path.on({
              click: () => { if (code) { onSelectCountryRef.current("AE"); onSelectStateRef.current(code) } },
              mouseover: () => { if (selectedRef.current !== code) path.setStyle({ weight: 2.5, fillOpacity: 0.75 }) },
              mouseout: () => { if (selectedRef.current !== code) path.setStyle({ fillColor: "#fef3c7", fillOpacity: 0.55, color: "#d97706", weight: 1.2 }) },
            })
            const name = AE_EMIRATE_NAMES[code as AEEmirateCode]
            layer.bindTooltip(name ? `${name.ko} · ${name.en}` : (props?.name ?? code), { sticky: true, direction: "top", className: "!rounded-md !border-0 !bg-slate-900 !px-2 !py-1 !text-xs !text-white !shadow-md" })
          },
        })
        aeLayerRef.current = aeLayer
        if (activeCountryRef.current === "AE") {
          map.addLayer(aeLayer)
        }
      })
      .catch((error) => console.error("[LeafletMap] AE emirate GeoJSON load failed:", error))

    // SA4 지역 경계 — 한 번만 로드해 두고, 주 선택 시 해당 주의 지역만 렌더한다.
    fetch("/au-sa4.geojson")
      .then((r) => r.json())
      .then((geo: GeoJSON.FeatureCollection) => {
        if (mapRef.current !== map) return
        sa4GeoRef.current = geo
        renderSA4() // 딥링크(?state=NSW)로 이미 주가 선택돼 있으면 즉시 렌더
      })
      .catch((err) => console.error("[LeafletMap] sa4 geojson load failed:", err))

    return () => {
      ro.disconnect()
      map.remove()
      mapRef.current = null
      worldLayerRef.current = null
      auLayerRef.current = null
      usLayerRef.current = null
      caLayerRef.current = null
      ieLayerRef.current = null
      ukLayerRef.current = null
      deLayerRef.current = null
      nlLayerRef.current = null
      beLayerRef.current = null
      jpLayerRef.current = null
      krLayerRef.current = null
      frLayerRef.current = null
      frCityLayerRef.current = null
      esLayerRef.current = null
      esCityLayerRef.current = null
      markerLayerRef.current = null
      ieMarkerLayerRef.current = null
      sgLayerRef.current = null
      sa4LayerRef.current = null
      sa4GeoRef.current = null
      sa4ByCode.current = {}
      layersByCode.current = {}
      ieCountyByCode.current = {}
      ukRegionByCode.current = {}
      deRegionByCode.current = {}
      nlRegionByCode.current = {}
      beRegionByCode.current = {}
      jpRegionByCode.current = {}
      krRegionByCode.current = {}
      frRegionByCode.current = {}
      esRegionByCode.current = {}
      nzRegionByCode.current = {}
      noRegionByCode.current = {}
      seRegionByCode.current = {}
      dkRegionByCode.current = {}
      fiRegionByCode.current = {}
      chRegionByCode.current = {}
      nzLayerRef.current = null
      noLayerRef.current = null
      seLayerRef.current = null
      dkLayerRef.current = null
      fiLayerRef.current = null
      chLayerRef.current = null
      aeLayerRef.current = null
      aeRegionByCode.current = {}
      didFitRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Toggle active country
  useEffect(() => {
    activeCountryRef.current = activeCountry
    const map = mapRef.current
    if (!map) return

    // Hide all country layers
    if (auLayerRef.current && map.hasLayer(auLayerRef.current)) map.removeLayer(auLayerRef.current)
    if (usLayerRef.current && map.hasLayer(usLayerRef.current)) map.removeLayer(usLayerRef.current)
    if (caLayerRef.current && map.hasLayer(caLayerRef.current)) map.removeLayer(caLayerRef.current)
    if (ieLayerRef.current && map.hasLayer(ieLayerRef.current)) map.removeLayer(ieLayerRef.current)
    if (ukLayerRef.current && map.hasLayer(ukLayerRef.current)) map.removeLayer(ukLayerRef.current)
    if (deLayerRef.current && map.hasLayer(deLayerRef.current)) map.removeLayer(deLayerRef.current)
    if (nlLayerRef.current && map.hasLayer(nlLayerRef.current)) map.removeLayer(nlLayerRef.current)
    if (beLayerRef.current && map.hasLayer(beLayerRef.current)) map.removeLayer(beLayerRef.current)
    if (jpLayerRef.current && map.hasLayer(jpLayerRef.current)) map.removeLayer(jpLayerRef.current)
    if (krLayerRef.current && map.hasLayer(krLayerRef.current)) map.removeLayer(krLayerRef.current)
    if (frLayerRef.current && map.hasLayer(frLayerRef.current)) map.removeLayer(frLayerRef.current)
    if (frCityLayerRef.current && map.hasLayer(frCityLayerRef.current)) map.removeLayer(frCityLayerRef.current)
    if (esLayerRef.current && map.hasLayer(esLayerRef.current)) map.removeLayer(esLayerRef.current)
    if (esCityLayerRef.current && map.hasLayer(esCityLayerRef.current)) map.removeLayer(esCityLayerRef.current)
    if (nzLayerRef.current && map.hasLayer(nzLayerRef.current)) map.removeLayer(nzLayerRef.current)
    if (noLayerRef.current && map.hasLayer(noLayerRef.current)) map.removeLayer(noLayerRef.current)
    if (seLayerRef.current && map.hasLayer(seLayerRef.current)) map.removeLayer(seLayerRef.current)
    if (dkLayerRef.current && map.hasLayer(dkLayerRef.current)) map.removeLayer(dkLayerRef.current)
    if (fiLayerRef.current && map.hasLayer(fiLayerRef.current)) map.removeLayer(fiLayerRef.current)
    if (chLayerRef.current && map.hasLayer(chLayerRef.current)) map.removeLayer(chLayerRef.current)
    if (aeLayerRef.current && map.hasLayer(aeLayerRef.current)) map.removeLayer(aeLayerRef.current)
    if (markerLayerRef.current) {
      map.removeLayer(markerLayerRef.current)
      markerLayerRef.current = null
    }
    if (ieMarkerLayerRef.current) {
      map.removeLayer(ieMarkerLayerRef.current)
      ieMarkerLayerRef.current = null
    }
    if (sgLayerRef.current && map.hasLayer(sgLayerRef.current)) map.removeLayer(sgLayerRef.current)

    if (activeCountry === "AU") {
      if (auLayerRef.current) map.addLayer(auLayerRef.current)
      fitToBounds(AU_BOUNDS, true)
    } else if (activeCountry === "US") {
      if (usLayerRef.current) map.addLayer(usLayerRef.current)
      fitToBounds(US_BOUNDS, true)
      updateMarkers()
    } else if (activeCountry === "CA") {
      if (caLayerRef.current) map.addLayer(caLayerRef.current)
      fitToBounds(CA_BOUNDS, true)
    } else if (activeCountry === "IE") {
      if (ieLayerRef.current) map.addLayer(ieLayerRef.current)
      fitToBounds(IE_BOUNDS, true)
      updateIEMarkers()
    } else if (activeCountry === "UK") {
      if (ukLayerRef.current) map.addLayer(ukLayerRef.current)
      fitToBounds(UK_BOUNDS, true)
      updateMarkers()
    } else if (activeCountry === "DE") {
      if (deLayerRef.current) map.addLayer(deLayerRef.current)
      fitToBounds(DE_BOUNDS, true)
      updateMarkers()
    } else if (activeCountry === "NL") {
      if (nlLayerRef.current) map.addLayer(nlLayerRef.current)
      fitToBounds(NL_BOUNDS, true)
      updateMarkers()
    } else if (activeCountry === "BE") {
      if (beLayerRef.current) map.addLayer(beLayerRef.current)
      fitToBounds(BE_BOUNDS, true)
      updateMarkers()
    } else if (activeCountry === "JP") {
      if (jpLayerRef.current) map.addLayer(jpLayerRef.current)
      fitToBounds(JP_BOUNDS, true)
    } else if (activeCountry === "SG") {
      if (sgLayerRef.current) map.addLayer(sgLayerRef.current)
      fitToBounds(SG_BOUNDS, true)
    } else if (activeCountry === "KR") {
      if (krLayerRef.current) map.addLayer(krLayerRef.current)
      fitToBounds(KR_BOUNDS, true)
      updateMarkers()
    } else if (activeCountry === "FR") {
      if (frLayerRef.current) map.addLayer(frLayerRef.current)
      if (frCityLayerRef.current) map.addLayer(frCityLayerRef.current)
      fitToBounds(FR_BOUNDS, true)
      updateMarkers()
    } else if (activeCountry === "ES") {
      if (esLayerRef.current) map.addLayer(esLayerRef.current)
      if (esCityLayerRef.current) map.addLayer(esCityLayerRef.current)
      fitToBounds(ES_BOUNDS, true)
      updateMarkers()
    } else if (activeCountry === "NZ") {
      if (nzLayerRef.current) map.addLayer(nzLayerRef.current)
      fitToBounds(NZ_BOUNDS, true)
      updateMarkers()
    } else if (activeCountry === "NO") {
      if (noLayerRef.current) map.addLayer(noLayerRef.current)
      fitToBounds(NO_BOUNDS, true)
      updateMarkers()
    } else if (activeCountry === "SE") {
      if (seLayerRef.current) map.addLayer(seLayerRef.current)
      fitToBounds(SE_BOUNDS, true)
      updateMarkers()
    } else if (activeCountry === "DK") {
      if (dkLayerRef.current) map.addLayer(dkLayerRef.current)
      fitToBounds(DK_BOUNDS, true)
      updateMarkers()
    } else if (activeCountry === "FI") {
      if (fiLayerRef.current) map.addLayer(fiLayerRef.current)
      fitToBounds(FI_BOUNDS, true)
      updateMarkers()
    } else if (activeCountry === "CH") {
      if (chLayerRef.current) map.addLayer(chLayerRef.current)
      fitToBounds(CH_BOUNDS, true)
      updateMarkers()
    } else if (activeCountry === "AE") {
      if (aeLayerRef.current) map.addLayer(aeLayerRef.current)
      fitToBounds(AE_BOUNDS, true)
      updateMarkers()
    } else {
      fitToBounds(WORLD_BOUNDS, true)
    }

    refreshWorldCountryStyle()

    renderSA4()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCountry])

  // Country bundles are lazy-loaded after a country is selected. The active
  // country does not change when that request resolves, so redraw markers from
  // the newly available bundle instead of leaving an empty map until the user
  // manually zooms or switches country.
  useEffect(() => {
    if (!mapRef.current || !activeCountry) return
    if (activeCountry === "US" || activeCountry === "AU" || activeCountry === "CA" || activeCountry === "UK" || activeCountry === "DE" || activeCountry === "NL" || activeCountry === "KR" || activeCountry === "FR" || activeCountry === "ES" || activeCountry === "NZ" || activeCountry === "NO" || activeCountry === "SE" || activeCountry === "DK" || activeCountry === "FI" || activeCountry === "CH" || activeCountry === "AE") {
      updateMarkers()
    }
    // updateMarkers reads the current ref-backed data and map state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, activeCountry])

  // Selected state changed
  useEffect(() => {
    selectedRef.current = selected
    auLayerRef.current?.setStyle((feature) => styleFor(feature?.properties?.STATE_CODE as StateCode))
    if (auLayerRef.current && activeCountry === "AU") {
      if (selected && selected !== "WHV") {
        const lyr = layersByCode.current[selected as StateCode]
        const b = safeBounds(lyr ? lyr.getBounds() : AU_BOUNDS)
        if (b) mapRef.current?.flyToBounds(b, { padding: [30, 30], maxZoom: 6, duration: 0.6 })
      } else {
        const b = safeBounds(AU_BOUNDS)
        if (b) mapRef.current?.flyToBounds(b, { padding: [30, 30], maxZoom: 6, duration: 0.6 })
      }
    } else if (usLayerRef.current && activeCountry === "US") {
      // Update US state styling based on selection
      usLayerRef.current.setStyle((feature) => {
        const postal = feature?.properties?.postal as string | undefined
        const isSel = selected === postal
        return {
          fillColor: "#e0f2fe",
          fillOpacity: isSel ? 0.8 : 0.4,
          color: isSel ? "#1e293b" : "#0284c7",
          weight: isSel ? 3 : 1,
        }
      })
    } else if (caLayerRef.current && activeCountry === "CA") {
      caLayerRef.current.setStyle((feature) => {
        const postal = feature?.properties?.postal as string | undefined
        const isSel = selected === postal
        return {
          fillColor: "#fce7f3",
          fillOpacity: isSel ? 0.8 : 0.4,
          color: isSel ? "#1e293b" : "#ec4899",
          weight: isSel ? 3 : 1,
        }
      })
    } else if (ieLayerRef.current && activeCountry === "IE") {
      ieLayerRef.current.setStyle((feature) => {
        const rawName = (feature?.properties?.county as string ?? "").replace(" County", "")
        const code = IE_GEOJSON_COUNTY_TO_CODE[rawName as IECountyCode] ?? ""
        const isSel = selected === code
        return {
          fillColor: "#fef3c7",
          fillOpacity: isSel ? 0.8 : 0.4,
          color: isSel ? "#1e293b" : "#f59e0b",
          weight: isSel ? 3 : 1,
        }
      })
      if (selected) {
        const lyr = ieCountyByCode.current[selected]
        const b = lyr ? safeBounds(lyr.getBounds()) : null
        if (b) mapRef.current?.flyToBounds(b, { padding: [30, 30], maxZoom: 8, duration: 0.6 })
      }
      updateIEMarkers()
    } else if (ukLayerRef.current && activeCountry === "UK") {
      ukLayerRef.current.setStyle((feature) => {
        const props = feature?.properties as Record<string, string> | undefined
        const itl1Code = props?.ITL121CD ?? ""
        const isSel = selected === itl1Code
        return {
          fillColor: "#dbeafe",
          fillOpacity: isSel ? 0.8 : 0.4,
          color: isSel ? "#1e293b" : "#3b82f6",
          weight: isSel ? 3 : 1,
        }
      })
      if (selected) {
        const lyr = ukRegionByCode.current[selected]
        const b = lyr ? safeBounds(lyr.getBounds()) : null
        if (b) mapRef.current?.flyToBounds(b, { padding: [30, 30], maxZoom: 7, duration: 0.6 })
      }
    } else if (deLayerRef.current && activeCountry === "DE") {
      deLayerRef.current.setStyle((feature) => {
        const props = feature?.properties as Record<string, string> | undefined
        const code = props?.iso_3166_2?.replace("DE-", "") ?? ""
        const isSel = selected === code
        return {
          fillColor: "#bbf7d0",
          fillOpacity: isSel ? 0.8 : 0.4,
          color: isSel ? "#1e293b" : "#22c55e",
          weight: isSel ? 3 : 1,
        }
      })
      if (selected) {
        const lyr = deRegionByCode.current[selected]
        const b = lyr ? safeBounds(lyr.getBounds()) : null
        if (b) mapRef.current?.flyToBounds(b, { padding: [30, 30], maxZoom: 7, duration: 0.6 })
      }
    } else if (nlLayerRef.current && activeCountry === "NL") {
      nlLayerRef.current.setStyle((feature) => {
        const props = feature?.properties as Record<string, string> | undefined
        const code = props?.code ?? ""
        const isSel = selected === code
        return {
          fillColor: "#fce7f3",
          fillOpacity: isSel ? 0.8 : 0.4,
          color: isSel ? "#1e293b" : "#d946ef",
          weight: isSel ? 3 : 1,
        }
      })
      if (selected) {
        const lyr = nlRegionByCode.current[selected]
        const b = lyr ? safeBounds(lyr.getBounds()) : null
        if (b) mapRef.current?.flyToBounds(b, { padding: [30, 30], maxZoom: 8, duration: 0.6 })
      }
    } else if (beLayerRef.current && activeCountry === "BE") {
      beLayerRef.current.setStyle((feature) => {
        const props = feature?.properties as Record<string, string> | undefined
        const code = props?.code ?? ""
        const isSel = selected === code
        return {
          fillColor: "#fef9c3",
          fillOpacity: isSel ? 0.8 : 0.4,
          color: isSel ? "#1e293b" : "#eab308",
          weight: isSel ? 3 : 1.5,
        }
      })
      if (selected) {
        const lyr = beRegionByCode.current[selected]
        const b = lyr ? safeBounds(lyr.getBounds()) : null
        if (b) mapRef.current?.flyToBounds(b, { padding: [30, 30], maxZoom: 8, duration: 0.6 })
      }
    } else if (jpLayerRef.current && activeCountry === "JP") {
      jpLayerRef.current.setStyle((feature) => {
        const props = feature?.properties as { id?: number | string } | undefined
        const code = String(props?.id ?? "").padStart(2, "0")
        const isSel = selected === code
        return { fillColor: "#fee2e2", fillOpacity: isSel ? 0.8 : 0.35, color: isSel ? "#1e293b" : "#ef4444", weight: isSel ? 3 : 1.2 }
      })
      if (selected) {
        const lyr = jpRegionByCode.current[selected]
        const b = lyr ? safeBounds(lyr.getBounds()) : null
        if (b) mapRef.current?.flyToBounds(b, { padding: [30, 30], maxZoom: 7, duration: 0.6 })
      }
    } else if (krLayerRef.current && activeCountry === "KR") {
      krLayerRef.current.setStyle((feature) => {
        const props = feature?.properties as { sidoCode?: string | number; CTPRVN_CD?: string | number; code?: string | number } | undefined
        const code = String(props?.sidoCode ?? props?.CTPRVN_CD ?? props?.code ?? "")
        const isSelected = selected === code
        return { fillColor: "#ffe4e6", fillOpacity: isSelected ? 0.88 : 0.55, color: isSelected ? "#881337" : "#e11d48", weight: isSelected ? 3 : 1.2 }
      })
      if (selected) {
        const layer = krRegionByCode.current[selected]
        const bounds = layer ? safeBounds(layer.getBounds()) : null
        if (bounds) mapRef.current?.flyToBounds(bounds, { padding: [30, 30], maxZoom: 8, duration: 0.6 })
      }
    } else if (frLayerRef.current && activeCountry === "FR") {
      frLayerRef.current.setStyle((feature) => {
        const code = String((feature?.properties as { code?: string } | undefined)?.code ?? "")
        const isSelected = selected === code
        return { fillColor: "#dbeafe", fillOpacity: isSelected ? 0.84 : 0.52, color: isSelected ? "#1e3a8a" : "#2563eb", weight: isSelected ? 3 : 1.2 }
      })
      if (selected) {
        const layer = frRegionByCode.current[selected]
        const bounds = layer ? safeBounds(layer.getBounds()) : null
        if (bounds) mapRef.current?.flyToBounds(bounds, { padding: [30, 30], maxZoom: 8, duration: 0.6 })
      }
      updateMarkers()
    } else if (esLayerRef.current && activeCountry === "ES") {
      esLayerRef.current.setStyle((feature) => {
        const code = String((feature?.properties as { code?: string } | undefined)?.code ?? "")
        const isSelected = selected === code
        return { fillColor: "#ffedd5", fillOpacity: isSelected ? 0.84 : 0.55, color: isSelected ? "#9a3412" : "#ea580c", weight: isSelected ? 3 : 1.2 }
      })
      if (selected) {
        const layer = esRegionByCode.current[selected]
        const bounds = layer ? safeBounds(layer.getBounds()) : null
        if (bounds) mapRef.current?.flyToBounds(bounds, { padding: [30, 30], maxZoom: 8, duration: 0.6 })
      }
      updateMarkers()
    } else if (noLayerRef.current && activeCountry === "NO") {
      noLayerRef.current.setStyle((feature) => {
        const code = String((feature?.properties as { code?: string } | undefined)?.code ?? "")
        const isSelected = selected === code
        return { fillColor: "#ede9fe", fillOpacity: isSelected ? 0.85 : 0.58, color: isSelected ? "#4c1d95" : "#6d28d9", weight: isSelected ? 3 : 1.2 }
      })
      if (selected) {
        const layer = noRegionByCode.current[selected]
        const bounds = layer ? safeBounds(layer.getBounds()) : null
        if (bounds) mapRef.current?.flyToBounds(bounds, { padding: [30, 30], maxZoom: 7, duration: 0.6 })
      }
      updateMarkers()
    } else if (seLayerRef.current && activeCountry === "SE") {
      seLayerRef.current.setStyle((feature) => { const code = String((feature?.properties as { code?: string } | undefined)?.code ?? ""); const isSelected = selected === code; return { fillColor: "#ccfbf1", fillOpacity: isSelected ? 0.85 : 0.58, color: isSelected ? "#115e59" : "#0f766e", weight: isSelected ? 3 : 1.2 } })
      if (selected) { const bounds = seRegionByCode.current[selected] ? safeBounds(seRegionByCode.current[selected].getBounds()) : null; if (bounds) mapRef.current?.flyToBounds(bounds, { padding: [30, 30], maxZoom: 7, duration: 0.6 }) }
      updateMarkers()
    } else if (dkLayerRef.current && activeCountry === "DK") {
      dkLayerRef.current.setStyle((feature) => { const code = String((feature?.properties as { code?: string } | undefined)?.code ?? ""); const isSelected = selected === code; return { fillColor: "#fef3c7", fillOpacity: isSelected ? 0.85 : 0.58, color: isSelected ? "#92400e" : "#b45309", weight: isSelected ? 3 : 1.2 } })
      if (selected) { const bounds = dkRegionByCode.current[selected] ? safeBounds(dkRegionByCode.current[selected].getBounds()) : null; if (bounds) mapRef.current?.flyToBounds(bounds, { padding: [30, 30], maxZoom: 8, duration: 0.6 }) }
      updateMarkers()
    } else if (fiLayerRef.current && activeCountry === "FI") {
      fiLayerRef.current.setStyle((feature) => { const code = String((feature?.properties as { code?: string } | undefined)?.code ?? ""); const isSelected = selected === code; return { fillColor: "#e0f2fe", fillOpacity: isSelected ? 0.85 : 0.58, color: isSelected ? "#075985" : "#0369a1", weight: isSelected ? 3 : 1.2 } })
      if (selected) { const bounds = fiRegionByCode.current[selected] ? safeBounds(fiRegionByCode.current[selected].getBounds()) : null; if (bounds) mapRef.current?.flyToBounds(bounds, { padding: [30, 30], maxZoom: 7, duration: 0.6 }) }
      updateMarkers()
    } else if (chLayerRef.current && activeCountry === "CH") {
      chLayerRef.current.setStyle((feature) => { const code = String((feature?.properties as { code?: string } | undefined)?.code ?? ""); const isSelected = selected === code; return { fillColor: "#fce7f3", fillOpacity: isSelected ? 0.85 : 0.58, color: isSelected ? "#831843" : "#be185d", weight: isSelected ? 3 : 1.2 } })
      if (selected) { const bounds = chRegionByCode.current[selected] ? safeBounds(chRegionByCode.current[selected].getBounds()) : null; if (bounds) mapRef.current?.flyToBounds(bounds, { padding: [30, 30], maxZoom: 8, duration: 0.6 }) }
      updateMarkers()
    } else if (aeLayerRef.current && activeCountry === "AE") {
      aeLayerRef.current.setStyle((feature) => { const code = String((feature?.properties as { code?: string } | undefined)?.code ?? ""); const isSelected = selected === code; return { fillColor: "#fef3c7", fillOpacity: isSelected ? 0.85 : 0.55, color: isSelected ? "#92400e" : "#d97706", weight: isSelected ? 3 : 1.2 } })
      if (selected) { const bounds = aeRegionByCode.current[selected] ? safeBounds(aeRegionByCode.current[selected].getBounds()) : null; if (bounds) mapRef.current?.flyToBounds(bounds, { padding: [30, 30], maxZoom: 9, duration: 0.6 }) }
    }
    // 주가 바뀌면 그 주의 SA4 지역을 (재)렌더한다.
    renderSA4()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  useEffect(() => {
    if (!frCityLayerRef.current) return
    frCityLayerRef.current.setStyle((feature) => {
      const code = String((feature?.properties as { code?: string } | undefined)?.code ?? "")
      const active = activeCountry === "FR" && selectedFranceCity === code
      return { fillColor: "#fbbf24", fillOpacity: active ? 0.55 : 0.18, color: active ? "#92400e" : "#b45309", weight: active ? 2.5 : 1 }
    })
  }, [selectedFranceCity, activeCountry])

  useEffect(() => {
    if (!esCityLayerRef.current) return
    esCityLayerRef.current.setStyle((feature) => {
      const code = String((feature?.properties as { code?: string } | undefined)?.code ?? "")
      const active = activeCountry === "ES" && selectedSpainCity === code
      return { fillColor: "#9a3412", fillOpacity: active ? 1 : 0.78, color: active ? "#431407" : "#fff7ed", weight: active ? 2.5 : 1 }
    })
  }, [selectedSpainCity, activeCountry])

  // 선택된 지역(SA4) 변경 → 지역 폴리곤 하이라이트 + 해당 지역으로 줌인.
  useEffect(() => {
    selectedSA4Ref.current = selectedSA4
    const layer = sa4LayerRef.current
    if (!layer) return
    layer.setStyle((feature) => sa4StyleFor(feature?.properties?.SA4_CODE as string))
    if (selectedSA4) {
      const lyr = sa4ByCode.current[selectedSA4.code]
      const b = lyr ? safeBounds(lyr.getBounds()) : null
      if (b) mapRef.current?.flyToBounds(b, { padding: [40, 40], maxZoom: 8, duration: 0.6 })
    }

  }, [selectedSA4])

  // Tab(shortage/pay/whv) 변경 → SA4 스타일 재적용
  useEffect(() => {
    const layer = sa4LayerRef.current
    if (!layer) return
    layer.setStyle((feature) => sa4StyleFor(feature?.properties?.SA4_CODE as string))

  }, [tab])

  return (
    <div className="relative h-full w-full">
      <style>{`.leaflet-interactive:focus { outline: none !important; }
        .campcareer-map-zoom { margin-bottom: 3.75rem !important; }`}</style>
      <div
        ref={containerRef}
        className="h-full w-full bg-[#e8f4fd]"
        style={{ backgroundColor: "#edf4fb" }}
        aria-label="Interactive career and salary map"
      />

      <button
        type="button"
        onClick={onReset}
        className="absolute bottom-3 right-3 z-[1000] inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/95 px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-slate-900"
      >
        <Maximize2 className="h-3.5 w-3.5" />
        {t.map.seeAll}
      </button>

      {activeCountry === "AU" && tab === "whv" && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm">
          <p className="mb-1.5 text-[11px] font-medium text-slate-500">Second Visa Eligibility</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: lerpColor(1.0) }} />
              <span className="text-[11px] text-slate-600">Eligible</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: lerpColor(0.45) }} />
              <span className="text-[11px] text-slate-600">Partially eligible</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: "#94a3b8" }} />
              <span className="text-[11px] text-slate-600">Not eligible</span>
            </div>
          </div>
        </div>
      )}
      {activeCountry === "KR" && !krBoundaryReady && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] max-w-xs rounded-lg border border-amber-200 bg-amber-50/95 px-3 py-2 text-[11px] leading-5 text-amber-900 shadow-sm backdrop-blur-sm">
          공식 시·도 경계 API를 연결하면 지도에서 17개 지역을 직접 선택할 수 있습니다. 현재는 상단 시·도 선택기로 동일한 정보를 볼 수 있습니다.
        </div>
      )}
      {activeCountry === "AU" && tab !== "whv" && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm">
          <p className="mb-1 text-[11px] font-medium text-slate-500">{t.map.legendShortageCount}</p>
          <div
            className="h-2 w-28 rounded-full"
            style={{ background: `linear-gradient(to right, ${lerpColor(0)}, ${lerpColor(1)})` }}
          />
          <div className="mt-1 flex justify-between text-[10px] tabular-nums text-slate-400">
            <span>{minCount}</span>
            <span>{maxCount}</span>
          </div>
        </div>
      )}
    </div>
  )
}
