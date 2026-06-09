export default function Confidentialite() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '80px 24px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, marginBottom: 32 }}>
          Politique de Confidentialité
        </h1>
        <div style={{ color: 'var(--text2)', lineHeight: 1.8, fontSize: 15 }}>
          <h2 style={{ color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', marginBottom: 8, marginTop: 24 }}>Données collectées</h2>
          <p>Prénom, adresse email, préférences de personnalisation, historique des conversations, données de facturation (gérées par Stripe).</p>

          <h2 style={{ color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', marginBottom: 8, marginTop: 24 }}>Durée de conservation</h2>
          <p>Les données de compte sont conservées pendant la durée de votre abonnement, puis 3 ans à des fins légales. L'historique des conversations peut être supprimé sur demande.</p>

          <h2 style={{ color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', marginBottom: 8, marginTop: 24 }}>Vos droits (RGPD)</h2>
          <p>Vous disposez d'un droit d'accès, de rectification, d'effacement, de portabilité et d'opposition. Pour exercer ces droits, contactez-nous à <a href="mailto:contact@bluecircle.app" style={{ color: 'var(--accent)' }}>contact@bluecircle.app</a>.</p>

          <h2 style={{ color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', marginBottom: 8, marginTop: 24 }}>Partage des données</h2>
          <p>Nous ne revendons jamais vos données. Elles peuvent être partagées avec nos prestataires (Supabase, Stripe, Anthropic, Replicate) dans le strict cadre de la fourniture du service.</p>

          <h2 style={{ color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', marginBottom: 8, marginTop: 24 }}>Cookies</h2>
          <p>Nous utilisons des cookies de session pour l'authentification. Aucun cookie publicitaire n'est utilisé.</p>

          <p style={{ marginTop: 32, color: 'var(--text3)', fontSize: 13 }}>Dernière mise à jour : Janvier 2025</p>
        </div>
      </div>
    </div>
  )
}
