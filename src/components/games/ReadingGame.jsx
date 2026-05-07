import { useState, useEffect } from 'react'
import { getBuildWord } from '../../utils/gameAlgorithms'
import { getRandomMessage, getGameDescription } from '../../utils/gameContent'
import { DIFFICULTY_LEVELS, getSettings, getDifficultyLabel } from '../../utils/gameSettings'
import { Star } from 'lucide-react'

export default function ReadingGame({ game, onComplete }) {
  const desc = getGameDescription('reading')
  const [difficulty, setDifficulty] = useState('medium')
  const [level, setLevel] = useState(1)
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

  const settings = getSettings('reading', difficulty)

  useEffect(() => {
    if (!finished) {
      setLoading(true)
      getBuildWord(level).then(w => {
        setWordData(w)
        setAvailable(w.word.split('').sort(() => Math.random() - 0.5))
        setBuilt([])
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

  const addLetter = (letter, index) => { if (showResult) return; setBuilt([...built, letter]); setAvailable(available.filter((_, i) => i !== index)) }
  const removeLetter = (index) => { if (showResult) return; setAvailable([...available, built[index]]); setBuilt(built.filter((_, i) => i !== index)) }

  const checkWord = () => {
    const correct = built.join('') === wordData.word
    setIsCorrect(correct)
    setShowResult(true)
    if (correct) { setScore(s => s + 1); setMessage(getRandomMessage(desc.correct)) }
    else { setMessage(getRandomMessage(desc.incorrect)) }
  }

  const handleNext = () => {
    if (round + 1 < settings.wordsCount) setRound(r => r + 1)
    else if (level < settings.maxLevel) { setLevel(l => l + 1); setRound(0) }
    else { setFinished(true); onComplete(score, settings.wordsCount * settings.maxLevel) }
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
        <span className="text-white/60 text-sm">{round + 1}/{settings.wordsCount}</span>
        <Star size={16} className="text-yellow-400 fill-yellow-400" /><span className="text-white font-bold">{score}</span>
      </div>
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center">
        <div className="text-6xl mb-6">{wordData?.image}</div>
        <div className="flex justify-center gap-2 min-h-[60px] mb-6 flex-wrap bg-white/5 rounded-2xl p-4 border-2 border-dashed border-white/20">
          {built.length === 0 && !showResult && <span className="text-white/20 text-lg">Кликни на буквы внизу</span>}
          {built.map((l, i) => (
            <button key={i} onClick={() => removeLetter(i)} disabled={showResult} className="w-14 h-14 bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-2xl font-bold rounded-2xl">{l}</button>
          ))}
        </div>
        <div className="flex justify-center gap-2 flex-wrap">
          {available.map((l, i) => (
            <button key={i} onClick={() => addLetter(l, i)} disabled={showResult} className="w-14 h-14 bg-white/20 hover:bg-white/30 text-white text-2xl font-bold rounded-2xl">{l}</button>
          ))}
        </div>
        {showResult && (
          <div className="mt-6">
            <div className={`text-xl font-bold mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>{message}</div>
            {!isCorrect && <p className="text-white/50 text-sm mb-4">Правильно: {wordData?.word}</p>}
            <button onClick={handleNext} className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-8 py-3 rounded-full font-bold">Далее →</button>
          </div>
        )}
        {!showResult && built.length === wordData?.word.length && (
          <button onClick={checkWord} className="mt-6 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-bold">Проверить ✓</button>
        )}
      </div>
    </div>
  )
}