'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

type CourseType = 'essai' | 'payant' | 'gratuit' | 'tsa'

interface CourseOption {
  label: string
  type: CourseType
  price: number
}

const COURSES: CourseOption[] = [
  { label: "Cours d'essai — Groupe 1 Baby Judo (3–5 ans) — Gratuit", type: 'essai', price: 0 },
  { label: "Cours d'essai — Groupe 2 Enfants (6–10 ans) — Gratuit", type: 'essai', price: 0 },
  { label: "Cours d'essai — Groupe 3 Ados/Adultes (10 ans et +) — Gratuit", type: 'essai', price: 0 },
  { label: 'Baby Judo — Lundi 16h–17h & Mercredi 15h–16h (3–5 ans) — 200€/an', type: 'payant', price: 200 },
  { label: 'Enfants — Lundi 17h–18h, Mercredi 16h–17h & Vendredi 17h–18h30 (6–10 ans) — 210€/an', type: 'payant', price: 210 },
  { label: 'Ados/Adultes — Lundi 18h–19h, Mercredi 17h–18h30 & Vendredi 17h–18h30 (10 ans+) — 220€/an', type: 'payant', price: 220 },
  { label: 'Cours Spécial TSA — Tarif adapté (nous contacter)', type: 'tsa', price: 0 },
  { label: 'Autodéfense Femmes — Gratuit', type: 'gratuit', price: 0 },
]

function HelloAssoResizeScript() {
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const dataHeight = (e.data as { height?: number })?.height
      const el = document.getElementById('haWidgetAdhesion')
      if (el && dataHeight && dataHeight > parseFloat(el.style.height || '0')) {
        el.style.height = dataHeight + 'px'
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])
  return null
}

