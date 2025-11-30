import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, forwardRef, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input-data',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputDataComponent),
      multi: true,
    },
  ],
  templateUrl: './input-data.component.html',
})
export class InputDataComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() disabled = false;
  @Input() modo: 'data' | 'mes' = 'data';
  @Input() acoesRapidas = false;
  valor = '';
  aberto = false;
  ano = new Date().getFullYear();
  mes = new Date().getMonth();
  diaSelecionado = new Date().getDate();
  mesesAbreviados = [
    'JAN',
    'FEV',
    'MAR',
    'ABR',
    'MAI',
    'JUN',
    'JUL',
    'AGO',
    'SET',
    'OUT',
    'NOV',
    'DEZ',
  ];
  @ViewChild('painel') painel?: ElementRef<HTMLElement>;
  private aoMudar?: (valor: string) => void;
  private aoTocar?: () => void;

  writeValue(valorAtual: string): void {
    this.valor = valorAtual ?? '';
    if (this.modo === 'mes') {
      const anoMes = this.parseAnoMes(this.valor) ?? [
        new Date().getFullYear(),
        new Date().getMonth() + 1,
      ];
      this.ano = anoMes[0];
      this.mes = anoMes[1] - 1;
      this.diaSelecionado = 1;
    } else {
      const dataReferencia = this.parseData(this.valor) ?? new Date();
      this.ano = dataReferencia.getFullYear();
      this.mes = dataReferencia.getMonth();
      this.diaSelecionado = dataReferencia.getDate();
    }
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

  toggle(ev?: MouseEvent) {
    if (this.disabled) return;
    ev?.stopPropagation();
    this.aberto = !this.aberto;
  }
  prevMes() {
    const dataReferencia = new Date(this.ano, this.mes, 1);
    dataReferencia.setMonth(dataReferencia.getMonth() - 1);
    this.ano = dataReferencia.getFullYear();
    this.mes = dataReferencia.getMonth();
    if (this.modo === 'mes') this.atualizarValorMes();
  }
  nextMes() {
    const dataReferencia = new Date(this.ano, this.mes, 1);
    dataReferencia.setMonth(dataReferencia.getMonth() + 1);
    this.ano = dataReferencia.getFullYear();
    this.mes = dataReferencia.getMonth();
    if (this.modo === 'mes') this.atualizarValorMes();
  }
  selecionarDia(diaDoMes: number) {
    if (this.modo !== 'data') return;
    this.diaSelecionado = diaDoMes;
    const valorFormatado = `${this.ano}-${String(this.mes + 1).padStart(2, '0')}-${String(diaDoMes).padStart(2, '0')}`;
    this.valor = valorFormatado;
    this.aoMudar?.(valorFormatado);
    this.aberto = false;
    this.aoTocar?.();
  }
  selecionarMes(mesNumero: number) {
    if (this.modo !== 'mes') return;
    this.mes = mesNumero - 1;
    this.atualizarValorMes();
    this.aberto = false;
    this.aoTocar?.();
  }
  decrementarAno() {
    this.ano -= 1;
  }
  incrementarAno() {
    this.ano += 1;
  }
  definirValorAtual() {
    if (this.modo === 'mes') {
      const agora = new Date();
      this.ano = agora.getFullYear();
      this.mes = agora.getMonth();
      this.atualizarValorMes();
    } else {
      const hoje = new Date();
      const valorFormatado = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
      this.valor = valorFormatado;
      this.aoMudar?.(valorFormatado);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent) {
    if (!this.aberto) return;
    const target = ev.target as Node | null;
    const painelEl = this.painel?.nativeElement ?? null;
    const dentroDoPainel = painelEl ? painelEl.contains(target as Node) : false;
    if (!dentroDoPainel) this.aberto = false;
  }
  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.aberto) this.aberto = false;
  }

  diasDoMes(): (number | null)[] {
    const inicioDoMes = new Date(this.ano, this.mes, 1);
    const fimDoMes = new Date(this.ano, this.mes + 1, 0);
    const deslocamentoInicio = inicioDoMes.getDay();
    const totalDias = fimDoMes.getDate();
    const celulas: (number | null)[] = [];
    for (let i = 0; i < deslocamentoInicio; i++) celulas.push(null);
    for (let dia = 1; dia <= totalDias; dia++) celulas.push(dia);
    while (celulas.length % 7 !== 0) celulas.push(null);
    return celulas;
  }

  titulo(): string {
    const dataReferencia = new Date(this.ano, this.mes, 1);
    const nomeMes = new Intl.DateTimeFormat('pt-BR', { month: 'long' })
      .format(dataReferencia)
      .toLocaleUpperCase('pt-BR');
    const anoAtual = dataReferencia.getFullYear();
    return `${nomeMes} ${anoAtual}`;
  }
  formatado(): string {
    if (this.modo === 'mes') {
      const dataReferencia = new Date(this.ano, this.mes, 1);
      const nomeMes = new Intl.DateTimeFormat('pt-BR', { month: 'long' })
        .format(dataReferencia)
        .toLocaleUpperCase('pt-BR');
      const anoAtual = dataReferencia.getFullYear();
      return `${nomeMes} de ${anoAtual}`;
    }
    const dataSelecionada =
      this.parseData(this.valor) ?? new Date(this.ano, this.mes, this.diaSelecionado);
    const diaDoMes = String(dataSelecionada.getDate()).padStart(2, '0');
    const nomeMes = new Intl.DateTimeFormat('pt-BR', { month: 'long' })
      .format(dataSelecionada)
      .toLocaleUpperCase('pt-BR');
    const anoAtual = dataSelecionada.getFullYear();
    return `${diaDoMes} ${nomeMes} ${anoAtual}`;
  }

  private parseData(valorData: string): Date | null {
    const [anoStr, mesStr, diaStr] = (valorData || '').split('-');
    const anoNumero = Number(anoStr);
    const mesNumero = Number(mesStr);
    const diaNumero = Number(diaStr);
    if (!anoNumero || !mesNumero || !diaNumero) return null;
    return new Date(anoNumero, mesNumero - 1, diaNumero);
  }
  private parseAnoMes(valorAnoMes: string): [number, number] | null {
    const [anoStr, mesStr] = (valorAnoMes || '').split('-');
    const anoNumero = Number(anoStr);
    const mesNumero = Number(mesStr);
    if (!anoNumero || !mesNumero) return null;
    return [anoNumero, mesNumero];
  }
  private atualizarValorMes() {
    const valorMes = `${this.ano}-${String(this.mes + 1).padStart(2, '0')}`;
    this.valor = valorMes;
    this.aoMudar?.(valorMes);
  }
}
