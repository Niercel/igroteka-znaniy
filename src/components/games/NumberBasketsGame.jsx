import { useState, useEffect } from 'react'
import { Star, HelpCircle, Settings } from 'lucide-react'
import { getSettings, getDifficultyLabel } from '../../utils/gameSettings'
import { getRandomMessage } from '../../utils/gameContent'
import HintModal from '../HintModal'

const ITEMS = ['🍎','🍊','🍇','🍒','🥝','🍌','🍉','🥕','🌽','🧸']

export default function NumberBasketsGame({ game, onComplete, difficulty, onDifficultyChangeRequest, light }) {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [target, setTarget] = useState(0)
  const [items, setItems] = useState([])
  const [basket, setBasket] = useState([])
  const [finished, setFinished] = useState(false)
  const [message, setMessage] = useState('')
  const [result, setResult] = useState(null)
  const [showHint, setShowHint] = useState(false)

  const settings = getSettings('number-baskets', difficulty)
  const totalRounds = settings.rounds

  useEffect(() => {
    const t = Math.floor(Math.random() * settings.targetRange) + 1
    setTarget(t)
    const count = t + 3 + Math.floor(Math.random() * 5)
    setItems(Array.from({ length: count }, () => ITEMS[Math.floor(Math.random() * ITEMS.length)]))
    setBasket([])
    setResult(null)
    setMessage('')
    setRound(0)
    setScore(0)
    setFinished(false)
  }, [difficulty])

  useEffect(() => {
    if (!finished) {
      const t = Math.floor(Math.random() * settings.targetRange) + 1
      setTarget(t)
      const count = t + 3 + Math.floor(Math.random() * 5)
      setItems(Array.from({ length: count }, () => ITEMS[Math.floor(Math.random() * ITEMS.length)]))
      setBasket([])
      setResult(null)
      setMessage('')
    }
  }, [round])

  const addToBasket = (index) => {
    if (result) return
    setBasket(prev => [...prev, items[index]])
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const check = () => {
    const correct = basket.length === target
    setResult(correct ? 'correct' : 'wrong')
    setMessage(getRandomMessage(correct ? game.correctMessages : game.incorrectMessages))
    if (correct) setScore(s => s + 1)

    setTimeout(() => {
      if (round + 1 < totalRounds) {
        setRound(r => r + 1)
      } else {
        setFinished(true)
        onComplete(score + (correct ? 1 : 0), totalRounds)
      }
    }, 1000)
  }

  if (finished) return null

  const bgCard = light ? 'bg-white border-gray-200' : 'bg-white/10 border-white/20'
  const textColor = light ? 'text-gray-800' : 'text-white'

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
        <span className={`text-sm font-bold ${textColor}`}>{score}</span>
      </div>

      <div className={`${bgCard} backdrop-blur-xl border rounded-3xl p-6 text-center`}>
        <h2 className={`text-2xl font-bold mb-4 ${textColor}`}>Собери в корзину: <span className="text-5xl ml-2">{target}</span></h2>

        <div className="flex flex-wrap justify-center gap-2 min-h-[60px] bg-gray-100 rounded-2xl p-4 mb-4 border-2 border-dashed border-gray-300 transition-all">
          {basket.length === 0 && !result && <span className="text-gray-400">Корзина пуста</span>}
          {basket.map((item, i) => <span key={i} className="text-3xl animate-bounce-in" style={{ animationDelay: `${i * 50}ms` }}>{item}</span>)}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {items.map((item, i) => (
            <button key={i} onClick={() => addToBasket(i)} disabled={!!result}
              className="text-3xl w-12 h-12 bg-gray-200 rounded-xl hover:bg-gray-300 transition-all transform active:scale-75 hover:scale-110 shadow-lg">
              {item}
            </button>
          ))}
        </div>
        {!result && basket.length > 0 && (
          <button onClick={check} className="mt-4 bg-green-400 hover:bg-green-500 text-white px-6 py-2 rounded-full font-bold transition-transform hover:scale-105">Проверить</button>
        )}
        {result && (
          <div className="mt-4 animate-slide-up">
            <div className={`text-xl font-bold ${result === 'correct' ? 'text-green-500' : 'text-red-500'}`}>{message}</div>
          </div>
        )}
      </div>
    </div>
  )
}