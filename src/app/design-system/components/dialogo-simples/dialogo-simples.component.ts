import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { CdkPortal, PortalModule } from '@angular/cdk/portal';
import { FocusTrapFactory, FocusTrap } from '@angular/cdk/a11y';

@Component({
  selector: 'app-dialogo-simples',
  standalone: true,
  imports: [CommonModule, PortalModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template cdk-portal>
      <div
        class="fixed inset-0 bg-black/60 z-50"
        [ngClass]="classeOverlay"
        (click)="cancelar()"
        tabindex="0"
        (keydown.escape)="cancelar()"
        (keyup.enter)="cancelar()"
      ></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div
          class="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md animate-fade-in"
          [ngClass]="classeContainer"
        >
          <button
            type="button"
            class="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            (click)="cancelar()"
          >
            ✕
          </button>
          <ng-content />
          <div class="mt-6 flex justify-end gap-2">
            <button
              type="button"
              class="px-4 py-2 rounded-xl border border-purple-500/40 text-purple-300 hover:bg-purple-500/10"
              (click)="cancelar()"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white"
              (click)="confirmar()"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </ng-template>
  `,
})
export class DialogoSimplesComponent implements OnChanges {
  @Input() aberto = false;
  @Output() aoConfirmar = new EventEmitter<void>();
  @Output() aoCancelar = new EventEmitter<void>();
  @ViewChild(CdkPortal) portal?: CdkPortal;
  overlayRef?: OverlayRef;
  focusTrap?: FocusTrap;
  @Input() classeOverlay = '';
  @Input() classeContainer = '';

  constructor(
    private readonly overlay: Overlay,
    private readonly focusTrapFactory: FocusTrapFactory,
  ) {}

  ngOnChanges() {
    if (this.aberto) this.abrir();
    else this.fechar();
  }

  abrir() {
    if (this.overlayRef) return;
    const config = new OverlayConfig({ hasBackdrop: false });
    this.overlayRef = this.overlay.create(config);
    if (this.portal) this.overlayRef.attach(this.portal);
    const panel = this.overlayRef.overlayElement.querySelector('.bg-slate-900') as HTMLElement;
    if (panel) this.focusTrap = this.focusTrapFactory.create(panel);
    this.focusTrap?.focusInitialElement();
  }

  fechar() {
    this.focusTrap?.destroy();
    this.overlayRef?.detach();
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }

  confirmar() {
    this.aoConfirmar.emit();
    this.aberto = false;
    this.fechar();
  }
  cancelar() {
    this.aoCancelar.emit();
    this.aberto = false;
    this.fechar();
  }
}
