'use client'
import { useEffect, useState } from 'react'

interface PageStat { path: string; count: number }
interface DayStat { date: string; count: number }

export default function AdminVisiteurs() {
  const [pageStats, setPageStats] = useState<PageStat[]>([])
  const [dayStats, setDayStats] = useState<DayStat[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/visitors').then(r => r.json()).then(d => {
      setPageStats(d.by_page || [])
      setDayStats(d.by_day || [])
      setTotal(d.total || 0)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const maxDay = Math.max(...dayStats.map(d => d.count), 1)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Statistiques visiteurs</h1>
        <p className="text-gray-500 text-sm mt-1">Analyse du trafic sur le site</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Visites totales', value: total, color: 'bg-blue-50 text-blue-600' },
          { label: 'Pages vues aujourd\'hui', value: dayStats[dayStats.length-1]?.count || 0, icon: '📅', color: 'bg-orange-50 text-orange-600' },
          { label: 'Pages vues cette semaine', value: dayStats.slice(-7).reduce((s,d) => s+d.count, 0), icon: '📈', color: 'bg-green-50 text-green-600' },
          { label: 'Pages indexées', value: pageStats.length, icon: '📄', color: 'bg-purple-50 text-purple-600' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-10 h-10 ${k.color} rounded-xl flex items-center justify-center text-xl mb-3`}>{k.icon}</div>
            <div className="text-2xl font-black text-gray-900">{loading ? '—' : k.value.toLocaleString('fr-FR')}</div>
            <div className="text-sm text-gray-500">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Graphique par jour */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-5">📈 Visites des 30 derniers jours</h2>
          {loading ? <div className="animate-pulse h-40 bg-gray-100 rounded-xl" /> : (
            <div className="flex items-end gap-1 h-40">
              {dayStats.slice(-30).map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {d.count} visite{d.count > 1 ? 's' : ''}<br/>{new Date(d.date).toLocaleDateString('fr-FR', {day:'numeric', month:'short'})}
                  </div>
                  <div className="w-full bg-orange-400 rounded-t" style={{ height: `${(d.count / maxDay) * 140}px` }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pages les plus visitées */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-5">🔥 Pages les plus visitées</h2>
          {loading ? <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="animate-pulse h-10 bg-gray-100 rounded-xl" />)}</div> : (
            <div className="space-y-3">
              {pageStats.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">Aucune donnée disponible</p>
              ) : pageStats.slice(0, 10).map((p, i) => {
                const maxCount = pageStats[0]?.count || 1
                const pct = Math.round((p.count / maxCount) * 100)
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700 font-mono truncate max-w-[60%]">{p.path}</span>
                      <span className="text-sm font-semibold text-gray-600">{p.count.toLocaleString('fr-FR')}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
