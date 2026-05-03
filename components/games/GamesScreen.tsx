'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store/appStore'
import { t } from '@/lib/i18n'
import TicTacToe from './TicTacToe'
import MemoryGame from './MemoryGame'
import RockPaperScissors from './RockPaperScissors'
import { ChevronLeft } from 'lucide-react'

type GameId = 'tictactoe' | 'memory' | 'rps'

const GAMES: { id: GameId; emoji: string; gradient: string }[] = [
  { id: 'tictactoe', emoji: '⭕', gradient: 'from-sky-500 to-blue-600' },
  { id: 'memory',    emoji: '🃏', gradient: 'from-purple-500 to-violet-600' },
  { id: 'rps',       emoji: '✂️', gradient: 'from-rose-500 to-pink-600' },
]

export default function GamesScreen() {
  const { lang } = useAppStore()
  const tr = t(lang)
  const [active, setActive] = useState<GameId | null>(null)

  if (active === 'tictactoe') return <TicTacToe onBack={() => setActive(null)} />
  if (active === 'memory')    return <MemoryGame onBack={() => setActive(null)} />
  if (active === 'rps')       return <RockPaperScissors onBack={() => setActive(null)} />

  const gameConfig = {
    tictactoe: { label: tr.games.tictactoe, desc: tr.games.tictactoeDesc },
    memory:    { label: tr.games.memory,    desc: tr.games.memoryDesc },
    rps:       { label: tr.games.rockPaperScissors, desc: tr.games.rockPaperScissorsDesc },
  }

  return (
    <div className="p-5 space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white">{tr.games.title}</h2>
        <p className="text-stone-400 mt-1">{tr.games.subtitle}</p>
      </div>

      <div className="space-y-4">
        {GAMES.map(({ id, emoji, gradient }) => {
          const cfg = gameConfig[id]
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className="w-full flex items-center gap-5 p-5 rounded-2xl bg-stone-800/60 border border-stone-700/50 hover:border-stone-600 transition-all active:scale-[0.98] text-left"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-3xl shadow-lg flex-shrink-0`}>
                {emoji}
              </div>
              <div>
                <p className="text-white font-bold text-lg">{cfg.label}</p>
                <p className="text-stone-400 text-sm mt-0.5">{cfg.desc}</p>
              </div>
              <ChevronLeft size={18} className="ml-auto rotate-180 text-stone-500 flex-shrink-0" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
