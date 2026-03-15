import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimerService } from './services/timer.service';

/** Eagerly instantiates singleton services that self-start via DI */
@NgModule({
  imports: [CommonModule],
})
export class CoreModule {
  // Ensures timer boots as soon as the app loads
  constructor(
    _timer: TimerService,
    @Optional() @SkipSelf() parent?: CoreModule
  ) {
    if (parent) {
      throw new Error('CoreModule is already loaded. Import it in AppModule only.');
    }
  }
}
