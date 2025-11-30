import { Injectable, computed, effect, signal } from '@angular/core';
import { AppData } from '../../shared/models/app-data.model';
import { ConfigService } from './config.service';
import { TransacoesService } from './transacoes.service';
import { FixosService } from './fixos.service';
import { CarteiraService } from './carteira.service';
import { ServicoDexie } from './servico-dexie.service';
import { PersistenciaService } from './persistencia.service';

@Injectable({ providedIn: 'root' })
export class AppStateService {
  constructor(
    private readonly config: ConfigService,
    private readonly transacoes: TransacoesService,
    private readonly fixos: FixosService,
    private readonly carteira: CarteiraService,
    private readonly dexie: ServicoDexie,
    private readonly persistencia: PersistenciaService,
  ) {
    this.inicializar();
    effect(() => {
      const dados = this.dados();
      this.persistencia.salvarLocal(dados);
      if (!this._inicializado()) return;
      this.dexie.salvarEstado(dados);
      const fh = this.persistencia.manipuladorArquivo();
      if (fh) this.persistencia.salvar(dados);
    });
  }

  private readonly _inicializado = signal(false);

  private async inicializar() {
    try {
      const estado = await this.dexie.obterEstado();
      const temDadosDexie =
        (estado.transacoes?.length ?? 0) > 0 ||
        (estado.fixos?.length ?? 0) > 0 ||
        (estado.cartoes?.length ?? 0) > 0;
      if (temDadosDexie) {
        this.aplicarDados({
          transacoes: estado.transacoes,
          fixos: estado.fixos,
          cartoes: estado.cartoes,
          config: {
            rendaMensal: estado.config.rendaMensal,
            metaEconomiaPorcentagem: estado.config.metaEconomiaPorcentagem,
            dinheiroGuardadoAtual: estado.config.dinheiroGuardadoAtual,
            objetivoFinanceiro: estado.config.objetivoFinanceiro,
          },
        });
      } else {
        const dadosLocais = this.persistencia.carregarLocal();
        if (dadosLocais) this.aplicarDados(dadosLocais);
      }
    } finally {
      this._inicializado.set(true);
    }
  }

  readonly dados = computed<AppData>(() => ({
    transacoes: this.transacoes.transacoes(),
    fixos: this.fixos.fixos(),
    cartoes: this.carteira.cartoes(),
    config: this.config.config(),
  }));

  aplicarDados(dados: AppData) {
    this.transacoes.set(dados.transacoes ?? []);
    this.fixos.set(dados.fixos ?? []);
    this.carteira.set(dados.cartoes ?? []);
    this.config.set(
      dados.config ?? {
        rendaMensal: 0,
        metaEconomiaPorcentagem: 10,
        dinheiroGuardadoAtual: 0,
        objetivoFinanceiro: 0,
      },
    );
  }
}
