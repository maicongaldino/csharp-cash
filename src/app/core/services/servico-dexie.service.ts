import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Transacao } from '../../shared/models/transacao.model';
import { GastoFixo } from '../../shared/models/gasto-fixo.model';
import { Cartao } from '../../shared/models/cartao.model';
import { ConfigUsuario } from '../../shared/models/config-usuario.model';
import { ConfiguracoesDeBackup } from '../../shared/models/configuracoes-de-backup.model';

interface RegistroDataBackup {
  id: string;
  dataIso: string;
}

class BancoDeDadosLocal extends Dexie {
  transacoes!: Table<Transacao, string>;
  fixos!: Table<GastoFixo, string>;
  cartoes!: Table<Cartao, string>;
  config!: Table<ConfigUsuario & { id: string }, string>;
  backup_config!: Table<ConfiguracoesDeBackup, string>;
  backup_hist!: Table<RegistroDataBackup, string>;

  constructor() {
    super('BancoDeDadosLocal');
    this.version(1).stores({
      transacoes: 'id',
      fixos: 'id',
      cartoes: 'id',
      config: 'id',
      backup_config: 'id',
      backup_hist: 'id',
    });
  }
}

@Injectable({ providedIn: 'root' })
export class ServicoDexie {
  private readonly db = new BancoDeDadosLocal();

  async exportarDadosComoJson(): Promise<string> {
    const [transacoes, fixos, cartoes, config] = await Promise.all([
      this.db.transacoes.toArray(),
      this.db.fixos.toArray(),
      this.db.cartoes.toArray(),
      this.db.config.get('config'),
    ]);
    const payload = {
      transacoes,
      fixos,
      cartoes,
      config: config ?? {
        id: 'config',
        rendaMensal: 0,
        metaEconomiaPorcentagem: 10,
        dinheiroGuardadoAtual: 0,
        objetivoFinanceiro: 0,
      },
    };
    return JSON.stringify(payload);
  }

  async obterEstado(): Promise<{
    transacoes: Transacao[];
    fixos: GastoFixo[];
    cartoes: Cartao[];
    config: ConfigUsuario & { id: string };
  }> {
    const [transacoes, fixos, cartoes, config] = await Promise.all([
      this.db.transacoes.toArray(),
      this.db.fixos.toArray(),
      this.db.cartoes.toArray(),
      this.db.config.get('config'),
    ]);
    return {
      transacoes,
      fixos,
      cartoes,
      config: (config ?? {
        id: 'config',
        rendaMensal: 0,
        metaEconomiaPorcentagem: 10,
        dinheiroGuardadoAtual: 0,
        objetivoFinanceiro: 0,
      }) as ConfigUsuario & { id: string },
    };
  }

  async salvarEstado(dados: {
    transacoes: Transacao[];
    fixos: GastoFixo[];
    cartoes: Cartao[];
    config: ConfigUsuario;
  }): Promise<void> {
    await this.db.transaction(
      'rw',
      [this.db.transacoes, this.db.fixos, this.db.cartoes, this.db.config],
      async () => {
        await this.db.transacoes.clear();
        await this.db.fixos.clear();
        await this.db.cartoes.clear();
        await this.db.config.clear();
        if (dados.transacoes?.length) await this.db.transacoes.bulkAdd(dados.transacoes);
        if (dados.fixos?.length) await this.db.fixos.bulkAdd(dados.fixos);
        if (dados.cartoes?.length) await this.db.cartoes.bulkAdd(dados.cartoes);
        await this.db.config.put({ id: 'config', ...dados.config });
      },
    );
  }

  async importarDadosDoJson(json: string): Promise<void> {
    const dados = JSON.parse(json) as {
      transacoes: Transacao[];
      fixos: GastoFixo[];
      cartoes: Cartao[];
      config: ConfigUsuario;
    };
    await this.db.transaction(
      'rw',
      [this.db.transacoes, this.db.fixos, this.db.cartoes, this.db.config],
      async () => {
        await this.db.transacoes.clear();
        await this.db.fixos.clear();
        await this.db.cartoes.clear();
        await this.db.config.clear();

        if (dados.transacoes?.length) await this.db.transacoes.bulkAdd(dados.transacoes);
        if (dados.fixos?.length) await this.db.fixos.bulkAdd(dados.fixos);
        if (dados.cartoes?.length) await this.db.cartoes.bulkAdd(dados.cartoes);
        await this.db.config.put({ id: 'config', ...dados.config });
      },
    );
  }

  async obterDataDoUltimoBackup(): Promise<Date | null> {
    const reg = await this.db.backup_hist.get('ultimo');
    return reg ? new Date(reg.dataIso) : null;
  }

  async atualizarDataDoBackup(data: Date): Promise<void> {
    await this.db.backup_hist.put({ id: 'ultimo', dataIso: data.toISOString() });
  }

  async obterConfiguracoes(): Promise<ConfiguracoesDeBackup | null> {
    return (await this.db.backup_config.get('config')) ?? null;
  }

  async salvarConfiguracoes(valor: ConfiguracoesDeBackup): Promise<void> {
    await this.db.backup_config.put(valor);
  }
}
