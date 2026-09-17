"use client"

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
  if (isCareerSurface || pathname === "/careers") {
    return (
      <div className="bg-campcareer-canvas">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-8 sm:pt-10 lg:px-10">
          {children}
        </div>
      </div>
    )
  }

  // Discovery surfaces (/countries, /programs, /institutions) are workspace
  // routes: the outer layout bypasses public navigation, so they keep the
  // workspace topbar, contextual notice and footer — but share the Careers
  // canvas + container treatment for a consistent public look.
  const isDiscoverySurface =
    pathname === "/countries" ||
    pathname === "/programs" ||
    pathname === "/institutions"

  const isCityProfile = pathname.startsWith("/cities/") && !pathname.endsWith("/compare")
  const hasFullBleedHero =
    pathname === "/" ||
    (pathname.startsWith("/countries/") && !isDiscoverySurface) ||
    isCityProfile
  const isComparePage = pathname === "/compare"
  const hideSiteFooter = pathname === "/"

  // Wave 1 removed the equal-tool sidebar. Wave 3 keeps these routes available
  // but explicitly frames them as contextual/secondary surfaces around Career.
  return (
    <div className={cn("flex min-h-screen flex-col", isDiscoverySurface ? "bg-campcareer-canvas" : "bg-white")}>
      <WorkspaceTopbar />
      <ContextualSurfaceNotice pathname={pathname} />
      <main
        className={cn(
          "flex-1",
          !hasFullBleedHero && (isComparePage ? "px-4 py-4 sm:px-6 lg:px-8" : "px-4 py-8 sm:px-8 lg:px-10"),
          isDiscoverySurface && "px-0 py-0 sm:px-0 sm:py-0",
        )}
      >
        <div
          className={cn(
            !isDiscoverySurface &&
              !hasFullBleedHero &&
              (isComparePage ? "mx-auto w-full max-w-[1440px]" : "mx-auto w-full max-w-6xl"),
            isDiscoverySurface && "mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-8 sm:pt-10 lg:px-10",
          )}
        >
          {children}
        </div>
      </main>
      {!hideSiteFooter && <SiteFooter />}
    </div>
  )
}
