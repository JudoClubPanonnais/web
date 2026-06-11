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
    const { data, error } = await getSupabase()
      .from('causes')
      .select('id, slug, name, collected_amount, goal_amount')
      .order('sort_order')
    if (error) throw error
    return NextResponse.json({ causes: data })
  } catch {
    return NextResponse.json({ causes: [] })
  }
}
