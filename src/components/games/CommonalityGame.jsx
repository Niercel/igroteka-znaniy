import { useState, useEffect } from 'react'
import { Star, Lightbulb, HelpCircle } from 'lucide-react'
import { DIFFICULTY_LEVELS, getSettings, getDifficultyLabel } from '../../utils/gameSettings'
import { getRandomMessage } from '../../utils/gameContent'
import { loadGameContent } from '../../utils/gameAlgorithms'
import HintModal from '../HintModal'

export default function CommonalityGame({ game, onComplete, light }) {
  const [difficulty, setDifficulty] = useState('medium')
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [question, setQuestion] = useState(null)
  const [options, setOptions] = useState([])
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [message, setMessage] = useState('')
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showHint, setShowHint] = useState(false)

  const settings = getSettings('commonality', difficulty)
  const totalRounds = settings.rounds

  useEffect(() => {
    if (finished) return
    setLoading(true)
    loadGameContent(game.id).then(cats => {
      const main = cats[Math.floor(Math.random() * cats.length)]
      const items = [...main.emojis].sort(() => Math.random() - 0.5).slice(0, 3)
      const wrong = cats.filter(c => c.categoryName !== main.categoryName)
        .sort(() => Math.random() - 0.5).slice(0, 2).map(c => c.categoryName)
      const all = [main.categoryName, ...wrong].sort(() => Math.random() - 0.5)
      setQuestion({ items, correct: main.categoryName })
      setOptions(all)
      setSelected(null)
      setShowResult(false)
      setMessage('')
      setLoading(false)
    })
  }, [round, difficulty, finished, game.id])

  const handleAnswer = (cat) => {
    if (showResult || finished) return
    setSelected(cat)
    setShowResult(true)
    const correct = cat === question.correct
    if (correct) {
      setScore(s => s + 1)
      setMessage(getRandomMessage(game.correctMessages))
    } else {
      setMessage(getRandomMessage(game.incorrectMessages))
    }
    setTimeout(() => {
      if (round + 1 < totalRounds) setRound(r => r + 1)
      else { setFinished(true); onComplete(score + (correct ? 1 : 0), totalRounds) }
    }, 1500)
  }

  if (finished) return null
  if (loading) return <div className="text-center py-10"><div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>

  const bgCard = light ? 'bg-white border-gray-200' : 'bg-white/10 border-white/20'
  const textColor = light ? 'text-gray-800' : 'text-white'

  return (
    <div>
      <HintModal isOpen={showHint} onClose={() => setShowHint(false)} title={game.title} instructions={game.instructions} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-gray-100 rounded-full p-1">
          {DIFFICULTY_LEVELS.map(d => (
            <button key={d} onClick={() => { setDifficulty(d); setRound(0); setScore(0); setFinished(false) }}
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
        <span className={`text-xs rounded-full px-3 py-1 ${light ? 'bg-gray-100 text-gray-600' : 'bg-white/10 text-white/60'}`}>
          Раунд {round + 1}/{totalRounds}
        </span>
        <div className="flex-1" />
        <Star size={14} className="text-yellow-500 fill-yellow-500" />
        <span className={`text-sm font-bold ${textColor}`}>{score}</span>
      </div>

      <div className={`${bgCard} backdrop-blur-xl border rounded-3xl p-6 text-center`}>
        <Lightbulb size={28} className="text-yellow-500 mx-auto mb-3" />
        <h2 className={`text-xl font-bold mb-2 ${textColor}`}>Что общего?</h2>
        <div className="flex justify-center gap-4 text-5xl mb-6">
          {question.items.map((item, i) => (
            <span key={i} className="bg-gray-100 rounded-xl w-16 h-16 flex items-center justify-center animate-slide-up shadow-md" style={{ animationDelay: `${i * 100}ms` }}>{item}</span>
          ))}
        </div>
        <div className="flex justify-center gap-3 flex-wrap">
          {options.map(opt => (
            <button key={opt} onClick={() => handleAnswer(opt)} disabled={showResult}
              className={`px-5 py-3 rounded-xl text-lg font-medium transition-all active:scale-90 ${
                showResult
                  ? opt === question.correct ? 'bg-green-400/80 border-2 border-green-300 text-white scale-105 animate-pop'
                  : opt === selected ? 'bg-red-400/80 border-2 border-red-300 text-white animate-shake'
                  : 'bg-gray-100 text-gray-400'
                : 'bg-gray-100 border-2 border-gray-300 text-gray-800 hover:bg-gray-200 hover:scale-105'
              }`}>{opt}</button>
          ))}
        </div>
        {showResult && (
          <div className="mt-6 animate-slide-up">
            <div className={`text-xl font-bold mb-2 ${selected === question.correct ? 'text-green-500' : 'text-red-500'}`}>{message}</div>
            {selected !== question.correct && <p className="text-gray-500 text-sm">Правильно: {question.correct}</p>}
          </div>
        )}
      </div>
    </div>
  )
}