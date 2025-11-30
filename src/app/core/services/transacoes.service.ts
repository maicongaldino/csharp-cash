import { Injectable, signal, computed } from '@angular/core';
import { Transacao } from '../../shared/models/transacao.model';

@Injectable({ providedIn: 'root' })
export class TransacoesService {
  private readonly _transacoes = signal<Transacao[]>([]);

  readonly transacoes = computed(() => this._transacoes());

  adicionar(transacao: Omit<Transacao, 'id' | 'tipo'>) {
    const id = crypto.randomUUID();
    const nova: Transacao = { ...transacao, id, tipo: 'despesa' };
    this._transacoes.update((arr) => [nova, ...arr]);
  }

  remover(id: string) {
    this._transacoes.update((arr) => arr.filter((t) => t.id !== id));
  }

  set(lista: Transacao[]) {
    this._transacoes.set(lista);
  }

  atualizar(id: string, parcial: Partial<Omit<Transacao, 'id'>>) {
    this._transacoes.update((arr) =>
      arr.map((t) => (t.id === id ? { ...t, ...parcial, id: t.id } : t)),
    );
  }
}
