'use client';

import { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import type { Lang, Guest, LoyaltyConfig } from '@/lib/types';
import { pointsToCHF } from '@/lib/types';

interface Props {
  guest: Guest;
  config: LoyaltyConfig;
  orderTotal: number;
  lang: Lang;
  onChange: (pointsToUse: number, discountCHF: number) => void;
}

const STRINGS: Record<Lang, { use: string; saved: string; min: string; max: string; none: string }> = {
  de: { use: 'Punkte einlösen', saved: 'gespart', min: 'Minimum 100',  max: 'Max', none: 'Keine Punkte einlösen' },
  en: { use: 'Use points',       saved: 'saved',   min: 'Min 100',      max: 'Max', none: 'Don\'t use points' },
  tr: { use: 'Puan kullan',      saved: 'tasarruf',min: 'Min 100',      max: 'Maks', none: 'Puan kullanma' },
  fr: { use: 'Utiliser points',  saved: 'économisé',min: 'Min 100',     max: 'Max', none: 'Ne pas utiliser' },
  it: { use: 'Usa punti',        saved: 'risparmiato',min: 'Min 100',   max: 'Max', none: 'Non usare punti' },
  es: { use: 'Usar puntos',      saved: 'ahorrado', min: 'Mín 100',     max: 'Máx', none: 'No usar puntos' },
};

export function PointsRedemption({ guest, config, orderTotal, lang, onChange }: Props) {
  const t = STRINGS[lang];
  const [points, setPoints] = useState(0);

  const minPts = config.redeem_min_points;
  const rate = config.redeem_rate;
  const maxByBalance = guest.points;
  const maxByOrder = Math.floor(orderTotal / rate);
  const maxPts = Math.floor(Math.min(maxByBalance, maxByOrder) / 100) * 100;

  const canRedeem = guest.points >= minPts;

  useEffect(() => {
    onChange(points, pointsToCHF(points, rate));
  }, [points, rate, onChange]);

  if (!canRedeem) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-sm text-white/60">
        <div className="flex items-center gap-2 mb-1">
          <Coins className="w-4 h-4 text-lime-400" />
          <span className="font-semibold text-white">{guest.points} pts</span>
        </div>
        {t.min} {minPts} pts to redeem · {minPts - guest.points} more to go
      </div>
    );
  }

  const discount = pointsToCHF(points, rate);

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Coins className="w-4 h-4 text-lime-400" />
          <span>{t.use}</span>
        </div>
        <div className="text-right">
          <div className="font-bold text-lime-400">−{discount.toFixed(2)} CHF</div>
          {points > 0 && <div className="text-xs text-white/50">{points} pts</div>}
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={maxPts}
        step={100}
        value={points}
        onChange={(e) => setPoints(Number(e.target.value))}
        className="w-full accent-lime-400"
      />

      <div className="flex justify-between text-xs text-white/50">
        <button
          type="button"
          onClick={() => setPoints(0)}
          className={`underline-offset-2 ${points === 0 ? 'text-white' : 'hover:underline'}`}
        >
          {t.none}
        </button>
        <button
          type="button"
          onClick={() => setPoints(maxPts)}
          className={`underline-offset-2 ${points === maxPts ? 'text-white' : 'hover:underline'}`}
        >
          {t.max}: {maxPts} pts
        </button>
      </div>
    </div>
  );
}
