import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AchievementUnlockEvent } from '../../../core/models/achievement.model';
import { RARITY_COLORS } from '../../../core/models/achievement.model';

@Component({
  selector: 'app-achievement-overlay',
  templateUrl: './achievement-overlay.component.html',
  styleUrls: ['./achievement-overlay.component.scss'],
})
export class AchievementOverlayComponent implements OnChanges {
  @Input() event!: AchievementUnlockEvent;

  rarityColor = '#D4AF37';
  isVisible   = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['event'] && this.event) {
      this.rarityColor = RARITY_COLORS[this.event.achievement.rarity] ?? '#D4AF37';
      this.isVisible   = false;
      // Tiny tick to re-trigger animation
      setTimeout(() => (this.isVisible = true), 10);
    }
  }
}
