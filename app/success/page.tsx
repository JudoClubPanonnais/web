'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Success() {
  const [lang] = useState(typeof window !== 'undefined' ? localStorage.getItem('lang') || 'fr' : 'fr')
  const router = useRouter()
  const fr = lang === 'fr'

  useEffect(() => {
    const timer = setTimeout(() => router.push('/onboarding'), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 20, textAlign: 'center', padding: 24,
    }}>
      <div style={{ fontSize: 64 }}>🎉</div>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36 }}>
        {fr ? 'Bienvenue !' : 'Welcome!'}
      </h1>
      <p style={{ color: 'var(--text2)', fontSize: 16 }}>
        {fr ? 'Votre abonnement est actif. Redirection en cours...' : 'Your subscription is active. Redirecting...'}
      </p>
    </div>
  )
}
