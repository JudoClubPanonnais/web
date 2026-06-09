/**
 * Blue Circle — Setup Stripe
 * Crée les 4 produits/prix Stripe pour Blue Circle.
 * Usage : STRIPE_SECRET_KEY=sk_live_xxx node setup-stripe.js
 */

const https = require('https')
const fs = require('fs')

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
if (!STRIPE_SECRET_KEY) {
  console.error('❌ Manque la clé Stripe. Lance : STRIPE_SECRET_KEY=sk_live_xxx node setup-stripe.js')
  process.exit(1)
}

function stripeRequest(method, path, params) {
  return new Promise((resolve, reject) => {
    const body = params ? new URLSearchParams(params).toString() : ''
    const options = {
      hostname: 'api.stripe.com',
      path: `/v1/${path}`,
      method,
      headers: {
        'Authorization': 'Basic ' + Buffer.from(STRIPE_SECRET_KEY + ':').toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    }
    const req = https.request(options, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(JSON.parse(data)))
    })
    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })
}

async function main() {
  console.log('🔵 Blue Circle — Création des produits Stripe...\n')

  const plans = [
    { name: 'Blue Circle — Essentiel', amount: 1900, description: 'Chat 1h/jour, IA personnalisée' },
    { name: 'Blue Circle — Illimité',  amount: 3900, description: 'Chat illimité, IA personnalisée' },
    { name: 'Blue Circle — Premium',   amount: 7900, description: 'Chat 1h/jour + photos IA' },
    { name: 'Blue Circle — Elite',     amount: 19900, description: 'Tout illimité + photos' },
  ]

  const keys = ['STRIPE_PRICE_ESSENTIEL', 'STRIPE_PRICE_ILLIMITE', 'STRIPE_PRICE_PREMIUM', 'STRIPE_PRICE_ELITE']
  const priceIds = {}

  for (let i = 0; i < plans.length; i++) {
    const plan = plans[i]
    process.stdout.write(`  Création "${plan.name}"... `)

    const product = await stripeRequest('POST', 'products', {
      name: plan.name,
      description: plan.description,
    })
    if (product.error) { console.log('ERREUR:', product.error.message); process.exit(1) }

    const price = await stripeRequest('POST', 'prices', {
      product: product.id,
      unit_amount: plan.amount,
      currency: 'eur',
      'recurring[interval]': 'month',
    })
    if (price.error) { console.log('ERREUR:', price.error.message); process.exit(1) }

    priceIds[keys[i]] = price.id
    console.log(`OK → ${price.id}`)
  }

  console.log('\n✅ Les 4 produits sont créés !\n')
  console.log('══════════════════════════════════════════════════════')
  console.log('Ajoute ces variables dans Vercel (Settings → Env Vars):\n')

  const lines = [
    `STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}`,
    `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_REMPLACE_PAR_CLE_PUBLIQUE`,
    `STRIPE_WEBHOOK_SECRET=whsec_CREE_SUR_DASHBOARD_STRIPE`,
    ...Object.entries(priceIds).map(([k, v]) => `${k}=${v}`),
    '',
    '# À remplir :',
    'NEXT_PUBLIC_SUPABASE_URL=',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
    'SUPABASE_SERVICE_ROLE_KEY=',
    'ANTHROPIC_API_KEY=',
    'REPLICATE_API_TOKEN=',
    'NEXT_PUBLIC_APP_URL=https://TON-PROJET.vercel.app',
  ]

  lines.forEach(l => console.log(l))
  console.log('══════════════════════════════════════════════════════')

  const safeLines = lines.map(l =>
    l.startsWith('STRIPE_SECRET_KEY=') ? 'STRIPE_SECRET_KEY=sk_live_...(masquée)' : l
  )
  fs.writeFileSync('.env.generated', safeLines.join('\n'))
  console.log('\n📄 Résumé sauvegardé dans .env.generated (clé masquée)\n')
}

main().catch(err => { console.error('Erreur:', err.message); process.exit(1) })
