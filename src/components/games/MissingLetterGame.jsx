import { useState, useEffect } from 'react'
import { Star, HelpCircle, Settings } from 'lucide-react'
import { getSettings, getDifficultyLabel } from '../../utils/gameSettings'
import { getMissingLetter } from '../../utils/gameAlgorithms'
import { getRandomMessage } from '../../utils/gameContent'
import HintModal from '../HintModal'

export default function MissingLetterGame({ game, onComplete, difficulty, onDifficultyChangeRequest, light }) {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [question, setQuestion] = useState(null)
  const [answers, setAnswers] = useState([])
  const [currentGap, setCurrentGap] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [message, setMessage] = useState('')
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showHint, setShowHint] = useState(false)

  const settings = getSettings('missing-letter', difficulty)
  const totalRounds = settings.rounds

  useEffect(() => { setRound(0); setScore(0); setFinished(false) }, [difficulty])

  useEffect(() => {
    if (!finished) {
      setLoading(true)
      getMissingLetter(game.id, difficulty).then(data => {
        if (data) {
          setQuestion(data)
          setAnswers(new Array(data.missingIndices.length).fill(''))
          setCurrentGap(0)
          setShowResult(false)
          setMessage('')
        }
        setLoading(false)
      })
    }
  }, [round, difficulty, finished, game.id])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showResult || finished || !question) return
      const key = e.key.toUpperCase()
      if (key.length === 1 && question.options.includes(key)) {
        handleAnswer(key)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showResult, finished, question, answers, currentGap])

  const handleAnswer = (letter) => {
    if (showResult || finished) return
    const newAnswers = [...answers]
    newAnswers[currentGap] = letter
    setAnswers(newAnswers)
    if (currentGap < question.missingIndices.length - 1) {
      setCurrentGap(prev => prev + 1)
    } else {
      checkAnswers(newAnswers)
    }
  }

  const checkAnswers = (ans) => {
    const wordArray = question.word.split('')
    let correct = true
    question.missingIndices.forEach((idx, i) => {
      if (ans[i]?.toUpperCase() !== wordArray[idx]?.toUpperCase()) correct = false
    })
    setShowResult(true)
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
  if (!question) return <div className="text-center py-10 text-gray-500">Нет данных для этого уровня</div>

  const wordArray = question.word.split('')
  const displayWord = wordArray.map((ch, idx) => {
    if (question.missingIndices.includes(idx)) {
      const gapIdx = question.missingIndices.indexOf(idx)
      return (
        <span key={idx} className={`inline-block w-8 h-10 border-b-2 mx-1 text-center text-xl font-bold ${gapIdx === currentGap && !showResult ? 'border-purple-400 animate-pulse' : 'border-gray-400'}`}>
          {answers[gapIdx] || ''}
        </span>
      )
    }
    return <span key={idx} className="mx-1 text-xl text-gray-800">{ch}</span>
  })

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
        <span className={`text-sm font-bold ${light ? 'text-gray-800' : 'text-white'}`}>{score}</span>
      </div>

      <div className={`${light ? 'bg-white border-gray-200' : 'bg-white/10 border-white/20'} backdrop-blur-xl border rounded-3xl p-6 text-center`}>
        <h2 className="text-3xl font-bold mb-6 flex justify-center items-center flex-wrap text-gray-800">{displayWord}</h2>
        {!showResult && <p className="text-gray-500 text-sm mb-4">Выбери букву или нажми на клавиатуре</p>}
        <div className="flex justify-center gap-4 flex-wrap">
          {question.options.map(opt => {
            const isCorrectForAnyGap = question.missingIndices.some(idx => wordArray[idx]?.toUpperCase() === opt?.toUpperCase())
            const isWrong = showResult && answers.includes(opt) && !isCorrectForAnyGap
            return (
              <button key={opt} onClick={() => handleAnswer(opt)} disabled={showResult}
                className={`w-16 h-16 text-3xl rounded-xl transition-all active:scale-90 shadow-lg ${
                  showResult
                    ? isCorrectForAnyGap ? 'bg-green-400/80 border-2 border-green-300 animate-pop'
                    : isWrong ? 'bg-red-400/80 border-2 border-red-300'
                    : 'bg-gray-100 text-gray-400'
                  : 'bg-gray-100 border-2 border-gray-300 text-gray-800 hover:bg-gray-200 hover:scale-105'
                }`}>{opt}</button>
            )
          })}
        </div>
        {showResult && <div className="mt-4 animate-slide-up"><div className={`text-xl font-bold ${message.includes('🎉') ? 'text-green-500' : 'text-red-500'}`}>{message}</div></div>}
      </div>
    </div>
  )
}