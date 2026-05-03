'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, Loader2, Megaphone, X, Check } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import type { Ad, AdPlacement, AdKind } from '@/lib/types';

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

const INPUT = 'w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-400 outline-none';
const SELECT = 'w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-400 outline-none';

export function AdsAdmin() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [kind, setKind] = useState<AdKind>('image');
  const [placement, setPlacement] = useState<AdPlacement>('idle');
  const [duration, setDuration] = useState(7000);
  const [weight, setWeight] = useState(1);

  async function refresh() {
    const sb = getClient();
    const { data: r } = await sb.from('restaurants').select('id').eq('slug', 'tischly-demo').maybeSingle();
    if (!r) return;
    setRestaurantId(r.id);
    const { data } = await sb.from('ads').select('*').eq('restaurant_id', r.id).order('created_at', { ascending: false });
    setAds((data ?? []) as Ad[]);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { refresh(); }, []);

  async function toggleActive(ad: Ad) {
    await getClient().from('ads').update({ active: !ad.active }).eq('id', ad.id);
    setAds(prev => prev.map(a => a.id === ad.id ? { ...a, active: !ad.active } : a));
  }

  async function remove(ad: Ad) {
    if (!confirm(`"${ad.title}" wirklich löschen?`)) return;
    await getClient().from('ads').delete().eq('id', ad.id);
    setAds(prev => prev.filter(a => a.id !== ad.id));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurantId || !title || !mediaUrl) return;
    setSaving(true);
    await getClient().from('ads').insert({
      restaurant_id: restaurantId, title, media_url: mediaUrl,
      kind, placement, duration_ms: duration, weight, active: true,
    });
    setTitle(''); setMediaUrl(''); setShowForm(false); setSaving(false);
    refresh();
  }

  const PLACEMENT_LABEL: Record<string, string> = {
    idle: 'Idle Screen', menu_banner: 'Menü Banner', category_break: 'Zwischen Kategorien',
  };

  if (loading) return (
    <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Ads & Promotionen</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-black font-semibold text-sm hover:bg-amber-300 transition-colors"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Abbrechen' : 'Neue Ad'}
        </button>
      </div>

      <p className="text-stone-400 text-sm -mt-4">
        Werden auf dem Idle Screen, als Menü-Banner und zwischen Kategorien rotiert.
      </p>

      {/* New ad form */}
      {showForm && (
        <form onSubmit={save} className="bg-stone-900 border border-amber-500/30 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Neue Ad</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-stone-400 text-xs mb-1 block">Titel *</label>
              <input className={INPUT} value={title} onChange={e => setTitle(e.target.value)} placeholder="z.B. Happy Hour Ad" required />
            </div>
            <div>
              <label className="text-stone-400 text-xs mb-1 block">Bild/Video URL *</label>
              <input className={INPUT} value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="https://..." required />
            </div>
            <div>
              <label className="text-stone-400 text-xs mb-1 block">Typ</label>
              <select className={SELECT} value={kind} onChange={e => setKind(e.target.value as AdKind)}>
                <option value="image">Bild</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div>
              <label className="text-stone-400 text-xs mb-1 block">Platzierung</label>
              <select className={SELECT} value={placement} onChange={e => setPlacement(e.target.value as AdPlacement)}>
                <option value="idle">Idle Screen</option>
                <option value="menu_banner">Menü Banner</option>
                <option value="category_break">Zwischen Kategorien</option>
              </select>
            </div>
            <div>
              <label className="text-stone-400 text-xs mb-1 block">Anzeigedauer (ms)</label>
              <input type="number" min={2000} step={500} className={INPUT} value={duration} onChange={e => setDuration(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-stone-400 text-xs mb-1 block">Gewichtung (1–10)</label>
              <input type="number" min={1} max={10} className={INPUT} value={weight} onChange={e => setWeight(Number(e.target.value))} />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-black font-semibold text-sm hover:bg-amber-300 disabled:opacity-50 transition-colors">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Speichern
            </button>
          </div>
        </form>
      )}

      {/* Ads grid */}
      {ads.length === 0 ? (
        <div className="text-center py-16 text-stone-500">
          <Megaphone size={32} className="mx-auto mb-3 opacity-40" />
          <p>Noch keine Ads. Klicke auf &quot;Neue Ad&quot;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ads.map(ad => (
            <div key={ad.id} className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
              <div className="aspect-video bg-stone-800 relative">
                {ad.kind === 'video' ? (
                  <video src={ad.media_url} muted className="w-full h-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ad.media_url} alt={ad.title} className="w-full h-full object-cover" />
                )}
                {!ad.active && (
                  <div className="absolute inset-0 bg-black/70 grid place-items-center">
                    <span className="text-white font-bold text-sm px-3 py-1 rounded-full border border-white/30">PAUSIERT</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-white font-semibold truncate mb-1">{ad.title}</p>
                <p className="text-stone-500 text-xs mb-3">
                  {PLACEMENT_LABEL[ad.placement]} · {ad.duration_ms}ms · Gewicht {ad.weight}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(ad)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm font-medium transition-colors"
                  >
                    {ad.active ? <><EyeOff size={14} /> Pausieren</> : <><Eye size={14} /> Aktivieren</>}
                  </button>
                  <button
                    onClick={() => remove(ad)}
                    className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-red-900/50 text-stone-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
