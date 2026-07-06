import Link from 'next/link'
import Image from 'next/image'

export default function MerciPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1f33] to-[#1e3a5f] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl">
        <Image src="/logo-jcp.jpg" alt="JCP" width={80} height={80} className="rounded-full mx-auto mb-6" />
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-3xl font-black text-[#1e3a5f] mb-4">Merci pour votre don !</h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Votre générosité contribue directement à nos causes sociales.
        </p>
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-6 text-left space-y-2 text-sm text-gray-600">
          <p>✅ Paiement confirmé et sécurisé</p>
          <p>💸 100% de votre don reversé au projet</p>
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/#causes" className="btn-primary w-full">Découvrir nos causes</Link>
          <Link href="/" className="btn-secondary w-full">Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  )
}
