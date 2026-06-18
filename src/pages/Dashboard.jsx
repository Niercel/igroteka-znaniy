import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection, addDoc, query, where, getDocs, doc, deleteDoc
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import {
  Plus, Trash2, Play, LogOut, Home, Sparkles, Baby, Users, TrendingUp
} from 'lucide-react'

export default function Dashboard() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [children, setChildren] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (isAdmin) {
      setLoading(false)
      return
    }
    loadChildren()
  }, [user, isAdmin])

  const loadChildren = async () => {
    try {
      const q = query(collection(db, 'children'), where('parentId', '==', user.uid))
      const snapshot = await getDocs(q)
      const childrenList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
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
    setSuccess('')

    if (!name.trim() || !birthYear) {
      setError('Заполните все поля')
      return
    }

    const year = Number(birthYear)
    const currentYear = new Date().getFullYear()
    if (isNaN(year) || year < 2016 || year > currentYear - 3) {
      setError('Год рождения должен быть между 2016 и ' + (currentYear - 3))
      return
    }

    try {
      await addDoc(collection(db, 'children'), {
        parentId: user.uid,
        name: name.trim(),
        birthYear: year,
        createdAt: new Date().toISOString()
      })

      setSuccess(`${name} добавлен!`)
      setName('')
      setBirthYear('')
      setShowForm(false)
      loadChildren()

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Ошибка при добавлении')
    }
  }

  const handleDeleteChild = async (childId, childName) => {
    if (!confirm(`Удалить ${childName}?`)) return

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

  // Поддержка старых (age) и новых (birthYear) записей
  const getAge = (child) => {
    if (child.birthYear) {
      return new Date().getFullYear() - child.birthYear
    }
    if (child.age) {
      return child.age
    }
    return null
  }

  const getAgeEmoji = (age) => {
    if (age === null) return '👶'
    if (age <= 4) return '👶'
    if (age <= 6) return '🧒'
    return '👦'
  }

  const getAgeWord = (age) => {
    if (age === null) return 'лет'
    if (age === 1) return 'год'
    if (age >= 2 && age <= 4) return 'года'
    return 'лет'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen relative">
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Вы администратор</h2>
            <p className="text-gray-500 mb-6">Вам доступно управление сайтом через админ‑панель.</p>
            <button
              onClick={() => navigate('/admin')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
            >
              Перейти в админ‑панель
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-400 bg-clip-text text-transparent">
              Личный кабинет
            </h1>
            <p className="text-emerald-500 text-sm mt-1 flex items-center gap-1">
              <Users size={14} />
              {user?.email}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all"
            >
              <Home size={16} />
              На главную
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-rose-500 hover:text-rose-600 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all"
            >
              <LogOut size={16} />
              Выйти
            </button>
          </div>
        </div>

        {success && (
          <div className="bg-emerald-100 border border-emerald-200 rounded-2xl p-3 mb-4 text-emerald-700 text-sm flex items-center gap-2 animate-slide-up">
            <Sparkles size={16} className="text-emerald-500" />
            {success}
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Мои дети</h2>
              <p className="text-gray-500 text-sm mt-1">
                {children.length === 0 ? 'Нет добавленных детей' :
                 `${children.length} ${children.length === 1 ? 'ребёнок' : children.length >= 2 && children.length <= 4 ? 'ребёнка' : 'детей'}`}
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus size={18} />
              Добавить
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddChild} className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 mb-6 animate-slide-up">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Baby size={20} className="text-emerald-500" />
                Новый ребёнок
              </h3>

              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-4 text-rose-600 text-sm">
                  ⚠️ {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm mb-1.5 font-medium">Имя</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                    placeholder="Например, Миша"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1.5 font-medium">Год рождения</label>
                  <input
                    type="number"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                    placeholder="Например, 2020"
                    min="2016"
                    max={new Date().getFullYear() - 3}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md"
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setError('')
                  }}
                  className="text-gray-500 hover:text-gray-700 px-6 py-2.5 rounded-full text-sm transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          )}

          {children.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Baby size={40} className="text-emerald-400" />
              </div>
              <p className="text-gray-500 text-lg mb-2">Нет добавленных детей</p>
              <p className="text-gray-400 text-sm mb-4">Добавьте первого ребёнка, чтобы начать обучение</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-emerald-500 hover:text-emerald-600 text-sm font-medium transition-colors"
              >
                + Добавить ребёнка
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map((child) => {
                const age = getAge(child)
                return (
                  <div
                    key={child.id}
                    className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-emerald-200 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                          {getAgeEmoji(age)}
                        </div>
                        <div>
                          <h3 className="text-gray-800 text-lg font-semibold">{child.name}</h3>
                          <p className="text-gray-400 text-sm">
                            {age !== null ? `${age} ${getAgeWord(age)}` : 'Возраст не указан'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteChild(child.id, child.name)}
                        className="text-gray-300 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => navigate(`/games/${child.id}`)}
                        className="flex-1 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <Play size={16} />
                        Играть
                      </button>
                      <button
                        onClick={() => navigate(`/stats/${child.id}`)}
                        className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <TrendingUp size={16} />
                        Статистика
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}