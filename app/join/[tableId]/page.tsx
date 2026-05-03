'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { CheckCircle2, Loader2, AlertCircle, Mail, UserRound } from 'lucide-react';

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

type Step = 'auth' | 'binding' | 'done' | 'error';

/** Inner component — allowed to call useSearchParams() because it's inside <Suspense> */
function JoinPageInner() {
  const params    = useParams<{ tableId: string }>();
  const search    = useSearchParams();
  const tableId   = params.tableId;
  const token     = search.get('token') ?? '';
  const lang      = search.get('lang') ?? 'en';

  const [step, setStep]             = useState<Step>('auth');
  const [error, setError]           = useState('');
  const [email, setEmail]           = useState('');
  const [magicSent, setMagicSent]   = useState(false);
  const [showEmail, setShowEmail]   = useState(false);

  // Recover name that was stored before the OAuth / magic-link redirect
  const [name, setName] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('tischly_pending_name') ?? '';
    }
    return '';
  });

  // If Supabase already has a session (e.g. returned from OAuth redirect), bind it
  useEffect(() => {
    const supabase = getClient();
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      const resolvedName = name ||
        data.session.user.user_metadata?.full_name as string ||
        data.session.user.user_metadata?.name as string ||
        data.session.user.email?.split('@')[0] ||
        'Guest';

      setStep('binding');
      try {
        const res = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.session.access_token}`,
          },
          body: JSON.stringify({
            table_id: tableId,
            join_token: token,
            fallback_name: resolvedName,
          }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || 'Failed to connect to table');
        }
        window.localStorage.removeItem('tischly_pending_name');
        setStep('done');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
        setStep('error');
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId, token]);

  // ── Quick guest join (no auth required) ──────────────────────────────────
  async function quickJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setStep('binding');
    try {
      const res = await fetch('/api/guest-quick-join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table_id: tableId, join_token: token, name: name.trim() }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Failed to connect to table');
      }
      setStep('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setStep('error');
    }
  }

  // ── OAuth ─────────────────────────────────────────────────────────────────
  async function signIn(provider: 'google' | 'apple') {
    const supabase   = getClient();
    const redirectTo = `${window.location.origin}/join/${tableId}?token=${token}&lang=${lang}`;
    if (name) window.localStorage.setItem('tischly_pending_name', name);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (err) { setError(err.message); setStep('error'); }
  }

  // ── Magic link ────────────────────────────────────────────────────────────
  async function signInMagic(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !name) return;
    const supabase   = getClient();
    const redirectTo = `${window.location.origin}/join/${tableId}?token=${token}&lang=${lang}`;
    window.localStorage.setItem('tischly_pending_name', name);
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, data: { name } },
    });
    if (err) { setError(err.message); return; }
    setMagicSent(true);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-lime-400 grid place-items-center text-slate-900 font-black text-xl">T</div>
            <span className="text-2xl font-bold">Tischly</span>
          </div>
          <p className="text-white/60 text-sm">Table {tableId}</p>
        </div>

        {/* Sign-in form */}
        {step === 'auth' && !magicSent && (
          <div className="space-y-3">
            <h1 className="text-2xl font-bold mb-1">Join the table</h1>
            <p className="text-white/60 text-sm mb-6">
              Earn 1 point per CHF spent · 100 points = 1 CHF off
            </p>

            {/* Name field (shared across all methods) */}
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-lime-400 outline-none text-base"
            />

            {/* ── Quick guest join (primary CTA) ── */}
            <form onSubmit={quickJoin}>
              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full py-4 rounded-xl bg-lime-400 text-slate-900 font-bold text-lg flex items-center justify-center gap-2 active:opacity-80 disabled:opacity-40"
              >
                <UserRound className="w-5 h-5" />
                Continue as Guest
              </button>
            </form>

            <div className="flex items-center gap-3 my-2 text-white/40 text-xs">
              <div className="flex-1 h-px bg-white/10" />
              or sign in for full account
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* OAuth buttons */}
            <button
              onClick={() => signIn('google')}
              className="w-full py-3.5 rounded-xl bg-white/10 border border-white/10 text-white font-semibold flex items-center justify-center gap-3 active:opacity-80 text-sm"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC04" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09 0-.73.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button
              onClick={() => signIn('apple')}
              className="w-full py-3.5 rounded-xl bg-white/10 border border-white/10 text-white font-semibold flex items-center justify-center gap-3 active:opacity-80 text-sm"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Continue with Apple
            </button>

            {/* Email magic link (collapsed by default) */}
            {!showEmail ? (
              <button
                onClick={() => setShowEmail(true)}
                className="w-full py-3 text-white/50 text-sm underline underline-offset-2 active:opacity-70"
              >
                Use email instead
              </button>
            ) : (
              <form onSubmit={signInMagic} className="space-y-2 pt-1">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-lime-400 outline-none text-base"
                />
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-white/10 text-white font-semibold flex items-center justify-center gap-2 active:opacity-80 text-sm"
                >
                  <Mail className="w-4 h-4" />
                  Email me a sign-in link
                </button>
              </form>
            )}

            <p className="text-xs text-white/30 mt-4 text-center">
              By continuing you agree to our Privacy Policy.
            </p>
          </div>
        )}

        {/* Magic link sent */}
        {step === 'auth' && magicSent && (
          <div className="text-center space-y-4">
            <Mail className="w-16 h-16 mx-auto text-lime-400" />
            <h1 className="text-2xl font-bold">Check your inbox</h1>
            <p className="text-white/60">
              We sent a sign-in link to <strong className="text-white">{email}</strong>.
              Tap it on this phone — you&apos;ll come right back here.
            </p>
          </div>
        )}

        {/* Binding */}
        {step === 'binding' && (
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-lime-400" />
            <p className="text-white/70">Connecting you to table {tableId}…</p>
          </div>
        )}

        {/* Done */}
        {step === 'done' && (
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 mx-auto text-lime-400" />
            <h1 className="text-2xl font-bold">You&apos;re in!</h1>
            <p className="text-white/60">
              Your table is ready. You can put your phone away —
              everything happens on the tablet.
            </p>
          </div>
        )}

        {/* Error */}
        {step === 'error' && (
          <div className="text-center space-y-4">
            <AlertCircle className="w-16 h-16 mx-auto text-red-400" />
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-white/60 text-sm">{error}</p>
            <button
              onClick={() => { setError(''); setStep('auth'); }}
              className="mt-4 px-5 py-3 rounded-xl bg-white/10 active:bg-white/20 font-medium"
            >
              Try again
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

/** Suspense boundary required because JoinPageInner calls useSearchParams() */
export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-lime-400" />
        </div>
      }
    >
      <JoinPageInner />
    </Suspense>
  );
}
