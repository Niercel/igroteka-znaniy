import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'

const toDifficulty = (item) => {
  if (item.difficulty) return item.difficulty
  if (item.level === 1) return 'easy'
  if (item.level === 2) return 'medium'
  if (item.level === 3) return 'hard'
  return null
}

// ==================== МАТЕМАТИКА ====================
export const generateMathQuestion = (range = 20, operatorsList = ['+', '-']) => {
  const operator = operatorsList[Math.floor(Math.random() * operatorsList.length)]
  let a, b, answer
  switch (operator) {
    case '+': answer = Math.floor(Math.random() * (range - 1)) + 1; a = Math.floor(Math.random() * answer); b = answer - a; break
    case '-': a = Math.floor(Math.random() * range) + 2; b = Math.floor(Math.random() * (a - 1)) + 1; answer = a - b; break
    case '×': a = Math.floor(Math.random() * Math.min(range / 2, 5)) + 1; b = Math.floor(Math.random() * Math.min(range / 2, 5)) + 1; answer = a * b; break
    case '÷': b = Math.floor(Math.random() * Math.min(range / 2, 5)) + 1; answer = Math.floor(Math.random() * Math.min(range / 2, 5)) + 1; a = b * answer; break
    default: a = 2; b = 2; answer = 4
  }
  const options = [answer]
  const r = Math.floor(range / 3) || 2
  while (options.length < 4) {
    const offset = Math.floor(Math.random() * r) + 1
    const fake = Math.random() > 0.5 ? answer + offset : answer - offset
    if (fake > 0 && !options.includes(fake)) options.push(fake)
  }
  return { text: `${a} ${operator} ${b} = ?`, answer, options: options.sort(() => Math.random() - 0.5), explanation: `${a} ${operator} ${b} = ${answer}` }
}

// ==================== ПАМЯТЬ ====================
export const generateMemoryCards = (pairsCount) => {
  const emojis = ['🌟', '🎈', '🌸', '🐱', '🍎', '🚀', '🎵', '🌈', '🦋', '🍕', '🎮', '💎', '🐶', '🌻', '🍇', '🎪']
  const selected = emojis.sort(() => Math.random() - 0.5).slice(0, pairsCount)
  const cards = [...selected, ...selected].map((emoji, index) => ({ id: index, emoji, pairId: index < pairsCount ? index : index - pairsCount }))
  return cards.sort(() => Math.random() - 0.5)
}

// ==================== СРАВНЕНИЕ ЧИСЕЛ ====================
export const generateCompareQuestion = (range) => ({ a: Math.floor(Math.random() * range) + 1, b: Math.floor(Math.random() * range) + 1 })

// ==================== ПРОВЕРКА ПРОИЗНОШЕНИЯ ====================
export const checkPronunciation = (target, spoken) => {
  if (!spoken) return 0
  const t = target.toLowerCase().trim(), s = spoken.toLowerCase().trim()
  if (t === s) return 100
  const maxLen = Math.max(t.length, s.length)
  let matches = 0
  for (let i = 0; i < maxLen; i++) if (t[i] === s[i]) matches++
  return Math.round((matches / maxLen) * 100)
}

