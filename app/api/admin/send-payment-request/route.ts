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
    const { registration_id, amount, message } = await req.json()
    if (!registration_id || !amount) {
      return NextResponse.json({ error: 'registration_id et amount requis' }, { status: 400 })
    }

    // Récupérer les infos de l'inscrit
    const { data: inscrit, error: fetchError } = await getSupabase()
      .from('course_registrations')
      .select('id, first_name, last_name, email')
      .eq('id', registration_id)
      .single()

    if (fetchError || !inscrit) {
      return NextResponse.json({ error: 'Inscrit introuvable' }, { status: 404 })
    }

    // Enregistrer la demande dans payment_history
    const { error: insertError } = await getSupabase().from('payment_history').insert({
      registration_id,
      amount,
      payment_method: null,
      note: message ? `Demande envoyée par email : ${message}` : 'Demande envoyée par email',
    })

    if (insertError) throw insertError

    // TODO: Envoi email réel — nécessite une configuration SMTP (ex: Resend, SendGrid, Nodemailer)
    // Exemple : await sendEmail({ to: inscrit.email, subject: 'Demande de paiement', body: message })

    return NextResponse.json({
      ok: true,
      email: inscrit.email,
      message: 'Demande enregistrée',
    })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
