import { Injectable } from '@angular/core';
import { ServicoDexie } from './servico-dexie.service';
import { ResultadoDeBackup } from '../../shared/models/resultado-de-backup.model';
import { ServicoDeConfiguracoesDeBackup } from './servico-de-configuracoes-de-backup.service';
import { ManipuladorArquivoGravavel } from '../../shared/models/manipulador-arquivo-gravavel.model';

@Injectable({ providedIn: 'root' })
export class ServicoDeBackup {
  constructor(
    private readonly dexie: ServicoDexie,
    private readonly config: ServicoDeConfiguracoesDeBackup,
  ) {}

  private arquivoHandle: ManipuladorArquivoGravavel | null = null;

  async selecionarArquivoDestino(): Promise<void> {
    const picker = (
      window as unknown as {
        showSaveFilePicker?: (options: unknown) => Promise<ManipuladorArquivoGravavel>;
      }
    ).showSaveFilePicker;
    if (!picker) return;
    const handle = await picker({
      suggestedName: 'backup-csharp-cash.json',
      types: [
        {
          description: 'JSON',
          accept: { 'application/json': ['.json'] },
        },
      ],
    });
    this.arquivoHandle = handle;
    const nome = (handle as unknown as { name?: string }).name ?? 'backup-csharp-cash.json';
    await this.config.atualizarArquivoDestinoNome(nome);
  }

  async obterArquivoDestinoComoFile(): Promise<File | null> {
    if (!this.arquivoHandle) return null;
    const getFile = (this.arquivoHandle as unknown as { getFile?: () => Promise<File> }).getFile;
    if (!getFile) return null;
    try {
      return await getFile.call(this.arquivoHandle);
    } catch {
      return null;
    }
  }

  private async escreverNoArquivoDestino(conteudo: string): Promise<void> {
    if (!this.arquivoHandle) return;
    const writable = await this.arquivoHandle.createWritable();
    await writable.write(new Blob([conteudo], { type: 'application/json' }));
    await writable.close();
  }

  async verificarNecessidadeDeBackup(): Promise<{
    diasDesdeUltimo: number;
    deveMostrarModal: boolean;
    automatico: boolean;
  }> {
    const ultimo = await this.dexie.obterDataDoUltimoBackup();
    const diasCfg = this.config.diasDoIntervalo();
    if (diasCfg === 0) return { diasDesdeUltimo: 0, deveMostrarModal: false, automatico: false };
    const hoje = new Date();
    const diasPassados = ultimo
      ? Math.floor((+hoje - +ultimo) / 86400000)
      : Number.MAX_SAFE_INTEGER;
    const precisa = diasPassados >= diasCfg;
    const automatico = this.config.eAutomatico();
    return {
      diasDesdeUltimo: diasPassados,
      deveMostrarModal: precisa && !automatico,
      automatico,
    };
  }

  async gerarBackupComoJson(): Promise<ResultadoDeBackup> {
    const conteudo = await this.dexie.exportarDadosComoJson();
    const cfg = this.config.configuracoes();
    if (cfg.backupAtivo && !this.arquivoHandle) {
      return { sucesso: false, mensagem: 'Selecione o arquivo destino para o backup.' };
    }
    if (cfg.backupAtivo && this.arquivoHandle) {
      await this.escreverNoArquivoDestino(conteudo);
      const tamanho = new Blob([conteudo], { type: 'application/json' }).size;
      await this.dexie.atualizarDataDoBackup(new Date());
      return { sucesso: true, tamanhoBytes: tamanho, dataIso: new Date().toISOString() };
    }
    const blob = new Blob([conteudo], { type: 'application/json' });
    const tamanho = blob.size;
    await this.dexie.atualizarDataDoBackup(new Date());
    return { sucesso: true, tamanhoBytes: tamanho, dataIso: new Date().toISOString() };
  }

  async baixarBackup(nome = 'backup.json'): Promise<ResultadoDeBackup> {
    const conteudo = await this.dexie.exportarDadosComoJson();
    const cfg = this.config.configuracoes();
    if (cfg.backupAtivo && !this.arquivoHandle) {
      return { sucesso: false, mensagem: 'Selecione o arquivo destino para o backup.' };
    }
    if (cfg.backupAtivo && this.arquivoHandle) {
      await this.escreverNoArquivoDestino(conteudo);
      const tamanho = new Blob([conteudo], { type: 'application/json' }).size;
      await this.dexie.atualizarDataDoBackup(new Date());
      return { sucesso: true, tamanhoBytes: tamanho, dataIso: new Date().toISOString() };
    }
    const blob = new Blob([conteudo], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nome;
    a.click();
    URL.revokeObjectURL(url);
    await this.dexie.atualizarDataDoBackup(new Date());
    return { sucesso: true, tamanhoBytes: blob.size, dataIso: new Date().toISOString() };
  }
}
