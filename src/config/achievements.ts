export interface Achievement {
  id: string
  icon: string
  nameKey: keyof typeof achievementNames
}

export const achievementNames = {
  firstGame:    { es: 'Primera partida',      en: 'First Game',         ca: 'Primera partida'     },
  firstWin:     { es: '¡Primera victoria!',   en: 'First Victory!',     ca: 'Primera victòria!'   },
  perfectGame:  { es: '¡Perfección!',         en: 'Perfection!',        ca: 'Perfecció!'           },
  streak3:      { es: 'Racha de 3',           en: '3-Streak',           ca: 'Ratxa de 3'          },
  streak5:      { es: 'Gear Second',          en: 'Gear Second',        ca: 'Gear Second'         },
  streak10:     { es: 'Gear Third',           en: 'Gear Third',         ca: 'Gear Third'          },
  games10:      { es: '10 partidas',          en: '10 Games',           ca: '10 partides'         },
  games50:      { es: '50 partidas',          en: '50 Games',           ca: '50 partides'         },
  correct100:   { es: '100 aciertos',         en: '100 Correct',        ca: '100 encerts'         },
  correct500:   { es: '500 aciertos',         en: '500 Correct',        ca: '500 encerts'         },
  levelUp:      { es: 'Nuevo nivel',          en: 'New Level',          ca: 'Nou nivell'          },
} as const

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'firstGame',   icon: '🏴‍☠️', nameKey: 'firstGame'   },
  { id: 'firstWin',    icon: '⚓',   nameKey: 'firstWin'    },
  { id: 'perfectGame', icon: '💎',   nameKey: 'perfectGame' },
  { id: 'streak3',     icon: '🔥',   nameKey: 'streak3'     },
  { id: 'streak5',     icon: '⚡',   nameKey: 'streak5'     },
  { id: 'streak10',    icon: '🌊',   nameKey: 'streak10'    },
  { id: 'games10',     icon: '🎯',   nameKey: 'games10'     },
  { id: 'games50',     icon: '🏆',   nameKey: 'games50'     },
  { id: 'correct100',  icon: '💯',   nameKey: 'correct100'  },
  { id: 'correct500',  icon: '👑',   nameKey: 'correct500'  },
  { id: 'levelUp',     icon: '🗺️',  nameKey: 'levelUp'     },
]
