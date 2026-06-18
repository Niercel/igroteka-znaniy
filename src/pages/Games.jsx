import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import * as Icons from 'lucide-react'
import { ArrowLeft, ChevronDown, Play, Sparkles, Star, Lock, Eye, EyeOff } from 'lucide-react'
import { getCategoryTheme } from '../utils/themes'

export default function Games() {
  const { childId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [games, setGames] = useState({}) // отфильтрованные игры
  const [allGamesMap, setAllGamesMap] = useState({}) // все игры без фильтра
  const [childAge, setChildAge] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [showAllAges, setShowAllAges] = useState(false) // НОВОЕ СОСТОЯНИЕ

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    loadData()
  }, [user, childId])

  // Перезагружаем данные при изменении фильтра
  useEffect(() => {
    if (Object.keys(allGamesMap).length > 0) {
      applyFilter()
    }
  }, [showAllAges, allGamesMap])

  const loadData = async () => {
    try {
      // 1. Определяем возраст ребёнка
      const childSnap = await getDoc(doc(db, 'children', childId))
      let age = null
      if (childSnap.exists()) {
        const data = childSnap.data()
        if (data.birthYear) {
          age = new Date().getFullYear() - data.birthYear
        } else if (data.age) {
          age = data.age
        }
      }
      setChildAge(age)

      // 2. Загружаем категории
      const catSnap = await getDocs(query(collection(db, 'categories'), orderBy('order')))
      const cats = catSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      setCategories(cats)

      // 3. Загружаем все игры без фильтрации
      const gameSnap = await getDocs(collection(db, 'games'))
      const fullMap = {}
      gameSnap.docs.forEach(d => {
        const g = { id: d.id, ...d.data() }
        if (!fullMap[g.categoryId]) fullMap[g.categoryId] = []
        fullMap[g.categoryId].push(g)
      })
      setAllGamesMap(fullMap)
      // Применяем фильтр после загрузки
      applyFilter(fullMap, age)
    } catch (err) {
      console.error('Ошибка загрузки:', err)
    } finally {
      setLoading(false)
    }
  }

  // Функция фильтрации
  const applyFilter = (map = allGamesMap, age = childAge) => {
    const filtered = {}
    Object.keys(map).forEach(catId => {
      const gamesInCat = map[catId]
      const filteredGames = showAllAges
        ? gamesInCat // показываем все игры
        : gamesInCat.filter(g => {
            if (age !== null && g.ageRange) {
              const { min, max } = g.ageRange
              if (age < min || age > max) {
                return false
              }
            }
            return true
          })
      if (filteredGames.length > 0) {
        filtered[catId] = filteredGames
      }
    })
    setGames(filtered)
  }

  // Переключение фильтра
  const toggleShowAllAges = () => {
    setShowAllAges(prev => !prev)
  }

  const toggleCategory = (catId) => {
    setExpandedCategory(expandedCategory === catId ? null : catId)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Подсчёт общего количества игр (всех, без фильтра)
  const totalAllGames = Object.values(allGamesMap).flat().length
  // Подсчёт отфильтрованных игр
  const totalFilteredGames = Object.values(games).flat().length
  const totalGames = showAllAges ? totalAllGames : totalFilteredGames

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white transition-all shadow-lg hover:shadow-xl"
            >
              <ArrowLeft size={24} className="text-purple-500" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                Выбери игру
              </h1>
              <p className="text-purple-400 text-sm flex items-center gap-1 mt-1">
                <Sparkles size={14} className="text-pink-400" />
                {childAge !== null
                  ? `Возраст ${childAge} ${childAge === 1 ? 'год' : childAge >= 2 && childAge <= 4 ? 'года' : 'лет'} • ${totalGames} игр${showAllAges ? ' (все)' : ''}`
                  : `${totalGames} игр доступно`}
              </p>
            </div>
          </div>

          {/* НОВАЯ КНОПКА-ПЕРЕКЛЮЧАТЕЛЬ */}
          <button
            onClick={toggleShowAllAges}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-md ${
              showAllAges
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                : 'bg-white/80 backdrop-blur-sm text-purple-600 hover:bg-white'
            }`}
          >
            {showAllAges ? (
              <>
                <EyeOff size={16} />
                <span>Скрыть неподходящие</span>
              </>
            ) : (
              <>
                <Eye size={16} />
                <span>Показать все игры</span>
              </>
            )}
          </button>
        </div>

        {totalGames === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl p-8 text-center shadow-xl">
            <Lock size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Пока нет игр для этого возраста</p>
            <p className="text-gray-400 text-sm mt-2">Игры появятся, когда ребёнок подрастёт</p>
            {!showAllAges && (
              <button
                onClick={toggleShowAllAges}
                className="mt-4 text-purple-500 font-semibold underline hover:text-purple-700"
              >
                Показать все игры
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((cat, index) => {
              const theme = getCategoryTheme(cat.color)
              const Icon = Icons[cat.icon] || Star
              const catGames = games[cat.id] || []
              if (catGames.length === 0) return null

              const isExpanded = expandedCategory === cat.id

              return (
                <div
                  key={cat.id}
                  className="rounded-3xl overflow-hidden backdrop-blur-xl border shadow-xl transition-all duration-500"
                  style={{
                    backgroundColor: theme.cardBg,
                    borderColor: theme.cardBorder,
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className="w-full p-5 flex items-center gap-4 hover:bg-white/10 transition-all"
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
                    >
                      <Icon size={28} className="text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h2 className="text-lg font-bold" style={{ color: theme.primary }}>{cat.name}</h2>
                      <p className="text-sm text-gray-500">{catGames.length} {catGames.length === 1 ? 'игра' : catGames.length >= 2 && catGames.length <= 4 ? 'игры' : 'игр'}</p>
                    </div>
                    <ChevronDown
                      size={24}
                      className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}
                      style={{ color: theme.primary }}
                    />
                  </button>

                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-5 pb-5 space-y-3">
                      {catGames.map((g, gameIndex) => {
                        // Проверяем, подходит ли игра по возрасту (для отображения иконки)
                        let isAgeAppropriate = true
                        if (childAge !== null && g.ageRange) {
                          const { min, max } = g.ageRange
                          if (childAge < min || childAge > max) {
                            isAgeAppropriate = false
                          }
                        }
                        return (
                          <button
                            key={g.id}
                            onClick={() => navigate(`/play/${childId}/${g.id}`)}
                            className={`w-full flex items-center gap-3 rounded-2xl p-4 transition-all hover:scale-105 bg-white/60 backdrop-blur-sm border border-white/80 shadow-md hover:shadow-lg group ${
                              !isAgeAppropriate ? 'opacity-60 hover:opacity-90' : ''
                            }`}
                            style={{ animationDelay: `${gameIndex * 80}ms` }}
                          >
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md"
                              style={{ background: `linear-gradient(135deg, ${theme.primary}20, ${theme.secondary}20)` }}
                            >
                              {g.imageUrl}
                            </div>
                            <div className="flex-1 text-left">
                              <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                                {g.title}
                                {!isAgeAppropriate && (
                                  <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
                                    не по возрасту
                                  </span>
                                )}
                              </h3>
                              <p className="text-xs text-gray-500 mt-0.5">{g.description}</p>
                            </div>
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-12"
                              style={{ backgroundColor: theme.primary + '20' }}
                            >
                              <Play size={16} style={{ color: theme.primary }} />
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}