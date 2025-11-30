import { Injectable, signal, computed } from '@angular/core';
import { GastoFixo } from '../../shared/models/gasto-fixo.model';
import { Transacao } from '../../shared/models/transacao.model';
import { GastoFixoStatus } from '../models/gasto-fixo-status.model';

@Injectable({ providedIn: 'root' })
export class FixosService {
  private readonly _fixos = signal<GastoFixo[]>([]);

  readonly fixos = computed(() => this._fixos());

  adicionar(fixo: Omit<GastoFixo, 'id'>) {
    const id = crypto.randomUUID();
    this._fixos.update((arr) => [{ ...fixo, id }, ...arr]);
  }

  remover(id: string) {
    this._fixos.update((arr) => arr.filter((f) => f.id !== id));
  }

  total(): number {
    return this._fixos().reduce((acc, f) => acc + f.valor, 0);
  }

  totalNoMes(anoMes: string): number {
    return this._fixos()
      .filter((f) => this.isAtivoNoMes(f, anoMes))
      .reduce((acc, f) => acc + f.valor, 0);
  }

  comStatus(transacoesMes: Transacao[], anoMes: string): GastoFixoStatus[] {
    const pagosPorId = new Set(
      transacoesMes.filter((t) => t.origemFixoId).map((t) => t.origemFixoId as string),
    );
    return this._fixos()
      .filter((f) => this.isAtivoNoMes(f, anoMes))
      .map((f) => ({ ...f, pagoEsteMes: pagosPorId.has(f.id) }));
  }

  set(lista: GastoFixo[]) {
    this._fixos.set(lista);
  }

  private isAtivoNoMes(f: GastoFixo, anoMes: string): boolean {
    if (!f.vigenteAte) return true;
    return anoMes <= f.vigenteAte;
  }

  atualizar(id: string, parcial: Partial<Omit<GastoFixo, 'id'>>) {
    this._fixos.update((arr) => arr.map((f) => (f.id === id ? { ...f, ...parcial, id: f.id } : f)));
  }
}
