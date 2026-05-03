'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import type { Restaurant } from '@/lib/types';

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export function BrandingAdmin() {
  const [r, setR] = useState<Restaurant | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    getClient()
      .from('restaurants')
      .select('*')
      .eq('slug', 'tischly-demo')
      .maybeSingle()
      .then(({ data }) => setR(data as Restaurant | null));
  }, []);

  if (!r) return <div className="p-6">Loading…</div>;

  function update<K extends keyof Restaurant>(key: K, value: Restaurant[K]) {
    setR((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function save() {
    if (!r) return;
    setSaving(true);
    await getClient()
      .from('restaurants')
      .update({
        name: r.name,
        logo_url: r.logo_url,
        primary_color: r.primary_color,
        accent_color: r.accent_color,
        idle_video_url: r.idle_video_url,
        idle_headline: r.idle_headline,
        idle_subline: r.idle_subline,
        charging_enabled: r.charging_enabled,
        charging_minutes: r.charging_minutes,
      })
      .eq('id', r.id);
    setSaving(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Branding &amp; Idle Screen</h2>
        <p className="text-sm text-slate-500">
          Logo, colors, and the live video that runs when the tablet is idle.
        </p>
      </div>

      <section className="space-y-3">
        <h3 className="font-semibold">Restaurant</h3>
        <label className="block text-sm">
          Name
          <input
            value={r.name}
            onChange={(e) => update('name', e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-900"
          />
        </label>
        <label className="block text-sm">
          Logo URL <span className="text-slate-400">(use /tischly-logo.png for default)</span>
          <input
            value={r.logo_url ?? ''}
            onChange={(e) => update('logo_url', e.target.value)}
            placeholder="/tischly-logo.png"
            className="mt-1 w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-900"
          />
        </label>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Colors</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            Primary
            <div className="mt-1 flex gap-2">
              <input
                type="color"
                value={r.primary_color}
                onChange={(e) => update('primary_color', e.target.value)}
                className="h-10 w-14 rounded-lg border"
              />
              <input
                value={r.primary_color}
                onChange={(e) => update('primary_color', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 font-mono"
              />
            </div>
          </label>
          <label className="block text-sm">
            Accent
            <div className="mt-1 flex gap-2">
              <input
                type="color"
                value={r.accent_color}
                onChange={(e) => update('accent_color', e.target.value)}
                className="h-10 w-14 rounded-lg border"
              />
              <input
                value={r.accent_color}
                onChange={(e) => update('accent_color', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 font-mono"
              />
            </div>
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Idle Screen</h3>
        <label className="block text-sm">
          Background video URL (mp4 / webm) — leave empty to use Pexels demo loops
          <input
            value={r.idle_video_url ?? ''}
            onChange={(e) => update('idle_video_url', e.target.value)}
            placeholder="https://…/restaurant-loop.mp4"
            className="mt-1 w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-900"
          />
        </label>
        {r.idle_video_url && (
          <video
            src={r.idle_video_url}
            autoPlay
            muted
            loop
            className="w-full max-w-sm rounded-xl border"
          />
        )}
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Free Charging</h3>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={r.charging_enabled}
            onChange={(e) => update('charging_enabled', e.target.checked)}
            className="w-5 h-5 accent-lime-500"
          />
          Show &quot;Free charging&quot; CTA on idle screen
        </label>
        <label className="block text-sm max-w-xs">
          Free minutes per session
          <input
            type="number"
            min={5}
            max={120}
            value={r.charging_minutes}
            onChange={(e) => update('charging_minutes', Number(e.target.value))}
            className="mt-1 w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-900"
          />
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
