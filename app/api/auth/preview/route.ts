export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

const LOGIN = process.env.PREVIEW_LOGIN || 'jcp2026'
const PASS  = process.env.PREVIEW_PASS  || 'tatami974'

export async function POST(req: NextRequest) {
  const { login, password } = await req.json()
  if (login === LOGIN && password === PASS) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set('jcp_preview_auth', `${LOGIN}:${PASS}`, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
    return res
  }
  return NextResponse.json({ ok: false }, { status: 401 })
}
