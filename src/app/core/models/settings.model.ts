// ═══════════════════════════════════════════════════════════════
//  SETTINGS MODEL
// ═══════════════════════════════════════════════════════════════

export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameMode   = 'single' | 'multi';
export type MusicTrack = 'blues' | 'ragtime' | 'charleston';

export interface GameSettings {
  musicVolume:   number;     // 0–1
  soundVolume:   number;     // 0–1
  difficulty:    Difficulty;
  showGhost:     boolean;    // Ghost piece (landing preview)
  showGrid:      boolean;    // Grid lines on the board
  musicTrack: MusicTrack;
}

export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume:   0.4,
  soundVolume:   0.6,
  difficulty:    'medium',
  showGhost:     true,
  showGrid:      true,
  musicTrack: 'blues' as MusicTrack
};

// Drop interval (ms) per level per difficulty
export const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy:   1.3,
  medium: 1.0,
  hard:   0.65,
};

// Base interval in ms at level 1
export const BASE_DROP_INTERVAL = 800;

// Calculate drop interval for a given level and difficulty
export function getDropInterval(level: number, difficulty: Difficulty): number {
  const base    = BASE_DROP_INTERVAL * DIFFICULTY_MULTIPLIER[difficulty];
  const factor  = Math.pow(0.85, level - 1);
  return Math.max(50, Math.floor(base * factor));
}
