// ═══════════════════════════════════════════════════════════════
//  SETTINGS SERVICE
// ═══════════════════════════════════════════════════════════════

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DEFAULT_SETTINGS, GameSettings } from '../models/settings.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly STORAGE_KEY = 'settings';
  private _settings$: BehaviorSubject<GameSettings>;

  get settings$(): Observable<GameSettings> {
    return this._settings$.asObservable();
  }

  get snapshot(): GameSettings {
    return this._settings$.getValue();
  }

  constructor(private readonly storage: StorageService) {
    const saved = this.storage.get<GameSettings>(this.STORAGE_KEY, DEFAULT_SETTINGS);
    this._settings$ = new BehaviorSubject<GameSettings>({ ...DEFAULT_SETTINGS, ...saved });
  }

  update(partial: Partial<GameSettings>): void {
    const updated = { ...this._settings$.getValue(), ...partial };
    this._settings$.next(updated);
    this.storage.set(this.STORAGE_KEY, updated);
  }

  reset(): void {
    this._settings$.next({ ...DEFAULT_SETTINGS });
    this.storage.set(this.STORAGE_KEY, DEFAULT_SETTINGS);
  }
}
