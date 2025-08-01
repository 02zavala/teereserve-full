import { getTenantId } from './tenant';

// Tipos para sincronización offline
export interface OfflineData {
  id: string;
  type: 'booking' | 'profile' | 'payment' | 'notification' | 'custom';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  tenant: string;
  retryCount: number;
  maxRetries: number;
  priority: 'high' | 'medium' | 'low';
}

export interface SyncResult {
  success: boolean;
  error?: string;
  data?: any;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: number;
  failedCount: number;
  tenant: string;
}

export interface ConflictResolution {
  strategy: 'server_wins' | 'client_wins' | 'merge' | 'manual';
  resolver?: (serverData: any, clientData: any) => any;
}

// Clase principal para sincronización offline
export class OfflineSyncManager {
  private static instance: OfflineSyncManager;
  private db: IDBDatabase | null = null;
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  private syncQueue: OfflineData[] = [];
  private conflictResolvers: Map<string, ConflictResolution> = new Map();
  private syncCallbacks: Map<string, Function[]> = new Map();

  private constructor() {
    this.initializeDB();
    this.setupNetworkListeners();
    this.setupPeriodicSync();
  }

  public static getInstance(): OfflineSyncManager {
    if (!OfflineSyncManager.instance) {
      OfflineSyncManager.instance = new OfflineSyncManager();
    }
    return OfflineSyncManager.instance;
  }

