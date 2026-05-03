'use client';

import { useEffect, useState } from 'react';
import { Save, Sparkles, Loader2, Check } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import type { LoyaltyConfig } from '@/lib/types';

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

const INPUT = 'w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-400 outline-none';
const LABEL = 'block text-stone-400 text-xs mb-1.5 font-medium';

export function LoyaltyAdmin() {
  const [cfg, setCfg] = useState<LoyaltyConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const sb = getClient();
      const { data: r } = await sb.from('restaurants').select('id').eq('slug', 'tischly-demo').maybeSingle();
      if (!r) return;
      const { data } = await sb.from('loyalty_config').select('*').eq('restaurant_id', r.id).maybeSingle();
      setCfg(data as LoyaltyConfig | null);
    })();
  }, []);

  if (!cfg) return (
    <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>
  );

  function update<K extends keyof LoyaltyConfig>(k: K, v: LoyaltyConfig[K]) {
    setCfg(prev => prev ? { ...prev, [k]: v } : prev);
  }

  async function save() {
    if (!cfg) return;
    setSaving(true);
    await getClient().from('loyalty_config').update({
      points_per_currency: cfg.points_per_currency,
      redeem_rate: cfg.redeem_rate,
      redeem_min_points: cfg.redeem_min_points,
      birthday_gift_value: cfg.birthday_gift_value,
      referral_reward_points: cfg.referral_reward_points,
      ai_recommendations: cfg.ai_recommendations,
    }).eq('restaurant_id', cfg.restaurant_id);
    setSaving(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  }

  const earnRate = `1 CHF = ${cfg.points_per_currency} Punkte`;
  const redeemSentence = `${cfg.redeem_min_points} Punkte = ${(cfg.redeem_min_points * cfg.redeem_rate).toFixed(2)} CHF Rabatt`;

  return (
    <div className="max-w-2xl space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Loyalty Einstellungen</h1>
          <p className="text-stone-400 text-sm mt-1">{earnRate} · {redeemSentence}</p>
        </div>
        {showSaved && (
          <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
            <Check size={16} /> Gespeichert
          </span>
        )}
      </div>

      {/* Preview banner */}
      <div className="bg-amber-400/10 border border-amber-400/30 rounded-2xl px-5 py-4 flex items-center gap-4">
        <div className="text-3xl">🪙</div>
        <div>
          <p className="text-amber-300 font-semibold text-sm">Aktuelle Einstellung</p>
          <p className="text-white text-sm mt-0.5">{earnRate} · {redeemSentence}</p>
        </div>
      </div>

      {/* Points */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-white font-bold text-lg">Punkte</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Punkte pro CHF (Verdienen)</label>
            <input type="number" step={0.1} min={0} className={INPUT}
              value={cfg.points_per_currency}
              onChange={e => update('points_per_currency', Number(e.target.value))} />
            <p className="text-stone-500 text-xs mt-1">Standard: 1 CHF = 1 Punkt</p>
          </div>
          <div>
            <label className={LABEL}>CHF pro Punkt (Einlösen)</label>
            <input type="number" step={0.001} min={0} className={INPUT}
              value={cfg.redeem_rate}
              onChange={e => update('redeem_rate', Number(e.target.value))} />
            <p className="text-stone-500 text-xs mt-1">Standard: 0.01 = 100 Punkte = 1 CHF</p>
          </div>
          <div>
            <label className={LABEL}>Mindestpunkte zum Einlösen</label>
            <input type="number" min={1} step={50} className={INPUT}
              value={cfg.redeem_min_points}
              onChange={e => update('redeem_min_points', Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* Bonuses */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-white font-bold text-lg">Boni</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Geburtstagsgutschein (CHF)</label>
            <input type="number" min={0} step={1} className={INPUT}
              value={cfg.birthday_gift_value}
              onChange={e => update('birthday_gift_value', Number(e.target.value))} />
            <p className="text-stone-500 text-xs mt-1">0 = deaktiviert</p>
          </div>
          <div>
            <label className={LABEL}>Empfehlungsbonus (Punkte)</label>
            <input type="number" min={0} step={50} className={INPUT}
              value={cfg.referral_reward_points}
              onChange={e => update('referral_reward_points', Number(e.target.value))} />
            <p className="text-stone-500 text-xs mt-1">Pro erfolgreich geworbenen Gast</p>
          </div>
        </div>
      </div>

      {/* AI */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
        <label className="flex items-start gap-4 cursor-pointer">
          <input type="checkbox" checked={cfg.ai_recommendations}
            onChange={e => update('ai_recommendations', e.target.checked)}
            className="w-5 h-5 accent-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-white font-semibold flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              KI-Empfehlungen (Claude)
            </p>
            <p className="text-stone-400 text-sm mt-1">
              Schlägt Gästen 3 Menüpunkte basierend auf ihren Vorlieben vor.
              Ca. $0.001 pro Empfehlung, 24h gecacht. Benötigt ANTHROPIC_API_KEY.
            </p>
          </div>
        </label>
      </div>

      {/* Save */}
      <button onClick={save} disabled={saving}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 text-black font-bold hover:bg-amber-300 disabled:opacity-50 transition-colors">
        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        {saving ? 'Speichern…' : 'Änderungen speichern'}
      </button>
    </div>
  );
}
