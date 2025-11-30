import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-categoria-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CategoriaSelectComponent),
      multi: true,
    },
  ],
  templateUrl: './categoria-select.component.html',
})
export class CategoriaSelectComponent implements ControlValueAccessor {
  id = 'cat-' + Math.random().toString(36).slice(2, 9);
  @Input() valor = '';
  @Output() valorChange = new EventEmitter<string>();
  @Input() obrigatorio = false;
  @Input() tocado = false;

  categorias = [
    { value: 'Alimentacao', label: '🍔 Alimentação' },
    { value: 'Transporte', label: '🚗 Transporte' },
    { value: 'Lazer', label: '🎉 Lazer' },
    { value: 'Saude', label: '💊 Saúde' },
    { value: 'Casa', label: '🏠 Casa' },
    { value: 'Educacao', label: '🎓 Educação' },
    { value: 'Streaming', label: '📺 Streaming' },
  ];

  alterarValor(v: string) {
    this.valorChange.emit(v);
    this._aoMudar?.(v);
  }

  private _aoMudar?: (valor: string) => void;
  private _aoTocar?: () => void;
  desabilitado = false;
  writeValue(obj: string): void {
    this.valor = obj ?? '';
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