// ==================== ЗАГРУЗКА КОНТЕНТА ИГРЫ ====================
export const loadGameContent = async (gameId) => {
  const snap = await getDocs(collection(db, 'games', gameId, 'content'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ==================== ЛОГИКА – ЧТО ЛИШНЕЕ? ====================
export const generateLogicQuestion = async (gameId, difficulty) => {
  const items = await loadGameContent(gameId)
  const categories = items.filter(i => toDifficulty(i) === difficulty && i.categoryName)
  if (categories.length < 2) {
    return { text: 'Найди лишнее!', hint: 'Недостаточно категорий', items: [], correct: 0, explanation: '' }
  }
  const main = categories[Math.floor(Math.random() * categories.length)]
  const others = categories.filter(c => c.categoryName !== main.categoryName)
  const other = others[Math.floor(Math.random() * others.length)]
  const mainEmojis = main.emojis.sort(() => Math.random() - 0.5).slice(0, 3)
  const odd = other.emojis[Math.floor(Math.random() * other.emojis.length)]
  const allItems = [...mainEmojis, odd].sort(() => Math.random() - 0.5)
  return {
    text: 'Найди лишнее!',
    hint: `Все предметы относятся к категории «${main.categoryName}», кроме одного`,
    items: allItems,
    correct: allItems.indexOf(odd),
    explanation: `«${odd}» лишний, потому что он из категории «${other.categoryName}», а остальные — из «${main.categoryName}».`
  }
}

// ==================== ЧИТАЛОЧКА ====================
export const getSpeechWord = async (gameId, difficulty, category = null) => {
  const items = await loadGameContent(gameId)
  let filtered = items.filter(w => toDifficulty(w) === difficulty && w.word)
  if (category) filtered = filtered.filter(w => w.category === category)
  return filtered.length ? filtered[Math.floor(Math.random() * filtered.length)] : { word: 'кот', image: '🐱' }
}

// ==================== ПРЕДЛОЖЕНИЕ ДЛЯ ЧТЕНИЯ ====================
export const getSentenceForReading = async (gameId, difficulty) => {
  const items = await loadGameContent(gameId)
  const filtered = items.filter(s => toDifficulty(s) === difficulty && s.text)
  return filtered.length ? filtered[Math.floor(Math.random() * filtered.length)] : { text: 'Мама мыла раму', image: '🧼' }
}

// ==================== ПРОВЕРКА ПРЕДЛОЖЕНИЯ ====================
export const checkSentenceAccuracy = (target, spoken, startTime) => {
  if (!spoken) return { accuracy: 0, speed: 0, wordsMatched: 0, totalWords: 0 }
  const targetWords = target.toLowerCase().trim().split(/\s+/)
  const spokenWords = spoken.toLowerCase().trim().split(/\s+/)
  const totalWords = targetWords.length
  let wordsMatched = 0
  for (let i = 0; i < Math.min(targetWords.length, spokenWords.length); i++) {
    if (targetWords[i] === spokenWords[i]) wordsMatched++
  }
  const accuracy = Math.round((wordsMatched / totalWords) * 100)
  const elapsedMinutes = (Date.now() - startTime) / 60000
  const speed = elapsedMinutes > 0 ? Math.round(wordsMatched / elapsedMinutes) : 0
  return { accuracy, speed, wordsMatched, totalWords }
}

// ==================== СОСТАВЬ ПРЕДЛОЖЕНИЕ ====================
export const getSentence = async (gameId, difficulty) => {
  const items = await loadGameContent(gameId)
  const filtered = items.filter(i => toDifficulty(i) === difficulty && i.words)
  return filtered.length ? filtered[Math.floor(Math.random() * filtered.length)] : { words: ['Мама', 'моет', 'раму'] }
}

// ==================== СОБЕРИ СЛОВО ====================
export const getBuildWord = async (gameId, difficulty, category = null) => {
  const items = await loadGameContent(gameId)
  let filtered = items.filter(w => toDifficulty(w) === difficulty && w.word)
  if (category) filtered = filtered.filter(w => w.category === category)
  return filtered.length ? filtered[Math.floor(Math.random() * filtered.length)] : { word: 'КОТ', image: '🐱' }
}

// ==================== БУКВА ПОТЕРЯЛАСЬ ====================
export const getMissingLetter = async (gameId, difficulty, category = null) => {
  const items = await loadGameContent(gameId)
  let filtered = items.filter(i => toDifficulty(i) === difficulty && i.missingIndices !== undefined)
  if (category) filtered = filtered.filter(i => i.category === category)
  return filtered.length ? filtered[Math.floor(Math.random() * filtered.length)] : null
}

// ==================== ВЫБЕРИ СЛОВО ====================
export const getChooseWord = async (gameId, difficulty, category = null) => {
  const items = await loadGameContent(gameId)
  let filtered = items.filter(i => toDifficulty(i) === difficulty && i.word && i.options)
  if (category) filtered = filtered.filter(i => i.category === category)
  return filtered.length ? filtered[Math.floor(Math.random() * filtered.length)] : null
}