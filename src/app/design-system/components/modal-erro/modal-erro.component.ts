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

@Component({
  selector: 'app-modal-erro',
  standalone: true,
  imports: [CommonModule, PortalModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template cdk-portal>
      <div
        class="bg-slate-900 border border-red-500/30 rounded-2xl p-6 w-full max-w-md animate-fade-in relative"
        (keydown.escape)="fechar()"
        tabindex="0"
      >
        <button
          type="button"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
          (click)="fechar()"
        >
          ✕
        </button>
        <h3 class="text-lg font-bold mb-2 text-red-400">{{ titulo || 'Erro' }}</h3>
        <p class="text-sm text-slate-300">{{ mensagem }}</p>
        <pre *ngIf="detalhes" class="mt-3 text-xs text-slate-500 whitespace-pre-wrap">
            {{ detalhes }}
          </pre
        >
        <div class="mt-6 flex justify-end">
          <button
            type="button"
            class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white"
            (click)="fechar()"
          >
            Fechar
          </button>
        </div>
      </div>
    </ng-template>
  `,
})
export class ModalErroComponent implements OnChanges {
  @Input() aberto = false;
  @Input() titulo?: string;
  @Input() mensagem = '';
  @Input() detalhes?: string;
  @Output() fecharModal = new EventEmitter<void>();
  @ViewChild(CdkPortal) portal?: CdkPortal;
  overlayRef?: OverlayRef;

  constructor(private readonly overlay: Overlay) {}

  ngOnChanges() {
    if (this.aberto) this.abrir();
    else this.fechar();
  }

  abrir() {
    if (this.overlayRef) return;
    const config = new OverlayConfig({
      hasBackdrop: true,
      backdropClass: 'bg-black/60',
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });
    this.overlayRef = this.overlay.create(config);
    this.overlayRef.backdropClick().subscribe(() => this.fechar());
    if (this.portal) this.overlayRef.attach(this.portal);
  }

  fechar() {
    this.fecharModal.emit();
    this.overlayRef?.detach();
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
    this.aberto = false;
  }
}
