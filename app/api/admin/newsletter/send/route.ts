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
    const { subject, preview_text, content_html } = await req.json()
    if (!subject || !content_html) return NextResponse.json({ error: 'Champs requis' }, { status: 400 })

    // Récupérer les abonnés actifs
    const { data: subscribers } = await getSupabase().from('newsletter_subscribers').select('email, first_name').eq('active', true)
    const count = subscribers?.length || 0

    // Enregistrer la campagne
    await getSupabase().from('newsletter_campaigns').insert({
      subject,
      preview_text,
      content_html,
      status: 'sent',
      sent_at: new Date().toISOString(),
      recipient_count: count,
    })

    // Note: Dans un vrai projet, envoyer les emails via Resend, SendGrid, etc.
    // Pour l'instant on enregistre juste la campagne.
    // Exemple avec Resend: await resend.emails.send({ from, to: emails, subject, html: content_html })

    return NextResponse.json({ success: true, sent_to: count })
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
