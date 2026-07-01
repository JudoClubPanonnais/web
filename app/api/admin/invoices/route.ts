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
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

    const { data: invoice, error } = await getSupabase()
      .from('invoices')
      .select('id, invoice_number, amount, payment_method, issued_at, sent_at, registration_id, course_registrations(first_name, last_name, email, address, courses(name))')
      .eq('id', id)
      .single()
    if (error || !invoice) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 })

    return NextResponse.json({ invoice })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { registration_id } = await req.json()
    if (!registration_id) return NextResponse.json({ error: 'registration_id requis' }, { status: 400 })

    const supabase = getSupabase()

    const { data: existing } = await supabase.from('invoices').select('id').eq('registration_id', registration_id).maybeSingle()
    if (existing) return NextResponse.json({ invoice_id: existing.id })

    const { data: reg, error: regError } = await supabase
      .from('course_registrations')
      .select('price, payment_method, amount_paid')
      .eq('id', registration_id)
      .single()
    if (regError || !reg) return NextResponse.json({ error: 'Inscription introuvable' }, { status: 404 })

    const { data: last } = await supabase.from('invoices').select('invoice_number').order('invoice_number', { ascending: false }).limit(1).maybeSingle()
    const nextNumber = (last?.invoice_number || 0) + 1

    const { data: invoice, error: insertError } = await supabase.from('invoices').insert({
      registration_id,
      invoice_number: nextNumber,
      amount: reg.amount_paid > 0 ? reg.amount_paid : reg.price,
      payment_method: reg.payment_method,
    }).select('id').single()
    if (insertError || !invoice) throw insertError

    return NextResponse.json({ invoice_id: invoice.id })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
