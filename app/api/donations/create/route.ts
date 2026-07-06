export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function getStripeClient() { return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' as never }) }
const CAUSE_NAMES: Record<string, string> = {
  'lutte-delinquance': 'Lutte contre la délinquance',
  'perseverance-scolaire': 'Persévérance scolaire',
  'inclusion-autisme': 'Inclusion autisme & sport',
  'violences-femmes': 'Lutte contre les violences faites aux femmes',
  'decouverte-ailleurs': "Découverte de l'ailleurs",
}

export async function POST(req: NextRequest) {
  try {
    const { amount, cause_slug, donor_name, donor_email, message, anonymous, payment_method } = await req.json()

    if (!amount || amount < 100) {
      return NextResponse.json({ error: 'Montant minimum 1€' }, { status: 400 })
    }

    const causeName = cause_slug ? CAUSE_NAMES[cause_slug] : null

    // Récupérer l'ID de la cause
    let causeId = null
    if (cause_slug) {
      const { data } = await getSupabase().from('causes').select('id').eq('slug', cause_slug).single()
      causeId = data?.id
    }

    // Créer le don en BDD (statut pending)
    const { data: donation } = await getSupabase().from('donations').insert({
      cause_id: causeId,
      amount,
      donor_name: anonymous ? 'Anonyme' : donor_name,
      donor_email: donor_email || null,
      message: message || null,
      anonymous: anonymous || false,
      payment_method: payment_method || 'card',
      status: 'pending',
    }).select().single()

    // Créer la session Stripe
    const session = await getStripeClient().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: causeName ? `Don — ${causeName}` : 'Don général — Judo Club Panonnais',
            description: 'Judo Club Panonnais — 100% reversé au projet. Reçu fiscal automatique.',
            images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://judoclubpanonnais.com'}/logo-jcp.jpg`],
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: donor_email || undefined,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/merci?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/#don`,
      metadata: {
        donation_id: donation?.id || '',
        cause_slug: cause_slug || 'general',
        donor_name: anonymous ? 'Anonyme' : donor_name || '',
      },
    })

    // Mettre à jour le stripe_session_id
    if (donation?.id) {
      await getSupabase().from('donations').update({ stripe_session_id: session.id }).eq('id', donation.id)
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Donation create error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
