import { useNavigate } from 'react-router-dom'
import { smoothScrollTo, scrollToTop } from '../utils/scroll'

export default function Header() {
  const navigate = useNavigate()

  return (
    <header className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 
          className="text-white text-2xl font-bold cursor-pointer hover:scale-105 transition-transform"
          onClick={scrollToTop}
        >
          🎓 Игротека знаний
        </h3>
        
        <div className="hidden md:flex gap-8">
          <button 
            className="text-white/70 hover:text-white transition-colors text-base"
            onClick={() => smoothScrollTo('services', 80)}
          >
            Направления
          </button>
          <button 
            className="text-white/70 hover:text-white transition-colors text-base"
            onClick={() => smoothScrollTo('how-it-works', 80)}
          >
            Как работает
          </button>
          <button 
            className="text-white/70 hover:text-white transition-colors text-base"
            onClick={() => smoothScrollTo('advantages', 80)}
          >
            Преимущества
          </button>
          <button 
            className="text-white/70 hover:text-white transition-colors text-base"
            onClick={() => smoothScrollTo('testimonials', 80)}
          >
            Отзывы
          </button>
        </div>

        <div className="flex gap-3">
          <button 
            className="text-white/80 hover:text-white px-5 py-2.5 rounded-lg transition-all text-base font-medium hover:bg-white/5"
            onClick={() => navigate('/login')}
          >
            Вход
          </button>
          <button 
            className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-full transition-all text-base font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105"
            onClick={() => navigate('/register')}
          >
            Регистрация
          </button>
        </div>
      </div>
    </header>
  )
}