export type Language = 'en' | 'es' | 'ca';

export interface TranslationSchema {
  // Common Buttons & Labels
  back: string;
  close: string;
  exit: string;
  save: string;
  cancel: string;
  play: string;
  difficulty: string;
  easy: string;
  normal: string;
  hard: string;
  pro: string;
  coins: string;
  wins: string;
  losses: string;
  goals: string;
  score: string;

  // Main Menu
  mainMenuTitle: string;
  mainMenuDesc: string;
  playMatch: string;
  playMatchDesc: string;
  formatSelector: string;
  vsBot: string;
  sameLaptop: string;
  botVsBot: string;
  freePractice: string;
  machinePractice: string;
  garage: string;
  garageDesc: string;
  replays: string;
  replaysDesc: string;
  settings: string;
  settingsDesc: string;

  // Career Mode
  careerTitle: string;
  careerDesc: string;
  commenceCareer: string;
  careerHub: string;
  careerFeed: string;
  careerTransfers: string;
  careerStats: string;
  nextMatch: string;
  opponent: string;
  stadium: string;
  coachBriefing: string;
  coachBriefingDesc: string;
  rivalStatement: string;
  rivalStatementDesc: string;
  reputation: string;
  sentiment: string;
  form: string;
  seasonProgress: string;
  transferOffers: string;
  signContract: string;
  scoutReport: string;

  // Manager Mode
  managerTitle: string;
  managerDesc: string;
  commenceManager: string;
  mySquad: string;
  tactics: string;
  morales: string;
  moraleHigh: string;
  moraleMed: string;
  moraleLow: string;
  scoutMarket: string;
  signPlayer: string;
  sellPlayer: string;
  formation: string;
  formationAggressive: string;
  formationBalanced: string;
  formationDefensive: string;
  roles: string;
  attacker: string;
  defender: string;
  goalkeeper: string;
  hybrid: string;
  aggression: string;
  riskLevel: string;
  boostPriority: string;
  rotationStrict: string;
  simMatch: string;
  simMatchDesc: string;

  // Replay System
  replayTitle: string;
  replayDesc: string;
  watchReplay: string;
  deleteReplay: string;
  recordEmpty: string;
  recordEmptyDesc: string;
  replayHUDTitle: string;
  exitReplay: string;
  cameraMode: string;
  cinematicMode: string;
  freeCameraMode: string;
  trackBall: string;
  trackBlue: string;
  trackRed: string;

  // Settings
  settingsTitle: string;
  languageSelect: string;
  volumeMusic: string;
  volumeSFX: string;
  cameraSensitivity: string;
  controlBinds: string;
  bindWASD: string;
  bindArrows: string;
  replayQuality: string;
  qualityHigh: string;
  qualityMedium: string;
  qualityLow: string;

  // Garage & Battle Pass & Achievements
  garageTab: string;
  marketTab: string;
  battlePass: string;
  achievements: string;
  customizeCar: string;
  unlockItem: string;
  insufficientCoins: string;

  // Stadium Names & Choices
  stadRustlands: string;
  stadCyber: string;
  stadFrozen: string;
  stadTokyo: string;
  stadCosmic: string;

  // Match HUD states & Post-match
  getReady: string;
  goalScoredText: string;
  pausedText: string;
  matchCompleted: string;
  victoryBonus: string;
  participationReward: string;
  totalCoinsEarned: string;
  currentBalance: string;
  saveReplayText: string;
}