function InscriptionForm() {
  const params = useSearchParams()
  const prefill = params.get('cours') || ''

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', birthDate: '',
    address: '', course: prefill, emergencyContact: '', emergencyPhone: '',
    medicalNotes: '', acceptCgu: false,
    addOneDonation: false,
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function set(k: string, v: string | boolean | number) { setForm(f => ({ ...f, [k]: v })) }

  const selectedCourse = COURSES.find(c => c.label === form.course) || null
  const courseType: CourseType = selectedCourse?.type || 'payant'
  const price = selectedCourse?.price || 0
  const isPaid = courseType === 'payant'

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.acceptCgu) return
    setStatus('loading')
    try {
      const payload = {
        ...form,
        course_type: courseType,
        price: price * 100,
        payment_installments: 1,
        payment_method: isPaid ? 'helloasso' : null,
      }
      const res = await fetch('/api/courses/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      if (res.ok) setStatus('success')
      else setStatus('error')
    } catch { setStatus('error') }
  }

  if (status === 'success') return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h2 className="text-3xl font-black text-[#1e3a5f] mb-4">Demande envoyée !</h2>
      <p className="text-gray-600 mb-8">
        Merci {form.firstName} ! Votre demande a bien été reçue.
        Notre équipe vous contactera dans les 48h à l&apos;adresse <strong>{form.email}</strong>.
        Finalisez votre adhésion et paiement via HelloAsso en haut de page.
      </p>
      <a href="/" className="btn-primary">Retour à l&apos;accueil</a>
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
          {COURSES.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
        </select>

        {form.course && !isPaid && courseType !== 'tsa' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
            {courseType === 'essai'
              ? "6 cours d'essai offerts, sans engagement. À l'issue des 6 séances, vous pourrez vous inscrire officiellement."
              : 'Ce cours est entièrement gratuit. Aucun paiement requis.'}
          </div>
        )}
        {form.course && courseType === 'tsa' && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
            Le tarif pour le cours TSA est adapté à chaque situation. Notre équipe vous contactera pour en discuter.
          </div>
        )}

        {form.course && isPaid && (
          <div className="mt-6 space-y-4 border-t pt-5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800">Montant annuel</span>
              <span className="text-2xl font-black text-[#1e3a5f]">{price} €</span>
            </div>

            {/* Soutenir nos causes */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Soutenir nos causes</h4>
              <label className="flex items-center gap-3 cursor-pointer px-4 py-3 rounded-xl border-2 transition-colors border-orange-200 bg-orange-50 hover:border-orange-400">
                <input
                  type="checkbox"
                  checked={form.addOneDonation}
                  onChange={e => set('addOneDonation', e.target.checked)}
                  className="w-4 h-4 accent-orange-500"
                />
                <div>
                  <span className="text-sm font-semibold text-orange-700">+ 1 € de don solidaire</span>
                  <p className="text-xs text-orange-600 mt-0.5">Un geste pour soutenir une de nos causes. Merci !</p>
                </div>
              </label>
            </div>

            {form.addOneDonation && (
              <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                <span>Total (adhésion + don)</span>
                <span className="font-bold text-[#1e3a5f]">{price + 1} €</span>
              </div>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
              <p className="font-semibold mb-1">Paiement sécurisé via HelloAsso</p>
              <p>Le paiement s&apos;effectue directement via le widget HelloAsso en haut de cette page. Ce formulaire recueille vos informations complémentaires (contact urgence, données médicales).</p>
            </div>
          </div>
        )}
      </div>

      {/* Contact urgence */}
      <div className="card p-6">
        <h3 className="font-bold text-[#1e3a5f] text-lg mb-5 flex items-center gap-2">
          <span className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
          Contact en cas d&apos;urgence
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
        <p className="text-xs text-gray-400 mt-2">Ces informations sont strictement confidentielles et réservées à l&apos;encadrement.</p>
      </div>

      {/* Documents médicaux obligatoires */}
      <div className="card p-6">
        <h3 className="font-bold text-[#1e3a5f] text-lg mb-5 flex items-center gap-2">
          <span className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">5</span>
          Attestation médicale ou certificat médical
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <a href="/documents/questionnaire-sante-ffjda.pdf" download
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-orange-200 bg-orange-50 text-orange-700 font-semibold text-sm hover:border-orange-400 transition-colors">
            📄 Questionnaire de santé FFJDA
          </a>
          <a href="/documents/attestation-medicale.pdf" download
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-orange-200 bg-orange-50 text-orange-700 font-semibold text-sm hover:border-orange-400 transition-colors">
            📄 Attestation médicale
          </a>
        </div>

        <div className="text-sm text-gray-600 leading-relaxed space-y-3">
          <p>Le décret n° 2021-564 du 7 mai 2021 prévoit qu&apos;il n&apos;est désormais plus nécessaire, pour les mineurs, de produire un certificat médical pour l&apos;obtention ou le renouvellement d&apos;une licence dans une fédération sportive ou pour l&apos;inscription à une compétition sportive organisée par une fédération.</p>
          <p>Le questionnaire de santé reste cependant obligatoire : si les réponses à ce questionnaire conduisent à un examen médical, le certificat demeure obligatoire.</p>
          <p>Toutes les modifications sont applicables depuis le 8 mai 2021 (décret du 7 mai 2021 n° 2021-564).</p>

          <p className="font-semibold text-gray-700 pt-2">Pour les mineurs :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Une attestation remplace le certificat médical. Elle doit être signée par les personnes exerçant l&apos;autorité parentale, précisant que chaque rubrique du questionnaire de santé a donné lieu à une réponse négative.</li>
            <li>Si au moins une réponse du questionnaire est positive, un certificat médical attestant de l&apos;absence de contre-indication à la pratique du sport ou de la discipline concernée, daté de moins de six mois, devra être produit.</li>
          </ul>
          <p className="text-xs text-gray-400">À noter : la mention « compétition » a été supprimée — elle sera inscrite par défaut sur les licences de tous les mineurs.</p>

          <p className="font-semibold text-gray-700 pt-2">Pour les majeurs :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Dans le cas d&apos;une nouvelle licence, un certificat médical doit être fourni.</li>
            <li>Dans le cadre d&apos;un renouvellement de licence, si la personne n&apos;est pas en mesure d&apos;attester avoir répondu « non » à toutes les rubriques du questionnaire QS-Sport, elle doit produire un certificat médical attestant de l&apos;absence de contre-indication à la pratique (y compris en compétition le cas échéant), daté de moins de 6 mois.</li>
            <li>Si toutes les réponses sont négatives, une attestation médicale suffit.</li>
          </ul>
          <p>Plus d&apos;informations : <a href="https://www.ffjudo.com/actualite/licences-questionnaire-mineurs" target="_blank" rel="noopener" className="text-orange-500 hover:underline">ffjudo.com</a></p>

          <p className="font-semibold text-gray-700 pt-2">Pour simplifier la gestion du club :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Le questionnaire médical (ci-dessus), correspondant à l&apos;âge de l&apos;adhérent (mineur ou majeur, un par adhérent), doit être rempli mais n&apos;a pas à être présenté ni communiqué au club (secret médical). Il doit être conservé au sein de la sphère familiale.</li>
            <li>L&apos;attestation médicale (ci-dessus), complétée et signée par le représentant légal, correspondant à l&apos;âge de l&apos;adhérent (un par adhérent), doit être remise au club.</li>
            <li>Pour une personne majeure, dans le cas d&apos;une nouvelle licence, un certificat médical est demandé.</li>
          </ul>

          <p className="font-semibold text-gray-700 pt-2">Dossier d&apos;inscription complet — pièces à fournir :</p>
          <p>Le dossier d&apos;inscription ne sera considéré comme complet qu&apos;après la remise de tous les documents suivants :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Le formulaire d&apos;inscription correctement complété.</li>
            <li>La ou les attestation(s) médicale(s) datée(s) et signée(s), ou le certificat médical.</li>
            <li>Les paiements (immédiats ou différés si plusieurs chèques).</li>
          </ul>
        </div>
      </div>

      {/* CGU */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
        <input type="checkbox" id="cgu" required checked={form.acceptCgu} onChange={e => set('acceptCgu', e.target.checked)} className="w-4 h-4 accent-orange-500 mt-0.5" />
        <label htmlFor="cgu" className="text-sm text-gray-600">
          J&apos;accepte les <a href="/cgv" className="text-orange-500 hover:underline">conditions générales de vente</a> et la <a href="/confidentialite" className="text-orange-500 hover:underline">politique de confidentialité</a> du Judo Club Panonnais. *
        </label>
      </div>

      <button type="submit" disabled={status === 'loading'}
        className="btn-primary w-full py-4 text-base disabled:opacity-50">
        {status === 'loading' ? 'Envoi en cours...' : "Envoyer mes informations complémentaires"}
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
          <h1 className="text-3xl md:text-4xl font-black mb-4">Inscription aux cours</h1>
          <p className="text-gray-300">Rejoignez le Judo Club Panonnais pour la saison 2026–2027. Payez votre adhésion directement en ligne via HelloAsso.</p>
        </div>
      </section>

      {/* Widget HelloAsso Adhésion */}
      <section className="bg-white py-10 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-[#1e3a5f] mb-2">Adhésion 2026–2027 — Paiement en ligne</h2>
          <p className="text-gray-500 text-sm mb-6">Réglez votre adhésion directement ci-dessous. Vous recevrez un reçu par email automatiquement.</p>
          <HelloAssoResizeScript />
          <iframe
            id="haWidgetAdhesion"
            allowTransparency={true}
            scrolling="auto"
            src="https://www.helloasso.com/associations/judo-club-panonnais/adhesions/adhesion-2026-2027-sport/widget"
            style={{ width: '100%', height: '750px', border: 'none' }}
          />
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-xl">
          <h2 className="text-lg font-bold text-amber-800 mb-1">Formulaire de pré-inscription (complémentaire)</h2>
          <p className="text-amber-700 text-sm">Ce formulaire nous permet de recueillir vos informations d&apos;urgence et médicales. Il est distinct du paiement HelloAsso ci-dessus.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <Suspense fallback={<div>Chargement...</div>}>
              <InscriptionForm />
            </Suspense>
          </div>
          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="font-bold text-[#1e3a5f] mb-4">Nous trouver</h3>
              <p className="text-gray-600 text-sm">
                <strong>Dojo Lucie Ignace</strong><br />
                1 Route Nationale 2, 97412 Bras-Panon<br />
                (en face de la piscine)<br /><br />
                <strong>Dojo Champ de Foire</strong><br />
                Champ de Foire, 97412 Bras-Panon<br />
                (face à la médiathèque)
              </p>
            </div>
            <div className="card p-6">
              <h3 className="font-bold text-[#1e3a5f] mb-4">Contact</h3>
              <p className="text-gray-600 text-sm"><a href="mailto:contact@judoclubpanonnais.fr" className="text-orange-500 hover:underline">contact@judoclubpanonnais.fr</a></p>
            </div>
            <div className="card p-6">
              <h3 className="font-bold text-[#1e3a5f] mb-4">Tarifs</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Baby Judo (3–5 ans) : 200 € / an</li>
                <li>• Enfants (6–10 ans) : 210 € / an</li>
                <li>• Ados/Adultes (10 ans+) : 220 € / an</li>
                <li>• Cours TSA : Tarif adapté</li>
                <li>• Autodéfense Femmes : Gratuit</li>
                <li>• Cours d&apos;essai : Gratuit</li>
              </ul>
              <p className="text-xs text-gray-400 mt-3">Licences FFJDA incluses. Tarifs solidaires sur demande.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
