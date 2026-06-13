'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { AdminRoleContext, type Role } from '@/lib/adminRole'

const NAV = [
  { href: '/admin', label: 'Tableau de bord', coachAllowed: false },
  { href: '/admin/dons', label: 'Dons & projets', coachAllowed: false },
  { href: '/admin/visiteurs', label: 'Statistiques visiteurs', coachAllowed: false },
  { href: '/admin/inscrits', label: 'Inscrits aux cours', coachAllowed: true },
  { href: '/admin/newsletter', label: 'Newsletter', coachAllowed: false },
  { href: '/admin/reseaux', label: 'Réseaux sociaux', coachAllowed: false },
]

const PASSWORDS: Record<string, Role> = {
  'jcp-admin-2026': 'gerant',
  'coach-jcp-2026': 'coach',
}

const COACH_RESTRICTED = ['/admin/dons', '/admin/newsletter', '/admin/visiteurs', '/admin/reseaux']

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const router = useRouter()
  const [sideOpen, setSideOpen] = useState(false)
  const [role, setRole] = useState<Role>(null)
  const [loaded, setLoaded] = useState(false)
  const [loginMode, setLoginMode] = useState<'gerant' | 'coach'>('gerant')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem('jcp_admin_role') as Role
    if (stored === 'gerant' || stored === 'coach') {
      setRole(stored)
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (role === 'coach' && COACH_RESTRICTED.includes(path)) {
      router.replace('/admin')
    }
  }, [role, path, router])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const resolved = PASSWORDS[password]
    if (resolved && resolved === loginMode) {
      sessionStorage.setItem('jcp_admin_role', resolved)
      setRole(resolved)
      setLoginError('')
    } else {
      setLoginError('Mot de passe incorrect.')
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('jcp_admin_role')
    setRole(null)
    setPassword('')
  }

  if (!loaded) return null

  if (!role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <Image src="/logo-jcp.jpg" alt="JCP" width={56} height={56} className="rounded-full" />
          </div>
          <h1 className="text-xl font-black text-[#1e3a5f] text-center mb-6">Espace administration</h1>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de connexion</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLoginMode('gerant')}
                  className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors ${loginMode === 'gerant' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                  Gérant
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode('coach')}
                  className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors ${loginMode === 'coach' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                  Coach
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="input-field"
                placeholder="••••••••••••"
              />
            </div>
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button type="submit" className="btn-primary w-full py-3">Se connecter</button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-4">
            Accès réservé au personnel autorisé du Judo Club Panonnais.
          </p>
        </div>
      </div>
    )
  }

  return (
    <AdminRoleContext.Provider value={role}>
      <div className="min-h-screen bg-gray-50 flex">
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ${sideOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block`}>
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Image src="/logo-jcp.jpg" alt="JCP" width={36} height={36} className="rounded-full" />
              <div>
                <div className="font-bold text-[#1e3a5f] text-sm">JCP Admin</div>
                <div className="text-gray-400 text-xs capitalize">{role}</div>
              </div>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {NAV.filter(n => role === 'gerant' || n.coachAllowed).map(n => (
              <Link key={n.href} href={n.href}
                className={`admin-nav-link ${path === n.href ? 'bg-orange-50 text-orange-600 font-semibold' : ''}`}
                onClick={() => setSideOpen(false)}>
                <span>{n.label}</span>
              </Link>
            ))}
          </nav>
          <div className="absolute bottom-6 left-4 right-4 space-y-1">
            <button onClick={handleLogout} className="w-full flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors px-4 py-2">
              Se deconnecter
            </button>
            <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors px-4 py-2">
              Retour au site
            </Link>
          </div>
        </aside>

        {sideOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSideOpen(false)} />}

        <div className="flex-1 flex flex-col min-w-0">
          {role === 'coach' && (
            <div className="bg-orange-500 text-white text-center text-sm py-2 px-4 font-medium">
              Acces coach — vue limitee. Certaines sections sont restreintes.
            </div>
          )}
          <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between lg:hidden">
            <button onClick={() => setSideOpen(true)} className="p-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="font-bold text-[#1e3a5f]">Administration</span>
            <div />
          </header>
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminRoleContext.Provider>
  )
}
