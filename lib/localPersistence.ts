/**
 * Write-Ahead Log (WAL) pour la persistance locale
 * Règle n°6 : Journalisation locale obligatoire
 * 
 * Principe : Écrire localement AVANT d'envoyer au serveur
 */

const DB_NAME = 'xccm-editor-wal';
const DB_VERSION = 1;
const STORE_NAME = 'changes';

interface LocalChange {
    id: string;
    contextType: 'notion' | 'part';
    contextId: string;
    content: string;
    timestamp: number;
    synced: boolean;
}

class LocalPersistence {
    private db: IDBDatabase | null = null;

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    store.createIndex('synced', 'synced', { unique: false });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    /**
     * Sauvegarder un changement localement (Write-Ahead)
     */
    async writeChange(change: Omit<LocalChange, 'id' | 'synced'>): Promise<void> {
        if (!this.db) await this.init();

        const fullChange: LocalChange = {
            id: `${change.contextType}-${change.contextId}-${Date.now()}`,
            ...change,
            synced: false
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(fullChange);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Récupérer tous les changements non synchronisés
     */
    async getUnsyncedChanges(): Promise<LocalChange[]> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('synced');
            const request = index.getAll(false);

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Marquer un changement comme synchronisé
     */
    async markAsSynced(id: string): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const change = getRequest.result;
                if (change) {
                    change.synced = true;
                    const putRequest = store.put(change);
                    putRequest.onsuccess = () => resolve();
                    putRequest.onerror = () => reject(putRequest.error);
                } else {
                    resolve();
                }
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    /**
     * Purger les changements synchronisés (Règle n°7 : Snapshot périodique)
     */
    async purgeSyncedChanges(olderThan: number = Date.now() - 24 * 60 * 60 * 1000): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('timestamp');
            const range = IDBKeyRange.upperBound(olderThan);
            const request = index.openCursor(range);

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result;
                if (cursor) {
                    const change = cursor.value as LocalChange;
                    if (change.synced) {
                        cursor.delete();
                    }
                    cursor.continue();
                } else {
                    resolve();
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Fallback localStorage (si IndexedDB indisponible)
     */
    async writeChangeToLocalStorage(change: Omit<LocalChange, 'id' | 'synced'>): Promise<void> {
        try {
            const key = `wal-${change.contextType}-${change.contextId}`;
            const existing = localStorage.getItem('xccm-wal') || '{}';
            const wal = JSON.parse(existing);
            wal[key] = {
                ...change,
                timestamp: Date.now(),
                synced: false
            };
            localStorage.setItem('xccm-wal', JSON.stringify(wal));
        } catch (err) {
            console.error('[LocalStorage WAL] Failed:', err);
        }
    }

    async getUnsyncedFromLocalStorage(): Promise<LocalChange[]> {
        try {
            const wal = JSON.parse(localStorage.getItem('xccm-wal') || '{}');
            return Object.values(wal).filter((c: any) => !c.synced);
        } catch {
            return [];
        }
    }
}

export const localPersistence = new LocalPersistence();
