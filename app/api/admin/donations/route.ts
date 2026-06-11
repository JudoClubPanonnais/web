export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function GET() {
  try {
    const { data } = await getSupabase()
      .from('donations')
      .select('id, donor_name, donor_email, amount, message, anonymous, status, created_at, cause_id, causes(name)')
      .order('created_at', { ascending: false })
      .limit(500)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const donations = (data || []).map((d: any) => ({
      ...d,
      cause: Array.isArray(d.causes) ? (d.causes[0]?.name || '') : (d.causes?.name || ''),
    }))

    return NextResponse.json({ donations })
  } catch {
    return NextResponse.json({ donations: [] })
  }
}
