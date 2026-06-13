export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json({ error: 'Variables env manquantes', url: !!url, key: !!key })
  }

  try {
    const supabase = createClient(url, key)
    const { data, error } = await supabase.from('course_registrations').select('id').limit(1)
    if (error) return NextResponse.json({ error: error.message, code: error.code, hint: error.hint })
    return NextResponse.json({ ok: true, rows: data?.length ?? 0, keyType: key.startsWith('sb_secret') ? 'service_role' : 'anon' })
  } catch (e) {
    return NextResponse.json({ error: String(e) })
  }
}
