'use client'

import { useEffect, useRef, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Loader2, RefreshCw } from 'lucide-react'

interface OrderRow {
  id: string
  table_id: string
  total: number
  status: string
  created_at: string
  guest_id: string | null
  item_count?: number
}

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  preparing: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  ready:     'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  delivered: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  paid:      'bg-stone-500/20 text-stone-400 border-stone-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Ausstehend', preparing: 'In Zubereitung', ready: 'Bereit',
  delivered: 'Geliefert', paid: 'Bezahlt', cancelled: 'Storniert',
}

const STATUS_NEXT: Record<string, string | null> = {
  pending: 'preparing', preparing: 'ready', ready: 'delivered', delivered: 'paid', paid: null, cancelled: null,
}

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [advancing, setAdvancing] = useState<string | null>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof getClient>['channel']> | null>(null)

  async function fetchOrders() {
    const supabase = getClient()
    const { data } = await supabase
      .from('orders')
      .select('id, table_id, total, status, created_at, guest_id')
      .order('created_at', { ascending: false })
      .limit(100)

    if (data) {
      // Fetch item counts
      const supabase2 = getClient()
      const ids = data.map(o => o.id)
      const { data: itemData } = await supabase2
        .from('order_items')
        .select('order_id, quantity')
        .in('order_id', ids)

      const countMap: Record<string, number> = {}
      for (const it of itemData ?? []) {
        countMap[it.order_id] = (countMap[it.order_id] ?? 0) + (it.quantity ?? 1)
      }

      setOrders(data.map(o => ({ ...o, item_count: countMap[o.id] ?? 0 })))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()

    const supabase = getClient()
    const channel = supabase
      .channel(`admin-orders-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders()
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function advance(id: string, nextStatus: string) {
    setAdvancing(id)
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })
    setAdvancing(null)
    // Realtime will update, but also do optimistic update
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus } : o))
  }

  const activeOrders  = orders.filter(o => !['paid', 'cancelled'].includes(o.status))
  const closedOrders  = orders.filter(o =>  ['paid', 'cancelled'].includes(o.status))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Bestellungen</h1>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors text-sm"
        >
          <RefreshCw size={14} />
          Aktualisieren
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-amber-400" size={32} />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-stone-500">Noch keine Bestellungen</div>
      ) : (
        <>
          {/* Active orders */}
          {activeOrders.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">
                Aktiv ({activeOrders.length})
              </h2>
              <div className="space-y-3">
                {activeOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    advancing={advancing}
                    onAdvance={advance}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Closed orders */}
          {closedOrders.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3 mt-6">
                Abgeschlossen ({closedOrders.length})
              </h2>
              <div className="space-y-3">
                {closedOrders.slice(0, 20).map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    advancing={advancing}
                    onAdvance={advance}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function OrderCard({
  order,
  advancing,
  onAdvance,
}: {
  order: OrderRow
  advancing: string | null
  onAdvance: (id: string, next: string) => void
}) {
  const next = STATUS_NEXT[order.status]
  const isAdvancing = advancing === order.id

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex items-center gap-5">
      <div className="flex-1 grid grid-cols-4 gap-4 items-center">
        <div>
          <p className="text-white font-mono font-semibold text-sm">{order.id.slice(0, 8)}…</p>
          <p className="text-stone-400 text-sm">Tisch {order.table_id}</p>
        </div>
        <div>
          <p className="text-white">{order.item_count ?? '–'} Artikel</p>
          <p className="text-stone-400 text-sm">{fmtTime(order.created_at)} Uhr</p>
        </div>
        <div>
          <p className="text-amber-400 font-bold text-lg">CHF {Number(order.total).toFixed(2)}</p>
        </div>
        <div>
          <span className={`px-3 py-1.5 rounded-xl border text-xs font-medium ${STATUS_COLOR[order.status] ?? 'bg-stone-700 text-stone-300 border-stone-600'}`}>
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>
      </div>
      {next && (
        <button
          onClick={() => onAdvance(order.id, next)}
          disabled={isAdvancing}
          className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-sm font-medium transition-colors border border-stone-700 flex-shrink-0 flex items-center gap-2 disabled:opacity-50"
        >
          {isAdvancing ? <Loader2 size={14} className="animate-spin" /> : '→'}
          {STATUS_LABEL[next]}
        </button>
      )}
    </div>
  )
}
