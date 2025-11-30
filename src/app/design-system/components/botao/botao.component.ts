import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigBotao, TipoBotao, TamanhoBotao } from '../../models/config-botao.model';

@Component({
  selector: 'app-botao',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [attr.type]="tipoHtml"
      class="inline-flex items-center justify-center font-semibold transition rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
      [class]="classes()"
      [disabled]="desabilitado || carregando"
      (click)="aoClicar.emit()"
    >
      <span
        *ngIf="carregando"
        class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent"
      ></span>
      <ng-content />
    </button>
  `,
})
export class BotaoComponent implements ConfigBotao {
  @Input() tipo: TipoBotao = 'primario';
  @Input() tamanho: TamanhoBotao = 'medio';
  @Input() desabilitado = false;
  @Input() carregando = false;
  @Input() classeExtra = '';
  @Input() cheio = false;
  @Input() tipoHtml: 'button' | 'submit' = 'button';
  @Output() aoClicar = new EventEmitter<void>();

  readonly classes = computed(() => {
    const tTam = String(this.tamanho);
    const baseTamanho =
      tTam === 'pequeno'
        ? 'px-3 py-1 text-xs'
        : tTam === 'grande'
          ? 'px-6 py-3 text-base'
          : 'px-4 py-2 text-sm';

    const tiposMap: Record<string, string> = {
      primario:
        'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-900/20 transition transform active:scale-95',
      secundario: 'border border-purple-500/40 text-purple-300 hover:bg-purple-500/10',
      perigo: 'bg-pink-600 hover:bg-pink-500 text-white shadow-lg',
      texto: 'text-purple-300 hover:text-purple-200 bg-transparent',
    };
    const tTipo = String(this.tipo);
    const estilos = tiposMap[tTipo] || tiposMap['primario'];
    const largura = this.cheio ? ' w-full' : '';
    return baseTamanho + ' ' + estilos + largura + (this.classeExtra ? ' ' + this.classeExtra : '');
  });
}
