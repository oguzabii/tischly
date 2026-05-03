'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { Offer, Lang } from '@/lib/types';

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

interface DbOffer {
  id: string;
  restaurant_id: string;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  discount: number;
  discount_type: 'percent' | 'fixed';
  image_url: string | null;
  valid_until: string | null;
  code: string | null;
  active: boolean;
  sort_order: number;
}

function toOffer(row: DbOffer): Offer {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    discount: row.discount,
    discountType: row.discount_type,
    image: row.image_url ?? '',
    validUntil: row.valid_until ?? '2099-12-31',
    code: row.code ?? undefined,
  };
}

const DEMO_SLUG = 'tischly-demo';

export function useOffers(slug: string = DEMO_SLUG) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const client = getClient();
    const { data: rest } = await client
      .from('restaurants')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (!rest) { setLoading(false); return; }
    setRestaurantId(rest.id);

    const { data } = await client
      .from('offers')
      .select('*')
      .eq('restaurant_id', rest.id)
      .eq('active', true)
      .order('sort_order', { ascending: true });

    setOffers((data ?? []).map(toOffer));
    setLoading(false);
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  return { offers, restaurantId, loading, reload: load };
}

// ── Admin CRUD ────────────────────────────────────────────────────────

export async function getOffersForAdmin(restaurantId: string): Promise<DbOffer[]> {
  const client = getClient();
  const { data, error } = await client
    .from('offers')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('sort_order');
  if (error) throw error;
  return (data ?? []) as DbOffer[];
}

export async function saveOffer(offer: DbOffer) {
  const client = getClient();
  const { error } = await client
    .from('offers')
    .upsert({ ...offer }, { onConflict: 'id' });
  if (error) throw error;
}

export async function deleteOffer(id: string) {
  const client = getClient();
  const { error } = await client.from('offers').delete().eq('id', id);
  if (error) throw error;
}

export type { DbOffer };
