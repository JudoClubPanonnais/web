'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const CAUSES_DATA: Record<string, {
  name: string; icon: string; color: string; bg: string; goal: number;
  raised: number; tagline: string; description: string; actions: string[]; budget: number; impact: string[];
}> = {
  'lutte-delinquance': {
    name: "Lutte contre la délinquance et l'errance juvéniles",
    icon: '🚨', color: 'from-red-500 to-red-700', bg: 'bg-red-500', goal: 3500, raised: 0,
    tagline: 'Offrir aux jeunes en rupture une alternative structurante',
    description: "Le judo comme cadre disciplinaire positif, lieu d'appartenance et vecteur de confiance en soi. Bras Panon est une commune de l'Est réunionnais, territoire de vie où se côtoient des réalités sociales que notre club ne peut pas ignorer : des jeunes en décrochage, des familles fragilisées. En tant qu'acteur local enraciné, notre club a la responsabilité — et la capacité — d'agir.",
    actions: [
      'Cours gratuits ou à tarif symbolique pour jeunes en difficulté ou signalés par les services sociaux',
      'Partenariat avec les éducateurs spécialisés, la PJJ et les mairies',
      'Programme de tutorat sportif et de suivi individuel',
      'Passeport sportif vers la réinsertion : engagement, responsabilisation, projet de vie',
      'Sorties et activités citoyennes complémentaires',
    ],
    budget: 3500,
    impact: ['10 jeunes en rupture accompagnés par saison', 'Cours hebdomadaires gratuits', 'Suivi individualisé par éducateur sportif', 'Partenariat PJJ actif'],
  },
  'perseverance-scolaire': {
    name: 'Persévérance scolaire',
    icon: '📚', color: 'from-blue-500 to-blue-700', bg: 'bg-blue-500', goal: 2800, raised: 0,
    tagline: 'Le lien entre sport, école et famille pour que chaque enfant tienne bon',
    description: "Le judo apprend à tomber et se relever. Cette résilience se transfère en classe. Nous créons le lien entre sport, école et famille pour que chaque enfant tienne bon. La discipline du tatami, la gestion de l'effort et la confiance en soi acquises dans notre dojo sont des outils précieux pour la réussite scolaire.",
    actions: [
      'Charte sport-école avec les établissements scolaires de la commune',
      'Ateliers concentration, gestion du stress et confiance en soi',
      'Suivi régulier des résultats scolaires des adhérents',
      'Récompense du mérite scolaire au sein du club (cérémonies, distinctions)',
      "Sensibilisation des familles à l'importance de l'engagement scolaire",
    ],
    budget: 2800,
    impact: ['Charte signée avec 3 établissements scolaires', 'Ateliers mensuels de gestion du stress', 'Suivi des bulletins scolaires', 'Cérémonie annuelle de remise des prix'],
  },
  'inclusion-autisme': {
    name: 'Inclusion autisme et sport',
    icon: '🤝', color: 'from-purple-500 to-purple-700', bg: 'bg-purple-500', goal: 4200, raised: 0,
    tagline: "Le tatami comme vecteur d'inclusion et d'autonomie pour les enfants TSA",
    description: "Pour les enfants autistes, le tatami offre un cadre prévisible, un contact maîtrisé et un sentiment de compétence réel. Le judo devient un vecteur d'inclusion et d'autonomie. Cet espace encadré, prévisible, où les règles sont claires et appliquées avec bienveillance, représente une véritable boîte de sécurité dans laquelle il est possible de se reconstruire.",
    actions: [
      'Créneaux dédiés avec enseignants formés aux troubles du spectre autistique (TSA)',
      'Adaptation du programme aux profils sensoriels et cognitifs',
      'Lien étroit avec les familles, orthophonistes et équipes médico-sociales',
      'Participation aux rencontres handisport régionales',
      'Temps de partage entre élèves neurotypiques et enfants TSA',
    ],
    budget: 4200,
    impact: ['1 créneau dédié hebdomadaire', 'Formateurs certifiés TSA', 'Partenariat avec 2 SESSAD locaux', 'Participation aux championnats handisport'],
  },
  'violences-femmes': {
    name: 'Lutte contre les violences faites aux femmes',
    icon: '💜', color: 'from-pink-500 to-pink-700', bg: 'bg-pink-500', goal: 3000, raised: 0,
    tagline: "L'autodéfense est un droit. Reprendre le contrôle de sa vie.",
    description: "L'autodéfense est un droit. Nous formons gratuitement les femmes en situation de vulnérabilité — parce que reprendre le contrôle de son corps, c'est reprendre le contrôle de sa vie. Cet espace est confidentiel, bienveillant et non-mixte.",
    actions: [
      "Stages d'autodéfense gratuits pour les femmes en situation de vulnérabilité",
      "Partenariat avec les associations locales d'aide aux victimes",
      "Espace confidentiel, bienveillant et non-mixte",
      "Sensibilisation dans les établissements scolaires et les structures d'hébergement",
      "Accompagnement vers un parcours judo régulier si souhaité",
    ],
    budget: 3000,
    impact: ['Stages gratuits chaque trimestre', 'Espace non-mixte et confidentiel', 'Partenariat avec le CIDFF', '30 femmes accompagnées par an'],
  },
  'decouverte-ailleurs': {
    name: "Découverte de l'ailleurs et ouverture au monde",
    icon: '✈️', color: 'from-emerald-500 to-emerald-700', bg: 'bg-emerald-500', goal: 5000, raised: 0,
    tagline: 'Le judo est une langue universelle. Partout où on pose un tatami, on se comprend.',
    description: "Le judo est une langue universelle. Partout où l'on pose un tatami, on se comprend. Nos voyages sportifs et culturels apprennent à nos pratiquants que l'autre — qu'il soit adversaire, partenaire ou hôte — est toujours une source inépuisable d'enrichissement.",
    actions: [
      "Organisation de voyages sportifs et culturels en France et à l'étranger",
      "Échanges de pratiques avec des clubs étrangers : partager son judo, découvrir celui de l'autre",
      "Séjours immersifs mêlant entraînements, visites culturelles et rencontres avec des familles locales",
      "Accueil de judokas étrangers dans notre dojo et dans nos foyers",
      "Apprentissage des rituels, saluts et philosophies propres à chaque pays pratiquant le judo",
      "Création d'un carnet de voyage collectif — support pédagogique pour les classes partenaires",
    ],
    budget: 5000,
    impact: ["1 voyage à l'étranger par saison", 'Échanges avec clubs japonais et européens', 'Accueil de judokas étrangers', 'Carnet de voyage pédagogique'],
  },
}

