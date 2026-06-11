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
    const { data } = await getSupabase().from('course_registrations')
      .select('id, first_name, last_name, email, phone, birth_date, address, status, medical_notes, created_at, course_id, courses(name)')
      .order('created_at', { ascending: false })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registrations = (data || []).map((r: any) => ({
      ...r,
      course: Array.isArray(r.courses) ? (r.courses[0]?.name || 'Cours non défini') : (r.courses?.name || 'Cours non défini'),
    }))
    return NextResponse.json({ registrations })
  } catch {
    return NextResponse.json({ registrations: [] })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json()
    await getSupabase().from('course_registrations').update({ status }).eq('id', id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