export const TRANSLATIONS: Record<Language, TranslationSchema> = {
  en: {
    back: "Back",
    close: "Close",
    exit: "Exit",
    save: "Save",
    cancel: "Cancel",
    play: "Play",
    difficulty: "Difficulty",
    easy: "Easy",
    normal: "Normal",
    hard: "Hard",
    pro: "Pro",
    coins: "Credits",
    wins: "Wins",
    losses: "Losses",
    goals: "Goals",
    score: "Score",

    mainMenuTitle: "ROCKET CARS",
    mainMenuDesc: "Wired high-G football simulation engine",
    playMatch: "PLAY MATCH",
    playMatchDesc: "Launch custom exhibition matches",
    formatSelector: "Match Format",
    vsBot: "Single Player vs AI",
    sameLaptop: "Same Laptop Splitscreen",
    botVsBot: "Spectator Bot-vs-Bot",
    freePractice: "Free Pitch Practice",
    machinePractice: "Machine Launcher Practice",
    garage: "GARAGE UPGRADES",
    garageDesc: "Spend credits on cosmetics and performance rims",
    replays: "REPLAY THEATRE",
    replaysDesc: "Scrutinize telemetry logs of completed duels",
    settings: "SYSTEM SETTINGS",
    settingsDesc: "Calibrate neural controls, camera & mechanics",

    careerTitle: "FUTURE PRO CAREER",
    careerDesc: "Ascend from contract driver to galaxy legend",
    commenceCareer: "COMMENCE PROFESSIONAL CAREER",
    careerHub: "Next Match Grid",
    careerFeed: "Press Room Digest",
    careerTransfers: "Agency & Market",
    careerStats: "Analytics Summary",
    nextMatch: "Next Scheduling Board",
    opponent: "Opponent Team",
    stadium: "Stadium Venue",
    coachBriefing: "Coach Briefing Logs",
    coachBriefingDesc: "Real-time tactical feedback from team command",
    rivalStatement: "Rival Reaction Feed",
    rivalStatementDesc: "Quotes from opponent star pilots",
    reputation: "Reputation Level",
    sentiment: "Fan Sentiment",
    form: "Driver Momentum",
    seasonProgress: "Season Progress",
    transferOffers: "Club Proposals",
    signContract: "Sign Club Contract",
    scoutReport: "Scout Report Findings",

    managerTitle: "MANAGER SIMULATION",
    managerDesc: "Build and command a championship club crew",
    commenceManager: "INAUGURATE CLUB CHARTER",
    mySquad: "Active Team Roster",
    tactics: "Tactical Strategist",
    morales: "Squad Loyalty & Morale",
    moraleHigh: "Spirited",
    moraleMed: "Satisfied",
    moraleLow: "Aggrieved",
    scoutMarket: "Global Scout Pool",
    signPlayer: "Recruit Contract",
    sellPlayer: "Transfer Out",
    formation: "Team Formation Layout",
    formationAggressive: "Ultra Offensive (Full Attack)",
    formationBalanced: "Standard Rotation Grid",
    formationDefensive: "Steel Wall Counter-Defensive",
    roles: "Assigned Squad Roles",
    attacker: "Striker (Constant Ball Chase)",
    defender: "Rear Guard Anchor",
    goalkeeper: "Goal Line Custodian",
    hybrid: "Flexible Rotation",
    aggression: "Physical Aggressiveness",
    riskLevel: "High-Risk Challenger Index",
    boostPriority: "Reactor Core Power Priority",
    rotationStrict: "Position Rotation Compliance",
    simMatch: "SIMULATE MATCH DAYS",
    simMatchDesc: "Deploy tactics and watch bots execute in realtime",

    replayTitle: "REPLAY LIBRARY",
    replayDesc: "Playback saved match telemetry records",
    watchReplay: "Initiate Playback",
    deleteReplay: "Wipe Archive",
    recordEmpty: "Replay Library Vacant",
    recordEmptyDesc: "Complete an exhibition match to archive telemetry",
    replayHUDTitle: "Match Playback HUD",
    exitReplay: "Return to Console",
    cameraMode: "Replay Lens Style",
    cinematicMode: "Cinematic Auto-Tracking",
    freeCameraMode: "Interactive Free Camera",
    trackBall: "Lock Focus on Soccer Ball",
    trackBlue: "Lock Focus on Blue Lead",
    trackRed: "Lock Focus on Red Lead",

    settingsTitle: "LOGISTICS CONFIGURATION PANEL",
    languageSelect: "Select Neural Interface Language",
    volumeMusic: "Strobe Soundtrack Volume",
    volumeSFX: "Car Reactor & Impact FX",
    cameraSensitivity: "Visual Orbit Calibration",
    controlBinds: "Keybinding Configurer",
    bindWASD: "Player 1 Controls: WASD Drive + Space Boost",
    bindArrows: "Player 2 Controls: Arrow Keys Drive + Enter Boost",
    replayQuality: "Render Accuracy Quality",
    qualityHigh: "Ultra Quality (60fps, Full Dynamics)",
    qualityMedium: "High Performance (Stable)",
    qualityLow: "Minimalist Draft Render",

    // Garage & Battle Pass & Achievements
    garageTab: "GARAGE OWNED",
    marketTab: "MARKET SHOP",
    battlePass: "BATTLE PASS",
    achievements: "ACHIEVEMENTS",
    customizeCar: "CUSTOMIZE VEHICLE",
    unlockItem: "Unlock Item",
    insufficientCoins: "Insufficient gold coins!",

    // Stadium Names & Choices
    stadRustlands: "Rustlands Junkyard",
    stadCyber: "Neo Cyber Tokyo",
    stadFrozen: "Frozen Glacier Peak",
    stadTokyo: "Downtown Tokyo Dome",
    stadCosmic: "Omega Cosmic Ring",

    // Match HUD states & Post-match
    getReady: "GET READY!",
    goalScoredText: "GOAL SCORED!",
    pausedText: "GAME PAUSED",
    matchCompleted: "MATCH COMPLETED",
    victoryBonus: "Victory Bonus",
    participationReward: "Match Completed",
    totalCoinsEarned: "Coins Earned",
    currentBalance: "Current Coin Balance",
    saveReplayText: "Save Match Replay"
  },
  es: {
    back: "Atrás",
    close: "Cerrar",
    exit: "Salir",
    save: "Guardar",
    cancel: "Cancelar",
    play: "Jugar",
    difficulty: "Dificultad",
    easy: "Fácil",
    normal: "Normal",
    hard: "Difícil",
    pro: "Profesional",
    coins: "Créditos",
    wins: "Victorias",
    losses: "Derrotas",
    goals: "Goles",
    score: "Marcador",

    mainMenuTitle: "ROCKET CARS",
    mainMenuDesc: "Motor de simulación de fútbol de alta gravedad",
    playMatch: "JUGAR PARTIDO",
    playMatchDesc: "Iniciar partidos de exhibición personalizados",
    formatSelector: "Formato de Partido",
    vsBot: "Un Jugador contra IA",
    sameLaptop: "Pantalla Compartida (Mismo Teclado)",
    botVsBot: "Espectador Bot contra Bot",
    freePractice: "Práctica Libre en el Campo",
    machinePractice: "Entrenamiento de Lanzador Automático",
    garage: "GARAJE DE MEJORAS",
    garageDesc: "Créditos en cosméticos y llantas de rendimiento",
    replays: "TEATRO DE TELEMETRÍA",
    replaysDesc: "Analizar telemetría de duelos guardados",
    settings: "CONFIGURACIONES",
    settingsDesc: "Calibrar controles neurales, cámara y mecánicas",

    careerTitle: "MODO CARRERA PROFESIONAL",
    careerDesc: "Asciende de piloto de pruebas a leyenda galáctica",
    commenceCareer: "COMENZAR CARRERA PROFESIONAL",
    careerHub: "Próximo Panel de Partido",
    careerFeed: "Sala de Prensa Deportiva",
    careerTransfers: "Agencia y Fichajes",
    careerStats: "Estadísticas Avanzadas",
    nextMatch: "Mesa Directiva del Siguiente Encuentro",
    opponent: "Equipo Rival",
    stadium: "Estadio de la Arena",
    coachBriefing: "Directivas del Entrenador",
    coachBriefingDesc: "Retroalimentación táctica de la comandancia",
    rivalStatement: "Reacciones de los Rivales",
    rivalStatementDesc: "Declaraciones de los pilotos contrincantes",
    reputation: "Nivel de Reputación",
    sentiment: "Opinión del Público",
    form: "Racha del Conductor",
    seasonProgress: "Progreso de la Temporada",
    transferOffers: "Propuestas de Clubes",
    signContract: "Firmar Contrato Profesional",
    scoutReport: "Reportes de los Cazatalentos",

    managerTitle: "SIMULACIÓN DE ENTRENADOR",
    managerDesc: "Construye y dirige tu propia tripulación de campeonato",
    commenceManager: "FUNDAR COMANDANCIA DE CLUB",
    mySquad: "Plantilla Activa del Equipo",
    tactics: "Estratega Táctico",
    morales: "Fidelidad y Moral de la Plantilla",
    moraleHigh: "Entusiasmado",
    moraleMed: "Satisfecho",
    moraleLow: "Descontento",
    scoutMarket: "Mercado Global de Pilotos",
    signPlayer: "Firmar Reclutamiento",
    sellPlayer: "Traspasar Conductor",
    formation: "Esquema de Formación táctica",
    formationAggressive: "Ultra Ofensiva (Ataque Total)",
    formationBalanced: "Rotación Estándar de Campo",
    formationDefensive: "Muralla de Acero Contraofensiva",
    roles: "Roles Asignados del Roster",
    attacker: "Delantero (Persecución Agresiva)",
    defender: "Ancla Defensiva de Retaguardia",
    goalkeeper: "Custodio de la Línea de Gol",
    hybrid: "Rotación Flexible",
    aggression: "Agresividad Física",
    riskLevel: "Índice de Riesgo en Despejes",
    boostPriority: "Prioridad del Núcleo de Combustión",
    rotationStrict: "Cumplimiento del Posicionamiento",
    simMatch: "SIMULAR DÍA DE PARTIDO",
    simMatchDesc: "Despliega estrategias y observa la ejecución analítica",

    replayTitle: "BIBLIOTECA DE REPETICIONES",
    replayDesc: "Reproducir telemetrías grabadas de partidos",
    watchReplay: "Iniciar Reproducción",
    deleteReplay: "Borrar del Archivo",
    recordEmpty: "Biblioteca de Repeticiones Vacía",
    recordEmptyDesc: "Completa un duelo de exhibición y presiona Guardar",
    replayHUDTitle: "Controles de Repetición",
    exitReplay: "Volver al Menú Central",
    cameraMode: "Estilo de Lente de Cámara",
    cinematicMode: "Seguimiento Cinematográfico Automático",
    freeCameraMode: "Cámara Libre Interactiva",
    trackBall: "Fijar Objetivo: Balón de Fútbol",
    trackBlue: "Fijar Objetivo: Líder Azul",
    trackRed: "Fijar Objetivo: Líder Rojo",

    settingsTitle: "CONSOLA DE LOGÍSTICA DE SISTEMAS",
    languageSelect: "Idioma de Interfaz Neural",
    volumeMusic: "Volumen de Banda Sonora Sincronizada",
    volumeSFX: "Volumen de Reactores e Impactos",
    cameraSensitivity: "Ajuste de Órbita de Cámara",
    controlBinds: "Mapeo de Teclas de Transmisión",
    bindWASD: "Jugador 1: Conducir WASD + Turbo Espacio",
    bindArrows: "Jugador 2: Conducir Flechas + Turbo Enter",
    replayQuality: "Calidad de Renderizado de Telemetría",
    qualityHigh: "Calidad Ultra (60 FPS, Dinámicas Completas)",
    qualityMedium: "Alto Rendimiento Consistente",
    qualityLow: "Borrador de Rendimiento Ligero",

    // Garage & Battle Pass & Achievements
    garageTab: "MÍO EN GARAJE",
    marketTab: "TIENDA MERCADO",
    battlePass: "PASE DE BATALLA",
    achievements: "LOGROS DE PILOTO",
    customizeCar: "PERSONALIZAR COCHE",
    unlockItem: "Desbloquear",
    insufficientCoins: "¡Créditos insuficientes!",

    // Stadium Names & Choices
    stadRustlands: "Chatarrería Rustlands",
    stadCyber: "Neo Cyber Tokio",
    stadFrozen: "Glaciar de Hielo Elevado",
    stadTokyo: "Estadio Domo de Tokio",
    stadCosmic: "Anillo Omega Cósmico",

    // Match HUD states & Post-match
    getReady: "¡PREPÁRATE!",
    goalScoredText: "¡GOL ANOTADO!",
    pausedText: "JUEGO PAUSADO",
    matchCompleted: "PARTIDO COMPLETADO",
    victoryBonus: "Bono de Victoria",
    participationReward: "Partido Completado",
    totalCoinsEarned: "Monedas Ganadas",
    currentBalance: "Saldo de Monedas Actual",
    saveReplayText: "Guardar Repetición"
  },
  ca: {
    back: "Enrere",
    close: "Tancar",
    exit: "Sortir",
    save: "Desar",
    cancel: "Cancel·lar",
    play: "Jugar",
    difficulty: "Dificultat",
    easy: "Fàcil",
    normal: "Normal",
    hard: "Difícil",
    pro: "Professional",
    coins: "Crèdits",
    wins: "Victòries",
    losses: "Derrotes",
    goals: "Gols",
    score: "Marcador",

    mainMenuTitle: "ROCKET CARS",
    mainMenuDesc: "Motor de simulació de futbol d'alta gravetat",
    playMatch: "JUGAR PARTIT",
    playMatchDesc: "Inicia partits d'exhibició personalitzats",
    formatSelector: "Format del Partit",
    vsBot: "Un Jugador contra IA",
    sameLaptop: "Pantalla Compartida (Mateix Teclat)",
    botVsBot: "Espectador Bot contra Bot",
    freePractice: "Pràctica Lliure al Camp",
    machinePractice: "Entrenament de Llançador Automàtic",
    garage: "GARATGE DE MILLORES",
    garageDesc: "Crèdits en cosmètics i llandes de rendiment",
    replays: "TEATRE DE REPETICIONS",
    replaysDesc: "Analitzar telemetria de duels definits",
    settings: "CONFIGURACIÓ",
    settingsDesc: "Calibrar controls neurals, càmera i mecànica",

    careerTitle: "MODE CARRERA PROFESSIONAL",
    careerDesc: "Ascendeix de pilot de proves a llegenda galàctica",
    commenceCareer: "COMENÇAR CARRERA PROFESSIONAL",
    careerHub: "Proper Tauler de Partit",
    careerFeed: "Sala de Premsa Esportiva",
    careerTransfers: "Agència i Fitxatges",
    careerStats: "Estadístiques Avançades",
    nextMatch: "Tauler del Següent Encontre",
    opponent: "Equip Rival",
    stadium: "Estadi de la Sorra",
    coachBriefing: "Directives de l'Entrenador",
    coachBriefingDesc: "Retroalimentació tàctica del comandament",
    rivalStatement: "Feeds de Reacció dels Rivals",
    rivalStatementDesc: "Declaracions dels pilots contrincants",
    reputation: "Nivell de Reputació",
    sentiment: "Opinió del Públic",
    form: "Forma del Conductor",
    seasonProgress: "Progressió del Campionat",
    transferOffers: "Propostes de Clubs",
    signContract: "Signar Contracte Professional",
    scoutReport: "Reportatges dels Caçatalents",

    managerTitle: "SIMULACIÓ D'ENTRENADOR",
    managerDesc: "Construeix i dirigeix la teva tripulació de campionat",
    commenceManager: "FUNDAR COMANDAMENT DEL CLUB",
    mySquad: "Plantilla Activa de l'Equip",
    tactics: "Estratega Tàctic",
    morales: "Fidelitat i Moral de la Plantilla",
    moraleHigh: "Entusiasmat",
    moraleMed: "Satisfet",
    moraleLow: "Descontent",
    scoutMarket: "Mercat Global de Pilots",
    signPlayer: "Signar Reclutament",
    sellPlayer: "Traspassar Conductor",
    formation: "Esquema de Formació Tàctica",
    formationAggressive: "Ofensiva Total (Atac Absolut)",
    formationBalanced: "Rotació Estàndard del Camp",
    formationDefensive: "Muralla de Ferro Contraofensiva",
    roles: "Rols Assignats de la Plantilla",
    attacker: "Davanter (Persecució Agressiva)",
    defender: "Ancoratge Defensiu",
    goalkeeper: "Custodi de la Línia de Gols",
    hybrid: "Rotació Flexible de Posició",
    aggression: "Agressivitat Física",
    riskLevel: "Índex de Risc en Rebutjos",
    boostPriority: "Prioritat del Reactor de Combustió",
    rotationStrict: "Compliment del Posicionament",
    simMatch: "SIMULAR JORNADA DE PARTIT",
    simMatchDesc: "Desplega estratègies i observa l'execució analítica en directe",

    replayTitle: "BIBLIOTECA DE REPETICIONS",
    replayDesc: "Reproduir telemetries guardades dels partits",
    watchReplay: "Iniciar Reproducció",
    deleteReplay: "Esborrar de l'arxiu",
    recordEmpty: "Biblioteca de Repeticions Buida",
    recordEmptyDesc: "Completa un partit d'exhibició i prem Guardar",
    replayHUDTitle: "Controls de Repetició",
    exitReplay: "Tornar al Menú Central",
    cameraMode: "Estil de Lent de Càmera",
    cinematicMode: "Seguiment Cinematogràfic Automàtic",
    freeCameraMode: "Càmera Lliure Interactiva",
    trackBall: "Fixar Objectiu: Pilota de Futbol",
    trackBlue: "Fixar Objectiu: Líder Blau",
    trackRed: "Fixar Objectiu: Líder Vermell",

    settingsTitle: "CONFIGURACIÓ DEL SISTEMA",
    languageSelect: "Idioma de la Interfície Neural",
    volumeMusic: "Volum de la Banda Sonora Sincronitzada",
    volumeSFX: "Volum de Reactors i Impactes",
    cameraSensitivity: "Ajust de l'Òrbita de la Càmera",
    controlBinds: "Mapeig de Tecles de Transmissió",
    bindWASD: "Jugador 1: Conduir WASD + Turbo Espai",
    bindArrows: "Jugador 2: Conduir Fletxes + Turbo Enter",
    replayQuality: "Qualitat del Renderitzat de l'Arxiu",
    qualityHigh: "Qualitat Ultra (60 FPS, Dinàmiques Completes)",
    qualityMedium: "Alt Rendiment Consistent",
    qualityLow: "Esborrany de Rendiment Lleuger",

    // Garage & Battle Pass & Achievements
    garageTab: "MEU AL GARATGE",
    marketTab: "BOTIGA MERCAT",
    battlePass: "PAS DE BATALLA",
    achievements: "ASSOLIMENTS DE PILOT",
    customizeCar: "PERSONALITZAR COTXE",
    unlockItem: "Desbloquejar",
    insufficientCoins: "Crèdits insuficients!",

    // Stadium Names & Choices
    stadRustlands: "Deixalleria Rustlands",
    stadCyber: "Neo Cyber Tòquio",
    stadFrozen: "Glacera de Gel Elevada",
    stadTokyo: "Estadi Dom d'en Tòquio",
    stadCosmic: "Anell Omega Cósmic",

    // Match HUD states & Post-match
    getReady: "¡PREPARA'T!",
    goalScoredText: "¡GOL ANOTAT!",
    pausedText: "JOC EN PAUSA",
    matchCompleted: "PARTIT COMPLETAT",
    victoryBonus: "Bonificació de Victòria",
    participationReward: "Partit Completat",
    totalCoinsEarned: "Monedes Guanyades",
    currentBalance: "Saldo de Monedes Actual",
    saveReplayText: "Desa la Repetició"
  }
};
