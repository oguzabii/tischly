'use client'

import { useState } from 'react'
import { menuItems, tables, offers } from '@/lib/mockData'
import {
  LayoutDashboard, ClipboardList, UtensilsCrossed, Tag,
  Table2, BarChart3, LogOut, TrendingUp, Users, DollarSign, Clock
} from 'lucide-react'
import AdminOrders from './AdminOrders'
import AdminMenu from './AdminMenu'
import AdminTables from './AdminTables'
import AdminAnalytics from './AdminAnalytics'

type Tab = 'dashboard' | 'orders' | 'menu' | 'offers' | 'tables' | 'analytics'

const NAV: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'orders',    icon: ClipboardList,   label: 'Bestellungen' },
  { id: 'menu',      icon: UtensilsCrossed, label: 'Speisekarte' },
  { id: 'offers',    icon: Tag,             label: 'Angebote' },
  { id: 'tables',    icon: Table2,          label: 'Tische' },
  { id: 'analytics', icon: BarChart3,       label: 'Analytik' },
]

const MOCK_ORDERS = [
  { id: 'ORD-001', table: '3', items: 4, total: 68.50, status: 'preparing', time: '12:34' },
  { id: 'ORD-002', table: '7', items: 2, total: 31.80, status: 'pending',   time: '12:38' },
  { id: 'ORD-003', table: '1', items: 6, total: 95.20, status: 'ready',     time: '12:20' },
  { id: 'ORD-004', table: '5', items: 3, total: 47.60, status: 'delivered', time: '12:10' },
  { id: 'ORD-005', table: '9', items: 1, total: 14.90, status: 'paid',      time: '12:05' },
]

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  preparing: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  ready:     'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  delivered: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  paid:      'bg-stone-500/20 text-stone-400 border-stone-500/30',
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Ausstehend', preparing: 'In Zubereitung', ready: 'Bereit',
  delivered: 'Geliefert', paid: 'Bezahlt',
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              <span className="text-amber-400">T</span><span className="text-white">ischly</span>
            </div>
            <p className="text-stone-400">Admin Panel</p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setErr(false) }}
              onKeyDown={e => e.key === 'Enter' && (pw === 'admin123' ? setAuthed(true) : setErr(true))}
              placeholder="Passwort"
              className="w-full bg-stone-800 border border-stone-700 rounded-2xl px-5 py-4 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            {err && <p className="text-red-400 text-sm text-center">Falsches Passwort</p>}
            <button
              onClick={() => pw === 'admin123' ? setAuthed(true) : setErr(true)}
              className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-bold transition-all active:scale-97"
            >
              Anmelden
            </button>
            <p className="text-stone-600 text-xs text-center">Demo-Passwort: admin123</p>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (tab) {
      case 'orders':    return <AdminOrders orders={MOCK_ORDERS} />
      case 'menu':      return <AdminMenu />
      case 'tables':    return <AdminTables />
      case 'analytics': return <AdminAnalytics />
      case 'offers':    return <OffersTab />
      default:          return <DashboardTab setTab={setTab} />
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-stone-900 border-r border-stone-800 flex flex-col p-4 fixed top-0 left-0 h-full">
        <div className="mb-8 px-2">
          <div className="text-2xl font-bold">
            <span className="text-amber-400">T</span><span className="text-white">ischly</span>
          </div>
          <p className="text-stone-500 text-xs mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                tab === id
                  ? 'bg-amber-400/10 text-amber-400'
                  : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => setAuthed(false)}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-stone-500 hover:text-red-400 hover:bg-stone-800 transition-all text-sm"
        >
          <LogOut size={18} />
          Abmelden
        </button>
      </aside>

      {/* Main */}
      <main className="ml-60 flex-1 p-8">
        {renderContent()}
      </main>
    </div>
  )
}

function DashboardTab({ setTab }: { setTab: (t: Tab) => void }) {
  const activeTables = tables.filter(t => t.status === 'occupied').length
  const stats = [
    { label: 'Heutige Bestellungen', value: '47', icon: ClipboardList, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Umsatz heute', value: 'CHF 1.847', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Aktive Tische', value: `${activeTables}/12`, icon: Users, color: 'text-sky-400', bg: 'bg-sky-400/10' },
    { label: 'Offene Bestellungen', value: '3', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ]

  const recentOrders = [
    { id: 'ORD-001', table: '3', items: 4, total: 68.50, status: 'preparing', time: '12:34' },
    { id: 'ORD-002', table: '7', items: 2, total: 31.80, status: 'pending',   time: '12:38' },
    { id: 'ORD-003', table: '1', items: 6, total: 95.20, status: 'ready',     time: '12:20' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-stone-400 mt-1">Willkommen zurück · {new Date().toLocaleDateString('de-CH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-stone-400 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Aktuelle Bestellungen</h2>
          <button onClick={() => setTab('orders')} className="text-amber-400 text-sm hover:text-amber-300 transition-colors">Alle ansehen →</button>
        </div>
        <div className="space-y-3">
          {recentOrders.map(order => (
            <div key={order.id} className="flex items-center justify-between py-3 border-b border-stone-800 last:border-0">
              <div className="flex items-center gap-4">
                <span className="text-stone-400 font-mono text-sm">{order.id}</span>
                <span className="text-white text-sm">Tisch {order.table}</span>
                <span className="text-stone-400 text-sm">{order.items} Artikel</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white font-semibold">CHF {order.total.toFixed(2)}</span>
                <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${STATUS_COLOR[order.status]}`}>
                  {STATUS_LABEL[order.status]}
                </span>
                <span className="text-stone-500 text-xs">{order.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function OffersTab() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Angebote</h1>
      <div className="space-y-4">
        {offers.map(o => (
          <div key={o.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center text-2xl flex-shrink-0">
              🎁
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">{o.title.de}</p>
              <p className="text-stone-400 text-sm mt-0.5">{o.description.de}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-sm font-bold border border-amber-400/20">
                {o.discountType === 'percent' ? `${o.discount}%` : `CHF ${o.discount}`}
              </span>
              <span className="text-stone-500 text-xs">bis {o.validUntil}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
