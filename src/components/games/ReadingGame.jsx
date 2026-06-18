import { useState, useEffect } from 'react'
import { Star, HelpCircle, Settings } from 'lucide-react'
import { getSettings, getDifficultyLabel } from '../../utils/gameSettings'
import { getBuildWord } from '../../utils/gameAlgorithms'
import { getRandomMessage } from '../../utils/gameContent'
import HintModal from '../HintModal'

export default function ReadingGame({ game, onComplete, difficulty, onDifficultyChangeRequest, light }) {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [wordData, setWordData] = useState(null)
  const [built, setBuilt] = useState([])
  const [available, setAvailable] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [message, setMessage] = useState('')
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showHint, setShowHint] = useState(false)

  const settings = getSettings('reading', difficulty)
  const totalRounds = settings.wordsCount || settings.rounds

  useEffect(() => { setRound(0); setScore(0); setFinished(false) }, [difficulty])

  useEffect(() => {
    if (!finished) {
      setLoading(true)
      getBuildWord(game.id, difficulty).then(w => {
        setWordData(w)
        setAvailable(w.word.split('').sort(() => Math.random() - 0.5))
        setBuilt([])
        setShowResult(false)
        setMessage('')
        setLoading(false)
      })
    }
  }, [round, difficulty, finished, game.id])

  // Клавиатурный ввод: буквы + Enter для проверки
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showResult || finished) return

      // Enter – проверяем слово
      if (e.key === 'Enter') {
        e.preventDefault()
        if (built.length === wordData?.word.length) {
          check()
        }
        return
      }

      // Буквы
      const key = e.key.toUpperCase()
      const idx = available.indexOf(key)
      if (idx !== -1) addLetter(key, idx)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [available, built, showResult, finished, wordData])

  const addLetter = (letter, idx) => {
    if (showResult) return
    setBuilt([...built, letter])
    setAvailable(prev => prev.filter((_, i) => i !== idx))
  }
  const removeLetter = (idx) => {
    if (showResult) return
    setAvailable([...available, built[idx]])
    setBuilt(prev => prev.filter((_, i) => i !== idx))
  }

  const check = () => {
    const correct = built.join('') === wordData.word
    setIsCorrect(correct)
    setShowResult(true)
    setMessage(getRandomMessage(correct ? game.correctMessages : game.incorrectMessages))
    if (correct) setScore(s => s + 1)
    setTimeout(() => {
      if (round + 1 < totalRounds) setRound(r => r + 1)
      else { setFinished(true); onComplete(score + (correct ? 1 : 0), totalRounds) }
    }, 1200)
  }

  if (finished) return null
  if (loading) return <div className="text-center py-10"><div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>

  const bgCard = light ? 'bg-white border-gray-200' : 'bg-white/10 border-white/20'
  const textColor = light ? 'text-gray-800' : 'text-white'

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
        <span className={`text-xs rounded-full px-3 py-1 ${light ? 'bg-gray-100 text-gray-600' : 'bg-white/10 text-white/60'}`}>Слово {round + 1}/{totalRounds}</span>
        <div className="flex-1" />
        <Star size={14} className="text-yellow-500 fill-yellow-500" />
        <span className={`text-sm font-bold ${textColor}`}>{score}</span>
      </div>

      <div className={`${bgCard} backdrop-blur-xl border rounded-3xl p-6 text-center`}>
        <div className="text-6xl mb-6">{wordData?.image}</div>

        {/* Зона сборки */}
        <div className="flex justify-center gap-2 min-h-[60px] mb-6 flex-wrap bg-gray-100 rounded-2xl p-4 border-2 border-dashed border-gray-300">
          {built.length === 0 && !showResult && <span className="text-gray-400">Кликни на буквы или нажимай клавиши</span>}
          {built.map((l, i) => (
            <button key={i} onClick={() => removeLetter(i)} disabled={showResult}
              className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-400 text-white text-2xl font-bold rounded-2xl transform active:scale-90 transition-transform shadow-md">
              {l}
            </button>
          ))}
        </div>

        {/* Доступные буквы */}
        <div className="flex justify-center gap-2 flex-wrap">
          {available.map((l, i) => (
            <button key={i} onClick={() => addLetter(l, i)} disabled={showResult}
              className="w-14 h-14 bg-gray-200 hover:bg-gray-300 text-gray-800 text-2xl font-bold rounded-2xl transform active:scale-90 transition-transform shadow-md">
              {l}
            </button>
          ))}
        </div>

        <p className="text-gray-400 text-xs mt-2">Можно печатать буквы на клавиатуре • Enter — проверить</p>

        {showResult && (
          <div className="mt-6 animate-slide-up">
            <div className={`text-xl font-bold mb-2 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>{message}</div>
            {!isCorrect && <p className="text-gray-500 text-sm mb-4">Правильно: {wordData?.word}</p>}
          </div>
        )}

        {!showResult && built.length === wordData?.word.length && (
          <button onClick={check} className="mt-6 bg-green-400 hover:bg-green-500 text-white px-8 py-3 rounded-full font-bold transition-transform hover:scale-105">
            Проверить ✓
          </button>
        )}
      </div>
    </div>
  )
}