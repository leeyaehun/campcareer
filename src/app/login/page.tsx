'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { getCareerSaveIntentFromNext } from '@/lib/auth/career-save-intent'
import { getSafeNextPath } from '@/lib/auth/safe-next'
import { getPostLoginDestination } from '@/lib/auth/post-login-destination'
import { getPathwayBackPath } from '@/lib/auth/pathway-next'
import { DEFAULT_LOCALE, localeFromPathname, localizePath } from '@/lib/i18n/config'
import { LOGIN_COPY } from './login-copy'

function LoginPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const requestedNext = searchParams.get('next')
  const locale = localeFromPathname(pathname) ?? DEFAULT_LOCALE
  const next = getSafeNextPath(requestedNext, localizePath('/', locale))
  const saveIntent = getCareerSaveIntentFromNext(next)
  const isSaveIntent = Boolean(saveIntent)
  const backPath = saveIntent?.returnPath ?? getPathwayBackPath(next)
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  function signedInDestination() {
    return saveIntent?.returnPath ?? getPostLoginDestination(next, locale)
  }

  async function completeSaveIntent(userId: string) {
    if (!saveIntent) return true

    const { error } = await supabase
      .from('saved_career_results')
      .upsert(
        {
          user_id: userId,
          country_code: saveIntent.countryCode,
          career_id: saveIntent.careerId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,country_code,career_id', ignoreDuplicates: false },
      )

    if (!error) return true

    setError('You are signed in, but we could not save this career. Go back and try Save again.')
    setIsLoading(false)
    return false
  }

  async function handleGoogle() {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
    if (error) {
      setError(error.message)
      setIsLoading(false)
    }
  }

  async function handleEmail(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    if (mode === 'signin') {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setIsLoading(false)
      } else if (data.user) {
        if (!(await completeSaveIntent(data.user.id))) return
        router.push(signedInDestination())
        router.refresh()
      }
      return
    }

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    })
    if (error) {
      setError(error.message)
    } else if (data.user && data.session) {
      if (!(await completeSaveIntent(data.user.id))) return
      router.push(signedInDestination())
      router.refresh()
      return
    } else {
      setError('Check your email to confirm your account!')
    }
    setIsLoading(false)
  }

  const isSignIn = mode === 'signin'
  const heading = isSaveIntent ? LOGIN_COPY.saveTitle : isSignIn ? LOGIN_COPY.welcome : LOGIN_COPY.signup
  const supporting = isSaveIntent
    ? isSignIn ? LOGIN_COPY.saveSupporting : LOGIN_COPY.saveSignupSupporting
    : isSignIn ? LOGIN_COPY.welcomeSupporting : LOGIN_COPY.signupSupporting

  return (
    <main className="min-h-screen bg-[#fafaf9] px-5 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-[460px]">
        <Link href={localizePath('/', locale)} className="campcareer-wordmark text-[#1b1b1b]" aria-label="CampCareer home">
          CampCareer
        </Link>

        <section className="mt-8 sm:mt-10 sm:rounded-xl sm:border sm:border-campcareer-border sm:bg-white sm:p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-semibold tracking-tight text-campcareer-ink">
              {heading}
            </h1>
            <p className="mt-1.5 text-sm leading-6 text-campcareer-muted">
              {supporting}
            </p>
          </div>

          {isSaveIntent && (
            <div className="mb-6 rounded-lg border border-campcareer-border bg-campcareer-canvas px-4 py-3" aria-label="Career save intent">
              <p className="text-xs font-semibold text-brand">SAVE</p>
              <p className="mt-1 text-sm text-campcareer-ink-secondary">Your career will be saved automatically after sign-in.</p>
            </div>
          )}

          {error && (
            <div
              id="login-message"
              role="alert"
              aria-live="polite"
              className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
                error.includes('Check your email')
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-600'
              }`}
            >
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogle}
            disabled={isLoading}
            className="mb-5 flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-campcareer-border bg-white px-4 py-2.5 text-sm font-medium text-campcareer-ink-secondary transition-colors hover:bg-campcareer-canvas disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="size-4 shrink-0" aria-hidden="true">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
              <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
            </svg>
            {LOGIN_COPY.google}
          </button>

          <div className="mb-5 flex items-center gap-3" aria-hidden="true">
            <div className="flex-1 border-t border-campcareer-border" />
            <span className="whitespace-nowrap text-xs text-campcareer-muted">{LOGIN_COPY.divider}</span>
            <div className="flex-1 border-t border-campcareer-border" />
          </div>

          <form onSubmit={handleEmail} className="space-y-4" aria-busy={isLoading}>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-campcareer-ink-secondary">
                {LOGIN_COPY.email}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                required
                autoComplete="email"
                aria-describedby={error ? 'login-message' : undefined}
                className="min-h-12 w-full rounded-lg border border-campcareer-border px-4 py-2.5 text-sm text-campcareer-ink placeholder:text-campcareer-muted transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label htmlFor="password" className="text-xs font-medium text-campcareer-ink-secondary">
                  {LOGIN_COPY.password}
                </label>
                {isSignIn && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!email) {
                        setError('Enter your email first')
                        return
                      }
                      await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/auth/callback` })
                      setError('Password reset email sent!')
                    }}
                    className="shrink-0 text-xs font-medium text-brand transition-colors hover:text-brand-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
                  >
                    {LOGIN_COPY.forgotPassword}
                  </button>
                )}
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={isSignIn ? 'current-password' : 'new-password'}
                aria-describedby={error ? 'login-message' : undefined}
                className="min-h-12 w-full rounded-lg border border-campcareer-border px-4 py-2.5 text-sm text-campcareer-ink placeholder:text-campcareer-muted transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-brand bg-brand text-sm font-semibold tracking-tight text-white transition-colors hover:bg-brand-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {isSignIn ? LOGIN_COPY.signIn : LOGIN_COPY.createAccount}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-campcareer-muted">
            {isSignIn ? LOGIN_COPY.newAccount : LOGIN_COPY.existingAccount}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(isSignIn ? 'signup' : 'signin')
                setError(null)
              }}
              className="inline-flex items-center gap-0.5 font-medium text-brand transition-colors hover:text-brand-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
            >
              {isSignIn ? LOGIN_COPY.createAccount : LOGIN_COPY.signIn}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </button>
          </p>

          <Link
            href={backPath}
            className="mt-7 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {isSaveIntent ? LOGIN_COPY.backToCareer : LOGIN_COPY.back}
          </Link>
        </section>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafaf9]" aria-busy="true" />}>
      <LoginPageContent />
    </Suspense>
  )
}
