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
import { ApexChart, ApexDataLabels, ApexLegend, ApexResponsive, ApexTooltip } from 'ng-apexcharts';
import { CORES_APEX, TOOLTIP_APEX } from '../../../../core/utils/graficos.util';
import { ServicoDeAnalytics } from '../../../../core/services/servico-de-analytics.service';
import { Transacao } from '../../../../shared/models/transacao.model';

@Component({
  selector: 'app-grafico-donut-apex',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bg-slate-900/80 border border-white/5 p-6 rounded-3xl min-h-[320px] sm:min-h-[360px]"
    >
      <h3 class="text-lg font-bold mb-4 text-white">{{ titulo }}</h3>
      <apx-chart
        #chartCmp
        [chart]="chart"
        [series]="series"
        [labels]="labels"
        [dataLabels]="dataLabels"
        [legend]="legend"
        [tooltip]="tooltip"
        [colors]="colors"
        [responsive]="responsive"
      ></apx-chart>
    </div>
  `,
})
export class GraficoDonutApexComponent implements OnChanges {
  @Input() transacoes: Transacao[] = [];
  @Input() topN = 8;
  @Input() titulo = 'Gastos por Categoria';

  chart: ApexChart = { type: 'donut', height: 260, toolbar: { show: false } };
  series: number[] = [];
  labels: string[] = [];
  dataLabels: ApexDataLabels = { enabled: false };
  legend: ApexLegend = { position: 'bottom' };
  tooltip: ApexTooltip = TOOLTIP_APEX;
  colors: string[] = CORES_APEX;
  responsive: ApexResponsive[] = [
    { breakpoint: 640, options: { chart: { height: 220 }, legend: { position: 'bottom' } } },
  ];

  @ViewChild('chartCmp') chartRef?: ChartComponent;

  constructor(
    private readonly ngZone: NgZone,
    private readonly analytics: ServicoDeAnalytics,
  ) {}

  ngOnChanges(): void {
    const dados = this.analytics.gastosPorCategoria(this.transacoes, this.topN);
    const nextSeries = dados.map((d) => d.valor);
    const nextLabels = dados.map((d) => d.label);
    this.ngZone.runOutsideAngular(() => {
      this.chartRef?.updateSeries(nextSeries, true);
      this.chartRef?.updateOptions({ labels: nextLabels }, true, true);
    });
  }
}
