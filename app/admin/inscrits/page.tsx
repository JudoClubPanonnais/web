'use client'
import { useEffect, useState } from 'react'
import { useAdminRole } from '@/lib/adminRole'

type CourseType = 'essai' | 'payant' | 'gratuit' | 'tsa'
type PaymentMethod = 'card' | 'transfer' | 'cash'

interface Inscrit {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  birth_date: string
  course: string
  status: string
  created_at: string
  medical_notes: string
  price: number
  payment_status: string
  payment_installments: number
  payment_method: PaymentMethod | null
  amount_paid: number
  course_type: CourseType
  belt_color: string | null
}

interface PaymentHistoryEntry {
  id: string
  amount: number
  payment_method: string | null
  payment_date: string
  note: string | null
}

const COURSE_OPTIONS = [
  { label: "Cours d'essai — Groupe 1 Baby Judo (3–5 ans) — Gratuit", type: 'essai' as CourseType, price: 0 },
  { label: "Cours d'essai — Groupe 2 Enfants (6–10 ans) — Gratuit", type: 'essai' as CourseType, price: 0 },
  { label: "Cours d'essai — Groupe 3 Ados/Adultes (10 ans et +) — Gratuit", type: 'essai' as CourseType, price: 0 },
  { label: 'Baby Judo — Lundi 16h–17h & Mercredi 15h–16h (3–5 ans) — 200€/an', type: 'payant' as CourseType, price: 200 },
  { label: 'Enfants — Lundi 17h–18h, Mercredi 16h–17h & Vendredi 17h–18h30 (6–10 ans) — 210€/an', type: 'payant' as CourseType, price: 210 },
  { label: 'Ados/Adultes — Lundi 18h–19h, Mercredi 17h–18h30 & Vendredi 17h–18h30 (10 ans+) — 220€/an', type: 'payant' as CourseType, price: 220 },
  { label: 'Cours Spécial TSA — Tarif adapté (nous contacter)', type: 'tsa' as CourseType, price: 0 },
  { label: 'Autodéfense Femmes — Gratuit', type: 'gratuit' as CourseType, price: 0 },
]

const EMPTY_FORM = {
  first_name: '', last_name: '', email: '', phone: '', birth_date: '',
  course: COURSE_OPTIONS[0].label, medical_notes: '',
  course_type: 'essai' as CourseType, price: 0,
  payment_installments: 1, payment_method: 'cash' as PaymentMethod,
}

function rowClass(i: Inscrit) {
  if (i.payment_status === 'paid') return 'bg-blue-50 border-l-4 border-blue-500'
  if ((i.payment_status === 'partial' || i.payment_status === 'pending') && i.price > 0) return 'bg-red-50 border-l-4 border-red-500'
  return ''
}

function fmtEur(cents: number) {
  return `${(cents / 100).toFixed(0)} €`
}

