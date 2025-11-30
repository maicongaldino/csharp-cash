import { Routes } from '@angular/router';

export const PLANEJAMENTO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/planejamento.page.component').then((c) => c.PlanejamentoPageComponent),
  },
];
