import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid body' }, { status: 400 });

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => toSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        }),
      },
    },
  );

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id')
    .eq('slug', 'tischly-demo')
    .maybeSingle();

  const { error } = await supabase.from('charge_sessions').insert({
    table_id: String(body.table_id ?? ''),
    restaurant_id: restaurant?.id ?? null,
    guest_email: body.guest_email ?? null,
    guest_name: body.guest_name ?? null,
    consent: !!body.consent,
    ends_at: body.ends_at ?? null,
    source: 'qr',
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
