'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store/appStore'
import { t } from '@/lib/i18n'
import { ChevronLeft, RotateCcw } from 'lucide-react'

type Choice = 'rock' | 'scissors' | 'paper'

const CHOICES: { id: Choice; emoji: string }[] = [
  { id: 'rock',     emoji: '🪨' },
  { id: 'scissors', emoji: '✂️' },
  { id: 'paper',    emoji: '📄' },
]

function getResult(p: Choice, c: Choice): 'win' | 'lose' | 'draw' {
  if (p === c) return 'draw'
  if ((p === 'rock' && c === 'scissors') || (p === 'scissors' && c === 'paper') || (p === 'paper' && c === 'rock')) return 'win'
  return 'lose'
}

export default function RockPaperScissors({ onBack }: { onBack: () => void }) {
  const { lang } = useAppStore()
  const tr = t(lang)
  const [player, setPlayer]   = useState<Choice | null>(null)
  const [computer, setComputer] = useState<Choice | null>(null)
  const [result, setResult]   = useState<'win' | 'lose' | 'draw' | null>(null)
  const [scores, setScores]   = useState({ player: 0, computer: 0 })
  const [showing, setShowing] = useState(false)

  function choose(c: Choice) {
    if (showing) return
    setShowing(true)
    setPlayer(c)
    setComputer(null)
    setResult(null)
    setTimeout(() => {
      const comp = CHOICES[Math.floor(Math.random() * 3)].id
      setComputer(comp)
      const r = getResult(c, comp)
      setResult(r)
      if (r === 'win')  setScores(s => ({ ...s, player: s.player + 1 }))
      if (r === 'lose') setScores(s => ({ ...s, computer: s.computer + 1 }))
      setShowing(false)
    }, 600)
  }

  function reset() {
    setPlayer(null); setComputer(null); setResult(null)
    setScores({ player: 0, computer: 0 })
  }

  const label = (c: Choice | null) => CHOICES.find(x => x.id === c)?.emoji ?? '❓'

  return (
    <div className="p-5 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-stone-400 hover:text-white transition-colors active:scale-90">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-white flex-1">{tr.games.rockPaperScissors}</h2>
        <button onClick={reset} className="text-stone-400 hover:text-white transition-colors active:scale-90">
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Scores */}
      <div className="flex items-center justify-center gap-8">
        <div className="text-center">
          <p className="text-stone-400 text-sm">Sie</p>
          <p className="text-white font-bold text-3xl">{scores.player}</p>
        </div>
        <div className="text-stone-600 font-bold text-lg">{tr.games.vs}</div>
        <div className="text-center">
          <p className="text-stone-400 text-sm">Computer</p>
          <p className="text-white font-bold text-3xl">{scores.computer}</p>
        </div>
      </div>

      {/* Battle display */}
      <div className="flex items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className={`w-24 h-24 rounded-3xl bg-stone-800 border-2 flex items-center justify-center text-5xl transition-all ${result === 'win' ? 'border-emerald-400' : result === 'lose' ? 'border-red-400' : 'border-stone-600'}`}>
            {player ? label(player) : '❓'}
          </div>
          <p className="text-stone-400 text-xs">Sie</p>
        </div>
        <div className="text-stone-600 font-bold text-2xl">{tr.games.vs}</div>
        <div className="flex flex-col items-center gap-2">
          <div className={`w-24 h-24 rounded-3xl bg-stone-800 border-2 flex items-center justify-center text-5xl transition-all ${result === 'lose' ? 'border-emerald-400' : result === 'win' ? 'border-red-400' : 'border-stone-600'} ${showing ? 'animate-pulse' : ''}`}>
            {computer ? label(computer) : showing ? '🎲' : '❓'}
          </div>
          <p className="text-stone-400 text-xs">Computer</p>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`text-center py-4 rounded-2xl font-bold text-lg ${
          result === 'win'  ? 'bg-emerald-500/20 text-emerald-400' :
          result === 'lose' ? 'bg-red-500/20 text-red-400' :
          'bg-stone-700/50 text-stone-300'
        }`}>
          {result === 'win' ? tr.games.youWin : result === 'lose' ? tr.games.computerWins : tr.games.draw}
        </div>
      )}

      {/* Choice buttons */}
      <div>
        <p className="text-stone-400 text-sm text-center mb-4">{tr.games.choose}:</p>
        <div className="grid grid-cols-3 gap-4">
          {CHOICES.map(({ id, emoji }) => (
            <button
              key={id}
              onClick={() => choose(id)}
              disabled={showing}
              className="flex flex-col items-center gap-2 py-5 rounded-2xl bg-stone-800 border border-stone-700 hover:border-stone-500 hover:bg-stone-700 transition-all active:scale-95 disabled:opacity-50"
            >
              <span className="text-4xl">{emoji}</span>
              <span className="text-stone-300 text-sm font-medium">
                {tr.games[id as keyof typeof tr.games] as string}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
