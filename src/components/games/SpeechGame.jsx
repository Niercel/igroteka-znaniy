import { useState, useEffect, useRef } from 'react'
import { getSpeechWord, checkPronunciation } from '../../utils/gameAlgorithms'
import { getRandomMessage, getGameDescription } from '../../utils/gameContent'
import { DIFFICULTY_LEVELS, getSettings, getDifficultyLabel } from '../../utils/gameSettings'
import { Star, Mic, MicOff, Volume2 } from 'lucide-react'

export default function SpeechGame({ game, onComplete }) {
  const desc = getGameDescription('speech')
  const [difficulty, setDifficulty] = useState('medium')
  const [level, setLevel] = useState(1)
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [wordData, setWordData] = useState(null)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [accuracy, setAccuracy] = useState(0)
  const [message, setMessage] = useState('')
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const recognitionRef = useRef(null)

  const settings = getSettings('speech', difficulty)

  useEffect(() => {
    if (!finished) {
      setLoading(true)
      getSpeechWord(level).then(w => {
        setWordData(w)
        setTranscript('')
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

  const speakWord = () => {
    if (!wordData?.word) return
    const u = new SpeechSynthesisUtterance(wordData.word)
    u.lang = 'ru-RU'; u.rate = 0.7
    speechSynthesis.speak(u)
  }

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { setMessage('Микрофон не поддерживается'); return }
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.lang = 'ru-RU'
    recognitionRef.current.onstart = () => setListening(true)
    recognitionRef.current.onend = () => setListening(false)
    recognitionRef.current.onresult = (e) => {
      const spoken = e.results[0][0].transcript
      setTranscript(spoken)
      const acc = checkPronunciation(wordData.word, spoken)
      setAccuracy(acc)
      setShowResult(true)
      if (acc >= settings.accuracyRequired) { setScore(s => s + 1); setMessage(getRandomMessage(desc.correct)) }
      else { setMessage(getRandomMessage(desc.incorrect)) }
    }
    recognitionRef.current.start()
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
        <button onClick={speakWord} className="bg-white/10 hover:bg-white/20 text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"><Volume2 size={28} /></button>
        <button onClick={startListening} disabled={listening || showResult}
          className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 transition-all ${listening ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-violet-500 to-indigo-500 hover:scale-110'}`}>
          {listening ? <MicOff size={48} /> : <Mic size={48} />}
        </button>
        <p className="text-white/40 text-sm mb-4">{listening ? '🎤 Говорите...' : 'Нажмите на микрофон'}</p>
        {transcript && (
          <div className="bg-white/5 rounded-2xl p-4 mb-4">
            <p className="text-white/50 text-xs">Вы сказали:</p>
            <p className="text-white text-xl font-bold">{transcript}</p>
            {showResult && <p className={`text-lg font-bold mt-2 ${accuracy >= settings.accuracyRequired ? 'text-green-400' : 'text-red-400'}`}>Совпадение: {accuracy}%</p>}
          </div>
        )}
        {showResult && (
          <div>
            <div className={`text-xl font-bold mb-2 ${accuracy >= settings.accuracyRequired ? 'text-green-400' : 'text-red-400'}`}>{message}</div>
            <button onClick={handleNext} className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-8 py-3 rounded-full font-bold mt-4">Далее →</button>
          </div>
        )}
      </div>
    </div>
  )
}