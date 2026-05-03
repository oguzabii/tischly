import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServiceClient } from '@/lib/supabase-service';

/**
 * Called by /join/[tableId] AFTER the phone completes Supabase Auth.
 *
 * Flow:
 *  1. Validate the phone's bearer token → get auth user
 *  2. Find or create the matching `guests` row
 *  3. Decide role: host if no active host on this table, else companion
 *  4. Insert guest_session with the join_token from the QR
 *  5. The kiosk (already subscribed via realtime) sees the new row
 *     and shows the welcome screen for that guest.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid body' }, { status: 400 });

  const tableId: string = String(body.table_id ?? '');
  const joinToken: string = String(body.join_token ?? '');
  const fallbackName: string = String(body.fallback_name ?? '');

  if (!tableId || !joinToken) {
    return NextResponse.json({ error: 'missing table_id or join_token' }, { status: 400 });
  }

  const authHeader = req.headers.get('authorization') ?? '';
  const accessToken = authHeader.replace(/^Bearer\s+/i, '');
  if (!accessToken) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } },
  );

  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ error: 'auth failed' }, { status: 401 });
  }
  const authUser = userData.user;

  const svc = getServiceClient();

  const { data: restaurant } = await svc
    .from('restaurants')
    .select('id')
    .eq('slug', 'tischly-demo')
    .maybeSingle();

  if (!restaurant) {
    return NextResponse.json({ error: 'restaurant not configured' }, { status: 500 });
  }

  const email = authUser.email ?? '';
  const name =
    ((authUser.user_metadata?.full_name as string | undefined) ??
    (authUser.user_metadata?.name as string | undefined) ??
    fallbackName) ||
    (email ? email.split('@')[0] : 'Guest');

  let { data: guest } = await svc
    .from('guests')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .eq('email', email)
    .maybeSingle();

  if (!guest) {
    const { data: created, error: createErr } = await svc
      .from('guests')
      .insert({
        restaurant_id: restaurant.id,
        auth_user_id: authUser.id,
        email,
        name,
      })
      .select()
      .single();
    if (createErr) {
      return NextResponse.json({ error: createErr.message }, { status: 500 });
    }
    guest = created;
  } else if (!guest.auth_user_id) {
    await svc.from('guests').update({ auth_user_id: authUser.id }).eq('id', guest.id);
  }

  const { data: existingHost } = await svc
    .from('guest_sessions')
    .select('id')
    .eq('table_id', tableId)
    .eq('role', 'host')
    .is('ended_at', null)
    .maybeSingle();

  const role = existingHost ? 'companion' : 'host';

  const { data: existingSelf } = await svc
    .from('guest_sessions')
    .select('id, role')
    .eq('table_id', tableId)
    .eq('guest_id', guest!.id)
    .is('ended_at', null)
    .maybeSingle();

  if (existingSelf) {
    await svc.from('guest_sessions').update({ join_token: joinToken }).eq('id', existingSelf.id);
    return NextResponse.json({ ok: true, guest, role: existingSelf.role });
  }

  const { error: sessErr } = await svc.from('guest_sessions').insert({
    table_id: tableId,
    restaurant_id: restaurant.id,
    guest_id: guest!.id,
    role,
    join_token: joinToken,
  });

  if (sessErr) {
    return NextResponse.json({ error: sessErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, guest, role });
}
