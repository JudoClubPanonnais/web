'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const COURSES = [
  'Baby Judo (Mercredi 09h–10h, 4–6 ans)',
  'Mini Poussins (Mercredi 10h–11h, 6–8 ans)',
  'Poussins / Benjamins (Mercredi 11h–12h, 8–12 ans)',
  'Minimes / Cadets (Mardi 18h–19h30, 12–17 ans)',
  'Juniors / Seniors (Mardi 19h30–21h, 17+ ans)',
  'Juniors / Seniors (Jeudi 19h30–21h, 17+ ans)',
  'Judo Loisir Adultes (Vendredi 18h30–20h, 18+ ans)',
  'Cours Spécial TSA (Samedi 09h–10h, 5–16 ans)',
  'Autodéfense Femmes (Samedi 10h–11h30, 16+ ans)',
]

function InscriptionForm() {
  const params = useSearchParams()
  const prefill = params.get('cours') || ''
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', birthDate: '',
    address: '', course: prefill, emergencyContact: '', emergencyPhone: '',
    medicalNotes: '', acceptCgu: false,
  })
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')

  function set(k: string, v: string | boolean) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.acceptCgu) return
    setStatus('loading')
    try {
      const res = await fetch('/api/courses/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      if (res.ok) setStatus('success')
      else setStatus('error')
    } catch { setStatus('error') }
  }

  if (status === 'success') return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-6">🥋</div>
      <h2 className="text-3xl font-black text-[#1e3a5f] mb-4">Inscription reçue !</h2>
      <p className="text-gray-600 mb-8">
        Merci {form.firstName} ! Votre demande d'inscription a bien été envoyée.
        Notre équipe vous contactera dans les 48h à l'adresse <strong>{form.email}</strong>.
      </p>
      <a href="/" className="btn-primary">Retour à l'accueil</a>
    </div>
  )

  return (
    <form onSubmit={submit} className="space-y-8">
      {/* Identité */}
      <div className="card p-6">
        <h3 className="font-bold text-[#1e3a5f] text-lg mb-5 flex items-center gap-2">
          <span className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
          Informations personnelles
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label><input required value={form.firstName} onChange={e => set('firstName', e.target.value)} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label><input required value={form.lastName} onChange={e => set('lastName', e.target.value)} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input required type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label><input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance *</label><input required type="date" value={form.birthDate} onChange={e => set('birthDate', e.target.value)} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label><input value={form.address} onChange={e => set('address', e.target.value)} className="input-field" /></div>
        </div>
      </div>

      {/* Cours */}
      <div className="card p-6">
        <h3 className="font-bold text-[#1e3a5f] text-lg mb-5 flex items-center gap-2">
          <span className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
          Choix du cours
        </h3>
        <select required value={form.course} onChange={e => set('course', e.target.value)} className="input-field">
          <option value="">-- Sélectionnez un cours --</option>
          {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Contact urgence */}
      <div className="card p-6">
        <h3 className="font-bold text-[#1e3a5f] text-lg mb-5 flex items-center gap-2">
          <span className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
          Contact en cas d'urgence
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom du contact</label><input value={form.emergencyContact} onChange={e => set('emergencyContact', e.target.value)} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label><input type="tel" value={form.emergencyPhone} onChange={e => set('emergencyPhone', e.target.value)} className="input-field" /></div>
        </div>
      </div>

      {/* Infos médicales */}
      <div className="card p-6">
        <h3 className="font-bold text-[#1e3a5f] text-lg mb-5 flex items-center gap-2">
          <span className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">4</span>
          Informations médicales (optionnel)
        </h3>
        <textarea value={form.medicalNotes} onChange={e => set('medicalNotes', e.target.value)}
          placeholder="Allergies, contre-indications, besoins particuliers..."
          rows={3} className="input-field resize-none" />
        <p className="text-xs text-gray-400 mt-2">Ces informations sont strictement confidentielles et réservées à l'encadrement.</p>
      </div>

      {/* CGU */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
        <input type="checkbox" id="cgu" required checked={form.acceptCgu} onChange={e => set('acceptCgu', e.target.checked)} className="w-4 h-4 accent-orange-500 mt-0.5" />
        <label htmlFor="cgu" className="text-sm text-gray-600">
          J'accepte les <a href="/cgv" className="text-orange-500 hover:underline">conditions générales de vente</a> et la <a href="/confidentialite" className="text-orange-500 hover:underline">politique de confidentialité</a> du Judo Club Panonnais. *
        </label>
      </div>

      <button type="submit" disabled={status === 'loading'}
        className="btn-primary w-full py-4 text-base disabled:opacity-50">
        {status === 'loading' ? 'Envoi en cours...' : 'Envoyer ma demande d\'inscription →'}
      </button>
      {status === 'error' && <p className="text-red-500 text-sm text-center">Une erreur est survenue. Réessayez ou contactez-nous.</p>}
    </form>
  )
}

export default function InscriptionPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#0f1f33] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-black mb-4">🥋 Inscription aux cours</h1>
          <p className="text-gray-300">Rejoignez le Judo Club Panonnais. Remplissez le formulaire ci-dessous, notre équipe vous contactera sous 48h.</p>
        </div>
      </section>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <Suspense fallback={<div>Chargement...</div>}>
              <InscriptionForm />
            </Suspense>
          </div>
          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="font-bold text-[#1e3a5f] mb-4">📍 Nous trouver</h3>
              <p className="text-gray-600 text-sm">Dojo Judo Club Panonnais<br />Bras Panon — 97412<br />Île de La Réunion</p>
            </div>
            <div className="card p-6">
              <h3 className="font-bold text-[#1e3a5f] mb-4">📞 Contact</h3>
              <p className="text-gray-600 text-sm"><a href="mailto:contact@judoclubpanonnais.fr" className="text-orange-500 hover:underline">contact@judoclubpanonnais.fr</a></p>
            </div>
            <div className="card p-6">
              <h3 className="font-bold text-[#1e3a5f] mb-4">💰 Tarifs indicatifs</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Baby Judo : 150 € / an</li>
                <li>• Enfants : 200 € / an</li>
                <li>• Ados/Adultes : 250 € / an</li>
                <li>• Cours TSA : Tarif adapté</li>
                <li>• Autodéfense femmes : Gratuit</li>
              </ul>
              <p className="text-xs text-gray-400 mt-3">Licences FFJDA incluses. Tarifs solidaires sur demande.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
