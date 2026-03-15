import { Component, Input, Output, EventEmitter } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize    = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-art-deco-button',
  templateUrl: './art-deco-button.component.html',
  styleUrls: ['./art-deco-button.component.scss'],
})
export class ArtDecoButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size:    ButtonSize    = 'md';
  @Input() disabled = false;
  @Input() fullWidth = false;
  @Output() clicked = new EventEmitter<void>();

  onClick(): void {
    if (!this.disabled) this.clicked.emit();
  }
}
