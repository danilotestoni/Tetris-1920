import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtDecoButtonComponent } from './components/art-deco-button/art-deco-button.component';
import { TitleCasePipe } from './pipes/title-case.pipe';

@NgModule({
  declarations: [ArtDecoButtonComponent, TitleCasePipe],
  imports:      [CommonModule],
  exports:      [ArtDecoButtonComponent, TitleCasePipe],
})
export class SharedModule {}
