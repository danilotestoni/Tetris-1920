import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GameSettings, Difficulty, MusicTrack } from '../../../core/models/settings.model';
import { SettingsService } from '../../../core/services/settings.service';
import { AudioService } from '../../../core/services/audio.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
  private sub!: Subscription;

  readonly difficultyLabels: Record<Difficulty, string> = {
    easy:   '🥃 Easy Street',
    medium: '🎷 Jazz Standard',
    hard:   '🎰 Full Prohibition',
  };

  readonly tracks: { id: MusicTrack; label: string }[] = [
    { id: 'blues',      label: '🎷 Harlem Blues'     },
    { id: 'ragtime',    label: '🎹 Scott\'s Ragtime'  },
    { id: 'charleston', label: '💃 Charleston Fever'  },
  ];

  constructor(
    private readonly router:   Router,
    private readonly fb:       FormBuilder,
    private readonly settings: SettingsService,
    private readonly audio:    AudioService,
  ) {}

  ngOnInit(): void {
    const s = this.settings.snapshot;
    this.form = this.fb.group({
      musicVolume: [Math.round(s.musicVolume * 100)],
      soundVolume: [Math.round(s.soundVolume * 100)],
      difficulty:  [s.difficulty],
      showGhost:   [s.showGhost],
      showGrid:    [s.showGrid],
      musicTrack:  [s.musicTrack ?? 'blues'],
    });

    this.sub = this.form.valueChanges.subscribe(v => {
      this.settings.update({
        musicVolume: v.musicVolume / 100,
        soundVolume: v.soundVolume / 100,
        difficulty:  v.difficulty,
        showGhost:   v.showGhost,
        showGrid:    v.showGrid,
        musicTrack:  v.musicTrack,
      });
    });
  }

  setDifficulty(d: Difficulty): void {
    this.form.get('difficulty')?.setValue(d);
    this.audio.playSfx('menu_select');
  }

  setTrack(t: MusicTrack): void {
    this.form.get('musicTrack')?.setValue(t);
    this.audio.playSfx('menu_select');
  }

  reset(): void {
    this.settings.reset();
    const s = this.settings.snapshot;
    this.form.patchValue({
      musicVolume: Math.round(s.musicVolume * 100),
      soundVolume: Math.round(s.soundVolume * 100),
      difficulty:  s.difficulty,
      showGhost:   s.showGhost,
      showGrid:    s.showGrid,
      musicTrack:  s.musicTrack,
    });
    this.audio.playSfx('menu_select');
  }

  goBack(): void {
    this.audio.playSfx('menu_select');
    this.router.navigate(['/menu']);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}