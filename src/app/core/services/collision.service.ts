// ═══════════════════════════════════════════════════════════════
//  COLLISION SERVICE
//  Single responsibility: detecting piece collisions with board
// ═══════════════════════════════════════════════════════════════

import { Injectable } from '@angular/core';
import { Tetromino } from '../models/tetromino.model';
import { Board, BOARD_COLS, BOARD_ROWS } from '../models/game-state.model';

@Injectable({ providedIn: 'root' })
export class CollisionService {

  /** Returns true if the piece at (offsetX, offsetY) does NOT collide */
  isValid(piece: Tetromino, board: Board, offsetX = 0, offsetY = 0): boolean {
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (!piece.shape[row][col]) continue;

        const boardX = piece.x + col + offsetX;
        const boardY = piece.y + row + offsetY;

        if (boardX < 0 || boardX >= BOARD_COLS) return false;
        if (boardY >= BOARD_ROWS)               return false;
        if (boardY < 0)                          continue; // above board — allowed
        if (board[boardY][boardX].color !== null) return false;
      }
    }
    return true;
  }

  /** Computes how far the piece can drop (for ghost piece & hard drop) */
  getDropDistance(piece: Tetromino, board: Board): number {
    let dist = 0;
    while (this.isValid(piece, board, 0, dist + 1)) dist++;
    return dist;
  }

  /** Returns a ghost piece positioned at its drop distance */
  getGhostPiece(piece: Tetromino, board: Board): Tetromino {
    const dist = this.getDropDistance(piece, board);
    return { ...piece, shape: piece.shape.map(r => [...r]), y: piece.y + dist };
  }
}
