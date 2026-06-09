export default function CGV() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '80px 24px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, marginBottom: 32 }}>
          Conditions Générales de Vente
        </h1>
        <div style={{ color: 'var(--text2)', lineHeight: 1.8, fontSize: 15 }}>
          <h2 style={{ color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', marginBottom: 8, marginTop: 24 }}>1. Éditeur</h2>
          <p>Blue Circle SAS — SIRET 000 000 000 00000 — TVA FR12345678900<br />
          Contact : <a href="mailto:contact@bluecircle.app" style={{ color: 'var(--accent)' }}>contact@bluecircle.app</a></p>

          <h2 style={{ color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', marginBottom: 8, marginTop: 24 }}>2. Objet</h2>
          <p>Les présentes conditions régissent l'accès et l'utilisation des services Blue Circle, plateforme de compagnie IA réservée aux adultes de 18 ans et plus.</p>

          <h2 style={{ color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', marginBottom: 8, marginTop: 24 }}>3. Abonnements</h2>
          <p>Les abonnements sont mensuels et renouvelés automatiquement à la date anniversaire. Les tarifs sont TTC. Vous pouvez résilier à tout moment depuis votre profil ou via le portail Stripe.</p>

          <h2 style={{ color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', marginBottom: 8, marginTop: 24 }}>4. Droit de rétractation</h2>
          <p>Conformément à l'article L.221-18 du Code de la consommation, vous disposez d'un délai de 14 jours à compter de la souscription pour exercer votre droit de rétractation. Cependant, en utilisant le service dès la souscription, vous reconnaissez renoncer à ce droit.</p>

          <h2 style={{ color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', marginBottom: 8, marginTop: 24 }}>5. Protection des données</h2>
          <p>Vos données personnelles sont traitées conformément au RGPD. Nous ne revendons jamais vos données. Pour plus d'informations, consultez notre politique de confidentialité.</p>

          <h2 style={{ color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', marginBottom: 8, marginTop: 24 }}>6. Responsabilité</h2>
          <p>Blue Circle SAS ne saurait être tenu responsable des dommages indirects résultant de l'utilisation du service. Le service est fourni "tel quel".</p>

          <p style={{ marginTop: 32, color: 'var(--text3)', fontSize: 13 }}>Dernière mise à jour : Janvier 2025</p>
        </div>
      </div>
    </div>
  )
}
