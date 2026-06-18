import { useState, useEffect } from 'react'
import { Star, Lightbulb, HelpCircle, Settings } from 'lucide-react'
import { getSettings, getDifficultyLabel } from '../../utils/gameSettings'
import { generateLogicQuestion } from '../../utils/gameAlgorithms'
import { getRandomMessage } from '../../utils/gameContent'
import HintModal from '../HintModal'

export default function LogicGame({ game, onComplete, difficulty, onDifficultyChangeRequest, light }) {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [question, setQuestion] = useState(null)
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [finished, setFinished] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const settings = getSettings('logic', difficulty)
  const totalRounds = settings.rounds

  useEffect(() => {
    setRound(0)
    setScore(0)
    setFinished(false)
  }, [difficulty])

  useEffect(() => {
    if (!finished) {
      setLoading(true)
      generateLogicQuestion(game.id, difficulty).then(q => {
        setQuestion(q)
        setSelected(null)
        setShowResult(false)
        setMessage('')
        setLoading(false)
      })
    }
  }, [round, difficulty, finished, game.id])

  const handleAnswer = (index) => {
    if (showResult || finished) return
    setSelected(index)
    setShowResult(true)
    const correct = index === question.correct
    if (correct) { setScore(s => s + 1); setMessage(getRandomMessage(game.correctMessages)) }
    else setMessage(getRandomMessage(game.incorrectMessages))
    setTimeout(() => {
      if (round + 1 < totalRounds) setRound(r => r + 1)
      else { setFinished(true); onComplete(score + (correct ? 1 : 0), totalRounds) }
    }, 2000)
  }

  if (finished) return null
  if (loading) return <div className="text-center py-10"><div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>

  const bgCard = light ? 'bg-white border-gray-200' : 'bg-white/10 border-white/20'
  const textColor = light ? 'text-gray-800' : 'text-white'
  const subTextColor = light ? 'text-gray-500' : 'text-white/60'

  return (
    <div>
      <HintModal isOpen={showHint} onClose={() => setShowHint(false)} title={game.title} instructions={game.instructions} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${light ? 'text-gray-700' : 'text-white'}`}>{getDifficultyLabel(difficulty)}</span>
          <button onClick={onDifficultyChangeRequest} className={`w-8 h-8 rounded-full flex items-center justify-center ${light ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/20 hover:bg-white/30'}`}><Settings size={16} className={light ? 'text-gray-600' : 'text-white'} /></button>
        </div>
        <button onClick={() => setShowHint(true)} className={`w-8 h-8 rounded-full flex items-center justify-center ${light ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/20 hover:bg-white/30'}`}><HelpCircle size={16} className={light ? 'text-gray-600' : 'text-white'} /></button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className={`text-xs rounded-full px-3 py-1 ${light ? 'bg-gray-100 text-gray-600' : 'bg-white/10 text-white/60'}`}>Раунд {round + 1}/{totalRounds}</span>
        <div className="flex-1" />
        <Star size={14} className="text-yellow-500 fill-yellow-500" />
        <span className={`text-sm font-bold ${textColor}`}>{score}</span>
      </div>

      <div className={`${bgCard} backdrop-blur-xl border rounded-3xl p-6 text-center`}>
        <Lightbulb size={28} className="text-yellow-500 mx-auto mb-3" />
        <h2 className={`text-xl font-bold mb-2 ${textColor}`}>{question.text}</h2>
        <p className={`text-sm mb-6 ${subTextColor}`}>{question.hint}</p>
        <div className="flex justify-center gap-4 flex-wrap mb-6">
          {question.items.map((item, i) => (
            <button key={i} onClick={() => handleAnswer(i)} disabled={showResult}
              className={`text-5xl w-20 h-20 rounded-2xl transition-all active:scale-90 shadow-lg ${
                showResult ? (i === question.correct ? 'bg-green-400/80 border-2 border-green-300 scale-110 animate-pop' : i === selected ? 'bg-red-400/80 border-2 border-red-300 animate-shake' : 'bg-gray-100 text-gray-400')
                : 'bg-gray-100 border-2 border-gray-300 text-gray-800 hover:bg-gray-200 hover:scale-105'
              }`}>{item}</button>
          ))}
        </div>
        {showResult && (
          <div className="animate-slide-up">
            <div className={`text-xl font-bold mb-2 ${selected === question.correct ? 'text-green-500' : 'text-red-500'}`}>{message}</div>
            <p className={`text-sm ${subTextColor}`}>{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  )
}