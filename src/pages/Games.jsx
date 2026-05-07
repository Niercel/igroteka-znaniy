import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import AnimatedBackground from '../components/AnimatedBackground'
import * as Icons from 'lucide-react'
import { ArrowLeft, Play } from 'lucide-react'

export default function Games() {
  const { childId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [games, setGames] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      const catSnap = await getDocs(query(collection(db, 'categories'), orderBy('order')))
      setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })))

      const gameSnap = await getDocs(collection(db, 'games'))
      const map = {}
      gameSnap.docs.forEach(d => {
        const g = { id: d.id, ...d.data() }
        if (!map[g.categoryId]) map[g.categoryId] = []
        map[g.categoryId].push(g)
      })
      setGames(map)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const getColor = (color) => {
    const c = { violet: '139,92,246', grape: '165,85,247', orange: '251,146,60', green: '34,197,94', red: '239,68,68' }
    return `rgba(${c[color] || '139,92,246'}, 0.2)`
  }

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <AnimatedBackground />
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/dashboard')} className="text-white/60 hover:text-white p-2 transition-colors"><ArrowLeft size={24} /></button>
          <div><h1 className="text-white text-3xl font-bold">Выбери игру</h1><p className="text-white/40 text-sm">5 тематик для развития</p></div>
        </div>
        <div className="space-y-6">
          {categories.map(cat => {
            const Icon = Icons[cat.icon] || Play
            const catGames = games[cat.id] || []
            return (
              <div key={cat.id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: getColor(cat.color) }}>
                    <Icon size={32} className="text-white" />
                  </div>
                  <div><h2 className="text-white text-xl font-semibold">{cat.name}</h2><p className="text-white/40 text-sm">{catGames.length} игр</p></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catGames.map(g => (
                    <button key={g.id} onClick={() => navigate(`/play/${childId}/${g.id}`)}
                      className="flex items-center gap-3 bg-white/5 border border-white/10 hover:border-violet-400/30 rounded-xl p-4 transition-all text-left group hover:bg-white/8">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center text-2xl">{g.imageUrl}</div>
                      <div className="flex-1"><h3 className="text-white font-medium">{g.title}</h3><p className="text-white/40 text-xs">{g.description}</p></div>
                      <Play size={16} className="text-white/20 group-hover:text-violet-400 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}