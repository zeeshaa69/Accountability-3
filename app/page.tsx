'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users, TrendingUp, Image, Film, LayoutTemplate,
  PlusCircle, ArrowRight, Activity, Calendar
} from 'lucide-react'
import {
  getClients, getEntries, formatMonth, currentMonth, getLast12Months,
  SERVICE_LABELS, type ServiceEntry, type Client
} from '@/lib/store'

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [entries, setEntries] = useState<ServiceEntry[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setClients(getClients())
    setEntries(getEntries())
    setMounted(true)
  }, [])

  const curMonth = currentMonth()
  const thisMonthEntries = entries.filter(e => e.month === curMonth)

  const countService = (type: string, ents: ServiceEntry[]) =>
    ents.reduce((acc, e) => acc + ((e.services as Record<string,number>)[type] || 0), 0)

  const totalThisMonth = thisMonthEntries.reduce((acc, e) =>
    acc + Object.values(e.services).reduce((a, b) => a + (b || 0), 0), 0)

  const activeClients = clients.filter(c => c.status === 'active')

  // Last 6 months trend
  const last6 = getLast12Months().slice(0, 6).reverse()
  const monthlyTotals = last6.map(m => ({
    month: formatMonth(m),
    total: entries.filter(e => e.month === m)
      .reduce((acc, e) => acc + Object.values(e.services).reduce((a, b) => a + (b || 0), 0), 0)
  }))

  const maxVal = Math.max(...monthlyTotals.map(m => m.total), 1)

  if (!mounted) return null

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{formatMonth(curMonth)} — overview</p>
        </div>
        <div className="flex gap-2">
          <Link href="/log" className="btn-primary">
            <PlusCircle size={15} /> Log Entry
          </Link>
          <Link href="/clients/new" className="btn-secondary">
            <Users size={15} /> New Client
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Clients</p>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users size={15} className="text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{activeClients.length}</p>
          <p className="text-xs text-gray-400 mt-1">{clients.length} total</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">This Month</p>
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp size={15} className="text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{totalThisMonth}</p>
          <p className="text-xs text-gray-400 mt-1">total deliverables</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reels</p>
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <Film size={15} className="text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{countService('reel', thisMonthEntries)}</p>
          <p className="text-xs text-gray-400 mt-1">this month</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Carousels</p>
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <LayoutTemplate size={15} className="text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{countService('carousel', thisMonthEntries)}</p>
          <p className="text-xs text-gray-400 mt-1">this month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Bar chart */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">6-Month Deliverable Trend</h2>
          <div className="flex items-end gap-3 h-36">
            {monthlyTotals.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-600">{m.total || ''}</span>
                <div
                  className="w-full bg-brand-500 rounded-t-md transition-all"
                  style={{ height: `${Math.round((m.total / maxVal) * 100)}%`, minHeight: m.total ? 4 : 0, opacity: 0.85 }}
                />
                <span className="text-xs text-gray-400 whitespace-nowrap">{m.month.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Services breakdown */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            <Activity size={14} className="inline mr-1.5 text-gray-400" />
            This Month Breakdown
          </h2>
          <div className="space-y-3">
            {(Object.keys(SERVICE_LABELS) as Array<keyof typeof SERVICE_LABELS>).map(key => {
              const val = countService(key, thisMonthEntries)
              if (!val) return null
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{SERVICE_LABELS[key]}</span>
                  <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{val}</span>
                </div>
              )
            })}
            {totalThisMonth === 0 && (
              <p className="text-xs text-gray-400 py-4 text-center">
                Abhi koi entry nahi. <Link href="/log" className="text-brand-600 underline">Log karein</Link>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent entries */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Recent Entries</h2>
          <Link href="/summary" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {entries.length === 0 ? (
          <div className="py-12 text-center">
            <Calendar size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">Koi entry nahi abhi.</p>
            <Link href="/log" className="btn-primary mt-3 inline-flex">
              <PlusCircle size={14} /> Pehli entry add karein
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-medium">Client</th>
                  <th className="text-left px-5 py-3 font-medium">Month</th>
                  <th className="text-left px-5 py-3 font-medium">Static Posts</th>
                  <th className="text-left px-5 py-3 font-medium">Reels</th>
                  <th className="text-left px-5 py-3 font-medium">Carousels</th>
                  <th className="text-left px-5 py-3 font-medium">Other</th>
                  <th className="text-left px-5 py-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {entries.slice(0, 8).map(entry => {
                  const client = clients.find(c => c.id === entry.clientId)
                  const other = Object.entries(entry.services)
                    .filter(([k]) => !['static_post','reel','carousel'].includes(k))
                    .reduce((a, [,v]) => a + (v||0), 0)
                  return (
                    <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-800">{client?.name || '?'}</td>
                      <td className="px-5 py-3 text-gray-500">{formatMonth(entry.month)}</td>
                      <td className="px-5 py-3">
                        {entry.services.static_post ? (
                          <span className="badge bg-blue-100 text-blue-800">{entry.services.static_post}</span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3">
                        {entry.services.reel ? (
                          <span className="badge bg-purple-100 text-purple-800">{entry.services.reel}</span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3">
                        {entry.services.carousel ? (
                          <span className="badge bg-orange-100 text-orange-800">{entry.services.carousel}</span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3 text-gray-500">{other || '—'}</td>
                      <td className="px-5 py-3 text-gray-400 max-w-[160px] truncate">{entry.notes || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
