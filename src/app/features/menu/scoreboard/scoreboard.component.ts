import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ScoreEntry } from '../../../core/models/score.model';
import { ScoreService } from '../../../core/services/score.service';
import { AchievementService } from '../../../core/services/achievement.service';
import { Achievement } from '../../../core/models/achievement.model';
import { AudioService } from '../../../core/services/audio.service';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss'],
})
export class ScoreboardComponent implements OnInit {
  scores: ScoreEntry[] = [];
  activeTab: 'scores' | 'achievements' = 'scores';
  selectedPlayer: string | null = null;
  allAchievements: { achievement: Achievement; players: string[] }[] = [];

  constructor(
    private readonly router:  Router,
    private readonly scoreSvc: ScoreService,
    private readonly achieveSvc: AchievementService,
    private readonly audio:   AudioService,
  ) {}

  ngOnInit(): void {
    this.loadScores();
    this.loadAchievements();
  }

  private loadScores(): void {
    this.scores = this.scoreSvc.getTopScores(20);
  }

  private loadAchievements(): void {
    const unlocked = this.achieveSvc.getAllUnlocked();
    const map = new Map<string, string[]>();
    unlocked.forEach(u => {
      const list = map.get(u.achievementId) ?? [];
      list.push(u.playerName);
      map.set(u.achievementId, list);
    });

    import('../../../core/models/achievement.model').then(({ ACHIEVEMENTS }) => {
      this.allAchievements = Object.values(ACHIEVEMENTS)
        .filter(a => !a.secret || map.has(a.id))
        .map(a => ({ achievement: a, players: map.get(a.id) ?? [] }));
    });
  }

  setTab(tab: 'scores' | 'achievements'): void {
    this.activeTab = tab;
    this.audio.playSfx('menu_select');
  }

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  clearScores(): void {
    if (confirm('Clear all scores? This cannot be undone.')) {
      this.scoreSvc.clearAll();
      this.scores = [];
    }
  }

  goBack(): void {
    this.audio.playSfx('menu_select');
    this.router.navigate(['/menu']);
  }
}
