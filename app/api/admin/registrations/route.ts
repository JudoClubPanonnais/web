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
      .select('id, first_name, last_name, email, phone, birth_date, address, status, medical_notes, created_at, course_id, courses(name), price, payment_status, payment_installments, payment_method, amount_paid, course_type, belt_color')
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
    const body = await req.json()
    const { id, status, belt_color } = body
    const update: Record<string, string> = {}
    if (status !== undefined) update.status = status
    if (belt_color !== undefined) update.belt_color = belt_color
    await getSupabase().from('course_registrations').update(update).eq('id', id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    const { error } = await getSupabase().from('course_registrations').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { first_name, last_name, email, phone, birth_date, course, medical_notes, course_type, price, payment_installments, payment_method } = body
    if (!first_name || !last_name || !email) {
      return NextResponse.json({ error: 'Prénom, nom et email requis' }, { status: 400 })
    }

    // Chercher le cours par nom (maybeSingle ne lève pas d'erreur si absent)
    const { data: courseRow } = await getSupabase().from('courses').select('id').ilike('name', `%${course}%`).limit(1).maybeSingle()

    const { error } = await getSupabase().from('course_registrations').insert({
      first_name,
      last_name,
      email,
      phone: phone || null,
      birth_date: birth_date || null,
      course_id: courseRow?.id || null,
      medical_notes: medical_notes || null,
      status: 'pending',
      course_type: course_type || 'payant',
      price: typeof price === 'number' ? price : 0,
      payment_installments: typeof payment_installments === 'number' ? payment_installments : 1,
      payment_method: payment_method || null,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur', detail: String(e) }, { status: 500 })
  }
}
