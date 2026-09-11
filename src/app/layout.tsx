import type { Metadata } from "next"
import localFont from "next/font/local"
import { Inter } from "next/font/google"
import "./globals.css"
import "./campcareer-brand.css"
import { LayoutShell } from "@/components/layout/layout-shell"
import { DEFAULT_LOCALE } from "@/lib/i18n/config"
import { LocaleProvider } from "@/lib/i18n/locale-provider"
import { LocaleInit } from "@/components/locale-init"
import { PageViewTracker } from "@/components/analytics/page-view-tracker"
import { AnalyticsConsent } from "@/components/analytics-consent"
import { ConsentGatedInsights } from "@/components/consent-gated-insights"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
})

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  preload: false,
})

export const metadata: Metadata = {
  title: {
    default: "CampCareer | Career Scores, Evidence and Entry Paths",
    template: "%s | CampCareer",
  },
  description: "Score careers by country, see the Demand, Pay and Entry evidence behind the verdict, and follow the path into qualifications, programs and jobs.",
  keywords: [
    "career score", "career demand", "career salary", "career entry requirements",
    "career pathways", "work abroad", "international careers", "career programs",
  ],
  authors: [{ name: "CampCareer" }],
  creator: "CampCareer",
  metadataBase: new URL("https://www.campcareer.com"),
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CampCareer",
    title: "CampCareer | Career Scores, Evidence and Entry Paths",
    description: "Know if a career is worth it. See the evidence and exactly how to get there.",
    images: [{ url: "/og-career-path.png", width: 1200, height: 630, alt: "CampCareer — career scores, evidence and entry paths" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampCareer | Career Scores, Evidence and Entry Paths",
    description: "Know if a career is worth it. See the evidence and exactly how to get there.",
    images: ["/og-career-path.png"],
    creator: "@campcareer",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(document.cookie.split("; ").some(function(item){return item.indexOf("cc_analytics_consent=")===0})){document.documentElement.dataset.ccAnalyticsConsent="set"}}catch(e){}`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        <LocaleProvider locale={DEFAULT_LOCALE}>
          <LocaleInit />
          <PageViewTracker />
          <LayoutShell>{children}</LayoutShell>
          <AnalyticsConsent />
        </LocaleProvider>
        <ConsentGatedInsights />
      </body>
    </html>
  )
}
