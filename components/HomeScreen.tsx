'use client'

import { useAppStore } from '@/lib/store/appStore'
import { t } from '@/lib/i18n'
import { menuItems, dailySpecial } from '@/lib/mockData'
import {
  UtensilsCrossed, Bell, CreditCard, Tag, Gamepad2, Star,
  ChevronRight, Flame, Clock
} from 'lucide-react'

export default function HomeScreen() {
  const { lang, setActiveView } = useAppStore()
  const tr = t(lang)
  const special = menuItems.find(m => m.id === dailySpecial.menuItemId)

  const actions = [
    {
      id: 'menu',
      icon: UtensilsCrossed,
      label: tr.home.viewMenu,
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      size: 'large',
    },
    {
      id: 'service',
      icon: Bell,
      label: tr.home.callWaiter,
      color: 'from-sky-500 to-blue-500',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
      size: 'small',
    },
    {
      id: 'payment',
      icon: CreditCard,
      label: tr.home.payBill,
      color: 'from-emerald-500 to-green-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      size: 'small',
    },
    {
      id: 'offers',
      icon: Tag,
      label: tr.home.offersAndBenefits,
      color: 'from-purple-500 to-violet-500',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      size: 'small',
    },
    {
      id: 'games',
      icon: Gamepad2,
      label: tr.home.games,
      color: 'from-pink-500 to-rose-500',
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/20',
      size: 'small',
    },
    {
      id: 'daily',
      icon: Star,
      label: tr.home.dailyRecommendation,
      color: 'from-yellow-500 to-amber-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      size: 'small',
    },
  ]

  return (
    <div className="p-5 space-y-6">
      {/* Header greeting */}
      <div className="pt-2">
        <h1 className="text-3xl font-bold text-white">{tr.home.greeting}</h1>
        <p className="text-stone-400 mt-1">{tr.home.subtitle}</p>
      </div>

      {/* Daily special banner */}
      {special && (
        <button
          onClick={() => setActiveView('daily')}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-600/20 to-orange-600/10 border border-amber-500/30 hover:border-amber-500/60 transition-all active:scale-[0.98]"
        >
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Flame size={24} className="text-amber-400" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">{tr.daily.todaysSpecial}</p>
            <p className="text-white font-semibold truncate">{special.name[lang]}</p>
            <p className="text-stone-400 text-sm">CHF {special.price.toFixed(2)}</p>
          </div>
          <ChevronRight size={18} className="text-stone-500 flex-shrink-0" />
        </button>
      )}

      {/* Action grid */}
      <div className="grid grid-cols-2 gap-4">
        {actions.map(({ id, icon: Icon, label, color, bg, border, size }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={`
              ${size === 'large' ? 'col-span-2' : ''}
              group flex items-center gap-4 p-5 rounded-2xl border ${border} ${bg}
              hover:border-opacity-60 transition-all duration-200 active:scale-[0.97]
              text-left
            `}
          >
            <div className={`
              flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${color}
              flex items-center justify-center shadow-lg
              group-hover:scale-110 transition-transform
            `}>
              <Icon size={22} className="text-white" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-base leading-tight">{label}</p>
              {size === 'large' && (
                <p className="text-stone-400 text-sm mt-0.5">Burger · Pizza · Getränke · Desserts</p>
              )}
            </div>
            {size === 'large' && (
              <ChevronRight size={20} className="ml-auto text-stone-500 flex-shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Tagline */}
      <div className="flex items-center justify-center gap-2 py-2 text-stone-600 text-xs">
        <Clock size={12} />
        <span>Tischly · Digitaler Tischbegleiter</span>
      </div>
    </div>
  )
}
