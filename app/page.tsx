'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import AgeGate from '@/components/AgeGate'
import Navbar from '@/components/Navbar'
import AuthModal from '@/components/AuthModal'
import BottomNav from '@/components/BottomNav'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { PLANS } from '@/lib/stripe'

export default function Home() {
  const [ageVerified, setAgeVerified] = useState<boolean | null>(null)
  const [lang, setLang] = useState('fr')
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null)
  const [user, setUser] = useState<any>(null)
  const [cgvOpen, setCgvOpen] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    const verified = localStorage.getItem('age_verified')
    setAgeVerified(!!verified)
    const savedLang = localStorage.getItem('lang') || 'fr'
    setLang(savedLang)
    supabase.auth.getUser().then(({ data }: any) => setUser(data.user))
  }, [])

  function toggleLang() {
    const newLang = lang === 'fr' ? 'en' : 'fr'
    setLang(newLang)
    localStorage.setItem('lang', newLang)
  }

  async function handlePlanClick(planId: string) {
    if (!user) { setAuthMode('register'); return }
    setLoadingPlan(planId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setLoadingPlan(null)
    }
  }

  const fr = lang === 'fr'

  if (ageVerified === null) return null
  if (!ageVerified) return <AgeGate lang={lang} onConfirm={() => setAgeVerified(true)} />

  return (
    <>
      <Navbar lang={lang} onLangToggle={toggleLang} onOpenLogin={() => setAuthMode('login')} onOpenRegister={() => setAuthMode('register')} />
      {authMode && (
        <AuthModal mode={authMode} lang={lang} onClose={() => setAuthMode(null)} onSwitch={setAuthMode} />
      )}

      {/* Hero */}
      <section className="fade-up" style={{
        minHeight: 'calc(100vh - 60px)', marginTop: 60,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '60px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse at 20% 50%, rgba(27,110,243,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(108,99,255,0.08) 0%, transparent 60%)',
      }}>
        {/* Orbe central */}
        <div className="orb-breathe" style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(27,110,243,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Badge animé */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32,
          background: 'rgba(27,110,243,0.1)', border: '1px solid rgba(27,110,243,0.3)',
          borderRadius: 100, padding: '6px 16px',
        }}>
          <span className="dot-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#1B6EF3', display: 'inline-block' }} />
          <span style={{ fontSize: 13, color: '#93C5FD', fontFamily: 'DM Sans, sans-serif' }}>
            {fr ? 'Expérience IA de compagnie intime' : 'Intimate AI companion experience'}
          </span>
        </div>

        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 20, maxWidth: 700 }}>
          {fr ? <>L'intimité <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>réinventée</em></> : <>Intimacy <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>reinvented</em></>}
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 18, maxWidth: 500, lineHeight: 1.6, marginBottom: 40 }}>
          {fr
            ? 'Découvrez une connexion authentique avec une IA de compagnie conçue pour vous.'
            : 'Experience an authentic connection with an AI companion designed for you.'}
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => setAuthMode('register')} style={{
            background: 'var(--accent)', border: 'none', borderRadius: 10,
            color: '#fff', padding: '16px 32px', fontFamily: 'DM Sans, sans-serif',
            fontWeight: 500, fontSize: 16, cursor: 'pointer', transition: 'all 0.2s ease',
            boxShadow: '0 0 40px rgba(27,110,243,0.25)',
          }}
            onMouseEnter={e => { (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.target as HTMLButtonElement).style.background = '#2979ff' }}
            onMouseLeave={e => { (e.target as HTMLButtonElement).style.transform = 'none'; (e.target as HTMLButtonElement).style.background = 'var(--accent)' }}>
            {fr ? 'Commencer maintenant' : 'Start now'}
          </button>
          <button onClick={() => setAuthMode('login')} style={{
            background: 'transparent', border: '1px solid var(--border)', borderRadius: 10,
            color: 'var(--text)', padding: '16px 32px', fontFamily: 'DM Sans, sans-serif',
            fontWeight: 500, fontSize: 16, cursor: 'pointer', transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => (e.target as HTMLButtonElement).style.borderColor = '#fff'}
            onMouseLeave={e => (e.target as HTMLButtonElement).style.borderColor = 'var(--border)'}>
            {fr ? 'Se connecter' : 'Sign in'}
          </button>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 40, textAlign: 'center', marginBottom: 16 }}>
          {fr ? 'Choisissez votre expérience' : 'Choose your experience'}
        </h2>
        <p style={{ color: 'var(--text2)', textAlign: 'center', marginBottom: 48, fontSize: 16 }}>
          {fr ? 'Des formules adaptées à vos envies' : 'Plans tailored to your desires'}
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 24,
        }}>
          {Object.values(PLANS).map(plan => (
            <PlanCard key={plan.id} plan={plan} lang={lang} loading={loadingPlan === plan.id} onClick={() => handlePlanClick(plan.id)} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '40px 24px',
        textAlign: 'center', color: 'var(--text3)', fontSize: 12,
      }}>
        © 2025 Blue Circle SAS ·{' '}
        <button onClick={() => setCgvOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>CGV</button>
        {' · '}
        <a href="mailto:contact@bluecircle.app" style={{ color: 'var(--text3)' }}>contact@bluecircle.app</a>
        {' · '}
        {fr ? 'Réservé aux +18 ans' : 'Adults 18+ only'}
      </footer>

      {cgvOpen && <CGVModal lang={lang} onClose={() => setCgvOpen(false)} />}

      {user && <BottomNav lang={lang} />}
    </>
  )
}

