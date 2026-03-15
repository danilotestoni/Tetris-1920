// ═══════════════════════════════════════════════════════════════
//  INPUT SERVICE
//  Handles keyboard bindings for 1 and 2 players
// ═══════════════════════════════════════════════════════════════

import { Injectable, OnDestroy } from '@angular/core';
import { GameEngineService } from './game-engine.service';

interface KeyBindings {
  moveLeft:  string;
  moveRight: string;
  softDrop:  string;
  hardDrop:  string;
  rotateCW:  string;
  rotateCCW: string;
  hold:      string;
  pause:     string;
}

const PLAYER1_KEYS: KeyBindings = {
  moveLeft:  'ArrowLeft',
  moveRight: 'ArrowRight',
  softDrop:  'ArrowDown',
  hardDrop:  'ArrowUp',
  rotateCW:  'KeyX',
  rotateCCW: 'KeyZ',
  hold:      'ShiftLeft',
  pause:     'Escape',
};

const PLAYER2_KEYS: KeyBindings = {
  moveLeft:  'KeyA',
  moveRight: 'KeyD',
  softDrop:  'KeyS',
  hardDrop:  'KeyW',
  rotateCW:  'KeyG',
  rotateCCW: 'KeyF',
  hold:      'ShiftRight',
  pause:     'Escape',
};

@Injectable({ providedIn: 'root' })
export class InputService implements OnDestroy {
  private isActive = false;
  private repeatTimers = new Map<string, ReturnType<typeof setInterval>>();
  private readonly REPEAT_DELAY    = 150;
  private readonly REPEAT_INTERVAL = 50;

  constructor(private readonly engine: GameEngineService) {}

  activate(): void {
    if (this.isActive) return;
    this.isActive = true;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup',   this.onKeyUp);
  }

  deactivate(): void {
    this.isActive = false;
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup',   this.onKeyUp);
    this.repeatTimers.forEach(t => clearInterval(t));
    this.repeatTimers.clear();
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (this.repeatTimers.has(e.code)) return; // already held

    this.handleKey(e.code, true);

    // Auto-repeat for movement keys
    const repeatKeys = new Set([
      PLAYER1_KEYS.moveLeft, PLAYER1_KEYS.moveRight, PLAYER1_KEYS.softDrop,
      PLAYER2_KEYS.moveLeft, PLAYER2_KEYS.moveRight, PLAYER2_KEYS.softDrop,
    ]);

    if (repeatKeys.has(e.code)) {
      const timer = setTimeout(() => {
        const interval = setInterval(() => this.handleKey(e.code, false), this.REPEAT_INTERVAL);
        this.repeatTimers.set(e.code, interval);
      }, this.REPEAT_DELAY);
      this.repeatTimers.set(e.code, timer);
    }

    e.preventDefault();
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    const t = this.repeatTimers.get(e.code);
    if (t) { clearInterval(t); clearTimeout(t); this.repeatTimers.delete(e.code); }
  };

  private handleKey(code: string, firstPress: boolean): void {
    const status = this.engine.snapshot.status;

    // Pause — works from any player
    if (code === 'Escape') {
      if (status === 'playing') this.engine.pauseGame();
      else if (status === 'paused') this.engine.resumeGame();
      return;
    }

    if (status !== 'playing') return;

    const isTwoPlayer = this.engine.snapshot.mode === 'multi';

    // Player 1 controls
    if (!this.engine.snapshot.players[0]?.isGameOver) {
      this.dispatchAction(code, PLAYER1_KEYS, 0, firstPress);
    }

    // Player 2 controls
    if (isTwoPlayer && !this.engine.snapshot.players[1]?.isGameOver) {
      this.dispatchAction(code, PLAYER2_KEYS, 1, firstPress);
    }
  }

  private dispatchAction(
    code: string,
    bindings: KeyBindings,
    playerIndex: number,
    firstPress: boolean
  ): void {
    switch (code) {
      case bindings.moveLeft:  this.engine.moveLeft(playerIndex);  break;
      case bindings.moveRight: this.engine.moveRight(playerIndex); break;
      case bindings.softDrop:  this.engine.softDrop(playerIndex);  break;
      case bindings.hardDrop:  if (firstPress) this.engine.hardDrop(playerIndex);  break;
      case bindings.rotateCW:  if (firstPress) this.engine.rotateCW(playerIndex);  break;
      case bindings.rotateCCW: if (firstPress) this.engine.rotateCCW(playerIndex); break;
      case bindings.hold:      if (firstPress) this.engine.hold(playerIndex);       break;
    }
  }

  ngOnDestroy(): void {
    this.deactivate();
  }
}
