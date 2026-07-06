'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const CAUSES_DATA: Record<string, {
  name: string; icon: string; color: string; bg: string;
  tagline: string; description: string; actions: string[]; impact: string[];
}> = {
  'lutte-delinquance': {
    name: "Lutte contre la délinquance et l'errance juvéniles",
    icon: '🚨', color: 'from-red-500 to-red-700', bg: 'bg-red-500',
    tagline: 'Offrir aux jeunes en rupture une alternative structurante',
    description: "Le judo comme cadre disciplinaire positif, lieu d'appartenance et vecteur de confiance en soi. Bras Panon est une commune de l'Est réunionnais, territoire de vie où se côtoient des réalités sociales que notre club ne peut pas ignorer : des jeunes en décrochage, des familles fragilisées. En tant qu'acteur local enraciné, notre club a la responsabilité — et la capacité — d'agir.",
    actions: [
      'Cours gratuits ou à tarif symbolique pour jeunes en difficulté ou signalés par les services sociaux',
      'Orientées par les partenaires conventionnés et institutionnels du territoire',
      'Programme de tutorat sportif et de suivi individuel',
      'Passeport sportif vers la réinsertion : engagement, responsabilisation, projet de vie',
      'Sorties et activités citoyennes complémentaires',
    ],
    impact: ['10 jeunes en rupture accompagnés par saison', 'Cours hebdomadaires gratuits', 'Suivi individualisé par éducateur sportif', 'Partenariats actifs'],
  },
  'inclusion-autisme': {
    name: 'Inclusion autisme et sport',
    icon: '🤝', color: 'from-purple-500 to-purple-700', bg: 'bg-purple-500',
    tagline: "Le tatami comme vecteur d'inclusion et d'autonomie pour les enfants TSA",
    description: "Pour les enfants autistes, le tatami offre un cadre prévisible, un contact maîtrisé et un sentiment de compétence réel. Le judo devient un vecteur d'inclusion et d'autonomie. Cet espace encadré, prévisible, où les règles sont claires et appliquées avec bienveillance, représente une véritable boîte de sécurité dans laquelle il est possible de se reconstruire.",
    actions: [
      'Créneaux dédiés avec enseignants formés aux troubles du spectre autistique (TSA)',
      'Adaptation du programme aux profils sensoriels et cognitifs',
      'Tarif adapté en fonction des fonds récoltés',
      'Bilan annuel',
      "Faciliter l'accessibilité de la pratique sportive aux personnes atteintes du TSA",
    ],
    impact: ['1 créneau dédié hebdomadaire', 'Formateurs certifiés TSA', 'Partenariats locaux actifs', 'Participation aux championnats handisport'],
  },
  'violences-femmes': {
    name: 'Lutte contre les violences faites aux femmes',
    icon: '💜', color: 'from-pink-500 to-pink-700', bg: 'bg-pink-500',
    tagline: "L'autodéfense est un droit. Reprendre le contrôle de sa vie.",
    description: "L'autodéfense est un droit. Nous formons gratuitement les femmes en situation de vulnérabilité — parce que reprendre le contrôle de son corps, c'est reprendre le contrôle de sa vie. Cet espace est confidentiel, bienveillant et non-mixte.",
    actions: [
      "Stages d'autodéfense gratuits pour les femmes en situation de vulnérabilité",
      "Partenariat avec les associations locales d'aide aux victimes",
      "Espace confidentiel, bienveillant et non-mixte",
      "Sensibilisation dans les établissements scolaires et les structures d'hébergement",
      "Accompagnement vers un parcours judo régulier si souhaité",
    ],
    impact: ['Stages gratuits chaque trimestre', 'Espace non-mixte et confidentiel', 'Partenariats actifs', '30 femmes accompagnées par an'],
  },
  'decouverte-ailleurs': {
    name: "Soutien à l'ambition et échanges sportifs",
    icon: '✈️', color: 'from-emerald-500 to-emerald-700', bg: 'bg-emerald-500',
    tagline: "Accompagner l'ambition sportive de nos judokas et favoriser les échanges avec d'autres clubs.",
    description: "Le judo est une langue universelle. Partout où l'on pose un tatami, on se comprend. Nous accompagnons l'ambition sportive de nos pratiquants et organisons des échanges avec d'autres clubs : l'autre — qu'il soit adversaire, partenaire ou hôte — est toujours une source inépuisable d'enrichissement.",
    actions: [
      "Organisation de voyages sportifs et culturels en France et à l'étranger",
      "Échanges de pratiques avec des clubs étrangers : partager son judo, découvrir celui de l'autre",
      "Séjours immersifs mêlant entraînements, visites culturelles et rencontres avec des familles locales",
      "Accueil de judokas étrangers dans notre dojo et dans nos foyers",
      "Apprentissage des rituels, saluts et philosophies propres à chaque pays pratiquant le judo",
      "Création d'un carnet de voyage collectif — support pédagogique pour les classes partenaires",
    ],
    impact: ["1 voyage à l'étranger par saison", 'Échanges avec clubs japonais et européens', 'Accueil de judokas étrangers', 'Carnet de voyage pédagogique'],
  },
}

