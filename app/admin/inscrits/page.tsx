'use client'
import { useEffect, useState } from 'react'

interface Inscrit { id: string; first_name: string; last_name: string; email: string; phone: string; birth_date: string; course: string; status: string; created_at: string; medical_notes: string }

const COURSES = [
  'Baby Judo',
  'Mini Poussins',
  'Poussins / Benjamins',
  'Minimes / Cadets',
  'Juniors / Seniors (Mardi)',
  'Juniors / Seniors (Jeudi)',
  'Judo Loisir Adultes',
  'Cours Spécial TSA',
  'Autodéfense Femmes',
]

const EMPTY_FORM = { first_name: '', last_name: '', email: '', phone: '', birth_date: '', course: COURSES[0], medical_notes: '' }

export default function AdminInscrits() {
  const [list, setList] = useState<Inscrit[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<Inscrit | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [addError, setAddError] = useState('')

  function loadList() {
    fetch('/api/admin/registrations').then(r => r.json()).then(d => { setList(d.registrations || []); setLoading(false) }).catch(() => setLoading(false))
  }

  useEffect(() => { loadList() }, [])

  const filtered = list.filter(i => {
    const matchFilter = filter === 'all' || i.status === filter
    const matchSearch = !search || `${i.first_name} ${i.last_name} ${i.email} ${i.course}`.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  async function updateStatus(id: string, status: string) {
    await fetch('/api/admin/registrations', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    setList(l => l.map(i => i.id === id ? { ...i, status } : i))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.first_name || !form.last_name || !form.email) return
    setSubmitting(true)
    setAddError('')
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setShowAdd(false)
        setForm(EMPTY_FORM)
        setLoading(true)
        loadList()
      } else {
        const d = await res.json()
        setAddError(d.error || 'Erreur lors de l\'ajout')
      }
    } catch { setAddError('Erreur réseau') }
    setSubmitting(false)
  }

  function exportCSV() {
    const headers = ['Prénom', 'Nom', 'Email', 'Téléphone', 'Date naissance', 'Cours', 'Statut', 'Date inscription']
    const rows = filtered.map(i => [i.first_name, i.last_name, i.email, i.phone||'', i.birth_date||'', i.course, i.status, new Date(i.created_at).toLocaleDateString('fr-FR')])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `inscrits-jcp-${new Date().toISOString().split('T')[0]}.csv`; a.click()
  }

  const byCourse: Record<string, number> = {}
  list.forEach(i => { byCourse[i.course] = (byCourse[i.course] || 0) + 1 })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Inscrits aux cours</h1>
          <p className="text-gray-500 text-sm mt-1">{list.length} inscription{list.length > 1 ? 's' : ''} au total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowAdd(true); setAddError('') }} className="btn-primary text-sm">Ajouter un inscrit</button>
          <button onClick={exportCSV} className="btn-navy text-sm">Exporter CSV</button>
        </div>
      </div>

      {/* Stats par cours */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {Object.entries(byCourse).map(([course, count]) => (
          <div key={course} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="text-xs text-gray-500 mb-1 truncate">{course}</div>
            <div className="text-2xl font-black text-[#1e3a5f]">{count}</div>
            <div className="text-xs text-gray-400">inscrit{count > 1 ? 's' : ''}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="input-field flex-1" />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input-field w-full sm:w-48">
          <option value="all">Tous</option>
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmés</option>
          <option value="cancelled">Annulés</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Nom', 'Email', 'Téléphone', 'Cours', 'Statut', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Aucun inscrit trouvé</td></tr>
              ) : filtered.map(i => (
                <tr key={i.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(i)} className="font-medium text-gray-800 hover:text-orange-500 text-left">
                      {i.first_name} {i.last_name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{i.email}</td>
                  <td className="px-4 py-3 text-gray-500">{i.phone || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{i.course}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${i.status === 'confirmed' ? 'bg-green-100 text-green-700' : i.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {i.status === 'confirmed' ? '✓ Confirmé' : i.status === 'pending' ? '⏳ En attente' : '✗ Annulé'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{new Date(i.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => updateStatus(i.id, 'confirmed')} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">✓</button>
                      <button onClick={() => updateStatus(i.id, 'cancelled')} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">✗</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal détail */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <h2 className="font-bold text-lg text-[#1e3a5f]">{selected.first_name} {selected.last_name}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              {[['Email', selected.email], ['Téléphone', selected.phone || '—'], ['Date naissance', selected.birth_date ? new Date(selected.birth_date).toLocaleDateString('fr-FR') : '—'], ['Cours', selected.course], ['Statut', selected.status], ['Notes médicales', selected.medical_notes || 'Aucune']].map(([l, v]) => (
                <div key={String(l)} className="flex gap-3">
                  <span className="font-medium text-gray-800 w-36 flex-shrink-0">{l} :</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => { updateStatus(selected.id, 'confirmed'); setSelected(null) }} className="flex-1 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors">✓ Confirmer</button>
              <button onClick={() => { updateStatus(selected.id, 'cancelled'); setSelected(null) }} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors">✗ Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ajout inscrit */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-6">
              <h2 className="font-bold text-lg text-[#1e3a5f]">Ajouter un inscrit</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required className="input-field" placeholder="Prénom" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} required className="input-field" placeholder="Nom" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required className="input-field" placeholder="email@exemple.fr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" placeholder="0692 00 00 00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                <input type="date" value={form.birth_date} onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cours *</label>
                <select value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} className="input-field">
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes médicales</label>
                <textarea value={form.medical_notes} onChange={e => setForm(f => ({ ...f, medical_notes: e.target.value }))} rows={3} className="input-field resize-none" placeholder="Allergies, contre-indications..." />
              </div>
              {addError && <p className="text-red-500 text-sm">{addError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button>
                <button type="submit" disabled={submitting} className="flex-1 btn-primary disabled:opacity-50">{submitting ? 'Ajout...' : 'Ajouter'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
