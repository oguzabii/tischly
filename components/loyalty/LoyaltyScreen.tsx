'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Coins, Gift, Share2, Copy, History } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import type { Guest, LoyaltyConfig, Lang } from '@/lib/types';
import { pointsToCHF } from '@/lib/types';

interface Props {
  guest: Guest;
  lang: Lang;
  onBack: () => void;
}

interface OrderRow {
  id: number;
  total_amount: number;
  points_earned: number;
  points_used: number;
  created_at: string;
}

const STRINGS: Record<Lang, {
  title: string; balance: string; redeemable: string; rule: string;
  birthday: string; addBday: string; saveBday: string; bdaySoon: string;
  referral: string; referralHint: string; copy: string; copied: string;
  history: string; empty: string; earned: string; used: string;
}> = {
  de: { title: 'Treuepunkte', balance: 'Dein Guthaben', redeemable: 'einlösbar',
        rule: '1 CHF = 1 Punkt · 100 Punkte = 1 CHF Rabatt',
        birthday: 'Geburtstag', addBday: 'Geburtstag eintragen für ein Geschenk',
        saveBday: 'Speichern', bdaySoon: 'Geschenk wartet am Geburtstag',
        referral: 'Freund werben', referralHint: 'Teile deinen Code – ihr bekommt beide 100 Punkte',
        copy: 'Code kopieren', copied: 'Kopiert!',
        history: 'Verlauf', empty: 'Noch keine Bestellungen', earned: 'verdient', used: 'eingelöst' },
  en: { title: 'Loyalty', balance: 'Your balance', redeemable: 'redeemable',
        rule: '1 CHF = 1 point · 100 points = 1 CHF off',
        birthday: 'Birthday', addBday: 'Add your birthday for a gift',
        saveBday: 'Save', bdaySoon: 'Gift waiting on your birthday',
        referral: 'Invite friends', referralHint: 'Share your code – you both get 100 points',
        copy: 'Copy code', copied: 'Copied!',
        history: 'History', empty: 'No orders yet', earned: 'earned', used: 'used' },
  tr: { title: 'Sadakat Puanı', balance: 'Bakiyen', redeemable: 'kullanılabilir',
        rule: '1 CHF = 1 puan · 100 puan = 1 CHF indirim',
        birthday: 'Doğum günü', addBday: 'Doğum gününü ekle, hediye seni beklesin',
        saveBday: 'Kaydet', bdaySoon: 'Doğum gününde hediye seni bekliyor',
        referral: 'Arkadaş davet et', referralHint: 'Kodunu paylaş — ikiniz de 100 puan kazanın',
        copy: 'Kodu kopyala', copied: 'Kopyalandı!',
        history: 'Geçmiş', empty: 'Henüz sipariş yok', earned: 'kazanıldı', used: 'kullanıldı' },
  fr: { title: 'Fidélité', balance: 'Votre solde', redeemable: 'utilisables',
        rule: '1 CHF = 1 point · 100 points = 1 CHF',
        birthday: 'Anniversaire', addBday: 'Ajoutez votre anniversaire pour un cadeau',
        saveBday: 'Enregistrer', bdaySoon: 'Cadeau à votre anniversaire',
        referral: 'Inviter des amis', referralHint: 'Partagez votre code – 100 pts pour vous deux',
        copy: 'Copier', copied: 'Copié !',
        history: 'Historique', empty: 'Aucune commande', earned: 'gagnés', used: 'utilisés' },
  it: { title: 'Fedeltà', balance: 'Il tuo saldo', redeemable: 'utilizzabili',
        rule: '1 CHF = 1 punto · 100 punti = 1 CHF di sconto',
        birthday: 'Compleanno', addBday: 'Aggiungi il compleanno per un regalo',
        saveBday: 'Salva', bdaySoon: 'Regalo in attesa al compleanno',
        referral: 'Invita amici', referralHint: 'Condividi il codice – 100 punti a entrambi',
        copy: 'Copia codice', copied: 'Copiato!',
        history: 'Cronologia', empty: 'Nessun ordine', earned: 'guadagnati', used: 'usati' },
  es: { title: 'Fidelidad', balance: 'Tu saldo', redeemable: 'canjeables',
        rule: '1 CHF = 1 punto · 100 puntos = 1 CHF',
        birthday: 'Cumpleaños', addBday: 'Añade tu cumpleaños para un regalo',
        saveBday: 'Guardar', bdaySoon: 'Regalo el día de tu cumpleaños',
        referral: 'Invitar amigos', referralHint: 'Comparte tu código – 100 puntos para ambos',
        copy: 'Copiar', copied: '¡Copiado!',
        history: 'Historial', empty: 'Sin pedidos', earned: 'ganados', used: 'usados' },
};

