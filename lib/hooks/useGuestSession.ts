'use client';

import { useEffect, useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { Guest, GuestSession, GuestSessionWithGuest } from '@/lib/types';

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

/**
 * Subscribes to guest_sessions for a given table_id and resolves each
 * session's guest record. Returns ALL active sessions (host + companions).
 *
 * Uses a unique channel name per hook instance to avoid the Supabase
 * "cannot add postgres_changes callbacks after subscribe()" error that
 * occurs in React StrictMode (double-invoke) or when multiple components
 * try to subscribe to the same channel name.
 */
export function useGuestSessions(tableId: string) {
  const [sessions, setSessions] = useState<GuestSessionWithGuest[]>([]);
  const [loading, setLoading] = useState(true);
  // Unique per hook instance — survives re-renders but not StrictMode double-mount
  const channelName = useRef(`table-${tableId}-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    const supabase = getClient();
    let cancelled = false;

    async function fetchAll() {
      const { data: rows } = await supabase
        .from('guest_sessions')
        .select('*, guest:guests(*)')
        .eq('table_id', tableId)
        .is('ended_at', null);

      if (cancelled) return;
      setSessions((rows ?? []) as unknown as GuestSessionWithGuest[]);
      setLoading(false);
    }

    fetchAll();

    const channel = supabase
      .channel(channelName.current)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guest_sessions', filter: `table_id=eq.${tableId}` },
        () => { fetchAll(); },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId]);

  const host = sessions.find((s) => s.role === 'host')?.guest ?? null;
  const companions = sessions.filter((s) => s.role === 'companion').map((s) => s.guest);

  return { sessions, host, companions, loading };
}

export async function endTableSessions(tableId: string) {
  const supabase = getClient();
  await supabase
    .from('guest_sessions')
    .update({ ended_at: new Date().toISOString() })
    .eq('table_id', tableId)
    .is('ended_at', null);
}

export function newJoinToken(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export type { Guest, GuestSession, GuestSessionWithGuest };
