import { useState, useEffect, useRef } from 'react'
import { Star, Mic, MicOff, HelpCircle } from 'lucide-react'
import { DIFFICULTY_LEVELS, getSettings, getDifficultyLabel } from '../../utils/gameSettings'
import { getSentenceForReading, checkSentenceAccuracy } from '../../utils/gameAlgorithms'
import { getRandomMessage } from '../../utils/gameContent'
import HintModal from '../HintModal'

export default function SentenceReadingGame({ game, onComplete, light }) {
  const [difficulty, setDifficulty] = useState('medium')
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [sentenceData, setSentenceData] = useState(null)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [accuracy, setAccuracy] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [wordsMatched, setWordsMatched] = useState(0)
  const [totalWords, setTotalWords] = useState(0)
  const [message, setMessage] = useState('')
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showHint, setShowHint] = useState(false)
  const recognitionRef = useRef(null)
  const startTimeRef = useRef(null)

  const settings = getSettings('sentence-reading', difficulty)
  const totalRounds = settings.rounds
  const contentLevel = { easy: 1, medium: 2, hard: 3 }[difficulty]

  useEffect(() => {
    if (!finished) {
      setLoading(true)
      getSentenceForReading(game.id, contentLevel).then(data => {
        setSentenceData(data)
        setTranscript('')
        setShowResult(false)
        setMessage('')
        setLoading(false)
      })
    }
  }, [round, difficulty, finished, game.id, contentLevel])

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { setMessage('Микрофон не поддерживается'); return }
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.lang = 'ru-RU'
    recognitionRef.current.interimResults = false
    recognitionRef.current.onstart = () => {
      setListening(true)
      startTimeRef.current = Date.now()
    }
    recognitionRef.current.onend = () => setListening(false)
    recognitionRef.current.onresult = (e) => {
      const spoken = e.results[0][0].transcript
      setTranscript(spoken)
      const { accuracy: acc, speed: spd, wordsMatched: wm, totalWords: tw } = checkSentenceAccuracy(
        sentenceData.text,
        spoken,
        startTimeRef.current
      )
      setAccuracy(acc)
      setSpeed(spd)
      setWordsMatched(wm)
      setTotalWords(tw)
      setShowResult(true)
      if (acc >= settings.accuracyRequired) {
        setScore(s => s + 1)
        setMessage(getRandomMessage(game.correctMessages))
      } else {
        setMessage(getRandomMessage(game.incorrectMessages))
      }
    }
    recognitionRef.current.start()
  }

  const nextRound = () => {
    if (round + 1 < totalRounds) setRound(r => r + 1)
    else { setFinished(true); onComplete(score + (accuracy >= settings.accuracyRequired ? 1 : 0), totalRounds) }
  }

  if (finished) return null
  if (loading) return <div className="text-center py-10"><div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>

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
          Предложение {round + 1}/{totalRounds}
        </span>
        <div className="flex-1" />
        <Star size={14} className="text-yellow-500 fill-yellow-500" />
        <span className={`text-sm font-bold ${light ? 'text-gray-800' : 'text-white'}`}>{score}</span>
      </div>

      <div className={`${light ? 'bg-white border-gray-200' : 'bg-white/10 border-white/20'} backdrop-blur-xl border rounded-3xl p-6 text-center`}>
        <div className="text-4xl mb-4">{sentenceData?.image || '📖'}</div>
        <h2 className={`text-2xl font-bold mb-6 ${light ? 'text-gray-800' : 'text-white'}`}>
          {sentenceData?.text}
        </h2>

        <button onClick={startListening} disabled={listening || showResult}
          className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 transition-all ${
            listening ? 'bg-red-400 animate-pulse' : 'bg-gradient-to-r from-purple-400 to-pink-400 hover:scale-110'
          }`}>
          {listening ? <MicOff size={48} className="text-white" /> : <Mic size={48} className="text-white" />}
        </button>
        <p className={`text-sm mb-4 ${light ? 'text-gray-500' : 'text-white/40'}`}>{listening ? '🎤 Читайте...' : 'Нажмите на микрофон и прочитайте предложение'}</p>

        {transcript && (
          <div className="bg-gray-100 rounded-2xl p-4 mb-4">
            <p className="text-gray-500 text-xs">Вы сказали:</p>
            <p className={`text-xl font-bold ${light ? 'text-gray-800' : 'text-white'}`}>{transcript}</p>
            {showResult && (
              <div className="mt-2 space-y-1 text-sm">
                <p className={accuracy >= settings.accuracyRequired ? 'text-green-500' : 'text-red-500'}>
                  Слов совпало: {wordsMatched} из {totalWords} ({accuracy}%)
                </p>
                <p className="text-gray-600">Скорость: ~{speed} слов/мин</p>
              </div>
            )}
          </div>
        )}

        {showResult && (
          <div className="animate-slide-up">
            <div className={`text-xl font-bold mb-2 ${accuracy >= settings.accuracyRequired ? 'text-green-500' : 'text-red-500'}`}>{message}</div>
            <button onClick={nextRound} className="mt-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">
              Далее →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}