// ═══════════════════════════════════════════════════════════════
//  SCORE MODEL
// ═══════════════════════════════════════════════════════════════

export interface Score {
  id: string;
  playerName: string;
  playerAvatar: string;
  score: number;
  level: number;
  lines: number;
  date: string;       // ISO string
  duration: number;   // Seconds
  mode: 'single' | 'multi';
}

export interface ScoreEntry extends Score {
  rank?: number;
}

// Points awarded per line clear at level 1 — multiply by level
export const LINE_SCORE_TABLE: Record<number, number> = {
  1: 100,   // Single
  2: 300,   // Double
  3: 500,   // Triple
  4: 800,   // Tetris!
};

export const SOFT_DROP_SCORE  = 1;
export const HARD_DROP_SCORE  = 2;
export const LINES_PER_LEVEL  = 10;
