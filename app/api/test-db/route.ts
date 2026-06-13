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
    const { error } = await getSupabase().from('course_registrations').insert({
      first_name: 'Test',
      last_name: 'Debug',
      email: 'debug@test.com',
      status: 'pending',
      course_type: 'essai',
      price: 0,
      payment_installments: 1,
    })
    if (error) return NextResponse.json({ insert_error: error.message, code: error.code, hint: error.hint, details: error.details })
    // Supprimer le test
    await getSupabase().from('course_registrations').delete().eq('email', 'debug@test.com')
    return NextResponse.json({ ok: true, message: 'Insert fonctionne correctement' })
  } catch (e) {
    return NextResponse.json({ catch_error: String(e) })
  }
}
