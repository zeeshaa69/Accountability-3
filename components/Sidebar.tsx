'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  BarChart3,
  Download,
  Zap
} from 'lucide-react'

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/log', label: 'Log Entry', icon: PlusCircle },
  { href: '/summary', label: 'Monthly Report', icon: BarChart3 },
  { href: '/export', label: 'Export Excel', icon: Download },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-700 text-gray-900 leading-tight font-semibold">Accountability</p>
            <p className="text-xs text-gray-400 leading-tight">Content Agency</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${active ? 'active' : ''}`}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">Admin Dashboard</p>
        <p className="text-xs text-gray-300 mt-0.5">v1.0 · Local storage</p>
      </div>
    </aside>
  )
}
