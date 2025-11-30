import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { CdkPortal, PortalModule } from '@angular/cdk/portal';
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { OpcaoSelect } from '../../models/opcao-select.model';

@Component({
  selector: 'app-seletor-suspenso',
  standalone: true,
  imports: [CommonModule, PortalModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-white/10 bg-slate-800 text-white"
      [ngClass]="classeBotao"
      (click)="abrir()"
      (keydown.enter)="abrir()"
      (keydown.space)="abrir()"
      (keyup.enter)="abrir()"
      (keyup.space)="abrir()"
      [attr.aria-expanded]="aberto"
    >
      <span>{{ opcaoSelecionada?.texto || placeholder }}</span>
      <span class="transition-transform" [class.rotate-180]="aberto">▼</span>
    </button>

    <ng-template cdk-portal>
      <div
        class="z-50 mt-1 max-h-60 w-[var(--largura)] overflow-auto rounded-xl border border-white/10 bg-slate-900 text-white shadow-xl"
        [ngClass]="classePainel"
        role="listbox"
        tabindex="0"
        (keydown.arrowDown)="navegar(1)"
        (keydown.arrowUp)="navegar(-1)"
        (keydown.escape)="fechar()"
      >
        <div
          *ngFor="let o of opcoes; let i = index"
          class="px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-slate-800 focus:outline-none"
          (click)="selecionar(o)"
          (keydown.enter)="selecionar(o)"
          [attr.data-index]="i"
          tabindex="0"
          role="option"
          [attr.aria-selected]="o.valor === opcaoSelecionada?.valor"
        >
          <span>{{ o.texto }}</span>
          <span *ngIf="o.valor === opcaoSelecionada?.valor">✔</span>
        </div>
      </div>
    </ng-template>
  `,
})
export class SeletorSuspensoComponent implements OnInit {
  @Input() opcoes: OpcaoSelect[] = [];
  @Input() placeholder = 'Selecione';
  @Input() valor?: string;
  @Output() valorChange = new EventEmitter<string>();
  @Input() classeBotao = '';
  @Input() classePainel = '';

  @ViewChild(CdkPortal) portal?: CdkPortal;
  aberto = false;
  overlayRef?: OverlayRef;
  opcaoSelecionada?: OpcaoSelect;
  keyManager?: ActiveDescendantKeyManager<ElementRef>;

  constructor(
    private readonly overlay: Overlay,
    private readonly host: ElementRef<HTMLElement>,
  ) {}

  ngOnInit() {
    this.opcaoSelecionada = this.opcoes.find((o) => o.valor === this.valor);
  }

  abrir() {
    if (this.aberto) return;
    const rect = this.host.nativeElement.getBoundingClientRect();
    const config = new OverlayConfig({
      hasBackdrop: true,
      backdropClass: 'bg-black/50',
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.host)
        .withPositions([
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
        ]),
    });
    this.overlayRef = this.overlay.create(config);
    this.overlayRef.backdropClick().subscribe(() => this.fechar());
    if (this.portal) this.overlayRef.attach(this.portal);
    this.aberto = true;
    this.overlayRef.updateSize({ width: rect.width });
    (this.overlayRef.overlayElement.style as unknown as CSSStyleDeclaration).setProperty(
      '--largura',
      rect.width + 'px',
    );
  }

  fechar() {
    this.aberto = false;
    this.overlayRef?.detach();
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }

  selecionar(o: OpcaoSelect) {
    this.opcaoSelecionada = o;
    this.valor = o.valor;
    this.valorChange.emit(o.valor);
    this.fechar();
  }

  navegar(delta: number) {
    const el = this.overlayRef?.overlayElement;
    if (!el) return;
    const itens = Array.from(el.querySelectorAll('[data-index]')) as HTMLElement[];
    const atual = itens.findIndex((x) => x.classList.contains('bg-slate-800'));
    const proximo = Math.max(0, Math.min(itens.length - 1, (atual < 0 ? 0 : atual) + delta));
    itens.forEach((x) => x.classList.remove('bg-slate-800'));
    itens[proximo]?.classList.add('bg-slate-800');
    itens[proximo]?.scrollIntoView({ block: 'nearest' });
  }
}