// Montants fixes proposés pour les dons
const DON_AMOUNTS = [5, 10, 20, 50, 100]

// Widget HelloAsso — redimensionnement automatique
function useHelloAssoResize(iframeId: string) {
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const dataHeight = (e.data as { height?: number })?.height
      const el = document.getElementById(iframeId)
      if (el && dataHeight && dataHeight > parseFloat((el as HTMLIFrameElement).style.height || '0')) {
        (el as HTMLIFrameElement).style.height = dataHeight + 'px'
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [iframeId])
}

export default function CausePage() {
  const { slug } = useParams<{ slug: string }>()
  const cause = CAUSES_DATA[slug]
  const [raised, setRaised] = useState(0)
  const [showDonWidget, setShowDonWidget] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [addOneDonation, setAddOneDonation] = useState(false)

  useHelloAssoResize('haWidgetDon')

  useEffect(() => {
    fetch('/api/causes').then(r => r.json()).then(d => {
      if (d.causes) {
        const c = d.causes.find((x: { slug: string; collected_amount: number }) => x.slug === slug)
        if (c) setRaised(Math.round(c.collected_amount / 100))
      }
    }).catch(() => {})
  }, [slug])

  if (!cause) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><h1 className="text-2xl font-bold mb-4">Cause introuvable</h1><Link href="/" className="btn-primary">Retour à l&apos;accueil</Link></div>
    </div>
  )

  const pct = Math.min(100, cause.goal > 0 ? Math.round((raised / cause.goal) * 100) : 0)
  const effectiveAmount = customAmount ? parseInt(customAmount) || 0 : selectedAmount || 0

  return (
    <>
      {/* HERO cause */}
      <section className={`bg-gradient-to-br ${cause.color} text-white py-20`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/#causes" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 text-sm transition-colors">
            ← Retour aux causes
          </Link>
          <div className="flex items-start gap-6">
            <div className="text-6xl">{cause.icon}</div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-3">{cause.name}</h1>
              <p className="text-white/80 text-lg max-w-2xl">{cause.tagline}</p>
            </div>
          </div>
          {/* Progress */}
          <div className="mt-10 bg-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <div className="text-4xl font-black">{raised.toLocaleString('fr-FR')} €</div>
                <div className="text-white/70 text-sm">collectés</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{cause.goal.toLocaleString('fr-FR')} €</div>
                <div className="text-white/70 text-sm">objectif</div>
              </div>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
            </div>
            <div className="text-white/70 text-sm mt-2">{pct}% de l&apos;objectif atteint</div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-black text-[#1e3a5f] mb-4">À propos de cette cause</h2>
              <p className="text-gray-600 leading-relaxed text-lg">{cause.description}</p>
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#1e3a5f] mb-4">Nos actions concrètes</h2>
              <ul className="space-y-3">
                {cause.actions.map((a, i) => (
                  <li key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <span className={`w-6 h-6 rounded-full bg-gradient-to-br ${cause.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5`}>{i+1}</span>
                    <span className="text-gray-700">{a}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#1e3a5f] mb-4">Impact attendu</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {cause.impact.map((imp, i) => (
                  <div key={i} className={`p-4 rounded-xl bg-gradient-to-br ${cause.color} text-white`}>
                    <div className="font-semibold">{imp}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar don */}
          <div>
            <div className="card p-6 sticky top-24">
              <h3 className="font-bold text-[#1e3a5f] text-lg mb-4">Soutenir cette cause</h3>

              {/* Sélection du montant */}
              <div className="space-y-4">
                {/* Montants fixes */}
                <div className="grid grid-cols-3 gap-2">
                  {DON_AMOUNTS.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => { setSelectedAmount(a); setCustomAmount('') }}
                      className={`py-2 rounded-lg border-2 font-semibold text-sm transition-all ${selectedAmount === a && !customAmount ? `border-orange-500 bg-orange-500 text-white` : 'border-gray-200 text-gray-600 hover:border-orange-300'}`}
                    >
                      {a} €
                    </button>
                  ))}
                </div>

                {/* Montant libre */}
                <div className="relative">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null) }}
                    placeholder="Montant libre"
                    min="1"
                    className="input-field pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                </div>

                {/* Option +1€ */}
                <label className="flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-xl border-2 transition-colors border-orange-200 bg-orange-50 hover:border-orange-400">
                  <input
                    type="checkbox"
                    checked={addOneDonation}
                    onChange={e => setAddOneDonation(e.target.checked)}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-orange-700">+ 1 € solidaire en plus</span>
                    <p className="text-xs text-orange-600 mt-0.5">Pour soutenir l&apos;ensemble de nos causes</p>
                  </div>
                </label>

                {effectiveAmount > 0 && (
                  <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    <span>Total don</span>
                    <span className="font-bold text-[#1e3a5f]">{effectiveAmount + (addOneDonation ? 1 : 0)} €</span>
                  </div>
                )}

                {/* Bouton ouvrir widget HelloAsso */}
                <button
                  type="button"
                  onClick={() => setShowDonWidget(true)}
                  disabled={effectiveAmount < 1}
                  className={`btn-primary w-full bg-gradient-to-r ${cause.color} disabled:opacity-50`}
                >
                  {effectiveAmount > 0
                    ? `Donner ${effectiveAmount + (addOneDonation ? 1 : 0)} € via HelloAsso →`
                    : 'Choisir un montant →'}
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-500">
                <p>✅ Reçu fiscal automatique</p>
                <p>💸 100% reversé au projet</p>
                <p>🔒 Paiement sécurisé HelloAsso</p>
                <p>📊 66% déductible (particuliers)</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm font-semibold text-gray-700 mb-2">Budget alloué à cette cause</div>
                <div className="text-2xl font-black text-[#1e3a5f]">{cause.budget.toLocaleString('fr-FR')} €</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Widget HelloAsso Dons — modal/section */}
      {showDonWidget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-bold text-[#1e3a5f] text-lg">Faire un don — HelloAsso</h3>
              <button
                type="button"
                onClick={() => setShowDonWidget(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-4">
                Montant sélectionné : <strong>{effectiveAmount + (addOneDonation ? 1 : 0)} €</strong>.
                Le formulaire ci-dessous vous permet de finaliser votre don en toute sécurité.
              </p>
              <iframe
                id="haWidgetDon"
                allowTransparency={true}
                scrolling="auto"
                src="https://www.helloasso.com/associations/judo-club-panonnais/formulaires/1/widget"
                style={{ width: '100%', height: '750px', border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Autres causes */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-[#1e3a5f] mb-6">Découvrir les autres causes</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(CAUSES_DATA).filter(([s]) => s !== slug).map(([s, c]) => (
              <Link key={s} href={`/causes/${s}`} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white bg-gradient-to-r ${c.color} hover:opacity-90 transition-opacity text-sm font-medium`}>
                {c.icon} {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
