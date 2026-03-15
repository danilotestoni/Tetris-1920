import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { SettingsComponent } from './settings/settings.component';
import { ScoreboardComponent } from './scoreboard/scoreboard.component';
import { PlayerSelectComponent } from './player-select/player-select.component';

const routes: Routes = [
  { path: '',            component: MainMenuComponent },
  { path: 'settings',   component: SettingsComponent },
  { path: 'scoreboard', component: ScoreboardComponent },
  { path: 'select',     component: PlayerSelectComponent },
];

@NgModule({
  declarations: [
    MainMenuComponent,
    SettingsComponent,
    ScoreboardComponent,
    PlayerSelectComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
})
export class MenuModule {}
