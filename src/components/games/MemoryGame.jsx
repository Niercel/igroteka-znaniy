import { useState, useEffect, useRef } from 'react'
import { Star, Timer, HelpCircle } from 'lucide-react'
import { generateMemoryCards } from '../../utils/gameAlgorithms'
import { getRandomMessage } from '../../utils/gameContent'
import { DIFFICULTY_LEVELS, getSettings, getDifficultyLabel } from '../../utils/gameSettings'
import HintModal from '../HintModal'

export default function MemoryGame({ game, onComplete, light }) {
  const [difficulty, setDifficulty] = useState('medium')
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [locked, setLocked] = useState(false)
  const [timer, setTimer] = useState(0)
  const [message, setMessage] = useState('')
  const [finished, setFinished] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const timerRef = useRef(null)

  const settings = getSettings('memory', difficulty)

  useEffect(() => {
    const pairs = settings.pairsCount
    setCards(generateMemoryCards(pairs))
    setFlipped([])
    setMatched([])
    setMoves(0)
    setTimer(0)
    setMessage('')
    startTimer()
    return () => stopTimer()
  }, [difficulty])

  const startTimer = () => { stopTimer(); timerRef.current = setInterval(() => setTimer(t => t + 1), 1000) }
  const stopTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null } }

  const handleClick = (index) => {
    if (locked || flipped.includes(index) || matched.includes(cards[index].pairId)) return
    const newFlipped = [...flipped, index]
    setFlipped(newFlipped)
    if (newFlipped.length === 2) {
      setLocked(true)
      setMoves(m => m + 1)
      const [a, b] = newFlipped
      if (cards[a].pairId === cards[b].pairId) {
        const newMatched = [...matched, cards[a].pairId]
        setMatched(newMatched)
        setFlipped([])
        setLocked(false)
        setMessage(getRandomMessage(game.correctMessages))
        if (newMatched.length === cards.length / 2) {
          stopTimer()
          setTimeout(() => {
            setFinished(true)
            onComplete(newMatched.length, cards.length / 2)
          }, 800)
        }
      } else {
        setMessage(getRandomMessage(game.incorrectMessages))
        setTimeout(() => { setFlipped([]); setLocked(false); setMessage('') }, 800)
      }
    }
  }

  if (finished) return null

  const cols = cards.length <= 12 ? 'grid-cols-4' : 'grid-cols-4'
  const bgCard = light ? 'bg-white border-gray-200' : 'bg-white/10 border-white/20'
  const textColor = light ? 'text-gray-800' : 'text-white'
  const subTextColor = light ? 'text-gray-500' : 'text-white/60'

  return (
    <div>
      <HintModal isOpen={showHint} onClose={() => setShowHint(false)} title={game.title} instructions={game.instructions} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-gray-100 rounded-full p-1">
          {DIFFICULTY_LEVELS.map(d => (
            <button key={d} onClick={() => setDifficulty(d)}
              className={`py-1.5 px-3 rounded-full text-xs font-medium transition-all ${difficulty === d ? 'bg-purple-100 text-purple-700 shadow-md' : 'text-gray-600 hover:text-gray-800'}`}>
              {getDifficultyLabel(d)}
            </button>
          ))}
        </div>
        <button onClick={() => setShowHint(true)} className={`w-8 h-8 rounded-full flex items-center justify-center ${light ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/20 hover:bg-white/30'}`}>
          <HelpCircle size={16} className={light ? 'text-gray-600' : 'text-white'} />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className={`text-xs rounded-full px-3 py-1 ${light ? 'bg-gray-100 text-gray-600' : 'bg-white/10 text-white/60'}`}>Найди все пары</span>
        <div className="flex-1" />
        <Timer size={14} className="text-gray-500" /><span className={`text-xs ${subTextColor}`}>{timer}с</span>
        <span className={`text-xs ml-2 ${subTextColor}`}>Ходы: {moves}</span>
        <Star size={14} className="text-yellow-500 fill-yellow-500" />
        <span className={`text-sm font-bold ${textColor}`}>{matched.length}/{cards.length / 2}</span>
      </div>

      <div className={`grid ${cols} gap-3 max-w-md mx-auto`}>
        {cards.map((card, i) => {
          const revealed = flipped.includes(i) || matched.includes(card.pairId)
          return (
            <button key={i} onClick={() => handleClick(i)} disabled={revealed || locked}
              className={`aspect-square rounded-2xl text-4xl flex items-center justify-center transition-all duration-300 ${
                revealed ? 'bg-gradient-to-br from-purple-400 to-pink-400 animate-flip shadow-lg' : 'bg-gray-100 hover:bg-gray-200 shadow-md hover:shadow-lg'
              }`}>
              {revealed ? card.emoji : '❓'}
            </button>
          )
        })}
      </div>
      {message && <div className="text-center mt-4 text-lg font-bold animate-slide-up text-green-500">{message}</div>}
    </div>
  )
}