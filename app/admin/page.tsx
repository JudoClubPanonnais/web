'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Stats {
  total_donations: number
  total_amount: number
  total_registrations: number
  total_subscribers: number
  total_views: number
  causes: { name: string; icon: string; collected: number; goal: number }[]
  recent_donations: { donor_name: string; amount: number; cause: string; created_at: string }[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => { setStats(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Total des dons', value: stats ? `${(stats.total_amount / 100).toLocaleString('fr-FR')} €` : '—', icon: '💰', color: 'bg-orange-50 text-orange-600', link: '/admin/dons' },
    { label: 'Nombre de dons', value: stats?.total_donations ?? '—', icon: '🎁', color: 'bg-blue-50 text-blue-600', link: '/admin/dons' },
    { label: 'Inscrits aux cours', value: stats?.total_registrations ?? '—', icon: '🥋', color: 'bg-green-50 text-green-600', link: '/admin/inscrits' },
    { label: 'Abonnés newsletter', value: stats?.total_subscribers ?? '—', icon: '📧', color: 'bg-purple-50 text-purple-600', link: '/admin/newsletter' },
    { label: 'Visites totales', value: stats?.total_views ?? '—', icon: '👁️', color: 'bg-teal-50 text-teal-600', link: '/admin/visiteurs' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">Vue d'ensemble du Judo Club Panonnais</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map(c => (
          <Link key={c.label} href={c.link} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all group">
            <div className={`w-10 h-10 ${c.color} rounded-xl flex items-center justify-center text-xl mb-3`}>{c.icon}</div>
            <div className="text-2xl font-black text-gray-900 group-hover:text-orange-500 transition-colors">
              {loading ? <span className="animate-pulse bg-gray-200 rounded w-16 h-7 block" /> : c.value}
            </div>
            <div className="text-sm text-gray-500 mt-1">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Avancement par cause */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-5">🏆 Avancement des causes</h2>
          {loading ? <div className="space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="animate-pulse h-14 bg-gray-100 rounded-xl" />)}</div> : (
            <div className="space-y-4">
              {(stats?.causes || [
                { name: 'Lutte contre la délinquance', icon: '🚨', collected: 0, goal: 350000 },
                { name: 'Persévérance scolaire', icon: '📚', collected: 0, goal: 280000 },
                { name: 'Inclusion autisme', icon: '🤝', collected: 0, goal: 420000 },
                { name: 'Violences faites aux femmes', icon: '💜', collected: 0, goal: 300000 },
                { name: "Découverte de l'ailleurs", icon: '✈️', collected: 0, goal: 500000 },
              ]).map((c, i) => {
                const pct = c.goal > 0 ? Math.min(100, Math.round((c.collected / c.goal) * 100)) : 0
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{c.icon} {c.name}</span>
                      <span className="text-sm text-gray-500">{(c.collected/100).toLocaleString('fr-FR')} € / {(c.goal/100).toLocaleString('fr-FR')} €</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{pct}%</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Dons récents */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">💰 Dons récents</h2>
            <Link href="/admin/dons" className="text-sm text-orange-500 hover:underline">Voir tout →</Link>
          </div>
          {loading ? <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="animate-pulse h-12 bg-gray-100 rounded-xl" />)}</div> : (
            <div className="space-y-3">
              {(stats?.recent_donations || []).length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">Aucun don pour l'instant</p>
              ) : stats?.recent_donations.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-medium text-sm text-gray-800">{d.donor_name || 'Anonyme'}</div>
                    <div className="text-xs text-gray-500">{d.cause || 'Don général'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-500">{(d.amount/100).toLocaleString('fr-FR')} €</div>
                    <div className="text-xs text-gray-400">{new Date(d.created_at).toLocaleDateString('fr-FR')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4">⚡ Actions rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/admin/newsletter', label: 'Créer une newsletter', icon: '✉️' },
            { href: '/admin/inscrits', label: 'Voir les inscrits', icon: '🥋' },
            { href: '/admin/dons', label: 'Exporter les dons', icon: '📊' },
            { href: '/admin/reseaux', label: 'Gérer les réseaux', icon: '📱' },
          ].map(a => (
            <Link key={a.href} href={a.href} className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all text-sm font-medium text-gray-700">
              <span>{a.icon}</span> {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
