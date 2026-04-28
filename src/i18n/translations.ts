export type Locale = 'es' | 'en' | 'ca'

export interface Translations {
  appTagline: string
  newPirate: string
  pirateNamePlaceholder: string
  joinCrew: string
  setSail: string
  cancel: string
  ranking: string
  deletePirateConfirm: (name: string) => string

  battleMode: string
  modes: {
    normal: { name: string; desc: string }
    speed: { name: string; desc: string }
    survival: { name: string; desc: string }
    blitz: { name: string; desc: string }
  }

  loadingChallenge: string
  lives: (n: number) => string
  streak: string
  gearSecondBanner: string

  correctMessages: string[]
  gearMessages: string[]
  wrongMessages: string[]
  timeUp: string

  victory: string
  defeat: string
  berriesEarned: string
  correct: string
  bestStreak: string
  accuracy: string
  rankUp: string
  newLevelUnlocked: string
  achievementUnlocked: string
  playAgain: string
  backToCrew: string
  shareResult: string
  shareText: (name: string, berries: number, accuracy: number) => string

  rankingTitle: string
  berriesTab: string
  correctTab: string
  streakTab: string
  noPiratesYet: string

  language: string
  sound: string
  soundOn: string
  soundOff: string

  exitGame: string
  exitConfirm: string
  activeLevel: string
  berriesPerCorrect: (n: number) => string
  gamesPlayed: string
  precision: string
  bestStreakShort: string
  recentGames: string
  playFirstGame: string
  nextRank: (name: string, berries: number) => string
  maxRankReached: string

  ranks: string[]
}

