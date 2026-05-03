'use client';

import { useEffect, useState } from 'react';
import { Search, Users, Coins, Calendar, RefreshCw } from 'lucide-react';
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
    const supabase = getClient();
    const { data: r } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', 'tischly-demo')
      .maybeSingle();
    if (!r) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('guests')
      .select('*')
      .eq('restaurant_id', r.id)
      .order('last_visit_at', { ascending: false, nullsFirst: false })
      .limit(200);
    setGuests((data ?? []) as Guest[]);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { refresh(); }, []);

  const filtered = guests.filter((g) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return g.name.toLowerCase().includes(s) || g.email.toLowerCase().includes(s);
  });

  const totalPoints = guests.reduce((sum, g) => sum + g.points, 0);
  const totalSpent = guests.reduce((sum, g) => sum + Number(g.lifetime_spent), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Guests
          </h2>
          <p className="text-sm text-slate-500">{guests.length} registered</p>
        </div>
        <button
          onClick={refresh}
          className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center gap-2 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-4">
          <div className="text-xs text-slate-500">Total guests</div>
          <div className="text-2xl font-bold">{guests.length}</div>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-4">
          <div className="text-xs text-slate-500">Outstanding points</div>
          <div className="text-2xl font-bold text-lime-600">{totalPoints.toLocaleString()}</div>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-4">
          <div className="text-xs text-slate-500">Lifetime revenue</div>
          <div className="text-2xl font-bold">{totalSpent.toFixed(0)} CHF</div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email…"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white dark:bg-slate-900"
        />
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-right px-4 py-3">Points</th>
              <th className="text-right px-4 py-3">Spent (CHF)</th>
              <th className="text-right px-4 py-3">Visits</th>
              <th className="text-left px-4 py-3">Last visit</th>
              <th className="text-left px-4 py-3">Birthday</th>
              <th className="text-left px-4 py-3">Referral</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g.id} className="border-t hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3 font-semibold">{g.name}</td>
                <td className="px-4 py-3 text-slate-500">{g.email}</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 text-lime-600 font-semibold">
                    <Coins className="w-3 h-3" />
                    {g.points}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">{Number(g.lifetime_spent).toFixed(2)}</td>
                <td className="px-4 py-3 text-right">{g.visit_count}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {g.last_visit_at ? new Date(g.last_visit_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3 text-xs">
                  {g.birthday ? (
                    <span className="inline-flex items-center gap-1 text-pink-600">
                      <Calendar className="w-3 h-3" />
                      {new Date(g.birthday).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{g.referral_code}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && !loading && (
          <div className="text-center py-12 text-slate-500">
            {search ? 'No guests match your search.' : 'No guests yet. Once someone signs in, they show up here.'}
          </div>
        )}
      </div>
    </div>
  );
}
