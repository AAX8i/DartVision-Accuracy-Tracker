/**
 * DartVision Score & Accuracy Tracker
 * Type Definitions
 */

export type OutMode = 'double' | 'single';
export type GameScore = 101 | 501 | 1001;
export type MultiplierType = 'S' | 'D' | 'T' | 'BULL';
export type ArenaInputMode = 'dartboard' | 'numpad';
export type TrainingDrillType = 'free-throw' | 'around-the-clock' | 'bobs-27' | '121-checkout';

export interface DartThrow {
  segment: string;     // e.g. "T20", "D16", "S5", "IB", "OB", "MISS"
  score: number;       // e.g. 60, 32, 5, 50, 25, 0
  number?: number;     // 1-20, 25 for bull, 0 for miss
  multiplier: 0 | 1 | 2 | 3;
}

export interface Player {
  id: string;
  name: string;
  remainingScore: number;
  initialScore: number;
  dartsThrown: number;
  totalScoreScored: number;
  highestTurn: number;
  legsWon: number;
  turns: TurnRecord[];
  isWinner?: boolean;
}

export interface TurnRecord {
  playerIndex: number;
  turnNumber: number;
  throws: DartThrow[];
  turnTotal: number;
  isBust: boolean;
  scoreBeforeTurn: number;
  scoreAfterTurn: number;
  checkoutHint?: string;
}

export interface ActiveMatch {
  id: string;
  date: string;
  gameType: GameScore;
  outMode: OutMode;
  legsToWin: number;
  currentLeg: number;
  legStarterIndex: number;
  players: Player[];
  activePlayerIndex: number;
  currentTurnDarts: DartThrow[];
  turnHistory: TurnRecord[];
  isCompleted: boolean;
  winnerName?: string;
  inputMode?: ArenaInputMode;
}

export interface FinishedMatch {
  id: string;
  date: string;
  gameType: GameScore;
  outMode: OutMode;
  legsToWin?: number;
  winner: string;
  players: {
    name: string;
    finalScore: number;
    dartsThrown: number;
    threeDartAvg: number;
    highestTurn: number;
    legsWon?: number;
  }[];
}

export interface TargetAccuracy {
  targetKey: string;    // "20", "T20", "D16", "OB", "IB", etc.
  label: string;
  category: 'number' | 'single' | 'double' | 'triple' | 'bull';
  attempts: number;
  hits: number;
  accuracy: number;     // Percentage (0 - 100)
}

export interface TrainingThrowRecord {
  actual: string;       // e.g. "S20"
  target: string;       // e.g. "T20" or "20"
  isHit: boolean;
}

export interface TrainingLogEntry {
  id: string;
  timestamp: string;
  drillType?: TrainingDrillType;
  throws: TrainingThrowRecord[];
}

export interface TrainingStatsMap {
  [segmentOrNumber: string]: {
    attempts: number;
    hits: number;
  };
}

export interface AppState {
  activeMatch: ActiveMatch | null;
  matchHistory: FinishedMatch[];
  trainingStats: TrainingStatsMap;
  trainingLogs: TrainingLogEntry[];
}
