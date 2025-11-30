import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  AfterViewInit,
  ViewChild,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
  ApexXAxis,
  ApexTooltip,
  ApexResponsive,
} from 'ng-apexcharts';
import {
  CORES_APEX,
  TEMA_APEX,
  GRID_APEX,
  TOOLTIP_APEX,
} from '../../../../core/utils/graficos.util';
import { ServicoDeAnalytics } from '../../../../core/services/servico-de-analytics.service';
import { Transacao } from '../../../../shared/models/transacao.model';

@Component({
  selector: 'app-top-categorias-apex',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bg-slate-900/80 border border-white/5 p-6 rounded-3xl min-h-[320px] sm:min-h-[360px]"
    >
      <h3 class="text-lg font-bold mb-4">Top Categorias (Mês)</h3>
      <apx-chart
        #chartCmp
        [series]="series"
        [chart]="chart"
        [xaxis]="xaxis"
        [plotOptions]="plotOptions"
        [colors]="colors"
        [tooltip]="tooltip"
        [theme]="theme"
        [grid]="grid"
        [responsive]="responsive"
      ></apx-chart>
    </div>
  `,
})
export class TopCategoriasApexComponent implements OnChanges, AfterViewInit {
  @Input() transacoes: Transacao[] = [];
  @Input() topN = 5;

  series: ApexAxisChartSeries = [];
  chart: ApexChart = { type: 'bar', height: 260, toolbar: { show: false } };
  xaxis: ApexXAxis = { categories: [], labels: { rotate: -30 } };
  plotOptions: ApexPlotOptions = { bar: { horizontal: true, borderRadius: 6, distributed: true } };
  colors: string[] = CORES_APEX;
  tooltip: ApexTooltip = TOOLTIP_APEX;
  theme = TEMA_APEX;
  grid = GRID_APEX;
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
  ) {}

  private categoriasPendentes: string[] = [];
  private valoresPendentes: number[] = [];

  ngOnChanges(): void {
    const itens = this.analytics
      .gastosPorCategoria(this.transacoes, this.topN)
      .map((x) => ({ nome: x.label, valor: x.valor }));
    const categorias = itens.map((x) => x.nome);
    const valores = itens.map((x) => x.valor);
    this.categoriasPendentes = categorias;
    this.valoresPendentes = valores;
    if (this.chartRef) {
      this.ngZone.runOutsideAngular(() => {
        this.chartRef?.updateSeries([{ name: 'Total', data: valores }], true);
        this.chartRef?.updateOptions(
          {
            xaxis: { ...this.xaxis, categories: categorias },
            chart: { redrawOnParentResize: true },
          },
          true,
          true,
        );
      });
    }
  }

  ngAfterViewInit(): void {
    const categorias = this.categoriasPendentes;
    const valores = this.valoresPendentes;
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.chartRef?.updateSeries([{ name: 'Total', data: valores }], true);
        this.chartRef?.updateOptions(
          {
            xaxis: { ...this.xaxis, categories: categorias },
            chart: { redrawOnParentResize: true },
          },
          true,
          true,
        );
      });
    });
  }
}
