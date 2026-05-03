'use client'

import { useAppStore } from '@/lib/store/appStore'
import { LANGUAGES } from '@/lib/i18n'
import type { Lang } from '@/lib/types'

interface Props { onSelect: () => void }

export default function LanguageScreen({ onSelect }: Props) {
  const { setLang, lang } = useAppStore()

  function choose(code: Lang) {
    setLang(code)
    onSelect()
  }

  return (
    <div className="min-h-screen bg-[#1C1917] flex flex-col items-center justify-center p-8">
      {/* Logo */}
      <div className="mb-12 text-center">
        <div className="text-5xl font-bold tracking-tight mb-2">
          <span className="text-amber-400">T</span>
          <span className="text-white">ischly</span>
        </div>
        <p className="text-stone-400 text-lg">Ihr digitaler Tischbegleiter</p>
      </div>

      {/* Language grid */}
      <div className="w-full max-w-lg">
        <p className="text-stone-400 text-center text-sm uppercase tracking-widest mb-6">
          Bitte wählen Sie Ihre Sprache · Please select your language
        </p>
        <div className="grid grid-cols-2 gap-4">
          {LANGUAGES.map(({ code, label, flag }) => (
            <button
              key={code}
              onClick={() => choose(code)}
              className={`
                flex items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-200 active:scale-95
                ${lang === code
                  ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                  : 'border-stone-700 bg-stone-800/50 text-white active:border-stone-500 active:bg-stone-800'}
              `}
            >
              <span className="text-4xl">{flag}</span>
              <span className="text-xl font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
