'use client'
import { useState } from 'react'

interface AgeGateProps {
  lang: string
  onConfirm: () => void
}

export default function AgeGate({ lang, onConfirm }: AgeGateProps) {
  const [denied, setDenied] = useState(false)
  const fr = lang === 'fr'

  function handleConfirm() {
    localStorage.setItem('age_verified', '1')
    onConfirm()
  }

  if (denied) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: '#fff', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column', gap: 16,
      }}>
        <p style={{ color: '#333', fontFamily: 'DM Sans, sans-serif', fontSize: 18 }}>
          {fr ? 'Accès réservé aux personnes âgées de 18 ans et plus.' : 'Access restricted to adults 18 years and older.'}
        </p>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'radial-gradient(ellipse at 20% 50%, rgba(27,110,243,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(108,99,255,0.12) 0%, transparent 60%), var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 24, padding: 24, textAlign: 'center',
    }}>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700 }}>
        blue<span style={{ color: 'var(--accent)' }}>●</span>circle
      </div>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 600 }}>
        {fr ? 'Vérification d\'âge' : 'Age Verification'}
      </h1>
      <p style={{ color: 'var(--text2)', maxWidth: 380, lineHeight: 1.6 }}>
        {fr
          ? 'Ce site contient du contenu réservé aux adultes. Vous devez avoir 18 ans ou plus pour y accéder.'
          : 'This site contains adult content. You must be 18 or older to access it.'}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
        <button onClick={handleConfirm} style={{
          background: 'var(--accent)', border: 'none', borderRadius: 10, color: '#fff',
          padding: '16px 24px', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: 15,
          cursor: 'pointer', transition: 'all 0.2s ease',
        }}>
          {fr ? 'J\'ai 18 ans ou plus — Entrer' : 'I am 18 or older — Enter'}
        </button>
        <button onClick={() => setDenied(true)} style={{
          background: 'transparent', border: '1px solid var(--border)', borderRadius: 10,
          color: 'var(--text2)', padding: '14px 24px', fontFamily: 'DM Sans, sans-serif',
          fontWeight: 500, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s ease',
        }}>
          {fr ? 'J\'ai moins de 18 ans' : 'I am under 18'}
        </button>
      </div>
    </div>
  )
}
