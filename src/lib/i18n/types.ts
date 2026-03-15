export interface Dictionary {
  serverUrl: {
    title: string;
    subtitle: string;
    hint: string;
    connect: string;
    invalid: string;
  };
  common: {
    you: string;
    opponent: string;
    pokemon: string;
    ready: string;
    notReady: string;
    back: string;
    loading: string;
  };
  connection: {
    idle: string;
    connecting: string;
    connected: string;
    reconnecting: string;
    error: string;
  };
  nickname: {
    title: string;
    subtitle: string;
    placeholder: string;
    register: string;
    checking: string;
    waitingConnection: string;
    welcome: string;
    welcomeBack: string;
    newTrainer: string;
    joinBattle: string;
    useDifferent: string;
    activeSessionWarning: string;
    wins: string;
    losses: string;
    winRate: string;
    totalBattles: string;
    charRules: string;
  };
  lobby: {
    title: string;
    waitingForOpponent: string;
    bothInLobby: string;
    assignTeam: string;
    assigning: string;
    needPlayers: string;
    noTeam: string;
    nPokemon: string;
    shareUrl: string;
    leave: string;
    matchmaking: string;
    stepCreating: string;
    stepWaiting: string;
    stepAssigning: string;
  };
  ready: {
    title: string;
    reviewTeam: string;
    waitingOpponent: string;
    bothReady: string;
    startingBattle: string;
    imReady: string;
    tips: string[];
  };
  battle: {
    yourTurn: string;
    opponentTurn: string;
    fight: string;
    pokemon: string;
    back: string;
    chooseNext: string;
    whatWillYouDo: string;
    notYourTurn: string;
    battleStarted: string;
    attack: string;
    superEffective: string;
    notVeryEffective: string;
    tookDamage: string;
    fainted: string;
    switchedTo: string;
    dealDamage: string;
    ko: string;
    defeated: string;
    remaining: string;
    noLeft: string;
    battleEnded: string;
    wins: string;
    surrender: string;
    actions: string;
    tips: string[];
  };
  result: {
    victory: string;
    defeat: string;
    champion: string;
    winsRound: string;
    disconnected: string;
    turns: string;
    pokemonKod: string;
    damageDealt: string;
    playAgain: string;
    exitToMenu: string;
    winner: string;
    loser: string;
  };
  notifications: {
    connected: string;
    disconnected: string;
    reconnecting: string;
    reconnected: string;
    opponentJoined: string;
    opponentHasTeam: string;
    opponentReady: string;
    notConnected: string;
    actionTimeout: string;
  };
}

export type Locale = 'en' | 'es';
