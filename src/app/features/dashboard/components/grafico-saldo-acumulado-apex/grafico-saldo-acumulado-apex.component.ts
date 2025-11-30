import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  ViewChild,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTooltip,
  ApexStroke,
  ApexTheme,
  ApexGrid,
  ApexAnnotations,
  ApexResponsive,
} from 'ng-apexcharts';
import {
  CORES_APEX,
  GRID_APEX,
  TEMA_APEX,
  TOOLTIP_APEX,
} from '../../../../core/utils/graficos.util';
import { ServicoDeAnalytics } from '../../../../core/services/servico-de-analytics.service';
import { Transacao } from '../../../../shared/models/transacao.model';
import { ConfigService } from '../../../../core/services/config.service';

@Component({
  selector: 'app-grafico-saldo-acumulado-apex',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bg-slate-900/80 border border-white/5 p-6 rounded-3xl min-h-[320px] sm:min-h-[360px]"
    >
      <h3 class="text-lg font-bold mb-1 text-white">{{ titulo }}</h3>
      <p class="text-[11px] text-slate-500 mb-3">Linha pontilhada indica renda mensal</p>
      <apx-chart
        #chartCmp
        [series]="series"
        [chart]="chart"
        [xaxis]="xaxis"
        [yaxis]="yaxis"
        [stroke]="stroke"
        [tooltip]="tooltip"
        [grid]="grid"
        [theme]="theme"
        [annotations]="annotations"
        [colors]="colors"
        [responsive]="responsive"
      ></apx-chart>
    </div>
  `,
})
export class GraficoSaldoAcumuladoApexComponent implements OnChanges {
  @Input() transacoes: Transacao[] = [];
  @Input() valorReferencia?: number;
  @Input() titulo = 'Saldo Acumulado no Mês';

  series: ApexAxisChartSeries = [];
  chart: ApexChart = {
    type: 'line',
    height: 250,
    toolbar: { show: false },
    animations: { enabled: true },
  };
  xaxis: ApexXAxis = { categories: [], tickAmount: 6, labels: { rotate: -45 } };
  yaxis: ApexYAxis = { labels: { formatter: (v) => Math.round(v).toString() } };
  stroke: ApexStroke = { curve: 'smooth', width: 3 };
  tooltip: ApexTooltip = TOOLTIP_APEX;
  grid: ApexGrid = GRID_APEX;
  theme: ApexTheme = TEMA_APEX;
  colors: string[] = [CORES_APEX[1]];
  annotations: ApexAnnotations = {};
  responsive: ApexResponsive[] = [
    {
      breakpoint: 640,
      options: {
        chart: { height: 210 },
        xaxis: { tickAmount: 4 },
        grid: { strokeDashArray: 4 },
      },
    },
  ];

  @ViewChild('chartCmp') chartRef?: ChartComponent;

  constructor(
    private readonly ngZone: NgZone,
    private readonly analytics: ServicoDeAnalytics,
    private readonly config: ConfigService,
  ) {}

  ngOnChanges(): void {
    const dados = this.analytics.saldoAcumuladoMensal(this.transacoes);
    const categorias = dados.map((d) => d.label);
    const cumul: number[] = [];
    let s = 0;
    for (const d of dados) {
      s += d.valor;
      cumul.push(s);
    }
    this.ngZone.runOutsideAngular(() => {
      this.chartRef?.updateSeries([{ name: 'Saldo', data: cumul }], true);
      const nextAnn =
        typeof this.valorReferencia === 'number'
          ? {
              yaxis: [
                {
                  y: this.valorReferencia,
                  borderColor: '#64748b',
                  strokeDashArray: 4,
                  label: { text: 'Renda' },
                },
              ],
            }
          : this.config.config().rendaMensal
            ? {
                yaxis: [
                  {
                    y: this.config.config().rendaMensal,
                    borderColor: '#64748b',
                    strokeDashArray: 4,
                    label: { text: 'Renda' },
                  },
                ],
              }
            : {};
      this.chartRef?.updateOptions(
        { xaxis: { ...this.xaxis, categories: categorias }, annotations: nextAnn },
        true,
        true,
      );
    });
  }
}
