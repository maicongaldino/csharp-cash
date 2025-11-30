import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-pagamento-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PagamentoSelectComponent),
      multi: true,
    },
  ],
  templateUrl: './pagamento-select.component.html',
})
export class PagamentoSelectComponent implements ControlValueAccessor {
  id = 'pay-' + Math.random().toString(36).slice(2, 9);
  @Input() cartoes: { id: string; nome: string }[] = [];
  @Input() valor: 'DINHEIRO' | 'PIX' | string = 'DINHEIRO';
  @Output() valorChange = new EventEmitter<'DINHEIRO' | 'PIX' | string>();
  @Input() obrigatorio = false;
  @Input() tocado = false;

  opcoes: ('DINHEIRO' | 'PIX')[] = ['DINHEIRO', 'PIX'];

  alterarValor(v: string) {
    this.valorChange.emit(v);
    this._aoMudar?.(v);
  }

  private _aoMudar?: (valor: string) => void;
  private _aoTocar?: () => void;
  desabilitado = false;
  writeValue(obj: string): void {
    this.valor = obj ?? 'DINHEIRO';
  }
  registerOnChange(fn: (valor: string) => void): void {
    this._aoMudar = fn;
  }
  registerOnTouched(fn: () => void): void {
    this._aoTocar = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.desabilitado = isDisabled;
  }
  marcarTocado() {
    this._aoTocar?.();
  }
}
