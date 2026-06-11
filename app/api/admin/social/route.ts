export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function GET() {
  try {
    const { data } = await getSupabase().from('social_links').select('*').eq('active', true).order('sort_order')
    return NextResponse.json({ links: data || [] })
  } catch {
    return NextResponse.json({ links: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { links } = await req.json()
    for (const [platform, url] of Object.entries(links)) {
      if (!url) continue
      await getSupabase().from('social_links').upsert({
        platform,
        url: url as string,
        active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'platform' })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
