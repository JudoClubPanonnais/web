'use client'
export const dynamic = 'force-dynamic'
import { useEffect, Suspense } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      supabase.auth.exchangeCodeForSession(code).finally(() => {
        router.replace('/')
      })
    } else {
      router.replace('/')
    }
  }, [])

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16,
    }}>
      <div style={{ fontSize: 40 }}>✉️</div>
      <p style={{ color: '#e2e8f0', fontFamily: 'DM Sans, sans-serif', fontSize: 16 }}>
        Validation en cours...
      </p>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  )
}
