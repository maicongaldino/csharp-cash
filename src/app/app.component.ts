import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppStateService } from './core/services/app-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: `<router-outlet />`,
})
export class AppComponent {
  private readonly _estado = inject(AppStateService);
  constructor() {
    void this._estado.dados();
  }
}
