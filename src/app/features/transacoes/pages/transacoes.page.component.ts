import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { TransacoesService } from '../../../core/services/transacoes.service';
import { CarteiraService } from '../../../core/services/carteira.service';
import { getIconeCategoria } from '../../../shared/utils/formatacao.util';
import { obterDataLocalISO, obterAnoMesLocal } from '../../../shared/utils/data.util';
import { CampoFormularioComponent } from '../../../shared/components/campo-formulario/campo-formulario.component';
import { InputMoedaComponent } from '../../../shared/components/input-moeda/input-moeda.component';
import { CategoriaSelectComponent } from '../../../shared/components/categoria-select/categoria-select.component';
import { PagamentoSelectComponent } from '../../../shared/components/pagamento-select/pagamento-select.component';
import { InputDataComponent } from '../../../shared/components/input-data/input-data.component';
import { BotaoComponent } from '../../../design-system/components/botao/botao.component';
import { criarFormularioTransacao } from '../forms/transacoes.form';
import { TipoBotaoEnum, TamanhoBotaoEnum } from '../../../design-system/models/enums.model';
import { Transacao } from '../../../shared/models/transacao.model';

@Component({
  selector: 'app-transacoes-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CampoFormularioComponent,
    InputMoedaComponent,
    CategoriaSelectComponent,
    PagamentoSelectComponent,
    InputDataComponent,
    BotaoComponent,
  ],
  templateUrl: './transacoes.page.component.html',
})
export class TransacoesPageComponent {
  private readonly transacoes = inject(TransacoesService);
  private readonly carteira = inject(CarteiraService);
  private readonly fb = inject(FormBuilder);

  readonly filtroTodoPeriodo = signal(false);
  readonly filtroMes = signal<string>(obterAnoMesLocal());
  readonly filtroForm = this.fb.group({ mes: [obterAnoMesLocal()] });

  constructor() {
    this.filtroForm
      .get('mes')!
      .valueChanges.subscribe((v) => this.filtroMes.set(v ?? obterAnoMesLocal()));
  }

  readonly transacaoForm = criarFormularioTransacao(this.fb);
  readonly TipoBotaoEnum = TipoBotaoEnum;
  readonly TamanhoBotaoEnum = TamanhoBotaoEnum;
  readonly editandoId = signal<string | null>(null);

  readonly transacoesFiltradas = computed(() => {
    const todas = this.transacoes.transacoes();
    if (this.filtroTodoPeriodo()) return todas;
    const anoMes = this.filtroMes();
    return todas.filter((t) => t.data.startsWith(anoMes));
  });

  adicionarTransacao(event: Event) {
    event.preventDefault();
    if (this.transacaoForm.invalid) {
      this.transacaoForm.markAllAsTouched();
      return;
    }
    const valoresFormulario = this.transacaoForm.getRawValue();
    const idAtual = this.editandoId();
    if (idAtual) {
      this.transacoes.atualizar(idAtual, {
        descricao: (valoresFormulario.descricao ?? '').trim(),
        valor: Number(valoresFormulario.valor ?? 0),
        data: valoresFormulario.data ?? obterDataLocalISO(),
        categoria: (valoresFormulario.categoria ?? 'Outros').trim(),
        metodoPagamento: valoresFormulario.metodoPagamento ?? 'DINHEIRO',
      });
      this.editandoId.set(null);
    } else {
      this.transacoes.adicionar({
        descricao: (valoresFormulario.descricao ?? '').trim(),
        valor: Number(valoresFormulario.valor ?? 0),
        data: valoresFormulario.data ?? obterDataLocalISO(),
        categoria: (valoresFormulario.categoria ?? 'Outros').trim(),
        metodoPagamento: valoresFormulario.metodoPagamento ?? 'DINHEIRO',
      });
    }
    this.transacaoForm.reset({
      descricao: '',
      valor: null,
      data: obterDataLocalISO(),
      categoria: 'Outros',
      metodoPagamento: 'DINHEIRO',
    });
  }

  removerTransacao(id: string) {
    this.transacoes.remover(id);
  }

  cartoes() {
    return this.carteira.cartoes();
  }

  getIconeCategoria = getIconeCategoria;

  getNomeMetodo(m: string) {
    return this.carteira.getNomeMetodo(m);
  }
  iniciarEdicaoTransacao(t: Transacao) {
    this.editandoId.set(t.id);
    this.transacaoForm.patchValue({
      descricao: t.descricao,
      valor: t.valor,
      data: t.data,
      categoria: t.categoria,
      metodoPagamento: t.metodoPagamento,
    });
  }
  cancelarEdicaoTransacao() {
    this.editandoId.set(null);
    this.transacaoForm.reset({
      descricao: '',
      valor: null,
      data: obterDataLocalISO(),
      categoria: 'Outros',
      metodoPagamento: 'DINHEIRO',
    });
  }
  exportarCSV() {
    const linhas = [
      'id,descricao,valor,data,tipo,categoria,metodoPagamento,origemFixoId',
      ...this.transacoesFiltradas().map((t) =>
        [
          t.id,
          JSON.stringify(t.descricao),
          t.valor.toFixed(2),
          t.data,
          t.tipo,
          JSON.stringify(t.categoria),
          JSON.stringify(t.metodoPagamento),
          t.origemFixoId ?? '',
        ].join(','),
      ),
    ];
    const blob = new Blob([linhas.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transacoes-${this.filtroTodoPeriodo() ? 'historico' : this.filtroMes()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
