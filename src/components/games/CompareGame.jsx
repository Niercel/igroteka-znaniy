import { useState, useEffect } from 'react'
import { Star, HelpCircle, Settings } from 'lucide-react'
import { getSettings, getDifficultyLabel } from '../../utils/gameSettings'
import { generateCompareQuestion } from '../../utils/gameAlgorithms'
import { getRandomMessage } from '../../utils/gameContent'
import HintModal from '../HintModal'

export default function CompareGame({ game, onComplete, difficulty, onDifficultyChangeRequest, light }) {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [question, setQuestion] = useState(null)
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [message, setMessage] = useState('')
  const [finished, setFinished] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const settings = getSettings('compare', difficulty)
  const totalRounds = settings.rounds

  useEffect(() => {
    setQuestion(generateCompareQuestion(settings.numberRange))
    setSelected(null)
    setShowResult(false)
    setMessage('')
    setRound(0)
    setScore(0)
    setFinished(false)
  }, [difficulty])

  useEffect(() => {
    if (!finished) {
      setQuestion(generateCompareQuestion(settings.numberRange))
      setSelected(null)
      setShowResult(false)
      setMessage('')
    }
  }, [round])

  const handleAnswer = (sign) => {
    if (showResult || finished || !question) return
    let correct = false
    if (sign === '>') correct = question.a > question.b
    else if (sign === '<') correct = question.a < question.b
    else correct = question.a === question.b

    setSelected(sign)
    setShowResult(true)
    setMessage(getRandomMessage(correct ? game.correctMessages : game.incorrectMessages))
    if (correct) setScore(s => s + 1)

    setTimeout(() => {
      if (round + 1 < totalRounds) {
        setRound(r => r + 1)
      } else {
        setFinished(true)
        onComplete(score + (correct ? 1 : 0), totalRounds)
      }
    }, 1500)
  }

  if (finished) return null
  if (!question) return null

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
        <div className="text-5xl mb-6">
          <span className={textColor}>{question.a}</span>
          <span className={`mx-4 ${light ? 'text-gray-400' : 'text-white/50'}`}>?</span>
          <span className={textColor}>{question.b}</span>
        </div>
        <div className="flex justify-center gap-4 mt-6">
          {['>', '<', '='].map(sign => {
            const isCorrect = showResult &&
              ((sign === '>' && question.a > question.b) || (sign === '<' && question.a < question.b) || (sign === '=' && question.a === question.b))
            const isWrong = showResult && selected === sign && !isCorrect
            return (
              <button key={sign} onClick={() => handleAnswer(sign)} disabled={showResult}
                className={`w-16 h-16 text-3xl rounded-2xl font-bold transition-all transform active:scale-90 ${
                  isCorrect ? 'bg-green-400/80 border-2 border-green-300 scale-110 text-white animate-pop'
                  : isWrong ? 'bg-red-400/80 border-2 border-red-300 text-white animate-shake'
                  : showResult ? 'bg-gray-100 text-gray-400'
                  : 'bg-gray-100 border-2 border-gray-300 text-gray-800 hover:bg-gray-200 hover:scale-105'
                }`}>{sign}</button>
            )
          })}
        </div>
        {showResult && (
          <div className="mt-6 animate-slide-up">
            <div className={`text-xl font-bold mb-2 ${selected === '>' && question.a > question.b || selected === '<' && question.a < question.b || selected === '=' && question.a === question.b ? 'text-green-500' : 'text-red-500'}`}>{message}</div>
          </div>
        )}
      </div>
    </div>
  )
}