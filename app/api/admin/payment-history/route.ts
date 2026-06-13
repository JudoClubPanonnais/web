export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const registration_id = searchParams.get('registration_id')
    if (!registration_id) return NextResponse.json({ history: [] })
    const { data } = await getSupabase()
      .from('payment_history')
      .select('id, amount, payment_method, payment_date, note, created_at')
      .eq('registration_id', registration_id)
      .order('payment_date', { ascending: false })
    return NextResponse.json({ history: data || [] })
  } catch {
    return NextResponse.json({ history: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { registration_id, amount, payment_method, payment_date, note } = await req.json()
    if (!registration_id || !amount) {
      return NextResponse.json({ error: 'registration_id et amount requis' }, { status: 400 })
    }

    const supabase = getSupabase()

    const { error: insertError } = await supabase.from('payment_history').insert({
      registration_id,
      amount,
      payment_method: payment_method || null,
      payment_date: payment_date || undefined,
      note: note || null,
    })

    if (insertError) throw insertError

    // Recalculer amount_paid
    const { data: allPayments } = await supabase
      .from('payment_history')
      .select('amount')
      .eq('registration_id', registration_id)

    const totalPaid = (allPayments || []).reduce((sum, p) => sum + (p.amount || 0), 0)

    // Récupérer le prix total pour déterminer payment_status
    const { data: reg } = await supabase
      .from('course_registrations')
      .select('price')
      .eq('id', registration_id)
      .single()

    const paymentStatus = reg && reg.price > 0
      ? totalPaid >= reg.price ? 'paid' : totalPaid > 0 ? 'partial' : 'pending'
      : 'pending'

    await supabase.from('course_registrations').update({
      amount_paid: totalPaid,
      payment_status: paymentStatus,
    }).eq('id', registration_id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
