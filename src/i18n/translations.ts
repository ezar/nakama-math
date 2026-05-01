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
  competitiveMode: string
  soloMode: string
  modes: {
    normal: { name: string; desc: string }
    speed: { name: string; desc: string }
    survival: { name: string; desc: string }
    blitz: { name: string; desc: string }
    versus: { name: string; desc: string }
    duel: { name: string; desc: string }
    timeTrial: { name: string; desc: string }
    practice: { name: string; desc: string }
    errorDrill: { name: string; desc: string }
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

  dailyChallenge: string
  dailyDone: string
  dailyBonus: string
  dailyStreakLabel: (n: number) => string
  wrongAnswersTitle: string
  noMistakes: string
  timeTrialHeader: string
  practiceHeader: string
  chooseOperation: string
  operationNames: Record<string, string>

  chooseOpponent: string
  difficulty: { easy: string; medium: string; hard: string; legend: string }
  choosePlayer2: string
  passTurnTo: (name: string) => string
  p1Finished: string
  tapToStart: string
  duelWinner: (name: string) => string
  itsATie: string
  vsResult: string
  duelResult: string
  youLabel: string

  inputModeLabel: string
  typeYourAnswer: string
  operationBreakdown: string
  activityLabel: string
  shopTitle: string
  shopAvatars: string
  equipLabel: string
  ownedLabel: string
  notEnoughBerries: string

  settingsTitle: string
  errorDrillTitle: string
  errorDrillDesc: string
  noErrorsYet: string
  powerupFreeze: string
  powerupEliminate: string
  powerupSkip: string
  tutorialTitle: string
  tutorialSlides: { title: string; body: string }[]
  tutorialStart: string
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
    competitiveMode: 'MODO COMPETITIVO',
    soloMode: 'MODO LIBRE',
    modes: {
      normal:    { name: 'Espadachín',    desc: '10 preguntas · tiempo libre' },
      speed:     { name: 'Gear Second',   desc: '10 preguntas · 15 seg c/u' },
      survival:  { name: 'Supervivencia', desc: '3 vidas · infinitas preguntas' },
      blitz:     { name: 'Tormenta',      desc: '10 preg. · 8 seg · ×2 puntos' },
      versus:    { name: 'VS IA',         desc: 'Reta a un personaje One Piece' },
      duel:      { name: 'Duelo Local',   desc: 'Turnos con otro pirata' },
      timeTrial: { name: 'Contrarreloj',  desc: '60 seg · ¿Cuántas puedes?' },
      practice:  { name: 'Práctica',      desc: 'Sin puntos · elige operación' },
      errorDrill: { name: 'Repaso',        desc: 'Practica tus errores anteriores' },
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
    dailyChallenge: '⚓ Reto Diario',
    dailyDone: '✅ Completado hoy',
    dailyBonus: '×3 Berries',
    dailyStreakLabel: (n) => `${n} día${n === 1 ? '' : 's'} seguido${n === 1 ? '' : 's'}`,
    wrongAnswersTitle: 'Errores',
    noMistakes: '¡Sin errores! 🎉',
    timeTrialHeader: 'CONTRARRELOJ',
    practiceHeader: 'PRÁCTICA LIBRE',
    chooseOperation: 'Elige operación',
    operationNames: { add: 'Suma', sub: 'Resta', mul: 'Multiplicación', div: 'División', frac: 'Fracciones', pct: 'Porcentajes', exp: 'Potencias' },
    chooseOpponent: 'Elige tu rival',
    difficulty: { easy: 'Fácil', medium: 'Medio', hard: 'Difícil', legend: 'Leyenda' },
    choosePlayer2: 'Elige el segundo pirata',
    passTurnTo: (name) => `¡Pasa el turno a ${name}!`,
    p1Finished: '¡Turno terminado!',
    tapToStart: 'Toca para empezar',
    duelWinner: (name) => `🏆 ¡${name} gana!`,
    itsATie: '⚔️ ¡Empate!',
    vsResult: 'RESULTADO VS IA',
    duelResult: 'RESULTADO DUELO',
    youLabel: 'Tú',
    inputModeLabel: '⌨️ Teclado',
    typeYourAnswer: 'Escribe...',
    operationBreakdown: 'Por operación',
    activityLabel: 'Actividad',
    shopTitle: 'Tienda',
    shopAvatars: 'Avatares premium',
    equipLabel: 'Equipar',
    ownedLabel: '✓',
    notEnoughBerries: 'Berries insuficientes',
    settingsTitle: 'Ajustes',
    errorDrillTitle: '🎯 Repaso de Errores',
    errorDrillDesc: 'Practica las preguntas que fallaste',
    noErrorsYet: '¡Aún no hay errores guardados!',
    powerupFreeze: '⏸ +5s',
    powerupEliminate: '✂️ ×2',
    powerupSkip: '⏭ Saltar',
    tutorialTitle: '¡Bienvenido a bordo!',
    tutorialSlides: [
      { title: '⚔️ Responde preguntas', body: 'Elige la respuesta correcta antes de que acabe el tiempo.' },
      { title: '🪙 Gana Berries', body: 'Cada acierto te da Berries. Las rachas multiplican tus puntos.' },
      { title: '⚓ Reto Diario', body: 'Completa el reto diario para ganar ×3 Berries y mantener tu racha.' },
      { title: '🏴‍☠️ ¡A la aventura!', body: '¡Juega tu primera batalla y demuestra que eres digno pirata!' },
    ],
    tutorialStart: '⚔️ ¡Empezar!',
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
    competitiveMode: 'COMPETITIVE MODE',
    soloMode: 'FREE MODE',
    modes: {
      normal:    { name: 'Swordsman',   desc: '10 questions · no time limit' },
      speed:     { name: 'Gear Second', desc: '10 questions · 15 sec each' },
      survival:  { name: 'Survival',    desc: '3 lives · endless questions' },
      blitz:     { name: 'Storm',       desc: '10 qs · 8 sec · ×2 points' },
      versus:    { name: 'VS AI',       desc: 'Challenge a One Piece character' },
      duel:      { name: 'Local Duel',  desc: 'Take turns with another pirate' },
      timeTrial: { name: 'Time Trial',  desc: '60 sec · how many can you get?' },
      practice:  { name: 'Practice',    desc: 'No score · choose operation' },
      errorDrill: { name: 'Review',      desc: 'Practice your previous mistakes' },
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
    dailyChallenge: '⚓ Daily Challenge',
    dailyDone: '✅ Done today',
    dailyBonus: '×3 Berries',
    dailyStreakLabel: (n) => `${n} day${n === 1 ? '' : 's'} in a row`,
    wrongAnswersTitle: 'Mistakes',
    noMistakes: 'No mistakes! 🎉',
    timeTrialHeader: 'TIME TRIAL',
    practiceHeader: 'FREE PRACTICE',
    chooseOperation: 'Choose operation',
    operationNames: { add: 'Addition', sub: 'Subtraction', mul: 'Multiplication', div: 'Division', frac: 'Fractions', pct: 'Percentages', exp: 'Powers' },
    chooseOpponent: 'Choose your rival',
    difficulty: { easy: 'Easy', medium: 'Medium', hard: 'Hard', legend: 'Legend' },
    choosePlayer2: 'Choose second pirate',
    passTurnTo: (name) => `Pass the device to ${name}!`,
    p1Finished: 'Your turn is done!',
    tapToStart: 'Tap to start',
    duelWinner: (name) => `🏆 ${name} wins!`,
    itsATie: '⚔️ It\'s a tie!',
    vsResult: 'VS AI RESULT',
    duelResult: 'DUEL RESULT',
    youLabel: 'You',
    inputModeLabel: '⌨️ Keyboard',
    typeYourAnswer: 'Type answer...',
    operationBreakdown: 'By operation',
    activityLabel: 'Activity',
    shopTitle: 'Shop',
    shopAvatars: 'Premium avatars',
    equipLabel: 'Equip',
    ownedLabel: '✓',
    notEnoughBerries: 'Not enough berries',
    settingsTitle: 'Settings',
    errorDrillTitle: '🎯 Error Review',
    errorDrillDesc: 'Practice the questions you got wrong',
    noErrorsYet: 'No mistakes saved yet!',
    powerupFreeze: '⏸ +5s',
    powerupEliminate: '✂️ ×2',
    powerupSkip: '⏭ Skip',
    tutorialTitle: 'Welcome aboard!',
    tutorialSlides: [
      { title: '⚔️ Answer questions', body: 'Pick the correct answer before time runs out.' },
      { title: '🪙 Earn Berries', body: 'Every correct answer earns Berries. Streaks multiply your score.' },
      { title: '⚓ Daily Challenge', body: 'Complete the daily challenge for ×3 Berries and keep your streak.' },
      { title: '🏴‍☠️ Adventure awaits!', body: 'Play your first battle and prove your worth as a pirate!' },
    ],
    tutorialStart: '⚔️ Let\'s go!',
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
    competitiveMode: 'MODE COMPETITIU',
    soloMode: 'MODE LLIURE',
    modes: {
      normal:    { name: 'Espadatxí',     desc: '10 preguntes · sense límit' },
      speed:     { name: 'Gear Second',   desc: '10 preguntes · 15 seg c/u' },
      survival:  { name: 'Supervivència', desc: '3 vides · preguntes infinites' },
      blitz:     { name: 'Tempesta',      desc: '10 preg. · 8 seg · ×2 punts' },
      versus:    { name: 'VS IA',         desc: 'Repte a un personatge One Piece' },
      duel:      { name: 'Duel Local',    desc: 'Torns amb un altre pirata' },
      timeTrial: { name: 'Contrarellotge', desc: '60 seg · quantes pots?' },
      practice:  { name: 'Pràctica',      desc: 'Sense punts · tria operació' },
      errorDrill: { name: 'Repàs',         desc: 'Practica els teus errors anteriors' },
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
    dailyChallenge: '⚓ Repte Diari',
    dailyDone: '✅ Completat avui',
    dailyBonus: '×3 Berries',
    dailyStreakLabel: (n) => `${n} dia${n === 1 ? '' : 'dies'} seguit${n === 1 ? '' : 's'}`,
    wrongAnswersTitle: 'Errors',
    noMistakes: 'Sense errors! 🎉',
    timeTrialHeader: 'CONTRARELLOTGE',
    practiceHeader: 'PRÀCTICA LLIURE',
    chooseOperation: 'Tria operació',
    operationNames: { add: 'Suma', sub: 'Resta', mul: 'Multiplicació', div: 'Divisió', frac: 'Fraccions', pct: 'Percentatges', exp: 'Potències' },
    chooseOpponent: 'Tria el teu rival',
    difficulty: { easy: 'Fàcil', medium: 'Mitjà', hard: 'Difícil', legend: 'Llegenda' },
    choosePlayer2: 'Tria el segon pirata',
    passTurnTo: (name) => `Passa el dispositiu a ${name}!`,
    p1Finished: 'El teu torn ha acabat!',
    tapToStart: 'Toca per començar',
    duelWinner: (name) => `🏆 ${name} guanya!`,
    itsATie: '⚔️ Empat!',
    vsResult: 'RESULTAT VS IA',
    duelResult: 'RESULTAT DUEL',
    youLabel: 'Tu',
    inputModeLabel: '⌨️ Teclat',
    typeYourAnswer: 'Escriu...',
    operationBreakdown: 'Per operació',
    activityLabel: 'Activitat',
    shopTitle: 'Botiga',
    shopAvatars: 'Avatars premium',
    equipLabel: 'Equipar',
    ownedLabel: '✓',
    notEnoughBerries: 'Berries insuficients',
    settingsTitle: 'Configuració',
    errorDrillTitle: '🎯 Repàs d\'Errors',
    errorDrillDesc: 'Practica les preguntes que vas fallar',
    noErrorsYet: 'Encara no hi ha errors desats!',
    powerupFreeze: '⏸ +5s',
    powerupEliminate: '✂️ ×2',
    powerupSkip: '⏭ Saltar',
    tutorialTitle: 'Benvingut a bord!',
    tutorialSlides: [
      { title: '⚔️ Respon preguntes', body: 'Tria la resposta correcta abans que acabi el temps.' },
      { title: '🪙 Guanya Berries', body: 'Cada encert et dóna Berries. Les racxes multipliquen la puntuació.' },
      { title: '⚓ Repte Diari', body: 'Completa el repte diari per guanyar ×3 Berries i mantenir la teva ratxa.' },
      { title: '🏴‍☠️ A l\'aventura!', body: 'Juga la teva primera batalla i demostra que ets un pirata de debò!' },
    ],
    tutorialStart: '⚔️ Endavant!',
  },
}
