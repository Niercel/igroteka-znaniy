import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import AnimatedBackground from '../components/AnimatedBackground'
import { Plus, Trash2, Play, User } from 'lucide-react'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [children, setChildren] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Загружаем детей при монтировании
  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadChildren()
  }, [user])

  const loadChildren = async () => {
    try {
      const q = query(collection(db, 'children'), where('parentId', '==', user.uid))
      const snapshot = await getDocs(q)
      const childrenList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setChildren(childrenList)
    } catch (err) {
      console.error('Ошибка загрузки:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddChild = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!name.trim() || !age) {
      setError('Заполните все поля')
      return
    }

    if (age < 3 || age > 8) {
      setError('Возраст от 3 до 8 лет')
      return
    }

    try {
      await addDoc(collection(db, 'children'), {
        parentId: user.uid,
        name: name.trim(),
        age: Number(age),
        createdAt: new Date().toISOString()
      })
      
      setName('')
      setAge('')
      setShowForm(false)
      loadChildren() // Обновляем список
    } catch (err) {
      setError('Ошибка при добавлении')
    }
  }

  const handleDeleteChild = async (childId) => {
    if (!confirm('Удалить ребёнка? Данные об успехах сохранятся.')) return
    
    try {
      await deleteDoc(doc(db, 'children', childId))
      setChildren(prev => prev.filter(c => c.id !== childId))
    } catch (err) {
      console.error('Ошибка удаления:', err)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const getAgeEmoji = (age) => {
    if (age <= 4) return '👶'
    if (age <= 6) return '🧒'
    return '👧'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Верхняя панель */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-white text-3xl font-bold">Личный кабинет</h1>
            <p className="text-white/50 text-sm mt-1">{user?.email}</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/')}
              className="text-white/70 hover:text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              На главную
            </button>
            <button 
              onClick={handleLogout}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Выйти
            </button>
          </div>
        </div>

        {/* Секция детей */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-2xl font-semibold">Мои дети</h2>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              Добавить
            </button>
          </div>

          {/* Форма добавления */}
          {showForm && (
            <form onSubmit={handleAddChild} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <h3 className="text-white text-lg font-semibold mb-4">Новый ребёнок</h3>
              
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 mb-4 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1">Имя</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-violet-400"
                    placeholder="Например, Миша"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">Возраст</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-violet-400"
                    placeholder="от 3 до 8 лет"
                    min="3"
                    max="8"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-white/50 hover:text-white px-6 py-2.5 rounded-full text-sm transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          )}

          {/* Список детей */}
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-white/50 mt-4">Загрузка...</p>
            </div>
          ) : children.length === 0 ? (
            <div className="text-center py-12">
              <User size={48} className="text-white/20 mx-auto mb-4" />
              <p className="text-white/50 text-lg mb-2">Нет добавленных детей</p>
              <p className="text-white/30 text-sm">Нажмите «Добавить», чтобы начать</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-violet-400/30 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center text-3xl">
                        {getAgeEmoji(child.age)}
                      </div>
                      <div>
                        <h3 className="text-white text-lg font-semibold">{child.name}</h3>
                        <p className="text-white/40 text-sm">{child.age} {getAgeWord(child.age)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteChild(child.id)}
                      className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <button
                    onClick={() => navigate(`/games/${child.id}`)}
                    className="w-full mt-4 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Play size={16} />
                    Играть
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Вспомогательная функция
function getAgeWord(age) {
  if (age === 1) return 'год'
  if (age >= 2 && age <= 4) return 'года'
  return 'лет'
}