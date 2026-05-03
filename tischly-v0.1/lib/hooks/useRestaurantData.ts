'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { Restaurant, Ad, AdPlacement } from '@/lib/types';

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

const DEMO_SLUG = 'tischly-demo';

export function useRestaurant(slug: string = DEMO_SLUG) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getClient()
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setRestaurant(data as Restaurant | null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { restaurant, loading };
}

export function useAds(placement: AdPlacement, restaurantId?: string) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) return;
    let cancelled = false;
    getClient()
      .from('ads')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('placement', placement)
      .eq('active', true)
      .then(({ data }) => {
        if (cancelled) return;
        setAds((data ?? []) as Ad[]);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [placement, restaurantId]);

  return { ads, loading };
}

export async function logAdImpression(adId: string, tableId: string, durationMs: number) {
  try {
    await getClient().from('ad_impressions').insert({
      ad_id: adId,
      table_id: tableId,
      duration_ms: durationMs,
    });
  } catch {
    // swallow — analytics never blocks UI
  }
}
