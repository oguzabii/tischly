'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store/appStore'
import { t } from '@/lib/i18n'
import { ChevronLeft, RotateCcw } from 'lucide-react'

const EMOJIS = ['🍔', '🍕', '🥤', '🍰', '🍟', '🌮', '🍦', '🥗']

function makeDeck() {
  return [...EMOJIS, ...EMOJIS]
    .sort(() => Math.random() - 0.5)
    .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }))
}

export default function MemoryGame({ onBack }: { onBack: () => void }) {
  const { lang } = useAppStore()
  const tr = t(lang)
  const [cards, setCards] = useState(makeDeck)
  const [flipped, setFlipped] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)

  function reset() {
    setCards(makeDeck())
    setFlipped([])
    setMoves(0)
    setWon(false)
  }

  function flip(id: number) {
    if (flipped.length === 2) return
    const card = cards.find(c => c.id === id)
    if (!card || card.flipped || card.matched) return

    const next = cards.map(c => c.id === id ? { ...c, flipped: true } : c)
    setCards(next)
    const newFlipped = [...flipped, id]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      const [a, b] = newFlipped.map(fid => next.find(c => c.id === fid)!)
      if (a.emoji === b.emoji) {
        const matched = next.map(c => newFlipped.includes(c.id) ? { ...c, matched: true } : c)
        setCards(matched)
        setFlipped([])
        if (matched.every(c => c.matched)) setWon(true)
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, flipped: false } : c))
          setFlipped([])
        }, 900)
      }
    }
  }

  const found = cards.filter(c => c.matched).length / 2

  return (
    <div className="p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-stone-400 hover:text-white transition-colors active:scale-90">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-white flex-1">{tr.games.memory}</h2>
        <button onClick={reset} className="text-stone-400 hover:text-white transition-colors active:scale-90">
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 justify-center">
        <div className="px-4 py-2 rounded-xl bg-stone-800 text-center border border-stone-700">
          <p className="text-stone-400 text-xs">{tr.games.moves}</p>
          <p className="text-white font-bold">{moves}</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-stone-800 text-center border border-stone-700">
          <p className="text-stone-400 text-xs">{tr.games.found}</p>
          <p className="text-white font-bold">{found}/{EMOJIS.length}</p>
        </div>
      </div>

      {won && (
        <div className="text-center py-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold">
          🎉 {tr.games.youWin} · {moves} {tr.games.moves}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-4 gap-3">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => flip(card.id)}
            className={`aspect-square rounded-2xl flex items-center justify-center text-3xl border-2 transition-all duration-200 active:scale-95 ${
              card.matched
                ? 'bg-emerald-500/20 border-emerald-500/40 opacity-50'
                : card.flipped
                ? 'bg-stone-700 border-stone-500'
                : 'bg-stone-800 border-stone-700 hover:border-stone-600'
            }`}
          >
            {card.flipped || card.matched ? card.emoji : ''}
          </button>
        ))}
      </div>

      {won && (
        <button
          onClick={reset}
          className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-bold transition-all active:scale-97"
        >
          {tr.games.newGame}
        </button>
      )}
    </div>
  )
}
