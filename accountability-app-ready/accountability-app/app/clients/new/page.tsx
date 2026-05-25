'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { getClients, saveClients, generateId, getRandomColor, type Client } from '@/lib/store'

const PACKAGES = ['Basic', 'Silver', 'Gold', 'Platinum', 'Custom']

export default function NewClientPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    business: '',
    package: '',
    whatsapp: '',
    email: '',
    status: 'active' as Client['status'],
    notes: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    setError('')
  }

  function save() {
    if (!form.name.trim()) { setError('Client ka naam zaroor likhein.'); return }
    setSaving(true)
    const clients = getClients()
    const newClient: Client = {
      id: generateId(),
      color: getRandomColor(),
      joinDate: new Date().toISOString().split('T')[0],
      ...form,
    }
    saveClients([...clients, newClient])
    setTimeout(() => router.push('/clients'), 500)
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/clients" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={17} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">New Client</h1>
          <p className="text-sm text-gray-500 mt-0.5">Naya client add karein</p>
        </div>
      </div>

      <div className="card p-6 space-y-5">
        {/* Name + Business */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Client Name <span className="text-red-500">*</span></label>
            <input className="input" placeholder="e.g. Aisha Khan" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="label">Business / Brand Name</label>
            <input className="input" placeholder="e.g. Aisha Boutique" value={form.business} onChange={e => set('business', e.target.value)} />
          </div>
        </div>

        {/* Package + Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Package / Plan</label>
            <select className="input" value={form.package} onChange={e => set('package', e.target.value)}>
              <option value="">-- Select Package --</option>
              {PACKAGES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={e => set('status', e.target.value as Client['status'])}>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">WhatsApp Number</label>
            <input className="input" placeholder="+92 300 1234567" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} />
          </div>
          <div>
            <label className="label">Email (optional)</label>
            <input className="input" type="email" placeholder="client@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes (optional)</label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Koi special requirements, agreements, etc..."
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            onClick={save}
            disabled={saving}
            className="btn-primary"
          >
            <UserPlus size={15} />
            {saving ? 'Saving...' : 'Client Save Karein'}
          </button>
          <Link href="/clients" className="btn-secondary">Cancel</Link>
        </div>
      </div>
    </div>
  )
}
