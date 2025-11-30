import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-objetivo-economia-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/5 p-6 rounded-3xl min-h-[320px] sm:min-h-[360px]"
    >
      <h3 class="text-lg font-bold mb-4 text-white">Objetivo de Economia</h3>
      <div class="flex justify-between text-sm mb-1 text-slate-400">
        <span>Meta Mensal ({{ metaEconomiaPorcentagem }}%)</span>
        <span class="text-white font-mono">{{ valorParaGuardar | currency: 'BRL' }}</span>
      </div>
      <div class="mt-6 pt-6 border-t border-white/5">
        <div class="flex justify-between items-end mb-2">
          <span class="text-sm text-slate-400">Total Guardado</span>
          <span class="text-2xl font-bold text-pink-400">
            {{ dinheiroGuardadoAtual | currency: 'BRL' }}
          </span>
        </div>
        <div class="flex justify-between items-end">
          <span class="text-xs text-slate-500">
            Objetivo: {{ objetivoFinanceiro | currency: 'BRL' }}
          </span>
          <span class="text-xs text-pink-400 font-bold">
            {{ porcentagemConquista | number: '1.0-1' }}%
          </span>
        </div>
        <div
          class="w-full bg-slate-950 h-3 mt-2 rounded-full overflow-hidden border border-white/5"
        >
          <div
            class="h-full bg-gradient-to-r from-pink-600 to-purple-600 shadow-[0_0_15px_rgba(236,72,153,0.5)] transition-all duration-1000"
            [style.width.%]="porcentagemConquista > 100 ? 100 : porcentagemConquista"
          ></div>
        </div>
        <p class="text-xs text-center mt-3 text-slate-400">
          Falta
          <span class="text-white">
            {{ objetivoFinanceiro - dinheiroGuardadoAtual | currency: 'BRL' }}
          </span>
          para seu sonho!
        </p>
      </div>
    </div>
  `,
})
export class ObjetivoEconomiaCardComponent {
  @Input() metaEconomiaPorcentagem = 0;
  @Input() valorParaGuardar = 0;
  @Input() dinheiroGuardadoAtual = 0;
  @Input() objetivoFinanceiro = 0;
  @Input() porcentagemConquista = 0;
}
