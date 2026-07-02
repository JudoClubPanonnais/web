export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, birthDate, address, course, emergencyContact, emergencyPhone, medicalNotes } = body

    if (!firstName || !lastName || !email || !course) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
    }

    // Trouver le cours correspondant
    const { data: courseData } = await getSupabase().from('courses').select('id').ilike('name', `%${course.split('(')[0].trim()}%`).limit(1).maybeSingle()

    const { course_type, price, payment_installments, payment_method } = body

    const insertData = {
      course_id: courseData?.id || null,
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase().trim(),
      phone: phone || null,
      birth_date: birthDate || null,
      address: address || null,
      emergency_contact: emergencyContact || null,
      emergency_phone: emergencyPhone || null,
      medical_notes: medicalNotes || null,
      status: 'pending',
      course_type: course_type || 'payant',
      price: typeof price === 'number' ? price : 0,
      payment_installments: typeof payment_installments === 'number' ? payment_installments : 1,
      payment_method: payment_method || null,
    }

    const { error } = await getSupabase().from('course_registrations').insert(insertData)

    if (error) {
      console.error('[POST /api/courses/register] supabase error:', error)
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[POST /api/courses/register] catch:', e)
    return NextResponse.json({ error: 'Erreur serveur', detail: String(e) }, { status: 500 })
  }
}
