const EMPLOYER_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function normalizeEmployerSlug(value: string | null | undefined) {
  if (!value) return null
  const slug = value.trim().toLowerCase()
  return EMPLOYER_SLUG_PATTERN.test(slug) ? slug : null
}

export function ieEmployerDirectoryPath() {
  return "/countries/ie/employers"
}

export function ieEmployerDetailPath(slug: string) {
  const normalizedSlug = normalizeEmployerSlug(slug)
  if (!normalizedSlug) throw new Error(`Invalid employer slug: ${slug}`)
  return `/countries/ie/employers/${normalizedSlug}`
}

export function ieEmployerDirectoryFilterPath(industrySlug: string | null) {
  if (!industrySlug) return ieEmployerDirectoryPath()
  const params = new URLSearchParams({ industry: industrySlug })
  return `${ieEmployerDirectoryPath()}?${params.toString()}`
}
