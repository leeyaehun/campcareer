import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo-routes.mjs"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private, retired, and non-canonical routes stay out of the index.
        disallow: ["/api/", "/auth/", "/dashboard", "/planner", "/saved", "/documents", "/plans/", "/support/", "/sitemaps/", "/sitemap-index.xml"],
      },
      {
        // 매출에 기여하지 않는 SEO·백링크 크롤러는 전면 차단. (이 목록은
        // src/proxy.ts의 BLOCKED_BOTS_RE와 동일하게 유지한다.)
        userAgent: [
          "AhrefsBot",
          "SemrushBot",
          "MJ12bot",
          "DotBot",
          "BLEXBot",
          "DataForSeoBot",
          "Barkrowler",
          "SeekportBot",
        ],
        disallow: "/",
      },
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/blog/sitemap.xml`,
      `${SITE_URL}/programs/ca/sitemap.xml`,
    ],
  }
}
