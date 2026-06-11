export default function ConfidentialitePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-black text-[#1e3a5f] mb-2">Politique de confidentialité</h1>
      <p className="text-gray-500 mb-10">Conformément au RGPD (Règlement UE 2016/679)</p>
      <div className="space-y-8 text-gray-600">
        {[
          ['Responsable du traitement', 'Judo Club Panonnais — contact@judoclubpanonnais.fr'],
          ['Données collectées', 'Lors de vos interactions avec notre site, nous collectons :\n• Inscriptions : nom, prénom, email, téléphone, date de naissance, informations médicales\n• Dons : nom (optionnel), email, montant, cause choisie\n• Newsletter : email, prénom (optionnel)\n• Navigation : pages visitées (analytics anonymes)'],
          ['Finalités du traitement', '• Gestion administrative des inscriptions aux cours\n• Traitement des dons et émission de reçus fiscaux\n• Envoi de la newsletter (avec consentement)\n• Statistiques anonymes d\'utilisation du site'],
          ['Base légale', '• Exécution d\'un contrat (inscriptions)\n• Obligation légale (reçus fiscaux)\n• Consentement (newsletter, analytics)\n• Intérêt légitime (gestion associative)'],
          ['Durée de conservation', '• Données d\'inscription : durée de l\'adhésion + 5 ans\n• Données de don : 10 ans (obligation comptable)\n• Newsletter : jusqu\'à désinscription'],
          ['Vos droits', 'Conformément au RGPD, vous disposez des droits suivants :\n• Droit d\'accès à vos données\n• Droit de rectification\n• Droit à l\'effacement\n• Droit à la portabilité\n• Droit d\'opposition\n\nPour exercer ces droits : contact@judoclubpanonnais.fr'],
          ['Sécurité', 'Les paiements sont traités par Stripe (certifié PCI DSS). Aucune donnée bancaire n\'est stockée sur nos serveurs. Les données sont hébergées sur des serveurs sécurisés en Europe.'],
          ['Cookies', 'Ce site utilise uniquement des cookies techniques essentiels au fonctionnement et des cookies d\'analytics anonymisés. Aucun cookie publicitaire n\'est utilisé.'],
        ].map(([title, content]) => (
          <div key={String(title)} className="border-b border-gray-100 pb-8">
            <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">{title}</h2>
            <p className="leading-relaxed whitespace-pre-line">{content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
