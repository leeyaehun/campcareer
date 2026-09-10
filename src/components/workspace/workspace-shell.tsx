"use client"

import { Suspense } from "react"
import { usePathname } from "next/navigation"
import { WorkspaceTopbar } from "./workspace-topbar"
import { ContextualSurfaceNotice } from "./contextual-surface-notice"
import { SiteFooter } from "@/components/layout/site-footer"
import { withoutLocalePrefix } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"

type WorkspaceShellProps = {
  children: React.ReactNode
}

export function WorkspaceShell({ children }: WorkspaceShellProps) {
  const pathname = withoutLocalePrefix(usePathname())

  // Career is the focused public product surface. The outer layout supplies
  // the standard CampCareer navigation so no workspace chrome is rendered.
  const isCareerSurface = pathname === "/career" || pathname.startsWith("/career/")
  if (isCareerSurface || pathname === "/careers") return <>{children}</>

  const isCityProfile = pathname.startsWith("/cities/") && !pathname.endsWith("/compare")
  const hasFullBleedHero =
    pathname === "/" ||
    pathname === "/countries" ||
    pathname.startsWith("/countries/") ||
    isCityProfile
  const isComparePage = pathname === "/compare"
  const hideSiteFooter = pathname === "/"

  // Wave 1 removed the equal-tool sidebar. Wave 3 keeps these routes available
  // but explicitly frames them as contextual/secondary surfaces around Career.
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <WorkspaceTopbar />
      <Suspense fallback={null}>
        <ContextualSurfaceNotice pathname={pathname} />
      </Suspense>
      <main
        className={cn(
          "flex-1",
          !hasFullBleedHero && (isComparePage ? "px-4 py-4 sm:px-6 lg:px-8" : "px-4 py-8 sm:px-8 lg:px-10"),
        )}
      >
        <div
          className={cn(
            !hasFullBleedHero &&
              (isComparePage ? "mx-auto w-full max-w-[1440px]" : "mx-auto w-full max-w-6xl"),
          )}
        >
          {children}
        </div>
      </main>
      {!hideSiteFooter && <SiteFooter />}
    </div>
  )
}
