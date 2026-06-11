import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Judo Club Panonnais — Bras Panon, La Réunion',
  description: 'Club de judo affilié FFJDA à Bras Panon (La Réunion). 80+ pratiquants, 5 causes sociales, cours tous niveaux. Soutenez notre projet pédagogique 2026.',
  keywords: 'judo, club, Bras Panon, La Réunion, FFJDA, don, inclusion, autisme, solidarité',
  openGraph: {
    title: 'Judo Club Panonnais',
    description: 'Le tatami comme levier de changement social. Soutenez nos 5 causes.',
    images: ['/logo-jcp.jpg'],
    locale: 'fr_FR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Header />
        <main className="min-h-screen pt-16 md:pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
