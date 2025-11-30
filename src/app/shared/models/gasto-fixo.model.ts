export interface GastoFixo {
  id: string;
  descricao: string;
  valor: number;
  diaVencimento: number;
  categoria: string;
  metodoPagamento: string;
  vigenteAte?: string;
}
