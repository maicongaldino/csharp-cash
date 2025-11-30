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
  ApexXAxis,
  ApexYAxis,
  ApexTooltip,
  ApexDataLabels,
  ApexPlotOptions,
  ApexTheme,
  ApexGrid,
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

@Component({
  selector: 'app-grafico-fluxo-diario-apex',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bg-slate-900/80 border border-white/5 p-6 rounded-3xl min-h-[320px] sm:min-h-[360px]"
    >
      <h3 class="text-lg font-bold mb-6 flex items-center gap-2">
        <span class="w-2 h-6 bg-pink-500 rounded-full"></span>
        {{ titulo }}
      </h3>
      <apx-chart
        #chartCmp
        [series]="series"
        [chart]="chart"
        [xaxis]="xaxis"
        [yaxis]="yaxis"
        [plotOptions]="plotOptions"
        [dataLabels]="dataLabels"
        [tooltip]="tooltip"
        [grid]="grid"
        [theme]="theme"
        [colors]="colors"
        [responsive]="responsive"
      ></apx-chart>
    </div>
  `,
})
export class GraficoFluxoDiarioApexComponent implements OnChanges, AfterViewInit {
  @Input() transacoes: Transacao[] = [];
  @Input() filtroTodoPeriodo = false;
  @Input() anoMes = '';
  titulo = 'Fluxo Diário';

  @ViewChild('chartCmp') chartRef?: ChartComponent;

  constructor(
    private readonly ngZone: NgZone,
    private readonly analytics: ServicoDeAnalytics,
  ) {}

  series: ApexAxisChartSeries = [];
  chart: ApexChart = {
    type: 'bar',
    height: 250,
    toolbar: { show: false },
    animations: { enabled: true },
  };
  xaxis: ApexXAxis = { categories: [], tickAmount: 6, labels: { rotate: -45 } };
  yaxis: ApexYAxis = { labels: { formatter: (v) => Math.round(v).toString() } };
  plotOptions: ApexPlotOptions = { bar: { borderRadius: 6, columnWidth: '70%' } };
  dataLabels: ApexDataLabels = { enabled: false };
  tooltip: ApexTooltip = TOOLTIP_APEX;
  grid: ApexGrid = GRID_APEX;
  theme: ApexTheme = TEMA_APEX;
  colors: string[] = [CORES_APEX[0]];
  responsive: ApexResponsive[] = [
    {
      breakpoint: 640,
      options: {
        chart: { height: 210 },
        xaxis: { tickAmount: 4 },
        plotOptions: { bar: { columnWidth: '60%' } },
        grid: { strokeDashArray: 4 },
      },
    },
  ];

  private categoriasPendentes: string[] = [];
  private valoresPendentes: number[] = [];

  ngOnChanges(): void {
    const dados = this.analytics.montarGraficoBarras(
      this.transacoes,
      this.filtroTodoPeriodo,
      this.anoMes,
    );
    const categorias = dados.map((d) => d.label);
    const valores = dados.map((d) => d.valor);
    this.categoriasPendentes = categorias;
    this.valoresPendentes = valores;
    if (this.filtroTodoPeriodo) {
      this.titulo = 'Evolução Mensal (Total Gasto)';
    } else {
      const [ano, mes] = (this.anoMes || '').split('-');
      const data = new Date(Number(ano), Number(mes) - 1, 1);
      const formatado = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      this.titulo = `Fluxo Diário (${formatado})`;
    }
    if (this.chartRef) {
      this.ngZone.runOutsideAngular(() => {
        this.chartRef?.updateSeries([{ name: 'Despesas', data: valores }], true);
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
        this.chartRef?.updateSeries([{ name: 'Despesas', data: valores }], true);
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
