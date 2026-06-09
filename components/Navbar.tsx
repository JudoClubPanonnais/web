'use client'
import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'

interface NavbarProps {
  lang: string
  onLangToggle: () => void
  onOpenLogin: () => void
  onOpenRegister: () => void
}

export default function Navbar({ lang, onLangToggle, onOpenLogin, onOpenRegister }: NavbarProps) {
  const [user, setUser] = useState<any>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: any) => {
      setUser(data.user)
      if (data.user) fetchUnread(data.user.id)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_: any, session: any) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchUnread(session.user.id)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function fetchUnread(userId: string) {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)
    setUnreadCount(count || 0)
  }

  const initial = user?.user_metadata?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      background: 'rgba(5,8,16,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
          blue<span style={{ color: 'var(--accent)' }}>●</span>circle
        </span>
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onLangToggle} style={{
          fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '1px',
          background: 'none', border: '1px solid var(--border)', borderRadius: 6,
          color: 'var(--text2)', padding: '4px 10px', cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}>
          {lang === 'fr' ? 'EN' : 'FR'}
        </button>
        {user ? (
          <>
            <a href="/profile" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{
                fontSize: 20, cursor: 'pointer', color: 'var(--text2)',
                transition: 'color 0.2s',
              }}>🔔</span>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4, width: 8, height: 8,
                  borderRadius: '50%', background: 'var(--accent3)',
                  animation: 'pulse 2s infinite',
                }} />
              )}
            </a>
            <a href="/profile">
              <button style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                border: 'none', color: '#fff', fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}>{initial}</button>
            </a>
          </>
        ) : (
          <>
            <button onClick={onOpenLogin} style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: 10,
              color: 'var(--text)', padding: '8px 16px', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: 14,
              transition: 'all 0.2s ease',
            }}>
              {lang === 'fr' ? 'Connexion' : 'Login'}
            </button>
            <button onClick={onOpenRegister} style={{
              background: 'var(--accent)', border: 'none', borderRadius: 10,
              color: '#fff', padding: '8px 16px', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: 14,
              transition: 'all 0.2s ease',
            }}>
              {lang === 'fr' ? 'Inscription' : 'Sign up'}
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
