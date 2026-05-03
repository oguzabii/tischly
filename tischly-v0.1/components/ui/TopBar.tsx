'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store/appStore'
import { LANGUAGES, t } from '@/lib/i18n'
import { ShoppingCart, ChevronLeft, Star } from 'lucide-react'

interface Props {
  tableId: string
  onLoyalty?: () => void
}

export default function TopBar({ tableId, onLoyalty }: Props) {
  const { lang, setLang, activeView, setActiveView, cartCount } = useAppStore()
  const tr = t(lang)
  const count = cartCount()
  const [langOpen, setLangOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-5 py-4 bg-[#1C1917]/95 backdrop-blur border-b border-stone-800">
      {/* Left: back or logo */}
      {activeView !== 'menu' ? (
        <button
          onClick={() => setActiveView('menu')}
          className="flex items-center gap-2 text-stone-400 active:text-white transition-colors active:scale-95"
        >
          <ChevronLeft size={22} />
          <span className="text-sm">{tr.back}</span>
        </button>
      ) : (
        <div className="text-xl font-bold">
          <span className="text-amber-400">T</span>
          <span className="text-white">ischly</span>
          <span className="ml-2 text-sm font-normal text-stone-500">· {tr.table} {tableId}</span>
        </div>
      )}

      {/* Right: loyalty + lang selector + cart */}
      <div className="flex items-center gap-3">

        {/* Loyalty button */}
        {onLoyalty && (
          <button
            onClick={onLoyalty}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-stone-800 active:bg-stone-700 transition-colors active:scale-95"
          >
            <Star size={20} className="text-amber-400" />
          </button>
        )}

        {/* Language picker — tap to toggle (works on touch) */}
        <div className="relative">
          <button
            onClick={() => setLangOpen((o) => !o)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-800 active:bg-stone-700 transition-colors text-sm min-h-[44px]"
          >
            <span>{LANGUAGES.find(l => l.code === lang)?.flag}</span>
            <span className="text-stone-300 text-xs">{lang.toUpperCase()}</span>
          </button>

          {langOpen && (
            <>
              {/* Backdrop to close */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setLangOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 bg-stone-800 border border-stone-700 rounded-2xl shadow-xl z-50 min-w-[160px]">
                {LANGUAGES.map(({ code, label, flag }) => (
                  <button
                    key={code}
                    onClick={() => { setLang(code); setLangOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left first:rounded-t-2xl last:rounded-b-2xl active:bg-stone-700 transition-colors text-sm ${lang === code ? 'text-amber-400' : 'text-white'}`}
                  >
                    <span className="text-xl">{flag}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Cart button */}
        <button
          onClick={() => setActiveView('cart')}
          className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-stone-800 active:bg-stone-700 transition-colors active:scale-95"
        >
          <ShoppingCart size={20} className="text-white" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-black text-xs font-bold flex items-center justify-center">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
