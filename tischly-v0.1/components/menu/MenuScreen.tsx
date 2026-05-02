'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store/appStore'
import { t } from '@/lib/i18n'
import { menuItems } from '@/lib/mockData'
import type { MenuCategory, MenuItem } from '@/lib/types'
import MenuItemCard from './MenuItemCard'
import ProductDetail from './ProductDetail'
import { Flame, Leaf, Sprout, Wind } from 'lucide-react'

const CATEGORIES: { id: MenuCategory; emoji: string }[] = [
  { id: 'burger', emoji: '🍔' },
  { id: 'pizza',  emoji: '🍕' },
  { id: 'drinks', emoji: '🥤' },
  { id: 'desserts', emoji: '🍰' },
]

export default function MenuScreen() {
  const { lang } = useAppStore()
  const tr = t(lang)
  const [category, setCategory] = useState<MenuCategory>('burger')
  const [selected, setSelected] = useState<MenuItem | null>(null)

  const filtered = menuItems.filter(m => m.category === category)

  if (selected) {
    return <ProductDetail item={selected} onBack={() => setSelected(null)} />
  }

  return (
    <div className="flex flex-col h-full">
      {/* Category tabs */}
      <div className="sticky top-0 z-10 bg-[#1C1917] px-4 pt-4 pb-3">
        <h2 className="text-2xl font-bold text-white mb-4">{tr.menu.title}</h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIES.map(({ id, emoji }) => {
            const active = category === id
            const label = tr.menu[id as keyof typeof tr.menu] as string
            return (
              <button
                key={id}
                onClick={() => setCategory(id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all font-medium text-sm active:scale-95 ${
                  active
                    ? 'bg-amber-400 border-amber-400 text-black'
                    : 'bg-stone-800/50 border-stone-700 text-stone-300 hover:border-stone-500'
                }`}
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 px-4 pb-3 text-xs text-stone-500">
        <span className="flex items-center gap-1"><Flame size={12} className="text-orange-400" /> Beliebt</span>
        <span className="flex items-center gap-1"><Sprout size={12} className="text-emerald-400" /> Vegetarisch</span>
        <span className="flex items-center gap-1"><Leaf size={12} className="text-green-400" /> Vegan</span>
        <span className="flex items-center gap-1"><Wind size={12} className="text-sky-400" /> Glutenfrei</span>
      </div>

      {/* Items */}
      <div className="px-4 space-y-4 pb-6">
        {filtered.map(item => (
          <MenuItemCard
            key={item.id}
            item={item}
            lang={lang}
            onSelect={() => setSelected(item)}
          />
        ))}
      </div>
    </div>
  )
}
