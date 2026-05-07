import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { generateMathQuestion } from '../../utils/gameAlgorithms'
import { getRandomMessage, getGameDescription } from '../../utils/gameContent'
import { DIFFICULTY_LEVELS, getSettings, getDifficultyLabel } from '../../utils/gameSettings'

export default function MathGame({ game, onComplete }) {
  const desc = getGameDescription('math')
  const [difficulty, setDifficulty] = useState('medium')
  const [level, setLevel] = useState(1)
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [question, setQuestion] = useState(null)
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [finished, setFinished] = useState(false)
  const [streak, setStreak] = useState(0)
  const [message, setMessage] = useState('')

  const settings = getSettings('math', difficulty)

  useEffect(() => {
    if (!finished) {
      setQuestion(generateMathQuestion(level, settings.numberRange, settings.operators))
      setSelected(null)
      setShowResult(false)
      setMessage('')
    }
  }, [level, round, difficulty, finished])

  const changeDifficulty = (diff) => {
    setDifficulty(diff)
    setLevel(1)
    setRound(0)
    setScore(0)
    setStreak(0)
    setFinished(false)
  }

  const handleAnswer = (option) => {
    if (showResult || finished) return
    setSelected(option)
    setShowResult(true)
    const correct = option === question.answer
    if (correct) { setScore(s => s + 1); setStreak(s => s + 1); setMessage(getRandomMessage(desc.correct)) }
    else { setStreak(0); setMessage(getRandomMessage(desc.incorrect)) }
    setTimeout(() => {
      if (round + 1 < settings.rounds) setRound(r => r + 1)
      else if (level < settings.maxLevel) { setLevel(l => l + 1); setRound(0) }
      else { setFinished(true); onComplete(score + (correct ? 1 : 0), settings.rounds * settings.maxLevel) }
    }, 1500)
  }

  if (finished) return null
  if (!question) return null

  return (
    <div>
      <div className="flex gap-1 mb-4 bg-white/5 rounded-full p-1">
        {DIFFICULTY_LEVELS.map(d => (
          <button key={d} onClick={() => changeDifficulty(d)}
            className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-all ${difficulty === d ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white' : 'text-white/50 hover:text-white'}`}>
            {getDifficultyLabel(d)}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-white/60 text-sm bg-white/5 rounded-full px-4 py-1">Уровень {level}/{settings.maxLevel}</span>
        <div className="flex-1" />
        <span className="text-white/60 text-sm">{round + 1}/{settings.rounds}</span>
        <Star size={16} className="text-yellow-400 fill-yellow-400" />
        <span className="text-white font-bold">{score}</span>
        {streak >= 3 && <span className="text-yellow-400 text-sm">🔥 x{streak}</span>}
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full mb-6">
        <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all" style={{ width: `${(round / settings.rounds) * 100}%` }} />
      </div>
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center">
        <div className="text-6xl mb-6">🧮</div>
        <h2 className="text-white text-4xl font-bold mb-8">{question.text}</h2>
        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
          {question.options.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(opt)} disabled={showResult}
              className={`h-20 rounded-2xl text-2xl font-bold transition-all ${showResult ? opt === question.answer ? 'bg-green-500/40 border-2 border-green-400 scale-105' : opt === selected ? 'bg-red-500/40 border-2 border-red-400' : 'bg-white/5 text-white/30' : 'bg-white/10 border-2 border-white/10 hover:border-violet-400 text-white hover:scale-105'}`}>{opt}</button>
          ))}
        </div>
        {showResult && (
          <div className="mt-6">
            <div className={`text-xl font-bold mb-2 ${selected === question.answer ? 'text-green-400' : 'text-red-400'}`}>{message}</div>
            <p className="text-white/50 text-sm">{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  )
}