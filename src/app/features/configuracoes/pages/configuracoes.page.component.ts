import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfiguracoesDeBackupComponent } from '../components/configuracoes-de-backup/configuracoes-de-backup.component';

@Component({
  selector: 'app-configuracoes-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfiguracoesDeBackupComponent],
  templateUrl: './configuracoes.page.component.html',
})
export class ConfiguracoesPageComponent {}
