'use client'

import { useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store/appStore'
import { t } from '@/lib/i18n'
import { ChevronLeft, RotateCcw } from 'lucide-react'

type Cell = 'X' | 'O' | null
type Board = Cell[]

const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]

function checkWinner(b: Board): Cell | 'draw' | null {
  for (const [a, c, d] of WINS) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a]
  }
  if (b.every(Boolean)) return 'draw'
  return null
}

function bestMove(b: Board): number {
  const empty = b.map((v, i) => v === null ? i : -1).filter(i => i >= 0)
  // win
  for (const i of empty) {
    const t = [...b]; t[i] = 'O'
    if (checkWinner(t) === 'O') return i
  }
  // block
  for (const i of empty) {
    const t = [...b]; t[i] = 'X'
    if (checkWinner(t) === 'X') return i
  }
  // center
  if (empty.includes(4)) return 4
  return empty[Math.floor(Math.random() * empty.length)]
}

export default function TicTacToe({ onBack }: { onBack: () => void }) {
  const { lang } = useAppStore()
  const tr = t(lang)
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [scores, setScores] = useState({ player: 0, computer: 0 })

  const winner = checkWinner(board)

  function handleClick(i: number) {
    if (board[i] || winner || !isPlayerTurn) return
    const next = [...board]
    next[i] = 'X'
    const w = checkWinner(next)
    if (w) {
      setBoard(next)
      if (w === 'X') setScores(s => ({ ...s, player: s.player + 1 }))
      return
    }
    setIsPlayerTurn(false)
    setBoard(next)
    setTimeout(() => {
      const ai = [...next]
      ai[bestMove(next)] = 'O'
      setBoard(ai)
      const aw = checkWinner(ai)
      if (aw === 'O') setScores(s => ({ ...s, computer: s.computer + 1 }))
      setIsPlayerTurn(true)
    }, 400)
  }

  function reset() {
    setBoard(Array(9).fill(null))
    setIsPlayerTurn(true)
  }

  const status = winner
    ? winner === 'draw' ? tr.games.draw : winner === 'X' ? tr.games.youWin : tr.games.computerWins
    : isPlayerTurn ? tr.games.playerTurn : tr.games.computerTurn

  return (
    <div className="p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-stone-400 hover:text-white active:scale-90 transition-all">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-white flex-1">{tr.games.tictactoe}</h2>
        <button onClick={reset} className="text-stone-400 hover:text-white active:scale-90 transition-all">
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Score */}
      <div className="flex items-center justify-center gap-8">
        <div className="text-center">
          <p className="text-stone-400 text-sm">Sie (X)</p>
          <p className="text-white font-bold text-3xl">{scores.player}</p>
        </div>
        <div className="text-stone-600 font-bold text-lg">{tr.games.vs}</div>
        <div className="text-center">
          <p className="text-stone-400 text-sm">Computer (O)</p>
          <p className="text-white font-bold text-3xl">{scores.computer}</p>
        </div>
      </div>

      {/* Status */}
      <div className={`text-center py-3 px-4 rounded-2xl ${
        winner
          ? winner === 'X' ? 'bg-emerald-500/20 text-emerald-400'
          : winner === 'O' ? 'bg-red-500/20 text-red-400'
          : 'bg-stone-700/50 text-stone-300'
          : 'bg-stone-800/50 text-stone-300'
      }`}>
        <p className="font-semibold">{status}</p>
      </div>

      {/* Board */}
      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto w-full">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className={`aspect-square rounded-2xl flex items-center justify-center text-4xl font-bold border-2 transition-all active:scale-95 ${
              cell === 'X' ? 'bg-sky-500/20 border-sky-500/50 text-sky-400'
              : cell === 'O' ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
              : 'bg-stone-800 border-stone-700 hover:border-stone-500'
            }`}
          >
            {cell}
          </button>
        ))}
      </div>

      {winner && (
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
