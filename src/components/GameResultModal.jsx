import { Star, Trophy, RefreshCw, ArrowLeft } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useEffect } from 'react'

export default function GameResultModal({ open, title, imageUrl, score, maxScore, onRestart, onExit }) {
  const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  const stars = percent >= 80 ? 3 : percent >= 50 ? 2 : 1

  useEffect(() => {
    if (open) {
      // Салют при открытии
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" style={{ animation: 'fade-in 0.3s ease-out forwards' }}>
      <div className="bg-white/95 backdrop-blur-xl border border-white/40 rounded-3xl p-8 w-full max-w-sm mx-4 text-center shadow-2xl" style={{ animation: 'slide-up 0.4s ease-out forwards' }}>
        <Trophy size={56} className="text-yellow-500 mx-auto mb-2" style={{ animation: 'float 4s ease-in-out infinite' }} />
        <h2 className="text-gray-800 text-2xl font-bold mb-1">{title}</h2>
        <div className="text-4xl mb-3">{imageUrl}</div>

        <div className="flex justify-center gap-1 mb-4">
          {[1, 2, 3].map(i => (
            <Star
              key={i}
              size={36}
              className={i <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
              style={{ animation: i <= stars ? `bounce-in 0.5s ease-out ${i * 0.15}s both` : 'none' }}
            />
          ))}
        </div>

        <p className="text-gray-700 text-lg mb-1">
          Правильно: <span className="font-bold text-green-500">{score}</span> из {maxScore}
        </p>
        <p className="text-gray-500 text-sm mb-6">Результат: {percent}%</p>

        <div className="flex gap-3">
          <button
            onClick={onRestart}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-md"
          >
            <RefreshCw size={18} /> Ещё раз
          </button>
          <button
            onClick={onExit}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <ArrowLeft size={18} /> Выйти
          </button>
        </div>
      </div>
    </div>
  )
}