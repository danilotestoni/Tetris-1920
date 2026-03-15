import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pause-overlay',
  templateUrl: './pause-overlay.component.html',
  styleUrls: ['./pause-overlay.component.scss'],
})
export class PauseOverlayComponent {
  @Output() resume  = new EventEmitter<void>();
  @Output() restart = new EventEmitter<void>();
  @Output() menu    = new EventEmitter<void>();
}
