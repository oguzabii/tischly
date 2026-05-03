'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store/appStore'
import { t } from '@/lib/i18n'
import { useOffers } from '@/lib/hooks/useOffers'
import { Tag, Check, Star, Gift, Loader2 } from 'lucide-react'

export default function OffersScreen() {
  const { lang } = useAppStore()
  const tr = t(lang)
  const { offers, loading } = useOffers()
  const [claimed, setClaimed] = useState<Set<string>>(new Set())

  function claim(id: string) {
    setClaimed(prev => new Set(prev).add(id))
  }

  return (
    <div className="p-5 space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white">{tr.offers.title}</h2>
        <p className="text-stone-400 mt-1">{tr.offers.subtitle}</p>
      </div>

      {/* Loyalty banner */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-600/20 to-violet-600/10 border border-purple-500/30">
        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
          <Star size={24} className="text-purple-400" />
        </div>
        <div>
          <p className="text-white font-semibold">{tr.offers.loyalty}</p>
          <p className="text-stone-400 text-sm">{tr.offers.loyaltyDesc}</p>
        </div>
      </div>

      {/* Offers list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        </div>
      ) : offers.length === 0 ? (
        <p className="text-center text-stone-500 py-12">Keine Angebote verfügbar</p>
      ) : (
        <div className="space-y-4">
          {offers.map(offer => {
            const isClaimed = claimed.has(offer.id)
            return (
              <div
                key={offer.id}
                className={`rounded-2xl border overflow-hidden transition-all ${
                  isClaimed ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-stone-700/50 bg-stone-800/60'
                }`}
              >
                <div className="h-20 bg-gradient-to-r from-amber-500/20 to-orange-500/10 flex items-center justify-center">
                  <Gift size={40} className="text-amber-400" />
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-bold text-lg">{offer.title[lang]}</h3>
                      <p className="text-stone-400 text-sm mt-1">{offer.description[lang]}</p>
                    </div>
                    <span className="flex-shrink-0 ml-3 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-sm font-bold border border-amber-400/20">
                      {offer.discountType === 'percent'
                        ? `${offer.discount}%`
                        : `CHF ${offer.discount}`}
                    </span>
                  </div>

                  {offer.code && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-700/50 border border-stone-600">
                      <Tag size={14} className="text-stone-400" />
                      <span className="text-white font-mono font-bold">{offer.code}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-stone-500 text-xs">{tr.offers.validUntil}: {offer.validUntil}</p>
                    <button
                      onClick={() => claim(offer.id)}
                      disabled={isClaimed}
                      className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                        isClaimed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-400 hover:bg-amber-300 text-black'
                      }`}
                    >
                      {isClaimed ? (
                        <span className="flex items-center gap-1"><Check size={14} /> {tr.offers.claimed}</span>
                      ) : tr.offers.claimOffer}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
