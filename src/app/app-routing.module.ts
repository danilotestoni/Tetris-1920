import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'menu',
    pathMatch: 'full',
  },
  {
    path: 'menu',
    loadChildren: () =>
      import('./features/menu/menu.module').then(m => m.MenuModule),
  },
  {
    path: 'game',
    loadChildren: () =>
      import('./features/game/game.module').then(m => m.GameModule),
  },
  {
    path: '**',
    redirectTo: 'menu',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
