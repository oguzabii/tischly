'use client';

import { useEffect, useRef, useState } from 'react';
import type { Ad } from '@/lib/types';
import { logAdImpression } from '@/lib/hooks/useRestaurantData';

interface AdRotatorProps {
  ads: Ad[];
  tableId: string;
  className?: string;
  fallback?: React.ReactNode;
}

function pickNext(ads: Ad[], previousIdx: number): number {
  if (ads.length === 0) return -1;
  if (ads.length === 1) return 0;

  const totalWeight = ads.reduce((s, a) => s + Math.max(1, a.weight), 0);
  let r = Math.random() * totalWeight;
  for (let i = 0; i < ads.length; i++) {
    r -= Math.max(1, ads[i].weight);
    if (r <= 0) {
      return i === previousIdx && ads.length > 1 ? (i + 1) % ads.length : i;
    }
  }
  return 0;
}

export function AdRotator({ ads, tableId, className, fallback }: AdRotatorProps) {
  const [idx, setIdx] = useState(() => pickNext(ads, -1));
  const [fading, setFading] = useState(false);
  const startRef = useRef<number>(0);

  const current = ads[idx];
  const duration = current?.duration_ms ?? 7000;

  useEffect(() => {
    if (!current) return;
    startRef.current = Date.now();

    const fadeTimer = setTimeout(() => setFading(true), Math.max(duration - 400, 100));
    const swapTimer = setTimeout(() => {
      const elapsed = Date.now() - startRef.current;
      logAdImpression(current.id, tableId, elapsed);
      setIdx((prev) => pickNext(ads, prev));
      setFading(false);
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(swapTimer);
    };
  }, [current, duration, ads, tableId]);

  if (!current) return <>{fallback ?? null}</>;

  return (
    <div className={className ?? 'relative w-full h-full overflow-hidden'}>
      <div
        key={current.id}
        className={`absolute inset-0 transition-opacity duration-500 ${
          fading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {current.kind === 'video' ? (
          <video
            src={current.media_url}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.media_url}
            alt={current.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );
}
