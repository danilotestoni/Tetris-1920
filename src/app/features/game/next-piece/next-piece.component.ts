import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges } from '@angular/core';
import { Tetromino } from '../../../core/models/tetromino.model';

const CELL = 20;

@Component({
  selector: 'app-next-piece',
  templateUrl: './next-piece.component.html',
  styleUrls: ['./next-piece.component.scss'],
})
export class NextPieceComponent implements AfterViewInit, OnChanges {
  @Input() piece: Tetromino | null = null;
  @Input() dimmed = false;

  @ViewChild('previewCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  readonly SIZE = CELL * 5;

  ngAfterViewInit(): void {
    const c = this.canvasRef.nativeElement;
    c.width = c.height = this.SIZE;
    this.ctx = c.getContext('2d')!;
    this.render();
  }

  ngOnChanges(): void {
    if (this.ctx) this.render();
  }

  private render(): void {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.SIZE, this.SIZE);
    this.ctx.fillStyle = 'rgba(13,9,0,0.6)';
    this.ctx.fillRect(0, 0, this.SIZE, this.SIZE);

    if (!this.piece) return;

    const shape  = this.piece.shape;
    const rows   = shape.length;
    const cols   = shape[0].length;
    const startX = Math.floor((5 - cols) / 2) * CELL;
    const startY = Math.floor((5 - rows) / 2) * CELL;

    this.ctx.globalAlpha = this.dimmed ? 0.3 : 1;
    shape.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (!cell) return;
        const x = startX + c * CELL;
        const y = startY + r * CELL;

        this.ctx.fillStyle = this.piece!.color;
        this.ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
        this.ctx.fillStyle = this.piece!.highlightColor;
        this.ctx.fillRect(x + 1, y + 1, CELL - 2, 2);
        this.ctx.fillRect(x + 1, y + 1, 2, CELL - 2);
        this.ctx.fillStyle = this.piece!.shadowColor;
        this.ctx.fillRect(x + 1, y + CELL - 3, CELL - 2, 2);
        this.ctx.fillRect(x + CELL - 3, y + 1, 2, CELL - 2);
      });
    });
    this.ctx.globalAlpha = 1;
  }
}
