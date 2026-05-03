'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import type { Ad, AdPlacement, AdKind } from '@/lib/types';

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export function AdsAdmin() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [kind, setKind] = useState<AdKind>('image');
  const [placement, setPlacement] = useState<AdPlacement>('idle');
  const [duration, setDuration] = useState(7000);
  const [weight, setWeight] = useState(1);

  async function refresh() {
    const supabase = getClient();
    const { data: r } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', 'tischly-demo')
      .maybeSingle();
    if (!r) return;
    setRestaurantId(r.id);

    const { data } = await supabase
      .from('ads')
      .select('*')
      .eq('restaurant_id', r.id)
      .order('created_at', { ascending: false });
    setAds((data ?? []) as Ad[]);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { refresh(); }, []);

  async function toggleActive(ad: Ad) {
    await getClient().from('ads').update({ active: !ad.active }).eq('id', ad.id);
    refresh();
  }

  async function remove(ad: Ad) {
    if (!confirm(`Delete "${ad.title}"?`)) return;
    await getClient().from('ads').delete().eq('id', ad.id);
    refresh();
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurantId) return;
    await getClient().from('ads').insert({
      restaurant_id: restaurantId,
      title,
      media_url: mediaUrl,
      kind,
      placement,
      duration_ms: duration,
      weight,
      active: true,
    });
    setTitle('');
    setMediaUrl('');
    setShowForm(false);
    refresh();
  }

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ads &amp; Promotions</h2>
          <p className="text-sm text-slate-500">
            Rotated on the idle screen, in menu banners, and between categories.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="px-4 py-2 rounded-lg bg-lime-500 text-slate-900 font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New ad
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={save}
          className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3 border border-slate-200 dark:border-slate-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              required
              placeholder="Title (internal)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900"
            />
            <input
              required
              placeholder="Media URL (jpg / mp4)"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900"
            />
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as AdKind)}
              className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            <select
              value={placement}
              onChange={(e) => setPlacement(e.target.value as AdPlacement)}
              className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900"
            >
              <option value="idle">Idle screen</option>
              <option value="menu_banner">Menu banner</option>
              <option value="category_break">Between categories</option>
            </select>
            <label className="text-sm">
              Duration (ms)
              <input
                type="number"
                min={2000}
                step={500}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-900"
              />
            </label>
            <label className="text-sm">
              Weight
              <input
                type="number"
                min={1}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-900"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-lg bg-slate-900 text-white">
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800"
          >
            <div className="aspect-video bg-slate-100 dark:bg-slate-900 relative">
              {ad.kind === 'video' ? (
                <video src={ad.media_url} muted className="w-full h-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ad.media_url} alt={ad.title} className="w-full h-full object-cover" />
              )}
              {!ad.active && (
                <div className="absolute inset-0 bg-black/60 grid place-items-center text-white font-bold">
                  PAUSED
                </div>
              )}
            </div>
            <div className="p-3">
              <div className="font-semibold truncate">{ad.title}</div>
              <div className="text-xs text-slate-500 mb-3">
                {ad.placement} · {ad.duration_ms}ms · weight {ad.weight}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleActive(ad)}
                  className="flex-1 px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 flex items-center justify-center gap-1"
                >
                  {ad.active ? (
                    <><EyeOff className="w-3 h-3" /> Pause</>
                  ) : (
                    <><Eye className="w-3 h-3" /> Activate</>
                  )}
                </button>
                <button
                  onClick={() => remove(ad)}
                  className="px-3 py-1.5 rounded-lg text-sm bg-red-100 text-red-700 dark:bg-red-900/30"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {ads.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No ads yet. Click <strong>New ad</strong> to add the first one.
        </div>
      )}
    </div>
  );
}
