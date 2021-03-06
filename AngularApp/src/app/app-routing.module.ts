import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'films', loadChildren: () => import('./modules/films/films.module').then(m => m.FilmsModule) },
  { path: 'planets', loadChildren: () => import('./modules/planets/planets.module').then(m => m.PlanetsModule) },
  { path: 'characters', loadChildren: () => import('./modules/characters/characters.module').then(m => m.CharactersModule) },
  { path: 'authorization', loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule) },
  { path: 'notfound', component: NotFoundComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/notfound', pathMatch: 'full' },
];

/**
 * Routing module
 */
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
