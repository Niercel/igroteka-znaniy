import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import {
  ArrowLeft, Trophy, TrendingUp, Calendar,
  Target, Zap, BarChart3, PieChart
} from 'lucide-react'

/* ---------- Всплывающая подсказка ---------- */
function Tooltip({ children, text }) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
      </div>
    </div>
  )
}

/* ---------- SVG-график с hover и защитой от переполнения ---------- */
function ProgressChart({ data }) {
  const [hoverIndex, setHoverIndex] = useState(null)
  if (!data || data.length < 2) return null

  const maxPercent = Math.max(100, ...data.map(d => d.percent), 110) // запас 110
  const width = 320, height = 130, pad = 14
  const getX = (i) => pad + (i / (data.length - 1)) * (width - pad * 2)
  const getY = (percent) => height - pad - (percent / maxPercent) * (height - pad * 2)

  const points = data.map((p, i) => `${getX(i)},${getY(p.percent)}`).join(' ')
  const area = `${getX(0)},${height - pad} ${points} ${getX(data.length - 1)},${height - pad}`

  return (
    <div className="relative flex justify-center">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-sm h-40">
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#e5e7eb" strokeWidth="1" />
        <line x1={pad} y1={pad} x2={width - pad} y2={pad} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
        <polygon points={area} fill="url(#areaGrad)" opacity="0.3" />
        <polyline points={points} fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
          </linearGradient>
        </defs>
        {data.map((point, i) => (
          <circle
            key={i}
            cx={getX(i)}
            cy={getY(point.percent)}
            r="6"
            fill={hoverIndex === i ? '#ec4899' : '#8b5cf6'}
            stroke="white"
            strokeWidth="2"
            className="cursor-pointer transition-all hover:r-[8]"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          />
        ))}
        {hoverIndex !== null && (
          <>
            <line x1={getX(hoverIndex)} y1={pad} x2={getX(hoverIndex)} y2={height - pad} stroke="#9ca3af" strokeWidth="1" strokeDasharray="4" />
            <circle cx={getX(hoverIndex)} cy={getY(data[hoverIndex].percent)} r="8" fill="none" stroke="#ec4899" strokeWidth="2" />
            <rect
              x={getX(hoverIndex) > width / 2 ? getX(hoverIndex) - 80 : getX(hoverIndex) + 10}
              y={getY(data[hoverIndex].percent) - 30}
              width="70" height="24" rx="6" fill="#1f2937"
            />
            <text
              x={getX(hoverIndex) > width / 2 ? getX(hoverIndex) - 45 : getX(hoverIndex) + 45}
              y={getY(data[hoverIndex].percent) - 12}
              textAnchor="middle" fill="white" fontSize="11" fontWeight="bold"
            >
              {data[hoverIndex].percent}% – {data[hoverIndex].date}
            </text>
          </>
        )}
      </svg>
    </div>
  )
}

/* ---------- Карточка метрики ---------- */
function MetricCard({ icon, value, label, tooltip }) {
  return (
    <Tooltip text={tooltip || label}>
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-default">
        <div className="flex justify-center mb-2">{icon}</div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </Tooltip>
  )
}

