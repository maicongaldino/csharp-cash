import { Component, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { SomenteNumerosDirective } from '../../directives/somente-numeros.directive';

@Component({
  selector: 'app-input-moeda',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SomenteNumerosDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputMoedaComponent),
      multi: true,
    },
  ],
  templateUrl: './input-moeda.component.html',
})
export class InputMoedaComponent implements ControlValueAccessor {
  @Input() id = '';
  exibicao = '';
  disabled = false;

  private onChange?: (value: number | null) => void;
  private onTouched?: () => void;

  writeValue(obj: number | null): void {
    const numero = obj != null ? Number(obj) : null;
    this.exibicao =
      numero != null
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numero)
        : '';
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const digitos = (input.value || '').replace(/\D+/g, '');
    const valor = digitos ? Number(digitos) / 100 : null;
    this.exibicao =
      valor != null
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
        : '';
    this.onChange?.(valor);
  }

  handleBlur() {
    this.onTouched?.();
  }
}
