'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2, Image, Film, LayoutTemplate } from 'lucide-react'
import {
  getClients, getEntries, saveEntries, formatMonth, getLast12Months, currentMonth,
  SERVICE_LABELS, SERVICE_COLORS, type ServiceType, type ServiceEntry, type Client
} from '@/lib/store'

function SummaryContent() {
  const searchParams = useSearchParams()
  const preClient = searchParams.get('client') || 'all'

  const [clients, setClients] = useState<Client[]>([])
  const [entries, setEntries] = useState<ServiceEntry[]>([])
  const [month, setMonth] = useState(currentMonth())
  const [clientFilter, setClientFilter] = useState(preClient)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setClients(getClients())
    setEntries(getEntries())
    setMounted(true)
  }, [])

  const months = getLast12Months()

  const filtered = entries.filter(e =>
    e.month === month &&
    (clientFilter === 'all' || e.clientId === clientFilter)
  )

  function deleteEntry(id: string) {
    if (!confirm('Entry delete karein?')) return
    const updated = entries.filter(e => e.id !== id)
    setEntries(updated)
    saveEntries(updated)
  }

  // Per-client totals
  const clientTotals: Record<string, Record<string, number>> = {}
  filtered.forEach(entry => {
    if (!clientTotals[entry.clientId]) clientTotals[entry.clientId] = {}
    Object.entries(entry.services).forEach(([k, v]) => {
      clientTotals[entry.clientId][k] = (clientTotals[entry.clientId][k] || 0) + (v || 0)
    })
  })

  const allSvcs = [...new Set(filtered.flatMap(e => Object.keys(e.services)))] as ServiceType[]

  // Grand totals
  const grandTotals: Record<string, number> = {}
  allSvcs.forEach(s => {
    grandTotals[s] = filtered.reduce((acc, e) => acc + ((e.services as Record<string,number>)[s] || 0), 0)
  })
  const grandTotal = Object.values(grandTotals).reduce((a, b) => a + b, 0)

  if (!mounted) return null

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={17} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Monthly Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">Client-wise service breakdown</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <select className="input max-w-48" value={month} onChange={e => setMonth(e.target.value)}>
          {months.map(m => <option key={m} value={m}>{formatMonth(m)}</option>)}
        </select>
        <select className="input max-w-56" value={clientFilter} onChange={e => setClientFilter(e.target.value)}>
          <option value="all">All Clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div className="stat-card">
          <p className="text-xs text-gray-500 mb-1">Total Deliverables</p>
          <p className="text-3xl font-semibold text-gray-900">{grandTotal}</p>
          <p className="text-xs text-gray-400 mt-0.5">{filtered.length} entries</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-1.5 mb-1">
            <Image size={13} className="text-blue-500" />
            <p className="text-xs text-gray-500">Static Posts</p>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{grandTotals['static_post'] || 0}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-1.5 mb-1">
            <Film size={13} className="text-purple-500" />
            <p className="text-xs text-gray-500">Reels / Videos</p>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{grandTotals['reel'] || 0}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-1.5 mb-1">
            <LayoutTemplate size={13} className="text-orange-500" />
            <p className="text-xs text-gray-500">Carousels</p>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{grandTotals['carousel'] || 0}</p>
        </div>
      </div>

      {/* Client breakdown table */}
      {Object.keys(clientTotals).length > 0 ? (
        <div className="card mb-5">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Client-wise Breakdown — {formatMonth(month)}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium">Client</th>
                  <th className="text-left px-5 py-3 font-medium">Package</th>
                  {allSvcs.map(s => <th key={s} className="text-left px-5 py-3 font-medium">{SERVICE_LABELS[s]}</th>)}
                  <th className="text-left px-5 py-3 font-medium text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(clientTotals).map(([cid, svcs]) => {
                  const client = clients.find(c => c.id === cid)
                  const rowTotal = Object.values(svcs).reduce((a, b) => a + b, 0)
                  return (
                    <tr key={cid} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-800">{client?.name || 'Unknown'}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{client?.package || '—'}</td>
                      {allSvcs.map(s => (
                        <td key={s} className="px-5 py-3">
                          {svcs[s] ? <span className={`badge ${SERVICE_COLORS[s]}`}>{svcs[s]}</span> : <span className="text-gray-300">—</span>}
                        </td>
                      ))}
                      <td className="px-5 py-3 font-semibold text-brand-700">{rowTotal}</td>
                    </tr>
                  )
                })}
                {/* Grand total row */}
                <tr className="bg-gray-50 font-semibold text-xs text-gray-600 border-t-2 border-gray-200">
                  <td className="px-5 py-3 uppercase tracking-wide" colSpan={2}>Total</td>
                  {allSvcs.map(s => (
                    <td key={s} className="px-5 py-3 font-bold text-gray-800">{grandTotals[s] || 0}</td>
                  ))}
                  <td className="px-5 py-3 font-bold text-brand-700 text-sm">{grandTotal}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card py-12 text-center mb-5">
          <p className="text-gray-400 text-sm">Is mahine ({formatMonth(month)}) koi entry nahi.</p>
          <Link href="/log" className="btn-primary mt-3 inline-flex">+ Entry Add Karein</Link>
        </div>
      )}

      {/* All entries log */}
      {filtered.length > 0 && (
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">All Entries — {formatMonth(month)}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                  <th className="text-left px-5 py-3 font-medium">Client</th>
                  <th className="text-left px-5 py-3 font-medium">Services</th>
                  <th className="text-left px-5 py-3 font-medium">Notes</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(entry => {
                  const client = clients.find(c => c.id === entry.clientId)
                  return (
                    <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{entry.deliveryDate}</td>
                      <td className="px-5 py-3 font-medium text-gray-800">{client?.name || '?'}</td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(entry.services).map(([k, v]) => (
                            <span key={k} className={`badge ${SERVICE_COLORS[k as ServiceType]}`}>
                              {SERVICE_LABELS[k as ServiceType]}: {v}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-400 max-w-48 truncate">{entry.notes || '—'}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => deleteEntry(entry.id)} className="btn-danger">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SummaryPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400">Loading...</div>}>
      <SummaryContent />
    </Suspense>
  )
}
