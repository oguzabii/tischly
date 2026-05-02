'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store/appStore'
import { t } from '@/lib/i18n'
import { Check, CreditCard, Smartphone, X } from 'lucide-react'

type PayMethod = 'apple' | 'google' | 'card' | 'twint'
type TipOption = 0 | 5 | 10 | 15 | 'custom'

const METHODS: { id: PayMethod; label: string; emoji: string; color: string }[] = [
  { id: 'apple',  label: 'Apple Pay',  emoji: '🍎', color: 'border-white/20 hover:border-white/40' },
  { id: 'google', label: 'Google Pay', emoji: '🔵', color: 'border-sky-500/30 hover:border-sky-500/50' },
  { id: 'card',   label: 'Karte',      emoji: '💳', color: 'border-emerald-500/30 hover:border-emerald-500/50' },
  { id: 'twint',  label: 'TWINT',      emoji: '🟠', color: 'border-orange-500/30 hover:border-orange-500/50' },
]

const TIP_OPTS: TipOption[] = [0, 5, 10, 15, 'custom']

export default function PaymentScreen() {
  const { lang, cartTotal } = useAppStore()
  const tr = t(lang)
  const base = cartTotal() || 42.80

  const [method, setMethod]     = useState<PayMethod | null>(null)
  const [tip, setTip]           = useState<TipOption>(10)
  const [customTip, setCustomTip] = useState('')
  const [processing, setProcessing] = useState(false)
  const [paid, setPaid]         = useState(false)

  const tipAmount =
    tip === 'custom'
      ? parseFloat(customTip) || 0
      : (base * tip) / 100

  const grandTotal = base + tipAmount

  function handlePay() {
    if (!method) return
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setPaid(true)
    }, 2000)
  }

  if (paid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
        <div className="w-28 h-28 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
          <Check size={56} className="text-emerald-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">{tr.payment.success}</h2>
        <p className="text-stone-400 text-lg">{tr.payment.successSubtitle}</p>
        <p className="mt-6 text-stone-500 text-sm">CHF {grandTotal.toFixed(2)} · {METHODS.find(m => m.id === method)?.label}</p>
      </div>
    )
  }

  return (
    <div className="p-5 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{tr.payment.title}</h2>
        <p className="text-stone-400 mt-1">{tr.payment.subtitle}</p>
      </div>

      {/* Amount summary */}
      <div className="bg-stone-800/60 border border-stone-700/50 rounded-2xl p-5 space-y-3">
        <div className="flex justify-between text-stone-400 text-sm">
          <span>{tr.cart.subtotal}</span>
          <span>CHF {base.toFixed(2)}</span>
        </div>
        {tipAmount > 0 && (
          <div className="flex justify-between text-stone-400 text-sm">
            <span>{tr.payment.tip}</span>
            <span>CHF {tipAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-stone-700 pt-3 flex justify-between font-bold text-white text-xl">
          <span>{tr.cart.total}</span>
          <span className="text-amber-400">CHF {grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Tip selector */}
      <div>
        <h3 className="text-white font-semibold mb-3">{tr.payment.tipQuestion}</h3>
        <div className="grid grid-cols-5 gap-2">
          {TIP_OPTS.map(opt => (
            <button
              key={opt}
              onClick={() => setTip(opt)}
              className={`py-3 rounded-xl border font-semibold text-sm transition-all active:scale-95 ${
                tip === opt
                  ? 'bg-amber-400 border-amber-400 text-black'
                  : 'bg-stone-800/50 border-stone-700 text-stone-300 hover:border-stone-500'
              }`}
            >
              {opt === 0 ? tr.payment.noTip.split(' ')[0] : opt === 'custom' ? '✏️' : `${opt}%`}
            </button>
          ))}
        </div>
        {tip === 'custom' && (
          <input
            type="number"
            value={customTip}
            onChange={e => setCustomTip(e.target.value)}
            placeholder="CHF"
            className="mt-3 w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        )}
      </div>

      {/* Payment methods */}
      <div>
        <h3 className="text-white font-semibold mb-3">{tr.payment.subtitle}</h3>
        <div className="grid grid-cols-2 gap-3">
          {METHODS.map(m => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`flex items-center gap-3 p-4 rounded-2xl bg-stone-800/60 border-2 transition-all active:scale-[0.97] ${
                method === m.id
                  ? 'border-amber-400 bg-amber-400/10'
                  : m.color + ' bg-stone-800/40'
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-white font-semibold text-sm">{m.label}</span>
              {method === m.id && <Check size={16} className="ml-auto text-amber-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Pay button */}
      <button
        onClick={handlePay}
        disabled={!method || processing}
        className={`w-full py-5 rounded-2xl font-bold text-lg transition-all active:scale-[0.97] ${
          method && !processing
            ? 'bg-amber-400 hover:bg-amber-300 text-black'
            : 'bg-stone-700 text-stone-500 cursor-not-allowed'
        }`}
      >
        {processing ? (
          <span className="flex items-center justify-center gap-3">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {tr.payment.processing}
          </span>
        ) : (
          `${tr.payment.payNow} · CHF ${grandTotal.toFixed(2)}`
        )}
      </button>
    </div>
  )
}
