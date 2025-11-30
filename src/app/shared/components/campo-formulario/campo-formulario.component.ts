import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlContainer, ReactiveFormsModule } from '@angular/forms';
import { MensagemErroComponent } from '../mensagem-erro/mensagem-erro.component';

@Component({
  selector: 'app-campo-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MensagemErroComponent],
  templateUrl: './campo-formulario.component.html',
})
export class CampoFormularioComponent {
  @Input() rotulo = '';
  @Input() nomeControle = '';
  @Input() idInput = '';
  @Input() dica = '';
  @Input() obrigatorio = false;
  @Input() mensagensErro?: Record<string, string>;

  constructor(private container: ControlContainer) {}

  get control() {
    return this.container.control?.get(this.nomeControle) ?? null;
  }
}
