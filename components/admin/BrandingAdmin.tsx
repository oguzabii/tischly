'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2, Check } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import type { Restaurant } from '@/lib/types';

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

const INPUT = 'w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-400 outline-none placeholder-stone-500';
const LABEL = 'block text-stone-400 text-xs mb-1.5 font-medium';

export function BrandingAdmin() {
  const [r, setR] = useState<Restaurant | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    getClient().from('restaurants').select('*').eq('slug', 'tischly-demo').maybeSingle()
      .then(({ data }) => setR(data as Restaurant | null));
  }, []);

  if (!r) return (
    <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>
  );

  function update<K extends keyof Restaurant>(key: K, value: Restaurant[K]) {
    setR(prev => prev ? { ...prev, [key]: value } : prev);
  }

  async function save() {
    if (!r) return;
    setSaving(true);
    await getClient().from('restaurants').update({
      name: r.name, logo_url: r.logo_url,
      primary_color: r.primary_color, accent_color: r.accent_color,
      idle_video_url: r.idle_video_url, idle_headline: r.idle_headline,
      idle_subline: r.idle_subline, charging_enabled: r.charging_enabled,
      charging_minutes: r.charging_minutes,
    }).eq('id', r.id);
    setSaving(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Branding & Idle Screen</h1>
          <p className="text-stone-400 text-sm mt-1">Logo, Farben und das Video auf dem Wartebildschirm.</p>
        </div>
        {showSaved && (
          <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
            <Check size={16} /> Gespeichert
          </span>
        )}
      </div>

      {/* Restaurant */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-white font-bold text-lg">Restaurant</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Name</label>
            <input className={INPUT} value={r.name} onChange={e => update('name', e.target.value)} placeholder="z.B. Tischly Demo Restaurant" />
          </div>
          <div>
            <label className={LABEL}>Logo URL</label>
            <input className={INPUT} value={r.logo_url ?? ''} onChange={e => update('logo_url', e.target.value || null)} placeholder="/tischly-logo.png" />
          </div>
        </div>
      </div>

      {/* Colors */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-white font-bold text-lg">Farben</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className={LABEL}>Primärfarbe</label>
            <div className="flex gap-3 items-center">
              <input type="color" value={r.primary_color}
                onChange={e => update('primary_color', e.target.value)}
                className="h-11 w-14 rounded-xl border-2 border-stone-700 cursor-pointer bg-transparent p-1" />
              <input className={INPUT} value={r.primary_color}
                onChange={e => update('primary_color', e.target.value)}
                placeholder="#84CC16" />
            </div>
          </div>
          <div>
            <label className={LABEL}>Akzentfarbe</label>
            <div className="flex gap-3 items-center">
              <input type="color" value={r.accent_color}
                onChange={e => update('accent_color', e.target.value)}
                className="h-11 w-14 rounded-xl border-2 border-stone-700 cursor-pointer bg-transparent p-1" />
              <input className={INPUT} value={r.accent_color}
                onChange={e => update('accent_color', e.target.value)}
                placeholder="#0F172A" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-2">
          <div className="h-10 flex-1 rounded-xl" style={{ background: r.primary_color }} />
          <div className="h-10 flex-1 rounded-xl" style={{ background: r.accent_color }} />
        </div>
      </div>

      {/* Idle Screen */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-white font-bold text-lg">Idle Screen (Wartebildschirm)</h2>
        <div>
          <label className={LABEL}>Hintergrundvideo URL (mp4 / webm) — leer lassen für Demo-Videos</label>
          <input className={INPUT} value={r.idle_video_url ?? ''}
            onChange={e => update('idle_video_url', e.target.value || null)}
            placeholder="https://…/restaurant-loop.mp4" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Headline (DE)</label>
            <input className={INPUT}
              value={typeof r.idle_headline === 'object' ? (r.idle_headline as Record<string, string>).de ?? '' : ''}
              onChange={e => { const h = r.idle_headline as Record<string, string>; update('idle_headline', { de: e.target.value, en: h.en??'', tr: h.tr??'', fr: h.fr??'', it: h.it??'', es: h.es??'' }); }}
              placeholder="Tischly" />
          </div>
          <div>
            <label className={LABEL}>Subline (DE)</label>
            <input className={INPUT}
              value={typeof r.idle_subline === 'object' ? (r.idle_subline as Record<string, string>).de ?? '' : ''}
              onChange={e => { const s = r.idle_subline as Record<string, string>; update('idle_subline', { de: e.target.value, en: s.en??'', tr: s.tr??'', fr: s.fr??'', it: s.it??'', es: s.es??'' }); }}
              placeholder="Tippen zum Starten" />
          </div>
        </div>
        {r.idle_video_url && (
          <video src={r.idle_video_url} autoPlay muted loop playsInline
            className="w-full max-w-sm rounded-xl border border-stone-700 mt-2" />
        )}
      </div>

      {/* Charging */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-white font-bold text-lg">Kostenloses Aufladen</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={r.charging_enabled}
            onChange={e => update('charging_enabled', e.target.checked)}
            className="w-5 h-5 accent-amber-400 rounded" />
          <span className="text-white text-sm">&quot;Kostenlos laden&quot; Button auf Idle Screen anzeigen</span>
        </label>
        <div className="max-w-xs">
          <label className={LABEL}>Freiminuten pro Session</label>
          <input type="number" min={5} max={120} className={INPUT}
            value={r.charging_minutes}
            onChange={e => update('charging_minutes', Number(e.target.value))} />
        </div>
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
