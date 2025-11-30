import { GastoFixo } from '../../shared/models/gasto-fixo.model';

export interface GastoFixoStatus extends GastoFixo {
  pagoEsteMes: boolean;
}
