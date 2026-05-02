'use client'

import { useAppStore } from '@/lib/store/appStore'
import { t } from '@/lib/i18n'
import { UtensilsCrossed, Bell, CreditCard, Tag, Gamepad2, Star } from 'lucide-react'

const NAV_ITEMS = [
  { view: 'menu',    icon: UtensilsCrossed, key: 'menu' as const },
  { view: 'service', icon: Bell,            key: 'callWaiter' as const },
  { view: 'payment', icon: CreditCard,      key: 'payment' as const },
  { view: 'offers',  icon: Tag,             key: 'offers' as const },
  { view: 'games',   icon: Gamepad2,        key: 'games' as const },
]

export default function BottomNav() {
  const { lang, activeView, setActiveView } = useAppStore()
  const tr = t(lang)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center bg-[#1C1917]/95 backdrop-blur border-t border-stone-800 px-2 py-2">
      {NAV_ITEMS.map(({ view, icon: Icon, key }) => {
        const active = activeView === view
        return (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all active:scale-95 ${
              active ? 'text-amber-400' : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium leading-none">{tr.nav[key]}</span>
          </button>
        )
      })}
    </nav>
  )
}
