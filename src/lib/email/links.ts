// Absolute URLs for emails and flow pages. NEXT_PUBLIC_SITE_URL is set per
// environment (e.g. https://campcareer.com); fall back to the production origin
// so links are never relative in mail.
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://campcareer.com').replace(/\/+$/, '')
}

export function confirmUrl(token: string): string {
  return `${siteUrl()}/api/subscribe/confirm?token=${encodeURIComponent(token)}`
}

export function unsubscribeUrl(token: string): string {
  return `${siteUrl()}/api/subscribe/unsubscribe?token=${encodeURIComponent(token)}`
}
