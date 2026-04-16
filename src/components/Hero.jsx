import { useNavigate } from 'react-router-dom'
import { smoothScrollTo } from '../utils/scroll'
import { useState, useEffect } from 'react'

export default function Hero() {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
        <div className={`max-w-xl transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-white text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Готовимся к школе{' '}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              играючи
            </span>
          </h1>
          <p className="text-white/80 text-xl mb-8 leading-relaxed">
            Интерактивные тренажёры для детей 4-7 лет. Развиваем мышление, память и речь без скучных заданий.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              className="group bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg shadow-violet-500/30 transition-all hover:scale-105 hover:shadow-violet-500/50"
              onClick={() => navigate('/register')}
            >
              🚀 Начать бесплатно
            </button>
            <button 
              className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105"
              onClick={() => smoothScrollTo('how-it-works', 80)}
            >
              Узнать больше
            </button>
          </div>
          <div className="flex items-center gap-2 mt-6 group cursor-default">
            <svg className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-white/60 text-sm">
              Более 50 игр • 5 направлений • 3 уровня сложности
            </span>
          </div>
        </div>

        <div className={`w-full lg:w-96 h-80 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 backdrop-blur-xl rounded-3xl border border-white/20 flex items-center justify-center shadow-2xl hover:shadow-violet-500/20 transition-all duration-500 animate-float ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-8xl animate-pulse">🎮</span>
        </div>
      </div>
    </section>
  )
}