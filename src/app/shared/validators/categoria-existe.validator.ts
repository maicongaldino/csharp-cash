import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';

export function criarValidadorAssincronoCategoria(categorias: string[]): AsyncValidatorFn {
  const lowers = categorias.map((c) => c.toLowerCase());
  const base = new Set<string>([...lowers, 'geral', 'outros']);
  return (control: AbstractControl): Promise<ValidationErrors | null> => {
    return new Promise((resolve) => {
      const value = (control.value ?? '').toString().trim();
      setTimeout(() => {
        if (!value) return resolve(null);
        const existe = base.has(value.toLowerCase());
        resolve(existe ? null : { categoriaNaoExistente: true });
      }, 300);
    });
  };
}
