'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, PlusCircle, Search, Phone, MoreVertical, TrendingUp } from 'lucide-react'
import {
  getClients, getEntries, saveClients, getInitials, getClientStats,
  formatMonth, type Client, type ServiceEntry
} from '@/lib/store'

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  inactive: 'bg-gray-100 text-gray-500',
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [entries, setEntries] = useState<ServiceEntry[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'inactive'>('all')
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  useEffect(() => {
    setClients(getClients())
    setEntries(getEntries())
    setMounted(true)
  }, [])

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.business.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || c.status === filter
    return matchSearch && matchFilter
  })

  function changeStatus(id: string, status: Client['status']) {
    const updated = clients.map(c => c.id === id ? { ...c, status } : c)
    setClients(updated)
    saveClients(updated)
    setMenuOpen(null)
  }

  function deleteClient(id: string) {
    if (!confirm('Client delete karein? (Unki entries remain karengi)')) return
    const updated = clients.filter(c => c.id !== id)
    setClients(updated)
    saveClients(updated)
    setMenuOpen(null)
  }

  if (!mounted) return null

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">{clients.filter(c=>c.status==='active').length} active · {clients.length} total</p>
        </div>
        <Link href="/clients/new" className="btn-primary">
          <PlusCircle size={15} /> New Client
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Client ya business naam search karein..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {(['all','active','paused','inactive'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 text-sm rounded-lg border font-medium transition-colors ${
              filter === f
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card py-16 text-center">
          <Users size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-1">Koi client nahi mila</p>
          <Link href="/clients/new" className="btn-primary mt-3 inline-flex">
            <PlusCircle size={14} /> Pehla client add karein
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(client => {
            const stats = getClientStats(client.id, entries)
            return (
              <div key={client.id} className="card p-5 relative">
                {/* Menu */}
                <div className="absolute top-4 right-4">
                  <button
                    className="p-1 rounded hover:bg-gray-100 text-gray-400"
                    onClick={() => setMenuOpen(menuOpen === client.id ? null : client.id)}
                  >
                    <MoreVertical size={16} />
                  </button>
                  {menuOpen === client.id && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-40 py-1">
                      <Link href={`/clients/${client.id}/edit`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Edit
                      </Link>
                      <button onClick={() => changeStatus(client.id, 'active')} className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-50">
                        Mark Active
                      </button>
                      <button onClick={() => changeStatus(client.id, 'paused')} className="w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-gray-50">
                        Mark Paused
                      </button>
                      <button onClick={() => changeStatus(client.id, 'inactive')} className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50">
                        Mark Inactive
                      </button>
                      <hr className="my-1 border-gray-100" />
                      <button onClick={() => deleteClient(client.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Avatar + Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-full ${client.color} flex items-center justify-center text-white text-sm font-semibold shrink-0`}>
                    {getInitials(client.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{client.name}</p>
                    <p className="text-xs text-gray-500 truncate">{client.business}</p>
                  </div>
                </div>

                {/* Status + Package */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  <span className={`badge ${STATUS_STYLES[client.status]}`}>
                    {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                  </span>
                  {client.package && (
                    <span className="badge bg-brand-50 text-brand-700">{client.package}</span>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <p className="text-lg font-semibold text-gray-800">{stats.totalEntries}</p>
                    <p className="text-xs text-gray-400">Entries</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <p className="text-lg font-semibold text-gray-800">{stats.totalServices}</p>
                    <p className="text-xs text-gray-400">Total delivered</p>
                  </div>
                </div>

                {/* Contact */}
                {client.whatsapp && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone size={12} />
                    {client.whatsapp}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <Link href={`/log?client=${client.id}`} className="btn-secondary flex-1 justify-center text-xs py-1.5">
                    <TrendingUp size={13} /> Log Entry
                  </Link>
                  <Link href={`/summary?client=${client.id}`} className="btn-secondary flex-1 justify-center text-xs py-1.5">
                    View Report
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
