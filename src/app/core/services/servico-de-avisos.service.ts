import { Injectable, signal, computed } from '@angular/core';

export type TipoAviso = 'sucesso' | 'erro' | 'info';

export interface MensagemAviso {
  id: string;
  tipo: TipoAviso;
  texto: string;
}

@Injectable({ providedIn: 'root' })
export class ServicoDeAvisos {
  private readonly _mensagens = signal<MensagemAviso[]>([]);
  readonly mensagens = computed(() => this._mensagens());

  mostrar(tipo: TipoAviso, texto: string, timeoutMs = 3000) {
    const id = crypto.randomUUID();
    const msg: MensagemAviso = { id, tipo, texto };
    this._mensagens.update((arr) => [...arr, msg]);
    setTimeout(() => this.remover(id), timeoutMs);
  }

  remover(id: string) {
    this._mensagens.update((arr) => arr.filter((m) => m.id !== id));
  }

  sucesso(texto: string) {
    this.mostrar('sucesso', texto);
  }
  erro(texto: string) {
    this.mostrar('erro', texto, 5000);
  }
  info(texto: string) {
    this.mostrar('info', texto);
  }
}
