import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Blue Circle — L\'intimité réinventée',
  description: 'Votre compagnon IA intime. Réservé aux adultes de 18 ans et plus.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
