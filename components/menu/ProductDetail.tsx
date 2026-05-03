'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store/appStore'
import { t } from '@/lib/i18n'
import type { MenuItem, Extra } from '@/lib/types'
import { Minus, Plus, Check, Flame, Leaf, Sprout } from 'lucide-react'

const EMOJI_MAP: Record<string, string> = {
  burger: '🍔', pizza: '🍕', drinks: '🥤', desserts: '🍰',
}

interface Props {
  item: MenuItem
  onBack: () => void
}

export default function ProductDetail({ item, onBack }: Props) {
  const { lang, addToCart, setActiveView } = useAppStore()
  const tr = t(lang)
  const [qty, setQty] = useState(1)
  const [selectedExtras, setSelectedExtras] = useState<Extra[]>([])
  const [notes, setNotes] = useState('')
  const [added, setAdded] = useState(false)

  const extrasTotal = selectedExtras.reduce((s, e) => s + e.price, 0)
  const total = (item.price + extrasTotal) * qty

  function toggleExtra(extra: Extra) {
    setSelectedExtras(prev =>
      prev.some(e => e.id === extra.id)
        ? prev.filter(e => e.id !== extra.id)
        : [...prev, extra]
    )
  }

  function handleAdd() {
    addToCart(item.id, selectedExtras, notes, qty)
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      onBack()
    }, 800)
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero */}
      <div className="mx-4 mt-4 h-52 rounded-3xl bg-stone-800 flex items-center justify-center text-8xl">
        {EMOJI_MAP[item.category] || '🍽️'}
      </div>

      <div className="flex-1 p-5 space-y-5">
        {/* Title + price */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-2xl font-bold text-white leading-tight">{item.name[lang]}</h2>
            <p className="text-stone-400 mt-2 leading-relaxed">{item.description[lang]}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-bold text-amber-400">CHF {item.price.toFixed(2)}</p>
            {item.calories && (
              <p className="text-stone-500 text-sm">{item.calories} {tr.menu.calories}</p>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {item.tags.map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full bg-stone-800 text-xs text-stone-300 border border-stone-700">
              {tag === 'popular' && '🔥 Beliebt'}
              {tag === 'new' && '✨ Neu'}
              {tag === 'vegan' && '🌱 Vegan'}
              {tag === 'vegetarian' && '🥦 Vegetarisch'}
              {tag === 'spicy' && '🌶️ Scharf'}
              {tag === 'glutenFree' && '🌾 Glutenfrei'}
            </span>
          ))}
        </div>

        {/* Extras */}
        {item.extras.length > 0 && (
          <div>
            <h3 className="text-white font-semibold mb-3">{tr.menu.extras}</h3>
            <div className="space-y-2">
              {item.extras.map(extra => {
                const isSelected = selectedExtras.some(e => e.id === extra.id)
                return (
                  <button
                    key={extra.id}
                    onClick={() => toggleExtra(extra)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/10 text-white'
                        : 'border-stone-700 bg-stone-800/50 text-stone-300 hover:border-stone-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'border-amber-400 bg-amber-400' : 'border-stone-600'
                      }`}>
                        {isSelected && <Check size={12} className="text-black" />}
                      </div>
                      <span className="font-medium">{extra.name}</span>
                    </div>
                    <span className="text-amber-400 font-semibold">+CHF {extra.price.toFixed(2)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <h3 className="text-white font-semibold mb-2">{tr.menu.notes}</h3>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={tr.menu.notesPlaceholder}
            rows={2}
            className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-500 text-sm resize-none focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Allergens */}
        {item.allergens && item.allergens.length > 0 && (
          <p className="text-stone-500 text-xs">
            {tr.menu.allergy}: {item.allergens.join(', ')}
          </p>
        )}
      </div>

      {/* Sticky bottom CTA */}
      <div className="sticky bottom-24 left-0 right-0 px-5 py-4 bg-gradient-to-t from-[#1C1917] via-[#1C1917]/95 to-transparent">
        <div className="flex items-center gap-4">
          {/* Quantity */}
          <div className="flex items-center gap-3 bg-stone-800 rounded-2xl px-3 py-3 border border-stone-700">
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-lg bg-stone-700 hover:bg-stone-600 flex items-center justify-center active:scale-90 transition-all"
            >
              <Minus size={16} className="text-white" />
            </button>
            <span className="text-white font-bold text-lg w-6 text-center">{qty}</span>
            <button
              onClick={() => setQty(q => q + 1)}
              className="w-8 h-8 rounded-lg bg-stone-700 hover:bg-stone-600 flex items-center justify-center active:scale-90 transition-all"
            >
              <Plus size={16} className="text-white" />
            </button>
          </div>

          {/* Add button */}
          <button
            onClick={handleAdd}
            disabled={added || !item.available}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.97] ${
              added
                ? 'bg-emerald-500 text-white'
                : 'bg-amber-400 hover:bg-amber-300 text-black'
            }`}
          >
            {added ? (
              <><Check size={18} /> Hinzugefügt!</>
            ) : (
              <>{tr.menu.addToCart} · CHF {total.toFixed(2)}</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
