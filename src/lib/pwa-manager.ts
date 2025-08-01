import { getTenantId } from './tenant';

// Tipos para PWA
export interface PWAConfig {
  enableOffline: boolean;
  enableNotifications: boolean;
  enableBackgroundSync: boolean;
  enableInstallPrompt: boolean;
  offlinePages: string[];
  tenant: string;
}

export interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  hasNotificationPermission: boolean;
  supportsBackgroundSync: boolean;
  supportsNotifications: boolean;
  serviceWorkerRegistered: boolean;
  tenant: string;
}

// Clase principal del gestor de PWA
export class PWAManager {
  private static instance: PWAManager;
  private config: PWAConfig;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private installPromptEvent: InstallPromptEvent | null = null;
  private isOnline: boolean = navigator.onLine;
  private offlineQueue: any[] = [];

  private constructor() {
    this.config = this.getDefaultConfig();
    this.initializePWA();
  }

  public static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  private getDefaultConfig(): PWAConfig {
    return {
      enableOffline: true,
      enableNotifications: true,
      enableBackgroundSync: true,
      enableInstallPrompt: true,
      offlinePages: ['/', '/bookings', '/profile', '/fields'],
      tenant: getTenantId(),
    };
  }

  private async initializePWA() {
    try {
      // Registrar Service Worker
      await this.registerServiceWorker();
      
      // Configurar eventos de red
      this.setupNetworkEvents();
      
      // Configurar prompt de instalación
      this.setupInstallPrompt();
      
      // Configurar notificaciones
      if (this.config.enableNotifications) {
        await this.setupNotifications();
      }
      
      // Configurar sincronización en background
      if (this.config.enableBackgroundSync) {
        this.setupBackgroundSync();
      }
      
      console.log('PWA Manager initialized successfully');
    } catch (error) {
      console.error('Error initializing PWA:', error);
    }
  }

