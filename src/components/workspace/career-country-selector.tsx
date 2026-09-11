"use client"

import { useRouter } from "next/navigation"
import { CountryPill } from "@/components/workspace/country-pill"

export function CareerCountrySelector() {
  const router = useRouter()

  return (
    <CountryPill
      value={null}
      onChange={(code) => {
        router.push(code ? `/careers?country=${code}` : "/careers")
      }}
    />
  )
}
