export interface ManipuladorArquivoGravavel {
  name?: string;
  createWritable: () => Promise<{
    write: (data: Blob) => Promise<void>;
    close: () => Promise<void>;
  }>;
}
