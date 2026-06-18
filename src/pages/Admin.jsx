import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection, getDocs, doc, setDoc, deleteDoc, addDoc,
  query, orderBy
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import {
  Plus, Trash2, Save, X, LogOut,
  Gamepad2, FolderOpen, FileText, Users, BarChart3,
  Calculator, Brain, Lightbulb, MessageCircle, BookOpen
} from 'lucide-react'

const GAME_ICONS = {
  math: Calculator, 'number-baskets': Calculator, compare: Calculator,
  memory: Brain, commonality: Brain, simon: Brain,
  logic: Lightbulb, matching: Lightbulb, sorting: Lightbulb,
  speech: MessageCircle, 'sentence-reading': MessageCircle, sentence: MessageCircle,
  reading: BookOpen, 'missing-letter': BookOpen, 'choose-word': BookOpen,
}

const TABS = [
  { id: 'games', label: 'Игры', icon: Gamepad2 },
  { id: 'categories', label: 'Категории', icon: FolderOpen },
  { id: 'content', label: 'Контент', icon: FileText },
  { id: 'users', label: 'Пользователи', icon: Users },
  { id: 'stats', label: 'Статистика', icon: BarChart3 },
]

// ===================== ОБНОВЛЁННЫЙ CONTENT_TYPES (без order) =====================
const CONTENT_TYPES = {
  word: {
    label: 'Слово (Читалочка)',
    fields: ['word', 'image', 'difficulty'],
    placeholders: { word: 'кот', image: '🐱', difficulty: 'easy' },
    required: ['word', 'difficulty'],
  },
  buildWord: {
    label: 'Слово для сборки',
    fields: ['word', 'image', 'difficulty'],
    placeholders: { word: 'КОТ', image: '🐱', difficulty: 'easy' },
    required: ['word', 'difficulty'],
  },
  sentence: {
    label: 'Предложение (Чтение)',
    fields: ['text', 'image', 'difficulty'],
    placeholders: { text: 'Мама мыла раму', image: '🧼', difficulty: 'easy' },
    required: ['text', 'difficulty'],
  },
  category: {
    label: 'Категория предметов',
    fields: ['categoryName', 'emojis', 'difficulty'],
    placeholders: { categoryName: 'Фрукты', emojis: '🍎,🍊,🍋', difficulty: 'easy' },
    required: ['categoryName', 'emojis', 'difficulty'],
  },
  matchingPair: {
    label: 'Пара для сопоставления',
    fields: ['pair', 'connection', 'difficulty'],
    placeholders: { pair: '🍎,🍊', connection: 'фрукты', difficulty: 'easy' },
    required: ['pair', 'connection', 'difficulty'],
  },
  missingLetter: {
    label: 'Пропущенная буква',
    fields: ['word', 'missingIndex', 'options', 'difficulty'],
    placeholders: { word: 'кот', missingIndex: '1', options: 'о,а,у', difficulty: 'easy' },
    required: ['word', 'missingIndex', 'options', 'difficulty'],
  },
  syllables: {
    label: 'Слоги',
    fields: ['syllables', 'word', 'difficulty'],
    placeholders: { syllables: 'ко,т', word: 'кот', difficulty: 'easy' },
    required: ['syllables', 'word', 'difficulty'],
  },
  chooseWord: {
    label: 'Выбор слова',
    fields: ['image', 'word', 'options', 'difficulty'],
    placeholders: { image: '🐱', word: 'КОТ', options: 'КОТ,КИТ,РОТ,ДОМ', difficulty: 'easy' },
    required: ['image', 'word', 'options', 'difficulty'],
  },
  describeImage: {
    label: 'Картинка для описания',
    fields: ['image', 'expected', 'difficulty'],
    placeholders: { image: '🐱', expected: 'кот', difficulty: 'easy' },
    required: ['image', 'expected', 'difficulty'],
  },
  sentenceWords: {
    label: 'Предложение (Составь)',
    fields: ['words', 'difficulty'],
    placeholders: { words: 'Мама,моет,раму', difficulty: 'easy' },
    required: ['words', 'difficulty'],
  },
}

function getContentType(gameType) {
  switch (gameType) {
    case 'speech': return 'word'
    case 'reading': return 'buildWord'
    case 'sentence-reading': return 'sentence'
    case 'logic': case 'commonality': case 'sorting': return 'category'
    case 'matching': return 'matchingPair'
    case 'missing-letter': return 'missingLetter'
    case 'syllables': return 'syllables'
    case 'choose-word': return 'chooseWord'
    case 'describe': return 'describeImage'
    case 'sentence': return 'sentenceWords'
    default: return null
  }
}

