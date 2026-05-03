'use client';

import { useEffect, useState } from 'react';
import { Zap, Hand, BatteryCharging } from 'lucide-react';
import { useRestaurant, useAds } from '@/lib/hooks/useRestaurantData';
import { AdRotator } from './AdRotator';
import type { Lang } from '@/lib/types';

interface IdleScreenProps {
  tableId: string;
  lang: Lang;
  onWake: () => void;
  onChargeRequest: () => void;
}

const FALLBACK_VIDEO_POOL = [
  'https://videos.pexels.com/video-files/3296/3296-uhd_2560_1440_30fps.mp4',
  'https://videos.pexels.com/video-files/4253687/4253687-uhd_2732_1440_25fps.mp4',
  'https://videos.pexels.com/video-files/2620043/2620043-uhd_2560_1440_30fps.mp4',
];

const STRINGS: Record<Lang, { tap: string; charge: string; menu: string; freeCharge: string }> = {
  de: { tap: 'Zum Starten tippen', charge: 'Kostenlos laden',  menu: 'Speisekarte öffnen', freeCharge: 'Kostenloses Aufladen' },
  en: { tap: 'Tap to start',       charge: 'Charge for free',   menu: 'Open menu',          freeCharge: 'Free charging' },
  tr: { tap: 'Başlamak için dokun', charge: 'Ücretsiz şarj et', menu: 'Menüyü aç',          freeCharge: 'Ücretsiz şarj' },
  fr: { tap: 'Touchez pour commencer', charge: 'Recharge gratuite', menu: 'Ouvrir le menu', freeCharge: 'Recharge gratuite' },
  it: { tap: 'Tocca per iniziare', charge: 'Ricarica gratis',  menu: 'Apri il menù',       freeCharge: 'Ricarica gratuita' },
  es: { tap: 'Toca para empezar',  charge: 'Carga gratis',      menu: 'Abrir el menú',      freeCharge: 'Carga gratuita' },
};

export function IdleScreen({ tableId, lang, onWake, onChargeRequest }: IdleScreenProps) {
  const { restaurant } = useRestaurant();
  const { ads } = useAds('idle', restaurant?.id);
  const t = STRINGS[lang];

  const [videoIdx] = useState(() => Math.floor(Math.random() * FALLBACK_VIDEO_POOL.length));
  const videoUrl = restaurant?.idle_video_url || FALLBACK_VIDEO_POOL[videoIdx];

  const [pulse, setPulse] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), 1400);
    return () => clearInterval(id);
  }, []);

  const headline = restaurant?.idle_headline?.[lang] ?? 'Tischly';
  const subline = restaurant?.idle_subline?.[lang] ?? t.tap;
  const brandColor = restaurant?.primary_color ?? '#84CC16';

  return (
    <div
      className="fixed inset-0 z-50 cursor-pointer select-none overflow-hidden"
      onClick={onWake}
    >
      <video
        key={videoUrl}
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />

      {ads.length > 0 && (
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[78%] aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
          <AdRotator ads={ads} tableId={tableId} />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 px-8 pb-12 pt-24 bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="flex items-center gap-3 mb-4">
          {restaurant?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={restaurant.logo_url} alt={restaurant.name} className="h-10 w-auto" />
          ) : (
            <div
              className="h-10 w-10 rounded-xl grid place-items-center text-black font-bold text-xl"
              style={{ background: brandColor }}
            >
              T
            </div>
          )}
          <span className="text-white/80 text-sm">
            {restaurant?.name ?? 'Tischly'} · Table {tableId}
          </span>
        </div>

        <h1 className="text-white text-5xl font-black tracking-tight mb-2">
          {headline}
        </h1>
        <p className="text-white/80 text-xl mb-8">{subline}</p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onWake();
            }}
            className={`flex-1 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-transform ${
              pulse ? 'scale-100' : 'scale-[1.02]'
            }`}
            style={{ background: brandColor, color: '#0F172A' }}
          >
            <Hand className="w-6 h-6" />
            {t.menu}
          </button>

          {restaurant?.charging_enabled !== false && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChargeRequest();
              }}
              className="px-6 py-5 rounded-2xl font-bold text-lg flex items-center gap-2 bg-white/10 backdrop-blur text-white border border-white/20"
            >
              <BatteryCharging className="w-6 h-6" />
              {t.charge}
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-white/50 text-xs">
          <Zap className="w-3 h-3" />
          {t.freeCharge} · powered by Tischly
        </div>
      </div>
    </div>
  );
}
