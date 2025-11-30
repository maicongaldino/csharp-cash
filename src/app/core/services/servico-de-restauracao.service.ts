import { Injectable } from '@angular/core';
import { ServicoDexie } from './servico-dexie.service';
import { Transacao } from '../../shared/models/transacao.model';
import { GastoFixo } from '../../shared/models/gasto-fixo.model';
import { Cartao } from '../../shared/models/cartao.model';
import { ConfigUsuario } from '../../shared/models/config-usuario.model';

@Injectable({ providedIn: 'root' })
export class ServicoDeRestauracao {
  constructor(private readonly dexie: ServicoDexie) {}

  async restaurarDeArquivo(file: File): Promise<boolean> {
    const texto = await file.text();
    let dados: unknown;
    try {
      dados = JSON.parse(texto);
    } catch {
      throw new Error('Arquivo inválido: JSON malformado');
    }
    if (!this.ePayloadDeBackup(dados)) {
      throw new Error('Arquivo inválido: estrutura inesperada');
    }
    await this.dexie.importarDadosDoJson(texto);
    return true;
  }

  private ePayloadDeBackup(x: unknown): x is {
    transacoes: Transacao[];
    fixos: GastoFixo[];
    cartoes: Cartao[];
    config: ConfigUsuario;
  } {
    if (typeof x !== 'object' || x === null) return false;
    const y = x as {
      transacoes?: unknown;
      fixos?: unknown;
      cartoes?: unknown;
      config?: unknown;
    };
    return (
      Array.isArray(y.transacoes) &&
      Array.isArray(y.fixos) &&
      Array.isArray(y.cartoes) &&
      typeof y.config === 'object' &&
      y.config !== null
    );
  }
}
