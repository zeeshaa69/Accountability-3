'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, PlusCircle, Trash2, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import {
  getClients, getEntries, saveEntries, generateId, currentMonth,
  getLast12Months, formatMonth, SERVICE_LABELS, SERVICE_COLORS,
  type ServiceType, type ServiceEntry, type Client
} from '@/lib/store'

const ALL_SERVICES = Object.keys(SERVICE_LABELS) as ServiceType[]

function LogForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedClient = searchParams.get('client') || ''

  const [clients, setClients] = useState<Client[]>([])
  const [mounted, setMounted] = useState(false)
  const [success, setSuccess] = useState(false)

  const [clientId, setClientId] = useState(preselectedClient)
  const [month, setMonth] = useState(currentMonth())
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [services, setServices] = useState<Partial<Record<ServiceType, number>>>({})

  useEffect(() => {
    const c = getClients().filter(c => c.status === 'active')
    setClients(c)
    if (preselectedClient) setClientId(preselectedClient)
    setMounted(true)
  }, [preselectedClient])

  function toggleService(svc: ServiceType) {
    setServices(prev => {
      const copy = { ...prev }
      if (copy[svc] !== undefined) delete copy[svc]
      else copy[svc] = 1
      return copy
    })
  }

  function setQty(svc: ServiceType, val: number) {
    setServices(prev => ({ ...prev, [svc]: Math.max(0, val) }))
  }

  const months = getLast12Months()

  function save() {
    if (!clientId) { alert('Client select karein!'); return }
    if (Object.keys(services).length === 0) { alert('Koi service select karein!'); return }

    const entries = getEntries()
    const entry: ServiceEntry = {
      id: generateId(),
      clientId,
      month,
      services,
      notes,
      deliveryDate,
      createdAt: new Date().toISOString(),
    }
    saveEntries([entry, ...entries])
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setServices({})
      setNotes('')
    }, 2000)
  }

  if (!mounted) return null

  const selectedClient = clients.find(c => c.id === clientId)

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={17} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Log Entry</h1>
          <p className="text-sm text-gray-500 mt-0.5">Client ki services record karein</p>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-5 text-sm font-medium">
          <CheckCircle size={16} /> Entry save ho gayi! ✓
        </div>
      )}

      <div className="card p-6 space-y-5">
        {/* Client + Month */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Client <span className="text-red-500">*</span></label>
            {clients.length === 0 ? (
              <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                Pehle <Link href="/clients/new" className="text-brand-600 underline">client add karein</Link>
              </div>
            ) : (
              <select className="input" value={clientId} onChange={e => setClientId(e.target.value)}>
                <option value="">-- Client select karein --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} {c.business ? `(${c.business})` : ''}</option>)}
              </select>
            )}
          </div>
          <div>
            <label className="label">Month</label>
            <select className="input" value={month} onChange={e => setMonth(e.target.value)}>
              {months.map(m => <option key={m} value={m}>{formatMonth(m)}</option>)}
            </select>
          </div>
        </div>

        {/* Delivery Date */}
        <div>
          <label className="label">Delivery Date</label>
          <input type="date" className="input" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
        </div>

        {/* Services */}
        <div>
          <label className="label">Services Delivered <span className="text-red-500">*</span></label>
          <p className="text-xs text-gray-400 mb-3">Jo services deliver ki hain, unhe select karein aur quantity set karein</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ALL_SERVICES.map(svc => {
              const selected = services[svc] !== undefined
              return (
                <div
                  key={svc}
                  className={`rounded-xl border-2 transition-all ${
                    selected
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <button
                    className="w-full text-left px-3.5 py-2.5 flex items-center justify-between"
                    onClick={() => toggleService(svc)}
                  >
                    <span className={`text-sm font-medium ${selected ? 'text-brand-700' : 'text-gray-700'}`}>
                      {SERVICE_LABELS[svc]}
                    </span>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                      selected ? 'bg-brand-600 border-brand-600' : 'border-gray-300'
                    }`}>
                      {selected && <CheckCircle size={10} className="text-white" />}
                    </div>
                  </button>
                  {selected && (
                    <div className="px-3.5 pb-3 flex items-center gap-2">
                      <span className="text-xs text-gray-500">Qty:</span>
                      <button
                        className="w-6 h-6 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm leading-none flex items-center justify-center"
                        onClick={() => setQty(svc, (services[svc] || 1) - 1)}
                      >−</button>
                      <input
                        type="number"
                        className="w-14 text-center border border-gray-200 rounded px-1 py-0.5 text-sm"
                        value={services[svc] || 1}
                        min={1}
                        onChange={e => setQty(svc, parseInt(e.target.value) || 1)}
                      />
                      <button
                        className="w-6 h-6 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm leading-none flex items-center justify-center"
                        onClick={() => setQty(svc, (services[svc] || 1) + 1)}
                      >+</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes (optional)</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Koi special note..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {/* Summary preview */}
        {Object.keys(services).length > 0 && (
          <div className="bg-gray-50 rounded-xl p-3.5">
            <p className="text-xs font-medium text-gray-500 mb-2">Summary preview:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(services).map(([k, v]) => (
                <span key={k} className={`badge ${SERVICE_COLORS[k as ServiceType]}`}>
                  {SERVICE_LABELS[k as ServiceType]}: {v}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={save} className="btn-primary">
            <PlusCircle size={15} /> Entry Save Karein
          </button>
          <button onClick={() => { setServices({}); setNotes('') }} className="btn-secondary">
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LogPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400">Loading...</div>}>
      <LogForm />
    </Suspense>
  )
}
