import { useState, useEffect } from 'react'
import { generateLogicQuestion } from '../../utils/gameAlgorithms'
import { getRandomMessage, getGameDescription } from '../../utils/gameContent'
import { DIFFICULTY_LEVELS, getSettings, getDifficultyLabel } from '../../utils/gameSettings'
import { Star, Lightbulb } from 'lucide-react'

export default function LogicGame({ game, onComplete }) {
  const desc = getGameDescription('logic')
  const [difficulty, setDifficulty] = useState('medium')
  const [level, setLevel] = useState(1)
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [question, setQuestion] = useState(null)
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [finished, setFinished] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const settings = getSettings('logic', difficulty)

  useEffect(() => {
    if (!finished) {
      setLoading(true)
      generateLogicQuestion().then(q => {
        setQuestion(q)
        setSelected(null)
        setShowResult(false)
        setMessage('')
        setLoading(false)
      })
    }
  }, [level, round, difficulty, finished])

  const changeDifficulty = (diff) => {
    setDifficulty(diff)
    setLevel(1)
    setRound(0)
    setScore(0)
    setFinished(false)
  }

  const handleAnswer = (index) => {
    if (showResult || finished) return
    setSelected(index)
    setShowResult(true)
    const correct = index === question.correct
    if (correct) { setScore(s => s + 1); setMessage(getRandomMessage(desc.correct)) }
    else { setMessage(getRandomMessage(desc.incorrect)) }
    setTimeout(() => {
      if (round + 1 < settings.rounds) setRound(r => r + 1)
      else if (level < settings.maxLevel) { setLevel(l => l + 1); setRound(0) }
      else { setFinished(true); onComplete(score + (correct ? 1 : 0), settings.rounds * settings.maxLevel) }
    }, 2000)
  }

  if (finished) return null
  if (loading) return <div className="text-center py-10"><div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto"></div></div>

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
        <span className="text-white/60 text-sm">{round + 1}/{settings.rounds}</span>
        <Star size={16} className="text-yellow-400 fill-yellow-400" /><span className="text-white font-bold">{score}</span>
      </div>
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center">
        <Lightbulb size={32} className="text-yellow-400 mx-auto mb-4" />
        <h2 className="text-white text-2xl font-bold mb-2">{question.text}</h2>
        <p className="text-white/50 text-sm mb-6">{question.hint}</p>
        <div className="flex justify-center gap-4 flex-wrap mb-6">
          {question.items.map((item, i) => (
            <button key={i} onClick={() => handleAnswer(i)} disabled={showResult}
              className={`text-5xl w-24 h-24 rounded-2xl transition-all ${showResult ? i === question.correct ? 'bg-green-500/30 border-2 border-green-400 scale-110' : i === selected ? 'bg-red-500/30 border-2 border-red-400' : 'bg-white/5 text-white/30' : 'bg-white/10 border-2 border-white/10 hover:border-violet-400 hover:scale-105'}`}>{item}</button>
          ))}
        </div>
        {showResult && (
          <div>
            <div className={`text-xl font-bold mb-2 ${selected === question.correct ? 'text-green-400' : 'text-red-400'}`}>{message}</div>
            <p className="text-white/50 text-sm">{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  )
}