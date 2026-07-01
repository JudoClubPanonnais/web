import Link from 'next/link'

const ARTICLES = [
  { title: 'Le Judo Club Panonnais lance sa grande collecte solidaire', publication: 'Le Quotidien de La Réunion', date: '15 janvier 2026', excerpt: 'Le club judoka de Bras Panon lance une campagne de dons ambitieuse pour financer cinq causes sociales prioritaires à hauteur de 40 000 €. Un projet pédagogique inédit qui mêle sport, solidarité et développement social au cœur de l\'Est réunionnais.', featured: true, url: '#' },
  { title: 'Sport et inclusion : le JCP ouvre ses tatamis aux enfants autistes', publication: 'Clicanoo', date: '20 novembre 2025', excerpt: 'Un créneau hebdomadaire spécialement aménagé pour accueillir des enfants présentant des troubles du spectre autistique. Le Judo Club Panonnais innove en proposant une approche adaptée et inclusive, en partenariat avec les équipes médico-sociales locales.', featured: true, url: '#' },
  { title: 'Bras Panon : le judo contre la délinquance juvénile', publication: 'Journal de l\'île de La Réunion', date: '8 septembre 2025', excerpt: 'En partenariat avec la Protection Judiciaire de la Jeunesse, le JCP propose des cours gratuits aux jeunes en difficulté. Une initiative saluée par les services sociaux et la mairie de Bras Panon.', featured: false, url: '#' },
  { title: 'Les judokas de Bras Panon s\'envolent pour le Japon', publication: 'Réunion La 1ère', date: '30 juin 2025', excerpt: 'Cinq jeunes pratiquants du Judo Club Panonnais ont participé à un voyage culturel et sportif au Japon, berceau du judo. Un séjour immersif qui a profondément marqué ces ambassadeurs en herbe.', featured: false, url: '#' },
  { title: 'La présidente du JCP récompensée pour son engagement social', publication: 'Zinfos974', date: '12 mars 2025', excerpt: 'La présidente du Judo Club Panonnais a reçu le prix de l\'engagement associatif décerné par la Mairie de Bras Panon, en reconnaissance de son travail exceptionnel pour le développement social à travers le sport.', featured: false, url: '#' },
  { title: 'Judo et persévérance scolaire : le JCP fait le lien entre tatami et classe', publication: 'imazpress', date: '5 février 2025', excerpt: 'Le Judo Club Panonnais a signé une charte sport-école avec plusieurs établissements de Bras Panon. Des ateliers de gestion du stress et de confiance en soi complètent les entraînements.', featured: false, url: '#' },
]

export default function PressePage() {
  const featured = ARTICLES.filter(a => a.featured)
  const others = ARTICLES.filter(a => !a.featured)

  return (
    <>
      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#0f1f33] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-black mb-4">Espace presse</h1>
          <p className="text-gray-300 max-w-2xl">Retrouvez toutes les publications, photos et vidéos consacrées au Judo Club Panonnais.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">

        {/* Articles à la une */}
        <section>
          <h2 className="text-2xl font-black text-[#1e3a5f] mb-6">À la une</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {featured.map((a, i) => (
              <article key={i} className="card p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between mb-3">
                  <span className="badge bg-orange-100 text-orange-700 border border-orange-200">{a.publication}</span>
                  <span className="text-sm text-gray-400">{a.date}</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">{a.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{a.excerpt}</p>
                <a href={a.url} className="text-orange-500 hover:text-orange-600 text-sm font-medium inline-flex items-center gap-1">Lire l'article →</a>
              </article>
            ))}
          </div>
        </section>

        {/* Autres articles */}
        <section>
          <h2 className="text-2xl font-black text-[#1e3a5f] mb-6">Tous les articles</h2>
          <div className="space-y-4">
            {others.map((a, i) => (
              <article key={i} className="card p-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="badge bg-gray-100 text-gray-600 border border-gray-200">{a.publication}</span>
                    <span className="text-sm text-gray-400">{a.date}</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{a.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{a.excerpt}</p>
                </div>
                <div className="flex md:flex-col justify-end md:justify-center">
                  <a href={a.url} className="text-orange-500 hover:text-orange-600 text-sm font-medium whitespace-nowrap">Lire →</a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Contact presse */}
        <section className="bg-[#1e3a5f] text-white rounded-2xl p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Contact presse</h2>
              <p className="text-gray-300 mb-4">Vous êtes journaliste, blogueur ou influenceur et vous souhaitez parler du Judo Club Panonnais ? Nous sommes disponibles pour des interviews, visites du dojo et reportages.</p>
              <div className="space-y-2 text-sm">
                <p>📧 <a href="mailto:contact@judoclubpanonnais.fr" className="text-orange-400 hover:underline">contact@judoclubpanonnais.fr</a></p>
                <p>🤝 <a href="mailto:partenariats@judoclubpanonnais.fr" className="text-orange-400 hover:underline">partenariats@judoclubpanonnais.fr</a></p>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold mb-3">Kit média disponible</h3>
              {['Logo officiel haute résolution','Photos du club et du dojo','Vidéos des entraînements','Biographie de la présidente','Dossier de présentation 2026'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-300"><span className="text-orange-400">✓</span> {item}</div>
              ))}
              <a href="mailto:contact@judoclubpanonnais.fr?subject=Demande kit média JCP" className="btn-primary mt-2 inline-block text-sm">Demander le kit média</a>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