export default function Admin() {
  const { user, isAdmin, loading: authLoading, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('games')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({})

  const [selectedGameId, setSelectedGameId] = useState('')
  const [selectedGame, setSelectedGame] = useState(null)
  const [gamesList, setGamesList] = useState([])
  const [contentType, setContentType] = useState(null)
  const [maxOrder, setMaxOrder] = useState(0)

  // Состояния для сортировки
  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/dashboard')
    }
  }, [isAdmin, authLoading])

  useEffect(() => {
    if (isAdmin) {
      loadGamesList()
      if (activeTab !== 'content') loadData()
    }
  }, [isAdmin, activeTab])

  useEffect(() => {
    if (isAdmin && activeTab === 'content' && selectedGameId) {
      loadData()
    }
  }, [selectedGameId, isAdmin, activeTab])

  const loadGamesList = async () => {
    try {
      const snap = await getDocs(collection(db, 'games'))
      const games = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setGamesList(games)
      if (!selectedGameId && games.length > 0) {
        setSelectedGameId(games[0].id)
        setSelectedGame(games[0])
        setContentType(getContentType(games[0].type))
      }
    } catch (err) { console.error(err) }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      let snap
      switch (activeTab) {
        case 'games':
          snap = await getDocs(query(collection(db, 'games'), orderBy('order')))
          break
        case 'categories':
          snap = await getDocs(query(collection(db, 'categories'), orderBy('order')))
          break
        case 'content':
          if (selectedGameId) {
            const snap = await getDocs(collection(db, 'games', selectedGameId, 'content'))
            const items = snap.docs.map(d => ({ id: d.id, ...d.data(), _gameId: selectedGameId }))
            setData(items)
            const orders = items.map(item => Number(item.order) || 0)
            const max = orders.length ? Math.max(...orders) : 0
            setMaxOrder(max)
          } else {
            setData([])
            setMaxOrder(0)
          }
          setLoading(false)
          return
        case 'users':
          snap = await getDocs(collection(db, 'users'))
          break
        case 'stats':
          const childrenSnap = await getDocs(collection(db, 'children'))
          const progressSnap = await getDocs(collection(db, 'progress'))
          setData([{
            totalChildren: childrenSnap.size,
            totalGamesPlayed: progressSnap.size,
            averageScore: progressSnap.size > 0
              ? Math.round(progressSnap.docs.reduce((sum, p) => sum + (p.data().score / p.data().maxScore) * 100, 0) / progressSnap.size)
              : 0,
          }])
          setLoading(false)
          return
        default:
          snap = { docs: [] }
      }
      setData(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Удалить?')) return
    try {
      if (activeTab === 'content') {
        await deleteDoc(doc(db, 'games', selectedGameId, 'content', id))
      } else {
        await deleteDoc(doc(db, activeTab, id))
      }
      setData(prev => prev.filter(item => item.id !== id))
      // После удаления пересчитываем maxOrder
      if (activeTab === 'content') {
        const remaining = data.filter(item => item.id !== id)
        const orders = remaining.map(item => Number(item.order) || 0)
        setMaxOrder(orders.length ? Math.max(...orders) : 0)
      }
    } catch (err) { alert('Ошибка: ' + err.message) }
  }

  const handleEdit = (item) => {
    setEditingItem(item.id)
    const { id, _gameId, ...rest } = item
    setFormData({ ...rest, _gameId: item._gameId || selectedGameId })
    setShowForm(true)
  }

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      _gameId: selectedGameId,
      order: maxOrder + 1,
    })
    setShowForm(true)
  }

  const handleGameChange = (gameId) => {
    setSelectedGameId(gameId)
    const game = gamesList.find(g => g.id === gameId)
    setSelectedGame(game)
    setContentType(getContentType(game?.type))
    setData([])
    setMaxOrder(0)
  }

  // ===================== СОРТИРОВКА =====================
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedData = [...data]
  if (sortField) {
    sortedData.sort((a, b) => {
      let valA = a[sortField]
      let valB = b[sortField]

      // Спецобработка для difficulty
      if (sortField === 'difficulty') {
        const order = { easy: 0, medium: 1, hard: 2 }
        valA = order[valA] ?? -1
        valB = order[valB] ?? -1
      }

      // Числа
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA
      }

      // Строки
      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }

  // ===================== СОХРАНЕНИЕ =====================
  const handleSave = async (e) => {
    e.preventDefault()
    try {
      const collectionName = activeTab === 'content' 
        ? `games/${formData._gameId || selectedGameId}/content`
        : activeTab

      const { _id, _gameId, ...saveData } = formData

      for (const key in saveData) {
        if (['emojis', 'options', 'words', 'syllables'].includes(key) && typeof saveData[key] === 'string') {
          saveData[key] = saveData[key].split(',').map(s => s.trim()).filter(Boolean)
        }
        if (key === 'pair' && typeof saveData[key] === 'string') {
          saveData[key] = saveData[key].split(',').map(s => s.trim()).filter(Boolean)
        }
        if (['order', 'missingIndex'].includes(key)) {
          saveData[key] = Number(saveData[key])
        }
      }

      // Если новый элемент, добавляем order
      if (!editingItem) {
        saveData.order = maxOrder + 1
      }

      if (editingItem) {
        await setDoc(doc(db, collectionName, editingItem), saveData, { merge: true })
      } else {
        await addDoc(collection(db, collectionName), saveData)
      }
      setShowForm(false)
      loadData() // перезагружаем данные для обновления maxOrder
    } catch (err) { alert('Ошибка сохранения: ' + err.message) }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" /></div>
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Шапка с кнопкой Выйти */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Админ-панель
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-rose-600 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all"
          >
            <LogOut size={18} />
            Выйти
          </button>
        </div>

        {/* Табы */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setData([]); setSortField(null) }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Выбор игры для контента */}
        {activeTab === 'content' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Выберите игру:</label>
            <div className="flex flex-wrap gap-2">
              {gamesList.map(game => {
                const Icon = GAME_ICONS[game.type] || Gamepad2
                return (
                  <button
                    key={game.id}
                    onClick={() => handleGameChange(game.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                      selectedGameId === game.id
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-white/80 text-gray-600 hover:bg-white border border-gray-200'
                    }`}
                  >
                    <Icon size={16} /> {game.title}
                    <span className="text-xs opacity-75">({game.type})</span>
                  </button>
                )
              })}
            </div>
            {selectedGame && (
              <p className="text-xs text-gray-500 mt-2">
                Тип контента: <strong>{contentType ? CONTENT_TYPES[contentType].label : 'Общий'}</strong>
              </p>
            )}
          </div>
        )}

        {/* Кнопка Добавить */}
        {activeTab !== 'stats' && (activeTab !== 'content' || selectedGameId) && (
          <button
            onClick={handleAdd}
            className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-full font-semibold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
          >
            <Plus size={18} /> Добавить
          </button>
        )}

        {/* Контент */}
        {loading ? (
          <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" /></div>
        ) : activeTab === 'stats' ? (
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl p-6 shadow-lg">
            {data[0] && (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <p className="text-3xl font-bold text-purple-600">{data[0].totalChildren}</p>
                  <p className="text-sm text-gray-600">Детей</p>
                </div>
                <div className="text-center p-4 bg-pink-50 rounded-xl">
                  <p className="text-3xl font-bold text-pink-600">{data[0].totalGamesPlayed}</p>
                  <p className="text-sm text-gray-600">Игр сыграно</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <p className="text-3xl font-bold text-blue-600">{data[0].averageScore}%</p>
                  <p className="text-sm text-gray-600">Средний балл</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl p-6 shadow-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {activeTab === 'games' && (
                    <>
                      <th className="text-left py-2 cursor-pointer hover:text-purple-600 transition-colors" onClick={() => handleSort('title')}>
                        Название {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="text-left py-2 cursor-pointer hover:text-purple-600 transition-colors" onClick={() => handleSort('type')}>
                        Тип {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="text-left py-2 cursor-pointer hover:text-purple-600 transition-colors" onClick={() => handleSort('categoryId')}>
                        Категория {sortField === 'categoryId' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="py-2">Действия</th>
                    </>
                  )}
                  {activeTab === 'categories' && (
                    <>
                      <th className="text-left py-2 cursor-pointer hover:text-purple-600 transition-colors" onClick={() => handleSort('name')}>
                        Название {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="text-left py-2 cursor-pointer hover:text-purple-600 transition-colors" onClick={() => handleSort('icon')}>
                        Иконка {sortField === 'icon' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="text-left py-2 cursor-pointer hover:text-purple-600 transition-colors" onClick={() => handleSort('color')}>
                        Цвет {sortField === 'color' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="py-2">Действия</th>
                    </>
                  )}
                  {activeTab === 'content' && (
                    <>
                      {contentType && CONTENT_TYPES[contentType].fields.map(field => (
                        <th
                          key={field}
                          className="text-left py-2 capitalize cursor-pointer hover:text-purple-600 transition-colors"
                          onClick={() => handleSort(field)}
                        >
                          {field}
                          {sortField === field && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                        </th>
                      ))}
                      <th className="py-2">Действия</th>
                    </>
                  )}
                  {activeTab === 'users' && (
                    <>
                      <th className="text-left py-2 cursor-pointer hover:text-purple-600 transition-colors" onClick={() => handleSort('email')}>
                        Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="text-left py-2 cursor-pointer hover:text-purple-600 transition-colors" onClick={() => handleSort('role')}>
                        Роль {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="py-2">Действия</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {sortedData.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    {activeTab === 'games' && (
                      <>
                        <td className="py-2 font-medium">{item.title}</td>
                        <td className="py-2">{item.type}</td>
                        <td className="py-2">{item.categoryId}</td>
                      </>
                    )}
                    {activeTab === 'categories' && (
                      <>
                        <td className="py-2 font-medium">{item.name}</td>
                        <td className="py-2">{item.icon}</td>
                        <td className="py-2">{item.color}</td>
                      </>
                    )}
                    {activeTab === 'content' && (
                      <>
                        {contentType && CONTENT_TYPES[contentType].fields.map(field => (
                          <td key={field} className="py-2">
                            {field === 'emojis' || field === 'options' || field === 'words' || field === 'syllables'
                              ? (Array.isArray(item[field]) ? item[field].join(', ') : item[field])
                              : field === 'pair'
                                ? (Array.isArray(item[field]) ? item[field].join(', ') : item[field])
                                : item[field]}
                          </td>
                        ))}
                      </>
                    )}
                    {activeTab === 'users' && (
                      <>
                        <td className="py-2">{item.email || item.uid}</td>
                        <td className="py-2">{item.role || 'parent'}</td>
                      </>
                    )}
                    <td className="py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(item)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Save size={16} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedData.length === 0 && (
                  <tr>
                    <td colSpan={activeTab === 'content' ? (contentType ? CONTENT_TYPES[contentType].fields.length + 1 : 2) : 4} className="text-center py-4 text-gray-400">
                      Нет данных
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Модальная форма */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl animate-slide-up max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingItem ? 'Редактировать' : 'Добавить'} {contentType ? CONTENT_TYPES[contentType].label : 'элемент'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {activeTab === 'content' && contentType ? (
                CONTENT_TYPES[contentType].fields.map(field => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {field === 'emojis' ? 'Эмодзи (через запятую)' :
                       field === 'options' ? 'Варианты (через запятую)' :
                       field === 'words' ? 'Слова (через запятую)' :
                       field === 'syllables' ? 'Слоги (через запятую)' :
                       field === 'pair' ? 'Пара (через запятую)' :
                       field === 'missingIndex' ? 'Индекс пропуска (0-..)' :
                       field === 'categoryName' ? 'Название категории' :
                       field === 'expected' ? 'Ожидаемое слово' :
                       field === 'difficulty' ? 'Сложность (easy/medium/hard)' :
                       field}
                    </label>
                    {field === 'difficulty' ? (
                      <select
                        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-800 outline-none focus:border-purple-400 transition-all"
                        value={formData[field] || 'easy'}
                        onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                      >
                        <option value="easy">Лёгкий</option>
                        <option value="medium">Средний</option>
                        <option value="hard">Сложный</option>
                      </select>
                    ) : (
                      <input
                        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-gray-800 outline-none focus:border-purple-400 transition-all"
                        placeholder={CONTENT_TYPES[contentType].placeholders[field] || ''}
                        value={formData[field] ?? ''}
                        onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                        required={CONTENT_TYPES[contentType].required?.includes(field)}
                      />
                    )}
                  </div>
                ))
              ) : activeTab === 'games' ? (
                <>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">ID</label><input className="w-full border rounded-xl px-4 py-2" value={formData.id || ''} onChange={e => setFormData({...formData, id: e.target.value})} required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Название</label><input className="w-full border rounded-xl px-4 py-2" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Тип</label><input className="w-full border rounded-xl px-4 py-2" value={formData.type || ''} onChange={e => setFormData({...formData, type: e.target.value})} required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Категория (ID)</label><input className="w-full border rounded-xl px-4 py-2" value={formData.categoryId || ''} onChange={e => setFormData({...formData, categoryId: e.target.value})} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Описание</label><textarea className="w-full border rounded-xl px-4 py-2" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                </>
              ) : activeTab === 'categories' ? (
                <>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">ID</label><input className="w-full border rounded-xl px-4 py-2" value={formData.id || ''} onChange={e => setFormData({...formData, id: e.target.value})} required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Название</label><input className="w-full border rounded-xl px-4 py-2" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Иконка (Lucide)</label><input className="w-full border rounded-xl px-4 py-2" value={formData.icon || ''} onChange={e => setFormData({...formData, icon: e.target.value})} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Цвет</label><input className="w-full border rounded-xl px-4 py-2" value={formData.color || ''} onChange={e => setFormData({...formData, color: e.target.value})} /></div>
                </>
              ) : activeTab === 'users' ? (
                <>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input className="w-full border rounded-xl px-4 py-2" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
                    <select className="w-full border rounded-xl px-4 py-2" value={formData.role || 'parent'} onChange={e => setFormData({...formData, role: e.target.value})}>
                      <option value="parent">Родитель</option>
                      <option value="admin">Админ</option>
                    </select>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Выберите игру для редактирования контента</p>
              )}

              <button type="submit" className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                <Save size={18} /> Сохранить
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}