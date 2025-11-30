import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CarteiraService } from '../../../core/services/carteira.service';
import { CampoFormularioComponent } from '../../../shared/components/campo-formulario/campo-formulario.component';
import { InputMoedaComponent } from '../../../shared/components/input-moeda/input-moeda.component';
import { BotaoComponent } from '../../../design-system/components/botao/botao.component';
import { TipoBotaoEnum, TamanhoBotaoEnum } from '../../../design-system/models/enums.model';
import { criarFormularioCartao } from '../forms/carteira.form';

@Component({
  selector: 'app-carteira-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CampoFormularioComponent,
    InputMoedaComponent,
    BotaoComponent,
  ],
  templateUrl: './carteira.page.component.html',
})
export class CarteiraPageComponent {
  private readonly carteira = inject(CarteiraService);
  private readonly fb = inject(FormBuilder);

  readonly mostrarFormCartao = signal(false);
  readonly cartaoForm = criarFormularioCartao(this.fb);
  readonly TipoBotaoEnum = TipoBotaoEnum;
  readonly TamanhoBotaoEnum = TamanhoBotaoEnum;
  readonly editandoId = signal<string | null>(null);

  cartoes() {
    return this.carteira.cartoes();
  }

  salvarCartao() {
    if (this.cartaoForm.invalid) {
      this.cartaoForm.markAllAsTouched();
      return;
    }
    const valor = this.cartaoForm.getRawValue();
    const idAtual = this.editandoId();
    if (idAtual) {
      this.carteira.atualizar(idAtual, {
        nome: (valor.nome ?? '').trim(),
        limite: Number(valor.limite ?? 0),
        cor: valor.cor ?? '#a855f7',
      });
      this.editandoId.set(null);
    } else {
      this.carteira.adicionar({
        nome: (valor.nome ?? '').trim(),
        limite: Number(valor.limite ?? 0),
        cor: valor.cor ?? '#a855f7',
      });
    }
    this.cartaoForm.reset({ nome: '', limite: null, cor: '#a855f7' });
    this.mostrarFormCartao.set(false);
  }

  removerCartao(id: string) {
    this.carteira.remover(id);
  }

  iniciarEdicaoCartao(cartao: { id: string; nome: string; limite?: number; cor: string }) {
    this.editandoId.set(cartao.id);
    this.mostrarFormCartao.set(true);
    this.cartaoForm.patchValue({
      nome: cartao.nome,
      limite: cartao.limite ?? null,
      cor: cartao.cor,
    });
  }

  cancelarEdicaoCartao() {
    this.editandoId.set(null);
    this.cartaoForm.reset({ nome: '', limite: null, cor: '#a855f7' });
    this.mostrarFormCartao.set(false);
  }
}
