import { FormBuilder, Validators } from '@angular/forms';
import { ConfigUsuario } from '../../../shared/models/config-usuario.model';

export function criarFormularioPlanejamento(fb: FormBuilder, defaults: ConfigUsuario) {
  return fb.nonNullable.group({
    rendaMensal: [defaults.rendaMensal, [Validators.min(0)]],
    metaEconomiaPorcentagem: [
      defaults.metaEconomiaPorcentagem,
      [Validators.min(0), Validators.max(100)],
    ],
    dinheiroGuardadoAtual: [defaults.dinheiroGuardadoAtual, [Validators.min(0)]],
    objetivoFinanceiro: [defaults.objetivoFinanceiro, [Validators.min(0)]],
  });
}
