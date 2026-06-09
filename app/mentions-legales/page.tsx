export default function MentionsLegales() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '80px 24px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, marginBottom: 32 }}>
          Mentions Légales
        </h1>
        <div style={{ color: 'var(--text2)', lineHeight: 1.8, fontSize: 15 }}>
          <h2 style={{ color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', marginBottom: 8 }}>Éditeur</h2>
          <p>Blue Circle SAS<br />SIRET : 000 000 000 00000<br />TVA : FR12345678900<br />Email : <a href="mailto:contact@bluecircle.app" style={{ color: 'var(--accent)' }}>contact@bluecircle.app</a></p>

          <h2 style={{ color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', marginBottom: 8, marginTop: 24 }}>Directeur de publication</h2>
          <p>Le directeur de publication est le représentant légal de Blue Circle SAS.</p>

          <h2 style={{ color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', marginBottom: 8, marginTop: 24 }}>Hébergement</h2>
          <p>Vercel Inc.<br />340 Pine Street, Suite 701<br />San Francisco, CA 94104, USA</p>

          <h2 style={{ color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', marginBottom: 8, marginTop: 24 }}>Propriété intellectuelle</h2>
          <p>L'ensemble du contenu de ce site est protégé par le droit d'auteur. Toute reproduction est interdite sans autorisation préalable.</p>

          <p style={{ marginTop: 32, color: 'var(--text3)', fontSize: 13 }}>Dernière mise à jour : Janvier 2025</p>
        </div>
      </div>
    </div>
  )
}
