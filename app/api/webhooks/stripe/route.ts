import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getAdminSupabase()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { user_id, plan_id } = session.metadata!
    const subscription = await getStripe().subscriptions.retrieve(session.subscription as string)
    await supabase.from('subscriptions').upsert({
      user_id,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscription.id,
      plan_id,
      status: 'active',
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
    })
    await supabase.from('notifications').insert({
      user_id,
      title: 'Abonnement activé',
      body: `Votre abonnement ${plan_id} est maintenant actif. Bienvenue !`,
    })
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await supabase.from('subscriptions').update({ status: 'canceled' }).eq('stripe_subscription_id', sub.id)
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    await supabase.from('subscriptions').update({ status: 'past_due' }).eq('stripe_customer_id', invoice.customer as string)
  }

  return NextResponse.json({ received: true })
}
