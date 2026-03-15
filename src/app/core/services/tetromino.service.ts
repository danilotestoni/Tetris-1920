// ═══════════════════════════════════════════════════════════════
//  TETROMINO SERVICE
//  Factory & helpers for creating and rotating pieces
// ═══════════════════════════════════════════════════════════════

import { Injectable } from '@angular/core';
import {
  Tetromino,
  TetrominoType,
  TETROMINO_DEFINITIONS,
  TETROMINO_TYPES,
} from '../models/tetromino.model';

@Injectable({ providedIn: 'root' })
export class TetrominoService {
  private bag: TetrominoType[] = [];

  /** Returns a new piece of the given type at spawn position */
  create(type: TetrominoType): Tetromino {
    const def = TETROMINO_DEFINITIONS[type];
    return {
      type,
      shape: def.rotations[0].map(r => [...r]),
      color: def.color,
      shadowColor: def.shadowColor,
      highlightColor: def.highlightColor,
      x: type === 'O' ? 4 : 3,
      y: 0,
      rotationIndex: 0,
    };
  }

  /** 7-bag randomizer — guarantees no drought of any piece */
  nextFromBag(): TetrominoType {
    if (this.bag.length === 0) this.refillBag();
    return this.bag.pop()!;
  }

  resetBag(): void {
    this.bag = [];
  }

  /** Returns a new Tetromino rotated by +1 step (CW) */
  rotate(piece: Tetromino, direction: 1 | -1 = 1): Tetromino {
    const def  = TETROMINO_DEFINITIONS[piece.type];
    const max   = def.rotations.length;
    const nextRot = ((piece.rotationIndex + direction) % max + max) % max;
    return {
      ...piece,
      rotationIndex: nextRot,
      shape: def.rotations[nextRot].map(r => [...r]),
    };
  }

  /** Wall kick offsets per rotation (SRS standard) */
  getWallKickOffsets(
    type: TetrominoType,
    fromRot: number,
    toRot: number
  ): Array<[number, number]> {
    if (type === 'O') return [[0, 0]];

    const isI = type === 'I';
    const key = `${fromRot}>${toRot}`;

    const kicks: Record<string, Array<[number, number]>> = isI
      ? {
          '0>1': [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
          '1>0': [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
          '1>2': [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
          '2>1': [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
          '2>3': [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
          '3>2': [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
          '3>0': [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
          '0>3': [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
        }
      : {
          '0>1': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
          '1>0': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
          '1>2': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
          '2>1': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
          '2>3': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
          '3>2': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
          '3>0': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
          '0>3': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
        };

    return kicks[key] ?? [[0, 0]];
  }

  private refillBag(): void {
    this.bag = [...TETROMINO_TYPES];
    // Fisher-Yates shuffle
    for (let i = this.bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
    }
  }
}
