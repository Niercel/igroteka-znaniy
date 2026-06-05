import { useState, useEffect } from 'react'
import { Star, HelpCircle, Settings } from 'lucide-react'
import { DIFFICULTY_LEVELS, getSettings, getDifficultyLabel } from '../../utils/gameSettings'
import { getRandomMessage } from '../../utils/gameContent'
import { loadGameContent } from '../../utils/gameAlgorithms'
import HintModal from '../HintModal'

export default function ChooseWordGame({ game, onComplete, difficulty, onDifficultyChangeRequest, light }) {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [question, setQuestion] = useState(null)
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [message, setMessage] = useState('')
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showHint, setShowHint] = useState(false)

  const settings = getSettings('choose-word', difficulty)
  const totalRounds = settings.rounds
  const contentLevel = { easy: 1, medium: 2, hard: 3 }[difficulty]

  useEffect(() => {
    if (finished) return
    setLoading(true)
    loadGameContent(game.id).then(items => {
      const filtered = items.filter(i => i.level === contentLevel && i.word && i.options)
      if (filtered.length > 0) {
        setQuestion(filtered[Math.floor(Math.random() * filtered.length)])
        setSelected(null)
        setShowResult(false)
        setMessage('')
      }
      setLoading(false)
    })
    setRound(0)
    setScore(0)
    setFinished(false)
  }, [difficulty, game.id, contentLevel])

  useEffect(() => {
    if (finished) return
    setLoading(true)
    loadGameContent(game.id).then(items => {
      const filtered = items.filter(i => i.level === contentLevel && i.word && i.options)
      if (filtered.length > 0) {
        setQuestion(filtered[Math.floor(Math.random() * filtered.length)])
        setSelected(null)
        setShowResult(false)
        setMessage('')
      }
      setLoading(false)
    })
  }, [round])

  const handleAnswer = (word) => {
    if (showResult || finished) return
    setSelected(word)
    setShowResult(true)
    const correct = word === question.word
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
  if (!question) return <div className="text-center py-10 text-gray-500">Нет данных</div>

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
        <div className="text-6xl mb-6">{question.image}</div>
        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
          {question.options.map(word => (
            <button key={word} onClick={() => handleAnswer(word)} disabled={showResult}
              className={`py-3 px-4 rounded-xl text-lg font-medium transition-all active:scale-90 shadow-lg ${
                showResult
                  ? word === question.word ? 'bg-green-400/80 border-2 border-green-300 text-white scale-105 animate-pop'
                  : word === selected ? 'bg-red-400/80 border-2 border-red-300 text-white'
                  : 'bg-gray-100 text-gray-400'
                : 'bg-gray-100 border-2 border-gray-300 text-gray-800 hover:bg-gray-200 hover:scale-105'
              }`}>{word}</button>
          ))}
        </div>
        {showResult && (
          <div className="mt-4 animate-slide-up">
            <div className={`text-xl font-bold ${selected === question.word ? 'text-green-500' : 'text-red-500'}`}>{message}</div>
          </div>
        )}
      </div>
    </div>
  )
}