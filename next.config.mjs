import { LEGACY_SEO_REDIRECTS } from "./src/lib/seo-routes.mjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
  async redirects() {
    return [
      // Canonical SEO replacements are exact and permanent. Keep them before
      // the broader retired-funnel rules below so legacy roots do not get
      // swallowed by temporary redirects.
      ...LEGACY_SEO_REDIRECTS,

      // Retired product surfaces return visitors to the current product root.
      { source: "/home/:path*", destination: "/", permanent: false },
      { source: "/fifo/:path*", destination: "/", permanent: false },
      { source: "/planner/:path*", destination: "/", permanent: false },
      { source: "/myplan/:path*", destination: "/", permanent: false },
      { source: "/dashboard/:path*", destination: "/", permanent: false },
      { source: "/plans/:path*", destination: "/", permanent: false },
      { source: "/applications/:path*", destination: "/", permanent: false },
      { source: "/budget/:path*", destination: "/", permanent: false },
      { source: "/english/:path*", destination: "/", permanent: false },
      { source: "/research/:path*", destination: "/", permanent: false },
      { source: "/report/:path*", destination: "/", permanent: false },
      { source: "/reports/:path*", destination: "/", permanent: false },
      { source: "/degree-risk/:path*", destination: "/", permanent: false },
      { source: "/decision-brief/:path*", destination: "/", permanent: false },
      { source: "/explore/:path*", destination: "/", permanent: false },
      { source: "/career-path/:path*", destination: "/", permanent: false },
      { source: "/games/:path*", destination: "/", permanent: false },
      { source: "/timeline/:path*", destination: "/", permanent: false },
      { source: "/checklist/:path*", destination: "/", permanent: false },
      { source: "/documents/:path*", destination: "/", permanent: false },
      { source: "/saved/:path*", destination: "/", permanent: false },
      { source: "/rankings/:path*", destination: "/", permanent: false },

      // Raw country, university, and major research is not a primary public
      // product until it is assembled into a source-backed Career decision.
      { source: "/au/:path*", destination: "/", permanent: false },
      { source: "/fields/:path*", destination: "/", permanent: false },
      { source: "/study/:path*", destination: "/", permanent: false },
      { source: "/study-options/:path*", destination: "/", permanent: false },
      { source: "/majors/:path*", destination: "/", permanent: false },
      { source: "/universities/:path*", destination: "/", permanent: false },
      { source: "/roi-explorer/:path*", destination: "/", permanent: false },
      { source: "/:country(au|ca|us|uk|de|nl|ie|be|sg|kr|jp|fr|es|nz|no|se|dk|fi|ch|ae)/:path*", destination: "/", permanent: false },
    ]
  },
}

export default nextConfig
