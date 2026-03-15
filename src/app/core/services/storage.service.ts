// ═══════════════════════════════════════════════════════════════
//  STORAGE SERVICE
//  Single responsibility: persisting data to localStorage
// ═══════════════════════════════════════════════════════════════

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly PREFIX = 'tetris1920_';

  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(this.PREFIX + key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('[StorageService] Failed to save:', key, e);
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.PREFIX + key);
  }

  clear(): void {
    Object.keys(localStorage)
      .filter(k => k.startsWith(this.PREFIX))
      .forEach(k => localStorage.removeItem(k));
  }
}
