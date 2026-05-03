'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Sparkles, UserPlus, UserRound, Loader2 } from 'lucide-react';
import { useGuestSessions, newJoinToken } from '@/lib/hooks/useGuestSession';
import type { Lang } from '@/lib/types';

interface AuthQRScreenProps {
  tableId: string;
  lang: Lang;
  hostName?: string | null;
  onClose: () => void;
  onAuthenticated: () => void;
}

const STRINGS: Record<Lang, {
  loginTitle: string; loginSub: string;
  joinTitle: string; joinSub: string;
  scanWith: string; waitingFor: string; thanks: string; close: string; firstTime: string; existing: string;
  quickLogin: string; namePlaceholder: string; startBtn: string; orScan: string;
}> = {
  de: { loginTitle: 'Willkommen bei Tischly', loginSub: 'Scanne den QR-Code oder gib deinen Namen ein',
        joinTitle: 'Mit am Tisch', joinSub: 'Scanne den QR-Code, um dich der Runde anzuschließen',
        scanWith: 'Scanne mit deiner Handykamera', waitingFor: 'Warte auf Anmeldung…',
        thanks: 'Willkommen zurück', close: 'Schließen',
        firstTime: 'Neu hier? Punkte sammeln & Vorteile genießen.',
        existing: 'Schon dabei? Wir erkennen dich sofort.',
        quickLogin: 'Direkt hier einloggen', namePlaceholder: 'Dein Name', startBtn: 'Loslegen', orScan: 'oder QR mit dem Handy scannen' },
  en: { loginTitle: 'Welcome to Tischly', loginSub: 'Type your name or scan the QR code',
        joinTitle: 'Join the table', joinSub: 'Scan the QR code to join your group',
        scanWith: 'Scan with your phone camera', waitingFor: 'Waiting for sign-in…',
        thanks: 'Welcome back', close: 'Close',
        firstTime: 'New here? Earn points and unlock perks.',
        existing: 'Already a member? We recognize you instantly.',
        quickLogin: 'Quick login here', namePlaceholder: 'Your name', startBtn: 'Let\'s go', orScan: 'or scan QR with your phone' },
  tr: { loginTitle: 'Tischly\'ye hoş geldin', loginSub: 'Adını yaz veya QR\'ı tara',
        joinTitle: 'Masaya katıl', joinSub: 'Gruba katılmak için QR\'ı tara',
        scanWith: 'Telefonunun kamerasıyla tara', waitingFor: 'Giriş bekleniyor…',
        thanks: 'Tekrar hoş geldin', close: 'Kapat',
        firstTime: 'Yeni misin? Puan kazan, ayrıcalıkların tadını çıkar.',
        existing: 'Üye misin? Seni anında tanırız.',
        quickLogin: 'Buradan hızlı giriş', namePlaceholder: 'Adın', startBtn: 'Başla', orScan: 'ya da telefonla QR tara' },
  fr: { loginTitle: 'Bienvenue chez Tischly', loginSub: 'Entrez votre nom ou scannez le QR',
        joinTitle: 'Rejoindre la table', joinSub: 'Scannez le QR pour rejoindre le groupe',
        scanWith: 'Scannez avec votre téléphone', waitingFor: 'En attente de connexion…',
        thanks: 'Bon retour', close: 'Fermer',
        firstTime: 'Nouveau ? Gagnez des points et débloquez des avantages.',
        existing: 'Déjà membre ? Nous vous reconnaissons.',
        quickLogin: 'Connexion rapide ici', namePlaceholder: 'Votre prénom', startBtn: 'Allons-y', orScan: 'ou scanner le QR avec votre téléphone' },
  it: { loginTitle: 'Benvenuto in Tischly', loginSub: 'Inserisci il tuo nome o scansiona il QR',
        joinTitle: 'Unisciti al tavolo', joinSub: 'Scansiona il QR per unirti al gruppo',
        scanWith: 'Scansiona col telefono', waitingFor: 'In attesa del login…',
        thanks: 'Bentornato', close: 'Chiudi',
        firstTime: 'Nuovo? Guadagna punti e sblocca vantaggi.',
        existing: 'Già membro? Ti riconosciamo subito.',
        quickLogin: 'Accesso rapido qui', namePlaceholder: 'Il tuo nome', startBtn: 'Iniziamo', orScan: 'o scansiona il QR col telefono' },
  es: { loginTitle: 'Bienvenido a Tischly', loginSub: 'Escribe tu nombre o escanea el QR',
        joinTitle: 'Únete a la mesa', joinSub: 'Escanea el QR para unirte al grupo',
        scanWith: 'Escanea con tu móvil', waitingFor: 'Esperando inicio de sesión…',
        thanks: 'Bienvenido de nuevo', close: 'Cerrar',
        firstTime: '¿Nuevo? Gana puntos y desbloquea ventajas.',
        existing: '¿Ya eres miembro? Te reconocemos al instante.',
        quickLogin: 'Acceso rápido aquí', namePlaceholder: 'Tu nombre', startBtn: 'Vamos', orScan: 'o escanea el QR con tu móvil' },
};