  // Registrar Service Worker
  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });

      console.log('Service Worker registered:', this.serviceWorkerRegistration);

      // Escuchar actualizaciones
      this.serviceWorkerRegistration.addEventListener('updatefound', () => {
        const newWorker = this.serviceWorkerRegistration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateAvailable();
            }
          });
        }
      });

      // Verificar actualizaciones periódicamente
      setInterval(() => {
        this.serviceWorkerRegistration?.update();
      }, 60000); // Cada minuto

    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  // Configurar eventos de red
  private setupNetworkEvents(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOffline();
    });
  }

  // Manejar conexión online
  private async handleOnline(): Promise<void> {
    console.log('Connection restored');
    
    // Mostrar notificación de conexión restaurada
    this.showNotification('Conexión restaurada', {
      body: 'Ya puedes usar todas las funcionalidades',
      icon: '/icon-192.png',
      tag: 'connection-restored',
    });

    // Procesar cola offline
    await this.processOfflineQueue();

    // Sincronizar datos
    if (this.config.enableBackgroundSync && this.serviceWorkerRegistration) {
      try {
        await this.serviceWorkerRegistration.sync.register('background-sync');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }

    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('pwa:online'));
  }

  // Manejar conexión offline
  private handleOffline(): void {
    console.log('Connection lost');
    
    // Mostrar notificación de conexión perdida
    this.showNotification('Sin conexión', {
      body: 'Algunas funcionalidades están limitadas',
      icon: '/icon-192.png',
      tag: 'connection-lost',
    });

    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('pwa:offline'));
  }

  // Configurar prompt de instalación
  private setupInstallPrompt(): void {
    if (!this.config.enableInstallPrompt) return;

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.installPromptEvent = event as InstallPromptEvent;
      
      // Mostrar botón de instalación personalizado
      this.showInstallButton();
    });

    // Detectar cuando la app se instala
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed');
      this.installPromptEvent = null;
      this.hideInstallButton();
      
      // Registrar evento de instalación
      this.trackEvent('pwa_installed');
    });
  }

  // Mostrar botón de instalación
  private showInstallButton(): void {
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'block';
      installButton.addEventListener('click', () => this.promptInstall());
    } else {
      // Crear botón dinámicamente si no existe
      this.createInstallButton();
    }
  }

  // Crear botón de instalación dinámicamente
  private createInstallButton(): void {
    const button = document.createElement('button');
    button.id = 'pwa-install-button';
    button.innerHTML = '📱 Instalar App';
    button.className = 'fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    button.addEventListener('click', () => this.promptInstall());
    
    document.body.appendChild(button);
  }

  // Ocultar botón de instalación
  private hideInstallButton(): void {
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }

  // Prompt de instalación
  async promptInstall(): Promise<boolean> {
    if (!this.installPromptEvent) {
      console.log('Install prompt not available');
      return false;
    }

    try {
      await this.installPromptEvent.prompt();
      const choice = await this.installPromptEvent.userChoice;
      
      if (choice.outcome === 'accepted') {
        console.log('User accepted install prompt');
        this.trackEvent('pwa_install_accepted');
        return true;
      } else {
        console.log('User dismissed install prompt');
        this.trackEvent('pwa_install_dismissed');
        return false;
      }
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }

  // Configurar notificaciones
  private async setupNotifications(): Promise<void> {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return;
    }

    if (Notification.permission === 'default') {
      // No solicitar permisos automáticamente, esperar acción del usuario
      console.log('Notification permission not granted yet');
    }
  }

  // Solicitar permisos de notificación
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      
      if (granted) {
        this.trackEvent('notification_permission_granted');
        await this.subscribeToNotifications();
      } else {
        this.trackEvent('notification_permission_denied');
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Suscribirse a notificaciones push
  private async subscribeToNotifications(): Promise<void> {
    if (!this.serviceWorkerRegistration) {
      throw new Error('Service Worker not registered');
    }

    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ),
      });

      // Enviar suscripción al servidor
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': this.config.tenant,
        },
        body: JSON.stringify({
          subscription,
          tenant: this.config.tenant,
        }),
      });

      console.log('Push subscription successful');
    } catch (error) {
      console.error('Push subscription failed:', error);
    }
  }

  // Mostrar notificación local
  showNotification(title: string, options: NotificationOptions = {}): void {
    if (Notification.permission !== 'granted') {
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      vibrate: [200, 100, 200],
      ...options,
    };

    new Notification(title, defaultOptions);
  }

  // Configurar sincronización en background
  private setupBackgroundSync(): void {
    if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.log('Background sync not supported');
      return;
    }

    // Interceptar requests fallidos para agregar a cola
    this.interceptFailedRequests();
  }

  // Interceptar requests fallidos
  private interceptFailedRequests(): void {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok && !this.isOnline) {
          // Agregar a cola offline si es un request importante
          const request = args[0] as Request | string;
          const url = typeof request === 'string' ? request : request.url;
          
          if (this.isImportantRequest(url)) {
            this.addToOfflineQueue({
              url,
              options: args[1],
              timestamp: Date.now(),
            });
          }
        }
        
        return response;
      } catch (error) {
        if (!this.isOnline) {
          const request = args[0] as Request | string;
          const url = typeof request === 'string' ? request : request.url;
          
          if (this.isImportantRequest(url)) {
            this.addToOfflineQueue({
              url,
              options: args[1],
              timestamp: Date.now(),
            });
          }
        }
        throw error;
      }
    };
  }

  // Verificar si es un request importante
  private isImportantRequest(url: string): boolean {
    const importantPaths = [
      '/api/bookings',
      '/api/user/profile',
      '/api/payments',
      '/api/notifications',
    ];
    
    return importantPaths.some(path => url.includes(path));
  }

  // Agregar a cola offline
  private addToOfflineQueue(request: any): void {
    this.offlineQueue.push(request);
    
    // Guardar en IndexedDB para persistencia
    this.saveOfflineQueue();
  }

  // Procesar cola offline
  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) {
      return;
    }

    console.log(`Processing ${this.offlineQueue.length} offline requests`);
    
    const processedRequests = [];
    
    for (const request of this.offlineQueue) {
      try {
        await fetch(request.url, request.options);
        processedRequests.push(request);
      } catch (error) {
        console.error('Failed to process offline request:', error);
      }
    }

    // Remover requests procesados
    this.offlineQueue = this.offlineQueue.filter(
      request => !processedRequests.includes(request)
    );
    
    await this.saveOfflineQueue();
  }

  // Guardar cola offline
  private async saveOfflineQueue(): Promise<void> {
    try {
      localStorage.setItem('pwa-offline-queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  // Cargar cola offline
  private loadOfflineQueue(): void {
    try {
      const saved = localStorage.getItem('pwa-offline-queue');
      if (saved) {
        this.offlineQueue = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
      this.offlineQueue = [];
    }
  }

  // Mostrar notificación de actualización disponible
  private showUpdateAvailable(): void {
    const updateBanner = document.createElement('div');
    updateBanner.id = 'pwa-update-banner';
    updateBanner.className = 'fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 z-50';
    updateBanner.innerHTML = `
      <div class="flex justify-between items-center">
        <span>Nueva versión disponible</span>
        <div>
          <button id="pwa-update-button" class="bg-white text-blue-600 px-3 py-1 rounded mr-2">
            Actualizar
          </button>
          <button id="pwa-dismiss-update" class="text-white">
            ✕
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(updateBanner);
    
    // Manejar clicks
    document.getElementById('pwa-update-button')?.addEventListener('click', () => {
      this.applyUpdate();
    });
    
    document.getElementById('pwa-dismiss-update')?.addEventListener('click', () => {
      updateBanner.remove();
    });
  }

  // Aplicar actualización
  private applyUpdate(): void {
    if (this.serviceWorkerRegistration?.waiting) {
      this.serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  // Obtener estado de PWA
  getStatus(): PWAStatus {
    return {
      isInstalled: this.isInstalled(),
      isOnline: this.isOnline,
      hasNotificationPermission: Notification.permission === 'granted',
      supportsBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      supportsNotifications: 'Notification' in window,
      serviceWorkerRegistered: !!this.serviceWorkerRegistration,
      tenant: this.config.tenant,
    };
  }

  // Verificar si la app está instalada
  private isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  // Configurar PWA
  setConfig(config: Partial<PWAConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Utilidad para convertir VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Registrar evento de analytics
  private trackEvent(event: string, data?: any): void {
    try {
      // Integrar con sistema de analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', event, {
          custom_parameter: data,
          tenant: this.config.tenant,
        });
      }
      
      // También enviar al servidor
      fetch('/api/analytics/pwa-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': this.config.tenant,
        },
        body: JSON.stringify({
          event,
          data,
          timestamp: Date.now(),
          tenant: this.config.tenant,
        }),
      }).catch(() => {});
    } catch (error) {
      console.error('Error tracking PWA event:', error);
    }
  }
}

// Hook para React
export function usePWA() {
  const pwaManager = PWAManager.getInstance();
  
  return {
    status: pwaManager.getStatus(),
    requestNotificationPermission: () => pwaManager.requestNotificationPermission(),
    promptInstall: () => pwaManager.promptInstall(),
    showNotification: (title: string, options?: NotificationOptions) => 
      pwaManager.showNotification(title, options),
  };
}

// Exportar instancia
export const pwaManager = PWAManager.getInstance();

