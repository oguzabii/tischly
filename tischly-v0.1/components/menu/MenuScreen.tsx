'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store/appStore'
import { t } from '@/lib/i18n'
import { menuItems } from '@/lib/mockData'
import type { MenuCategory, MenuItem } from '@/lib/types'
import type { Guest } from '@/lib/types'
import MenuItemCard from './MenuItemCard'
import ProductDetail from './ProductDetail'
import { Flame, Leaf, Sprout, Wind, QrCode, Star, X } from 'lucide-react'

const CATEGORIES: { id: MenuCategory; emoji: string }[] = [
  { id: 'burger',  emoji: '🍔' },
  { id: 'pizza',   emoji: '🍕' },
  { id: 'drinks',  emoji: '🥤' },
  { id: 'desserts', emoji: '🍰' },
]

interface Props {
  host?: Guest | null
  onSignIn?: () => void
}

export default function MenuScreen({ host, onSignIn }: Props) {
  const { lang } = useAppStore()
  const tr = t(lang)
  const [category, setCategory] = useState<MenuCategory>('burger')
  const [selected, setSelected] = useState<MenuItem | null>(null)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  if (selected) {
    return <ProductDetail item={selected} onBack={() => setSelected(null)} />
  }

  const showBanner = !host && !bannerDismissed && onSignIn

  return (
    <div className="flex flex-col h-full">

      {/* Sign-in banner — shown when no guest is logged in */}
      {showBanner && (
        <div className="mx-4 mt-4 flex items-center gap-3 px-4 py-3 rounded-2xl bg-lime-500/10 border border-lime-500/30">
          <Star size={18} className="text-lime-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-lime-300 text-sm font-semibold leading-tight">
              Punkte sammeln · Earn points
            </p>
            <p className="text-lime-400/70 text-xs mt-0.5">
              1 CHF = 1 Punkt · 100 Punkte = 1 CHF Rabatt
            </p>
          </div>
          <button
            onClick={onSignIn}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-lime-400 text-slate-900 font-bold text-xs active:opacity-80 flex-shrink-0"
          >
            <QrCode size={13} />
            Login
          </button>
          <button
            onClick={() => setBannerDismissed(true)}
            className="p-1.5 text-lime-400/50 active:text-lime-400 flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Logged-in greeting */}
      {host && (
        <div className="mx-4 mt-4 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-lime-500/10 border border-lime-500/20">
          <Star size={16} className="text-lime-400" />
          <p className="text-lime-300 text-sm">
            Hi <span className="font-bold">{host.name.split(' ')[0]}</span> · {host.points} pts
          </p>
        </div>
      )}

      {/* Category tabs */}
      <div className="sticky top-0 z-10 bg-[#1C1917] px-4 pt-4 pb-3">
        <h2 className="text-2xl font-bold text-white mb-4">{tr.menu.title}</h2>
        <div className="flex gap-3 overflow-x-auto pb-1">
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
                    : 'bg-stone-800/50 border-stone-700 text-stone-300'
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
        {menuItems.filter(m => m.category === category).map(item => (
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
