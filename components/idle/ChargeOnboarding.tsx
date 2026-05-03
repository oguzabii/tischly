'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, BatteryCharging, Check, Smartphone } from 'lucide-react';
import type { Lang } from '@/lib/types';

interface ChargeOnboardingProps {
  tableId: string;
  lang: Lang;
  onClose: () => void;
}

const STRINGS: Record<Lang, {
  title: string; step1: string; step2: string; step3: string;
  scan: string; emailPh: string; namePh: string; consent: string;
  start: string; running: string; remaining: string; minutes: string; thanks: string; close: string;
}> = {
  de: { title: 'Kostenloses Aufladen', step1: 'QR-Code scannen', step2: 'Mit E-Mail registrieren', step3: 'Telefon anschließen',
        scan: 'Scanne den QR-Code mit deinem Handy', emailPh: 'E-Mail', namePh: 'Vorname',
        consent: 'Ich stimme der Datenverarbeitung zu', start: 'Aufladen starten',
        running: 'Aufladen läuft', remaining: 'Verbleibend', minutes: 'Minuten', thanks: 'Danke!', close: 'Schließen' },
  en: { title: 'Free charging', step1: 'Scan the QR code', step2: 'Register with email', step3: 'Plug in your phone',
        scan: 'Scan the QR code with your phone', emailPh: 'Email', namePh: 'First name',
        consent: 'I agree to data processing', start: 'Start charging',
        running: 'Charging in progress', remaining: 'Remaining', minutes: 'minutes', thanks: 'Thanks!', close: 'Close' },
  tr: { title: 'Ücretsiz Şarj', step1: 'QR kodu tara', step2: 'E-posta ile kayıt ol', step3: 'Telefonu bağla',
        scan: 'QR kodunu telefonunla tara', emailPh: 'E-posta', namePh: 'Ad',
        consent: 'Verilerimin işlenmesini kabul ediyorum', start: 'Şarjı başlat',
        running: 'Şarj sürüyor', remaining: 'Kalan', minutes: 'dakika', thanks: 'Teşekkürler!', close: 'Kapat' },
  fr: { title: 'Recharge gratuite', step1: 'Scanner le QR code', step2: "S'inscrire par e-mail", step3: 'Brancher le téléphone',
        scan: 'Scannez le QR avec votre téléphone', emailPh: 'E-mail', namePh: 'Prénom',
        consent: "J'accepte le traitement des données", start: 'Démarrer la charge',
        running: 'Charge en cours', remaining: 'Restant', minutes: 'minutes', thanks: 'Merci !', close: 'Fermer' },
  it: { title: 'Ricarica gratuita', step1: 'Scansiona il QR', step2: 'Registrati con email', step3: 'Collega il telefono',
        scan: 'Scansiona il QR con il telefono', emailPh: 'Email', namePh: 'Nome',
        consent: 'Acconsento al trattamento dei dati', start: 'Avvia ricarica',
        running: 'Ricarica in corso', remaining: 'Rimanenti', minutes: 'minuti', thanks: 'Grazie!', close: 'Chiudi' },
  es: { title: 'Carga gratuita', step1: 'Escanea el QR', step2: 'Regístrate con email', step3: 'Conecta el teléfono',
        scan: 'Escanea el QR con tu móvil', emailPh: 'Email', namePh: 'Nombre',
        consent: 'Acepto el tratamiento de datos', start: 'Iniciar carga',
        running: 'Cargando', remaining: 'Restante', minutes: 'minutos', thanks: '¡Gracias!', close: 'Cerrar' },
};

type Step = 'qr' | 'form' | 'running';