export function LoyaltyScreen({ guest, lang, onBack }: Props) {
  const t = STRINGS[lang];
  const [config, setConfig] = useState<LoyaltyConfig | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [bday, setBday] = useState(guest.birthday ?? '');
  const [savedBday, setSavedBday] = useState(false);
  const [copied, setCopied] = useState(false);

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
      .select('id, total_amount, points_earned, points_used, created_at')
      .eq('guest_id', guest.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => setOrders((data ?? []) as OrderRow[]));
  }, [guest.id, guest.restaurant_id]);

  const redeemable = pointsToCHF(guest.points, config?.redeem_rate ?? 0.01);

  async function saveBirthday() {
    if (!bday) return;
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    await supabase.from('guests').update({ birthday: bday }).eq('id', guest.id);
    setSavedBday(true);
    setTimeout(() => setSavedBday(false), 2000);
  }

  function copyCode() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(guest.referral_code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="px-6 py-4 flex items-center gap-3 border-b border-white/10 sticky top-0 bg-slate-950/95 backdrop-blur z-10">
        <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-white/10">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">{t.title}</h1>
      </header>

      <main className="p-6 max-w-md mx-auto space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-lime-400 to-lime-600 p-6 text-slate-900">
          <div className="flex items-center gap-2 text-slate-900/70 text-sm mb-1">
            <Coins className="w-4 h-4" />
            {t.balance}
          </div>
          <div className="text-5xl font-black mb-1">{guest.points} pts</div>
          <div className="text-slate-900/80">≈ {redeemable.toFixed(2)} CHF {t.redeemable}</div>
          <div className="mt-4 text-xs text-slate-900/70">{t.rule}</div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="w-4 h-4 text-lime-400" />
            <h2 className="font-semibold">{t.referral}</h2>
          </div>
          <p className="text-sm text-white/60 mb-3">{t.referralHint}</p>
          <div className="flex items-center gap-2 bg-black/40 rounded-xl p-3">
            <code className="flex-1 font-mono text-lime-400 text-lg">{guest.referral_code}</code>
            <button
              onClick={copyCode}
              className="px-3 py-2 rounded-lg bg-lime-400 text-slate-900 font-semibold text-sm flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? t.copied : t.copy}
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-pink-400" />
            <h2 className="font-semibold">{t.birthday}</h2>
          </div>
          <p className="text-sm text-white/60 mb-3">
            {guest.birthday ? t.bdaySoon : t.addBday}
          </p>
          <div className="flex gap-2">
            <input
              type="date"
              value={bday}
              onChange={(e) => setBday(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 outline-none focus:border-lime-400"
            />
            <button
              onClick={saveBirthday}
              disabled={!bday}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-40 text-sm font-semibold"
            >
              {savedBday ? '✓' : t.saveBday}
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-white/70" />
            <h2 className="font-semibold">{t.history}</h2>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-white/50">{t.empty}</p>
          ) : (
            <ul className="space-y-3">
              {orders.map((o) => (
                <li key={o.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{o.total_amount.toFixed(2)} CHF</div>
                    <div className="text-xs text-white/50">
                      {new Date(o.created_at).toLocaleString(lang)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lime-400 font-semibold">+{o.points_earned} {t.earned}</div>
                    {o.points_used > 0 && (
                      <div className="text-xs text-amber-400">−{o.points_used} {t.used}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
