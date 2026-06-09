'use client'
import { usePathname } from 'next/navigation'

interface BottomNavProps { lang: string }

export default function BottomNav({ lang }: BottomNavProps) {
  const pathname = usePathname()
  const fr = lang === 'fr'

  const items = [
    { href: '/', icon: '🏠', label: fr ? 'Accueil' : 'Home' },
    { href: '/chat', icon: '💬', label: fr ? 'Discuter' : 'Chat' },
    { href: '/profile', icon: '👤', label: fr ? 'Profil' : 'Profile' },
  ]

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border)', zIndex: 90,
    }}>
      {items.map(item => {
        const active = pathname === item.href
        return (
          <a key={item.href} href={item.href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            textDecoration: 'none', flex: 1,
          }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 11, fontFamily: 'DM Sans, sans-serif', color: active ? 'var(--accent)' : 'var(--text3)' }}>
              {item.label}
            </span>
          </a>
        )
      })}
    </nav>
  )
}
