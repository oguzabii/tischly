'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Sparkles, UserPlus } from 'lucide-react';
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
}> = {
  de: { loginTitle: 'Willkommen bei Tischly', loginSub: 'Scanne den QR-Code, um dich anzumelden',
        joinTitle: 'Mit am Tisch', joinSub: 'Scanne den QR-Code, um dich der Runde anzuschließen',
        scanWith: 'Scanne mit deiner Handykamera', waitingFor: 'Warte auf Anmeldung…',
        thanks: 'Willkommen zurück', close: 'Schließen',
        firstTime: 'Neu hier? Punkte sammeln & Vorteile genießen.',
        existing: 'Schon dabei? Wir erkennen dich sofort.' },
  en: { loginTitle: 'Welcome to Tischly', loginSub: 'Scan the QR code to sign in',
        joinTitle: 'Join the table', joinSub: 'Scan the QR code to join your group',
        scanWith: 'Scan with your phone camera', waitingFor: 'Waiting for sign-in…',
        thanks: 'Welcome back', close: 'Close',
        firstTime: 'New here? Earn points and unlock perks.',
        existing: 'Already a member? We recognize you instantly.' },
  tr: { loginTitle: 'Tischly\'ye hoş geldin', loginSub: 'Giriş yapmak için QR\'ı tara',
        joinTitle: 'Masaya katıl', joinSub: 'Gruba katılmak için QR\'ı tara',
        scanWith: 'Telefonunun kamerasıyla tara', waitingFor: 'Giriş bekleniyor…',
        thanks: 'Tekrar hoş geldin', close: 'Kapat',
        firstTime: 'Yeni misin? Puan kazan, ayrıcalıkların tadını çıkar.',
        existing: 'Üye misin? Seni anında tanırız.' },
  fr: { loginTitle: 'Bienvenue chez Tischly', loginSub: 'Scannez le QR pour vous connecter',
        joinTitle: 'Rejoindre la table', joinSub: 'Scannez le QR pour rejoindre le groupe',
        scanWith: 'Scannez avec votre téléphone', waitingFor: 'En attente de connexion…',
        thanks: 'Bon retour', close: 'Fermer',
        firstTime: 'Nouveau ? Gagnez des points et débloquez des avantages.',
        existing: 'Déjà membre ? Nous vous reconnaissons.' },
  it: { loginTitle: 'Benvenuto in Tischly', loginSub: 'Scansiona il QR per accedere',
        joinTitle: 'Unisciti al tavolo', joinSub: 'Scansiona il QR per unirti al gruppo',
        scanWith: 'Scansiona col telefono', waitingFor: 'In attesa del login…',
        thanks: 'Bentornato', close: 'Chiudi',
        firstTime: 'Nuovo? Guadagna punti e sblocca vantaggi.',
        existing: 'Già membro? Ti riconosciamo subito.' },
  es: { loginTitle: 'Bienvenido a Tischly', loginSub: 'Escanea el QR para iniciar sesión',
        joinTitle: 'Únete a la mesa', joinSub: 'Escanea el QR para unirte al grupo',
        scanWith: 'Escanea con tu móvil', waitingFor: 'Esperando inicio de sesión…',
        thanks: 'Bienvenido de nuevo', close: 'Cerrar',
        firstTime: '¿Nuevo? Gana puntos y desbloquea ventajas.',
        existing: '¿Ya eres miembro? Te reconocemos al instante.' },
};

export function AuthQRScreen({ tableId, lang, hostName, onClose, onAuthenticated }: AuthQRScreenProps) {
  const t = STRINGS[lang];
  const [token] = useState(() => newJoinToken());
  const { sessions } = useGuestSessions(tableId);

  const joinUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/join/${tableId}?token=${token}&lang=${lang}`;
  }, [tableId, token, lang]);

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(joinUrl)}`;

  useEffect(() => {
    const matched = sessions.find((s) => s.join_token === token);
    if (matched?.guest) {
      onAuthenticated();
    }
  }, [sessions, token, onAuthenticated]);

  const isCompanion = !!hostName;
  const title = isCompanion ? t.joinTitle : t.loginTitle;
  const sub   = isCompanion ? t.joinSub   : t.loginSub;

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

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        {hostName && (
          <p className="text-lime-400 mb-4">
            👋 {hostName} — {t.existing}
          </p>
        )}

        <p className="text-white/70 mb-6 max-w-sm">{sub}</p>

        <div className="bg-white p-4 rounded-3xl mb-6 shadow-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrSrc} alt="Sign in QR" width={280} height={280} />
        </div>

        <p className="text-white/60 text-sm mb-2">{t.scanWith}</p>

        <div className="flex items-center gap-2 text-lime-400 mt-4">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
          </span>
          <span className="text-sm">{t.waitingFor}</span>
        </div>

        <p className="mt-12 text-xs text-white/40 max-w-xs">
          {isCompanion ? t.existing : t.firstTime}
        </p>
      </main>
    </div>
  );
}
