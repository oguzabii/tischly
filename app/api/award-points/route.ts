import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase-service';

interface OrderItem {
  item_id: string;
  quantity: number;
}

/**
 * POST /api/award-points
 * body: { guest_id, order_id, table_id, total_amount, points_used?, items: [{item_id, quantity}] }
 *
 * Called from checkout AFTER payment succeeds.
 * Returns { new_balance, points_earned }.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid body' }, { status: 400 });

  const guestId: string = String(body.guest_id ?? '');
  const orderId: string = String(body.order_id ?? '');
  const tableId: string = String(body.table_id ?? '');
  const totalAmount: number = Number(body.total_amount ?? 0);
  const pointsUsed: number = Number(body.points_used ?? 0);
  const items: OrderItem[] = Array.isArray(body.items) ? body.items : [];

  if (!guestId || !orderId || totalAmount < 0) {
    return NextResponse.json({ error: 'invalid params' }, { status: 400 });
  }

  const svc = getServiceClient();

  const { data: result, error } = await svc.rpc('fn_award_points', {
    p_guest_id: guestId,
    p_amount: totalAmount,
    p_order_id: orderId,
    p_table_id: tableId,
    p_points_used: pointsUsed,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (items.length > 0) {
    for (const it of items) {
      const { data: existing } = await svc
        .from('guest_favorites')
        .select('order_count')
        .eq('guest_id', guestId)
        .eq('item_id', it.item_id)
        .maybeSingle();

      if (existing) {
        await svc
          .from('guest_favorites')
          .update({
            order_count: (existing.order_count as number) + (it.quantity || 1),
            last_ordered: new Date().toISOString(),
          })
          .eq('guest_id', guestId)
          .eq('item_id', it.item_id);
      } else {
        await svc.from('guest_favorites').insert({
          guest_id: guestId,
          item_id: it.item_id,
          order_count: it.quantity || 1,
        });
      }
    }

    await svc.from('ai_suggestions_cache').delete().eq('guest_id', guestId);
  }

  const row = Array.isArray(result) && result[0] ? result[0] : { new_balance: 0, points_earned: 0 };
  return NextResponse.json(row);
}
