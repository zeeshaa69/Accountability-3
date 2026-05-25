'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { getClients, saveClients, type Client } from '@/lib/store'

const PACKAGES = ['Basic', 'Silver', 'Gold', 'Platinum', 'Custom']

export default function EditClientPage() {
  const router = useRouter()
  const { id } = useParams()
  const [form, setForm] = useState<Partial<Client>>({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const clients = getClients()
    const c = clients.find(c => c.id === id)
    if (c) setForm(c)
    setMounted(true)
  }, [id])

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    setError('')
  }

  function save() {
    if (!form.name?.trim()) { setError('Client ka naam zaroor likhein.'); return }
    setSaving(true)
    const clients = getClients()
    const updated = clients.map(c => c.id === id ? { ...c, ...form } : c)
    saveClients(updated)
    setTimeout(() => router.push('/clients'), 400)
  }

  if (!mounted) return null

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/clients" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={17} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Edit Client</h1>
          <p className="text-sm text-gray-500 mt-0.5">{form.name}</p>
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Client Name *</label>
            <input className="input" value={form.name || ''} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="label">Business / Brand Name</label>
            <input className="input" value={form.business || ''} onChange={e => set('business', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Package</label>
            <select className="input" value={form.package || ''} onChange={e => set('package', e.target.value)}>
              <option value="">-- Select --</option>
              {PACKAGES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status || 'active'} onChange={e => set('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">WhatsApp</label>
            <input className="input" value={form.whatsapp || ''} onChange={e => set('whatsapp', e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea className="input resize-none" rows={3} value={form.notes || ''} onChange={e => set('notes', e.target.value)} />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button onClick={save} disabled={saving} className="btn-primary">
            <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/clients" className="btn-secondary">Cancel</Link>
        </div>
      </div>
    </div>
  )
}
