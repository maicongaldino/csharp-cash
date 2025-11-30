import { Injectable, signal, computed } from '@angular/core';
import { ServicoDexie } from './servico-dexie.service';
import {
  ConfiguracoesDeBackup,
  IntervaloDeBackup,
  ModoDeBackup,
} from '../../shared/models/configuracoes-de-backup.model';

@Injectable({ providedIn: 'root' })
export class ServicoDeConfiguracoesDeBackup {
  private readonly _config = signal<ConfiguracoesDeBackup>({
    id: 'config',
    intervalo: 'A cada 7 dias',
    modo: 'Perguntar antes de fazer',
    backupAtivo: false,
  });

  readonly configuracoes = computed(() => this._config());

  constructor(private readonly dexie: ServicoDexie) {
    this.dexie.obterConfiguracoes().then((c) => {
      if (c) this._config.set(c);
      else this.dexie.salvarConfiguracoes(this._config());
    });
  }

  async atualizarIntervalo(intervalo: IntervaloDeBackup) {
    const novo = { ...this._config(), intervalo };
    this._config.set(novo);
    await this.dexie.salvarConfiguracoes(novo);
  }

  async atualizarModo(modo: ModoDeBackup) {
    const novo = { ...this._config(), modo };
    this._config.set(novo);
    await this.dexie.salvarConfiguracoes(novo);
  }

  async atualizarBackupAtivo(backupAtivo: boolean) {
    const novo = { ...this._config(), backupAtivo };
    this._config.set(novo);
    await this.dexie.salvarConfiguracoes(novo);
  }

  async atualizarArquivoDestinoNome(nome: string) {
    const novo = { ...this._config(), arquivoDestinoNome: nome };
    this._config.set(novo);
    await this.dexie.salvarConfiguracoes(novo);
  }

  async atualizarArquivoRestauracaoNome(nome: string) {
    const novo = { ...this._config(), arquivoRestauracaoNome: nome };
    this._config.set(novo);
    await this.dexie.salvarConfiguracoes(novo);
  }

  diasDoIntervalo(): number {
    const i = this._config().intervalo;
    if (i === 'Nunca') return 0;
    if (i === 'A cada 1 dia') return 1;
    if (i === 'A cada 7 dias') return 7;
    return 30;
  }

  eAutomatico(): boolean {
    return this._config().modo === 'Automático (sem perguntar)';
  }
}
