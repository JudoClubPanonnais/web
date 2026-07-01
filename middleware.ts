import { NextRequest, NextResponse } from 'next/server'

// ⚠️ PROTECTION TEMPORAIRE — À SUPPRIMER AVANT LA MISE EN LIGNE PUBLIQUE
// Pour désactiver la protection, mettez SITE_PROTECTED=false dans vos variables d'env
const SITE_PROTECTED = process.env.SITE_PROTECTED !== 'false'
const LOGIN   = process.env.PREVIEW_LOGIN || 'jcp2026'
const PASS    = process.env.PREVIEW_PASS  || 'tatami974'

export function middleware(req: NextRequest) {
  if (!SITE_PROTECTED) return NextResponse.next()

  const { pathname } = req.nextUrl

  // Pages et ressources toujours accessibles
  const publicPaths = ['/acces-prive', '/_next', '/api/', '/logo-jcp.jpg', '/media/', '/favicon', '/facture/']
  if (publicPaths.some(p => pathname.startsWith(p))) return NextResponse.next()

  // Vérifier le cookie de session
  const auth = req.cookies.get('jcp_preview_auth')?.value
  if (auth === `${LOGIN}:${PASS}`) return NextResponse.next()

  // Vérifier l'auth Basic (pour les outils dev)
  const basic = req.headers.get('authorization')
  if (basic) {
    const [, b64] = basic.split(' ')
    const [u, p] = Buffer.from(b64, 'base64').toString().split(':')
    if (u === LOGIN && p === PASS) {
      const res = NextResponse.next()
      res.cookies.set('jcp_preview_auth', `${LOGIN}:${PASS}`, { httpOnly: true, maxAge: 60 * 60 * 24 * 7 })
      return res
    }
  }

  // Rediriger vers la page de connexion
  const url = req.nextUrl.clone()
  url.pathname = '/acces-prive'
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
