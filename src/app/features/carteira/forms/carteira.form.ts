import { FormBuilder, Validators } from '@angular/forms';

export function criarFormularioCartao(fb: FormBuilder) {
  return fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    limite: [null as number | null, [Validators.required, Validators.min(0)]],
    cor: ['#a855f7', [Validators.required]],
  });
}
