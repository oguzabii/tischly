'use client';

import { useEffect, useRef, useState } from 'react';

const EVENTS = ['mousedown', 'touchstart', 'keydown', 'scroll'];

/**
 * Returns `true` after `idleMs` of no interaction.
 * Reset to false the moment the user touches anything.
 */
export function useIdleTimer(idleMs = 90_000) {
  const [idle, setIdle] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function reset() {
      if (timer.current) clearTimeout(timer.current);
      setIdle(false);
      timer.current = setTimeout(() => setIdle(true), idleMs);
    }

    EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      EVENTS.forEach((e) => window.removeEventListener(e, reset));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [idleMs]);

  return idle;
}
