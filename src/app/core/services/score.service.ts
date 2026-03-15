// ═══════════════════════════════════════════════════════════════
//  SCORE SERVICE
//  Single responsibility: score calculation & persistence
// ═══════════════════════════════════════════════════════════════

import { Injectable } from '@angular/core';
import {
  Score, ScoreEntry,
  LINE_SCORE_TABLE,
  SOFT_DROP_SCORE,
  HARD_DROP_SCORE,
  LINES_PER_LEVEL,
} from '../models/score.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class ScoreService {
  private readonly STORAGE_KEY = 'scores';
  private readonly MAX_SCORES  = 50;

  constructor(private readonly storage: StorageService) {}

  calculateLineScore(linesCleared: number, level: number, combo: number): number {
    const base  = LINE_SCORE_TABLE[linesCleared] ?? 0;
    const combo_bonus = combo > 1 ? (combo - 1) * 50 * level : 0;
    return base * level + combo_bonus;
  }

  calculateSoftDropScore(rows: number): number {
    return rows * SOFT_DROP_SCORE;
  }

  calculateHardDropScore(rows: number): number {
    return rows * HARD_DROP_SCORE;
  }

  getLevelForLines(lines: number): number {
    return Math.floor(lines / LINES_PER_LEVEL) + 1;
  }

  saveScore(score: Score): void {
    const scores = this.getScores();
    scores.push(score);
    scores.sort((a, b) => b.score - a.score);
    const trimmed = scores.slice(0, this.MAX_SCORES);
    this.storage.set(this.STORAGE_KEY, trimmed);
  }

  getScores(): Score[] {
    return this.storage.get<Score[]>(this.STORAGE_KEY, []);
  }

  getTopScores(limit = 10): ScoreEntry[] {
    return this.getScores()
      .slice(0, limit)
      .map((s, i) => ({ ...s, rank: i + 1 }));
  }

  getScoresByPlayer(playerName: string): ScoreEntry[] {
    return this.getScores()
      .filter(s => s.playerName === playerName)
      .map((s, i) => ({ ...s, rank: i + 1 }));
  }

  generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  clearAll(): void {
    this.storage.remove(this.STORAGE_KEY);
  }
}
