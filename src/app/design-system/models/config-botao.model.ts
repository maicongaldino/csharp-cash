import { TipoBotaoEnum, TamanhoBotaoEnum } from './enums.model';

export type TipoBotao = 'primario' | 'secundario' | 'perigo' | 'texto' | TipoBotaoEnum;
export type TamanhoBotao = 'pequeno' | 'medio' | 'grande' | TamanhoBotaoEnum;

export interface ConfigBotao {
  tipo?: TipoBotao;
  tamanho?: TamanhoBotao;
  desabilitado?: boolean;
  carregando?: boolean;
}
