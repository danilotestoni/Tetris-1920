// ═══════════════════════════════════════════════════════════════
//  TIMER SERVICE
//  Ticks elapsed time for active players every second
// ═══════════════════════════════════════════════════════════════

import { Injectable, OnDestroy } from '@angular/core';
import { GameEngineService } from './game-engine.service';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TimerService implements OnDestroy {
  private tick: ReturnType<typeof setInterval> | null = null;
  private sub!: Subscription;

  constructor(private readonly engine: GameEngineService) {
    this.sub = this.engine.gameState$.subscribe(state => {
      if (state.status === 'playing' && !this.tick) {
        this.startTick();
      } else if (state.status !== 'playing' && this.tick) {
        this.stopTick();
      }
    });
  }

  private startTick(): void {
    this.tick = setInterval(() => {
      const state = this.engine.snapshot;
      if (state.status !== 'playing') return;
      // Patch elapsed time into each active player via the engine's internal stream
      // We access it via the BehaviorSubject directly — a narrow but clean coupling
      const players = state.players.map(p =>
        p.isGameOver ? p : { ...p, elapsedTime: Date.now() - p.startTime }
      );
      (this.engine as any)['_gameState$'].next({ ...state, players });
    }, 1000);
  }

  private stopTick(): void {
    if (this.tick) { clearInterval(this.tick); this.tick = null; }
  }

  ngOnDestroy(): void {
    this.stopTick();
    this.sub?.unsubscribe();
  }
}
