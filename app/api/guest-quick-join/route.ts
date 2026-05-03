import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase-service';

/**
 * Guest quick-join — no Supabase Auth required.
 * The guest enters just their name on the phone; we create (or find)
 * a guest row using a synthetic email and immediately bind the session.
 *
 * Body: { table_id, join_token, name }
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid body' }, { status: 400 });

  const tableId: string  = String(body.table_id  ?? '').trim();
  const joinToken: string = String(body.join_token ?? '').trim();
  const name: string     = String(body.name        ?? '').trim();

  if (!tableId || !joinToken || !name) {
    return NextResponse.json({ error: 'missing table_id, join_token, or name' }, { status: 400 });
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

  // Synthetic email so the guests table unique-email constraint is satisfied
  // but no real auth account is needed
  const syntheticEmail = `guest_${joinToken}@tischly-guest.local`;

  const { data: created, error: createErr } = await svc
    .from('guests')
    .insert({
      restaurant_id: restaurant.id,
      email: syntheticEmail,
      name,
    })
    .select()
    .single();

  if (createErr) {
    return NextResponse.json({ error: createErr.message }, { status: 500 });
  }

  const guest = created;

  // Decide role
  const { data: existingHost } = await svc
    .from('guest_sessions')
    .select('id')
    .eq('table_id', tableId)
    .eq('role', 'host')
    .is('ended_at', null)
    .maybeSingle();

  const role = existingHost ? 'companion' : 'host';

  const { error: sessErr } = await svc.from('guest_sessions').insert({
    table_id: tableId,
    restaurant_id: restaurant.id,
    guest_id: guest.id,
    role,
    join_token: joinToken,
  });

  if (sessErr) {
    return NextResponse.json({ error: sessErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, guest, role });
}
