'use client'
import { useState, useEffect } from 'react'
import { ArrowLeft, Download, FileSpreadsheet, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import {
  getClients, getEntries, getLast12Months, formatMonth, currentMonth,
  SERVICE_LABELS, type ServiceType
} from '@/lib/store'

export default function ExportPage() {
  const [mounted, setMounted] = useState(false)
  const [exportMonth, setExportMonth] = useState(currentMonth())
  const [scope, setScope] = useState<'month' | 'all'>('month')
  const [done, setDone] = useState(false)
  const months = getLast12Months()

  useEffect(() => { setMounted(true) }, [])

  function exportCSV() {
    const clients = getClients()
    const entries = getEntries()
    const allSvcs = Object.keys(SERVICE_LABELS) as ServiceType[]

    const toExport = scope === 'all' ? entries : entries.filter(e => e.month === exportMonth)

    if (!toExport.length) {
      alert('Koi data nahi export karne ke liye.')
      return
    }

    const headers = [
      'S.No',
      'Client Name',
      'Business',
      'Package',
      'WhatsApp',
      'Month',
      'Delivery Date',
      ...allSvcs.map(s => SERVICE_LABELS[s]),
      'Total Deliverables',
      'Notes',
    ]

    const rows = toExport.map((entry, i) => {
      const client = clients.find(c => c.id === entry.clientId)
      const total = Object.values(entry.services).reduce((a, b) => a + (b || 0), 0)
      return [
        i + 1,
        client?.name || 'Unknown',
        client?.business || '',
        client?.package || '',
        client?.whatsapp || '',
        formatMonth(entry.month),
        entry.deliveryDate || '',
        ...allSvcs.map(s => (entry.services as Record<string, number>)[s] || 0),
        total,
        entry.notes || '',
      ]
    })

    // Summary rows at bottom
    const blankRow = Array(headers.length).fill('')
    const grandTotals: Record<string, number> = {}
    allSvcs.forEach(s => {
      grandTotals[s] = toExport.reduce((acc, e) => acc + ((e.services as Record<string, number>)[s] || 0), 0)
    })
    const grandTotal = Object.values(grandTotals).reduce((a, b) => a + b, 0)

    const totalsRow = [
      '', 'TOTAL', '', '', '', '', '',
      ...allSvcs.map(s => grandTotals[s]),
      grandTotal,
      '',
    ]

    const all = [headers, ...rows, blankRow, totalsRow]
    const csv = all.map(row =>
      row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    ).join('\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `client-accountability-${scope === 'all' ? 'all-months' : exportMonth}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setDone(true)
    setTimeout(() => setDone(false), 3000)
  }

  function exportClientSummary() {
    const clients = getClients()
    const entries = getEntries()
    const toExport = scope === 'all' ? entries : entries.filter(e => e.month === exportMonth)
    const allSvcs = Object.keys(SERVICE_LABELS) as ServiceType[]

    // Per-client totals
    const clientMap: Record<string, Record<string, number>> = {}
    toExport.forEach(e => {
      if (!clientMap[e.clientId]) clientMap[e.clientId] = {}
      Object.entries(e.services).forEach(([k, v]) => {
        clientMap[e.clientId][k] = (clientMap[e.clientId][k] || 0) + (v || 0)
      })
    })

    const headers = ['Client Name', 'Business', 'Package', ...allSvcs.map(s => SERVICE_LABELS[s]), 'Total']
    const rows = Object.entries(clientMap).map(([cid, svcs]) => {
      const c = clients.find(cl => cl.id === cid)
      const total = Object.values(svcs).reduce((a, b) => a + b, 0)
      return [
        c?.name || 'Unknown',
        c?.business || '',
        c?.package || '',
        ...allSvcs.map(s => svcs[s] || 0),
        total,
      ]
    })

    const csv = [headers, ...rows].map(r =>
      r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    ).join('\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `client-summary-${scope === 'all' ? 'all' : exportMonth}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!mounted) return null

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={17} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Export Excel</h1>
          <p className="text-sm text-gray-500 mt-0.5">Data CSV format mein export karein (Excel mein seedha open hoga)</p>
        </div>
      </div>

      {done && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-5 text-sm">
          <CheckCircle size={15} /> File download ho rahi hai!
        </div>
      )}

      <div className="card p-6 space-y-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Export Settings</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Month</label>
            <select className="input" value={exportMonth} onChange={e => setExportMonth(e.target.value)} disabled={scope === 'all'}>
              {months.map(m => <option key={m} value={m}>{formatMonth(m)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Scope</label>
            <select className="input" value={scope} onChange={e => setScope(e.target.value as 'month' | 'all')}>
              <option value="month">Selected month only</option>
              <option value="all">All months (full history)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button onClick={exportCSV} className="btn-primary justify-center py-3">
            <Download size={16} />
            <div className="text-left">
              <div className="font-medium">Detailed Export</div>
              <div className="text-xs opacity-80">Har entry alag row mein</div>
            </div>
          </button>
          <button onClick={exportClientSummary} className="btn-secondary justify-center py-3">
            <FileSpreadsheet size={16} />
            <div className="text-left">
              <div className="font-medium text-gray-700">Client Summary</div>
              <div className="text-xs text-gray-400">Per-client totals only</div>
            </div>
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3.5 text-xs text-blue-700 space-y-1">
          <p className="font-medium">💡 How to open in Excel:</p>
          <p>1. File download hogi (.csv format mein)</p>
          <p>2. Excel open karein → File → Open → Downloaded file select karein</p>
          <p>3. Ya simply .csv file pe double click karein — Excel automatically open kar lega</p>
        </div>
      </div>

      {/* What's included */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Exported file mein kya hoga:</h2>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          {[
            '✓ Client name & business',
            '✓ Package / plan',
            '✓ WhatsApp number',
            '✓ Month & delivery date',
            '✓ Static Posts count',
            '✓ Reels / Videos count',
            '✓ Carousels count',
            '✓ Other services',
            '✓ Total deliverables',
            '✓ Notes',
            '✓ Grand total row',
          ].map(item => (
            <p key={item} className="text-gray-600 text-xs">{item}</p>
          ))}
        </div>
      </div>
    </div>
  )
}
