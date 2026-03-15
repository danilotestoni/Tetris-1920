// ═══════════════════════════════════════════════════════════════
//  GAME ENGINE SERVICE
//  Orchestrates the game loop, input processing and state updates
//  Open for extension (new modes), closed for modification (OCP)
// ═══════════════════════════════════════════════════════════════

import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { PlayerGameState, GameState, GameStatus, createInitialPlayerState, Board, BOARD_COLS, BOARD_ROWS } from '../models/game-state.model';
import { Tetromino } from '../models/tetromino.model';
import { GameSettings, getDropInterval } from '../models/settings.model';
import { Score } from '../models/score.model';
import { TetrominoService } from './tetromino.service';
import { CollisionService } from './collision.service';
import { ScoreService } from './score.service';
import { AchievementService } from './achievement.service';
import { AudioService } from './audio.service';
import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class GameEngineService implements OnDestroy {
  // ── Public state streams ─────────────────────────────────────
  private _gameState$ = new BehaviorSubject<GameState>({
    status: 'idle',
    mode: 'single',
    players: [],
    activePlayerIndex: 0,
  });

  readonly gameState$  = this._gameState$.asObservable();
  readonly linesClear$ = new Subject<{ playerIndex: number; rows: number[] }>();
  readonly levelUp$    = new Subject<{ playerIndex: number; level: number }>();

  private dropTimers:  ReturnType<typeof setInterval>[] = [];
  private lockTimers:  ReturnType<typeof setTimeout>[]  = [];
  private lastTetris: boolean[] = [false, false];
  private settingsSub: Subscription;
  private currentSettings!: GameSettings;

  constructor(
    private readonly tetrominoSvc:  TetrominoService,
    private readonly collisionSvc:  CollisionService,
    private readonly scoreSvc:      ScoreService,
    private readonly achieveSvc:    AchievementService,
    private readonly audio:         AudioService,
    private readonly settingsSvc:   SettingsService,
  ) {
    this.settingsSub = this.settingsSvc.settings$.subscribe(s => {
      this.currentSettings = s;
    });
  }

  get snapshot(): GameState { return this._gameState$.getValue(); }

  // ── Game Lifecycle ───────────────────────────────────────────

  startGame(
    mode: 'single' | 'multi',
    playerNames: string[]
  ): void {
    this.stopAllTimers();
    this.tetrominoSvc.resetBag();
    this.lastTetris = [false, false];

    const players = playerNames.map((name, i) => {
      const ps = createInitialPlayerState((i + 1) as 1 | 2, name);
      ps.currentPiece = this.spawnPiece(ps);
      ps.nextPiece    = this.tetrominoSvc.create(this.tetrominoSvc.nextFromBag());
      ps.ghostPiece   = this.collisionSvc.getGhostPiece(ps.currentPiece, ps.board);
      return ps;
    });

    this._gameState$.next({ status: 'playing', mode, players, activePlayerIndex: 0 });
    this.audio.startMusic();

    players.forEach((_, i) => this.startDropTimer(i));
  }

  pauseGame(): void {
    if (this.snapshot.status !== 'playing') return;
    this.stopAllTimers();
    this.audio.pauseMusic();
    this.patchStatus('paused');
  }

  resumeGame(): void {
    if (this.snapshot.status !== 'paused') return;
    this.patchStatus('playing');
    this.audio.resumeMusic();
    this.snapshot.players.forEach((p, i) => {
      if (!p.isGameOver) this.startDropTimer(i);
    });
  }

  endGame(): void {
    this.stopAllTimers();
    this.audio.stopMusic();
    this.patchStatus('idle');
  }

  // ── Input Handling ───────────────────────────────────────────

  moveLeft(playerIndex: number): void    { this.shiftPiece(playerIndex, -1, 0); }
  moveRight(playerIndex: number): void   { this.shiftPiece(playerIndex,  1, 0); }
  softDrop(playerIndex: number): void    { this.shiftPiece(playerIndex,  0, 1, true); }
  rotateCW(playerIndex: number): void    { this.rotatePiece(playerIndex,  1); }
  rotateCCW(playerIndex: number): void   { this.rotatePiece(playerIndex, -1); }

  hardDrop(playerIndex: number): void {
    const state = this.getPlayerState(playerIndex);
    if (!state?.currentPiece || this.snapshot.status !== 'playing') return;

    const dist = this.collisionSvc.getDropDistance(state.currentPiece, state.board);
    const pts  = this.scoreSvc.calculateHardDropScore(dist);

    this.updatePlayerState(playerIndex, ps => ({
      ...ps,
      score: ps.score + pts,
      currentPiece: ps.currentPiece
        ? { ...ps.currentPiece, y: ps.currentPiece.y + dist }
        : null,
    }));

    this.audio.playSfx('hard_drop');
    this.lockPiece(playerIndex);
  }

  hold(playerIndex: number): void {
    const state = this.getPlayerState(playerIndex);
    if (!state?.currentPiece || !state.canHold || this.snapshot.status !== 'playing') return;

    const current = state.currentPiece;
    const held    = state.heldPiece;
    const nextPiece = held
      ? this.tetrominoSvc.create(held.type)
      : this.tetrominoSvc.create(this.tetrominoSvc.nextFromBag());

    this.updatePlayerState(playerIndex, ps => ({
      ...ps,
      heldPiece:    this.tetrominoSvc.create(current.type),
      currentPiece: nextPiece,
      ghostPiece:   this.collisionSvc.getGhostPiece(nextPiece, ps.board),
      canHold:      false,
      nextPiece:    held ? ps.nextPiece : this.tetrominoSvc.create(this.tetrominoSvc.nextFromBag()),
    }));

    this.audio.playSfx('hold');
  }

  // ── Private: Movement ────────────────────────────────────────

  private shiftPiece(
    playerIndex: number,
    dx: number,
    dy: number,
    isSoftDrop = false
  ): void {
    const state = this.getPlayerState(playerIndex);
    if (!state?.currentPiece || this.snapshot.status !== 'playing') return;

    const piece = state.currentPiece;
    if (!this.collisionSvc.isValid(piece, state.board, dx, dy)) {
      if (dy > 0) this.lockPiece(playerIndex);
      return;
    }

    const newPiece = { ...piece, x: piece.x + dx, y: piece.y + dy };
    const score    = isSoftDrop
      ? state.score + this.scoreSvc.calculateSoftDropScore(1)
      : state.score;

    this.updatePlayerState(playerIndex, ps => ({
      ...ps,
      score,
      currentPiece: newPiece,
      ghostPiece:   this.collisionSvc.getGhostPiece(newPiece, ps.board),
    }));

    if (!isSoftDrop && dx !== 0) this.audio.playSfx('move');
  }

  private rotatePiece(playerIndex: number, dir: 1 | -1): void {
    const state = this.getPlayerState(playerIndex);
    if (!state?.currentPiece || this.snapshot.status !== 'playing') return;

    const piece   = state.currentPiece;
    const rotated = this.tetrominoSvc.rotate(piece, dir);
    const kicks   = this.tetrominoSvc.getWallKickOffsets(
      piece.type, piece.rotationIndex, rotated.rotationIndex
    );

    for (const [kx, ky] of kicks) {
      if (this.collisionSvc.isValid(rotated, state.board, kx, ky)) {
        const kicked = { ...rotated, x: rotated.x + kx, y: rotated.y + ky };
        this.updatePlayerState(playerIndex, ps => ({
          ...ps,
          currentPiece: kicked,
          ghostPiece:   this.collisionSvc.getGhostPiece(kicked, ps.board),
        }));
        this.audio.playSfx('rotate');
        return;
      }
    }
  }

  // ── Private: Lock & Clear ────────────────────────────────────

  private lockPiece(playerIndex: number): void {
    const state = this.getPlayerState(playerIndex);
    if (!state?.currentPiece) return;

    const newBoard = this.stampPiece(state.board, state.currentPiece);
    const clearedRows = this.findFullRows(newBoard);

    if (clearedRows.length > 0) {
      this.linesClear$.next({ playerIndex, rows: clearedRows });
      const clearedBoard = this.clearRows(newBoard, clearedRows);
      this.updateAfterClear(playerIndex, clearedBoard, clearedRows.length, state);
      const sfx = clearedRows.length === 4 ? 'tetris' : 'line_clear';
      this.audio.playSfx(sfx);
    } else {
      this.spawnNext(playerIndex, newBoard, state);
      this.audio.playSfx('piece_land');
    }
  }

  private updateAfterClear(
    playerIndex: number,
    board: Board,
    linesCleared: number,
    prevState: PlayerGameState
  ): void {
    const newLines  = prevState.lines + linesCleared;
    const newLevel  = this.scoreSvc.getLevelForLines(newLines);
    const newCombo  = prevState.combo + 1;
    const pts       = this.scoreSvc.calculateLineScore(linesCleared, newLevel, newCombo);
    const newScore  = prevState.score + pts;
    const isTetris  = linesCleared === 4;
    const isB2B     = isTetris && this.lastTetris[playerIndex];

    if (newLevel > prevState.level) {
      this.levelUp$.next({ playerIndex, level: newLevel });
      this.audio.playSfx('level_up');
      this.resetDropTimer(playerIndex, newLevel);
    }

    this.lastTetris[playerIndex] = isTetris;

    this.updatePlayerState(playerIndex, ps => {
      const updated: PlayerGameState = {
        ...ps,
        board,
        score:   newScore,
        lines:   newLines,
        level:   newLevel,
        combo:   newCombo,
        canHold: true,
      };
      this.achieveSvc.check({
        state:            updated,
        linesJustCleared: linesCleared,
        isBackToBack:     isB2B,
        wasTetris:        isTetris,
      });
      return updated;
    });

    this.spawnNext(playerIndex, board, this.getPlayerState(playerIndex)!);
  }

  private spawnNext(
    playerIndex: number,
    board: Board,
    prevState: PlayerGameState
  ): void {
    const next    = prevState.nextPiece ?? this.tetrominoSvc.create(this.tetrominoSvc.nextFromBag());
    const spawned = this.tetrominoSvc.create(next.type);
    const newNext = this.tetrominoSvc.create(this.tetrominoSvc.nextFromBag());

    if (!this.collisionSvc.isValid(spawned, board)) {
      // Game over!
      this.handleGameOver(playerIndex);
      return;
    }

    this.updatePlayerState(playerIndex, ps => ({
      ...ps,
      board,
      currentPiece: spawned,
      nextPiece:    newNext,
      ghostPiece:   this.collisionSvc.getGhostPiece(spawned, board),
      canHold:      true,
      combo:        0,
    }));
  }

  private handleGameOver(playerIndex: number): void {
    this.stopDropTimer(playerIndex);
    this.updatePlayerState(playerIndex, ps => ({ ...ps, isGameOver: true }));
    this.audio.playSfx('game_over');

    const state  = this.getPlayerState(playerIndex)!;
    const score: Score = {
      id:          this.scoreSvc.generateId(),
      playerName:  state.playerName,
      playerAvatar: 'gatsby',
      score:       state.score,
      level:       state.level,
      lines:       state.lines,
      date:        new Date().toISOString(),
      duration:    Math.floor((Date.now() - state.startTime) / 1000),
      mode:        this.snapshot.mode,
    };
    this.scoreSvc.saveScore(score);

    const allOver = this.snapshot.players.every(p => p.isGameOver);
    if (allOver) {
      this.audio.stopMusic();
      this.patchStatus('gameover');
    }
  }

  // ── Private: Board helpers ───────────────────────────────────

  private stampPiece(board: Board, piece: Tetromino): Board {
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    piece.shape.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (!cell) return;
        const by = piece.y + r;
        const bx = piece.x + c;
        if (by >= 0 && by < BOARD_ROWS && bx >= 0 && bx < BOARD_COLS) {
          newBoard[by][bx] = {
            color:          piece.color,
            shadowColor:    piece.shadowColor,
            highlightColor: piece.highlightColor,
          };
        }
      });
    });
    return newBoard;
  }

  private findFullRows(board: Board): number[] {
    return board
      .map((row, i) => ({ row, i }))
      .filter(({ row }) => row.every(cell => cell.color !== null))
      .map(({ i }) => i);
  }

  private clearRows(board: Board, rows: number[]): Board {
    const rowSet  = new Set(rows);
    const kept    = board.filter((_, i) => !rowSet.has(i));
    const empty   = Array.from({ length: rows.length }, () =>
      Array.from({ length: BOARD_COLS }, () => ({
        color: null as string | null,
        shadowColor: null as string | null,
        highlightColor: null as string | null,
      }))
    );
    return [...empty, ...kept];
  }

  private spawnPiece(state: PlayerGameState): Tetromino {
    return this.tetrominoSvc.create(this.tetrominoSvc.nextFromBag());
  }

  // ── Private: Timer management ────────────────────────────────

  private startDropTimer(playerIndex: number): void {
    this.stopDropTimer(playerIndex);
    const level    = this.getPlayerState(playerIndex)?.level ?? 1;
    const interval = getDropInterval(level, this.currentSettings.difficulty);
    this.dropTimers[playerIndex] = setInterval(
      () => this.softDrop(playerIndex),
      interval
    );
  }

  private stopDropTimer(playerIndex: number): void {
    if (this.dropTimers[playerIndex]) {
      clearInterval(this.dropTimers[playerIndex]);
    }
  }

  private resetDropTimer(playerIndex: number, level: number): void {
    this.stopDropTimer(playerIndex);
    const interval = getDropInterval(level, this.currentSettings.difficulty);
    this.dropTimers[playerIndex] = setInterval(
      () => this.softDrop(playerIndex),
      interval
    );
  }

  private stopAllTimers(): void {
    this.dropTimers.forEach((t) => clearInterval(t));
    this.lockTimers.forEach((t) => clearTimeout(t));
    this.dropTimers = [];
    this.lockTimers = [];
  }

  // ── Private: State helpers ───────────────────────────────────

  private getPlayerState(playerIndex: number): PlayerGameState | undefined {
    return this.snapshot.players[playerIndex];
  }

  private updatePlayerState(
    playerIndex: number,
    updater: (ps: PlayerGameState) => PlayerGameState
  ): void {
    const state   = this.snapshot;
    const players = state.players.map((p, i) => i === playerIndex ? updater(p) : p);
    this._gameState$.next({ ...state, players });
  }

  private patchStatus(status: GameStatus): void {
    this._gameState$.next({ ...this.snapshot, status });
  }

  ngOnDestroy(): void {
    this.stopAllTimers();
    this.settingsSub.unsubscribe();
  }
}