const VOTE_STORAGE_KEY = 'jcp_voted_cause'

export default function CausePage() {
  const { slug } = useParams<{ slug: string }>()
  const cause = CAUSES_DATA[slug]
  const [votes, setVotes] = useState(0)
  const [votedSlug, setVotedSlug] = useState<string | null>(null)
  const [voteError, setVoteError] = useState('')

  useEffect(() => {
    setVotedSlug(localStorage.getItem(VOTE_STORAGE_KEY))
    fetch('/api/causes').then(r => r.json()).then(d => {
      if (d.causes) {
        const c = d.causes.find((x: { slug: string; votes: number }) => x.slug === slug)
        if (c) setVotes(c.votes || 0)
      }
    }).catch(() => {})
  }, [slug])

  async function vote() {
    if (votedSlug) return
    setVoteError('')
    try {
      const res = await fetch('/api/causes/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) })
      const d = await res.json().catch(() => null)
      if (res.ok && typeof d?.votes === 'number') {
        setVotedSlug(slug)
        localStorage.setItem(VOTE_STORAGE_KEY, slug)
        setVotes(d.votes)
      } else {
        setVoteError(d?.error || 'Le vote n\'a pas pu être enregistré. Réessayez.')
      }
    } catch (e) { setVoteError(`Erreur réseau : ${String(e)}`) }
  }

  if (!cause) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><h1 className="text-2xl font-bold mb-4">Cause introuvable</h1><Link href="/" className="btn-primary">Retour à l&apos;accueil</Link></div>
    </div>
  )

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
          {/* Vote */}
          <div className="mt-10 bg-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-3xl font-black">{votes.toLocaleString('fr-FR')} vote{votes > 1 ? 's' : ''}</div>
              <div className="text-white/70 text-sm">pour cette cause</div>
            </div>
            <button
              type="button"
              onClick={vote}
              disabled={!!votedSlug}
              className={`px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed ${votedSlug === slug ? 'bg-white/20 text-white' : votedSlug ? 'bg-white/10 text-white/50' : 'bg-white text-gray-900 hover:bg-white/90'}`}
            >
              {votedSlug === slug ? '✓ Vous avez voté' : 'Voter pour cette cause'}
            </button>
          </div>
          {voteError && <p className="text-red-200 text-sm mt-3">{voteError}</p>}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-black text-[#1e3a5f] mb-4">À propos de cette cause</h2>
              <p className="text-gray-600 leading-relaxed text-lg">{cause.description}</p>
              <p className="text-gray-500 text-sm mt-3">Les dons sont reversés à nos actions.</p>
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#1e3a5f] mb-4">Nos leviers d&apos;actions</h2>
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
              <h2 className="text-2xl font-black text-[#1e3a5f] mb-4">Objectifs</h2>
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
              <h3 className="font-bold text-[#1e3a5f] text-lg mb-4">Soutenir nos causes</h3>
              <p className="text-gray-500 text-sm mb-4">Faites un don pour une de nos causes. Les dons sont reversés à nos actions.</p>

              <Link href="/#don" className={`btn-primary w-full bg-gradient-to-r ${cause.color} text-center block`}>
                Faire un don →
              </Link>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-500">
                <p>💸 100% reversé au projet</p>
                <p>🔒 Paiement sécurisé HelloAsso</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
