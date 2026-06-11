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
    const [total] = await Promise.all([
      getSupabase().from('page_views').select('id', { count: 'exact', head: true }),
    ])
    const byPage = { data: null }
    const byDay = { data: null }

    // Fallback: manual aggregation
    let pageStats: { path: string; count: number }[] = []
    let dayStats: { date: string; count: number }[] = []

    if (!byPage.data) {
      const { data: raw } = await getSupabase().from('page_views').select('path').limit(10000)
      const counts: Record<string, number> = {}
      ;(raw || []).forEach((r: { path: string }) => { counts[r.path] = (counts[r.path] || 0) + 1 })
      pageStats = Object.entries(counts).map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count)
    } else {
      pageStats = byPage.data
    }

    if (!byDay.data) {
      const { data: raw } = await getSupabase().from('page_views').select('created_at').order('created_at').limit(10000)
      const counts: Record<string, number> = {}
      ;(raw || []).forEach((r: { created_at: string }) => {
        const date = r.created_at.split('T')[0]
        counts[date] = (counts[date] || 0) + 1
      })
      dayStats = Object.entries(counts).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date))
    } else {
      dayStats = byDay.data
    }

    return NextResponse.json({ total: total.count || 0, by_page: pageStats, by_day: dayStats })
  } catch {
    return NextResponse.json({ total: 0, by_page: [], by_day: [] })
  }
}
