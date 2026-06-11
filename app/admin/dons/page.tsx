'use client'
import { useEffect, useState } from 'react'

interface Don { id: string; donor_name: string; donor_email: string; amount: number; cause: string; message: string; anonymous: boolean; status: string; created_at: string }

export default function AdminDons() {
  const [dons, setDons] = useState<Don[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/donations').then(r => r.json()).then(d => { setDons(d.donations || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const filtered = dons.filter(d => {
    const matchFilter = filter === 'all' || d.status === filter || (filter === 'cause' && d.cause)
    const matchSearch = !search || d.donor_name?.toLowerCase().includes(search.toLowerCase()) || d.donor_email?.toLowerCase().includes(search.toLowerCase()) || d.cause?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const totalAmount = filtered.reduce((s, d) => s + (d.status === 'completed' ? d.amount : 0), 0)

  const byCause: Record<string, number> = {}
  dons.filter(d => d.status === 'completed').forEach(d => {
    const k = d.cause || 'Don général'
    byCause[k] = (byCause[k] || 0) + d.amount
  })

  function exportCSV() {
    const headers = ['Date', 'Donateur', 'Email', 'Montant (€)', 'Cause', 'Message', 'Statut']
    const rows = filtered.map(d => [
      new Date(d.created_at).toLocaleDateString('fr-FR'),
      d.anonymous ? 'Anonyme' : d.donor_name || '',
      d.anonymous ? '' : d.donor_email || '',
      (d.amount / 100).toFixed(2),
      d.cause || 'Don général',
      d.message || '',
      d.status,
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `dons-jcp-${new Date().toISOString().split('T')[0]}.csv`; a.click()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">💰 Dons & projets</h1>
          <p className="text-gray-500 text-sm mt-1">Détail de tous les dons reçus</p>
        </div>
        <button onClick={exportCSV} className="btn-navy text-sm">⬇️ Exporter CSV</button>
      </div>

      {/* Stats par cause */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {Object.entries(byCause).map(([cause, amt]) => (
          <div key={cause} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="text-sm text-gray-500 mb-1">{cause}</div>
            <div className="text-2xl font-black text-orange-500">{(amt/100).toLocaleString('fr-FR')} €</div>
          </div>
        ))}
        <div className="bg-orange-500 text-white rounded-2xl p-5">
          <div className="text-sm text-orange-100 mb-1">Total collecté</div>
          <div className="text-2xl font-black">{(totalAmount/100).toLocaleString('fr-FR')} €</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom, email, cause..."
          className="input-field flex-1" />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input-field w-full sm:w-48">
          <option value="all">Tous les dons</option>
          <option value="completed">Complétés</option>
          <option value="pending">En attente</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Date', 'Donateur', 'Email', 'Montant', 'Cause', 'Message', 'Statut'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Aucun don trouvé</td></tr>
              ) : filtered.map(d => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(d.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{d.anonymous ? 'Anonyme' : d.donor_name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{d.anonymous ? '—' : d.donor_email || '—'}</td>
                  <td className="px-4 py-3 font-bold text-orange-500 whitespace-nowrap">{(d.amount/100).toLocaleString('fr-FR')} €</td>
                  <td className="px-4 py-3 text-gray-600">{d.cause || 'Don général'}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{d.message || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${d.status === 'completed' ? 'bg-green-100 text-green-700' : d.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {d.status === 'completed' ? '✓ Complété' : d.status === 'pending' ? '⏳ En attente' : '✗ Échoué'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
