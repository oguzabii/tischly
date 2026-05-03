'use client';

import { useAppStore } from '@/lib/store/appStore';
import { t } from '@/lib/i18n';
import { Banknote, Receipt } from 'lucide-react';

/**
 * Payment placeholder — wire up your real payment provider here.
 * The cart total is available via useAppStore().cartTotal().
 */
export default function PaymentScreen() {
  const { lang, cartTotal, setActiveView } = useAppStore();
  const tr = t(lang);
  const total = cartTotal() || 0;

  const METHODS = [
    { id: 'card',  emoji: '💳', label: 'Karte / Card' },
    { id: 'twint', emoji: '🟠', label: 'TWINT' },
    { id: 'cash',  emoji: '💵', label: 'Bar / Cash' },
  ];

  return (
    <div className="p-5 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{tr.payment.title}</h2>
        <p className="text-stone-400 mt-1">{tr.payment.subtitle}</p>
      </div>

      {/* Total */}
      <div className="bg-stone-800/60 border border-stone-700/50 rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Receipt size={22} className="text-amber-400" />
          <span className="text-stone-300 font-medium">{tr.cart.total}</span>
        </div>
        <span className="text-3xl font-black text-amber-400">
          CHF {total.toFixed(2)}
        </span>
      </div>

      {/* Payment method buttons — replace with real payment logic */}
      <div className="space-y-3">
        {METHODS.map((m) => (
          <button
            key={m.id}
            className="w-full flex items-center gap-4 p-5 rounded-2xl bg-stone-800/60 border-2 border-stone-700 active:border-amber-400 active:bg-amber-400/10 transition-all active:scale-[0.98]"
            onClick={() => {
              // TODO: integrate payment provider here
              alert(`Payment via ${m.label} — not yet integrated`);
            }}
          >
            <span className="text-3xl">{m.emoji}</span>
            <span className="text-white font-semibold text-lg">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Call waiter fallback */}
      <div className="flex items-center gap-4 p-5 rounded-2xl bg-stone-900/60 border border-stone-800">
        <Banknote size={22} className="text-stone-400 flex-shrink-0" />
        <p className="text-stone-400 text-sm leading-relaxed">
          Oder rufen Sie den Kellner · Or call the waiter to pay at the table.
        </p>
      </div>

      <button
        onClick={() => setActiveView('menu')}
        className="w-full py-4 rounded-2xl border border-stone-700 text-stone-400 font-semibold active:scale-[0.97] transition-all"
      >
        ← {tr.back}
      </button>
    </div>
  );
}
