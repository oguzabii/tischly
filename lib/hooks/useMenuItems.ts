'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { MenuItem, Extra, Lang } from '@/lib/types';

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// Shape returned from Supabase (image stored as image_url)
interface DbMenuItem {
  id: string;
  restaurant_id: string;
  category: string;
  name: Record<Lang, string>;
  description: Record<Lang, string>;
  price: number;
  image_url: string | null;
  extras: Extra[];
  tags: string[];
  available: boolean;
  calories: number | null;
  allergens: string[];
  sort_order: number;
}

function toMenuItem(row: DbMenuItem): MenuItem {
  return {
    id: row.id,
    category: row.category as MenuItem['category'],
    name: row.name,
    description: row.description,
    price: row.price,
    image: row.image_url ?? '',
    extras: row.extras ?? [],
    tags: (row.tags ?? []) as MenuItem['tags'],
    available: row.available,
    calories: row.calories ?? undefined,
    allergens: row.allergens ?? [],
  };
}

const DEMO_SLUG = 'tischly-demo';

export function useMenuItems(slug: string = DEMO_SLUG) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const client = getClient();
    // Get restaurant id from slug
    const { data: rest } = await client
      .from('restaurants')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (!rest) { setLoading(false); return; }
    setRestaurantId(rest.id);

    const { data } = await client
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', rest.id)
      .order('sort_order', { ascending: true });

    setItems((data ?? []).map(toMenuItem));
    setLoading(false);
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  return { items, restaurantId, loading, reload: load };
}

// ── Admin CRUD ────────────────────────────────────────────────────────

export async function saveMenuItem(item: DbMenuItem) {
  const client = getClient();
  const { error } = await client
    .from('menu_items')
    .upsert({ ...item }, { onConflict: 'id' });
  if (error) throw error;
}

export async function deleteMenuItem(id: string) {
  const client = getClient();
  const { error } = await client.from('menu_items').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleMenuItemAvailability(id: string, available: boolean) {
  const client = getClient();
  const { error } = await client
    .from('menu_items')
    .update({ available })
    .eq('id', id);
  if (error) throw error;
}

export async function getMenuItemsForAdmin(restaurantId: string): Promise<DbMenuItem[]> {
  const client = getClient();
  const { data, error } = await client
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('category')
    .order('sort_order');
  if (error) throw error;
  return (data ?? []) as DbMenuItem[];
}

export type { DbMenuItem };
