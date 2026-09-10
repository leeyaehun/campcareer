import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'

// ── Email design tokens ──────────────────────────────────────────────────────
// Mirrors the site's restrained tone: pure white, a single cobalt blue, a serif
// heading (Georgia — the web-safe stand-in for Fraunces in mail clients), and
// sentence case throughout.
const BLUE = '#2563EB'
const INK = '#0f172a'
const BODY = '#334155'
const MUTED = '#94a3b8'
const BORDER = '#e2e8f0'
const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
const CONTACT = 'contact@campcareer.com'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Admin-authored broadcast body → safe HTML: escape, then keep paragraph breaks.
function bodyToHtml(text: string): string {
  return escapeHtml(text.trim())
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${BODY};">${p.replace(/\n/g, '<br>')}</p>`)
    .join('')
}

// Localized "United States visa-policy alerts (Computer Science)" style phrase,
// used in the intro and the CAN-SPAM/GDPR footer reason line.
function targetLabel(locale: Locale, country: string | null, field: string | null): string {
  const dict = getDictionary(locale)
  const names = dict.degreeRisk.result.countries as Record<string, string>
  const countryName = country && names[country] ? names[country] : null
  const fieldName =
    field && (dict.degreeRisk.options as Record<string, string>)[field]
      ? (dict.degreeRisk.options as Record<string, string>)[field]
      : field || null

  const base =
    locale === 'ko'
      ? country === 'all'
        ? '모든 국가 비자정책 알림'
        : countryName
          ? `${countryName} 비자정책 알림`
          : '비자정책 알림'
      : country === 'all'
        ? 'visa-policy alerts for all countries'
        : countryName
          ? `${countryName} visa-policy alerts`
          : 'visa-policy alerts'

  return fieldName ? `${base} (${fieldName})` : base
}

interface Copy {
  confirmSubject: string
  confirmHeading: string
  confirmIntro: (target: string) => string
  confirmCta: string
  confirmIgnore: string
  alertCta: string
  unsubscribe: string
  footerConfirm: (target: string) => string
  footerAlert: (target: string) => string
  contactPrefix: string
}

const COPY: Record<Locale, Copy> = {
  en: {
    confirmSubject: 'Confirm your CampCareer visa-policy alerts',
    confirmHeading: 'Confirm your subscription',
    confirmIntro: (t) =>
      `You asked CampCareer to email you when ${t} change. Confirm below and we'll let you know the moment the rules move — nothing is sent until you do.`,
    confirmCta: 'Confirm subscription',
    confirmIgnore:
      "If you didn't request this, you can safely ignore this email — no subscription becomes active until it's confirmed.",
    alertCta: 'Open CampCareer',
    unsubscribe: 'Unsubscribe',
    footerConfirm: (t) => `You're receiving this because this address was entered to subscribe to ${t} on CampCareer.`,
    footerAlert: (t) => `You're receiving this because you subscribed to ${t} on CampCareer.`,
    contactPrefix: 'Questions?',
  },
  ko: {
    confirmSubject: 'CampCareer 비자정책 알림 구독을 확인해 주세요',
    confirmHeading: '구독을 확인해 주세요',
    confirmIntro: (t) =>
      `${t} 정책이 바뀌면 이메일로 알려드리도록 CampCareer에 요청하셨습니다. 아래 버튼으로 확인해 주세요 — 확인 전에는 어떤 메일도 보내지 않습니다.`,
    confirmCta: '구독 확인',
    confirmIgnore: '요청하지 않으셨다면 이 메일을 무시하셔도 됩니다 — 확인 전에는 구독이 활성화되지 않습니다.',
    alertCta: 'CampCareer 열기',
    unsubscribe: '구독 취소',
    footerConfirm: (t) => `이 메일은 CampCareer에서 ${t}을(를) 구독하기 위해 이 주소가 입력되어 발송되었습니다.`,
    footerAlert: (t) => `이 메일은 CampCareer에서 ${t}을(를) 구독하셔서 발송되었습니다.`,
    contactPrefix: '문의:',
  },
}

