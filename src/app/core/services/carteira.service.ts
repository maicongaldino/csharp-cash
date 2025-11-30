import { Injectable, signal, computed } from '@angular/core';
import { Cartao } from '../../shared/models/cartao.model';

@Injectable({ providedIn: 'root' })
export class CarteiraService {
  private readonly _cartoes = signal<Cartao[]>([]);

  readonly cartoes = computed(() => this._cartoes());

  adicionar(cartao: Omit<Cartao, 'id'>) {
    const id = crypto.randomUUID();
    this._cartoes.update((arr) => [{ ...cartao, id }, ...arr]);
  }

  remover(id: string) {
    this._cartoes.update((arr) => arr.filter((c) => c.id !== id));
  }

  getNomeMetodo(metodo: string): string {
    if (metodo === 'DINHEIRO') return 'Dinheiro';
    if (metodo === 'PIX') return 'PIX';
    const c = this._cartoes().find((x) => x.id === metodo);
    return c ? c.nome : 'Cartão';
  }

  set(lista: Cartao[]) {
    this._cartoes.set(lista);
  }

  atualizar(id: string, parcial: Partial<Omit<Cartao, 'id'>>) {
    this._cartoes.update((arr) =>
      arr.map((c) => (c.id === id ? { ...c, ...parcial, id: c.id } : c)),
    );
  }
}
