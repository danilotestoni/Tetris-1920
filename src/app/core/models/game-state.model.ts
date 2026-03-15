// ═══════════════════════════════════════════════════════════════
//  GAME STATE MODEL
// ═══════════════════════════════════════════════════════════════

import { Tetromino } from './tetromino.model';

export const BOARD_COLS = 10;
export const BOARD_ROWS = 20;
export const BOARD_VISIBLE_ROWS = 20;

export type CellValue = string | null;  // null = empty, string = color hex

export interface BoardCell {
  color: string | null;
  shadowColor: string | null;
  highlightColor: string | null;
}

export type Board = BoardCell[][];

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';

export interface PlayerGameState {
  playerId: 1 | 2;
  playerName: string;
  board: Board;
  currentPiece: Tetromino | null;
  ghostPiece: Tetromino | null;
  nextPiece: Tetromino | null;
  heldPiece: Tetromino | null;
  canHold: boolean;
  score: number;
  level: number;
  lines: number;
  combo: number;
  isGameOver: boolean;
  startTime: number;
  elapsedTime: number;
}

export interface GameState {
  status: GameStatus;
  mode: 'single' | 'multi';
  players: PlayerGameState[];
  activePlayerIndex: number;
}

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_ROWS }, () =>
    Array.from({ length: BOARD_COLS }, (): BoardCell => ({
      color: null,
      shadowColor: null,
      highlightColor: null,
    }))
  );
}

export function createInitialPlayerState(
  playerId: 1 | 2,
  playerName: string
): PlayerGameState {
  return {
    playerId,
    playerName,
    board: createEmptyBoard(),
    currentPiece: null,
    ghostPiece: null,
    nextPiece: null,
    heldPiece: null,
    canHold: true,
    score: 0,
    level: 1,
    lines: 0,
    combo: 0,
    isGameOver: false,
    startTime: Date.now(),
    elapsedTime: 0,
  };
}
