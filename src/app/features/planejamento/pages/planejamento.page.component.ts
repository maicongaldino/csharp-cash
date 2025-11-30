import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { InputMoedaComponent } from '../../../shared/components/input-moeda/input-moeda.component';
import { ConfigService } from '../../../core/services/config.service';
import { criarFormularioPlanejamento } from '../forms/planejamento.form';

@Component({
  selector: 'app-planejamento-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputMoedaComponent],
  templateUrl: './planejamento.page.component.html',
})
export class PlanejamentoPageComponent {
  readonly config = inject(ConfigService);
  private readonly fb = inject(FormBuilder);
  readonly planejamentoForm = criarFormularioPlanejamento(this.fb, this.config.config());

  constructor() {
    this.planejamentoForm.valueChanges.subscribe((v) => this.config.atualizar(v));
  }
}
