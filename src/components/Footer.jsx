import { useNavigate } from 'react-router-dom'

export default function Footer() {
  const navigate = useNavigate()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black/30 backdrop-blur-xl border-t border-white/10 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-white text-xl font-bold hover:text-violet-300 transition-colors cursor-default">
              🎓 Игротека знаний
            </span>
            <span className="text-white/40 text-sm">
              © {currentYear} Все права защищены
            </span>
          </div>
          <div className="flex gap-4">
            <button className="text-white/60 hover:text-white transition-colors text-sm hover:scale-105">
              О проекте
            </button>
            <button className="text-white/60 hover:text-white transition-colors text-sm hover:scale-105">
              Поддержка
            </button>
            <button 
              className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white px-5 py-2 rounded-full text-sm font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105 transition-all"
              onClick={() => navigate('/register')}
            >
              Регистрация
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}