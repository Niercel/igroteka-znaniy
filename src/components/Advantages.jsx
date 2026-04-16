import { useNavigate } from 'react-router-dom'
import AdvantagesList from './AdvantagesList'

export default function Advantages() {
  const navigate = useNavigate()

  return (
    <section id="advantages" className="bg-white/5 backdrop-blur-md border-y border-white/10 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
          <div className="max-w-xl">
            <h2 className="text-white text-4xl font-bold mb-8">
              Почему родители выбирают Игротеку знаний
            </h2>
            <AdvantagesList />
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-8 w-full lg:w-96">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="text-white text-2xl font-semibold">Присоединяйтесь!</h3>
            </div>
            <p className="text-white/80 mb-6 leading-relaxed">
              Более 10 000 родителей уже доверяют нам подготовку своих детей к школе.
            </p>
            <button 
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white py-3 rounded-full font-semibold shadow-lg shadow-violet-500/30 transition-all"
              onClick={() => navigate('/register')}
            >
              Создать аккаунт
            </button>
            <p className="text-white/50 text-xs text-center mt-4">
              Это бесплатно и займёт 1 минуту
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}