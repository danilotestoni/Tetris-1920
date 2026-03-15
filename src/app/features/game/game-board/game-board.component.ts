import {
  Component, Input, OnChanges, SimpleChanges,
  ViewChild, ElementRef, AfterViewInit, OnDestroy,
} from '@angular/core';
import { PlayerGameState, Board, BOARD_COLS, BOARD_ROWS } from '../../../core/models/game-state.model';
import { Tetromino } from '../../../core/models/tetromino.model';
import { SettingsService } from '../../../core/services/settings.service';
import { Subscription } from 'rxjs';

const CELL_SIZE = 30;

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss'],
})
export class GameBoardComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() playerState!: PlayerGameState;
  @Input() showGhost = true;
  @Input() showGrid  = true;

  @ViewChild('boardCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly CELL_SIZE = CELL_SIZE;
  readonly WIDTH  = BOARD_COLS * CELL_SIZE;
  readonly HEIGHT = BOARD_ROWS * CELL_SIZE;

  private ctx!: CanvasRenderingContext2D;
  private flashRows = new Set<number>();
  private sub!: Subscription;
  private showGhostSetting = true;
  private showGridSetting  = true;

  constructor(private readonly settings: SettingsService) {}

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width  = this.WIDTH;
    canvas.height = this.HEIGHT;
    this.ctx = canvas.getContext('2d')!;

    this.sub = this.settings.settings$.subscribe(s => {
      this.showGhostSetting = s.showGhost;
      this.showGridSetting  = s.showGrid;
      this.render();
    });

    this.render();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.ctx) this.render();
  }

  private render(): void {
    if (!this.ctx) return;
    const { width, height } = this.ctx.canvas;
    this.ctx.clearRect(0, 0, width, height);

    this.drawBackground();
    if (this.showGridSetting) this.drawGrid();
    this.drawBoard(this.playerState.board);
    if (this.showGhostSetting && this.playerState.ghostPiece) {
      this.drawGhost(this.playerState.ghostPiece);
    }
    if (this.playerState.currentPiece) {
      this.drawPiece(this.playerState.currentPiece);
    }
    if (this.playerState.isGameOver) {
      this.drawGameOverTint();
    }
  }

  private drawBackground(): void {
    this.ctx.fillStyle = '#0D0900';
    this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

    // Subtle vignette
    const grad = this.ctx.createRadialGradient(
      this.WIDTH / 2, this.HEIGHT / 2, this.HEIGHT * 0.2,
      this.WIDTH / 2, this.HEIGHT / 2, this.HEIGHT * 0.9
    );
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, 'rgba(0,0,0,0.4)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
  }

  private drawGrid(): void {
    this.ctx.strokeStyle = 'rgba(212,175,55,0.06)';
    this.ctx.lineWidth = 0.5;

    for (let c = 0; c <= BOARD_COLS; c++) {
      this.ctx.beginPath();
      this.ctx.moveTo(c * CELL_SIZE, 0);
      this.ctx.lineTo(c * CELL_SIZE, this.HEIGHT);
      this.ctx.stroke();
    }
    for (let r = 0; r <= BOARD_ROWS; r++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, r * CELL_SIZE);
      this.ctx.lineTo(this.WIDTH, r * CELL_SIZE);
      this.ctx.stroke();
    }
  }

  private drawBoard(board: Board): void {
    board.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell.color) {
          this.drawCell(c, r, cell.color, cell.shadowColor!, cell.highlightColor!);
        }
      });
    });
  }

  private drawPiece(piece: Tetromino): void {
    piece.shape.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (!cell) return;
        this.drawCell(
          piece.x + c,
          piece.y + r,
          piece.color,
          piece.shadowColor,
          piece.highlightColor
        );
      });
    });
  }

  private drawGhost(piece: Tetromino): void {
    this.ctx.globalAlpha = 0.2;
    piece.shape.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (!cell) return;
        const x = (piece.x + c) * CELL_SIZE;
        const y = (piece.y + r) * CELL_SIZE;
        this.ctx.fillStyle = piece.color;
        this.ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        // Ghost outline
        this.ctx.strokeStyle = piece.color;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      });
    });
    this.ctx.globalAlpha = 1;
  }

  private drawCell(
    col: number,
    row: number,
    color: string,
    shadow: string,
    highlight: string
  ): void {
    const x = col * CELL_SIZE;
    const y = row * CELL_SIZE;
    const s = CELL_SIZE;
    const pad = 1;

    // Base fill
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x + pad, y + pad, s - pad * 2, s - pad * 2);

    // Art deco: top-left highlight bevel
    this.ctx.fillStyle = highlight;
    this.ctx.fillRect(x + pad, y + pad, s - pad * 2, 3);       // top
    this.ctx.fillRect(x + pad, y + pad, 3, s - pad * 2);       // left

    // Bottom-right shadow bevel
    this.ctx.fillStyle = shadow;
    this.ctx.fillRect(x + pad, y + s - pad - 3, s - pad * 2, 3); // bottom
    this.ctx.fillRect(x + s - pad - 3, y + pad, 3, s - pad * 2); // right

    // Inner shine dot (art deco style)
    this.ctx.fillStyle = 'rgba(255,255,255,0.12)';
    this.ctx.fillRect(x + pad + 4, y + pad + 4, 4, 4);
  }

  private drawGameOverTint(): void {
    this.ctx.fillStyle = 'rgba(0,0,0,0.55)';
    this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
  }

  flashClearRows(rows: number[]): void {
    rows.forEach(r => this.flashRows.add(r));
    // Draw flash
    rows.forEach(r => {
      this.ctx.fillStyle = 'rgba(212,175,55,0.7)';
      this.ctx.fillRect(0, r * CELL_SIZE, this.WIDTH, CELL_SIZE);
    });
    setTimeout(() => {
      rows.forEach(r => this.flashRows.delete(r));
      this.render();
    }, 120);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
