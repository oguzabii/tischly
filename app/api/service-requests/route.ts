import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase-service';

/**
 * POST /api/service-requests
 * Body: { table_id, type: 'callWaiter' | 'requestWater' | 'requestBill' | 'needHelp' }
 *
 * Creates a service request that the admin panel displays in real-time.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid body' }, { status: 400 });

  const tableId: string = String(body.table_id ?? '').trim();
  const type: string    = String(body.type ?? '').trim();

  if (!tableId || !type) {
    return NextResponse.json({ error: 'missing table_id or type' }, { status: 400 });
  }

  const svc = getServiceClient();

  const { data: restaurant } = await svc
    .from('restaurants')
    .select('id')
    .eq('slug', 'tischly-demo')
    .maybeSingle();

  if (!restaurant) {
    return NextResponse.json({ error: 'restaurant not configured' }, { status: 500 });
  }

  const { error } = await svc.from('service_requests').insert({
    restaurant_id: restaurant.id,
    table_id: tableId,
    type,
    status: 'open',
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
