'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Heart, Loader2 } from 'lucide-react';
import type { Lang, AiSuggestion, Guest } from '@/lib/types';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price?: number;
  image?: string;
  tags?: string[];
}

interface Props {
  guest: Guest;
  menu: MenuItem[];
  lang: Lang;
  onAddToCart: (itemId: string) => void;
}

const STRINGS: Record<Lang, { aiPick: string; favorite: string; aiSubtitle: string; loading: string; add: string }> = {
  de: { aiPick: 'Für dich ausgewählt',  favorite: 'Dein Favorit', aiSubtitle: 'AI-Empfehlung',     loading: 'Empfehlungen werden geladen…', add: 'Hinzufügen' },
  en: { aiPick: 'Picked for you',       favorite: 'Your favorite', aiSubtitle: 'AI recommendation',  loading: 'Loading recommendations…',     add: 'Add' },
  tr: { aiPick: 'Sana özel',             favorite: 'En sevdiğin',  aiSubtitle: 'AI önerisi',         loading: 'Öneriler yükleniyor…',         add: 'Ekle' },
  fr: { aiPick: 'Pour vous',             favorite: 'Votre favori', aiSubtitle: 'Recommandation IA',  loading: 'Chargement des suggestions…',  add: 'Ajouter' },
  it: { aiPick: 'Per te',                favorite: 'Il tuo preferito', aiSubtitle: 'Consiglio IA',  loading: 'Caricamento suggerimenti…',     add: 'Aggiungi' },
  es: { aiPick: 'Para ti',               favorite: 'Tu favorito',  aiSubtitle: 'Recomendación IA',   loading: 'Cargando recomendaciones…',     add: 'Añadir' },
};

export function PersonalizedRecommendations({ guest, menu, lang, onAddToCart }: Props) {
  const t = STRINGS[lang];
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/ai-suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guest_id: guest.id, lang, menu }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    fetch(`/api/guest-favorites?guest_id=${guest.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setFavorites(Array.isArray(data.favorites) ? data.favorites : []);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [guest.id, lang, menu]);

  const itemById = new Map(menu.map((m) => [m.id, m]));

  const favSet = new Set(favorites);
  const aiPicks = suggestions.filter((s) => !favSet.has(s.item_id));

  if (favorites.length === 0 && suggestions.length === 0 && !loading) return null;

  return (
    <section className="mb-6">
      <header className="px-4 mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-lime-400" />
        <h2 className="text-lg font-bold">{t.aiPick}</h2>
      </header>

      {loading && (
        <div className="px-4 py-8 flex items-center gap-2 text-white/60 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          {t.loading}
        </div>
      )}

      <div className="overflow-x-auto px-4 -mx-4">
        <div className="flex gap-3 px-4 pb-2 snap-x">
          {favorites.map((id) => {
            const item = itemById.get(id);
            if (!item) return null;
            return (
              <RecCard
                key={`fav-${id}`}
                item={item}
                badgeIcon={<Heart className="w-3 h-3 fill-current" />}
                badgeText={t.favorite}
                badgeColor="bg-pink-500/90 text-white"
                reason={null}
                addLabel={t.add}
                onAdd={() => onAddToCart(id)}
              />
            );
          })}

          {aiPicks.map((s) => {
            const item = itemById.get(s.item_id);
            if (!item) return null;
            return (
              <RecCard
                key={`ai-${s.item_id}`}
                item={item}
                badgeIcon={<Sparkles className="w-3 h-3" />}
                badgeText={t.aiSubtitle}
                badgeColor="bg-lime-400 text-slate-900"
                reason={s.reason}
                addLabel={t.add}
                onAdd={() => onAddToCart(s.item_id)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

interface RecCardProps {
  item: MenuItem;
  badgeIcon: React.ReactNode;
  badgeText: string;
  badgeColor: string;
  reason: string | null;
  addLabel: string;
  onAdd: () => void;
}

function RecCard({ item, badgeIcon, badgeText, badgeColor, reason, addLabel, onAdd }: RecCardProps) {
  return (
    <div className="snap-start shrink-0 w-56 rounded-2xl bg-white/5 border border-white/10 overflow-hidden backdrop-blur">
      <div className="aspect-square bg-slate-800 relative">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-4xl">🍽️</div>
        )}
        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${badgeColor}`}>
          {badgeIcon}
          {badgeText}
        </div>
      </div>
      <div className="p-3">
        <div className="font-semibold text-sm leading-tight mb-1 line-clamp-1">{item.name}</div>
        {reason && <div className="text-xs text-white/60 mb-2 line-clamp-2 italic">&quot;{reason}&quot;</div>}
        <div className="flex items-center justify-between mt-2">
          {typeof item.price === 'number' ? (
            <span className="font-bold text-lime-400">{item.price.toFixed(2)} CHF</span>
          ) : <span />}
          <button
            onClick={onAdd}
            className="px-3 py-1.5 rounded-lg bg-lime-400 text-slate-900 text-xs font-bold"
          >
            {addLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
