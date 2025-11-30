import { Routes } from '@angular/router';

export const TRANSAcoes_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/transacoes.page.component').then((c) => c.TransacoesPageComponent),
  },
];