function PlanCard({ plan, lang, loading, onClick }: { plan: any; lang: string; loading: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const fr = lang === 'fr'

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: plan.popular
          ? 'linear-gradient(135deg, rgba(108,99,255,0.08) 0%, var(--surface) 100%)'
          : 'var(--surface)',
        border: `1px solid ${hovered ? 'var(--accent)' : plan.popular ? 'var(--accent2)' : 'var(--border)'}`,
        borderRadius: 20, padding: '32px 24px', position: 'relative',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 0 40px rgba(27,110,243,0.25)' : 'none',
        transition: 'all 0.2s ease',
      }}>
      {plan.popular && (
        <div style={{
          textAlign: 'center', marginBottom: 16,
        }}>
          <span style={{
            background: 'linear-gradient(135deg, var(--accent2), var(--accent))',
            borderRadius: 100, padding: '4px 14px', fontSize: 11,
            fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: '#fff',
          }}>
            {fr ? 'Populaire' : 'Popular'}
          </span>
        </div>
      )}
      <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text3)', marginBottom: 12, fontFamily: 'DM Sans, sans-serif' }}>
        {plan.name}
      </div>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 44, fontWeight: 700, marginBottom: 4 }}>
        {plan.price}€
      </div>
      <div style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 24 }}>{fr ? '/ mois' : '/ month'}</div>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {plan.features.map((f: string) => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text2)', fontSize: 14 }}>
            <span style={{ color: 'var(--accent)' }}>✦</span> {f}
          </li>
        ))}
      </ul>
      <button onClick={onClick} disabled={loading} style={{
        width: '100%', background: plan.popular ? 'var(--accent2)' : 'var(--accent)',
        border: 'none', borderRadius: 10, color: '#fff', padding: '12px',
        fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: 14,
        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
        transition: 'all 0.2s ease',
      }}>
        {loading ? '...' : (fr ? 'Choisir ce plan' : 'Choose this plan')}
      </button>
    </div>
  )
}

function CGVModal({ lang, onClose }: { lang: string; onClose: () => void }) {
  const fr = lang === 'fr'
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 20, padding: 40, maxWidth: 600, width: '100%',
        maxHeight: '80vh', overflowY: 'auto', position: 'relative',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text2)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, marginBottom: 20 }}>
          {fr ? 'Conditions Générales de Vente' : 'Terms and Conditions'}
        </h2>
        <div style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7 }}>
          <p><strong style={{ color: 'var(--text)' }}>Blue Circle SAS</strong> — TVA FR12345678900</p>
          <br />
          <p>Les présentes CGV régissent l'utilisation des services Blue Circle. En vous inscrivant, vous acceptez ces conditions.</p>
          <br />
          <p><strong style={{ color: 'var(--text)' }}>Abonnements</strong> : Les abonnements sont mensuels et renouvelés automatiquement. Vous pouvez résilier à tout moment depuis votre profil.</p>
          <br />
          <p><strong style={{ color: 'var(--text)' }}>Droit de rétractation</strong> : Vous disposez de 14 jours à compter de la souscription pour exercer votre droit de rétractation, sauf si vous avez commencé à utiliser le service.</p>
          <br />
          <p><strong style={{ color: 'var(--text)' }}>Données personnelles</strong> : Vos données sont traitées conformément au RGPD. Nous ne revendons jamais vos données.</p>
          <br />
          <p>Contact : <a href="mailto:contact@bluecircle.app" style={{ color: 'var(--accent)' }}>contact@bluecircle.app</a></p>
        </div>
      </div>
    </div>
  )
}
