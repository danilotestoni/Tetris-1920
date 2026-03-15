import { Component, Input } from '@angular/core';
import { PlayerGameState } from '../../../core/models/game-state.model';

@Component({
  selector: 'app-game-panel',
  templateUrl: './game-panel.component.html',
  styleUrls: ['./game-panel.component.scss'],
})
export class GamePanelComponent {
  @Input() playerState!: PlayerGameState;
  @Input() side: 'left' | 'right' = 'left';

  formatTime(ms: number): string {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  }
}
