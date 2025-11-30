import { Component, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input-mes',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputMesComponent),
      multi: true,
    },
  ],
  templateUrl: './input-mes.component.html',
})
export class InputMesComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() disabled = false;
  @Input() quickActions = false;
  valor = '';
  aberto = false;
  anoAtual = new Date().getFullYear();
  mesAtual = new Date().getMonth() + 1;
  meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  private aoMudar?: (valor: string) => void;
  private aoTocar?: () => void;

  writeValue(obj: string): void {
    this.valor = obj ?? '';
    const parsed = this.parse(this.valor);
    const ref = parsed ?? [new Date().getFullYear(), new Date().getMonth() + 1];
    this.anoAtual = ref[0];
    this.mesAtual = ref[1];
  }

  registerOnChange(fn: (valor: string) => void): void {
    this.aoMudar = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.aoTocar = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.valor = input.value;
    this.aoMudar?.(this.valor);
    const parsed = this.parse(this.valor);
    if (parsed) {
      this.anoAtual = parsed[0];
      this.mesAtual = parsed[1];
    }
  }

  handleBlur() {
    this.aoTocar?.();
  }

  setPrev() {
    const [ano, mes] = this.parse(this.valor)!;
    const dataReferencia = new Date(ano, mes - 2, 1);
    this.setValor(
      `${dataReferencia.getFullYear()}-${String(dataReferencia.getMonth() + 1).padStart(2, '0')}`,
    );
  }
  setCurrent() {
    const dataReferencia = new Date();
    this.setValor(
      `${dataReferencia.getFullYear()}-${String(dataReferencia.getMonth() + 1).padStart(2, '0')}`,
    );
  }
  setNext() {
    const [ano, mes] = this.parse(this.valor)!;
    const dataReferencia = new Date(ano, mes, 1);
    this.setValor(
      `${dataReferencia.getFullYear()}-${String(dataReferencia.getMonth() + 1).padStart(2, '0')}`,
    );
  }

  prevMes() {
    const d = new Date(this.anoAtual, this.mesAtual - 2, 1);
    this.aplicarMes(d.getFullYear(), d.getMonth() + 1);
  }
  nextMes() {
    const d = new Date(this.anoAtual, this.mesAtual, 1);
    this.aplicarMes(d.getFullYear(), d.getMonth() + 1);
  }
  toggle() {
    if (this.disabled) return;
    this.aberto = !this.aberto;
  }
  decrementarAno() {
    this.anoAtual -= 1;
  }
  incrementarAno() {
    this.anoAtual += 1;
  }
  selecionarMes(m: number) {
    this.aplicarMes(this.anoAtual, m);
    this.aberto = false;
    this.aoTocar?.();
  }

  formatado(): string {
    const dt = new Date(this.anoAtual, this.mesAtual - 1, 1);
    const mes = new Intl.DateTimeFormat('pt-BR', { month: 'long' })
      .format(dt)
      .toLocaleUpperCase('pt-BR');
    const ano = dt.getFullYear();
    return `${mes} de ${ano}`;
  }

  private setValor(v: string) {
    this.valor = v;
    this.aoMudar?.(v);
    const parsed = this.parse(v);
    if (parsed) {
      this.anoAtual = parsed[0];
      this.mesAtual = parsed[1];
    }
  }

  private parse(v: string): [number, number] | null {
    const [anoStr, mesStr] = (v || '').split('-');
    const ano = Number(anoStr);
    const mes = Number(mesStr);
    if (!ano || !mes) return null;
    return [ano, mes];
  }

  private aplicarMes(ano: number, mes: number) {
    const v = `${ano}-${String(mes).padStart(2, '0')}`;
    this.setValor(v);
  }
}
