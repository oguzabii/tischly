'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { t } from '@/lib/i18n';
import { Banknote, Receipt, Loader2, Check } from 'lucide-react';
import { endTableSessions } from '@/lib/hooks/useGuestSession';

export default function PaymentScreen() {
  const { lang, tableId, currentOrderId, cartTotal, clearCart, setActiveView, setCurrentOrderId, setGuestId } = useAppStore();
  const tr = t(lang);
  const total = cartTotal() || 0;

  const [paying, setPaying] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  const METHODS = [
    { id: 'card',  emoji: '💳', label: 'Karte / Card' },
    { id: 'twint', emoji: '🟠', label: 'TWINT' },
    { id: 'cash',  emoji: '💵', label: 'Bar / Cash' },
  ];

  async function handlePayment(method: string) {
    setPaying(method);

    // Mark current order as paid if we have one
    if (currentOrderId) {
      await fetch(`/api/orders/${currentOrderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      }).catch(() => null);
    }

    // Brief pause for UX
    await new Promise(r => setTimeout(r, 1500));

    setPaid(true);
    setPaying(null);

    // Auto-logout: clear cart + end sessions after 3 sec
    setTimeout(async () => {
      clearCart();
      setCurrentOrderId(null);
      setGuestId(null);
      if (tableId) {
        await endTableSessions(tableId).catch(() => null);
      }
      setActiveView('menu');
    }, 3000);
  }

  if (paid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Check size={48} className="text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Vielen Dank!</h2>
        <p className="text-stone-400">Zahlung erfolgreich. Wir wünschen einen schönen Tag! 🙏</p>
        <p className="text-stone-600 text-sm">Tisch wird in Kürze zurückgesetzt…</p>
      </div>
    );
  }

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

      {/* Payment method buttons */}
      <div className="space-y-3">
        {METHODS.map((m) => (
          <button
            key={m.id}
            disabled={!!paying}
            className="w-full flex items-center gap-4 p-5 rounded-2xl bg-stone-800/60 border-2 border-stone-700 active:border-amber-400 active:bg-amber-400/10 transition-all active:scale-[0.98] disabled:opacity-60"
            onClick={() => handlePayment(m.id)}
          >
            <span className="text-3xl">{m.emoji}</span>
            <span className="text-white font-semibold text-lg flex-1 text-left">{m.label}</span>
            {paying === m.id && <Loader2 size={20} className="text-amber-400 animate-spin" />}
          </button>
        ))}
      </div>

      {/* Call waiter fallback */}
      <div className="flex items-center gap-4 p-5 rounded-2xl bg-stone-900/60 border border-stone-800">
        <Banknote size={22} className="text-stone-400 flex-shrink-0" />
        <p className="text-stone-400 text-sm leading-relaxed">
          Oder rufen Sie den Kellner über &quot;Service&quot; · Or use the Service tab to call your waiter.
        </p>
      </div>

      <button
        onClick={() => setActiveView('menu')}
        disabled={!!paying}
        className="w-full py-4 rounded-2xl border border-stone-700 text-stone-400 font-semibold active:scale-[0.97] transition-all disabled:opacity-40"
      >
        ← {tr.back}
      </button>
    </div>
  );
}
