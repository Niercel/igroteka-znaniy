import { useState, useEffect } from 'react'
import { Star, HelpCircle, Settings } from 'lucide-react'
import { DIFFICULTY_LEVELS, getSettings, getDifficultyLabel } from '../../utils/gameSettings'
import { getRandomMessage } from '../../utils/gameContent'
import { loadGameContent } from '../../utils/gameAlgorithms'
import HintModal from '../HintModal'

export default function MatchingGame({ game, onComplete, difficulty, onDifficultyChangeRequest, light }) {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [pairs, setPairs] = useState([])
  const [selected, setSelected] = useState([])
  const [matched, setMatched] = useState([])
  const [message, setMessage] = useState('')
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showHint, setShowHint] = useState(false)

  const settings = getSettings('matching', difficulty)
  const totalRounds = settings.rounds
  const pairsPerRound = settings.pairsPerRound

  useEffect(() => {
    if (finished) return
    setLoading(true)
    loadGameContent(game.id).then(data => {
      const shuffled = data.sort(() => Math.random() - 0.5).slice(0, pairsPerRound)
      const cards = shuffled.flatMap(pair => [
        { id: pair.pair[0], emoji: pair.pair[0], pairId: pair.order },
        { id: pair.pair[1], emoji: pair.pair[1], pairId: pair.order },
      ]).sort(() => Math.random() - 0.5)
      setPairs(cards)
      setSelected([])
      setMatched([])
      setMessage('')
      setLoading(false)
    })
    setRound(0)
    setScore(0)
    setFinished(false)
  }, [difficulty, game.id])

  useEffect(() => {
    if (finished) return
    setLoading(true)
    loadGameContent(game.id).then(data => {
      const shuffled = data.sort(() => Math.random() - 0.5).slice(0, pairsPerRound)
      const cards = shuffled.flatMap(pair => [
        { id: pair.pair[0], emoji: pair.pair[0], pairId: pair.order },
        { id: pair.pair[1], emoji: pair.pair[1], pairId: pair.order },
      ]).sort(() => Math.random() - 0.5)
      setPairs(cards)
      setSelected([])
      setMatched([])
      setMessage('')
      setLoading(false)
    })
  }, [round])

  const handleSelect = (card) => {
    if (selected.length === 2 || matched.includes(card.pairId)) return
    const newSel = [...selected, card]
    setSelected(newSel)
    if (newSel.length === 2) {
      if (newSel[0].pairId === newSel[1].pairId) {
        setMatched(prev => [...prev, newSel[0].pairId])
        setScore(s => s + 1)
        setMessage(getRandomMessage(game.correctMessages))
        setSelected([])
        if (matched.length + 1 === pairsPerRound) {
          if (round + 1 < totalRounds) {
            setTimeout(() => setRound(r => r + 1), 500)
          } else {
            setTimeout(() => { setFinished(true); onComplete(score + 1, totalRounds) }, 500)
          }
        }
      } else {
        setMessage(getRandomMessage(game.incorrectMessages))
        setTimeout(() => { setSelected([]); setMessage('') }, 800)
      }
    }
  }

  if (finished) return null
  if (loading) return <div className="text-center py-10"><div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>

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

      <div className={`${light ? 'bg-white border-gray-200' : 'bg-white/10 border-white/20'} backdrop-blur-xl border rounded-3xl p-6`}>
        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
          {pairs.map((card, index) => {
            const isSelected = selected.some(s => s.id === card.id)
            const isMatched = matched.includes(card.pairId)
            return (
              <button key={`${card.id}-${index}`} onClick={() => handleSelect(card)}
                disabled={isMatched || selected.length === 2}
                className={`text-4xl aspect-square rounded-2xl transition-all transform active:scale-90 shadow-lg ${
                  isMatched ? 'bg-green-400/80 scale-75 opacity-50 animate-pop'
                  : isSelected ? 'bg-purple-400/80 scale-110 shadow-xl'
                  : 'bg-gray-100 hover:bg-gray-200 hover:scale-105'
                }`}>
                {card.emoji}
              </button>
            )
          })}
        </div>
        {message && <div className="text-center mt-4 text-lg font-bold animate-slide-up text-green-500">{message}</div>}
      </div>
    </div>
  )
}