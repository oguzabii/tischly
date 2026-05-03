'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Plus, Trash2, Minus, Check, Loader2, Users } from 'lucide-react'

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

interface TableRow {
  id: string
  restaurant_id: string
  number: number
  seats: number
  status: 'free' | 'occupied' | 'reserved'
}

const STATUS_STYLE: Record<string, string> = {
  free:     'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  occupied: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  reserved: 'border-purple-500/40 bg-purple-500/10 text-purple-400',
}
const STATUS_LABEL: Record<string, string> = {
  free: 'Frei', occupied: 'Belegt', reserved: 'Reserviert',
}
const STATUS_CYCLE: TableRow['status'][] = ['free', 'occupied', 'reserved']

export default function AdminTables() {
  const [tables, setTables] = useState<TableRow[]>([])
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  // For adding a new table
  const [newSeats, setNewSeats] = useState(4)

  const load = useCallback(async () => {
    setLoading(true)
    const sb = getClient()
    const { data: r } = await sb.from('restaurants').select('id').eq('slug', 'tischly-demo').maybeSingle()
    if (!r) { setLoading(false); return }
    setRestaurantId(r.id)
    const { data } = await sb.from('restaurant_tables').select('*').eq('restaurant_id', r.id).order('number')
    setTables((data ?? []) as TableRow[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function cycleStatus(t: TableRow) {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(t.status) + 1) % STATUS_CYCLE.length]
    setTables(prev => prev.map(x => x.id === t.id ? { ...x, status: next } : x))
    await getClient().from('restaurant_tables').update({ status: next }).eq('id', t.id)
  }

  async function changeSeats(t: TableRow, delta: number) {
    const seats = Math.max(1, Math.min(20, t.seats + delta))
    setSaving(t.id)
    setTables(prev => prev.map(x => x.id === t.id ? { ...x, seats } : x))
    await getClient().from('restaurant_tables').update({ seats }).eq('id', t.id)
    setSaving(null)
  }

  async function addTable() {
    if (!restaurantId) return
    const nextNumber = tables.length > 0 ? Math.max(...tables.map(t => t.number)) + 1 : 1
    setSaving('new')
    const { data, error } = await getClient().from('restaurant_tables').insert({
      restaurant_id: restaurantId,
      number: nextNumber,
      seats: newSeats,
      status: 'free',
    }).select().single()
    if (!error && data) {
      setTables(prev => [...prev, data as TableRow])
      flash('✓ Tisch ' + nextNumber + ' hinzugefügt')
    }
    setSaving(null)
  }

  async function removeTable(t: TableRow) {
    if (!confirm(`Tisch ${t.number} wirklich löschen?`)) return
    await getClient().from('restaurant_tables').delete().eq('id', t.id)
    setTables(prev => prev.filter(x => x.id !== t.id))
    flash('Tisch ' + t.number + ' gelöscht')
  }

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(''), 2500) }

  const stats = {
    free:     tables.filter(t => t.status === 'free').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Tische</h1>
        {msg && <span className="text-sm text-emerald-400 font-medium">{msg}</span>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {(['free', 'occupied', 'reserved'] as const).map(s => (
          <div key={s} className={`p-5 rounded-2xl border ${STATUS_STYLE[s]}`}>
            <p className="text-3xl font-bold">{stats[s]}</p>
            <p className="text-sm mt-1 font-medium">{STATUS_LABEL[s]}</p>
          </div>
        ))}
      </div>

      {/* Add table */}
      <div className="flex items-center gap-4 p-5 bg-stone-900 border border-stone-800 rounded-2xl">
        <Users size={20} className="text-stone-400 flex-shrink-0" />
        <span className="text-white font-medium">Neuen Tisch hinzufügen</span>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-stone-400 text-sm">Plätze:</span>
          <button onClick={() => setNewSeats(s => Math.max(1, s - 1))}
            className="w-8 h-8 rounded-lg bg-stone-800 text-white flex items-center justify-center hover:bg-stone-700 transition-colors">
            <Minus size={14} />
          </button>
          <span className="w-8 text-center text-white font-bold">{newSeats}</span>
          <button onClick={() => setNewSeats(s => Math.min(20, s + 1))}
            className="w-8 h-8 rounded-lg bg-stone-800 text-white flex items-center justify-center hover:bg-stone-700 transition-colors">
            <Plus size={14} />
          </button>
        </div>
        <button
          onClick={addTable}
          disabled={saving === 'new'}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-black font-semibold text-sm hover:bg-amber-300 disabled:opacity-50 transition-colors"
        >
          {saving === 'new' ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Hinzufügen
        </button>
      </div>

      {/* Table grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map(table => (
            <div key={table.id} className={`relative rounded-2xl border-2 p-5 ${STATUS_STYLE[table.status]} bg-stone-900`}>

              {/* Delete button */}
              <button
                onClick={() => removeTable(table)}
                className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-stone-800/80 flex items-center justify-center text-stone-500 hover:text-red-400 hover:bg-red-900/30 transition-colors"
              >
                <Trash2 size={13} />
              </button>

              {/* Table number */}
              <p className="text-3xl font-black mb-1">#{table.number}</p>

              {/* Seats adjuster */}
              <div className="flex items-center gap-1.5 mb-3">
                <button
                  onClick={() => changeSeats(table, -1)}
                  className="w-6 h-6 rounded-md bg-stone-800/60 flex items-center justify-center text-stone-300 hover:bg-stone-700 transition-colors"
                >
                  <Minus size={11} />
                </button>
                <span className="text-sm font-semibold min-w-[3rem] text-center">
                  {saving === table.id
                    ? <Loader2 size={12} className="animate-spin inline" />
                    : `${table.seats} Pl.`
                  }
                </span>
                <button
                  onClick={() => changeSeats(table, +1)}
                  className="w-6 h-6 rounded-md bg-stone-800/60 flex items-center justify-center text-stone-300 hover:bg-stone-700 transition-colors"
                >
                  <Plus size={11} />
                </button>
              </div>

              {/* Status toggle */}
              <button
                onClick={() => cycleStatus(table)}
                className="w-full py-1.5 rounded-xl border border-current/30 text-xs font-bold uppercase tracking-wide hover:opacity-80 transition-opacity active:scale-95"
              >
                {STATUS_LABEL[table.status]}
              </button>
            </div>
          ))}
        </div>
      )}

      {tables.length > 0 && (
        <p className="text-stone-500 text-xs flex items-center gap-1.5">
          <Check size={12} /> Status antippen zum Wechseln · <Minus size={12} /> / <Plus size={12} /> für Platzanzahl
        </p>
      )}
    </div>
  )
}
