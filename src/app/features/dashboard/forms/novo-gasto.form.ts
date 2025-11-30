import { FormBuilder, Validators } from '@angular/forms';

export function criarFormularioNovoGasto(fb: FormBuilder) {
  return fb.group({
    descricao: ['', [Validators.required, Validators.minLength(2)]],
    valor: [null as number | null, [Validators.required, Validators.min(0.01)]],
    data: [new Date().toISOString().slice(0, 10), [Validators.required]],
    categoria: ['Geral', [Validators.required]],
    metodoPagamento: ['DINHEIRO', [Validators.required]],
  });
}
