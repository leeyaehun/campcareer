'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { useTranslations } from '@/lib/i18n/locale-provider'
import type { User } from '@supabase/supabase-js'

interface GuestBannerProps {
  user: User | null
}

export default function GuestBanner({ user }: GuestBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const t = useTranslations()

  if (user || dismissed) return null

  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <p className="flex-1 text-sm text-amber-800 leading-relaxed">{t.guestBanner.message}</p>
      <Link
        href="/career"
        className="shrink-0 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold px-3 py-1.5 text-xs transition-colors whitespace-nowrap"
      >
        {t.guestBanner.cta}
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 mt-0.5 text-amber-400 hover:text-amber-700 transition-colors"
        aria-label="dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