// ── Shared shell ─────────────────────────────────────────────────────────────
function button(url: string, label: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 4px;">
      <tr><td style="border-radius:10px;background:${BLUE};">
        <a href="${url}" target="_blank" rel="noopener noreferrer"
           style="display:inline-block;padding:13px 24px;font-family:${SANS};font-size:14px;font-weight:600;line-height:1;color:#ffffff;text-decoration:none;border-radius:10px;">${escapeHtml(label)}</a>
      </td></tr>
    </table>`
}

function shell(opts: {
  locale: Locale
  subject: string
  preview: string
  heading: string
  contentHtml: string
  footerReason: string
  unsubscribeUrl: string
  unsubscribeLabel: string
  contactPrefix: string
}): string {
  return `<!DOCTYPE html>
<html lang="${opts.locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>${escapeHtml(opts.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(opts.preview)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;">
        <tr><td style="padding-bottom:24px;">
          <span style="font-family:${SERIF};font-size:20px;font-weight:600;color:${BLUE};letter-spacing:-0.01em;">CampCareer</span>
        </td></tr>
        <tr><td>
          <h1 style="margin:0 0 16px;font-family:${SERIF};font-size:24px;font-weight:600;line-height:1.3;color:${INK};">${escapeHtml(opts.heading)}</h1>
          ${opts.contentHtml}
        </td></tr>
        <tr><td style="padding-top:32px;margin-top:32px;border-top:1px solid ${BORDER};">
          <p style="margin:16px 0 8px;font-family:${SANS};font-size:12px;line-height:1.6;color:${MUTED};">
            ${escapeHtml(opts.footerReason)}
          </p>
          <p style="margin:0 0 4px;font-family:${SANS};font-size:12px;line-height:1.6;color:${MUTED};">
            <a href="${opts.unsubscribeUrl}" target="_blank" rel="noopener noreferrer" style="color:#64748b;text-decoration:underline;">${escapeHtml(opts.unsubscribeLabel)}</a>
            &nbsp;·&nbsp;
            ${escapeHtml(opts.contactPrefix)} <a href="mailto:${CONTACT}" style="color:#64748b;text-decoration:underline;">${CONTACT}</a>
          </p>
          <p style="margin:8px 0 0;font-family:${SANS};font-size:12px;line-height:1.6;color:${MUTED};">CampCareer</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export interface RenderedEmail {
  subject: string
  html: string
}

// ── Template 1: double opt-in confirmation ───────────────────────────────────
export function confirmEmail(opts: {
  locale: Locale
  country: string | null
  field: string | null
  confirmUrl: string
  unsubscribeUrl: string
}): RenderedEmail {
  const c = COPY[opts.locale]
  const target = targetLabel(opts.locale, opts.country, opts.field)
  const content = `
    <p style="margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:1.65;color:${BODY};">${escapeHtml(c.confirmIntro(target))}</p>
    ${button(opts.confirmUrl, c.confirmCta)}
    <p style="margin:20px 0 0;font-family:${SANS};font-size:13px;line-height:1.6;color:${MUTED};">${escapeHtml(c.confirmIgnore)}</p>`
  return {
    subject: c.confirmSubject,
    html: shell({
      locale: opts.locale,
      subject: c.confirmSubject,
      preview: c.confirmIntro(target),
      heading: c.confirmHeading,
      contentHtml: content,
      footerReason: c.footerConfirm(target),
      unsubscribeUrl: opts.unsubscribeUrl,
      unsubscribeLabel: c.unsubscribe,
      contactPrefix: c.contactPrefix,
    }),
  }
}

// ── Template 2: policy-change broadcast ──────────────────────────────────────
export function policyAlertEmail(opts: {
  locale: Locale
  country: string | null
  subject: string
  body: string
  siteUrl: string
  unsubscribeUrl: string
}): RenderedEmail {
  const c = COPY[opts.locale]
  const target = targetLabel(opts.locale, opts.country, null)
  const content = `
    ${bodyToHtml(opts.body)}
    ${button(opts.siteUrl, c.alertCta)}`
  return {
    subject: opts.subject,
    html: shell({
      locale: opts.locale,
      subject: opts.subject,
      preview: opts.subject,
      heading: opts.subject,
      contentHtml: content,
      footerReason: c.footerAlert(target),
      unsubscribeUrl: opts.unsubscribeUrl,
      unsubscribeLabel: c.unsubscribe,
      contactPrefix: c.contactPrefix,
    }),
  }
}
