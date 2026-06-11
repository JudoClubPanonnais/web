'use client'
import { useEffect, useState } from 'react'

const PLATFORMS = [
  { key: 'facebook', label: 'Facebook', icon: '📘', placeholder: 'https://www.facebook.com/...' },
  { key: 'instagram', label: 'Instagram', icon: '📷', placeholder: 'https://www.instagram.com/...' },
  { key: 'youtube', label: 'YouTube', icon: '▶️', placeholder: 'https://www.youtube.com/@...' },
  { key: 'twitter', label: 'X (Twitter)', icon: '🐦', placeholder: 'https://x.com/...' },
  { key: 'tiktok', label: 'TikTok', icon: '🎵', placeholder: 'https://www.tiktok.com/@...' },
  { key: 'linkedin', label: 'LinkedIn', icon: '💼', placeholder: 'https://www.linkedin.com/...' },
]

export default function AdminReseaux() {
  const [links, setLinks] = useState<Record<string, string>>({
    facebook: 'https://www.facebook.com/judoclubpanonnais',
    instagram: 'https://www.instagram.com/judoclubpanonnais',
    youtube: 'https://www.youtube.com/@judoclubpanonnais',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/social').then(r => r.json()).then(d => {
      if (d.links) {
        const m: Record<string, string> = {}
        d.links.forEach((l: { platform: string; url: string }) => { m[l.platform] = l.url })
        setLinks(prev => ({ ...prev, ...m }))
      }
    }).catch(() => {})
  }, [])

  async function save() {
    setSaving(true)
    try {
      await fetch('/api/admin/social', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
    setSaving(false)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">📱 Réseaux sociaux</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez les liens des réseaux sociaux affichés sur le site</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Formulaire */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-6">Liens des réseaux</h2>
          <div className="space-y-4">
            {PLATFORMS.map(p => (
              <div key={p.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {p.icon} {p.label}
                </label>
                <input
                  value={links[p.key] || ''}
                  onChange={e => setLinks(prev => ({ ...prev, [p.key]: e.target.value }))}
                  placeholder={p.placeholder}
                  className="input-field"
                />
              </div>
            ))}
          </div>
          <button onClick={save} disabled={saving} className="btn-primary w-full mt-6 disabled:opacity-50">
            {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
          </button>
          {saved && <p className="text-green-600 text-sm mt-2 text-center">✅ Modifications sauvegardées !</p>}
        </div>

        {/* Aperçu */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-6">Aperçu du footer</h2>
          <p className="text-sm text-gray-500 mb-4">Les icônes ci-dessous seront affichées dans le footer du site :</p>
          <div className="bg-gray-800 rounded-2xl p-6">
            <div className="flex gap-3 flex-wrap">
              {PLATFORMS.filter(p => links[p.key]).map(p => (
                <a key={p.key} href={links[p.key]} target="_blank" rel="noopener"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-orange-500 flex items-center justify-center text-lg transition-colors"
                  title={p.label}>
                  {p.icon}
                </a>
              ))}
            </div>
            {Object.values(links).filter(Boolean).length === 0 && (
              <p className="text-gray-500 text-sm">Aucun réseau configuré</p>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-gray-800 text-sm">Liens actifs</h3>
            {PLATFORMS.filter(p => links[p.key]).map(p => (
              <div key={p.key} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                <span>{p.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800">{p.label}</div>
                  <div className="text-xs text-gray-500 truncate">{links[p.key]}</div>
                </div>
                <span className="text-green-500 text-xs">✓ Actif</span>
              </div>
            ))}
            {PLATFORMS.filter(p => !links[p.key]).map(p => (
              <div key={p.key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl opacity-50">
                <span>{p.icon}</span>
                <div className="text-sm text-gray-500">{p.label}</div>
                <span className="text-gray-400 text-xs ml-auto">Non configuré</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
