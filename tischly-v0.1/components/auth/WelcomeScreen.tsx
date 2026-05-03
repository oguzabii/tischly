'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Clock, Coins, Gift, ArrowRight, UserPlus } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import type { Guest, LoyaltyConfig, Lang } from '@/lib/types';
import { pointsToCHF } from '@/lib/types';

interface WelcomeScreenProps {
  guest: Guest;
  companions: Guest[];
  lang: Lang;
  onContinue: () => void;
  onAddCompanion: () => void;
}

const STRINGS: Record<Lang, {
  welcome: string; back: string; firstTime: string;
  yourPoints: string; redeemable: string; minPoints: string; pointsHint: string;
  lastOrder: string; never: string; visits: string; visit: string;
  birthdayGift: string; companions: string; addCompanion: string;
  open: string;
}> = {
  de: { welcome: 'Hallo', back: 'Schön, dich wiederzusehen', firstTime: 'Schön, dass du hier bist',
        yourPoints: 'Deine Punkte', redeemable: 'einlösbar', minPoints: 'Mindestens 100 Punkte zum Einlösen',
        pointsHint: '1 CHF = 1 Punkt · 100 Punkte = 1 CHF Rabatt',
        lastOrder: 'Letzte Bestellung', never: 'Erste Bestellung', visits: 'Besuche', visit: 'Besuch',
        birthdayGift: '🎂 Geburtstagsgeschenk wartet', companions: 'Begleiter', addCompanion: 'Person hinzufügen',
        open: 'Speisekarte öffnen' },
  en: { welcome: 'Hi', back: 'Welcome back', firstTime: 'Welcome to Tischly',
        yourPoints: 'Your points', redeemable: 'redeemable', minPoints: 'Min. 100 points to redeem',
        pointsHint: '1 CHF = 1 point · 100 points = 1 CHF off',
        lastOrder: 'Last order', never: 'First time here', visits: 'visits', visit: 'visit',
        birthdayGift: '🎂 Birthday gift waiting', companions: 'Companions', addCompanion: 'Add companion',
        open: 'Open menu' },
  tr: { welcome: 'Merhaba', back: 'Tekrar hoş geldin', firstTime: 'Tischly\'ye hoş geldin',
        yourPoints: 'Puanların', redeemable: 'kullanılabilir', minPoints: 'Kullanım için min. 100 puan',
        pointsHint: '1 CHF = 1 puan · 100 puan = 1 CHF indirim',
        lastOrder: 'Son sipariş', never: 'İlk ziyaretin', visits: 'ziyaret', visit: 'ziyaret',
        birthdayGift: '🎂 Doğum günü hediyesi seni bekliyor', companions: 'Yanındakiler', addCompanion: 'Kişi ekle',
        open: 'Menüyü aç' },
  fr: { welcome: 'Bonjour', back: 'Bon retour', firstTime: 'Bienvenue chez Tischly',
        yourPoints: 'Vos points', redeemable: 'utilisables', minPoints: 'Minimum 100 points pour utiliser',
        pointsHint: '1 CHF = 1 point · 100 points = 1 CHF de réduction',
        lastOrder: 'Dernière commande', never: 'Première visite', visits: 'visites', visit: 'visite',
        birthdayGift: '🎂 Cadeau d\'anniversaire en attente', companions: 'Accompagnants', addCompanion: 'Ajouter',
        open: 'Ouvrir le menu' },
  it: { welcome: 'Ciao', back: 'Bentornato', firstTime: 'Benvenuto in Tischly',
        yourPoints: 'I tuoi punti', redeemable: 'utilizzabili', minPoints: 'Minimo 100 punti per usarli',
        pointsHint: '1 CHF = 1 punto · 100 punti = 1 CHF di sconto',
        lastOrder: 'Ultimo ordine', never: 'Prima visita', visits: 'visite', visit: 'visita',
        birthdayGift: '🎂 Regalo di compleanno in attesa', companions: 'Accompagnatori', addCompanion: 'Aggiungi',
        open: 'Apri il menù' },
  es: { welcome: 'Hola', back: 'Bienvenido de nuevo', firstTime: 'Bienvenido a Tischly',
        yourPoints: 'Tus puntos', redeemable: 'canjeables', minPoints: 'Mín. 100 puntos para canjear',
        pointsHint: '1 CHF = 1 punto · 100 puntos = 1 CHF de descuento',
        lastOrder: 'Último pedido', never: 'Primera visita', visits: 'visitas', visit: 'visita',
        birthdayGift: '🎂 Regalo de cumpleaños esperándote', companions: 'Acompañantes', addCompanion: 'Añadir',
        open: 'Abrir el menú' },
};

