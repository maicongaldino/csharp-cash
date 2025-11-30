import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BotaoComponent } from '../../../../design-system/components/botao/botao.component';
import { SeletorSuspensoComponent } from '../../../../design-system/components/seletor-suspenso/seletor-suspenso.component';
import { ServicoDeConfiguracoesDeBackup } from '../../../../core/services/servico-de-configuracoes-de-backup.service';
import { ServicoDeBackup } from '../../../../core/services/servico-de-backup.service';
import { ServicoDeRestauracao } from '../../../../core/services/servico-de-restauracao.service';
import {
  IntervaloDeBackup,
  ModoDeBackup,
} from '../../../../shared/models/configuracoes-de-backup.model';
import { ServicoDexie } from '../../../../core/services/servico-dexie.service';
import { TipoBotaoEnum } from '../../../../design-system/models/enums.model';
import { ServicoDeAvisos } from '../../../../core/services/servico-de-avisos.service';
import { ModalErroComponent } from '../../../../design-system/components/modal-erro/modal-erro.component';

@Component({
  selector: 'app-configuracoes-de-backup',
  standalone: true,
  imports: [CommonModule, BotaoComponent, SeletorSuspensoComponent, ModalErroComponent],
  templateUrl: './configuracoes-de-backup.component.html',
})
export class ConfiguracoesDeBackupComponent {
  private readonly cfg = inject(ServicoDeConfiguracoesDeBackup);
  private readonly backup: ServicoDeBackup = inject(ServicoDeBackup);
  private readonly restauracao: ServicoDeRestauracao = inject(ServicoDeRestauracao);
  private readonly dexie: ServicoDexie = inject(ServicoDexie);
  private readonly toast: ServicoDeAvisos = inject(ServicoDeAvisos);

  readonly configuracoes = computed(() => this.cfg.configuracoes());
  readonly ultimoBackup = signal<Date | null>(null);
  readonly TipoBotaoEnum = TipoBotaoEnum;
  readonly opcoesIntervalo = [
    { valor: 'Nunca', texto: 'Nunca' },
    { valor: 'A cada 1 dia', texto: 'A cada 1 dia' },
    { valor: 'A cada 7 dias', texto: 'A cada 7 dias' },
    { valor: 'A cada 30 dias', texto: 'A cada 30 dias' },
  ];
  readonly opcoesModo = [
    { valor: 'Perguntar antes de fazer', texto: 'Perguntar antes de fazer' },
    { valor: 'Automático (sem perguntar)', texto: 'Automático (sem perguntar)' },
  ];

  constructor() {
    this.dexie.obterDataDoUltimoBackup().then((d) => this.ultimoBackup.set(d));
  }

  async alterarIntervalo(valor: unknown) {
    const v = String(valor) as IntervaloDeBackup;
    await this.cfg.atualizarIntervalo(v);
  }

  async alterarModo(valor: unknown) {
    const v = String(valor) as ModoDeBackup;
    await this.cfg.atualizarModo(v);
  }

  async alternarBackupAtivo(valor: boolean) {
    await this.cfg.atualizarBackupAtivo(valor);
  }

  async selecionarArquivoDestino() {
    await this.backup.selecionarArquivoDestino();
  }

  async selecionarArquivoParaRestauracao() {
    await this.backup.selecionarArquivoParaRestauracao();
  }

  async restaurarDoArquivoSelecionado() {
    this.processandoRestaurar = true;
    try {
      const f = await this.backup.obterArquivoRestauracaoComoFile();
      if (!f) {
        this.erroTitulo = 'Arquivo de backup não selecionado';
        this.erroMensagem = 'Selecione o arquivo para restauração para poder restaurar.';
        this.erroAberto = true;
        return;
      }
      try {
        await this.restauracao.restaurarDeArquivo(f);
      } catch (e) {
        this.erroTitulo = 'Falha ao restaurar';
        this.erroMensagem = (e as Error)?.message ?? 'Arquivo de backup inválido';
        this.erroAberto = true;
        return;
      }
      this.toast.sucesso('Restauração concluída');
    } finally {
      this.processandoRestaurar = false;
    }
  }

  async gerarBackupAgora() {
    this.processandoGerar = true;
    try {
      const r = await this.backup.gerarBackupComoJson();
      if (r.sucesso) {
        this.toast.sucesso('Backup gerado com sucesso');
        this.ultimoBackup.set(new Date());
      } else {
        this.erroTitulo = 'Falha ao gerar backup';
        this.erroMensagem = r.mensagem ?? 'Erro desconhecido';
        this.erroAberto = true;
      }
    } finally {
      this.processandoGerar = false;
    }
  }

  async baixarBackup() {
    this.processandoBaixar = true;
    try {
      const r = await this.backup.baixarBackup('backup-csharp-cash.json');
      if (r.sucesso) {
        this.toast.sucesso('Backup baixado');
        this.ultimoBackup.set(new Date());
      } else {
        this.erroTitulo = 'Falha ao baixar backup';
        this.erroMensagem = r.mensagem ?? 'Erro desconhecido';
        this.erroAberto = true;
      }
    } finally {
      this.processandoBaixar = false;
    }
  }

  erroAberto = false;
  erroTitulo = '';
  erroMensagem = '';
  fecharErro() {
    this.erroAberto = false;
    this.erroTitulo = '';
    this.erroMensagem = '';
  }

  processandoGerar = false;
  processandoBaixar = false;
  processandoRestaurar = false;
}
