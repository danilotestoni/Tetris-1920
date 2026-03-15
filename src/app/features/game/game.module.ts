import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { GameComponent } from './game/game.component';
import { GameBoardComponent } from './game-board/game-board.component';
import { GamePanelComponent } from './game-panel/game-panel.component';
import { NextPieceComponent } from './next-piece/next-piece.component';
import { AchievementOverlayComponent } from './achievement-overlay/achievement-overlay.component';
import { PauseOverlayComponent } from './pause-overlay/pause-overlay.component';

const routes: Routes = [
  { path: '', component: GameComponent },
];

@NgModule({
  declarations: [
    GameComponent,
    GameBoardComponent,
    GamePanelComponent,
    NextPieceComponent,
    AchievementOverlayComponent,
    PauseOverlayComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
})
export class GameModule {}
