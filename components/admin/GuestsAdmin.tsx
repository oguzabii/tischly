'use client';

import { useEffect, useState } from 'react';
import { Search, Users, Coins, Calendar, RefreshCw, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import type { Guest } from '@/lib/types';

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export function GuestsAdmin() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const sb = getClient();
    const { data: r } = await sb.from('restaurants').select('id').eq('slug', 'tischly-demo').maybeSingle();
    if (!r) { setLoading(false); return; }
    const { data } = await sb.from('guests').select('*').eq('restaurant_id', r.id)
      .order('last_visit_at', { ascending: false, nullsFirst: false }).limit(200);
    setGuests((data ?? []) as Guest[]);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { refresh(); }, []);

  const filtered = guests.filter(g => {
    if (!search) return true;
    const s = search.toLowerCase();
    return g.name.toLowerCase().includes(s) || g.email.toLowerCase().includes(s);
  });

  const totalPoints = guests.reduce((sum, g) => sum + g.points, 0);
  const totalSpent  = guests.reduce((sum, g) => sum + Number(g.lifetime_spent), 0);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gäste</h1>
          <p className="text-stone-400 text-sm mt-1">{guests.length} registriert</p>
        </div>
        <button onClick={refresh}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-300 text-sm font-medium hover:bg-stone-700 transition-colors">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Aktualisieren
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <Users size={18} className="text-sky-400" />
            </div>
            <span className="text-stone-400 text-sm">Gäste gesamt</span>
          </div>
          <p className="text-3xl font-bold text-white">{guests.length}</p>
        </div>
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-lime-500/10 flex items-center justify-center">
              <Coins size={18} className="text-lime-400" />
            </div>
            <span className="text-stone-400 text-sm">Offene Punkte</span>
          </div>
          <p className="text-3xl font-bold text-lime-400">{totalPoints.toLocaleString()}</p>
        </div>
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <span className="text-amber-400 font-bold text-sm">CHF</span>
            </div>
            <span className="text-stone-400 text-sm">Gesamtumsatz</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalSpent.toFixed(0)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Name oder E-Mail suchen…"
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-900 border border-stone-700 text-white text-sm focus:border-amber-400 outline-none placeholder-stone-500"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>
      ) : (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-800">
                <th className="text-left px-5 py-4 text-stone-400 text-xs font-semibold uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-4 text-stone-400 text-xs font-semibold uppercase tracking-wide">E-Mail</th>
                <th className="text-right px-5 py-4 text-stone-400 text-xs font-semibold uppercase tracking-wide">Punkte</th>
                <th className="text-right px-5 py-4 text-stone-400 text-xs font-semibold uppercase tracking-wide">Ausgaben</th>
                <th className="text-right px-5 py-4 text-stone-400 text-xs font-semibold uppercase tracking-wide">Besuche</th>
                <th className="text-left px-5 py-4 text-stone-400 text-xs font-semibold uppercase tracking-wide">Letzter Besuch</th>
                <th className="text-left px-5 py-4 text-stone-400 text-xs font-semibold uppercase tracking-wide">Geburtstag</th>
                <th className="text-left px-5 py-4 text-stone-400 text-xs font-semibold uppercase tracking-wide">Referral</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(g => (
                <tr key={g.id} className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors">
                  <td className="px-5 py-4 text-white font-semibold">{g.name}</td>
                  <td className="px-5 py-4 text-stone-400">{g.email}</td>
                  <td className="px-5 py-4 text-right">
                    <span className="inline-flex items-center gap-1 text-lime-400 font-semibold">
                      <Coins size={13} /> {g.points}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-white">{Number(g.lifetime_spent).toFixed(2)} CHF</td>
                  <td className="px-5 py-4 text-right text-stone-300">{g.visit_count}</td>
                  <td className="px-5 py-4 text-stone-400 text-xs">
                    {g.last_visit_at ? new Date(g.last_visit_at).toLocaleDateString('de-CH') : '—'}
                  </td>
                  <td className="px-5 py-4 text-xs">
                    {g.birthday ? (
                      <span className="inline-flex items-center gap-1 text-pink-400">
                        <Calendar size={12} />
                        {new Date(g.birthday).toLocaleDateString('de-CH', { day: '2-digit', month: 'short' })}
                      </span>
                    ) : <span className="text-stone-600">—</span>}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-stone-400">{g.referral_code}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-stone-500">
              {search ? 'Keine Gäste gefunden.' : 'Noch keine Gäste. Sobald jemand einloggt, erscheint er hier.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