  // Inicializar IndexedDB
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('teereserve-offline-sync', 2);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store para datos offline
        if (!db.objectStoreNames.contains('offline_data')) {
          const store = db.createObjectStore('offline_data', { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('tenant', 'tenant', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('priority', 'priority', { unique: false });
        }

        // Store para conflictos
        if (!db.objectStoreNames.contains('conflicts')) {
          const conflictStore = db.createObjectStore('conflicts', { keyPath: 'id' });
          conflictStore.createIndex('type', 'type', { unique: false });
          conflictStore.createIndex('tenant', 'tenant', { unique: false });
        }

        // Store para metadatos de sincronización
        if (!db.objectStoreNames.contains('sync_metadata')) {
          db.createObjectStore('sync_metadata', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.loadPendingData();
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Configurar listeners de red
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOffline();
    });
  }

  // Configurar sincronización periódica
  private setupPeriodicSync(): void {
    // Sincronizar cada 30 segundos cuando esté online
    setInterval(() => {
      if (this.isOnline && !this.isSyncing && this.syncQueue.length > 0) {
        this.syncPendingData();
      }
    }, 30000);
  }

  // Manejar conexión online
  private async handleOnline(): Promise<void> {
    console.log('Connection restored - starting sync');
    await this.syncPendingData();
    this.notifyCallbacks('online');
  }

  // Manejar conexión offline
  private handleOffline(): void {
    console.log('Connection lost - queuing operations');
    this.notifyCallbacks('offline');
  }

  // Cargar datos pendientes de IndexedDB
  private async loadPendingData(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_data'], 'readonly');
      const store = transaction.objectStore('offline_data');
      const request = store.getAll();

      request.onsuccess = () => {
        this.syncQueue = request.result.sort((a, b) => {
          // Ordenar por prioridad y timestamp
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[a.priority];
          const bPriority = priorityOrder[b.priority];
          
          if (aPriority !== bPriority) {
            return bPriority - aPriority;
          }
          
          return a.timestamp - b.timestamp;
        });
        
        console.log(`Loaded ${this.syncQueue.length} pending operations`);
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Agregar operación a la cola
  async addToQueue(
    type: OfflineData['type'],
    action: OfflineData['action'],
    data: any,
    options: {
      priority?: OfflineData['priority'];
      maxRetries?: number;
      tenant?: string;
    } = {}
  ): Promise<string> {
    const id = `${type}_${action}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tenant = options.tenant || getTenantId();

    const offlineData: OfflineData = {
      id,
      type,
      action,
      data,
      timestamp: Date.now(),
      tenant,
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
      priority: options.priority || 'medium',
    };

    // Agregar a la cola en memoria
    this.syncQueue.push(offlineData);

    // Guardar en IndexedDB
    await this.saveToIndexedDB(offlineData);

    // Intentar sincronizar inmediatamente si está online
    if (this.isOnline && !this.isSyncing) {
      setTimeout(() => this.syncPendingData(), 100);
    }

    return id;
  }

  // Guardar en IndexedDB
  private async saveToIndexedDB(data: OfflineData): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_data'], 'readwrite');
      const store = transaction.objectStore('offline_data');
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Eliminar de IndexedDB
  private async removeFromIndexedDB(id: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_data'], 'readwrite');
      const store = transaction.objectStore('offline_data');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Sincronizar datos pendientes
  async syncPendingData(): Promise<void> {
    if (!this.isOnline || this.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;
    console.log(`Starting sync of ${this.syncQueue.length} operations`);

    const successfulSyncs: string[] = [];
    const failedSyncs: OfflineData[] = [];

    for (const item of this.syncQueue) {
      try {
        const result = await this.syncItem(item);
        
        if (result.success) {
          successfulSyncs.push(item.id);
          await this.removeFromIndexedDB(item.id);
        } else {
          item.retryCount++;
          if (item.retryCount >= item.maxRetries) {
            console.error(`Max retries reached for ${item.id}:`, result.error);
            await this.handleFailedSync(item, result.error);
          } else {
            failedSyncs.push(item);
            await this.saveToIndexedDB(item);
          }
        }
      } catch (error) {
        console.error(`Sync error for ${item.id}:`, error);
        item.retryCount++;
        if (item.retryCount >= item.maxRetries) {
          await this.handleFailedSync(item, (error as Error).message);
        } else {
          failedSyncs.push(item);
          await this.saveToIndexedDB(item);
        }
      }
    }

    // Actualizar cola
    this.syncQueue = failedSyncs;

    console.log(`Sync completed: ${successfulSyncs.length} successful, ${failedSyncs.length} failed`);

    // Actualizar metadatos de sincronización
    await this.updateSyncMetadata({
      lastSyncTime: Date.now(),
      successCount: successfulSyncs.length,
      failedCount: failedSyncs.length,
    });

    this.isSyncing = false;
    this.notifyCallbacks('sync_completed', {
      successful: successfulSyncs.length,
      failed: failedSyncs.length,
    });
  }

  // Sincronizar un elemento individual
  private async syncItem(item: OfflineData): Promise<SyncResult> {
    const endpoint = this.getEndpoint(item.type, item.action);
    const method = this.getHttpMethod(item.action);

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': item.tenant,
          'X-Offline-Sync': 'true',
        },
        body: JSON.stringify({
          ...item.data,
          _syncId: item.id,
          _syncTimestamp: item.timestamp,
        }),
      });

      if (!response.ok) {
        // Verificar si es un conflicto
        if (response.status === 409) {
          const conflictData = await response.json();
          return this.handleConflict(item, conflictData);
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Obtener endpoint para sincronización
  private getEndpoint(type: OfflineData['type'], action: OfflineData['action']): string {
    const baseEndpoints = {
      booking: '/api/bookings',
      profile: '/api/user/profile',
      payment: '/api/payments',
      notification: '/api/notifications',
      custom: '/api/sync/custom',
    };

    const base = baseEndpoints[type];
    
    if (action === 'create') {
      return base;
    } else if (action === 'update' || action === 'delete') {
      return `${base}/sync`;
    }
    
    return base;
  }

  // Obtener método HTTP
  private getHttpMethod(action: OfflineData['action']): string {
    switch (action) {
      case 'create': return 'POST';
      case 'update': return 'PUT';
      case 'delete': return 'DELETE';
      default: return 'POST';
    }
  }

  // Manejar conflictos
  private async handleConflict(item: OfflineData, serverData: any): Promise<SyncResult> {
    const resolver = this.conflictResolvers.get(item.type);
    
    if (!resolver) {
      // Estrategia por defecto: servidor gana
      return { success: true, data: serverData };
    }

    switch (resolver.strategy) {
      case 'server_wins':
        return { success: true, data: serverData };
        
      case 'client_wins':
        // Forzar actualización con datos del cliente
        return this.forceSyncItem(item);
        
      case 'merge':
        if (resolver.resolver) {
          const mergedData = resolver.resolver(serverData, item.data);
          return this.syncMergedData(item, mergedData);
        }
        return { success: true, data: serverData };
        
      case 'manual':
        // Guardar conflicto para resolución manual
        await this.saveConflict(item, serverData);
        return { success: true, data: serverData };
        
      default:
        return { success: true, data: serverData };
    }
  }

  // Forzar sincronización de elemento
  private async forceSyncItem(item: OfflineData): Promise<SyncResult> {
    const endpoint = this.getEndpoint(item.type, item.action);
    
    try {
      const response = await fetch(`${endpoint}/force`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': item.tenant,
          'X-Force-Update': 'true',
        },
        body: JSON.stringify(item.data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Sincronizar datos fusionados
  private async syncMergedData(item: OfflineData, mergedData: any): Promise<SyncResult> {
    const endpoint = this.getEndpoint(item.type, item.action);
    
    try {
      const response = await fetch(`${endpoint}/merge`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': item.tenant,
        },
        body: JSON.stringify(mergedData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Guardar conflicto para resolución manual
  private async saveConflict(item: OfflineData, serverData: any): Promise<void> {
    if (!this.db) return;

    const conflict = {
      id: `conflict_${item.id}`,
      type: item.type,
      tenant: item.tenant,
      clientData: item.data,
      serverData,
      timestamp: Date.now(),
      resolved: false,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['conflicts'], 'readwrite');
      const store = transaction.objectStore('conflicts');
      const request = store.put(conflict);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Manejar sincronización fallida
  private async handleFailedSync(item: OfflineData, error?: string): Promise<void> {
    console.error(`Failed to sync ${item.id} after ${item.maxRetries} retries:`, error);
    
    // Remover de IndexedDB
    await this.removeFromIndexedDB(item.id);
    
    // Notificar error
    this.notifyCallbacks('sync_failed', { item, error });
  }

  // Actualizar metadatos de sincronización
  private async updateSyncMetadata(metadata: any): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_metadata'], 'readwrite');
      const store = transaction.objectStore('sync_metadata');
      const request = store.put({
        key: 'last_sync',
        ...metadata,
        timestamp: Date.now(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Configurar resolución de conflictos
  setConflictResolver(type: OfflineData['type'], resolution: ConflictResolution): void {
    this.conflictResolvers.set(type, resolution);
  }

  // Registrar callback para eventos
  onSync(event: string, callback: Function, tenant?: string): void {
    const key = `${tenant || getTenantId()}:${event}`;
    if (!this.syncCallbacks.has(key)) {
      this.syncCallbacks.set(key, []);
    }
    this.syncCallbacks.get(key)!.push(callback);
  }

  // Notificar callbacks
  private notifyCallbacks(event: string, data?: any): void {
    const tenant = getTenantId();
    const key = `${tenant}:${event}`;
    const callbacks = this.syncCallbacks.get(key) || [];
    
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in sync callback:', error);
      }
    });
  }

  // Obtener estado de sincronización
  getStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: this.syncQueue.length,
      lastSyncTime: 0, // Se obtendría de metadatos
      failedCount: this.syncQueue.filter(item => item.retryCount > 0).length,
      tenant: getTenantId(),
    };
  }

  // Limpiar datos antiguos
  async cleanup(olderThanDays: number = 7): Promise<void> {
    if (!this.db) return;

    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_data', 'conflicts'], 'readwrite');
      
      // Limpiar datos offline antiguos
      const dataStore = transaction.objectStore('offline_data');
      const dataIndex = dataStore.index('timestamp');
      const dataRange = IDBKeyRange.upperBound(cutoffTime);
      const dataRequest = dataIndex.openCursor(dataRange);
      
      dataRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      // Limpiar conflictos resueltos antiguos
      const conflictStore = transaction.objectStore('conflicts');
      const conflictRequest = conflictStore.openCursor();
      
      conflictRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const conflict = cursor.value;
          if (conflict.resolved && conflict.timestamp < cutoffTime) {
            cursor.delete();
          }
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

// Funciones de conveniencia
export async function saveOffline(
  type: OfflineData['type'],
  action: OfflineData['action'],
  data: any,
  options?: {
    priority?: OfflineData['priority'];
    maxRetries?: number;
  }
): Promise<string> {
  const syncManager = OfflineSyncManager.getInstance();
  return syncManager.addToQueue(type, action, data, options);
}

export function onSyncEvent(event: string, callback: Function): void {
  const syncManager = OfflineSyncManager.getInstance();
  syncManager.onSync(event, callback);
}

export function getSyncStatus(): SyncStatus {
  const syncManager = OfflineSyncManager.getInstance();
  return syncManager.getStatus();
}

// Hook para React
export function useOfflineSync() {
  const syncManager = OfflineSyncManager.getInstance();
  
  return {
    status: syncManager.getStatus(),
    saveOffline: (type: OfflineData['type'], action: OfflineData['action'], data: any, options?: any) =>
      syncManager.addToQueue(type, action, data, options),
    onSync: (event: string, callback: Function) => syncManager.onSync(event, callback),
    setConflictResolver: (type: OfflineData['type'], resolution: ConflictResolution) =>
      syncManager.setConflictResolver(type, resolution),
  };
}

// Exportar instancia
export const offlineSyncManager = OfflineSyncManager.getInstance();

