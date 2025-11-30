import { Cartao } from './cartao.model';
import { GastoFixo } from './gasto-fixo.model';
import { Transacao } from './transacao.model';
import { ConfigUsuario } from './config-usuario.model';

export interface AppData {
  transacoes: Transacao[];
  fixos: GastoFixo[];
  cartoes: Cartao[];
  config: ConfigUsuario;
}
