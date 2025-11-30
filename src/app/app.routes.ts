import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell/shell.component';

export const APP_ROUTES: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'fixos',
        loadChildren: () => import('./features/fixos/fixos.routes').then((m) => m.FIXOS_ROUTES),
      },
      {
        path: 'transacoes',
        loadChildren: () =>
          import('./features/transacoes/transacoes.routes').then((m) => m.TRANSAcoes_ROUTES),
      },
      {
        path: 'carteira',
        loadChildren: () =>
          import('./features/carteira/carteira.routes').then((m) => m.CARTEIRA_ROUTES),
      },
      {
        path: 'planejamento',
        loadChildren: () =>
          import('./features/planejamento/planejamento.routes').then((m) => m.PLANEJAMENTO_ROUTES),
      },
      {
        path: 'configuracoes',
        loadChildren: () =>
          import('./features/configuracoes/configuracoes.routes').then(
            (m) => m.CONFIGURACOES_ROUTES,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
