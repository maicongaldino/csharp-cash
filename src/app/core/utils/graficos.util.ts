import { ApexGrid, ApexTheme, ApexTooltip } from 'ng-apexcharts';

export const CORES_APEX = ['#a855f7', '#ec4899', '#6366f1', '#f472b6', '#22d3ee', '#f59e0b'];

export const TEMA_APEX: ApexTheme = { mode: 'dark' };

export const GRID_APEX: ApexGrid = { strokeDashArray: 3, padding: { left: 6, right: 6 } };

export const TOOLTIP_APEX: ApexTooltip = {
  theme: 'dark',
  y: { formatter: (v: number) => `R$ ${v.toFixed(2)}` },
};
