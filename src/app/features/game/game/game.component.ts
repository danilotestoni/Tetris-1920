import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { GameState } from '../../../core/models/game-state.model';
import { Achievement, AchievementUnlockEvent } from '../../../core/models/achievement.model';
import { GameEngineService } from '../../../core/services/game-engine.service';
import { InputService } from '../../../core/services/input.service';
import { AchievementService } from '../../../core/services/achievement.service';
import { AudioService } from '../../../core/services/audio.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit, OnDestroy {
  gameState$!: Observable<GameState>;
  pendingAchievement: AchievementUnlockEvent | null = null;
  private achievementTimer: ReturnType<typeof setTimeout> | null = null;
  private subs = new Subscription();

  constructor(
    private readonly router:  Router,
    private readonly route:   ActivatedRoute,
    private readonly engine:  GameEngineService,
    private readonly input:   InputService,
    private readonly achieve: AchievementService,
    private readonly audio:   AudioService,
  ) {}

  ngOnInit(): void {
    this.gameState$ = this.engine.gameState$;

    // Read query params
    const params    = this.route.snapshot.queryParamMap;
    const mode      = (params.get('mode') ?? 'single') as 'single' | 'multi';
    const p1        = params.get('p1') ?? 'Player One';
    const p2        = params.get('p2') ?? 'Player Two';
    const names     = mode === 'multi' ? [p1, p2] : [p1];

    // Start game
    this.audio.init();
    this.engine.startGame(mode, names);
    this.input.activate();

    // Subscribe to achievement unlocks
    this.subs.add(
      this.achieve.unlock$.subscribe(event => {
        this.showAchievement(event);
      })
    );
  }

  private showAchievement(event: AchievementUnlockEvent): void {
    // Queue achievements — show one at a time
    if (this.achievementTimer) clearTimeout(this.achievementTimer);
    this.pendingAchievement = event;
    this.audio.playSfx('achievement');
    this.achievementTimer = setTimeout(() => {
      this.pendingAchievement = null;
    }, 4000);
  }

  onPause(): void    { this.engine.pauseGame(); }
  onResume(): void   { this.engine.resumeGame(); }

  onRestart(): void {
    const params  = this.route.snapshot.queryParamMap;
    const mode    = (params.get('mode') ?? 'single') as 'single' | 'multi';
    const p1      = params.get('p1') ?? 'Player One';
    const p2      = params.get('p2') ?? 'Player Two';
    const names   = mode === 'multi' ? [p1, p2] : [p1];
    this.engine.startGame(mode, names);
  }

  onGoMenu(): void {
    this.engine.endGame();
    this.input.deactivate();
    this.router.navigate(['/menu']);
  }

  isPaused(state: GameState): boolean   { return state.status === 'paused'; }
  isGameOver(state: GameState): boolean { return state.status === 'gameover'; }
  isPlaying(state: GameState): boolean  { return state.status === 'playing'; }

  ngOnDestroy(): void {
    this.engine.endGame();
    this.input.deactivate();
    this.subs.unsubscribe();
    if (this.achievementTimer) clearTimeout(this.achievementTimer);
  }
}
