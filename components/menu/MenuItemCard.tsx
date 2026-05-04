'use client'

import type { MenuItem, Lang } from '@/lib/types'
import { Flame, Leaf, Sprout, Wind, Plus } from 'lucide-react'
import { useAppStore } from '@/lib/store/appStore'
import { t } from '@/lib/i18n'

interface Props {
  item: MenuItem
  lang: Lang
  onSelect: () => void
}

const TAG_CONFIG = {
  popular:    { icon: Flame,   color: 'text-orange-400', label: 'Beliebt' },
  new:        { icon: null,    color: 'text-sky-400',    label: 'Neu' },
  vegan:      { icon: Leaf,    color: 'text-green-400',  label: 'Vegan' },
  vegetarian: { icon: Sprout,  color: 'text-emerald-400', label: 'Vegetarisch' },
  spicy:      { icon: Flame,   color: 'text-red-400',    label: 'Scharf' },
  glutenFree: { icon: Wind,    color: 'text-sky-400',    label: 'Glutenfrei' },
}

const EMOJI_MAP: Record<string, string> = {
  'burger': '🍔',
  'pizza': '🍕',
  'drinks': '🥤',
  'desserts': '🍰',
}

export default function MenuItemCard({ item, lang, onSelect }: Props) {
  const { addToCart } = useAppStore()
  const tr = t(lang)

  function quickAdd(e: React.MouseEvent) {
    e.stopPropagation()
    addToCart(item, [], '', 1)
  }

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl bg-stone-800/60 border border-stone-700/50 hover:border-stone-600 hover:bg-stone-800 transition-all active:scale-[0.98] text-left ${!item.available ? 'opacity-50' : ''}`}
    >
      {/* Image / emoji placeholder */}
      <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-stone-700/50 flex items-center justify-center overflow-hidden text-4xl">
        {EMOJI_MAP[item.category] || '🍽️'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-semibold leading-tight">{item.name[lang]}</h3>
        </div>
        <p className="text-stone-400 text-sm mt-1 line-clamp-2 leading-snug">
          {item.description[lang]}
        </p>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {item.tags.map(tag => {
              const cfg = TAG_CONFIG[tag]
              if (!cfg) return null
              const Icon = cfg.icon
              return (
                <span key={tag} className={`flex items-center gap-1 text-xs font-medium ${cfg.color}`}>
                  {Icon && <Icon size={10} />}
                  {cfg.label}
                </span>
              )
            })}
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <span className="text-amber-400 font-bold text-lg">
            CHF {item.price.toFixed(2)}
          </span>
          {item.available && (
            <button
              onClick={quickAdd}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-90 transition-all"
            >
              <Plus size={18} className="text-black" />
            </button>
          )}
        </div>
      </div>
    </button>
  )
}
