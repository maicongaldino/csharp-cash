import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { DialogoSimplesComponent } from '../../../design-system/components/dialogo-simples/dialogo-simples.component';
import { ServicoDeBackup } from '../../services/servico-de-backup.service';
import { ServicoDeAvisos } from '../../services/servico-de-avisos.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, DialogoSimplesComponent],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  readonly toast: ServicoDeAvisos = inject(ServicoDeAvisos);
  private readonly backup: ServicoDeBackup = inject(ServicoDeBackup);
  mostrarBackupModal = false;
  diasPassados = 0;
  existeBackupAnterior = false;
  tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'fixos', label: 'Fixos' },
    { id: 'transacoes', label: 'Transações' },
    { id: 'carteira', label: 'Carteira' },
    { id: 'planejamento', label: 'Planejamento' },
    { id: 'configuracoes', label: 'Configurações' },
  ];

  constructor() {
    this.initBackupCheck();
  }

  private async initBackupCheck() {
    const r = await this.backup.verificarNecessidadeDeBackup();
    this.diasPassados = r.diasDesdeUltimo;
    this.existeBackupAnterior = r.existeBackupAnterior;
    if (r.automatico && r.diasDesdeUltimo > 0) {
      await this.backup.gerarBackupComoJson();
      this.toast.sucesso('Backup automático realizado');
      this.mostrarBackupModal = false;
    } else {
      this.mostrarBackupModal = r.deveMostrarModal;
    }
  }

  confirmarBackup() {
    this.backup.baixarBackup('backup-csharp-cash.json');
    this.toast.sucesso('Backup gerado');
    this.mostrarBackupModal = false;
  }

  fecharModalBackup() {
    this.mostrarBackupModal = false;
  }
}
