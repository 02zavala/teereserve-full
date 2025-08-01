'use client';

import { useEffect } from 'react';

export default function PWAInstaller() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Registrar Service Worker
      navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      .then((registration) => {
        console.log('[PWA] Service Worker registered successfully:', registration.scope);
        
        // Escuchar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nueva versión disponible
                console.log('[PWA] New version available');
                
                // Mostrar notificación de actualización si es posible
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('TeeReserve Golf', {
                    body: 'Nueva versión disponible. Recarga la página para actualizar.',
                    icon: '/icons/icon-192x192.png',
                    tag: 'app-update'
                  });
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });

      // Escuchar mensajes del Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, payload } = event.data;
        
        switch (type) {
          case 'SW_UPDATE_AVAILABLE':
            console.log('[PWA] Update available');
            break;
          case 'SW_OFFLINE':
            console.log('[PWA] App is now offline');
            break;
          case 'SW_ONLINE':
            console.log('[PWA] App is now online');
            break;
        }
      });
    }

    // Detectar cambios de conectividad
    const handleOnline = () => {
      console.log('[PWA] Connection restored');
      // Opcional: mostrar toast de conexión restaurada
    };

    const handleOffline = () => {
      console.log('[PWA] Connection lost - working offline');
      // Opcional: mostrar toast de modo offline
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return null; // Este componente no renderiza nada
}

