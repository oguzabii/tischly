/**
 * Server-side Claude API helper for personalized menu suggestions.
 *
 * Inputs:
 *  - guest's order history (item names + counts)
 *  - full menu (id + name + category + tags)
 *  - language for the reason text
 *
 * Output: array of { item_id, reason, confidence } — typically 3 picks.
 *
 * Cost: ~$0.001 per call with Haiku 4.5 (cached daily per guest).
 */

interface MenuItemForAI {
  id: string;
  name: string;
  category: string;
  tags?: string[];
  price?: number;
}

interface OrderHistoryItem {
  name: string;
  count: number;
}

export interface AISuggestionResult {
  item_id: string;
  reason: string;
  confidence: number;
}

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5';

function buildSystemPrompt(lang: string): string {
  const langName: Record<string, string> = {
    de: 'German', en: 'English', tr: 'Turkish',
    fr: 'French', it: 'Italian', es: 'Spanish',
  };
  return `You are a friendly waiter at a restaurant. Given a guest's order history and the menu, suggest exactly 3 items they would enjoy. For each, give a SHORT reason (max 8 words) in ${langName[lang] ?? 'English'}.

Rules:
- Don't suggest things they've already ordered many times — explore.
- Mix one safe favorite-adjacent pick with two more adventurous ones.
- Reasons are personal ("matches your love for X") not generic.
- Output STRICT JSON only, no prose, no markdown fences.

Format:
{"suggestions":[{"item_id":"<menu id>","reason":"<short reason>","confidence":0.0-1.0}]}`;
}

export async function getAISuggestions(params: {
  apiKey: string;
  lang: string;
  guestName: string;
  orderHistory: OrderHistoryItem[];
  menu: MenuItemForAI[];
}): Promise<AISuggestionResult[]> {
  const { apiKey, lang, guestName, orderHistory, menu } = params;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const userPrompt = `Guest: ${guestName}

Order history (most ordered first):
${
    orderHistory.length === 0
      ? '(no history — first visit)'
      : orderHistory.map((h) => `- ${h.name} (${h.count}x)`).join('\n')
  }

Menu:
${menu.map((m) => `- [${m.id}] ${m.name} (${m.category})${m.tags?.length ? ` [${m.tags.join(', ')}]` : ''}`).join('\n')}

Suggest 3 items.`;

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 400,
      system: buildSystemPrompt(lang),
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Claude API error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };

  const text = (data.content ?? [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('')
    .trim();

  const cleaned = text.replace(/^```(?:json)?\s*|\s*```$/g, '');

  let parsed: { suggestions?: AISuggestionResult[] };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Claude returned non-JSON: ${cleaned.slice(0, 200)}`);
  }

  const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];

  const validIds = new Set(menu.map((m) => m.id));
  return suggestions
    .filter((s) => s && validIds.has(s.item_id))
    .slice(0, 3)
    .map((s) => ({
      item_id: s.item_id,
      reason: String(s.reason ?? '').slice(0, 80),
      confidence: Math.max(0, Math.min(1, Number(s.confidence ?? 0.5))),
    }));
}
