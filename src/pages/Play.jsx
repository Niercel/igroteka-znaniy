import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, getDoc, addDoc, collection } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import GameResultModal from '../components/GameResultModal'
import MathGame from '../components/games/MathGame'
import MemoryGame from '../components/games/MemoryGame'
import LogicGame from '../components/games/LogicGame'
import SpeechGame from '../components/games/SpeechGame'
import SentenceReadingGame from '../components/games/SentenceReadingGame'
import ReadingGame from '../components/games/ReadingGame'
import NumberBasketsGame from '../components/games/NumberBasketsGame'
import CompareGame from '../components/games/CompareGame'
import CommonalityGame from '../components/games/CommonalityGame'
import SimonGame from '../components/games/SimonGame'
import MatchingGame from '../components/games/MatchingGame'
import SentenceGame from '../components/games/SentenceGame'
import MissingLetterGame from '../components/games/MissingLetterGame'
import ChooseWordGame from '../components/games/ChooseWordGame'
import { ArrowLeft } from 'lucide-react'

export default function Play() {
  const { childId, gameId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [finished, setFinished] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const [maxScore, setMaxScore] = useState(0)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    loadGame()
  }, [user, gameId])

  const loadGame = async () => {
    try {
      const snap = await getDoc(doc(db, 'games', gameId))
      if (snap.exists()) setGame({ id: snap.id, ...snap.data() })
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  // Сохранение прогресса в Firestore
  const saveProgress = async (score, max) => {
    try {
      const gameDoc = await getDoc(doc(db, 'games', gameId))
      const categoryId = gameDoc.exists() ? gameDoc.data().categoryId : null
      await addDoc(collection(db, 'progress'), {
        childId,
        gameId,
        categoryId,
        gameType: game?.type,
        score,
        maxScore: max,
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Ошибка сохранения прогресса:', err)
    }
  }

  const handleComplete = async (score, max) => {
    setFinalScore(score)
    setMaxScore(max)
    setFinished(true)
    await saveProgress(score, max)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="min-h-screen">
        <GameResultModal
          open={finished}
          title={game?.title}
          imageUrl={game?.imageUrl}
          score={finalScore}
          maxScore={maxScore}
          onRestart={() => { setFinished(false); setFinalScore(0); setMaxScore(0) }}
          onExit={() => navigate(`/games/${childId}`)}
        />
      </div>
    )
  }

  const renderGame = () => {
    if (!game) return null
    const props = { game, onComplete: handleComplete, light: true }
    switch (game.type) {
      case 'math': return <MathGame {...props} />
      case 'memory': return <MemoryGame {...props} />
      case 'logic': return <LogicGame {...props} />
      case 'speech': return <SpeechGame {...props} />
      case 'sentence-reading': return <SentenceReadingGame {...props} />
      case 'reading': return <ReadingGame {...props} />
      case 'number-baskets': return <NumberBasketsGame {...props} />
      case 'compare': return <CompareGame {...props} />
      case 'commonality': return <CommonalityGame {...props} />
      case 'simon': return <SimonGame {...props} />
      case 'matching': return <MatchingGame {...props} />
      case 'sentence': return <SentenceGame {...props} />
      case 'missing-letter': return <MissingLetterGame {...props} />
      case 'choose-word': return <ChooseWordGame {...props} />
      default: return <div className="text-gray-800 text-center py-20">Неизвестный тип игры</div>
    }
  }

  return (
    <div className="min-h-screen">
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(`/games/${childId}`)} className="p-2 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg transition-all">
            <ArrowLeft size={20} className="text-purple-500" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">{game?.title}</h1>
          <div className="w-10" />
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl p-6 shadow-2xl">
          {renderGame()}
        </div>
      </div>
    </div>
  )
}