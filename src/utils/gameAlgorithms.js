import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'

// ==================== МАТЕМАТИКА ====================
export const generateMathQuestion = (level, range = 20, operatorsList = ['+', '-']) => {
  const operator = operatorsList[Math.floor(Math.random() * operatorsList.length)]
  let a, b, answer

  switch (operator) {
    case '+':
      answer = Math.floor(Math.random() * (range - 1)) + 1
      a = Math.floor(Math.random() * answer)
      b = answer - a
      break
    case '-':
      a = Math.floor(Math.random() * range) + 2
      b = Math.floor(Math.random() * (a - 1)) + 1
      answer = a - b
      break
    case '×':
      a = Math.floor(Math.random() * Math.min(range / 2, 5)) + 1
      b = Math.floor(Math.random() * Math.min(range / 2, 5)) + 1
      answer = a * b
      break
    case '÷':
      b = Math.floor(Math.random() * Math.min(range / 2, 5)) + 1
      answer = Math.floor(Math.random() * Math.min(range / 2, 5)) + 1
      a = b * answer
      break
    default:
      a = 2; b = 2; answer = 4
  }

  const options = [answer]
  const r = Math.floor(range / 3) || 2
  while (options.length < 4) {
    const offset = Math.floor(Math.random() * r) + 1
    const fake = Math.random() > 0.5 ? answer + offset : answer - offset
    if (fake > 0 && !options.includes(fake)) options.push(fake)
  }

  return {
    text: `${a} ${operator} ${b} = ?`,
    answer,
    options: options.sort(() => Math.random() - 0.5),
    explanation: `${a} ${operator} ${b} = ${answer}`,
  }
}

// ==================== ПАМЯТЬ ====================
export const generateMemoryCards = (pairsCount) => {
  const emojis = ['🌟', '🎈', '🌸', '🐱', '🍎', '🚀', '🎵', '🌈', '🦋', '🍕', '🎮', '💎', '🐶', '🌻', '🍇', '🎪']
  const selected = emojis.sort(() => Math.random() - 0.5).slice(0, pairsCount)
  const cards = [...selected, ...selected].map((emoji, index) => ({
    id: index,
    emoji,
    pairId: index < pairsCount ? index : index - pairsCount,
  }))
  return cards.sort(() => Math.random() - 0.5)
}

// ==================== ЛОГИКА ====================
export const generateLogicQuestion = async () => {
  const snap = await getDocs(collection(db, 'logicCategories'))
  const categories = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  const mainCategory = categories[Math.floor(Math.random() * categories.length)]
  const otherCategory = categories.filter(c => c.id !== mainCategory.id)[Math.floor(Math.random() * (categories.length - 1))]
  const mainItems = [...mainCategory.emojis].sort(() => Math.random() - 0.5).slice(0, 3)
  const oddItem = otherCategory.emojis[Math.floor(Math.random() * otherCategory.emojis.length)]
  const allItems = [...mainItems, oddItem].sort(() => Math.random() - 0.5)
  return {
    text: 'Найди лишнее!',
    hint: `Все предметы относятся к категории «${mainCategory.name}», кроме одного`,
    items: allItems,
    correct: allItems.indexOf(oddItem),
    category: mainCategory.name,
    oddItem,
    explanation: `«${oddItem}» лишний, потому что он из категории «${otherCategory.name}», а остальные — из «${mainCategory.name}».`,
  }
}

// ==================== РАЗВИТИЕ РЕЧИ ====================
export const getSpeechWord = async (level) => {
  const snap = await getDocs(collection(db, 'words'))
  const words = snap.docs.map(d => d.data()).filter(w => w.level === level)
  return words[Math.floor(Math.random() * words.length)] || { word: 'кот', image: '🐱' }
}

export const checkPronunciation = (target, spoken) => {
  if (!spoken) return 0
  const t = target.toLowerCase().trim()
  const s = spoken.toLowerCase().trim()
  if (t === s) return 100
  const maxLen = Math.max(t.length, s.length)
  let matches = 0
  for (let i = 0; i < maxLen; i++) { if (t[i] === s[i]) matches++ }
  return Math.round((matches / maxLen) * 100)
}

// ==================== ОБУЧЕНИЕ ЧТЕНИЮ ====================
export const getBuildWord = async (level) => {
  const snap = await getDocs(collection(db, 'buildWords'))
  const words = snap.docs.map(d => d.data()).filter(w => w.level === level)
  return words[Math.floor(Math.random() * words.length)] || { word: 'КОТ', image: '🐱' }
}