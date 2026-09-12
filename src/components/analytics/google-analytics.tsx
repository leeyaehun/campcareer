"use client"

import Script from "next/script"
import { isGoogleAnalyticsMeasurementId } from "@/lib/analytics"

/** Rendered only inside the existing affirmative-consent boundary. */
export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  if (!isGoogleAnalyticsMeasurementId(measurementId)) return null

  return (
    <>
      <Script id="campcareer-ga4-loader" strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} />
      <Script id="campcareer-ga4-config" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};window.gtag=gtag;gtag('js',new Date());gtag('config','${measurementId}',{send_page_view:true});`}
      </Script>
    </>
  )
}
