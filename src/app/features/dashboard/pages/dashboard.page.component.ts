import { Component, computed, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ServicoDeAvisos } from '../../../core/services/servico-de-avisos.service';
import { NovoGastoModalComponent } from '../components/novo-gasto-modal/novo-gasto-modal.component';
import { NovoGastoPayload } from '../models/novo-gasto-payload.model';
import { InputDataComponent } from '../../../shared/components/input-data/input-data.component';
import { BotaoComponent } from '../../../design-system/components/botao/botao.component';
import { HostListener } from '@angular/core';
import { ConfigService } from '../../../core/services/config.service';
import { FixosService } from '../../../core/services/fixos.service';
import { TransacoesService } from '../../../core/services/transacoes.service';
import { CarteiraService } from '../../../core/services/carteira.service';
import { getIconeCategoria } from '../../../shared/utils/formatacao.util';
import { obterAnoMesLocal } from '../../../shared/utils/data.util';
import { TipoBotaoEnum, TamanhoBotaoEnum } from '../../../design-system/models/enums.model';
import { GraficoFluxoDiarioApexComponent } from '../components/grafico-fluxo-diario-apex/grafico-fluxo-diario-apex.component';
import { GraficoSaldoAcumuladoApexComponent } from '../components/grafico-saldo-acumulado-apex/grafico-saldo-acumulado-apex.component';
import { GraficoDonutApexComponent } from '../components/grafico-donut-apex/grafico-donut-apex.component';
import { ObjetivoEconomiaCardComponent } from '../components/objetivo-economia-card/objetivo-economia-card.component';
import { TopCategoriasApexComponent } from '../components/top-categorias-apex/top-categorias-apex.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NovoGastoModalComponent,
    InputDataComponent,
    BotaoComponent,
    GraficoFluxoDiarioApexComponent,
    GraficoSaldoAcumuladoApexComponent,
    GraficoDonutApexComponent,
    ObjetivoEconomiaCardComponent,
    TopCategoriasApexComponent,
  ],
  templateUrl: './dashboard.page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  readonly config = inject(ConfigService);
  private readonly fixos = inject(FixosService);
  private readonly transacoes = inject(TransacoesService);
  private readonly carteira = inject(CarteiraService);
  private readonly toast = inject(ServicoDeAvisos);

  readonly filtroTodoPeriodo = signal(false);
  readonly filtroMes = signal<string>(obterAnoMesLocal());
  private readonly fb = inject(FormBuilder);
  readonly filtroForm = this.fb.group({
    mes: [obterAnoMesLocal()],
  });

  readonly novoGastoAberto = signal(false);
  readonly TipoBotaoEnum = TipoBotaoEnum;
  readonly TamanhoBotaoEnum = TamanhoBotaoEnum;

  constructor() {
    this.filtroForm
      .get('mes')!
      .valueChanges.subscribe((v) => this.filtroMes.set(v ?? obterAnoMesLocal()));
  }

  abrirNovoGasto() {
    this.novoGastoAberto.set(true);
  }
  fecharNovoGasto() {
    this.novoGastoAberto.set(false);
  }
  onSubmitNovoGasto(payload: NovoGastoPayload) {
    this.transacoes.adicionar(payload);
    this.toast.sucesso('Gasto adicionado');
    this.novoGastoAberto.set(false);
  }

  readonly mesFormatado = computed(() => {
    const [ano, mes] = this.filtroMes().split('-');
    const data = new Date(Number(ano), Number(mes) - 1, 1);
    return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  });

  readonly tituloFluxoDiario = computed(() =>
    this.filtroTodoPeriodo()
      ? 'Evolução Mensal (Total Gasto)'
      : `Fluxo Diário (${this.mesFormatado()})`,
  );

  readonly totalFixos = computed(() => this.fixos.totalNoMes(this.filtroMes()));
  readonly porcentagemRendaComprometida = computed(() => {
    const renda = this.config.config().rendaMensal || 1;
    return (this.totalFixos() / renda) * 100;
  });

  readonly transacoesFiltradas = computed(() => {
    const todas = this.transacoes.transacoes();
    if (this.filtroTodoPeriodo()) return todas;
    const anoMes = this.filtroMes();
    return todas.filter((t) => t.data.startsWith(anoMes));
  });

  readonly totalGastosDisplay = computed(() => {
    return this.transacoesFiltradas().reduce((acc, t) => acc + t.valor, 0);
  });

  readonly porcentagemGastoRenda = computed(() => {
    const renda = this.config.config().rendaMensal || 1;
    return Math.min(100, (this.totalGastosDisplay() / renda) * 100);
  });

  readonly valorParaGuardar = computed(() => {
    const configuracaoAtual = this.config.config();
    return (configuracaoAtual.rendaMensal * configuracaoAtual.metaEconomiaPorcentagem) / 100;
  });

  readonly porcentagemConquista = computed(() => {
    const configuracaoAtual = this.config.config();
    const alvo = configuracaoAtual.objetivoFinanceiro || 1;
    return Math.min(100, (configuracaoAtual.dinheiroGuardadoAtual / alvo) * 100);
  });

  readonly categoriasDisponiveis = computed(() => {
    const set = new Set<string>();
    for (const t of this.transacoes.transacoes()) set.add(t.categoria);
    for (const f of this.fixos.fixos()) set.add(f.categoria);
    return Array.from(set.values());
  });

  @HostListener('document:keydown', ['$event'])
  handleAtalho(e: KeyboardEvent) {
    if (e.shiftKey && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      if (!this.novoGastoAberto()) this.abrirNovoGasto();
    }
  }

  getIconeCategoria = getIconeCategoria;

  readonly estadoVazio = computed(() => {
    return (
      this.transacoes.transacoes().length === 0 &&
      this.fixos.fixos().length === 0 &&
      this.carteira.cartoes().length === 0
    );
  });
}
