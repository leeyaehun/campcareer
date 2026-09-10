import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Browser-compatible public-data client. It may be used by server code for
// intentionally public read models, but never for raw, staging, or privileged
// product data. Those reads must stay behind a server-only read model.
// Environment checks are delayed until the first real request so CI can build
// route modules without production credentials.
// 이렇게 하면 GitHub CI처럼 Supabase 자격 증명이 없는 환경에서도 Next.js가
// API route와 page module을 안전하게 분석하고 production build를 수행할 수 있다.
// 쓰기용 service role 클라이언트는 '@/lib/supabase-admin' (server-only) 참조.
let client: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Supabase public environment variables are required when a database request is executed.'
    )
  }

  client = createClient(url, anonKey)
  return client
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    const activeClient = getSupabaseClient()
    const value = Reflect.get(activeClient, property, activeClient)
    return typeof value === 'function' ? value.bind(activeClient) : value
  },
})

// 타입 정의
// US 스키마(unit_id) 기준 — 타국 colleges_* 테이블은 institution_id를 사용함.
export type CollegeUS = {
  id: string
  unit_id: string
  name: string
  state: string
  city: string
  school_type: 'public' | 'private_nonprofit' | 'private_forprofit'
  enrollment: number
  admission_rate: number
  graduation_rate: number
  avg_net_price: number
  median_earnings: number | null
}

export type City = {
  id: string
  city_slug: string
  name: string
  state: string
  cost_of_living_index: number | null
  rent_median: number | null
  synced_at: string | null
}

export type RoiExplorer = {
  id: string
  roi_score: number
  payback_years: number
  net_salary: number
  college_name: string
  college_state: string
  school_type: string
  tuition: number
  field_name: string
  median_earnings: number
  city_name: string
  cost_of_living_index: number
}
