'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store/appStore'
import { t } from '@/lib/i18n'
import { Minus, Plus, Trash2, ShoppingBag, Check, ChevronRight } from 'lucide-react'

export default function CartScreen() {
  const { lang, cartItems, removeFromCart, updateQuantity, cartTotal, clearCart, setActiveView } = useAppStore()
  const tr = t(lang)
  const [ordered, setOrdered] = useState(false)

  const total = cartTotal()

  function handleOrder() {
    setOrdered(true)
    setTimeout(() => {
      clearCart()
      setActiveView('home')
    }, 2500)
  }

  if (ordered) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
          <Check size={48} className="text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{tr.cart.orderPlaced}</h2>
        <p className="text-stone-400">{tr.cart.orderPlacedSubtitle}</p>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <ShoppingBag size={64} className="text-stone-700 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">{tr.cart.empty}</h2>
        <p className="text-stone-400 mb-8">{tr.cart.emptySubtitle}</p>
        <button
          onClick={() => setActiveView('menu')}
          className="px-8 py-4 rounded-2xl bg-amber-400 text-black font-bold active:scale-95 transition-all"
        >
          {tr.cart.continueShopping}
        </button>
      </div>
    )
  }

  return (
    <div className="p-5 space-y-4">
      <h2 className="text-2xl font-bold text-white">{tr.cart.title}</h2>

      {/* Items */}
      <div className="space-y-3">
        {cartItems.map(item => (
          <div key={item.id} className="flex items-start gap-4 p-4 rounded-2xl bg-stone-800/60 border border-stone-700/50">
            {/* Emoji */}
            <div className="w-14 h-14 rounded-xl bg-stone-700/60 flex items-center justify-center text-2xl flex-shrink-0">
              🍽️
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold leading-tight">{item.name}</p>
              {item.extras.length > 0 && (
                <p className="text-stone-500 text-xs mt-1">
                  + {item.extras.map(e => e.name).join(', ')}
                </p>
              )}
              {item.notes && (
                <p className="text-stone-500 text-xs mt-0.5 italic">"{item.notes}"</p>
              )}
              <p className="text-amber-400 font-bold mt-1">CHF {item.price.toFixed(2)}</p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-stone-600 hover:text-red-400 transition-colors active:scale-90"
              >
                <Trash2 size={16} />
              </button>
              <div className="flex items-center gap-2 bg-stone-700 rounded-xl px-2 py-1">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-6 h-6 flex items-center justify-center active:scale-90 text-stone-300 hover:text-white"
                >
                  <Minus size={14} />
                </button>
                <span className="text-white font-bold text-sm w-4 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-6 h-6 flex items-center justify-center active:scale-90 text-stone-300 hover:text-white"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-stone-800/60 border border-stone-700/50 rounded-2xl p-4 space-y-3">
        <div className="flex justify-between text-stone-400 text-sm">
          <span>{tr.cart.subtotal}</span>
          <span>CHF {total.toFixed(2)}</span>
        </div>
        <div className="border-t border-stone-700 pt-3 flex justify-between font-bold text-white text-lg">
          <span>{tr.cart.total}</span>
          <span className="text-amber-400">CHF {total.toFixed(2)}</span>
        </div>
      </div>

      {/* CTAs */}
      <div className="space-y-3 pb-4">
        <button
          onClick={handleOrder}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-base transition-all active:scale-[0.97]"
        >
          {tr.cart.orderNow}
          <ChevronRight size={18} />
        </button>
        <button
          onClick={() => setActiveView('payment')}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-semibold transition-all active:scale-[0.97]"
        >
          {tr.home.payBill}
        </button>
      </div>
    </div>
  )
}
