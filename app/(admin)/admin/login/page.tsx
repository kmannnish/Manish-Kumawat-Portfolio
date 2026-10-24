'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()

  const urlError = searchParams.get('error')
  const redirectTo = searchParams.get('redirectTo') || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(
    urlError === 'unauthorized'
      ? 'Access denied. Your account is not an authorized administrator.'
      : null
  )

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrorMessage(error.message)
        setLoading(false)
        return
      }

      if (!data.user) {
        setErrorMessage('Unable to sign in. Please verify your credentials.')
        setLoading(false)
        return
      }

      // Verify membership in the admins table (Law #2: explicit admin validation)
      const { data: adminRecord, error: adminError } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (adminError || !adminRecord) {
        // Authenticated user is NOT an admin
        await supabase.auth.signOut()
        setErrorMessage('Access denied. Your account is not authorized as an administrator.')
        setLoading(false)
        return
      }

      toast.success('Signed in successfully.')
      router.push(redirectTo)
      router.refresh()
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred.')
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm font-display">
      <div className="mb-8">
        <Link
          href="/"
          className="text-xs text-graphite hover:text-ink transition-colors mb-6 inline-block"
        >
          ← Return to portfolio
        </Link>
        <h1 className="text-2xl font-medium tracking-tight text-ink">
          Admin Sign in
        </h1>
        <p className="mt-1.5 text-xs text-graphite">
          Authorized console for Manish Kumawat portfolio management.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-3.5 rounded-xs border border-mark bg-mark/5 text-xs text-mark font-medium leading-relaxed"
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium text-ink mb-1.5"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-xs text-ink bg-transparent border border-rule rounded-xs focus:outline-hidden focus:border-signal focus:ring-1 focus:ring-signal transition-colors placeholder:text-graphite/50"
            placeholder="admin@manishkumawat.com"
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium text-ink mb-1.5"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 text-xs text-ink bg-transparent border border-rule rounded-xs focus:outline-hidden focus:border-signal focus:ring-1 focus:ring-signal transition-colors placeholder:text-graphite/50"
            placeholder="••••••••••••"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 px-4 text-xs font-medium text-paper bg-ink rounded-xs hover:bg-ink/90 active:bg-ink transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="inline-block w-3 h-3 border border-paper border-t-transparent rounded-full animate-spin" />
              <span>Verifying credentials...</span>
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-rule text-center">
        <span className="text-xxs text-graphite">
          Access restricted to authorized administrators.
        </span>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-paper">
      <Suspense
        fallback={
          <div className="w-full max-w-sm font-display text-center text-xs text-graphite py-12">
            Loading sign in...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  )
}
