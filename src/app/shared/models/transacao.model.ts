export interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  tipo: 'receita' | 'despesa';
  categoria: string;
  metodoPagamento: 'DINHEIRO' | 'PIX' | string;
  origemFixoId?: string;
}
