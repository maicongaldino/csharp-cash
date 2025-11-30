export type ModoDeBackup = 'Perguntar antes de fazer' | 'Automático (sem perguntar)';

export type IntervaloDeBackup = 'Nunca' | 'A cada 1 dia' | 'A cada 7 dias' | 'A cada 30 dias';

export interface ConfiguracoesDeBackup {
  id: string;
  intervalo: IntervaloDeBackup;
  modo: ModoDeBackup;
  backupAtivo?: boolean;
  arquivoDestinoNome?: string;
}
