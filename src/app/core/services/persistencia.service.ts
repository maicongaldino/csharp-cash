import { Injectable, signal, computed, inject } from '@angular/core';
import { AppData } from '../../shared/models/app-data.model';
import { ManipuladorArquivoGravavel } from '../../shared/models/manipulador-arquivo-gravavel.model';
import { ServicoDexie } from './servico-dexie.service';

@Injectable({ providedIn: 'root' })
export class PersistenciaService {
  private readonly _fileHandle = signal<ManipuladorArquivoGravavel | null>(null);
  readonly fileHandle = computed(() => this._fileHandle());
  readonly manipuladorArquivo = computed(() => this._fileHandle());
  private readonly STORAGE_KEY = 'csharp-cash-dados';
  private dbPromise?: Promise<IDBDatabase>;

  private readonly dexie = inject(ServicoDexie);

  async inicializarHandle() {
    const handle = await this.carregarHandleIdb();
    if (handle) {
      const ok = await this.garantirPermissao(handle);
      if (ok) this._fileHandle.set(handle);
    }
  }

  async reconectarHandle() {
    const handle = await this.carregarHandleIdb();
    if (!handle) return;
    const ok = await this.garantirPermissao(handle);
    if (ok) this._fileHandle.set(handle);
  }

  async conectarArquivo() {
    const picker = (
      window as unknown as {
        showSaveFilePicker?: (options: unknown) => Promise<ManipuladorArquivoGravavel>;
      }
    ).showSaveFilePicker;
    if (!picker) return;
    const handle = await picker({
      suggestedName: 'csharp-cash-dados.json',
      types: [
        {
          description: 'JSON',
          accept: { 'application/json': ['.json'] },
        },
      ],
    });
    this._fileHandle.set(handle);
    await this.salvarHandleIdb(handle);
  }

  async salvar(dados: AppData) {
    const handle = this._fileHandle();
    if (!handle) return;
    const writable = await handle.createWritable();
    await writable.write(new Blob([JSON.stringify(dados)], { type: 'application/json' }));
    await writable.close();
  }

  salvarLocal(dados: AppData) {
    try {
      const json = JSON.stringify(dados);
      localStorage.setItem(this.STORAGE_KEY, json);
    } catch {
      void 0;
    }
  }

  async conectarArquivoExistente(): Promise<AppData | null> {
    const picker = (
      window as unknown as {
        showOpenFilePicker?: (options: unknown) => Promise<ManipuladorArquivoGravavel[]>;
      }
    ).showOpenFilePicker;
    if (!picker) return null;
    const handles = await picker({
      multiple: false,
      types: [
        {
          description: 'JSON',
          accept: { 'application/json': ['.json'] },
        },
      ],
    });
    const handle = Array.isArray(handles) && handles.length > 0 ? handles[0] : null;
    if (!handle) return null;
    this._fileHandle.set(handle);
    await this.salvarHandleIdb(handle);
    const file = (handle as unknown as { getFile?: () => Promise<File> }).getFile
      ? await (handle as unknown as { getFile: () => Promise<File> }).getFile()
      : null;
    if (!file) return null;
    const text = await file.text();
    return JSON.parse(text) as AppData;
  }

  exportarDados(dados: AppData) {
    const blob = new Blob([JSON.stringify(dados)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-csharp-cash.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  carregarLocal(): AppData | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AppData;
    } catch {
      return null;
    }
  }

  private async abrirDb(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      try {
        const req = indexedDB.open('csharp-cash', 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains('fs-handles')) db.createObjectStore('fs-handles');
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      } catch (e) {
        reject(e as unknown as Error);
      }
    });
    return this.dbPromise;
  }

  private async salvarHandleIdb(handle: ManipuladorArquivoGravavel) {
    try {
      const db = await this.abrirDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('fs-handles', 'readwrite');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.objectStore('fs-handles').put(handle, 'dados');
      });
    } catch {
      void 0;
    }
  }

  private async carregarHandleIdb(): Promise<ManipuladorArquivoGravavel | null> {
    try {
      const db = await this.abrirDb();
      return await new Promise<ManipuladorArquivoGravavel | null>((resolve, reject) => {
        const tx = db.transaction('fs-handles', 'readonly');
        tx.onerror = () => reject(tx.error);
        const req = tx.objectStore('fs-handles').get('dados');
        req.onsuccess = () => resolve((req.result as ManipuladorArquivoGravavel) ?? null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  }

  private async garantirPermissao(handle: ManipuladorArquivoGravavel): Promise<boolean> {
    try {
      const consultarPermissao = (
        handle as unknown as {
          queryPermission?: (o: { mode: 'read' | 'readwrite' }) => Promise<string>;
        }
      ).queryPermission;
      const solicitarPermissao = (
        handle as unknown as {
          requestPermission?: (o: { mode: 'read' | 'readwrite' }) => Promise<string>;
        }
      ).requestPermission;
      const modo = { mode: 'readwrite' as const };
      const status = consultarPermissao ? await consultarPermissao(modo) : 'granted';
      if (status === 'granted') return true;
      if (status === 'prompt' && solicitarPermissao)
        return (await solicitarPermissao(modo)) === 'granted';
      return false;
    } catch {
      return true;
    }
  }

  async importarDadosDeInput(evento: Event): Promise<AppData | null> {
    const input = evento.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return null;
    const text = await file.text();
    return JSON.parse(text) as AppData;
  }

  sincronizarEstado(dados: AppData) {
    this.salvarLocal(dados);
    const fh = this._fileHandle();
    if (fh) this.salvar(dados);
    this.dexie.salvarEstado(dados);
  }
}
