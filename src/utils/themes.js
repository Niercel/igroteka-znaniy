export const CATEGORY_THEMES = {
  violet: {   // математика
    primary: '#7c3aed',
    secondary: '#a78bfa',
    light: '#c4b5fd',
    bgFrom: '#2e1065',   // тёмный для фона
    bgTo: '#1e1b4b',
    cardBg: 'rgba(124, 58, 237, 0.15)',
    cardBorder: 'rgba(167, 139, 250, 0.3)',
    shapes: ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd'],
  },
  pink: {     // внимание и память
    primary: '#db2777',
    secondary: '#f472b6',
    light: '#fbcfe8',
    bgFrom: '#4a1942',
    bgTo: '#1e1b4b',
    cardBg: 'rgba(219, 39, 119, 0.15)',
    cardBorder: 'rgba(244, 114, 182, 0.3)',
    shapes: ['#db2777', '#ec4899', '#f472b6', '#fbcfe8'],
  },
  orange: {   // логика
    primary: '#ea580c',
    secondary: '#fb923c',
    light: '#fed7aa',
    bgFrom: '#431407',
    bgTo: '#1e1b4b',
    cardBg: 'rgba(234, 88, 12, 0.15)',
    cardBorder: 'rgba(251, 146, 60, 0.3)',
    shapes: ['#ea580c', '#f97316', '#fb923c', '#fed7aa'],
  },
  green: {    // развитие речи
    primary: '#16a34a',
    secondary: '#4ade80',
    light: '#bbf7d0',
    bgFrom: '#052e16',
    bgTo: '#1e1b4b',
    cardBg: 'rgba(22, 163, 74, 0.15)',
    cardBorder: 'rgba(74, 222, 128, 0.3)',
    shapes: ['#16a34a', '#22c55e', '#4ade80', '#bbf7d0'],
  },
  blue: {     // обучение чтению
    primary: '#2563eb',
    secondary: '#60a5fa',
    light: '#bfdbfe',
    bgFrom: '#0c1929',
    bgTo: '#1e1b4b',
    cardBg: 'rgba(37, 99, 235, 0.15)',
    cardBorder: 'rgba(96, 165, 250, 0.3)',
    shapes: ['#2563eb', '#3b82f6', '#60a5fa', '#bfdbfe'],
  },
};

export const getCategoryTheme = (colorName) => {
  return CATEGORY_THEMES[colorName] || CATEGORY_THEMES.violet;
};