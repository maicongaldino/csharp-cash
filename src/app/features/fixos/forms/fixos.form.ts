import { FormBuilder, Validators } from '@angular/forms';

export function criarFormularioFixos(fb: FormBuilder) {
  return fb.group({
    descricao: ['', [Validators.required, Validators.minLength(2)]],
    valor: [null as number | null, [Validators.required, Validators.min(0.01)]],
    diaVencimento: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
    categoria: ['Outros', [Validators.required]],
    metodoPagamento: ['DINHEIRO', [Validators.required]],
    vigenteAte: [null as string | null],
  });
}
