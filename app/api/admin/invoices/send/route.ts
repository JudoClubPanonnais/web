export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(req: NextRequest) {
  try {
    const { invoice_id } = await req.json()
    if (!invoice_id) return NextResponse.json({ error: 'invoice_id requis' }, { status: 400 })

    const supabase = getSupabase()
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, amount, registration_id, course_registrations(first_name, last_name, email)')
      .eq('id', invoice_id)
      .single()
    if (error || !invoice) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reg = Array.isArray(invoice.course_registrations) ? (invoice.course_registrations as any[])[0] : invoice.course_registrations as any
    const invoiceUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin/facture/${invoice.id}`

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        ok: false,
        reason: 'email_not_configured',
        message: "Aucun service d'envoi d'email configuré (variable RESEND_API_KEY manquante). La facture est générée mais n'a pas été envoyée.",
      })
    }

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'Judo Club Panonnais <contact@judoclubpanonnais.fr>',
        to: reg.email,
        subject: `Facture n°${invoice.invoice_number} — Judo Club Panonnais`,
        html: `<p>Bonjour ${reg.first_name},</p><p>Veuillez trouver votre facture n°${invoice.invoice_number} d'un montant de ${(invoice.amount / 100).toFixed(2)} € en suivant ce lien :</p><p><a href="${invoiceUrl}">${invoiceUrl}</a></p><p>Merci,<br/>Judo Club Panonnais</p>`,
      }),
    })

    if (!emailRes.ok) {
      const detail = await emailRes.text()
      return NextResponse.json({ ok: false, reason: 'send_failed', message: detail }, { status: 502 })
    }

    await supabase.from('invoices').update({ sent_at: new Date().toISOString() }).eq('id', invoice_id)

    return NextResponse.json({ ok: true, email: reg.email })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
