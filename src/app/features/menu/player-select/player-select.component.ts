import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Player, PlayerAvatar, PLAYER_AVATARS, DEFAULT_PLAYER_NAMES } from '../../../core/models/player.model';
import { AudioService } from '../../../core/services/audio.service';

@Component({
  selector: 'app-player-select',
  templateUrl: './player-select.component.html',
  styleUrls: ['./player-select.component.scss'],
})
export class PlayerSelectComponent implements OnInit {
  mode: 'single' | 'multi' = 'single';
  avatars = PLAYER_AVATARS;
  form!: FormGroup;

  readonly MAX_NAME_LENGTH = 16;

  constructor(
    private readonly router:  Router,
    private readonly route:   ActivatedRoute,
    private readonly fb:      FormBuilder,
    private readonly audio:   AudioService,
  ) {}

  ngOnInit(): void {
    this.mode = (this.route.snapshot.queryParamMap.get('mode') ?? 'single') as 'single' | 'multi';
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      p1Name:   [DEFAULT_PLAYER_NAMES[1], [Validators.required, Validators.maxLength(this.MAX_NAME_LENGTH)]],
      p1Avatar: ['gatsby' as PlayerAvatar],
      p2Name:   [DEFAULT_PLAYER_NAMES[2], [Validators.required, Validators.maxLength(this.MAX_NAME_LENGTH)]],
      p2Avatar: ['flapper' as PlayerAvatar],
    });
  }

  selectAvatar(player: 1 | 2, avatar: PlayerAvatar): void {
    const key = player === 1 ? 'p1Avatar' : 'p2Avatar';
    this.form.get(key)?.setValue(avatar);
    this.audio.playSfx('menu_select');
  }

  isSelectedAvatar(player: 1 | 2, avatarId: PlayerAvatar): boolean {
    const key = player === 1 ? 'p1Avatar' : 'p2Avatar';
    return this.form.get(key)?.value === avatarId;
  }

  startGame(): void {
    if (this.form.invalid) return;
    const { p1Name, p1Avatar, p2Name, p2Avatar } = this.form.value;

    const players: Player[] = [
      { id: 1, name: p1Name.trim() || DEFAULT_PLAYER_NAMES[1], avatar: p1Avatar },
    ];

    if (this.mode === 'multi') {
      players.push({ id: 2, name: p2Name.trim() || DEFAULT_PLAYER_NAMES[2], avatar: p2Avatar });
    }

    this.audio.playSfx('menu_select');
    this.router.navigate(['/game'], {
      queryParams: {
        mode: this.mode,
        p1: players[0].name,
        p2: players[1]?.name ?? '',
      },
    });
  }

  goBack(): void {
    this.audio.playSfx('menu_select');
    this.router.navigate(['/menu']);
  }
}
