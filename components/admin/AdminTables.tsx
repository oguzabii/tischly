'use client'

import { useState } from 'react'
import { tables as initialTables } from '@/lib/mockData'
import type { TableData } from '@/lib/types'

const STATUS_COLOR: Record<string, string> = {
  free:     'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  occupied: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  reserved: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

const STATUS_LABEL: Record<string, string> = {
  free: 'Frei', occupied: 'Belegt', reserved: 'Reserviert',
}

export default function AdminTables() {
  const [tables, setTables] = useState<TableData[]>(initialTables)

  function cycle(id: string) {
    const order: TableData['status'][] = ['free', 'occupied', 'reserved']
    setTables(prev => prev.map(t => {
      if (t.id !== id) return t
      const next = order[(order.indexOf(t.status) + 1) % order.length]
      return { ...t, status: next }
    }))
  }

  const stats = {
    free:     tables.filter(t => t.status === 'free').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Tische</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {(['free', 'occupied', 'reserved'] as const).map(s => (
          <div key={s} className={`p-4 rounded-2xl border ${STATUS_COLOR[s]} bg-opacity-10`}>
            <p className="text-3xl font-bold">{stats[s]}</p>
            <p className="text-sm mt-1">{STATUS_LABEL[s]}</p>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-4">
        {tables.map(table => (
          <button
            key={table.id}
            onClick={() => cycle(table.id)}
            className={`p-5 rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 text-left ${STATUS_COLOR[table.status]} bg-stone-900`}
          >
            <p className="text-2xl font-bold">{table.number}</p>
            <p className="text-sm mt-1">{table.seats} Plätze</p>
            <p className="text-xs mt-2 font-semibold uppercase tracking-wide">{STATUS_LABEL[table.status]}</p>
          </button>
        ))}
      </div>
      <p className="text-stone-500 text-xs">Klicken Sie auf einen Tisch, um den Status zu ändern</p>
    </div>
  )
}
