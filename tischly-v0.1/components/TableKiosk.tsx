'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store/appStore';
import { useIdleTimer } from '@/lib/hooks/useIdleTimer';
import { useGuestSessions, endTableSessions } from '@/lib/hooks/useGuestSession';
import { IdleScreen } from './idle/IdleScreen';
import { ChargeOnboarding } from './idle/ChargeOnboarding';
import { AnimatedBackground } from './idle/AnimatedBackground';
import { AuthQRScreen } from './auth/AuthQRScreen';
import { WelcomeScreen } from './auth/WelcomeScreen';
import { LoyaltyScreen } from './loyalty/LoyaltyScreen';
import LanguageScreen from './LanguageScreen';
import MenuScreen from './menu/MenuScreen';
import CartScreen from './cart/CartScreen';
import PaymentScreen from './PaymentScreen';
import ServiceScreen from './ServiceScreen';
import OffersScreen from './OffersScreen';
import GamesScreen from './games/GamesScreen';
import DailyScreen from './DailyScreen';
import TopBar from './ui/TopBar';
import BottomNav from './ui/BottomNav';

type KioskScreen = 'menu' | 'auth-host' | 'auth-companion' | 'welcome' | 'loyalty';

interface Props { tableId: string }

export default function TableKiosk({ tableId }: Props) {
  const { setTableId, activeView, setActiveView, lang, langSelected, setLangSelected } = useAppStore();
  const [awake, setAwake]               = useState(false);
  const [kioskScreen, setKioskScreen]   = useState<KioskScreen>('menu');
  const [chargingOpen, setChargingOpen] = useState(false);

  const idle = useIdleTimer(90_000);
  const { host, companions, sessions } = useGuestSessions(tableId);

  useEffect(() => { setTableId(tableId); }, [tableId, setTableId]);

  // When the realtime session arrives while showing welcome (race fix)
  // — also handles the case where auth-host fires onAuthenticated before
  //   TableKiosk's own useGuestSessions has re-fetched.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (host && kioskScreen === 'auth-companion') setKioskScreen('menu');
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [host, kioskScreen]);

  // 5-min idle while awake → reset table
  useEffect(() => {
    if (!idle || !awake) return;
    const timer = setTimeout(async () => {
      if (host) await endTableSessions(tableId);
      setAwake(false);
      setKioskScreen('menu');
      setActiveView('menu');
    }, 5 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [idle, awake, host, tableId, setActiveView]);

  // ── Language screen ──────────────────────────────────────────────────────
  if (!langSelected) {
    return <LanguageScreen onSelect={() => setLangSelected(true)} />;
  }

  // ── Idle screen ──────────────────────────────────────────────────────────
  if (!awake || (idle && !host)) {
    return (
      <>
        <IdleScreen
          tableId={tableId}
          lang={lang}
          onWake={() => { setAwake(true); setActiveView('menu'); }}
          onChargeRequest={() => { setAwake(true); setChargingOpen(true); }}
        />
        {chargingOpen && (
          <ChargeOnboarding
            tableId={tableId}
            lang={lang}
            onClose={() => setChargingOpen(false)}
          />
        )}
      </>
    );
  }

  // ── QR auth — host (from ⭐ button when no guest logged in) ──────────────
  if (kioskScreen === 'auth-host') {
    return (
      <AuthQRScreen
        tableId={tableId}
        lang={lang}
        hostName={null}
        onClose={() => setKioskScreen('menu')}
        onAuthenticated={() => setKioskScreen('welcome')}
      />
    );
  }

  // ── QR auth — companion (add a person to the table) ─────────────────────
  if (kioskScreen === 'auth-companion') {
    return (
      <AuthQRScreen
        tableId={tableId}
        lang={lang}
        hostName={host?.name ?? null}
        onClose={() => setKioskScreen('menu')}
        onAuthenticated={() => setKioskScreen('menu')}
      />
    );
  }

  // ── Welcome screen ───────────────────────────────────────────────────────
  if (kioskScreen === 'welcome') {
    // Race condition guard: onAuthenticated fired but our own realtime
    // subscription hasn't delivered the host yet — show a brief spinner.
    if (!host) {
      return (
        <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-lime-400" />
        </div>
      );
    }
    return (
      <WelcomeScreen
        guest={host}
        companions={companions}
        lang={lang}
        onContinue={() => { setKioskScreen('menu'); setActiveView('menu'); }}
        onAddCompanion={() => setKioskScreen('auth-companion')}
      />
    );
  }

  // ── Loyalty screen ───────────────────────────────────────────────────────
  if (kioskScreen === 'loyalty') {
    if (!host) {
      return (
        <AuthQRScreen
          tableId={tableId}
          lang={lang}
          hostName={null}
          onClose={() => setKioskScreen('menu')}
          onAuthenticated={() => setKioskScreen('welcome')}
        />
      );
    }
    return (
      <LoyaltyScreen
        guest={host}
        lang={lang}
        onBack={() => { setKioskScreen('menu'); setActiveView('menu'); }}
      />
    );
  }

  // ── Main kiosk shell ─────────────────────────────────────────────────────
  const bgVariant =
    activeView === 'cart'    ? 'cart'    :
    activeView === 'payment' ? 'payment' :
    activeView === 'service' ? 'service' : 'menu';

  const goSignIn = () => setKioskScreen('auth-host');

  const renderView = () => {
    switch (activeView) {
      case 'menu':    return <MenuScreen host={host} onSignIn={goSignIn} />;
      case 'cart':    return <CartScreen />;
      case 'payment': return <PaymentScreen />;
      case 'service': return <ServiceScreen />;
      case 'offers':  return <OffersScreen />;
      case 'games':   return <GamesScreen />;
      case 'daily':   return <DailyScreen />;
      default:        return <MenuScreen host={host} onSignIn={goSignIn} />;
    }
  };

  // Suppress unused-var warning — sessions is used by AuthQRScreen child
  void sessions;

  return (
    <AnimatedBackground variant={bgVariant} className="kiosk-no-select flex flex-col min-h-screen">
      <TopBar tableId={tableId} onLoyalty={() => setKioskScreen('loyalty')} />
      <main className="flex-1 overflow-y-auto pb-24 page-enter">
        {renderView()}
      </main>
      <BottomNav />
    </AnimatedBackground>
  );
}
