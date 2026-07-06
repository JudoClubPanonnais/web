'use client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface InvoiceData {
  id: string
  invoice_number: number
  amount: number
  payment_method: string | null
  issued_at: string
  course_registrations: {
    first_name: string
    last_name: string
    email: string
    address: string | null
    courses: { name: string } | { name: string }[] | null
  }
}

function fmtEur(cents: number) {
  return `${(cents / 100).toFixed(2)} €`
}

const PAYMENT_LABELS: Record<string, string> = {
  helloasso: 'Carte bancaire (HelloAsso)',
  card: 'Carte bancaire',
  transfer: 'Virement bancaire',
  cash: 'Espèces / Chèque',
}

export default function FacturePage() {
  const { id } = useParams<{ id: string }>()
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/invoices?id=${id}`).then(r => r.json()).then(d => {
      if (d.invoice) setInvoice(d.invoice)
      else setError(true)
    }).catch(() => setError(true))
  }, [id])

  if (error) return <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-500">Facture introuvable.</div>
  if (!invoice) return <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">Chargement...</div>

  const reg = invoice.course_registrations
  const course = Array.isArray(reg.courses) ? reg.courses[0]?.name : reg.courses?.name
  const number = `FAC-${new Date(invoice.issued_at).getFullYear()}-${String(invoice.invoice_number).padStart(6, '0')}`

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 print:py-0">
      <div className="flex justify-end mb-6 print:hidden">
        <button onClick={() => window.print()} className="btn-primary">Imprimer / Enregistrer en PDF</button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 print:border-0 print:rounded-none">
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="font-black text-xl text-[#1e3a5f]">Judo Club Panonnais</div>
            <div className="text-gray-500 text-sm mt-1">
              Association loi 1901<br />
              SIRET : 832 172 753 00010<br />
              Siège social : Bras Panon — 97412 — Île de La Réunion<br />
              contact@judoclubpanonnais.com
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-[#1e3a5f]">FACTURE</div>
            <div className="text-gray-500 text-sm mt-1">{number}</div>
            <div className="text-gray-500 text-sm">{new Date(invoice.issued_at).toLocaleDateString('fr-FR')}</div>
          </div>
        </div>

        <div className="mb-8">
          <div className="text-xs uppercase text-gray-400 font-semibold mb-1">Facturé à</div>
          <div className="font-semibold text-gray-800">{reg.first_name} {reg.last_name}</div>
          {reg.address && <div className="text-gray-500 text-sm">{reg.address}</div>}
          <div className="text-gray-500 text-sm">{reg.email}</div>
        </div>

        <table className="w-full text-sm mb-8">
          <thead>
            <tr className="border-b-2 border-gray-800 text-left">
              <th className="pb-2 font-semibold text-gray-700">Description</th>
              <th className="pb-2 font-semibold text-gray-700 text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 text-gray-700">Adhésion 2026–2027{course ? ` — ${course}` : ''}</td>
              <td className="py-3 text-right text-gray-700">{fmtEur(invoice.amount)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-4 font-bold text-[#1e3a5f]">Total</td>
              <td className="pt-4 font-bold text-[#1e3a5f] text-right text-lg">{fmtEur(invoice.amount)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="text-sm text-gray-500 mb-6">
          Mode de paiement : <span className="font-medium text-gray-700">{invoice.payment_method ? (PAYMENT_LABELS[invoice.payment_method] || invoice.payment_method) : '—'}</span>
        </div>

        <div className="text-xs text-gray-400 border-t border-gray-100 pt-4">
          Association loi 1901 — TVA non applicable, art. 293 B du CGI.
        </div>
      </div>
    </div>
  )
}
