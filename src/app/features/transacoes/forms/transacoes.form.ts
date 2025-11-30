import { FormBuilder, Validators } from '@angular/forms';
import { obterDataLocalISO } from '../../../shared/utils/data.util';

export function criarFormularioTransacao(fb: FormBuilder) {
  return fb.group({
    descricao: ['', [Validators.required, Validators.minLength(2)]],
    valor: [null as number | null, [Validators.required, Validators.min(0.01)]],
    data: [obterDataLocalISO(), [Validators.required]],
    categoria: ['Outros', [Validators.required]],
    metodoPagamento: ['DINHEIRO', [Validators.required]],
  });
}
