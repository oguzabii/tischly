import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase-service';
import type { CartItem } from '@/lib/types';

/**
 * POST /api/orders
 * Body: { table_id, guest_id?, items: CartItem[], total }
 *
 * Inserts an order + order_items into Supabase, awards loyalty points
 * to the guest if guest_id is provided.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid body' }, { status: 400 });

  const tableId: string     = String(body.table_id ?? '').trim();
  const guestId: string | null = body.guest_id ? String(body.guest_id).trim() : null;
  const items: CartItem[]   = Array.isArray(body.items) ? body.items : [];
  const total: number       = Number(body.total) || 0;

  if (!tableId || items.length === 0) {
    return NextResponse.json({ error: 'missing table_id or items' }, { status: 400 });
  }

  const svc = getServiceClient();

  // Resolve restaurant
  const { data: restaurant } = await svc
    .from('restaurants')
    .select('id')
    .eq('slug', 'tischly-demo')
    .maybeSingle();

  if (!restaurant) {
    return NextResponse.json({ error: 'restaurant not configured' }, { status: 500 });
  }

  // Insert order
  const { data: order, error: orderErr } = await svc
    .from('orders')
    .insert({
      restaurant_id: restaurant.id,
      table_id: tableId,
      guest_id: guestId ?? null,
      status: 'pending',
      total,
    })
    .select()
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: orderErr?.message ?? 'order insert failed' }, { status: 500 });
  }

  // Insert order items
  const orderItemRows = items.map((item) => ({
    order_id: order.id,
    menu_item_id: item.menuItemId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    extras: item.extras ?? [],
    notes: item.notes ?? null,
  }));

  const { error: itemsErr } = await svc.from('order_items').insert(orderItemRows);
  if (itemsErr) {
    return NextResponse.json({ error: itemsErr.message }, { status: 500 });
  }

  // Award loyalty points (1 pt per CHF spent, rounded down)
  if (guestId) {
    const points = Math.floor(total);
    // Directly update guest points + lifetime_spent
    const { data: guest } = await svc
      .from('guests')
      .select('points, lifetime_spent')
      .eq('id', guestId)
      .maybeSingle();

    if (guest) {
      await svc.from('guests').update({
        points: (guest.points ?? 0) + points,
        lifetime_spent: (guest.lifetime_spent ?? 0) + total,
        last_visit_at: new Date().toISOString(),
      }).eq('id', guestId);
    }
  }

  return NextResponse.json({ ok: true, order_id: order.id });
}
