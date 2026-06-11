'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin', label: 'Tableau de bord' },
  { href: '/admin/dons', label: 'Dons & projets' },
  { href: '/admin/visiteurs', label: 'Statistiques visiteurs' },
  { href: '/admin/inscrits', label: 'Inscrits aux cours' },
  { href: '/admin/newsletter', label: 'Newsletter' },
  { href: '/admin/reseaux', label: 'Réseaux sociaux' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const [sideOpen, setSideOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ${sideOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block`}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Image src="/logo-jcp.jpg" alt="JCP" width={36} height={36} className="rounded-full" />
            <div>
              <div className="font-bold text-[#1e3a5f] text-sm">JCP Admin</div>
              <div className="text-gray-400 text-xs">Tableau de bord</div>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              className={`admin-nav-link ${path === n.href ? 'bg-orange-50 text-orange-600 font-semibold' : ''}`}
              onClick={() => setSideOpen(false)}>
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-6 left-4 right-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors px-4 py-2">
            ← Retour au site
          </Link>
        </div>
      </aside>

      {sideOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSideOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
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
  )
}
