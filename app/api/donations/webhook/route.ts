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
export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = getStripeClient().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = event.data.object as any
    const { donation_id, cause_slug } = session.metadata || {}

    // Marquer le don comme complété
    if (donation_id) {
      await getSupabase().from('donations').update({
        status: 'completed',
        stripe_payment_intent: session.payment_intent as string,
      }).eq('id', donation_id)
    }

    // Mettre à jour le montant collecté par cause
    if (cause_slug && cause_slug !== 'general' && session.amount_total) {
      const { data: cause } = await getSupabase().from('causes').select('id, collected_amount').eq('slug', cause_slug).single()
      if (cause) {
        await getSupabase().from('causes').update({ collected_amount: (cause.collected_amount || 0) + session.amount_total }).eq('slug', cause_slug)
      }
    }
  }

  return NextResponse.json({ received: true })
}
