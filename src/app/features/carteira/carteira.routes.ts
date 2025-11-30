import { Routes } from '@angular/router';

export const CARTEIRA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/carteira.page.component').then((c) => c.CarteiraPageComponent),
  },
];
