import { Routes } from '@angular/router';

export const CONFIGURACOES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/configuracoes.page.component').then((c) => c.ConfiguracoesPageComponent),
  },
];