export function ChargeOnboarding({ tableId, lang, onClose }: ChargeOnboardingProps) {
  const t = STRINGS[lang];
  const [step, setStep] = useState<Step>('qr');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(false);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const qrTarget =
    typeof window !== 'undefined'
      ? `${window.location.origin}/charge/${tableId}`
      : `https://tischly.app/charge/${tableId}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(qrTarget)}`;

  useEffect(() => {
    if (step !== 'running' || !endsAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [step, endsAt]);

  async function startSession() {
    const minutes = 30;
    const ends = Date.now() + minutes * 60_000;
    setEndsAt(ends);
    setStep('running');

    try {
      await fetch('/api/charge-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_id: tableId,
          guest_email: email,
          guest_name: name,
          consent,
          ends_at: new Date(ends).toISOString(),
        }),
      });
    } catch {
      // ignore
    }
  }

  const remainingMs = endsAt ? Math.max(0, endsAt - now) : 0;
  const remainingMin = Math.ceil(remainingMs / 60_000);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900 text-white flex flex-col">
      <header className="px-6 py-4 flex items-center gap-3 border-b border-white/10">
        <button onClick={onClose} className="p-2 -ml-2 rounded-lg hover:bg-white/10">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <BatteryCharging className="w-6 h-6 text-lime-400" />
          {t.title}
        </h1>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <ol className="grid grid-cols-3 gap-2 mb-8 text-sm">
          {[t.step1, t.step2, t.step3].map((label, i) => {
            const done = (step === 'form' && i < 1) || (step === 'running' && i < 3);
            const active =
              (step === 'qr' && i === 0) ||
              (step === 'form' && i === 1) ||
              (step === 'running' && i === 2);
            return (
              <li
                key={label}
                className={`p-3 rounded-xl border ${
                  active
                    ? 'border-lime-400 bg-lime-400/10'
                    : done
                    ? 'border-lime-700 bg-lime-900/20 text-lime-300'
                    : 'border-white/10 bg-white/5 text-white/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full grid place-items-center text-xs font-bold ${
                    done ? 'bg-lime-400 text-black' : active ? 'bg-white text-black' : 'bg-white/10'
                  }`}>
                    {done ? <Check className="w-3 h-3" /> : i + 1}
                  </span>
                  <span className="leading-tight">{label}</span>
                </div>
              </li>
            );
          })}
        </ol>

        {step === 'qr' && (
          <div className="text-center">
            <p className="text-white/70 mb-4">{t.scan}</p>
            <div className="bg-white p-4 rounded-2xl inline-block mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrSrc} alt="QR" width={280} height={280} />
            </div>
            <div>
              <button
                onClick={() => setStep('form')}
                className="text-lime-400 underline underline-offset-4"
              >
                Skip QR (demo)
              </button>
            </div>
          </div>
        )}

        {step === 'form' && (
          <form
            className="max-w-md mx-auto space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (consent) startSession();
            }}
          >
            <input
              type="text"
              placeholder={t.namePh}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-lime-400 outline-none"
              required
            />
            <input
              type="email"
              placeholder={t.emailPh}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-lime-400 outline-none"
              required
            />
            <label className="flex items-start gap-3 text-sm text-white/80">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-5 h-5 accent-lime-400"
                required
              />
              {t.consent}
            </label>
            <button
              type="submit"
              disabled={!consent}
              className="w-full py-4 rounded-xl font-bold bg-lime-400 text-slate-900 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Smartphone className="w-5 h-5" />
              {t.start}
            </button>
          </form>
        )}

        {step === 'running' && (
          <div className="text-center max-w-md mx-auto">
            <div className="relative w-48 h-48 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-lime-400/20 animate-ping" />
              <div className="absolute inset-2 rounded-full bg-lime-400/30" />
              <div className="absolute inset-0 grid place-items-center">
                <BatteryCharging className="w-20 h-20 text-lime-400" />
              </div>
            </div>
            <p className="text-2xl font-bold mb-1">{t.running}</p>
            <p className="text-white/60 mb-8">
              {t.remaining}: <span className="text-lime-400 font-bold">{remainingMin}</span> {t.minutes}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20"
            >
              {t.close}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
