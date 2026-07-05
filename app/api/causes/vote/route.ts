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
    if (fetchError) {
      console.error('[POST /api/causes/vote] fetch error:', fetchError)
      return NextResponse.json({ error: fetchError.message, code: fetchError.code }, { status: 500 })
    }
    if (!cause) return NextResponse.json({ error: 'Cause introuvable' }, { status: 404 })

    const votes = (cause.votes || 0) + 1
    const { error: updateError } = await supabase.from('causes').update({ votes }).eq('slug', slug)
    if (updateError) {
      console.error('[POST /api/causes/vote] update error:', updateError)
      return NextResponse.json({ error: updateError.message, code: updateError.code }, { status: 500 })
    }

    return NextResponse.json({ votes })
  } catch (e) {
    console.error('[POST /api/causes/vote] catch:', e)
    return NextResponse.json({ error: 'Erreur serveur', detail: String(e) }, { status: 500 })
  }
}
