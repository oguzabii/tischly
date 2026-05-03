'use client'

import { useState } from 'react'
import { menuItems } from '@/lib/mockData'
import type { MenuCategory } from '@/lib/types'
import { Eye, EyeOff, Pencil } from 'lucide-react'

const CATEGORIES: { id: MenuCategory; label: string; emoji: string }[] = [
  { id: 'burger',  label: 'Burger',   emoji: '🍔' },
  { id: 'pizza',   label: 'Pizza',    emoji: '🍕' },
  { id: 'drinks',  label: 'Getränke', emoji: '🥤' },
  { id: 'desserts',label: 'Desserts', emoji: '🍰' },
]

export default function AdminMenu() {
  const [cat, setCat] = useState<MenuCategory>('burger')
  const [availability, setAvailability] = useState<Record<string, boolean>>(
    Object.fromEntries(menuItems.map(m => [m.id, m.available]))
  )

  const filtered = menuItems.filter(m => m.category === cat)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Speisekarte</h1>

      {/* Category tabs */}
      <div className="flex gap-3">
        {CATEGORIES.map(({ id, label, emoji }) => (
          <button
            key={id}
            onClick={() => setCat(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              cat === id
                ? 'bg-amber-400 text-black'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700 border border-stone-700'
            }`}
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* Items table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-800">
              <th className="text-left px-5 py-4 text-stone-400 text-sm font-medium">Artikel</th>
              <th className="text-left px-5 py-4 text-stone-400 text-sm font-medium">Preis</th>
              <th className="text-left px-5 py-4 text-stone-400 text-sm font-medium">Tags</th>
              <th className="text-left px-5 py-4 text-stone-400 text-sm font-medium">Status</th>
              <th className="text-left px-5 py-4 text-stone-400 text-sm font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors">
                <td className="px-5 py-4">
                  <p className="text-white font-medium">{item.name.de}</p>
                  <p className="text-stone-500 text-xs mt-0.5 truncate max-w-xs">{item.description.de}</p>
                </td>
                <td className="px-5 py-4 text-amber-400 font-semibold">
                  CHF {item.price.toFixed(2)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-stone-700 text-stone-300 text-xs">{tag}</span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${
                    availability[item.id]
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-stone-700/50 text-stone-500 border-stone-600/30'
                  }`}>
                    {availability[item.id] ? 'Verfügbar' : 'Nicht verfügbar'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAvailability(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                      className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
                      title="Verfügbarkeit umschalten"
                    >
                      {availability[item.id] ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors" title="Bearbeiten">
                      <Pencil size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
