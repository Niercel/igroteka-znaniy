import { X, Lightbulb } from 'lucide-react'

export default function HintModal({ isOpen, onClose, title, instructions, videoUrl }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="text-yellow-500" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Как играть?</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">{instructions}</p>
        
        {videoUrl && (
          <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
            <iframe
              src={videoUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
        
        <button
          onClick={onClose}
          className="mt-4 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:scale-105 transition-transform"
        >
          Понятно!
        </button>
      </div>
    </div>
  )
}