import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase-service';

/**
 * PATCH /api/orders/[id]
 * Body: { status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'paid' | 'cancelled' }
 *
 * Used by the admin panel to advance order status and by the kiosk to mark as paid.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.status) return NextResponse.json({ error: 'missing status' }, { status: 400 });

  const svc = getServiceClient();

  const { error } = await svc
    .from('orders')
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
