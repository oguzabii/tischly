'use client';

import { useEffect, useState } from 'react';
import { Save, Sparkles } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import type { LoyaltyConfig } from '@/lib/types';

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export function LoyaltyAdmin() {
  const [cfg, setCfg] = useState<LoyaltyConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = getClient();
      const { data: r } = await supabase
        .from('restaurants')
        .select('id')
        .eq('slug', 'tischly-demo')
        .maybeSingle();
      if (!r) return;
      const { data } = await supabase
        .from('loyalty_config')
        .select('*')
        .eq('restaurant_id', r.id)
        .maybeSingle();
      setCfg(data as LoyaltyConfig | null);
    })();
  }, []);

  if (!cfg) return <div className="p-6">Loading…</div>;

  function update<K extends keyof LoyaltyConfig>(k: K, v: LoyaltyConfig[K]) {
    setCfg((prev) => (prev ? { ...prev, [k]: v } : prev));
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

  const earnRate = `1 CHF = ${cfg.points_per_currency} pts`;
  const redeemSentence = `${cfg.redeem_min_points} pts = ${(cfg.redeem_min_points * cfg.redeem_rate).toFixed(2)} CHF off`;

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Loyalty Settings</h2>
        <p className="text-sm text-slate-500">{earnRate} · {redeemSentence}</p>
      </div>

      <section className="rounded-xl border p-5 space-y-4 bg-white dark:bg-slate-900">
        <h3 className="font-semibold">Points</h3>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            Earn rate (points per CHF)
            <input
              type="number"
              step={0.1}
              min={0}
              value={cfg.points_per_currency}
              onChange={(e) => update('points_per_currency', Number(e.target.value))}
              className="mt-1 w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800"
            />
          </label>
          <label className="block text-sm">
            Redeem rate (CHF per point)
            <input
              type="number"
              step={0.001}
              min={0}
              value={cfg.redeem_rate}
              onChange={(e) => update('redeem_rate', Number(e.target.value))}
              className="mt-1 w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800"
            />
          </label>
          <label className="block text-sm">
            Min points to redeem
            <input
              type="number"
              min={1}
              step={50}
              value={cfg.redeem_min_points}
              onChange={(e) => update('redeem_min_points', Number(e.target.value))}
              className="mt-1 w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border p-5 space-y-4 bg-white dark:bg-slate-900">
        <h3 className="font-semibold">Bonuses</h3>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            Birthday gift value (CHF)
            <input
              type="number"
              min={0}
              step={1}
              value={cfg.birthday_gift_value}
              onChange={(e) => update('birthday_gift_value', Number(e.target.value))}
              className="mt-1 w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800"
            />
          </label>
          <label className="block text-sm">
            Referral reward (points)
            <input
              type="number"
              min={0}
              step={50}
              value={cfg.referral_reward_points}
              onChange={(e) => update('referral_reward_points', Number(e.target.value))}
              className="mt-1 w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border p-5 bg-white dark:bg-slate-900">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={cfg.ai_recommendations}
            onChange={(e) => update('ai_recommendations', e.target.checked)}
            className="w-5 h-5 accent-lime-500"
          />
          <div>
            <div className="font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-lime-600" />
              AI-powered recommendations
            </div>
            <div className="text-xs text-slate-500">
              Uses Claude Haiku to suggest 3 menu items per guest. ~$0.001 per suggestion (cached 24h).
              Requires ANTHROPIC_API_KEY in your environment.
            </div>
          </div>
        </label>
      </section>

      <div className="sticky bottom-4">
        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-3 rounded-xl bg-lime-500 text-slate-900 font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save changes'}
          {showSaved && <span className="text-xs">✓ saved</span>}
        </button>
      </div>
    </div>
  );
}
