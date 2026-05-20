export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard']
export const DIFFICULTY_LABELS = {
  easy: '🌟 Легко',
  medium: '⭐ Средне',
  hard: '💪 Сложно',
}

export const GAME_SETTINGS = {
  math: {
    easy: { rounds: 5, numberRange: 10, operators: ['+'] },
    medium: { rounds: 7, numberRange: 20, operators: ['+', '-'] },
    hard: { rounds: 10, numberRange: 50, operators: ['+', '-', '×', '÷'] },
  },
  memory: {
    easy: { rounds: 1, pairsCount: 4, maxLevel: 2 },
    medium: { rounds: 1, pairsCount: 6, maxLevel: 3 },
    hard: { rounds: 1, pairsCount: 8, maxLevel: 3 },
  },
  logic: {
    easy: { rounds: 5 },
    medium: { rounds: 7 },
    hard: { rounds: 10 },
  },
  speech: {
    easy: { rounds: 5, accuracyRequired: 60 },
    medium: { rounds: 7, accuracyRequired: 70 },
    hard: { rounds: 10, accuracyRequired: 80 },
  },
  reading: {
    easy: { rounds: 5 },
    medium: { rounds: 7 },
    hard: { rounds: 10 },
},
  'number-baskets': {
    easy: { rounds: 4, targetRange: 5 },
    medium: { rounds: 6, targetRange: 10 },
    hard: { rounds: 8, targetRange: 15 },
  },
  compare: {
    easy: { rounds: 5, numberRange: 10 },
    medium: { rounds: 7, numberRange: 20 },
    hard: { rounds: 10, numberRange: 50 },
  },
  commonality: {
    easy: { rounds: 5 },
    medium: { rounds: 7 },
    hard: { rounds: 10 },
  },
  simon: {
    easy: { rounds: 3, baseLength: 3 },
    medium: { rounds: 5, baseLength: 4 },
    hard: { rounds: 7, baseLength: 5 },
  },
  matching: {
    easy: { rounds: 3, pairsPerRound: 3 },
    medium: { rounds: 5, pairsPerRound: 4 },
    hard: { rounds: 7, pairsPerRound: 5 },
  },
  'sentence-reading': {
    easy: { rounds: 3, accuracyRequired: 60 },
    medium: { rounds: 5, accuracyRequired: 70 },
    hard: { rounds: 7, accuracyRequired: 80 },
  },
  sentence: {
    easy: { rounds: 4 },
    medium: { rounds: 6 },
    hard: { rounds: 8 },
  },
  'missing-letter': {
    easy: { rounds: 5 },
    medium: { rounds: 7 },
    hard: { rounds: 10 },
  },
  'choose-word': {
    easy: { rounds: 4 },
    medium: { rounds: 6 },
    hard: { rounds: 8 },
  },
}

export const getSettings = (gameType, difficulty) => GAME_SETTINGS[gameType]?.[difficulty] || GAME_SETTINGS[gameType]?.medium
export const getDifficultyLabel = (difficulty) => DIFFICULTY_LABELS[difficulty] || '⭐ Средне'