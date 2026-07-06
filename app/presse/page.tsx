export default function PressePage() {
  return (
    <>
      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#0f1f33] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-black mb-4">Espace presse</h1>
          <p className="text-gray-300 max-w-2xl">Retrouvez l'actualité du Judo Club Panonnais.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">

        {/* Suivez-nous */}
        <section>
          <h2 className="text-2xl font-black text-[#1e3a5f] mb-6">Suivez notre actualité</h2>
          <a
            href="https://www.facebook.com/share/19BHgQkhJr/"
            target="_blank"
            rel="noopener noreferrer"
            className="card p-6 flex items-center justify-between gap-4 border-l-4 border-orange-500 hover:shadow-md transition-shadow"
          >
            <div>
              <div className="font-bold text-gray-900 mb-1">Retrouvez nos actualités sur Facebook</div>
              <p className="text-gray-500 text-sm">Publications, événements et vie du club en direct.</p>
            </div>
            <span className="text-orange-500 font-medium whitespace-nowrap">Voir →</span>
          </a>
        </section>

        {/* Contact presse */}
        <section className="bg-[#1e3a5f] text-white rounded-2xl p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Contact presse</h2>
              <p className="text-gray-300 mb-4">Vous êtes journaliste, blogueur ou influenceur et vous souhaitez parler du Judo Club Panonnais ? Nous sommes disponibles pour des interviews, visites du dojo et reportages.</p>
              <div className="space-y-2 text-sm">
                <p>📧 <a href="mailto:contact@judoclubpanonnais.com" className="text-orange-400 hover:underline">contact@judoclubpanonnais.com</a></p>
                <p>🤝 <a href="mailto:partenariats@judoclubpanonnais.com" className="text-orange-400 hover:underline">partenariats@judoclubpanonnais.com</a></p>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold mb-3">Kit média disponible</h3>
              {['Logo officiel haute résolution','Photos du club et du dojo','Vidéos des entraînements','Biographie de la présidente','Dossier de présentation 2026'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-300"><span className="text-orange-400">✓</span> {item}</div>
              ))}
              <a href="mailto:contact@judoclubpanonnais.com?subject=Demande kit média JCP" className="btn-primary mt-2 inline-block text-sm">Demander le kit média</a>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
