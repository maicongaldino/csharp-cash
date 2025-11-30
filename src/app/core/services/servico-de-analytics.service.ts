import { Injectable } from '@angular/core';
import { Transacao } from '../../shared/models/transacao.model';

@Injectable({ providedIn: 'root' })
export class ServicoDeAnalytics {
  montarGraficoBarras(
    transacoes: Transacao[],
    filtroTodoPeriodo: boolean,
    anoMes: string,
  ): { label: string; valor: number; altura: number }[] {
    if (!transacoes.length) return [];
    if (filtroTodoPeriodo) {
      const porMes = new Map<string, number>();
      for (const t of transacoes) {
        if (t.tipo !== 'despesa') continue;
        const chave = t.data.slice(0, 7);
        porMes.set(chave, (porMes.get(chave) ?? 0) + t.valor);
      }
      const ordenados = Array.from(porMes.entries()).sort((a, b) => a[0].localeCompare(b[0]));
      const valores = ordenados.map(([, v]) => v);
      const valorMaximo = Math.max(...valores, 1);
      return ordenados.map(([chave, valor]) => ({
        label: new Date(
          Number(chave.slice(0, 4)),
          Number(chave.slice(5)) - 1,
          1,
        ).toLocaleDateString('pt-BR', { month: 'short' }),
        valor,
        altura: (valor / valorMaximo) * 100,
      }));
    }
    const porDia = new Map<string, number>();
    for (const t of transacoes) {
      if (t.tipo !== 'despesa') continue;
      const chaveDia = t.data.slice(8, 10);
      porDia.set(chaveDia, (porDia.get(chaveDia) ?? 0) + t.valor);
    }
    const [anoStr, mesStr] = anoMes.split('-');
    const ano = Number(anoStr);
    const mes = Number(mesStr);
    const diasNoMes = new Date(ano, mes, 0).getDate();
    const valores: number[] = [];
    for (let d = 1; d <= diasNoMes; d++) {
      const key = String(d).padStart(2, '0');
      valores.push(porDia.get(key) ?? 0);
    }
    const valorMaximo = Math.max(...valores, 1);
    const resultado: { label: string; valor: number; altura: number }[] = [];
    for (let d = 1; d <= diasNoMes; d++) {
      const key = String(d).padStart(2, '0');
      const valor = porDia.get(key) ?? 0;
      resultado.push({
        label: `${key}/${String(mes).padStart(2, '0')}`,
        valor,
        altura: (valor / valorMaximo) * 100,
      });
    }
    return resultado;
  }

  gastosPorCategoria(transacoes: Transacao[], topN = 8): { label: string; valor: number }[] {
    const mapa = new Map<string, number>();
    for (const t of transacoes) {
      mapa.set(t.categoria, (mapa.get(t.categoria) ?? 0) + t.valor);
    }
    return Array.from(mapa.entries())
      .map(([label, valor]) => ({ label, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, topN);
  }

  saldoAcumuladoMensal(transacoes: Transacao[]): { label: string; valor: number }[] {
    const dadosOrdenados = transacoes
      .filter((t) => t.data.length >= 10)
      .sort((a, b) => a.data.localeCompare(b.data));
    const porDia = new Map<string, number>();
    for (const t of dadosOrdenados) {
      const dia = t.data.slice(8, 10);
      const v = t.tipo === 'despesa' ? -Math.abs(t.valor) : Math.abs(t.valor);
      porDia.set(dia, (porDia.get(dia) ?? 0) + v);
    }
    const ordenados = Array.from(porDia.entries()).sort((a, b) => Number(a[0]) - Number(b[0]));
    return ordenados.map(([d, v]) => ({ label: d, valor: v }));
  }
}
