'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [lang, setLang] = useState('fr')
  const [loadingPortal, setLoadingPortal] = useState(false)
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()

  useEffect(() => {
    setLang(localStorage.getItem('lang') || 'fr')
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    setUser(user)

    const [{ data: prof }, { data: sub }, { data: notifs }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').single(),
      supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
    ])
    setProfile(prof)
    setSubscription(sub)
    setNotifications(notifs || [])
    if (notifs?.some(n => !n.read)) {
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handlePortal() {
    setLoadingPortal(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
    setLoadingPortal(false)
  }

  const fr = lang === 'fr'
  const initial = profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'

  const PLAN_NAMES: Record<string, string> = {
    essentiel: 'Essentiel', illimite: 'Illimité', premium: 'Premium', elite: 'Elite'
  }
  const PLAN_PRICES: Record<string, string> = {
    essentiel: '19€/mois', illimite: '39€/mois', premium: '79€/mois', elite: '199€/mois'
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 24px 100px' }}>
      <div className="fade-up" style={{ maxWidth: 560, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, marginBottom: 32 }}>
          {fr ? 'Mon profil' : 'My profile'}
        </h1>

        {/* Avatar + name */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 20, padding: 24, marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 700,
          }}>{initial}</div>
          <div>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 18 }}>
              {profile?.name || user?.email}
            </div>
            {subscription && (
              <div style={{ fontSize: 13, color: '#22C55E', marginTop: 4 }}>
                ● {PLAN_NAMES[subscription.plan_id] || subscription.plan_id}
              </div>
            )}
          </div>
        </div>

        {/* Subscription */}
        {subscription && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 24, marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
              {fr ? 'Abonnement' : 'Subscription'}
            </h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text2)', fontSize: 14 }}>{fr ? 'Plan' : 'Plan'}</span>
              <span style={{ fontSize: 14 }}>{PLAN_NAMES[subscription.plan_id]}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text2)', fontSize: 14 }}>{fr ? 'Tarif' : 'Price'}</span>
              <span style={{ fontSize: 14 }}>{PLAN_PRICES[subscription.plan_id]}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ color: 'var(--text2)', fontSize: 14 }}>{fr ? 'Prochain débit' : 'Next billing'}</span>
              <span style={{ fontSize: 14 }}>
                {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : '—'}
              </span>
            </div>
            <button onClick={handlePortal} disabled={loadingPortal} style={{
              width: '100%', background: 'transparent', border: '1px solid var(--border)',
              borderRadius: 10, color: 'var(--text)', padding: '12px',
              fontFamily: 'DM Sans, sans-serif', fontSize: 14, cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}>
              {loadingPortal ? '...' : (fr ? 'Gérer l\'abonnement' : 'Manage subscription')}
            </button>
          </div>
        )}

        {/* Notifications */}
        {notifications.length > 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 24, marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
              {fr ? 'Notifications' : 'Notifications'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {notifications.map((n: any) => (
                <div key={n.id} style={{
                  padding: '12px', borderRadius: 10,
                  background: n.read ? 'transparent' : 'rgba(27,110,243,0.06)',
                  border: `1px solid ${n.read ? 'var(--border)' : 'rgba(27,110,243,0.2)'}`,
                }}>
                  <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>{n.title}</div>
                  <div style={{ color: 'var(--text2)', fontSize: 13 }}>{n.body}</div>
                  <div style={{ color: 'var(--text3)', fontSize: 11, marginTop: 4 }}>
                    {new Date(n.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }}>
          <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
            {fr ? 'Compte' : 'Account'}
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 20 }}>{user?.email}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={handleLogout} style={{
              background: 'transparent', border: '1px solid var(--border)', borderRadius: 10,
              color: 'var(--text2)', padding: '12px', fontFamily: 'DM Sans, sans-serif',
              fontSize: 14, cursor: 'pointer',
            }}>
              {fr ? 'Se déconnecter' : 'Sign out'}
            </button>
            {subscription && (
              <button onClick={handlePortal} style={{
                background: 'transparent', border: '1px solid rgba(236,72,153,0.3)', borderRadius: 10,
                color: 'var(--accent3)', padding: '12px', fontFamily: 'DM Sans, sans-serif',
                fontSize: 14, cursor: 'pointer',
              }}>
                {fr ? 'Résilier l\'abonnement' : 'Cancel subscription'}
              </button>
            )}
          </div>
        </div>
      </div>
      <BottomNav lang={lang} />
    </div>
  )
}
