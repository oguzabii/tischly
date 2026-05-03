'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Hand, BatteryCharging } from 'lucide-react';
import { useRestaurant, useAds, logAdImpression } from '@/lib/hooks/useRestaurantData';
import type { Ad, Lang } from '@/lib/types';

interface IdleScreenProps {
  tableId: string;
  lang: Lang;
  onWake: () => void;
  onChargeRequest: () => void;
}

// Fallback media pool used when no ads are configured in Supabase
// Mix of videos and images so the slideshow is varied out of the box
const FALLBACK_POOL: { url: string; kind: 'video' | 'image'; duration: number }[] = [
  { url: 'https://videos.pexels.com/video-files/3296/3296-uhd_2560_1440_30fps.mp4',    kind: 'video', duration: 9000 },
  { url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&w=1920', kind: 'image', duration: 7000 },
  { url: 'https://videos.pexels.com/video-files/2620043/2620043-uhd_2560_1440_30fps.mp4', kind: 'video', duration: 9000 },
  { url: 'https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg?auto=compress&w=1920', kind: 'image', duration: 7000 },
  { url: 'https://videos.pexels.com/video-files/4253687/4253687-uhd_2732_1440_25fps.mp4', kind: 'video', duration: 9000 },
  { url: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&w=1920',   kind: 'image', duration: 7000 },
];

function toFallbackAds(): Ad[] {
  return FALLBACK_POOL.map((item, i) => ({
    id: `fallback-${i}`,
    restaurant_id: '',
    title: 'Demo',
    kind: item.kind,
    media_url: item.url,
    click_url: null,
    placement: 'idle' as const,
    duration_ms: item.duration,
    weight: 1,
    active: true,
    starts_at: new Date().toISOString(),
    ends_at: null,
  }));
}

// ── Full-screen background slideshow ─────────────────────────────────────────
function BackgroundSlideshow({ ads, tableId }: { ads: Ad[]; tableId: string }) {
  const [idx, setIdx]       = useState(0);
  const [visible, setVisible] = useState(true); // true = current is fully visible
  const startRef            = useRef(Date.now());

  const current = ads[idx];
  const duration = current?.duration_ms ?? 8000;

  useEffect(() => {
    if (!current) return;
    startRef.current = Date.now();

    // Start fade-out 600ms before swap
    const fadeTimer = setTimeout(() => setVisible(false), Math.max(duration - 600, 300));

    // Swap slide
    const swapTimer = setTimeout(() => {
      logAdImpression(current.id, tableId, Date.now() - startRef.current).catch(() => {});
      setIdx(prev => (prev + 1) % ads.length);
      setVisible(true);
    }, duration);

    return () => { clearTimeout(fadeTimer); clearTimeout(swapTimer); };
  }, [idx, current, duration, ads.length, tableId]);

  if (!current) return null;

  return (
    <div className="absolute inset-0">
      {/* Current slide */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {current.kind === 'video' ? (
          <video
            key={current.id}
            src={current.media_url}
            autoPlay muted loop playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={current.id}
            src={current.media_url}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Preload next slide (hidden, so video starts loading) */}
      {ads.length > 1 && (() => {
        const next = ads[(idx + 1) % ads.length];
        if (next.kind === 'video') return (
          <video key={`pre-${next.id}`} src={next.media_url} muted playsInline
            className="absolute opacity-0 pointer-events-none w-px h-px" />
        );
        return null;
      })()}

      {/* Slide indicator dots */}
      {ads.length > 1 && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {ads.map((_, i) => (
            <div key={i}
              className={`rounded-full transition-all duration-500 ${
                i === idx
                  ? 'w-5 h-1.5 bg-white'
                  : 'w-1.5 h-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Strings ───────────────────────────────────────────────────────────────────
const STRINGS: Record<Lang, { tap: string; charge: string; menu: string; freeCharge: string }> = {
  de: { tap: 'Zum Starten tippen', charge: 'Kostenlos laden',     menu: 'Speisekarte öffnen', freeCharge: 'Kostenloses Aufladen' },
  en: { tap: 'Tap to start',       charge: 'Charge for free',     menu: 'Open menu',           freeCharge: 'Free charging' },
  tr: { tap: 'Başlamak için dokun', charge: 'Ücretsiz şarj et',   menu: 'Menüyü aç',           freeCharge: 'Ücretsiz şarj' },
  fr: { tap: 'Touchez pour commencer', charge: 'Recharge gratuite', menu: 'Ouvrir le menu',    freeCharge: 'Recharge gratuite' },
  it: { tap: 'Tocca per iniziare', charge: 'Ricarica gratis',     menu: 'Apri il menù',        freeCharge: 'Ricarica gratuita' },
  es: { tap: 'Toca para empezar',  charge: 'Carga gratis',         menu: 'Abrir el menú',      freeCharge: 'Carga gratuita' },
};

// ── Main component ────────────────────────────────────────────────────────────
export function IdleScreen({ tableId, lang, onWake, onChargeRequest }: IdleScreenProps) {
  const { restaurant } = useRestaurant();
  const { ads } = useAds('idle', restaurant?.id);

  const [pulse, setPulse] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setPulse(p => !p), 1400);
    return () => clearInterval(id);
  }, []);

  const t          = STRINGS[lang];
  const headline   = restaurant?.idle_headline?.[lang] ?? 'Tischly';
  const subline    = restaurant?.idle_subline?.[lang]  ?? t.tap;
  const brandColor = restaurant?.primary_color ?? '#84CC16';

  // Use real ads if available, else fall back to demo pool
  const playlist = ads.length > 0 ? ads : toFallbackAds();

  return (
    <div
      className="fixed inset-0 z-50 cursor-pointer select-none overflow-hidden"
      onClick={onWake}
    >
      {/* Full-screen background slideshow */}
      <BackgroundSlideshow ads={playlist} tableId={tableId} />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/85 pointer-events-none" />

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 px-8 pb-10 pt-20">
        {/* Restaurant badge */}
        <div className="flex items-center gap-3 mb-5">
          {restaurant?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={restaurant.logo_url} alt={restaurant.name} className="h-10 w-auto" />
          ) : (
            <div
              className="h-10 w-10 rounded-xl grid place-items-center text-black font-bold text-xl flex-shrink-0"
              style={{ background: brandColor }}
            >
              T
            </div>
          )}
          <span className="text-white/80 text-sm font-medium">
            {restaurant?.name ?? 'Tischly'} · Tisch {tableId}
          </span>
        </div>

        <h1 className="text-white text-5xl font-black tracking-tight mb-2">
          {headline}
        </h1>
        <p className="text-white/80 text-xl mb-8">{subline}</p>

        {/* CTA buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onWake(); }}
            className={`flex-1 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-transform active:scale-95 ${
              pulse ? 'scale-100' : 'scale-[1.015]'
            }`}
            style={{ background: brandColor, color: '#0F172A' }}
          >
            <Hand className="w-6 h-6" />
            {t.menu}
          </button>

          {restaurant?.charging_enabled !== false && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChargeRequest(); }}
              className="px-6 py-5 rounded-2xl font-bold text-lg flex items-center gap-2 bg-white/10 backdrop-blur text-white border border-white/20 active:scale-95 transition-transform"
            >
              <BatteryCharging className="w-6 h-6" />
              {t.charge}
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-white/40 text-xs">
          <Zap className="w-3 h-3" />
          {t.freeCharge} · powered by Tischly
        </div>
      </div>
    </div>
  );
}
