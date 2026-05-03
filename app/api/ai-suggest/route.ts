import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase-service';
import { getAISuggestions } from '@/lib/ai/claudeRecommend';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  tags?: string[];
  price?: number;
}

/**
 * POST /api/ai-suggest
 * body: { guest_id, lang, menu: MenuItem[] }
 *
 * Returns cached suggestions if < 24h old, else calls Claude Haiku.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid body' }, { status: 400 });

  const guestId = String(body.guest_id ?? '');
  const lang = String(body.lang ?? 'en');
  const menu = (body.menu ?? []) as MenuItem[];

  if (!guestId || !Array.isArray(menu) || menu.length === 0) {
    return NextResponse.json({ error: 'missing guest_id or menu' }, { status: 400 });
  }

  const svc = getServiceClient();

  const { data: cached } = await svc
    .from('ai_suggestions_cache')
    .select('*')
    .eq('guest_id', guestId)
    .maybeSingle();

  if (cached && new Date(cached.expires_at as string) > new Date()) {
    return NextResponse.json({ suggestions: cached.suggestions, cached: true });
  }

  const { data: guest } = await svc
    .from('guests')
    .select('id, name, restaurant_id')
    .eq('id', guestId)
    .maybeSingle();

  if (!guest) {
    return NextResponse.json({ error: 'guest not found' }, { status: 404 });
  }

  const { data: cfg } = await svc
    .from('loyalty_config')
    .select('ai_recommendations')
    .eq('restaurant_id', guest.restaurant_id)
    .maybeSingle();

  if (!cfg?.ai_recommendations) {
    return NextResponse.json({ suggestions: [], cached: false, disabled: true });
  }

  const { data: favs } = await svc
    .from('guest_favorites')
    .select('item_id, order_count')
    .eq('guest_id', guestId)
    .order('order_count', { ascending: false })
    .limit(20);

  const menuById = new Map(menu.map((m) => [m.id, m]));
  const orderHistory = (favs ?? [])
    .map((f) => ({
      name: menuById.get(f.item_id as string)?.name ?? f.item_id,
      count: f.order_count as number,
    }))
    .filter((h) => !!h.name);

  let suggestions;
  try {
    suggestions = await getAISuggestions({
      apiKey: process.env.ANTHROPIC_API_KEY ?? '',
      lang,
      guestName: guest.name,
      orderHistory,
      menu,
    });
  } catch (e) {
    console.error('[ai-suggest]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'ai failed' },
      { status: 500 },
    );
  }

  await svc.from('ai_suggestions_cache').upsert({
    guest_id: guestId,
    suggestions,
    generated_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });

  return NextResponse.json({ suggestions, cached: false });
}
