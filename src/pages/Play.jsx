import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import AnimatedBackground from '../components/AnimatedBackground'
import MathGame from '../components/games/MathGame'
import MemoryGame from '../components/games/MemoryGame'
import LogicGame from '../components/games/LogicGame'
import SpeechGame from '../components/games/SpeechGame'
import ReadingGame from '../components/games/ReadingGame'
import { ArrowLeft, Star, Trophy, RefreshCw } from 'lucide-react'

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
  }, [user])

  const loadGame = async () => {
    try {
      const docRef = doc(db, 'games', gameId)
      const snap = await getDoc(docRef)
      if (snap.exists()) setGame({ id: snap.id, ...snap.data() })
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleComplete = (score, max) => {
    setFinalScore(score)
    setMaxScore(max)
    setFinished(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (finished) {
    const p = maxScore > 0 ? Math.round((finalScore / maxScore) * 100) : 0
    const stars = p >= 80 ? 3 : p >= 50 ? 2 : 1
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center p-4">
        <AnimatedBackground />
        <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 w-full max-w-md text-center animate-slide-up">
          <Trophy size={80} className="text-yellow-400 mx-auto mb-4 animate-float" />
          <h1 className="text-white text-3xl font-bold mb-2">Игра пройдена!</h1>
          <div className="flex justify-center gap-2 my-4">
            {[1, 2, 3].map(i => (
              <Star key={i} size={40} className={`${i <= stars ? 'text-yellow-400 fill-yellow-400 animate-bounce' : 'text-white/20'}`} style={{ animationDelay: `${i * 200}ms` }} />
            ))}
          </div>
          <p className="text-white/50 mb-6">{finalScore} из {maxScore} ({p}%)</p>
          <div className="flex gap-3">
            <button onClick={() => { setFinished(false); setFinalScore(0); setMaxScore(0) }}
              className="flex-1 bg-gradient-to-r from-violet-500 to-indigo-500 text-white py-4 rounded-xl font-bold hover:scale-105 transition-all flex items-center justify-center gap-2">
              <RefreshCw size={20} /> Ещё раз
            </button>
            <button onClick={() => navigate(`/games/${childId}`)}
              className="flex-1 bg-white/10 text-white py-4 rounded-xl font-bold hover:bg-white/20 transition-all">
              Все игры
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderGame = () => {
    if (!game) return null
    switch (game.type) {
      case 'math': return <MathGame game={game} onComplete={handleComplete} />
      case 'memory': return <MemoryGame game={game} onComplete={handleComplete} />
      case 'logic': return <LogicGame game={game} onComplete={handleComplete} />
      case 'speech': return <SpeechGame game={game} onComplete={handleComplete} />
      case 'reading': return <ReadingGame game={game} onComplete={handleComplete} />
      default: return <div className="text-white text-center py-20">Неизвестный тип игры</div>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <AnimatedBackground />
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(`/games/${childId}`)}
            className="text-white/60 hover:text-white flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 transition-colors">
            <ArrowLeft size={20} /> Выйти
          </button>
          <h1 className="text-white text-xl font-bold">{game?.title}</h1>
          <div className="w-20" />
        </div>
        {renderGame()}
      </div>
    </div>
  )
}