interface LastOrder {
  total_amount: number;
  created_at: string;
}

export function WelcomeScreen({ guest, companions, lang, onContinue, onAddCompanion }: WelcomeScreenProps) {
  const t = STRINGS[lang];
  const [config, setConfig] = useState<LoyaltyConfig | null>(null);
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    supabase
      .from('loyalty_config')
      .select('*')
      .eq('restaurant_id', guest.restaurant_id)
      .maybeSingle()
      .then(({ data }) => setConfig(data as LoyaltyConfig | null));

    supabase
      .from('guest_orders')
      .select('total_amount, created_at')
      .eq('guest_id', guest.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setLastOrder(data as LastOrder | null));
  }, [guest.id, guest.restaurant_id]);

  const isReturning = guest.visit_count > 0;
  const redeemable = pointsToCHF(guest.points, config?.redeem_rate ?? 0.01);
  const canRedeem = guest.points >= (config?.redeem_min_points ?? 100);

  const today = new Date();
  const isBirthday =
    guest.birthday &&
    new Date(guest.birthday).getMonth() === today.getMonth() &&
    new Date(guest.birthday).getDate() === today.getDate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-md mx-auto pt-12 space-y-6">
        <div>
          <p className="text-lime-400 text-sm font-medium mb-1">
            {isReturning ? t.back : t.firstTime}
          </p>
          <h1 className="text-4xl font-black tracking-tight">
            {t.welcome} {guest.name.split(' ')[0]} 👋
          </h1>
        </div>

        {isBirthday && (
          <div className="rounded-2xl bg-gradient-to-r from-pink-500 to-amber-400 p-4 text-slate-900">
            <div className="flex items-center gap-3">
              <Gift className="w-6 h-6" />
              <span className="font-bold">{t.birthdayGift}</span>
            </div>
          </div>
        )}

        <div className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
            <Coins className="w-4 h-4" />
            {t.yourPoints}
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-5xl font-black text-lime-400">{guest.points}</span>
            <span className="text-white/60 text-sm">pts</span>
          </div>
          <div className="text-sm text-white/70">
            {canRedeem ? (
              <span>
                ≈ <strong className="text-white">{redeemable.toFixed(2)} CHF</strong> {t.redeemable}
              </span>
            ) : (
              <span className="text-white/50">{t.minPoints}</span>
            )}
          </div>
          <div className="mt-3 text-xs text-white/40">{t.pointsHint}</div>

          {!canRedeem && (
            <div className="mt-3">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-lime-400 transition-all"
                  style={{ width: `${Math.min(100, guest.points)}%` }}
                />
              </div>
              <div className="text-xs text-white/50 mt-1">
                {100 - guest.points} pts to first redemption
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <div className="text-white/50 text-xs mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {t.lastOrder}
            </div>
            <div className="font-semibold">
              {lastOrder
                ? `${lastOrder.total_amount.toFixed(2)} CHF`
                : t.never}
            </div>
            {lastOrder && (
              <div className="text-xs text-white/40 mt-0.5">
                {new Date(lastOrder.created_at).toLocaleDateString(lang)}
              </div>
            )}
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <div className="text-white/50 text-xs mb-1">
              {guest.visit_count === 1 ? t.visit : t.visits}
            </div>
            <div className="font-semibold text-2xl">{guest.visit_count}</div>
          </div>
        </div>

        {companions.length > 0 && (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <div className="text-white/50 text-xs mb-2">{t.companions}</div>
            <div className="flex flex-wrap gap-2">
              {companions.map((c) => (
                <span
                  key={c.id}
                  className="px-3 py-1 rounded-full bg-white/10 text-sm"
                >
                  {c.name.split(' ')[0]}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            onClick={onContinue}
            className="w-full py-5 rounded-2xl bg-lime-400 text-slate-900 font-bold text-lg flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            {t.open}
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={onAddCompanion}
            className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {t.addCompanion}
          </button>
        </div>
      </div>
    </div>
  );
}
