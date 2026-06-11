'use client'
import { useEffect, useState } from 'react'

interface Subscriber { id: string; email: string; first_name: string; subscribed_at: string; active: boolean }
interface Campaign { id: string; subject: string; preview_text: string; status: string; sent_at: string; recipient_count: number; created_at: string }

const TEMPLATES = [
  { name: 'Actualité du club', subject: '🥋 Actualités du Judo Club Panonnais', content: `<h1 style="color:#1e3a5f;font-family:sans-serif">Actualités du Judo Club Panonnais</h1><p style="font-family:sans-serif;color:#666">Bonjour,</p><p style="font-family:sans-serif;color:#666">Voici les dernières nouvelles de votre club...</p>` },
  { name: 'Résultats collecte', subject: '❤️ Résultats de notre collecte solidaire', content: `<h1 style="color:#1e3a5f;font-family:sans-serif">Résultats de la collecte</h1><p style="font-family:sans-serif;color:#666">Grâce à vous, nous avons collecté...</p>` },
  { name: 'Événement à venir', subject: '📅 Événement JCP — Ne manquez pas ça !', content: `<h1 style="color:#1e3a5f;font-family:sans-serif">Prochain événement</h1><p style="font-family:sans-serif;color:#666">Nous sommes heureux de vous annoncer...</p>` },
]

export default function AdminNewsletter() {
  const [tab, setTab] = useState<'subscribers'|'campaigns'|'compose'>('subscribers')
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState('')
  const [preview, setPreview] = useState('')
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [sendStatus, setSendStatus] = useState<'idle'|'success'|'error'>('idle')

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/newsletter/subscribers').then(r => r.json()),
      fetch('/api/admin/newsletter/campaigns').then(r => r.json()),
    ]).then(([s, c]) => {
      setSubscribers(s.subscribers || [])
      setCampaigns(c.campaigns || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function sendCampaign() {
    if (!subject || !content) return
    setSending(true)
    try {
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, preview_text: preview, content_html: content }),
      })
      if (res.ok) { setSendStatus('success'); setSubject(''); setPreview(''); setContent('') }
      else setSendStatus('error')
    } catch { setSendStatus('error') }
    setSending(false)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">📧 Newsletter</h1>
        <p className="text-gray-500 text-sm mt-1">{subscribers.filter(s => s.active).length} abonné{subscribers.filter(s => s.active).length > 1 ? 's' : ''} actif{subscribers.filter(s => s.active).length > 1 ? 's' : ''}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[['subscribers', '👥 Abonnés'], ['campaigns', '📊 Campagnes'], ['compose', '✉️ Composer']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k as typeof tab)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab === k ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Abonnés */}
      {tab === 'subscribers' && (
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{['Email', 'Prénom', 'Date d\'inscription', 'Statut'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Chargement...</td></tr>
                  : subscribers.length === 0 ? <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Aucun abonné</td></tr>
                  : subscribers.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{s.email}</td>
                      <td className="px-4 py-3 text-gray-500">{s.first_name || '—'}</td>
                      <td className="px-4 py-3 text-gray-400">{new Date(s.subscribed_at).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-3"><span className={`badge text-xs ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.active ? '✓ Actif' : '✗ Désabonné'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Campagnes */}
      {tab === 'campaigns' && (
        <div className="space-y-4">
          {loading ? <div className="animate-pulse h-32 bg-gray-100 rounded-2xl" />
          : campaigns.length === 0 ? <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">Aucune campagne envoyée</div>
          : campaigns.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">{c.subject}</h3>
                  {c.preview_text && <p className="text-sm text-gray-500 mt-1">{c.preview_text}</p>}
                  <div className="flex gap-4 mt-3 text-sm text-gray-400">
                    <span>📤 {c.recipient_count} destinataires</span>
                    {c.sent_at && <span>📅 {new Date(c.sent_at).toLocaleDateString('fr-FR')}</span>}
                  </div>
                </div>
                <span className={`badge text-xs ${c.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {c.status === 'sent' ? '✓ Envoyée' : '📝 Brouillon'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Composer */}
      {tab === 'compose' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-6">Créer & envoyer une newsletter</h2>

          {/* Templates */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Partir d'un template</label>
            <div className="flex gap-2 flex-wrap">
              {TEMPLATES.map(t => (
                <button key={t.name} type="button" onClick={() => { setSubject(t.subject); setContent(t.content) }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:border-orange-300 hover:bg-orange-50 transition-all">
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Objet *</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Objet de l'email" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texte d'aperçu</label>
              <input value={preview} onChange={e => setPreview(e.target.value)} placeholder="Texte visible dans la boîte mail..." className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contenu HTML *</label>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder="<h1>Votre newsletter</h1><p>Contenu...</p>"
                rows={12} className="input-field resize-none font-mono text-sm" />
            </div>

            {content && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aperçu</label>
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <iframe srcDoc={content} className="w-full h-48 border-0 rounded-lg" title="preview" />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={sendCampaign} disabled={!subject || !content || sending}
                className="btn-primary flex-1 disabled:opacity-50">
                {sending ? 'Envoi en cours...' : `📤 Envoyer à ${subscribers.filter(s => s.active).length} abonnés`}
              </button>
            </div>

            {sendStatus === 'success' && <p className="text-green-600 text-sm">✅ Newsletter envoyée avec succès !</p>}
            {sendStatus === 'error' && <p className="text-red-500 text-sm">Erreur lors de l'envoi.</p>}
          </div>
        </div>
      )}
    </div>
  )
}
