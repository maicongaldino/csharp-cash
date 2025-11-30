import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'input[appSomenteNumeros]',
  standalone: true,
})
export class SomenteNumerosDirective {
  @Input() ativo = true;
  @Input() permitirDecimal = false;
  @Input() casasDecimais = 2;

  private readonly teclasPermitidas = new Set([
    'Backspace',
    'Delete',
    'Tab',
    'ArrowLeft',
    'ArrowRight',
    'Home',
    'End',
    'Enter',
  ]);

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (!this.ativo) return;
    if (this.teclasPermitidas.has(event.key)) return;
    if (/^\d$/.test(event.key)) return;
    if (this.permitirDecimal && (event.key === ',' || event.key === '.')) return;
    event.preventDefault();
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    if (!this.ativo) return;
    event.preventDefault();
    const texto = event.clipboardData?.getData('text') ?? '';
    const somenteDigitos = texto.replace(/\D+/g, '');
    const input = event.target as HTMLInputElement;
    input.value = somenteDigitos;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
