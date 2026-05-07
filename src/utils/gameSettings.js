export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard']

export const DIFFICULTY_LABELS = {
  easy: '🌟 Легко',
  medium: '⭐ Средне',
  hard: '💪 Сложно',
}

export const GAME_SETTINGS = {
  math: {
    easy: { rounds: 5, maxLevel: 2, numberRange: 10, operators: ['+'] },
    medium: { rounds: 7, maxLevel: 3, numberRange: 20, operators: ['+', '-'] },
    hard: { rounds: 10, maxLevel: 3, numberRange: 50, operators: ['+', '-', '×', '÷'] },
  },
  memory: {
    easy: { pairsCount: 4, maxLevel: 2 },
    medium: { pairsCount: 6, maxLevel: 3 },
    hard: { pairsCount: 8, maxLevel: 3 },
  },
  logic: {
    easy: { rounds: 5, maxLevel: 2 },
    medium: { rounds: 7, maxLevel: 3 },
    hard: { rounds: 10, maxLevel: 3 },
  },
  speech: {
    easy: { wordsCount: 5, maxLevel: 2, accuracyRequired: 60 },
    medium: { wordsCount: 7, maxLevel: 3, accuracyRequired: 70 },
    hard: { wordsCount: 10, maxLevel: 3, accuracyRequired: 80 },
  },
  reading: {
    easy: { wordsCount: 5, maxLevel: 2 },
    medium: { wordsCount: 7, maxLevel: 3 },
    hard: { wordsCount: 10, maxLevel: 3 },
  },
}

export const getSettings = (gameType, difficulty) => {
  return GAME_SETTINGS[gameType]?.[difficulty] || GAME_SETTINGS[gameType]?.medium
}

export const getDifficultyLabel = (difficulty) => {
  return DIFFICULTY_LABELS[difficulty] || '⭐ Средне'
}