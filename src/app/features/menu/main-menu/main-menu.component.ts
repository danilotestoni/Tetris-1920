import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AudioService } from '../../../core/services/audio.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
})
export class MainMenuComponent implements OnInit {
  audioStarted = false;

  constructor(
    private readonly router: Router,
    private readonly audio: AudioService,
  ) {}

  ngOnInit(): void {}

  startSingle(): void {
    this.ensureAudio();
    this.audio.playSfx('menu_select');
    this.router.navigate(['/menu/select'], { queryParams: { mode: 'single' } });
  }

  startMulti(): void {
    this.ensureAudio();
    this.audio.playSfx('menu_select');
    this.router.navigate(['/menu/select'], { queryParams: { mode: 'multi' } });
  }

  goSettings(): void {
    this.ensureAudio();
    this.audio.playSfx('menu_select');
    this.router.navigate(['/menu/settings']);
  }

  goScoreboard(): void {
    this.ensureAudio();
    this.audio.playSfx('menu_select');
    this.router.navigate(['/menu/scoreboard']);
  }

  hover(): void {
    if (this.audioStarted) this.audio.playSfx('menu_hover');
  }

  private ensureAudio(): void {
    if (!this.audioStarted) {
      this.audio.init();
      this.audio.startMusic();
      this.audioStarted = true;
    }
  }
}
