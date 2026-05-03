'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store/appStore'
import { t } from '@/lib/i18n'
import { Bell, Droplets, Receipt, HelpCircle, Check, Loader2 } from 'lucide-react'

const ACTIONS = [
  {
    id: 'callWaiter',
    icon: Bell,
    color: 'from-sky-500 to-blue-600',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
  },
  {
    id: 'requestWater',
    icon: Droplets,
    color: 'from-cyan-500 to-teal-500',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  {
    id: 'requestBill',
    icon: Receipt,
    color: 'from-emerald-500 to-green-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  {
    id: 'needHelp',
    icon: HelpCircle,
    color: 'from-rose-500 to-red-600',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
  },
] as const

export default function ServiceScreen() {
  const { lang } = useAppStore()
  const tr = t(lang)
  const [sent, setSent] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  function trigger(id: string) {
    setLoading(id)
    setTimeout(() => {
      setLoading(null)
      setSent(id)
      setTimeout(() => setSent(null), 3000)
    }, 1000)
  }

  return (
    <div className="p-5 space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white">{tr.service.title}</h2>
        <p className="text-stone-400 mt-1">Wir helfen Ihnen gerne weiter</p>
      </div>

      <div className="space-y-4">
        {ACTIONS.map(({ id, icon: Icon, color, bg, border }) => {
          const label = tr.service[id as keyof typeof tr.service] as string
          const desc  = tr.service[(id + 'Desc') as keyof typeof tr.service] as string
          const isSent    = sent === id
          const isLoading = loading === id

          return (
            <button
              key={id}
              onClick={() => trigger(id)}
              disabled={isLoading || isSent}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all active:scale-[0.97] text-left ${
                isSent
                  ? 'border-emerald-400 bg-emerald-400/10'
                  : `${border} ${bg} hover:border-opacity-70`
              }`}
            >
              <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                {isSent ? (
                  <Check size={26} className="text-white" />
                ) : isLoading ? (
                  <Loader2 size={26} className="text-white animate-spin" />
                ) : (
                  <Icon size={26} className="text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-lg">{label}</p>
                <p className="text-stone-400 text-sm mt-0.5">
                  {isSent ? tr.service.sentSubtitle : desc}
                </p>
              </div>
              {isSent && (
                <span className="text-emerald-400 text-sm font-semibold flex-shrink-0">✓</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
