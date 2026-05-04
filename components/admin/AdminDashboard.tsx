'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import {
  LayoutDashboard, ClipboardList, UtensilsCrossed, Tag,
  Table2, BarChart3, LogOut, Users, DollarSign, Clock,
  Megaphone, Palette, Star, Loader2,
} from 'lucide-react'
import AdminOrders from './AdminOrders'
import AdminMenu from './AdminMenu'
import AdminTables from './AdminTables'
import AdminAnalytics from './AdminAnalytics'
import { AdsAdmin } from './AdsAdmin'
import { BrandingAdmin } from './BrandingAdmin'
import { GuestsAdmin } from './GuestsAdmin'
import { LoyaltyAdmin } from './LoyaltyAdmin'
import OffersAdmin from './OffersAdmin'

type Tab = 'dashboard' | 'orders' | 'menu' | 'offers' | 'tables' | 'analytics' | 'ads' | 'branding' | 'guests' | 'loyalty'

const NAV: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'orders',    icon: ClipboardList,   label: 'Bestellungen' },
  { id: 'menu',      icon: UtensilsCrossed, label: 'Speisekarte' },
  { id: 'offers',    icon: Tag,             label: 'Angebote' },
  { id: 'tables',    icon: Table2,          label: 'Tische' },
  { id: 'analytics', icon: BarChart3,       label: 'Analytik' },
  { id: 'ads',       icon: Megaphone,       label: 'Ads' },
  { id: 'branding',  icon: Palette,         label: 'Branding' },
  { id: 'guests',    icon: Users,           label: 'Guests' },
  { id: 'loyalty',   icon: Star,            label: 'Loyalty' },
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

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
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
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (tab) {
      case 'orders':    return <AdminOrders />
      case 'menu':      return <AdminMenu />
      case 'tables':    return <AdminTables />
      case 'analytics': return <AdminAnalytics />
      case 'offers':    return <OffersAdmin />
      case 'ads':       return <AdsAdmin />
      case 'branding':  return <BrandingAdmin />
      case 'guests':    return <GuestsAdmin />
      case 'loyalty':   return <LoyaltyAdmin />
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

// ─── Real-time dashboard stats ─────────────────────────────────────────────

interface DashboardStats {
  todayOrders: number
  todayRevenue: number
  openOrders: number
  recentOrders: Array<{ id: string; table_id: string; item_count: number; total: number; status: string; created_at: string }>
}

function DashboardTab({ setTab }: { setTab: (t: Tab) => void }) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchStats() {
    const supabase = getClient()
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    // Today's orders
    const { data: todayData } = await supabase
      .from('orders')
      .select('id, total, status, created_at, table_id')
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false })

    const todayOrders  = todayData?.length ?? 0
    const todayRevenue = todayData?.reduce((s, o) => s + Number(o.total), 0) ?? 0
    const openOrders   = todayData?.filter(o => !['paid', 'cancelled'].includes(o.status)).length ?? 0

    // Get item counts for recent orders
    const recent = (todayData ?? []).slice(0, 5)
    const recentIds = recent.map(o => o.id)
    const { data: itemData } = recentIds.length
      ? await supabase.from('order_items').select('order_id, quantity').in('order_id', recentIds)
      : { data: [] }

    const countMap: Record<string, number> = {}
    for (const it of itemData ?? []) {
      countMap[it.order_id] = (countMap[it.order_id] ?? 0) + (it.quantity ?? 1)
    }

    setStats({
      todayOrders,
      todayRevenue,
      openOrders,
      recentOrders: recent.map(o => ({ ...o, item_count: countMap[o.id] ?? 0 })),
    })
    setLoading(false)
  }

  useEffect(() => {
    fetchStats()

    // Realtime: refresh stats when orders change
    const supabase = getClient()
    const channel = supabase
      .channel(`admin-dashboard-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchStats())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const statCards = [
    { label: 'Heutige Bestellungen', value: loading ? '…' : String(stats?.todayOrders ?? 0), icon: ClipboardList, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Umsatz heute', value: loading ? '…' : `CHF ${(stats?.todayRevenue ?? 0).toFixed(2)}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Offene Bestellungen', value: loading ? '…' : String(stats?.openOrders ?? 0), icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-stone-400 mt-1">
          Willkommen zurück · {new Date().toLocaleDateString('de-CH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
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
          <h2 className="text-lg font-bold text-white">Aktuelle Bestellungen (heute)</h2>
          <button onClick={() => setTab('orders')} className="text-amber-400 text-sm hover:text-amber-300 transition-colors">
            Alle ansehen →
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-amber-400" size={24} />
          </div>
        ) : (stats?.recentOrders ?? []).length === 0 ? (
          <p className="text-stone-500 text-center py-8">Noch keine Bestellungen heute</p>
        ) : (
          <div className="space-y-3">
            {(stats?.recentOrders ?? []).map(order => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-stone-800 last:border-0">
                <div className="flex items-center gap-4">
                  <span className="text-stone-400 font-mono text-sm">{order.id.slice(0, 8)}…</span>
                  <span className="text-white text-sm">Tisch {order.table_id}</span>
                  <span className="text-stone-400 text-sm">{order.item_count} Artikel</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white font-semibold">CHF {Number(order.total).toFixed(2)}</span>
                  <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${STATUS_COLOR[order.status] ?? ''}`}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                  <span className="text-stone-500 text-xs">
                    {new Date(order.created_at).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
