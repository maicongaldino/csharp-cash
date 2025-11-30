import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CategoriaSelectComponent } from '../../../../shared/components/categoria-select/categoria-select.component';
import { PagamentoSelectComponent } from '../../../../shared/components/pagamento-select/pagamento-select.component';
import { CampoFormularioComponent } from '../../../../shared/components/campo-formulario/campo-formulario.component';
import { InputMoedaComponent } from '../../../../shared/components/input-moeda/input-moeda.component';
import { InputDataComponent } from '../../../../shared/components/input-data/input-data.component';
import { BotaoComponent } from '../../../../design-system/components/botao/botao.component';
import { criarFormularioNovoGasto } from '../../forms/novo-gasto.form';
import { NovoGastoPayload } from '../../models/novo-gasto-payload.model';
import { criarValidadorAssincronoCategoria } from '../../../../shared/validators/categoria-existe.validator';
import { CarteiraService } from '../../../../core/services/carteira.service';
import { TipoBotaoEnum, TamanhoBotaoEnum } from '../../../../design-system/models/enums.model';

@Component({
  selector: 'app-novo-gasto-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CategoriaSelectComponent,
    PagamentoSelectComponent,
    CampoFormularioComponent,
    InputMoedaComponent,
    InputDataComponent,
    BotaoComponent,
  ],
  templateUrl: './novo-gasto-modal.component.html',
})
export class NovoGastoModalComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly carteira = inject(CarteiraService);

  @Input() open = false;
  @Input() categorias: string[] = [];
  @Input() initialValues: Partial<NovoGastoPayload> | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<NovoGastoPayload>();

  valorExibicao = '';
  idDescricao = 'desc-' + Math.random().toString(36).slice(2, 9);
  idValor = 'val-' + Math.random().toString(36).slice(2, 9);
  idData = 'date-' + Math.random().toString(36).slice(2, 9);
  readonly TipoBotaoEnum = TipoBotaoEnum;
  readonly TamanhoBotaoEnum = TamanhoBotaoEnum;

  readonly form = criarFormularioNovoGasto(this.fb);

  get cartoes() {
    return this.carteira.cartoes();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialValues'] && this.initialValues) {
      this.form.patchValue({
        descricao: this.initialValues.descricao ?? '',
        valor: this.initialValues.valor ?? null,
        data: this.initialValues.data ?? new Date().toISOString().slice(0, 10),
        categoria: this.initialValues.categoria ?? 'Geral',
        metodoPagamento: this.initialValues.metodoPagamento ?? 'DINHEIRO',
      });
      const valorInicial = this.initialValues.valor ?? null;
      this.valorExibicao = valorInicial != null ? this.formatValorNumber(valorInicial) : '';
    } else {
      const valorAtual = this.form.get('valor')!.value as number | null;
      this.valorExibicao = valorAtual != null ? this.formatValorNumber(valorAtual) : '';
    }

    const categoriaCtrl = this.form.get('categoria');
    if (categoriaCtrl) {
      categoriaCtrl.setAsyncValidators(criarValidadorAssincronoCategoria(this.categorias));
      categoriaCtrl.updateValueAndValidity({ emitEvent: false });
    }
  }

  fechar() {
    this.closed.emit();
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { descricao, valor, data, categoria, metodoPagamento } = this.form.getRawValue();
    this.saved.emit({
      descricao: (descricao ?? '').trim(),
      valor: Number(valor ?? 0),
      data: data ?? new Date().toISOString().slice(0, 10),
      categoria: (categoria ?? 'Geral').trim(),
      metodoPagamento: metodoPagamento ?? 'DINHEIRO',
    });
    this.resetar();
  }

  resetar() {
    this.form.reset({
      descricao: '',
      valor: null,
      data: new Date().toISOString().slice(0, 10),
      categoria: 'Geral',
      metodoPagamento: 'DINHEIRO',
    });
    this.valorExibicao = '';
  }

  onValorInput(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const bruto = input.value;
    this.valorExibicao = bruto;
    const valorNormalizado = this.parsePtBrNumber(bruto);
    this.form.get('valor')!.setValue(valorNormalizado);
  }
  formatValor() {
    const num = this.form.get('valor')!.value as number | null;
    this.valorExibicao = num != null ? this.formatValorNumber(num) : '';
  }
  private parsePtBrNumber(v: string): number | null {
    const cleaned = v
      .replace(/[^\d,.-]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  private formatValorNumber(n: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
  }
}
