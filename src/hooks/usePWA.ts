// Hook personalizado para gestión de PWA en TeeReserve Golf
// Maneja Service Worker, instalación, notificaciones y estado offline

import { useState, useEffect, useCallback } from 'react';

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  isUpdateAvailable: boolean;
  swRegistration: ServiceWorkerRegistration | null;
  installPrompt: PWAInstallPrompt | null;
  notificationPermission: NotificationPermission;
}

export interface PWAActions {
  installApp: () => Promise<boolean>;
  updateApp: () => Promise<void>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  showNotification: (title: string, options?: NotificationOptions) => Promise<void>;
  subscribeToNotifications: () => Promise<PushSubscription | null>;
  unsubscribeFromNotifications: () => Promise<boolean>;
  clearCache: () => Promise<void>;
  getCacheStatus: () => Promise<any>;
}

export interface UsePWAReturn extends PWAState, PWAActions {}

export function usePWA(): UsePWAReturn {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOffline: !navigator.onLine,
    isUpdateAvailable: false,
    swRegistration: null,
    installPrompt: null,
    notificationPermission: 'default'
  });

  // Registrar Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
    
    // Detectar si ya está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setState(prev => ({ ...prev, isInstalled: true }));
    }
    
    // Obtener permisos de notificación
    if ('Notification' in window) {
      setState(prev => ({ 
        ...prev, 
        notificationPermission: Notification.permission 
      }));
    }
  }, []);

  // Escuchar eventos de red
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOffline: false }));
    const handleOffline = () => setState(prev => ({ ...prev, isOffline: true }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Escuchar evento de instalación
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installPrompt = e as any as PWAInstallPrompt;
      
      setState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt
      }));
    };

    const handleAppInstalled = () => {
      setState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      setState(prev => ({ ...prev, swRegistration: registration }));

      // Escuchar actualizaciones
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setState(prev => ({ ...prev, isUpdateAvailable: true }));
            }
          });
        }
      });

      console.log('[PWA] Service Worker registered successfully');
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  };

  const installApp = useCallback(async (): Promise<boolean> => {
    if (!state.installPrompt) {
      return false;
    }

    try {
      await state.installPrompt.prompt();
      const { outcome } = await state.installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setState(prev => ({
          ...prev,
          isInstalled: true,
          isInstallable: false,
          installPrompt: null
        }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[PWA] Installation failed:', error);
      return false;
    }
  }, [state.installPrompt]);

  const updateApp = useCallback(async (): Promise<void> => {
    if (!state.swRegistration) {
      return;
    }

    try {
      const waitingWorker = state.swRegistration.waiting;
      if (waitingWorker) {
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
        
        // Recargar la página después de la actualización
        waitingWorker.addEventListener('statechange', () => {
          if (waitingWorker.state === 'activated') {
            window.location.reload();
          }
        });
      }
    } catch (error) {
      console.error('[PWA] Update failed:', error);
    }
  }, [state.swRegistration]);

  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, notificationPermission: permission }));
      return permission;
    } catch (error) {
      console.error('[PWA] Notification permission request failed:', error);
      return 'denied';
    }
  }, []);

  const showNotification = useCallback(async (
    title: string, 
    options: NotificationOptions = {}
  ): Promise<void> => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'teereserve-notification',
      requireInteraction: false,
      ...options
    };

    try {
      if (state.swRegistration) {
        await state.swRegistration.showNotification(title, defaultOptions);
      } else {
        new Notification(title, defaultOptions);
      }
    } catch (error) {
      console.error('[PWA] Show notification failed:', error);
    }
  }, [state.swRegistration]);

  const subscribeToNotifications = useCallback(async (): Promise<PushSubscription | null> => {
    if (!state.swRegistration || !('PushManager' in window)) {
      return null;
    }

    try {
      const subscription = await state.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          // Clave pública VAPID (en producción, usar clave real)
          'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9LdNnC_AAAHH9Ynzj-B4WfGBWRVi6_trMVBJpC8aCWPiOmhGOz5o'
        )
      });

      console.log('[PWA] Push subscription created:', subscription);
      return subscription;
    } catch (error) {
      console.error('[PWA] Push subscription failed:', error);
      return null;
    }
  }, [state.swRegistration]);

  const unsubscribeFromNotifications = useCallback(async (): Promise<boolean> => {
    if (!state.swRegistration) {
      return false;
    }

    try {
      const subscription = await state.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('[PWA] Push subscription removed');
        return true;
      }
      return false;
    } catch (error) {
      console.error('[PWA] Unsubscribe failed:', error);
      return false;
    }
  }, [state.swRegistration]);

  const clearCache = useCallback(async (): Promise<void> => {
    if (!state.swRegistration) {
      return;
    }

    try {
      const messageChannel = new MessageChannel();
      state.swRegistration.active?.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
      console.log('[PWA] Cache cleared');
    } catch (error) {
      console.error('[PWA] Clear cache failed:', error);
    }
  }, [state.swRegistration]);

  const getCacheStatus = useCallback(async (): Promise<any> => {
    if (!state.swRegistration) {
      return null;
    }

    try {
      return new Promise((resolve) => {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data);
        };
        
        state.swRegistration.active?.postMessage(
          { type: 'GET_CACHE_STATUS' },
          [messageChannel.port2]
        );
      });
    } catch (error) {
      console.error('[PWA] Get cache status failed:', error);
      return null;
    }
  }, [state.swRegistration]);

  return {
    ...state,
    installApp,
    updateApp,
    requestNotificationPermission,
    showNotification,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    clearCache,
    getCacheStatus
  };
}

// Utilidad para convertir clave VAPID
function urlBase64ToUint8Array(base64String: string): Uint8Array {
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

export default usePWA;

