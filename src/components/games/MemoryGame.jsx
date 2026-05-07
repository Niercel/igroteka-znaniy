import { useState, useEffect, useRef } from 'react'
import { generateMemoryCards } from '../../utils/gameAlgorithms'
import { getRandomMessage, getGameDescription } from '../../utils/gameContent'
import { DIFFICULTY_LEVELS, getSettings, getDifficultyLabel } from '../../utils/gameSettings'
import { Star, Timer } from 'lucide-react'

export default function MemoryGame({ game, onComplete }) {
  const desc = getGameDescription('memory')
  const [difficulty, setDifficulty] = useState('medium')
  const [level, setLevel] = useState(1)
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [locked, setLocked] = useState(false)
  const [timer, setTimer] = useState(0)
  const [message, setMessage] = useState('')
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState(0)
  const timerRef = useRef(null)

  const settings = getSettings('memory', difficulty)

  useEffect(() => {
    if (finished) return
    const generated = generateMemoryCards(settings.pairsCount)
    setCards(generated)
    setFlipped([])
    setMatched([])
    setMoves(0)
    setTimer(0)
    setMessage('')
    startTimer()
    return () => stopTimer()
  }, [level, difficulty, finished])

  const startTimer = () => { stopTimer(); timerRef.current = setInterval(() => setTimer(t => t + 1), 1000) }
  const stopTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null } }

  const changeDifficulty = (diff) => {
    setDifficulty(diff)
    setLevel(1)
    setScore(0)
    setFinished(false)
    setMatched([])
    stopTimer()
  }

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
        setMessage(getRandomMessage(desc.correct))
        setScore(s => s + 1)
        if (newMatched.length === cards.length / 2) {
          stopTimer()
          setTimeout(() => {
            if (level < settings.maxLevel) setLevel(l => l + 1)
            else { setFinished(true); onComplete(moves, cards.length / 2 * settings.maxLevel) }
          }, 1000)
        }
      } else {
        setMessage(getRandomMessage(desc.incorrect))
        setTimeout(() => { setFlipped([]); setLocked(false); setMessage('') }, 800)
      }
    }
  }

  if (finished) return null
  const cols = cards.length <= 12 ? 'grid-cols-4' : 'grid-cols-4'

  return (
    <div>
      <div className="flex gap-1 mb-4 bg-white/5 rounded-full p-1">
        {DIFFICULTY_LEVELS.map(d => (
          <button key={d} onClick={() => changeDifficulty(d)}
            className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-all ${difficulty === d ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white' : 'text-white/50 hover:text-white'}`}>{getDifficultyLabel(d)}</button>
        ))}
      </div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-white/60 text-sm bg-white/5 rounded-full px-4 py-1">Уровень {level}/{settings.maxLevel}</span>
        <div className="flex-1" />
        <Timer size={16} className="text-white/40" /><span className="text-white/60 text-sm">{timer}с</span>
        <span className="text-white/60 text-sm ml-2">Ходы: {moves}</span>
        <Star size={16} className="text-yellow-400 fill-yellow-400 ml-2" /><span className="text-white font-bold">{matched.length}/{cards.length / 2}</span>
      </div>
      <div className={`grid ${cols} gap-3 max-w-md mx-auto`}>
        {cards.map((card, i) => {
          const revealed = flipped.includes(i) || matched.includes(card.pairId)
          return (
            <button key={i} onClick={() => handleClick(i)} disabled={revealed || locked}
              className={`aspect-square rounded-2xl text-4xl flex items-center justify-center transition-all ${revealed ? 'bg-gradient-to-br from-violet-500 to-indigo-500' : 'bg-white/10 hover:bg-white/20'}`}>{revealed ? card.emoji : '❓'}</button>
          )
        })}
      </div>
      {message && <div className="text-center mt-4 text-lg font-bold text-green-400">{message}</div>}
    </div>
  )
}