'use client'
import Link from 'next/link'

const COURSES = [
  { name: 'Baby Judo', day: 'Mercredi', time: '09h00 – 10h00', age: '4 – 6 ans', level: 'Débutant', color: 'bg-yellow-100 border-yellow-300', icon: '🟡' },
  { name: 'Mini Poussins', day: 'Mercredi', time: '10h00 – 11h00', age: '6 – 8 ans', level: 'Débutant', color: 'bg-orange-100 border-orange-300', icon: '🟠' },
  { name: 'Poussins / Benjamins', day: 'Mercredi', time: '11h00 – 12h00', age: '8 – 12 ans', level: 'Débutant', color: 'bg-blue-100 border-blue-300', icon: '🔵' },
  { name: 'Minimes / Cadets', day: 'Mardi', time: '18h00 – 19h30', age: '12 – 17 ans', level: 'Intermédiaire', color: 'bg-green-100 border-green-300', icon: '🟢' },
  { name: 'Juniors / Seniors', day: 'Mardi', time: '19h30 – 21h00', age: '17 ans et +', level: 'Avancé', color: 'bg-red-100 border-red-300', icon: '🔴' },
  { name: 'Juniors / Seniors', day: 'Jeudi', time: '19h30 – 21h00', age: '17 ans et +', level: 'Avancé', color: 'bg-red-100 border-red-300', icon: '🔴' },
  { name: 'Judo Loisir Adultes', day: 'Vendredi', time: '18h30 – 20h00', age: '18 ans et +', level: 'Tous niveaux', color: 'bg-purple-100 border-purple-300', icon: '🟣' },
  { name: 'Cours Spécial TSA', day: 'Samedi', time: '09h00 – 10h00', age: '5 – 16 ans', level: 'Adapté', color: 'bg-teal-100 border-teal-300', icon: '🩵' },
  { name: 'Autodéfense Femmes', day: 'Samedi', time: '10h00 – 11h30', age: '16 ans et +', level: 'Tous niveaux', color: 'bg-pink-100 border-pink-300', icon: '💗' },
]

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

const EVENTS = [
  { date: '2026-09-06', title: 'Rentrée du club — Portes ouvertes', type: 'evenement', desc: 'Venez découvrir le club et essayer le judo gratuitement.' },
  { date: '2026-10-18', title: 'Tournoi départemental Poussins/Benjamins', type: 'competition', desc: 'Compétition officielle FFJDA pour les jeunes.' },
  { date: '2026-11-15', title: 'Stage d\'autodéfense femmes — Gratuit', type: 'stage', desc: 'Stage spécial lutte contre les violences faites aux femmes.' },
  { date: '2026-12-07', title: 'Passage de grades — Ceintures', type: 'grade', desc: 'Examen de passage de ceintures pour tous les niveaux.' },
  { date: '2027-01-24', title: 'Championnat régional Juniors/Seniors', type: 'competition', desc: 'Compétition régionale La Réunion — FFJDA.' },
  { date: '2027-03-14', title: 'Stage inclusif TSA — Portes ouvertes', type: 'stage', desc: 'Découverte du judo adapté pour les enfants TSA et leurs familles.' },
  { date: '2027-05-22', title: 'Gala de fin de saison', type: 'evenement', desc: 'Démonstrations, remise de récompenses et pot de fin d\'année.' },
]

const EVENT_COLORS: Record<string, string> = {
  competition: 'bg-red-100 text-red-700 border-red-200',
  stage: 'bg-purple-100 text-purple-700 border-purple-200',
  evenement: 'bg-orange-100 text-orange-700 border-orange-200',
  grade: 'bg-blue-100 text-blue-700 border-blue-200',
}

export default function CalendrierPage() {
  const groupedByDay = DAYS.reduce((acc, day) => {
    acc[day] = COURSES.filter(c => c.day === day)
    return acc
  }, {} as Record<string, typeof COURSES>)

  return (
    <>
      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#0f1f33] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-black mb-4">Calendrier & cours</h1>
          <p className="text-gray-300 max-w-2xl">Retrouvez tous nos créneaux de cours et événements à venir. Inscriptions en ligne disponibles.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* HORAIRES COURS */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-black text-[#1e3a5f] mb-8">Horaires des cours</h2>
          <div className="grid gap-4">
            {DAYS.filter(d => groupedByDay[d].length > 0).map(day => (
              <div key={day}>
                <h3 className="font-bold text-lg text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-6 bg-orange-500 rounded-full" />{day}
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedByDay[day].map((c, i) => (
                    <div key={i} className={`border-2 rounded-2xl p-5 ${c.color}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{c.icon}</span>
                        <span className="font-bold text-gray-800">{c.name}</span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>{c.time}</div>
                        <div>{c.age}</div>
                        <div>{c.level}</div>
                        <div>Dojo JCP — Bras Panon</div>
                      </div>
                      <Link href={`/inscription?cours=${encodeURIComponent(c.name)}`} className="mt-3 block text-center py-2 px-4 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#0f1f33] transition-colors">
                        S'inscrire →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ÉVÉNEMENTS */}
        <section>
          <h2 className="text-2xl md:text-3xl font-black text-[#1e3a5f] mb-8">Événements à venir</h2>
          <div className="space-y-4">
            {EVENTS.map((ev, i) => {
              const d = new Date(ev.date)
              const dateStr = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
              return (
                <div key={i} className="card p-6 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="bg-[#1e3a5f] text-white rounded-2xl p-4 text-center min-w-[80px]">
                    <div className="text-2xl font-black">{d.getDate()}</div>
                    <div className="text-xs uppercase">{d.toLocaleDateString('fr-FR', { month: 'short' })}</div>
                    <div className="text-xs text-gray-300">{d.getFullYear()}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start gap-3 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-lg">{ev.title}</h3>
                      <span className={`badge border ${EVENT_COLORS[ev.type]}`}>
                        {ev.type === 'competition' ? '🏆 Compétition' : ev.type === 'stage' ? '🎓 Stage' : ev.type === 'grade' ? '🥋 Passage de grades' : '🎉 Événement'}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">{ev.desc}</p>
                    <p className="text-gray-400 text-xs mt-1 capitalize">{dateStr}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* CTA Inscription */}
        <div className="mt-16 bg-orange-50 border-2 border-orange-200 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-[#1e3a5f] mb-4">Prêt à rejoindre le club ?</h3>
          <p className="text-gray-600 mb-6">Inscrivez-vous en ligne en quelques minutes. Notre équipe vous contactera rapidement.</p>
          <Link href="/inscription" className="btn-primary text-base px-8 py-4">
            Je m'inscris →
          </Link>
        </div>
      </div>
    </>
  )
}
