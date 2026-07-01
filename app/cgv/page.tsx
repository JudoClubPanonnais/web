export default function CGVPage() {
  const sections = [
    { title: '1. Présentation de l\'association', content: `Le Judo Club Panonnais est une association loi 1901, fondée le 12 juillet 2017, affiliée à la Fédération Française de Judo, Jujitsu, Kendo et Disciplines Associées (FFJDA).\n\nSIRET : 832 172 753 00010\nSiège social : Bras Panon — 97412 — Île de La Réunion\nEmail : contact@judoclubpanonnais.fr` },
    { title: '2. Objet', content: `Les présentes CGV définissent les conditions dans lesquelles le Club propose :\n• Des inscriptions aux cours de judo et disciplines associées\n• Des dons en ligne au profit des causes soutenues\n• L'accès au site internet et à ses services\n• L'inscription à la newsletter` },
    { title: '3. Inscriptions aux cours', content: `3.1 Conditions d'inscription\nToute inscription est soumise à l'acceptation du règlement intérieur et à la présentation d'un certificat médical de non-contre-indication à la pratique du judo.\n\n3.2 Validation\nL'inscription n'est définitive qu'après réception du dossier complet et règlement de la cotisation.\n\n3.3 Cotisations\nLes cotisations annuelles couvrent la saison (septembre à juin). Elles sont non remboursables sauf contre-indication médicale justifiée.\n\n3.4 Résiliation\nEn cas d'abandon en cours de saison, aucun remboursement ne sera effectué, sauf cas prévus par la loi.` },
    { title: '4. Dons en ligne', content: `4.1 Les dons effectués via le site sont libres, volontaires et sans contrepartie.\n\n4.2 Traitement des paiements par Stripe (sécurisé, TLS/SSL). Aucune donnée bancaire n'est stockée.\n\n4.3 Fiscalité\nRéduction d'impôt de 66% pour les particuliers (art. 200 CGI), 60% pour les entreprises (art. 238 bis CGI).\nReçu fiscal Cerfa n°11580*03 adressé automatiquement.\n\n4.4 Les dons sont définitifs et non remboursables, sauf erreur de montant signalée dans les 48h.` },
    { title: '5. Droit à l\'image', content: `Des photos et vidéos peuvent être réalisées lors des cours et événements à des fins de communication, pour une période de 5 ans. Toute personne s'y opposant doit en informer le responsable du Club par écrit.` },
    { title: '6. Responsabilité', content: `Le Club décline toute responsabilité pour vol ou perte d'effets personnels. Toute pratique sportive comporte des risques. Le Club dispose d'une assurance RC et les membres bénéficient de la licence FFJDA.` },
    { title: '7. Protection des données (RGPD)', content: `Les données personnelles sont utilisées exclusivement pour la gestion administrative et l'envoi de reçus fiscaux. Elles ne sont jamais cédées à des tiers. Droit d'accès, rectification et suppression : contact@judoclubpanonnais.fr` },
    { title: '8. Litiges', content: `Solution amiable recherchée en priorité. À défaut, tribunaux compétents de La Réunion. Droit français applicable.` },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-black text-[#1e3a5f] mb-2">Conditions Générales de Vente & d'Utilisation</h1>
      <p className="text-gray-500 mb-10">En vigueur au 1er janvier 2026</p>
      <div className="space-y-8">
        {sections.map(({ title, content }) => (
          <div key={title} className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">{title}</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