export function AuthQRScreen({ tableId, lang, hostName, onClose, onAuthenticated }: AuthQRScreenProps) {
  const t = STRINGS[lang];
  const [token] = useState(() => newJoinToken());
  const { sessions } = useGuestSessions(tableId);

  // Quick-login state (direct name entry on the tablet)
  const [name, setName]         = useState('');
  const [joining, setJoining]   = useState(false);
  const [joinError, setJoinError] = useState('');
  const [showQR, setShowQR]     = useState(false);
  const inputRef                = useRef<HTMLInputElement>(null);

  const joinUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/join/${tableId}?token=${token}&lang=${lang}`;
  }, [tableId, token, lang]);

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(joinUrl)}`;

  // Watch for phone-based sign-in (QR flow)
  useEffect(() => {
    const matched = sessions.find((s) => s.join_token === token);
    if (matched?.guest) {
      onAuthenticated();
    }
  }, [sessions, token, onAuthenticated]);

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  async function handleQuickJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setJoining(true);
    setJoinError('');
    try {
      const res = await fetch('/api/guest-quick-join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table_id: tableId, join_token: token, name: name.trim() }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Failed');
      }
      onAuthenticated();
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Error');
      setJoining(false);
    }
  }

  const isCompanion = !!hostName;
  const title = isCompanion ? t.joinTitle : t.loginTitle;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 text-white flex flex-col">
      <header className="px-6 py-4 flex items-center gap-3 border-b border-white/10">
        <button onClick={onClose} className="p-2 -ml-2 rounded-lg active:bg-white/10">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          {isCompanion ? <UserPlus className="w-5 h-5 text-lime-400" /> : <Sparkles className="w-5 h-5 text-lime-400" />}
          {title}
        </h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-6">

        {hostName && (
          <p className="text-lime-400 text-center">
            👋 {hostName} — {t.existing}
          </p>
        )}

        {/* ── Quick login form (primary, directly on tablet) ── */}
        <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-lime-400 font-semibold">
            <UserRound className="w-5 h-5" />
            {t.quickLogin}
          </div>

          <form onSubmit={handleQuickJoin} className="space-y-3">
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-lime-400 outline-none text-lg text-white placeholder-white/30"
            />
            {joinError && (
              <p className="text-red-400 text-sm">{joinError}</p>
            )}
            <button
              type="submit"
              disabled={!name.trim() || joining}
              className="w-full py-4 rounded-xl bg-lime-400 text-slate-900 font-bold text-lg flex items-center justify-center gap-2 active:opacity-80 disabled:opacity-40 transition-opacity"
            >
              {joining
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <><Sparkles className="w-5 h-5" /> {t.startBtn}</>
              }
            </button>
          </form>
        </div>

        {/* ── QR section (collapsible, secondary) ── */}
        <div className="w-full max-w-sm text-center">
          <button
            onClick={() => setShowQR(v => !v)}
            className="text-white/40 text-sm underline underline-offset-2 active:text-white/60"
          >
            {showQR ? '▲ QR ausblenden' : `▼ ${t.orScan}`}
          </button>

          {showQR && (
            <div className="mt-4 flex flex-col items-center gap-3">
              <div className="bg-white p-3 rounded-2xl shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrSrc} alt="Sign in QR" width={240} height={240} />
              </div>
              <p className="text-white/50 text-sm">{t.scanWith}</p>
              <div className="flex items-center gap-2 text-lime-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
                </span>
                <span className="text-sm">{t.waitingFor}</span>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
