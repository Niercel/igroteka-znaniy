import { Star } from 'lucide-react'
import { DIFFICULTY_LEVELS, getDifficultyLabel } from '../utils/gameSettings'

export default function DifficultySelectModal({ open, onSelect, onClose, title, imageUrl }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm mx-4 shadow-2xl animate-slide-up">
        <h2 className="text-xl font-bold text-center text-gray-800 mb-2">{title}</h2>
        {imageUrl && <div className="text-4xl text-center mb-4">{imageUrl}</div>}
        <p className="text-gray-500 text-sm text-center mb-6">Выберите сложность</p>
        <div className="space-y-3">
          {DIFFICULTY_LEVELS.map(diff => (
            <button
              key={diff}
              onClick={() => onSelect(diff)}
              className="w-full py-3 px-4 rounded-xl font-bold text-lg transition-all hover:scale-105 bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-lg"
            >
              {getDifficultyLabel(diff)}
            </button>
          ))}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            Отмена
          </button>
        )}
      </div>
    </div>
  )
}