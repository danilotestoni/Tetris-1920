// ═══════════════════════════════════════════════════════════════
//  ACHIEVEMENT SERVICE
//  Checks game state and triggers achievement unlocks
// ═══════════════════════════════════════════════════════════════

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {
  Achievement, AchievementId, AchievementUnlockEvent,
  PlayerAchievement, ACHIEVEMENTS,
} from '../models/achievement.model';
import { PlayerGameState } from '../models/game-state.model';
import { StorageService } from './storage.service';

interface AchievementContext {
  state:       PlayerGameState;
  linesJustCleared: number;
  isBackToBack: boolean;
  wasTetris:    boolean;
}

@Injectable({ providedIn: 'root' })
export class AchievementService {
  private readonly STORAGE_KEY = 'achievements';

  private readonly _unlock$ = new Subject<AchievementUnlockEvent>();
  readonly unlock$ = this._unlock$.asObservable();

  constructor(private readonly storage: StorageService) {}

  check(ctx: AchievementContext): void {
    const { state, linesJustCleared, isBackToBack } = ctx;
    const elapsed = (Date.now() - state.startTime) / 1000;

    const checks: Array<[AchievementId, boolean]> = [
      ['first_line',    state.lines >= 1],
      ['double_trouble', linesJustCleared >= 2],
      ['hat_trick',     linesJustCleared >= 3],
      ['tetris',        linesJustCleared === 4],
      ['level_5',       state.level >= 5],
      ['level_10',      state.level >= 10],
      ['score_1000',    state.score >= 1000],
      ['score_10000',   state.score >= 10000],
      ['score_50000',   state.score >= 50000],
      ['hundred_lines', state.lines >= 100],
      ['speed_demon',   state.level >= 8 && elapsed >= 120],
      ['endurance',     elapsed >= 600],
      ['back_to_back',  isBackToBack],
    ];

    for (const [id, condition] of checks) {
      if (condition && !this.hasUnlocked(id, state.playerName)) {
        this.unlock(id, state.playerName);
      }
    }
  }

  hasUnlocked(id: AchievementId, playerName: string): boolean {
    return this.getAllUnlocked().some(
      a => a.achievementId === id && a.playerName === playerName
    );
  }

  getUnlockedForPlayer(playerName: string): Achievement[] {
    return this.getAllUnlocked()
      .filter(a => a.playerName === playerName)
      .map(a => ACHIEVEMENTS[a.achievementId])
      .filter(Boolean);
  }

  getAllUnlocked(): PlayerAchievement[] {
    return this.storage.get<PlayerAchievement[]>(this.STORAGE_KEY, []);
  }

  clearForPlayer(playerName: string): void {
    const filtered = this.getAllUnlocked().filter(a => a.playerName !== playerName);
    this.storage.set(this.STORAGE_KEY, filtered);
  }

  private unlock(id: AchievementId, playerName: string): void {
    const all = this.getAllUnlocked();
    all.push({ achievementId: id, playerName, unlockedAt: new Date().toISOString() });
    this.storage.set(this.STORAGE_KEY, all);
    this._unlock$.next({ achievement: ACHIEVEMENTS[id], playerName });
  }
}
