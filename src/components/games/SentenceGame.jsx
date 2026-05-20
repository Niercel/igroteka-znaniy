import { useState, useEffect } from 'react'
import { Star, HelpCircle } from 'lucide-react'
import { DIFFICULTY_LEVELS, getSettings, getDifficultyLabel } from '../../utils/gameSettings'
import { getSentence } from '../../utils/gameAlgorithms'
import { getRandomMessage } from '../../utils/gameContent'
import HintModal from '../HintModal'

export default function SentenceGame({ game, onComplete, light }) {
  const [difficulty, setDifficulty] = useState('medium')
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [sentenceData, setSentenceData] = useState(null)
  const [built, setBuilt] = useState([])
  const [available, setAvailable] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [message, setMessage] = useState('')
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showHint, setShowHint] = useState(false)

  const settings = getSettings('sentence', difficulty)
  const totalRounds = settings.rounds
  const contentLevel = { easy: 1, medium: 2, hard: 3 }[difficulty]

  useEffect(() => {
    setLoading(true)
    getSentence(game.id, contentLevel).then(data => {
      setSentenceData(data)
      setAvailable([...data.words].sort(() => Math.random() - 0.5))
      setBuilt([])
      setShowResult(false)
      setMessage('')
      setLoading(false)
    })
  }, [round, difficulty, game.id, contentLevel])

  const add = (word, i) => { if (showResult) return; setBuilt([...built, word]); setAvailable(available.filter((_, idx) => idx !== i)) }
  const remove = (i) => { if (showResult) return; setAvailable([...available, built[i]]); setBuilt(built.filter((_, idx) => idx !== i)) }

  const check = () => {
    const isCorrect = built.join(' ') === sentenceData.words.join(' ')
    setCorrect(isCorrect)
    setShowResult(true)
    if (isCorrect) { setScore(s => s + 1); setMessage(getRandomMessage(game.correctMessages)) }
    else setMessage(getRandomMessage(game.incorrectMessages))

    setTimeout(() => {
      if (round + 1 < totalRounds) setRound(r => r + 1)
      else { setFinished(true); onComplete(score + (isCorrect ? 1 : 0), totalRounds) }
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

      <div className={`${bgCard} backdrop-blur-xl border rounded-3xl p-6`}>
        <div className="flex flex-wrap justify-center gap-2 min-h-[60px] bg-gray-100 rounded-2xl p-4 mb-4 border-2 border-dashed border-gray-300">
          {built.length === 0 && !showResult && <span className="text-gray-400">Составьте предложение</span>}
          {built.map((word, i) => (
            <button key={i} onClick={() => remove(i)} disabled={showResult}
              className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-sm font-bold px-3 py-1.5 rounded-xl transform active:scale-90 transition-transform shadow-md">{word}</button>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {available.map((word, i) => (
            <button key={i} onClick={() => add(word, i)} disabled={showResult}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-bold px-3 py-1.5 rounded-xl transform active:scale-90 transition-transform shadow-md">{word}</button>
          ))}
        </div>
        {!showResult && built.length === sentenceData?.words.length && (
          <button onClick={check} className="mt-4 bg-green-400 hover:bg-green-500 text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform">Проверить</button>
        )}
        {showResult && (
          <div className="mt-4 text-center animate-slide-up">
            <div className={`text-xl font-bold ${correct ? 'text-green-500' : 'text-red-500'} animate-bounce`}>{message}</div>
          </div>
        )}
      </div>
    </div>
  )
}