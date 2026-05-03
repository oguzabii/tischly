import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase-service';

const MIN_ORDERS_TO_BE_FAVORITE = 3;

/**
 * GET /api/guest-favorites?guest_id=...
 * Returns up to 3 item_ids the guest has ordered ≥3 times.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const guestId = url.searchParams.get('guest_id');
  if (!guestId) return NextResponse.json({ favorites: [] });

  const svc = getServiceClient();
  const { data } = await svc
    .from('guest_favorites')
    .select('item_id, order_count')
    .eq('guest_id', guestId)
    .gte('order_count', MIN_ORDERS_TO_BE_FAVORITE)
    .order('order_count', { ascending: false })
    .limit(3);

  return NextResponse.json({
    favorites: (data ?? []).map((r) => r.item_id as string),
  });
}
