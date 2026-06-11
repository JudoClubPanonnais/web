'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function AccesPrivePage() {
  const [id, setId]   = useState('')
  const [pw, setPw]   = useState('')
  const [err, setErr] = useState(false)
  const [ok, setOk]   = useState(false)
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/auth/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: id, password: pw }),
    })
    if (res.ok) {
      setOk(true)
      setTimeout(() => router.push('/'), 800)
    } else {
      setErr(true)
      setTimeout(() => setErr(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1f33] via-[#1e3a5f] to-[#0f1f33] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <Image src="/logo-jcp.jpg" alt="Judo Club Panonnais" width={90} height={90} className="rounded-full shadow-lg" />
        </div>
        <h1 className="text-2xl font-black text-[#1e3a5f] mb-1">Accès privé</h1>
        <p className="text-gray-400 text-sm mb-8">Site en cours de finalisation — accès réservé</p>

        {ok ? (
          <div className="text-green-500 font-semibold text-lg animate-pulse">✅ Accès autorisé — redirection...</div>
        ) : (
          <form onSubmit={submit} className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Identifiant</label>
              <input value={id} onChange={e => setId(e.target.value)} required autoComplete="username"
                className="input-field" placeholder="Identifiant" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input type="password" value={pw} onChange={e => setPw(e.target.value)} required autoComplete="current-password"
                className="input-field" placeholder="••••••••" />
            </div>
            {err && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2 text-center">
                ❌ Identifiant ou mot de passe incorrect
              </div>
            )}
            <button type="submit" className="btn-primary w-full py-3">
              Accéder au site →
            </button>
          </form>
        )}

        <p className="text-xs text-gray-300 mt-8">
          Judo Club Panonnais — Site en cours de finalisation<br/>
          <span className="text-orange-400 text-xs">⚠️ Cette page sera retirée avant la mise en ligne publique</span>
        </p>
      </div>
    </div>
  )
}