export default function AdminInscrits() {
  const role = useAdminRole()
  const isCoach = role === 'coach'

  const [list, setList] = useState<Inscrit[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<Inscrit | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [addError, setAddError] = useState('')

  // Payment history modal state
  const [payHistory, setPayHistory] = useState<PaymentHistoryEntry[]>([])
  const [payHistoryLoading, setPayHistoryLoading] = useState(false)
  const [showPayForm, setShowPayForm] = useState(false)
  const [payForm, setPayForm] = useState({ amount: '', date: '', method: 'cash', note: '' })
  const [payFormSaving, setPayFormSaving] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailMsg, setEmailMsg] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailResult, setEmailResult] = useState('')

  function loadList() {
    fetch('/api/admin/registrations').then(r => r.json()).then(d => {
      setList(d.registrations || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { loadList() }, [])

  async function loadPayHistory(id: string) {
    setPayHistoryLoading(true)
    try {
      const r = await fetch(`/api/admin/payment-history?registration_id=${id}`)
      const d = await r.json()
      setPayHistory(d.history || [])
    } catch { setPayHistory([]) }
    setPayHistoryLoading(false)
  }

  function openDetail(i: Inscrit) {
    setSelected(i)
    setShowPayForm(false)
    setShowEmailModal(false)
    setEmailResult('')
    if (!isCoach) loadPayHistory(i.id)
  }

  const filtered = list.filter(i => {
    const matchFilter = filter === 'all' || i.status === filter
    const matchSearch = !search || `${i.first_name} ${i.last_name} ${i.email} ${i.course}`.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  async function updateStatus(id: string, status: string) {
    await fetch('/api/admin/registrations', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    setList(l => l.map(i => i.id === id ? { ...i, status } : i))
  }

  async function updateBelt(id: string, belt_color: string) {
    await fetch('/api/admin/registrations', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, belt_color }) })
    setList(l => l.map(i => i.id === id ? { ...i, belt_color } : i))
  }

  async function handleDelete() {
    if (!selected) return
    if (!confirm(`Supprimer l'inscription de ${selected.first_name} ${selected.last_name} ?`)) return
    await fetch('/api/admin/registrations', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selected.id }) })
    setList(l => l.filter(i => i.id !== selected.id))
    setSelected(null)
  }

  async function handlePayFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected || !payForm.amount) return
    setPayFormSaving(true)
    try {
      await fetch('/api/admin/payment-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_id: selected.id,
          amount: Math.round(parseFloat(payForm.amount) * 100),
          payment_method: payForm.method,
          payment_date: payForm.date || undefined,
          note: payForm.note || undefined,
        }),
      })
      setPayForm({ amount: '', date: '', method: 'cash', note: '' })
      setShowPayForm(false)
      loadPayHistory(selected.id)
      loadList()
    } catch { /* ignore */ }
    setPayFormSaving(false)
  }

  async function handleSendPaymentRequest(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setEmailSending(true)
    try {
      const r = await fetch('/api/admin/send-payment-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id: selected.id, amount: selected.price - selected.amount_paid, message: emailMsg }),
      })
      const d = await r.json()
      setEmailResult(d.ok ? `Demande enregistrée pour ${d.email}.` : 'Erreur.')
    } catch { setEmailResult('Erreur réseau.') }
    setEmailSending(false)
  }

  function handleCourseChange(label: string) {
    const opt = COURSE_OPTIONS.find(c => c.label === label)
    setForm(f => ({ ...f, course: label, course_type: opt?.type || 'payant', price: opt?.price || 0 }))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.first_name || !form.last_name || !form.email) return
    setSubmitting(true)
    setAddError('')
    try {
      const opt = COURSE_OPTIONS.find(c => c.label === form.course)
      const res = await fetch('/api/admin/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          course_type: opt?.type || form.course_type,
          price: (opt?.price || form.price) * 100,
          payment_installments: form.payment_installments,
          payment_method: opt?.type === 'payant' ? form.payment_method : null,
        }),
      })
      if (res.ok) {
        setShowAdd(false)
        setForm(EMPTY_FORM)
        setLoading(true)
        loadList()
      } else {
        const d = await res.json()
        setAddError(d.error || "Erreur lors de l'ajout")
      }
    } catch { setAddError('Erreur réseau') }
    setSubmitting(false)
  }

  function exportCSV() {
    const headers = ['Prénom', 'Nom', 'Email', 'Téléphone', 'Date naissance', 'Cours', 'Statut', 'Date inscription']
    const rows = filtered.map(i => [i.first_name, i.last_name, i.email, i.phone || '', i.birth_date || '', i.course, i.status, new Date(i.created_at).toLocaleDateString('fr-FR')])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `inscrits-jcp-${new Date().toISOString().split('T')[0]}.csv`; a.click()
  }

  const byCourse: Record<string, number> = {}
  list.forEach(i => { byCourse[i.course] = (byCourse[i.course] || 0) + 1 })

  const addFormCourseOpt = COURSE_OPTIONS.find(c => c.label === form.course)
  const addIsPaid = addFormCourseOpt?.type === 'payant'

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
                {['Nom', 'Email', 'Téléphone', 'Cours', 'Ceinture', 'Statut', !isCoach ? 'Paiement' : '', 'Date', 'Actions'].filter(Boolean).map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={isCoach ? 7 : 8} className="px-4 py-8 text-center text-gray-400">Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={isCoach ? 7 : 8} className="px-4 py-8 text-center text-gray-400">Aucun inscrit trouvé</td></tr>
              ) : filtered.map(i => (
                <tr key={i.id} className={`hover:bg-gray-50 transition-colors ${rowClass(i)}`}>
                  <td className="px-4 py-3">
                    <button onClick={() => openDetail(i)} className="font-medium text-gray-800 hover:text-orange-500 text-left">
                      {i.first_name} {i.last_name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{i.email}</td>
                  <td className="px-4 py-3 text-gray-500">{i.phone || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{i.course}</td>
                  <td className="px-4 py-3">
                    <select
                      value={i.belt_color || ''}
                      onChange={e => updateBelt(i.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-orange-400"
                    >
                      <option value="">—</option>
                      {['blanc', 'jaune/blanc', 'jaune', 'jaune/orange', 'orange', 'orange/vert', 'vert', 'vert/bleu', 'bleu', 'marron', 'noir'].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${i.status === 'confirmed' ? 'bg-green-100 text-green-700' : i.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {i.status === 'confirmed' ? 'Confirme' : i.status === 'pending' ? 'En attente' : 'Annule'}
                    </span>
                  </td>
                  {!isCoach && (
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {i.price > 0 ? (
                        <span className={i.payment_status === 'paid' ? 'text-blue-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {fmtEur(i.amount_paid)} / {fmtEur(i.price)}
                        </span>
                      ) : (
                        <span className="text-gray-400">Gratuit</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{new Date(i.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => updateStatus(i.id, 'confirmed')} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">V</button>
                      <button onClick={() => updateStatus(i.id, 'cancelled')} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">X</button>
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
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <h2 className="font-bold text-lg text-[#1e3a5f]">{selected.first_name} {selected.last_name}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>

            {/* Infos de base */}
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              {([
                ['Email', selected.email],
                ['Téléphone', selected.phone || '—'],
                ['Date naissance', selected.birth_date ? new Date(selected.birth_date).toLocaleDateString('fr-FR') : '—'],
                ['Cours', selected.course],
                ['Statut', selected.status],
                ['Notes médicales', selected.medical_notes || 'Aucune'],
              ] as [string, string][]).map(([l, v]) => (
                <div key={l} className="flex gap-3">
                  <span className="font-medium text-gray-800 w-36 flex-shrink-0">{l} :</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>

            {/* Section Paiement — gérant seulement */}
            {!isCoach ? (
              <div className="border-t pt-5 mt-2 space-y-4">
                <h3 className="font-bold text-gray-800 text-sm">Paiement</h3>
                {selected.price > 0 ? (
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-xs text-gray-500 mb-1">Total</div>
                      <div className="font-bold text-gray-900">{fmtEur(selected.price)}</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <div className="text-xs text-gray-500 mb-1">Payé</div>
                      <div className="font-bold text-blue-700">{fmtEur(selected.amount_paid)}</div>
                    </div>
                    <div className="bg-red-50 rounded-xl p-3 text-center">
                      <div className="text-xs text-gray-500 mb-1">Reste</div>
                      <div className="font-bold text-red-600">{fmtEur(selected.price - selected.amount_paid)}</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Cours gratuit ou essai — aucun paiement requis.</p>
                )}

                {/* Historique paiements */}
                {selected.price > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-2">Historique des paiements</div>
                    {payHistoryLoading ? (
                      <p className="text-xs text-gray-400">Chargement...</p>
                    ) : payHistory.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Aucun paiement enregistré.</p>
                    ) : (
                      <ul className="space-y-1">
                        {payHistory.map(p => (
                          <li key={p.id} className="text-xs bg-gray-50 rounded-lg px-3 py-2 flex justify-between gap-2">
                            <span>{p.payment_date} — {p.note || p.payment_method || '—'}</span>
                            <span className="font-semibold text-green-700">{fmtEur(p.amount)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Boutons paiement */}
                {selected.price > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setShowPayForm(v => !v)} className="px-3 py-2 text-xs bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 font-medium transition-colors">
                      Enregistrer un paiement
                    </button>
                    <button onClick={() => { setShowEmailModal(true); setEmailResult('') }} className="px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 font-medium transition-colors">
                      Envoyer demande de paiement
                    </button>
                  </div>
                )}

                {/* Mini form paiement */}
                {showPayForm && selected.price > 0 && (
                  <form onSubmit={handlePayFormSubmit} className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Montant (€) *</label>
                        <input type="number" step="0.01" min="0" required value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} className="input-field text-sm" placeholder="ex: 70" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                        <input type="date" value={payForm.date} onChange={e => setPayForm(f => ({ ...f, date: e.target.value }))} className="input-field text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Moyen de paiement</label>
                      <select value={payForm.method} onChange={e => setPayForm(f => ({ ...f, method: e.target.value }))} className="input-field text-sm">
                        <option value="cash">Espèces / Chèque</option>
                        <option value="transfer">Virement</option>
                        <option value="card">Carte bancaire</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Note</label>
                      <input value={payForm.note} onChange={e => setPayForm(f => ({ ...f, note: e.target.value }))} className="input-field text-sm" placeholder="Optionnel..." />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={payFormSaving} className="btn-primary text-xs py-2 disabled:opacity-50">{payFormSaving ? 'Enregistrement...' : 'Enregistrer'}</button>
                      <button type="button" onClick={() => setShowPayForm(false)} className="px-3 py-2 text-xs border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100">Annuler</button>
                    </div>
                  </form>
                )}

                {/* Modal demande email */}
                {showEmailModal && (
                  <form onSubmit={handleSendPaymentRequest} className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3 text-sm">
                    <div className="font-semibold text-blue-800 text-xs mb-1">Demande de paiement par email</div>
                    <p className="text-xs text-blue-700">Montant restant : <strong>{fmtEur(selected.price - selected.amount_paid)}</strong></p>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Message (optionnel)</label>
                      <textarea value={emailMsg} onChange={e => setEmailMsg(e.target.value)} rows={3} className="input-field text-sm resize-none" placeholder="Message personnalisé..." />
                    </div>
                    {emailResult && <p className="text-xs text-green-700 font-medium">{emailResult}</p>}
                    <div className="flex gap-2">
                      <button type="submit" disabled={emailSending} className="btn-primary text-xs py-2 disabled:opacity-50">{emailSending ? 'Envoi...' : 'Envoyer'}</button>
                      <button type="button" onClick={() => setShowEmailModal(false)} className="px-3 py-2 text-xs border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100">Fermer</button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="border-t pt-4 mt-2">
                <p className="text-sm text-gray-400 italic bg-gray-100 rounded-xl px-4 py-3">— Acces restreint — Informations de paiement réservées au gérant.</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-6">
              <button onClick={() => { updateStatus(selected.id, 'confirmed'); setSelected(null) }} className="flex-1 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors">Confirmer</button>
              <button onClick={() => { updateStatus(selected.id, 'cancelled'); setSelected(null) }} className="flex-1 py-2 bg-yellow-500 text-white rounded-xl text-sm font-medium hover:bg-yellow-600 transition-colors">Annuler</button>
              {!isCoach && (
                <button onClick={handleDelete} className="py-2 px-4 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors">Supprimer</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal ajout inscrit */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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
                <select value={form.course} onChange={e => handleCourseChange(e.target.value)} className="input-field">
                  {COURSE_OPTIONS.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
                </select>
              </div>

              {/* Paiement si cours payant */}
              {addIsPaid && (
                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Montant annuel</span>
                    <span className="font-bold text-[#1e3a5f]">{addFormCourseOpt?.price} €</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Modalité de paiement</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map(n => (
                        <label key={n} className={`flex-1 text-center cursor-pointer py-2 rounded-xl border-2 text-sm transition-colors ${form.payment_installments === n ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold' : 'border-gray-200 text-gray-600'}`}>
                          <input type="radio" name="add_inst" value={n} checked={form.payment_installments === n} onChange={() => setForm(f => ({ ...f, payment_installments: n }))} className="sr-only" />
                          {n}x
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Moyen de paiement</label>
                    <select value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value as PaymentMethod }))} className="input-field">
                      <option value="cash">Espèces / Chèque au club</option>
                      <option value="transfer">Virement bancaire</option>
                      <option value="card">Carte bancaire (en ligne)</option>
                    </select>
                  </div>
                </div>
              )}

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
