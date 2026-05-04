'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store/appStore'
import { t } from '@/lib/i18n'
import { Minus, Plus, Trash2, ShoppingBag, Check, ChevronRight, Loader2, AlertCircle } from 'lucide-react'

export default function CartScreen() {
  const { lang, tableId, guestId, cartItems, removeFromCart, updateQuantity, cartTotal, clearCart, setActiveView, setCurrentOrderId } = useAppStore()
  const tr = t(lang)
  const [ordered, setOrdered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const total = cartTotal()

  async function handleOrder() {
    if (!tableId || cartItems.length === 0) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_id: tableId,
          guest_id: guestId ?? null,
          items: cartItems,
          total,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || 'Bestellung fehlgeschlagen')
      }
      const { order_id } = await res.json()
      setCurrentOrderId(order_id)
      setOrdered(true)
      setTimeout(() => {
        clearCart()
        setActiveView('menu')
      }, 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler')
      setLoading(false)
    }
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
                <p className="text-stone-500 text-xs mt-0.5 italic">&quot;{item.notes}&quot;</p>
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

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* CTAs */}
      <div className="space-y-3 pb-4">
        <button
          onClick={handleOrder}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-base transition-all active:scale-[0.97] disabled:opacity-60"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
          {loading ? 'Wird bestellt…' : tr.cart.orderNow}
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
