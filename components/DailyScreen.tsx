'use client'

import { useAppStore } from '@/lib/store/appStore'
import { t } from '@/lib/i18n'
import { dailySpecial, menuItems } from '@/lib/mockData'
import { Flame, ChefHat } from 'lucide-react'

export default function DailyScreen() {
  const { lang, setActiveView } = useAppStore()
  const tr = t(lang)
  const item = menuItems.find(m => m.id === dailySpecial.menuItemId)

  if (!item) return null

  return (
    <div className="p-5 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{tr.daily.title}</h2>
      </div>

      {/* Chef note */}
      <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
        <ChefHat size={28} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-400 font-semibold text-sm mb-1">{tr.daily.chefSays}</p>
          <p className="text-stone-200 leading-relaxed">{dailySpecial.note[lang]}</p>
        </div>
      </div>

      {/* Hero card */}
      <div className="rounded-3xl overflow-hidden bg-stone-800 border border-stone-700">
        <div className="h-56 bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center">
          <div className="relative">
            <span className="text-9xl">🍔</span>
            <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center">
              <Flame size={20} className="text-black" />
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">{tr.daily.todaysSpecial}</span>
              <h3 className="text-2xl font-bold text-white mt-1">{item.name[lang]}</h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-400">CHF {item.price.toFixed(2)}</p>
              {item.calories && <p className="text-stone-500 text-sm">{item.calories} kcal</p>}
            </div>
          </div>

          <p className="text-stone-400 leading-relaxed">{item.description[lang]}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {item.tags.map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full bg-stone-700 text-xs text-stone-300">
                {tag === 'popular' && '🔥 Beliebt'}
                {tag === 'new' && '✨ Neu'}
                {tag === 'spicy' && '🌶️ Scharf'}
              </span>
            ))}
          </div>

          <button
            onClick={() => setActiveView('menu')}
            className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-base transition-all active:scale-[0.97]"
          >
            {tr.menu.addToCart}
          </button>
        </div>
      </div>
    </div>
  )
}
