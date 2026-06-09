'use client'
import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'

interface AuthModalProps {
  mode: 'login' | 'register'
  lang: string
  onClose: () => void
  onSwitch: (mode: 'login' | 'register') => void
}

export default function AuthModal({ mode, lang, onClose, onSwitch }: AuthModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createSupabaseBrowserClient()

  const fr = lang === 'fr'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    if (mode === 'register') {
      if (password !== confirm) { setError(fr ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match'); setLoading(false); return }
      const { error: err } = await supabase.auth.signUp({
        email, password,
        options: { data: { name }, emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (err) { setError(err.message); setLoading(false); return }
      await supabase.from('profiles').upsert({ id: (await supabase.auth.getUser()).data.user?.id, name, email })
      setSuccess(true)
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) { setError(fr ? 'Email ou mot de passe incorrect' : 'Invalid email or password'); setLoading(false); return }
      onClose()
      window.location.reload()
    }
    setLoading(false)
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} className="fade-up-modal" style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 24, padding: 40, width: '100%', maxWidth: 420, position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16, background: 'none',
          border: 'none', color: 'var(--text2)', fontSize: 20, cursor: 'pointer',
        }}>✕</button>

        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, marginBottom: 8 }}>
          {mode === 'register' ? (fr ? 'Créer un compte' : 'Create account') : (fr ? 'Bon retour' : 'Welcome back')}
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 28 }}>
          {mode === 'register'
            ? (fr ? 'Rejoignez Blue Circle aujourd\'hui' : 'Join Blue Circle today')
            : (fr ? 'Connectez-vous à votre compte' : 'Sign in to your account')}
        </p>

        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
            <p style={{ color: 'var(--text)' }}>{fr ? 'Vérifiez votre email pour confirmer votre compte.' : 'Check your email to confirm your account.'}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>
                  {fr ? 'Prénom' : 'First name'}
                </label>
                <input value={name} onChange={e => setName(e.target.value)} required
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
                  placeholder={fr ? 'Votre prénom' : 'Your first name'} />
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
                placeholder="you@example.com" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>
                {fr ? 'Mot de passe' : 'Password'}
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
                placeholder="••••••••" />
            </div>
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>
                  {fr ? 'Confirmer le mot de passe' : 'Confirm password'}
                </label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
                  placeholder="••••••••" />
              </div>
            )}
            {error && <p style={{ color: 'var(--accent3)', fontSize: 13 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{
              background: 'var(--accent)', border: 'none', borderRadius: 10, color: '#fff',
              padding: '14px', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease',
            }}>
              {loading ? '...' : (mode === 'register' ? (fr ? 'Créer mon compte' : 'Create account') : (fr ? 'Se connecter' : 'Sign in'))}
            </button>
          </form>
        )}

        {!success && (
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text2)' }}>
            {mode === 'register'
              ? (fr ? 'Déjà un compte ? ' : 'Already have an account? ')
              : (fr ? 'Pas encore de compte ? ' : 'No account yet? ')}
            <button onClick={() => onSwitch(mode === 'register' ? 'login' : 'register')}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
              {mode === 'register' ? (fr ? 'Se connecter' : 'Sign in') : (fr ? 'S\'inscrire' : 'Sign up')}
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
