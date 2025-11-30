import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-mensagem-erro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mensagem-erro.component.html',
})
export class MensagemErroComponent {
  @Input() control: AbstractControl | null = null;
  @Input() mensagens?: Record<string, string>;
  readonly padraoMensagens: Record<string, string> = {
    required: 'Campo obrigatório',
    minlength: 'Tamanho mínimo não atendido',
    min: 'Valor abaixo do mínimo',
    max: 'Valor acima do máximo',
  };

  obterMensagemErro(): string | null {
    if (!this.control || !this.control.touched) return null;
    const errors = this.control.errors;
    if (!errors) return null;
    const tabela = this.mensagens ?? this.padraoMensagens;
    for (const k of Object.keys(errors)) {
      const mensagem = tabela[k];
      if (mensagem) return mensagem;
    }
    return null;
  }
}
