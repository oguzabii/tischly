'use client'

import { useState } from 'react'

interface Order {
  id: string; table: string; items: number; total: number; status: string; time: string
}

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

const STATUS_NEXT: Record<string, string | null> = {
  pending: 'preparing', preparing: 'ready', ready: 'delivered', delivered: 'paid', paid: null,
}

export default function AdminOrders({ orders: initial }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initial)

  function advance(id: string) {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o
      const next = STATUS_NEXT[o.status]
      return next ? { ...o, status: next } : o
    }))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Bestellungen</h1>
      <div className="space-y-3">
        {orders.map(order => (
          <div key={order.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex items-center gap-5">
            <div className="flex-1 grid grid-cols-4 gap-4 items-center">
              <div>
                <p className="text-white font-mono font-semibold">{order.id}</p>
                <p className="text-stone-400 text-sm">Tisch {order.table}</p>
              </div>
              <div>
                <p className="text-white">{order.items} Artikel</p>
                <p className="text-stone-400 text-sm">{order.time} Uhr</p>
              </div>
              <div>
                <p className="text-amber-400 font-bold text-lg">CHF {order.total.toFixed(2)}</p>
              </div>
              <div>
                <span className={`px-3 py-1.5 rounded-xl border text-xs font-medium ${STATUS_COLOR[order.status]}`}>
                  {STATUS_LABEL[order.status]}
                </span>
              </div>
            </div>
            {STATUS_NEXT[order.status] && (
              <button
                onClick={() => advance(order.id)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-sm font-medium transition-colors border border-stone-700 flex-shrink-0"
              >
                → {STATUS_LABEL[STATUS_NEXT[order.status]!]}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
