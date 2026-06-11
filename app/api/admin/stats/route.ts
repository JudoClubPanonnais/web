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
    const [dons, regs, subs, views, causes, recentDons] = await Promise.all([
      getSupabase().from('donations').select('amount, status').eq('status', 'completed'),
      getSupabase().from('course_registrations').select('id', { count: 'exact', head: true }),
      getSupabase().from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('active', true),
      getSupabase().from('page_views').select('id', { count: 'exact', head: true }),
      getSupabase().from('causes').select('name, icon, collected_amount, goal_amount').order('sort_order'),
      getSupabase().from('donations').select('donor_name, amount, cause_id, created_at, causes(name)').eq('status', 'completed').order('created_at', { ascending: false }).limit(10),
    ])

    const totalAmount = (dons.data || []).reduce((s, d) => s + (d.amount || 0), 0)

    return NextResponse.json({
      total_donations: dons.data?.length || 0,
      total_amount: totalAmount,
      total_registrations: regs.count || 0,
      total_subscribers: subs.count || 0,
      total_views: views.count || 0,
      causes: (causes.data || []).map(c => ({
        name: c.name,
        icon: c.icon,
        collected: c.collected_amount || 0,
        goal: c.goal_amount || 0,
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recent_donations: (recentDons.data || []).map((d: any) => ({
        donor_name: d.donor_name || 'Anonyme',
        amount: d.amount,
        cause: Array.isArray(d.causes) ? (d.causes[0]?.name || 'Don général') : (d.causes?.name || 'Don général'),
        created_at: d.created_at,
      })),
    })
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