export const translations: Record<Locale, Translations> = {
  es: {
    appTagline: 'Entrenamiento de la Tripulación',
    newPirate: '¡Nuevo Pirata!',
    pirateNamePlaceholder: 'Tu nombre pirata...',
    joinCrew: '⚓ ¡Unirse!',
    setSail: '⚓ ¡Zarpar!',
    cancel: 'Cancelar',
    ranking: '🏆 Ranking',
    deletePirateConfirm: (name) => `¿Eliminar a ${name}?`,
    battleMode: 'MODO DE BATALLA',
    modes: {
      normal:   { name: 'Espadachín',    desc: '10 preguntas · tiempo libre' },
      speed:    { name: 'Gear Second',   desc: '10 preguntas · 15 seg c/u' },
      survival: { name: 'Supervivencia', desc: '3 vidas · infinitas preguntas' },
      blitz:    { name: 'Tormenta',      desc: '10 preg. · 8 seg · ×2 puntos' },
    },
    loadingChallenge: 'Cargando reto...',
    lives: (n) => `${n} ${n === 1 ? 'vida' : 'vidas'}`,
    streak: '🔥 Racha',
    gearSecondBanner: '⚡ GEAR SECOND — PUNTOS ×2 ⚡',
    correctMessages: ['¡CORRECTO!', '¡NAKAMA!', '¡PERFECTO!', '¡BRUTAL!', '¡INCREÍBLE!'],
    gearMessages: ['¡GOMU GOMU!', '¡GEAR SECOND!', '¡IMPARABLE!', '¡REY PIRATA!'],
    wrongMessages: ['¡Sigue!', '¡Tú puedes!', '¡Entrena más!', '¡La próxima!'],
    timeUp: '¡TIEMPO!',
    victory: '⚓ ¡VICTORIA!',
    defeat: '💀 ¡DERROTA!',
    berriesEarned: '🪙 Berries ganadas',
    correct: '✅ Aciertos',
    bestStreak: '🔥 Racha máxima',
    accuracy: '🎯 Precisión',
    rankUp: '🎉 ¡ASCENSO DE RANGO!',
    newLevelUnlocked: '¡NUEVO NIVEL DESBLOQUEADO!',
    achievementUnlocked: '¡Logro desbloqueado!',
    playAgain: '⚔️ Otra vez',
    backToCrew: '🏴‍☠️ Tripulación',
    shareResult: '📤 Compartir',
    shareText: (name, berries, accuracy) => `🏴‍☠️ ${name} ganó ${berries} 🪙 con ${accuracy}% de precisión en Nakama Math!`,
    rankingTitle: '🏆 RANKING',
    berriesTab: '🪙 Berries',
    correctTab: '✅ Aciertos',
    streakTab: '🔥 Racha',
    noPiratesYet: '¡Aún no hay piratas!',
    language: 'Idioma',
    sound: 'Sonido',
    soundOn: 'Activado',
    soundOff: 'Desactivado',
    exitGame: '✕ Salir',
    exitConfirm: '¿Abandonar la partida?',
    activeLevel: 'Nivel activo',
    berriesPerCorrect: (n) => `+${n} 🪙 por acierto`,
    gamesPlayed: 'partidas',
    precision: 'precisión',
    bestStreakShort: 'mejor racha',
    recentGames: 'Últimas partidas',
    playFirstGame: '¡Juega tu primera partida!',
    nextRank: (name, berries) => `Faltan ${berries.toLocaleString()} 🪙 para ${name}`,
    maxRankReached: '¡Rango máximo alcanzado! 👑',
    ranks: ['Grumete', 'Marinero', 'Pirata', 'Primer Oficial', 'Capitán', 'Shichibukai', 'Yonko', 'Rey Pirata'],
  },

  en: {
    appTagline: 'Crew Training',
    newPirate: 'New Pirate!',
    pirateNamePlaceholder: 'Your pirate name...',
    joinCrew: '⚓ Join!',
    setSail: '⚓ Set Sail!',
    cancel: 'Cancel',
    ranking: '🏆 Ranking',
    deletePirateConfirm: (name) => `Delete ${name}?`,
    battleMode: 'BATTLE MODE',
    modes: {
      normal:   { name: 'Swordsman',   desc: '10 questions · no time limit' },
      speed:    { name: 'Gear Second', desc: '10 questions · 15 sec each' },
      survival: { name: 'Survival',    desc: '3 lives · endless questions' },
      blitz:    { name: 'Storm',       desc: '10 qs · 8 sec · ×2 points' },
    },
    loadingChallenge: 'Loading challenge...',
    lives: (n) => `${n} ${n === 1 ? 'life' : 'lives'}`,
    streak: '🔥 Streak',
    gearSecondBanner: '⚡ GEAR SECOND — POINTS ×2 ⚡',
    correctMessages: ['CORRECT!', 'NAKAMA!', 'PERFECT!', 'BRUTAL!', 'INCREDIBLE!'],
    gearMessages: ['GOMU GOMU!', 'GEAR SECOND!', 'UNSTOPPABLE!', 'PIRATE KING!'],
    wrongMessages: ['Keep going!', 'You got this!', 'Train harder!', 'Next one!'],
    timeUp: "TIME'S UP!",
    victory: '⚓ VICTORY!',
    defeat: '💀 DEFEAT!',
    berriesEarned: '🪙 Berries earned',
    correct: '✅ Correct',
    bestStreak: '🔥 Best streak',
    accuracy: '🎯 Accuracy',
    rankUp: '🎉 RANK UP!',
    newLevelUnlocked: 'NEW LEVEL UNLOCKED!',
    achievementUnlocked: 'Achievement unlocked!',
    playAgain: '⚔️ Again',
    backToCrew: '🏴‍☠️ Crew',
    shareResult: '📤 Share',
    shareText: (name, berries, accuracy) => `🏴‍☠️ ${name} earned ${berries} 🪙 with ${accuracy}% accuracy in Nakama Math!`,
    rankingTitle: '🏆 RANKING',
    berriesTab: '🪙 Berries',
    correctTab: '✅ Correct',
    streakTab: '🔥 Streak',
    noPiratesYet: 'No pirates yet!',
    language: 'Language',
    sound: 'Sound',
    soundOn: 'On',
    soundOff: 'Off',
    exitGame: '✕ Exit',
    exitConfirm: 'Abandon this game?',
    activeLevel: 'Active level',
    berriesPerCorrect: (n) => `+${n} 🪙 per correct`,
    gamesPlayed: 'games',
    precision: 'accuracy',
    bestStreakShort: 'best streak',
    recentGames: 'Recent games',
    playFirstGame: 'Play your first game!',
    nextRank: (name, berries) => `${berries.toLocaleString()} 🪙 to reach ${name}`,
    maxRankReached: 'Max rank reached! 👑',
    ranks: ['Cabin Boy', 'Sailor', 'Pirate', 'First Mate', 'Captain', 'Warlord', 'Emperor', 'Pirate King'],
  },

  ca: {
    appTagline: "Entrenament de la Tripulació",
    newPirate: 'Nou Pirata!',
    pirateNamePlaceholder: 'El teu nom pirata...',
    joinCrew: '⚓ Unir-se!',
    setSail: '⚓ Salpem!',
    cancel: "Cancel·lar",
    ranking: '🏆 Rànquing',
    deletePirateConfirm: (name) => `Eliminar ${name}?`,
    battleMode: 'MODE DE BATALLA',
    modes: {
      normal:   { name: 'Espadatxí',     desc: '10 preguntes · sense límit' },
      speed:    { name: 'Gear Second',   desc: '10 preguntes · 15 seg c/u' },
      survival: { name: 'Supervivència', desc: '3 vides · preguntes infinites' },
      blitz:    { name: 'Tempesta',      desc: '10 preg. · 8 seg · ×2 punts' },
    },
    loadingChallenge: 'Carregant repte...',
    lives: (n) => `${n} ${n === 1 ? 'vida' : 'vides'}`,
    streak: '🔥 Ratxa',
    gearSecondBanner: '⚡ GEAR SECOND — PUNTS ×2 ⚡',
    correctMessages: ['CORRECTE!', 'NAKAMA!', 'PERFECTE!', 'BRUTAL!', "INCREÏBLE!"],
    gearMessages: ['GOMU GOMU!', 'GEAR SECOND!', 'IMPARABLE!', 'REI PIRATA!'],
    wrongMessages: ['Continua!', 'Tu pots!', 'Entrena més!', 'La propera!'],
    timeUp: 'TEMPS!',
    victory: '⚓ VICTÒRIA!',
    defeat: '💀 DERROTA!',
    berriesEarned: '🪙 Berries guanyades',
    correct: '✅ Encerts',
    bestStreak: '🔥 Millor ratxa',
    accuracy: '🎯 Precisió',
    rankUp: '🎉 ASCENS DE RANG!',
    newLevelUnlocked: 'NOU NIVELL DESBLOQUEJAT!',
    achievementUnlocked: 'Èxit desbloquejat!',
    playAgain: '⚔️ Una altra',
    backToCrew: '🏴‍☠️ Tripulació',
    shareResult: '📤 Compartir',
    shareText: (name, berries, accuracy) => `🏴‍☠️ ${name} ha guanyat ${berries} 🪙 amb ${accuracy}% de precisió a Nakama Math!`,
    rankingTitle: '🏆 RÀNQUING',
    berriesTab: '🪙 Berries',
    correctTab: '✅ Encerts',
    streakTab: '🔥 Ratxa',
    noPiratesYet: 'Encara no hi ha pirates!',
    language: 'Idioma',
    sound: 'So',
    soundOn: 'Activat',
    soundOff: 'Desactivat',
    exitGame: '✕ Sortir',
    exitConfirm: 'Abandonar la partida?',
    activeLevel: 'Nivell actiu',
    berriesPerCorrect: (n) => `+${n} 🪙 per encert`,
    gamesPlayed: 'partides',
    precision: 'precisió',
    bestStreakShort: 'millor ratxa',
    recentGames: 'Darreres partides',
    playFirstGame: 'Juga la teva primera partida!',
    nextRank: (name, berries) => `Falten ${berries.toLocaleString()} 🪙 per a ${name}`,
    maxRankReached: 'Rang màxim assolit! 👑',
    ranks: ['Grumete', 'Mariner', 'Pirata', 'Primer Oficial', 'Capità', 'Shichibukai', 'Yonko', 'Rei Pirata'],
  },
}
