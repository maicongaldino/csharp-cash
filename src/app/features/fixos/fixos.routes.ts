import { Routes } from '@angular/router';

export const FIXOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/fixos.page.component').then((c) => c.FixosPageComponent),
  },
];
