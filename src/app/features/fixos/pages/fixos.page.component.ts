import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { FixosService } from '../../../core/services/fixos.service';
import { TransacoesService } from '../../../core/services/transacoes.service';
import { CarteiraService } from '../../../core/services/carteira.service';
import { GastoFixo } from '../../../shared/models/gasto-fixo.model';
import { obterAnoMesLocal } from '../../../shared/utils/data.util';
import { CampoFormularioComponent } from '../../../shared/components/campo-formulario/campo-formulario.component';
import { InputMoedaComponent } from '../../../shared/components/input-moeda/input-moeda.component';
import { CategoriaSelectComponent } from '../../../shared/components/categoria-select/categoria-select.component';
import { PagamentoSelectComponent } from '../../../shared/components/pagamento-select/pagamento-select.component';
import { InputDataComponent } from '../../../shared/components/input-data/input-data.component';
import { criarFormularioFixos } from '../forms/fixos.form';
import { SomenteNumerosDirective } from '../../../shared/directives/somente-numeros.directive';
import { BotaoComponent } from '../../../design-system/components/botao/botao.component';
import { TipoBotaoEnum, TamanhoBotaoEnum } from '../../../design-system/models/enums.model';

@Component({
  selector: 'app-fixos-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CampoFormularioComponent,
    InputMoedaComponent,
    CategoriaSelectComponent,
    PagamentoSelectComponent,
    InputDataComponent,
    SomenteNumerosDirective,
    BotaoComponent,
  ],
  templateUrl: './fixos.page.component.html',
})
export class FixosPageComponent {
  private readonly fixos = inject(FixosService);
  private readonly transacoes = inject(TransacoesService);
  private readonly carteira = inject(CarteiraService);
  private readonly fb = inject(FormBuilder);

  readonly fixoForm = criarFormularioFixos(this.fb);
  readonly editandoId = signal<string | null>(null);

  readonly anoMesAtual = signal<string>(obterAnoMesLocal());
  readonly filtroForm = this.fb.group({ mes: [obterAnoMesLocal()] });
  readonly TipoBotaoEnum = TipoBotaoEnum;
  readonly TamanhoBotaoEnum = TamanhoBotaoEnum;

  constructor() {
    this.filtroForm
      .get('mes')!
      .valueChanges.subscribe((v) => this.anoMesAtual.set(v ?? obterAnoMesLocal()));
  }

  readonly fixosComStatus = computed(() => {
    const transacoesMes = this.transacoes
      .transacoes()
      .filter((t) => t.data.startsWith(this.anoMesAtual()));
    return this.fixos.comStatus(transacoesMes, this.anoMesAtual());
  });

  adicionarGastoFixo(event: Event) {
    event.preventDefault();
    if (this.fixoForm.invalid) {
      this.fixoForm.markAllAsTouched();
      return;
    }
    const valor = this.fixoForm.getRawValue();
    const idAtual = this.editandoId();
    if (idAtual) {
      this.fixos.atualizar(idAtual, {
        descricao: (valor.descricao ?? '').trim(),
        valor: Number(valor.valor ?? 0),
        diaVencimento: Number(valor.diaVencimento ?? 1),
        categoria: (valor.categoria ?? 'Outros').trim(),
        metodoPagamento: valor.metodoPagamento ?? 'DINHEIRO',
        vigenteAte: valor.vigenteAte ?? undefined,
      });
      this.editandoId.set(null);
    } else {
      this.fixos.adicionar({
        descricao: (valor.descricao ?? '').trim(),
        valor: Number(valor.valor ?? 0),
        diaVencimento: Number(valor.diaVencimento ?? 1),
        categoria: (valor.categoria ?? 'Outros').trim(),
        metodoPagamento: valor.metodoPagamento ?? 'DINHEIRO',
        vigenteAte: valor.vigenteAte ?? undefined,
      });
    }
    this.fixoForm.reset({
      descricao: '',
      valor: null,
      diaVencimento: 1,
      categoria: 'Outros',
      metodoPagamento: 'DINHEIRO',
      vigenteAte: null,
    });
  }

  removerGastoFixo(id: string) {
    this.fixos.remover(id);
  }

  lancarGastoFixoNoHistorico(fixo: GastoFixo) {
    const data = `${this.anoMesAtual()}-${String(Math.min(28, fixo.diaVencimento)).padStart(2, '0')}`;
    this.transacoes.adicionar({
      descricao: fixo.descricao,
      valor: fixo.valor,
      data,
      categoria: fixo.categoria,
      metodoPagamento: fixo.metodoPagamento,
      origemFixoId: fixo.id,
    });
  }

  cartoes() {
    return this.carteira.cartoes();
  }

  getNomeMetodo(m: string) {
    return this.carteira.getNomeMetodo(m);
  }

  totalFixos() {
    return this.fixos.totalNoMes(this.anoMesAtual());
  }

  iniciarEdicaoFixo(fixo: GastoFixo) {
    this.editandoId.set(fixo.id);
    this.fixoForm.patchValue({
      descricao: fixo.descricao,
      valor: fixo.valor,
      diaVencimento: fixo.diaVencimento,
      categoria: fixo.categoria,
      metodoPagamento: fixo.metodoPagamento,
      vigenteAte: fixo.vigenteAte ?? null,
    });
  }

  cancelarEdicaoFixo() {
    this.editandoId.set(null);
    this.fixoForm.reset({
      descricao: '',
      valor: null,
      diaVencimento: 1,
      categoria: 'Outros',
      metodoPagamento: 'DINHEIRO',
      vigenteAte: null,
    });
  }
}
