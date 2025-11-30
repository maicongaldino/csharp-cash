import { Injectable } from '@angular/core';
import { ServicoDexie } from './servico-dexie.service';

@Injectable({ providedIn: 'root' })
export class ServicoDeRestauracao {
  constructor(private readonly dexie: ServicoDexie) {}

  async restaurarDeArquivo(file: File): Promise<boolean> {
    const texto = await file.text();
    await this.dexie.importarDadosDoJson(texto);
    return true;
  }
}
