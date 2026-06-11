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
    const { data } = await getSupabase().from('newsletter_campaigns').select('*').order('created_at', { ascending: false })
    return NextResponse.json({ campaigns: data || [] })
  } catch {
    return NextResponse.json({ campaigns: [] })
  }
}
