import 'server-only'
import { Resend } from 'resend'

// All CampCareer transactional/alert mail is sent from this verified sender.
export const EMAIL_FROM = 'CampCareer <alerts@campcareer.com>'

// Lazily construct the Resend client so importing this module never throws at
// build/analysis time when RESEND_API_KEY is absent — only an actual send does.
let _resend: Resend | null = null
function client(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error('RESEND_API_KEY is not set')
    _resend = new Resend(key)
  }
  return _resend
}

export interface EmailMessage {
  to: string
  subject: string
  html: string
}

// Send a single email. Throws on failure so callers can decide whether to
// swallow (subscribe flow: never block the subscription) or count (broadcast).
export async function sendEmail(msg: EmailMessage): Promise<void> {
  const { error } = await client().emails.send({
    from: EMAIL_FROM,
    to: msg.to,
    subject: msg.subject,
    html: msg.html,
  })
  if (error) throw new Error(`Resend send failed: ${error.message}`)
}

// Resend's batch endpoint accepts up to 100 messages per call. Callers must
// chunk larger lists themselves (see the broadcast worker).
export async function sendBatch(messages: EmailMessage[]): Promise<void> {
  if (messages.length === 0) return
  if (messages.length > 100) {
    throw new Error(`sendBatch accepts at most 100 messages, got ${messages.length}`)
  }
  const { error } = await client().batch.send(
    messages.map((m) => ({ from: EMAIL_FROM, to: m.to, subject: m.subject, html: m.html }))
  )
  if (error) throw new Error(`Resend batch failed: ${error.message}`)
}
