'use client';

/**
 * Subtle live background — animated mesh gradient + floating blobs.
 * Renders behind whatever you wrap. Pure CSS, no JS animation cost.
 */
import type { ReactNode } from 'react';

type Variant = 'menu' | 'cart' | 'service' | 'payment';

const VARIANTS: Record<Variant, { from: string; via: string; to: string; blobs: string[] }> = {
  menu:    { from: '#0F172A', via: '#1E293B', to: '#0F172A', blobs: ['#84CC16', '#22D3EE', '#84CC16'] },
  cart:    { from: '#1E1B4B', via: '#0F172A', to: '#1E1B4B', blobs: ['#A78BFA', '#84CC16', '#F472B6'] },
  service: { from: '#0F172A', via: '#082F49', to: '#0F172A', blobs: ['#22D3EE', '#84CC16', '#22D3EE'] },
  payment: { from: '#0F172A', via: '#1E293B', to: '#000',    blobs: ['#84CC16', '#FBBF24', '#84CC16'] },
};

interface Props {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

export function AnimatedBackground({ variant = 'menu', children, className }: Props) {
  const v = VARIANTS[variant];
  return (
    <div
      className={`relative min-h-screen overflow-hidden ${className ?? ''}`}
      style={{ background: `linear-gradient(135deg, ${v.from}, ${v.via}, ${v.to})` }}
    >
      <div
        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl tischly-blob-a"
        style={{ background: v.blobs[0] }}
      />
      <div
        className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl tischly-blob-b"
        style={{ background: v.blobs[1] }}
      />
      <div
        className="absolute -bottom-40 left-1/4 w-[450px] h-[450px] rounded-full opacity-25 blur-3xl tischly-blob-c"
        style={{ background: v.blobs[2] }}
      />

      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence baseFrequency=%220.9%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>")',
        }}
      />

      <div className="relative z-10">{children}</div>

      <style jsx>{`
        .tischly-blob-a { animation: blob-a 18s ease-in-out infinite; }
        .tischly-blob-b { animation: blob-b 22s ease-in-out infinite; }
        .tischly-blob-c { animation: blob-c 26s ease-in-out infinite; }
        @keyframes blob-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(60px, 40px) scale(1.15); }
        }
        @keyframes blob-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(-80px, 60px) scale(0.9); }
        }
        @keyframes blob-c {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(40px, -50px) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
