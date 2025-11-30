import { Injectable, signal, computed } from '@angular/core';
import { ConfigUsuario } from '../../shared/models/config-usuario.model';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly _config = signal<ConfigUsuario>({
    rendaMensal: 0,
    metaEconomiaPorcentagem: 10,
    dinheiroGuardadoAtual: 0,
    objetivoFinanceiro: 0,
  });

  readonly config = computed(() => this._config());

  atualizar(valor: Partial<ConfigUsuario>) {
    this._config.update((c) => ({ ...c, ...valor }));
  }

  set(valor: ConfigUsuario) {
    this._config.set(valor);
  }
}
