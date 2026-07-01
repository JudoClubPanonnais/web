export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(req: Request) {
  try {
    const { slug } = await req.json()
    if (!slug) return NextResponse.json({ error: 'slug requis' }, { status: 400 })

    const supabase = getSupabase()
    const { data: cause, error: fetchError } = await supabase
      .from('causes').select('id, votes').eq('slug', slug).single()
    if (fetchError || !cause) return NextResponse.json({ error: 'Cause introuvable' }, { status: 404 })

    const votes = (cause.votes || 0) + 1
    const { error: updateError } = await supabase.from('causes').update({ votes }).eq('slug', slug)
    if (updateError) throw updateError

    return NextResponse.json({ votes })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
