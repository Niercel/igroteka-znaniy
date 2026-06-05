import { useState, useEffect, useCallback } from 'react'
import { Star, HelpCircle, Settings } from 'lucide-react'
import { DIFFICULTY_LEVELS, getSettings, getDifficultyLabel } from '../../utils/gameSettings'
import { getRandomMessage } from '../../utils/gameContent'
import HintModal from '../HintModal'

const COLORS = ['from-red-400 to-pink-400', 'from-blue-400 to-cyan-400', 'from-green-400 to-emerald-400', 'from-yellow-400 to-orange-400']

export default function SimonGame({ game, onComplete, difficulty, onDifficultyChangeRequest, light }) {
  const [round, setRound] = useState(0)
  const [sequence, setSequence] = useState([])
  const [playerSeq, setPlayerSeq] = useState([])
  const [showing, setShowing] = useState(false)
  const [activeIndex, setActiveIndex] = useState(null)
  const [pressedIndex, setPressedIndex] = useState(null)
  const [message, setMessage] = useState('')
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const settings = getSettings('simon', difficulty)
  const totalRounds = settings.rounds
  const baseLength = settings.baseLength

  const generateSequence = useCallback(() => {
    const seq = Array.from({ length: baseLength }, () => Math.floor(Math.random() * 4))
    setSequence(seq)
    setPlayerSeq([])
    showSequence(seq)
  }, [baseLength])

  useEffect(() => {
    if (!finished) generateSequence()
    setRound(0)
    setScore(0)
    setFinished(false)
  }, [difficulty, generateSequence])

  useEffect(() => {
    if (!finished) generateSequence()
  }, [round])

  const showSequence = (seq) => {
    setShowing(true)
    let i = 0
    const interval = setInterval(() => {
      setActiveIndex(seq[i])
      setTimeout(() => setActiveIndex(null), 400)
      i++
      if (i >= seq.length) {
        clearInterval(interval)
        setTimeout(() => setShowing(false), 500)
      }
    }, 800)
  }

  const handlePress = (idx) => {
    if (showing || finished) return
    setPressedIndex(idx)
    setTimeout(() => setPressedIndex(null), 250)
    const newSeq = [...playerSeq, idx]
    setPlayerSeq(newSeq)
    if (newSeq[newSeq.length - 1] !== sequence[newSeq.length - 1]) {
      setMessage(getRandomMessage(game.incorrectMessages))
      setTimeout(() => {
        if (round + 1 < totalRounds) setRound(r => r + 1)
        else { setFinished(true); onComplete(score, totalRounds) }
      }, 1000)
      return
    }
    if (newSeq.length === sequence.length) {
      setMessage(getRandomMessage(game.correctMessages))
      setScore(s => s + 1)
      if (round + 1 < totalRounds) {
        setTimeout(() => setRound(r => r + 1), 1000)
      } else {
        setTimeout(() => { setFinished(true); onComplete(score + 1, totalRounds) }, 1000)
      }
    }
  }

  if (finished) return null

  return (
    <div>
      <HintModal isOpen={showHint} onClose={() => setShowHint(false)} title={game.title} instructions={game.instructions} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${light ? 'text-gray-700' : 'text-white'}`}>
            {getDifficultyLabel(difficulty)}
          </span>
          <button
            onClick={onDifficultyChangeRequest}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${light ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/20 hover:bg-white/30'}`}
            title="Сменить сложность"
          >
            <Settings size={16} className={light ? 'text-gray-600' : 'text-white'} />
          </button>
        </div>
        <button onClick={() => setShowHint(true)} className={`w-8 h-8 rounded-full flex items-center justify-center ${light ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/20 hover:bg-white/30'}`}>
          <HelpCircle size={16} className={light ? 'text-gray-600' : 'text-white'} />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className={`text-xs rounded-full px-3 py-1 ${light ? 'bg-gray-100 text-gray-600' : 'bg-white/10 text-white/60'}`}>
          Раунд {round + 1}/{totalRounds}
        </span>
        <div className="flex-1" />
        <Star size={14} className="text-yellow-500 fill-yellow-500" />
        <span className={`text-sm font-bold ${light ? 'text-gray-800' : 'text-white'}`}>{score}</span>
      </div>

      <div className={`${light ? 'bg-white border-gray-200' : 'bg-white/10 border-white/20'} backdrop-blur-xl border rounded-3xl p-6 text-center`}>
        <h2 className={`text-lg mb-4 ${light ? 'text-gray-800' : 'text-white'}`}>{showing ? 'Запоминайте...' : 'Повторите!'}</h2>
        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
          {COLORS.map((color, idx) => {
            const isActive = activeIndex === idx || pressedIndex === idx
            return (
              <button key={idx} onClick={() => handlePress(idx)}
                className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${color} transition-all duration-200 transform ${
                  isActive ? 'scale-125 brightness-150 shadow-2xl animate-glow' : 'scale-100 hover:scale-105'
                }`}
                disabled={showing}
              />
            )
          })}
        </div>
        {message && <div className="mt-4 text-lg font-bold animate-slide-up text-green-500">{message}</div>}
      </div>
    </div>
  )
}