/* ---------- Основной компонент ---------- */
export default function Stats() {
  const { childId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [progressData, setProgressData] = useState([])
  const [recentGames, setRecentGames] = useState([])
  const [weekStats, setWeekStats] = useState(null)
  const [dayStats, setDayStats] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    loadStats()
  }, [user, childId])

  const loadStats = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'progress'), where('childId', '==', childId)))
      const allData = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      if (allData.length === 0) {
        setStats({ totalGames: 0 })
        setLoading(false)
        return
      }
      allData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

      const totalGames = allData.length
      const totalPercent = allData.reduce((sum, p) => {
        const percent = Math.round((p.score / Math.max(1, p.maxScore)) * 100)
        return sum + Math.min(percent, 100) // на всякий случай ограничим 100
      }, 0)
      const avgScore = Math.round(totalPercent / totalGames)

      const best = allData.reduce((prev, curr) =>
        (curr.score / curr.maxScore > prev.score / prev.maxScore) ? curr : prev
      , allData[0])

      const categoryStats = {}
      for (const p of allData) {
        const cat = p.categoryId || 'unknown'
        if (!categoryStats[cat]) categoryStats[cat] = { count: 0, totalPercent: 0, best: 0 }
        categoryStats[cat].count++
        const percent = Math.min(100, Math.round((p.score / Math.max(1, p.maxScore)) * 100))
        categoryStats[cat].totalPercent += percent
        if (percent > categoryStats[cat].best) categoryStats[cat].best = percent
      }
      for (const cat in categoryStats) {
        categoryStats[cat].avg = Math.round(categoryStats[cat].totalPercent / categoryStats[cat].count)
      }

      const graphData = allData.slice(-10).map(p => ({
        date: new Date(p.timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
        percent: Math.min(100, Math.round((p.score / Math.max(1, p.maxScore)) * 100)),
      }))

      const recent = allData.slice(-5).reverse()

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const weekData = allData.filter(p => new Date(p.timestamp) >= sevenDaysAgo)
      const weekAvg = weekData.length > 0
        ? Math.round(weekData.reduce((sum, p) => sum + Math.min(100, Math.round((p.score / Math.max(1, p.maxScore)) * 100)), 0) / weekData.length)
        : null

      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      const dayCounts = {}, dayScores = {}
      allData.forEach(p => {
        const day = new Date(p.timestamp).getDay()
        dayCounts[day] = (dayCounts[day] || 0) + 1
        dayScores[day] = (dayScores[day] || 0) + Math.min(100, Math.round((p.score / Math.max(1, p.maxScore)) * 100))
      })
      const dayStats = dayNames.map((name, idx) => ({
        day: name,
        count: dayCounts[idx] || 0,
        avg: dayCounts[idx] ? Math.round(dayScores[idx] / dayCounts[idx]) : 0,
      }))

      const recs = []
      for (const [cat, data] of Object.entries(categoryStats)) {
        if (data.avg < 60) recs.push({
          category: cat,
          message: `Стоит подтянуть направление «${cat}». Результат ниже 60%.`,
        })
      }
      if (recs.length === 0 && totalGames > 3) recs.push({
        category: 'all',
        message: 'Отличная работа! Продолжайте развиваться во всех направлениях.',
      })

      setStats({ totalGames, avgScore, bestGame: best, categoryStats })
      setProgressData(graphData)
      setRecentGames(recent)
      setWeekStats({ weekAvg, totalWeek: weekData.length })
      setDayStats(dayStats)
      setRecommendations(recs)
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats || stats.totalGames === 0) {
    return (
      <div className="min-h-screen relative">
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate('/dashboard')} className="p-2 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white transition-all shadow-lg">
              <ArrowLeft size={24} className="text-purple-500" />
            </button>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">Статистика</h1>
          </div>
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl p-8 text-center shadow-xl">
            <BarChart3 size={64} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-600 mb-2">Пока нет данных</h2>
            <p className="text-gray-500">Сыграйте в первую игру, чтобы увидеть аналитику!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white transition-all shadow-lg">
            <ArrowLeft size={24} className="text-purple-500" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">Аналитика</h1>
            <p className="text-gray-500 text-sm">Детальная статистика успеваемости</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <MetricCard icon={<Trophy size={24} className="text-yellow-500" />} value={stats.totalGames} label="Игр сыграно" tooltip="Общее количество завершённых игр" />
          <MetricCard icon={<TrendingUp size={24} className="text-blue-500" />} value={`${stats.avgScore}%`} label="Средний балл" tooltip="Средний процент правильных ответов" />
          <MetricCard icon={<Target size={24} className="text-emerald-500" />} value={stats.bestGame ? `${Math.round((stats.bestGame.score / Math.max(1, stats.bestGame.maxScore)) * 100)}%` : '-'} label="Лучший результат" tooltip="Самая успешная игра" />
          <MetricCard icon={<Zap size={24} className="text-amber-500" />} value={weekStats?.weekAvg !== null ? `${weekStats.weekAvg}%` : '-'} label="Среднее за 7 дн." tooltip="Средняя точность за последнюю неделю" />
        </div>

        {progressData.length >= 2 && (
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl p-6 shadow-lg mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Динамика результатов</h2>
            <ProgressChart data={progressData} />
            <p className="text-xs text-gray-400 mt-2 text-center">Наведи на точку — увидишь детали</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><PieChart size={20} className="text-purple-500" /> По направлениям</h2>
            <div className="space-y-4">
              {Object.entries(stats.categoryStats).map(([cat, data]) => (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 capitalize">{cat === 'math' ? 'Математика' : cat === 'attention' ? 'Внимание' : cat === 'logic' ? 'Логика' : cat === 'speech' ? 'Речь' : cat === 'reading' ? 'Чтение' : cat}</span>
                    <span className="text-gray-800 font-medium">{data.avg}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 group relative">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-700 group-hover:brightness-110"
                      style={{ width: `${Math.min(data.avg, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{data.count} игр</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Calendar size={20} className="text-blue-500" /> Активность по дням</h2>
            <div className="flex justify-around items-end h-32 gap-2">
              {dayStats.map((d) => (
                <Tooltip key={d.day} text={d.count > 0 ? `${d.avg}% за ${d.count} игр` : 'Нет игр'}>
                  <div className="flex flex-col items-center gap-1 flex-1 cursor-pointer group">
                    <span className="text-xs text-gray-500">{d.count > 0 ? d.avg + '%' : ''}</span>
                    <div
                      className="w-full bg-gradient-to-t from-purple-400 to-pink-400 rounded-t-lg transition-all group-hover:brightness-110 group-hover:scale-x-110"
                      style={{ height: `${Math.min(d.count * 20, 100)}%`, minHeight: d.count > 0 ? '8px' : '0' }}
                    />
                    <span className="text-xs text-gray-500">{d.day}</span>
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl p-6 shadow-lg mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Zap size={20} className="text-amber-500" /> Рекомендации</h2>
            <div className="space-y-2">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
                  <span className="text-amber-500 mt-0.5">💡</span>
                  <p className="text-sm text-gray-700">{rec.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentGames.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Последние игры</h2>
            <div className="space-y-2">
              {recentGames.map((game, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-default">
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{game.gameType}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(game.timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-gray-800">
                    {game.score}/{game.maxScore} ({Math.round((game.score / Math.max(1, game.maxScore)) * 100)}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}