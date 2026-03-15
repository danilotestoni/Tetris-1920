// ═══════════════════════════════════════════════════════════════
//  TETROMINO MODEL
//  All 7 pieces of our roaring 1920s Tetris
// ═══════════════════════════════════════════════════════════════

export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface TetrominoShape {
  cells: number[][];  // 2D grid of the piece (1 = filled, 0 = empty)
}

export interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  color: string;
  shadowColor: string;
  highlightColor: string;
  x: number;           // Board column position
  y: number;           // Board row position
  rotationIndex: number;
}

export interface TetrominoDefinition {
  type: TetrominoType;
  rotations: number[][][];
  color: string;
  shadowColor: string;
  highlightColor: string;
}

// All rotations for each tetromino (art deco style)
export const TETROMINO_DEFINITIONS: Record<TetrominoType, TetrominoDefinition> = {
  I: {
    type: 'I',
    color: '#17A398',
    shadowColor: '#0D5C56',
    highlightColor: '#2ECFBF',
    rotations: [
      [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
      [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
      [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]],
      [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],
    ],
  },
  O: {
    type: 'O',
    color: '#D4AF37',
    shadowColor: '#9A7B1A',
    highlightColor: '#F2CC62',
    rotations: [
      [[1,1],[1,1]],
      [[1,1],[1,1]],
      [[1,1],[1,1]],
      [[1,1],[1,1]],
    ],
  },
  T: {
    type: 'T',
    color: '#8B0000',
    shadowColor: '#500000',
    highlightColor: '#C41E1E',
    rotations: [
      [[0,1,0],[1,1,1],[0,0,0]],
      [[0,1,0],[0,1,1],[0,1,0]],
      [[0,0,0],[1,1,1],[0,1,0]],
      [[0,1,0],[1,1,0],[0,1,0]],
    ],
  },
  S: {
    type: 'S',
    color: '#2D6A4F',
    shadowColor: '#1A3D2E',
    highlightColor: '#52B788',
    rotations: [
      [[0,1,1],[1,1,0],[0,0,0]],
      [[0,1,0],[0,1,1],[0,0,1]],
      [[0,0,0],[0,1,1],[1,1,0]],
      [[1,0,0],[1,1,0],[0,1,0]],
    ],
  },
  Z: {
    type: 'Z',
    color: '#C0392B',
    shadowColor: '#7B1818',
    highlightColor: '#E74C3C',
    rotations: [
      [[1,1,0],[0,1,1],[0,0,0]],
      [[0,0,1],[0,1,1],[0,1,0]],
      [[0,0,0],[1,1,0],[0,1,1]],
      [[0,1,0],[1,1,0],[1,0,0]],
    ],
  },
  J: {
    type: 'J',
    color: '#1A3A6B',
    shadowColor: '#0D1F3C',
    highlightColor: '#2E5FA3',
    rotations: [
      [[1,0,0],[1,1,1],[0,0,0]],
      [[0,1,1],[0,1,0],[0,1,0]],
      [[0,0,0],[1,1,1],[0,0,1]],
      [[0,1,0],[0,1,0],[1,1,0]],
    ],
  },
  L: {
    type: 'L',
    color: '#8B4513',
    shadowColor: '#5C2D0C',
    highlightColor: '#CD6A20',
    rotations: [
      [[0,0,1],[1,1,1],[0,0,0]],
      [[0,1,0],[0,1,0],[0,1,1]],
      [[0,0,0],[1,1,1],[1,0,0]],
      [[1,1,0],[0,1,0],[0,1,0]],
    ],
  },
};

export const TETROMINO_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
