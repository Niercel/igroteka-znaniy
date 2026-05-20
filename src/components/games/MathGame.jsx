import { useState, useEffect } from 'react'
import { Star, HelpCircle } from 'lucide-react'
import { generateMathQuestion } from '../../utils/gameAlgorithms'
import { getRandomMessage } from '../../utils/gameContent'
import { DIFFICULTY_LEVELS, getSettings, getDifficultyLabel } from '../../utils/gameSettings'
import HintModal from '../HintModal'

export default function MathGame({ game, onComplete, light }) {
  const [difficulty, setDifficulty] = useState('medium')
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [question, setQuestion] = useState(null)
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [streak, setStreak] = useState(0)
  const [message, setMessage] = useState('')
  const [showHint, setShowHint] = useState(false)

  const settings = getSettings('math', difficulty)
  const totalRounds = settings.rounds

  useEffect(() => {
    setQuestion(generateMathQuestion(settings.numberRange, settings.operators))
    setSelected(null)
    setShowResult(false)
    setMessage('')
  }, [round, difficulty])

  const handleAnswer = (opt) => {
    if (showResult) return
    setSelected(opt)
    setShowResult(true)
    const correct = opt === question.answer
    if (correct) {
      setStreak(s => s + 1)
      setScore(prev => prev + 1)
      setMessage(getRandomMessage(game.correctMessages))
    } else {
      setStreak(0)
      setMessage(getRandomMessage(game.incorrectMessages))
    }

    setTimeout(() => {
      if (round + 1 < totalRounds) {
        setRound(r => r + 1)
      } else {
        onComplete(score + (correct ? 1 : 0), totalRounds)
      }
    }, 1200)
  }

  if (!question) return null

  const bgCard = light ? 'bg-white border-gray-200' : 'bg-white/10 border-white/20'
  const textColor = light ? 'text-gray-800' : 'text-white'
  const subTextColor = light ? 'text-gray-500' : 'text-white/60'
  const btnDefault = light
    ? 'bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200'
    : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
  const diffActive = light ? 'bg-purple-100 text-purple-700 shadow-md' : 'bg-white text-purple-600 shadow-md'
  const diffInactive = light ? 'text-gray-600 hover:text-gray-800' : 'text-white/70 hover:text-white'

  const progress = (round / totalRounds) * 100

  return (
    <div>
      <HintModal isOpen={showHint} onClose={() => setShowHint(false)} title={game.title} instructions={game.instructions} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-gray-100 rounded-full p-1">
          {DIFFICULTY_LEVELS.map(d => (
            <button key={d} onClick={() => { setDifficulty(d); setRound(0); setScore(0) }}
              className={`py-1.5 px-3 rounded-full text-xs font-medium transition-all ${difficulty === d ? diffActive : diffInactive}`}>
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
          Пример {round + 1}/{totalRounds}
        </span>
        <div className="flex-1" />
        <Star size={14} className="text-yellow-500 fill-yellow-500" />
        <span className={`text-sm font-bold ${textColor}`}>{score}</span>
        {streak >= 3 && <span className="text-yellow-500 text-xs animate-pulse">🔥x{streak}</span>}
      </div>

      <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className={`${bgCard} backdrop-blur-xl border rounded-3xl p-6 text-center`}>
        <div className="text-5xl mb-4">🧮</div>
        <h2 className={`text-3xl font-bold mb-6 ${textColor}`}>{question.text}</h2>
        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
          {question.options.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(opt)} disabled={showResult}
              className={`h-16 rounded-2xl text-xl font-bold transition-all active:scale-90 ${
                showResult
                  ? opt === question.answer
                    ? 'bg-green-400/80 border-2 border-green-300 text-white scale-105 animate-pop'
                    : opt === selected
                      ? 'bg-red-400/80 border-2 border-red-300 text-white'
                      : 'bg-gray-100 text-gray-400'
                  : btnDefault
              }`}>{opt}</button>
          ))}
        </div>
        {showResult && (
          <div className="mt-4 animate-slide-up">
            <div className={`text-lg font-bold mb-1 ${selected === question.answer ? 'text-green-500' : 'text-red-500'}`}>{message}</div>
            <p className={`text-xs ${subTextColor}`}>{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  )
}