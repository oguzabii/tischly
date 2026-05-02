'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store/appStore'
import LanguageScreen from './LanguageScreen'
import HomeScreen from './HomeScreen'
import MenuScreen from './menu/MenuScreen'
import CartScreen from './cart/CartScreen'
import PaymentScreen from './PaymentScreen'
import ServiceScreen from './ServiceScreen'
import OffersScreen from './OffersScreen'
import GamesScreen from './games/GamesScreen'
import DailyScreen from './DailyScreen'
import TopBar from './ui/TopBar'
import BottomNav from './ui/BottomNav'

interface Props { tableId: string }

export default function TableKiosk({ tableId }: Props) {
  const { setTableId, activeView, setActiveView, lang } = useAppStore()
  const [langSelected, setLangSelected] = useState(false)

  useEffect(() => {
    setTableId(tableId)
  }, [tableId, setTableId])

  if (!langSelected) {
    return (
      <LanguageScreen
        onSelect={() => setLangSelected(true)}
      />
    )
  }

  const renderView = () => {
    switch (activeView) {
      case 'menu':    return <MenuScreen />
      case 'cart':    return <CartScreen />
      case 'payment': return <PaymentScreen />
      case 'service': return <ServiceScreen />
      case 'offers':  return <OffersScreen />
      case 'games':   return <GamesScreen />
      case 'daily':   return <DailyScreen />
      default:        return <HomeScreen />
    }
  }

  return (
    <div className="kiosk-no-select flex flex-col min-h-screen bg-[#1C1917]">
      <TopBar tableId={tableId} />
      <main className="flex-1 overflow-y-auto pb-24 page-enter">
        {renderView()}
      </main>
      <BottomNav />
    </div>
  )
}
