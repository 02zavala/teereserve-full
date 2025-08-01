// Service Worker para TeeReserve PWA
const CACHE_NAME = 'teereserve-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const API_CACHE = 'api-v1';

// Archivos para cachear inmediatamente
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/_next/static/css/',
  '/_next/static/js/',
];

// URLs de API que se pueden cachear
const CACHEABLE_APIS = [
  '/api/fields',
  '/api/user/profile',
  '/api/settings',
  '/api/notifications/preferences',
];

// Estrategia de caché por tipo de recurso
const CACHE_STRATEGIES = {
  static: 'cache-first',
  api: 'network-first',
  pages: 'stale-while-revalidate',
  images: 'cache-first',
};

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Caching static files');
      return cache.addAll(STATIC_FILES.filter(url => !url.endsWith('/')));
    }).catch(error => {
      console.error('Error caching static files:', error);
    })
  );
  
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE, API_CACHE].includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar requests del mismo origen
  if (url.origin !== location.origin) {
    return;
  }

  // Estrategia para archivos estáticos
  if (isStaticFile(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Estrategia para APIs
  if (url.pathname.startsWith('/api/')) {
    if (isCacheableAPI(url.pathname)) {
      event.respondWith(networkFirst(request, API_CACHE));
    } else {
      event.respondWith(networkOnly(request));
    }
    return;
  }

  // Estrategia para imágenes
  if (isImage(url.pathname)) {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
    return;
  }

  // Estrategia para páginas
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

// Cache First Strategy - Para archivos estáticos
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      // Actualizar en background para archivos que pueden cambiar
      if (!isImmutableFile(request.url)) {
        fetch(request).then((response) => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
        }).catch(() => {});
      }
      return cached;
    }
    
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First Strategy - Para APIs
async function networkFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    
    try {
      const response = await Promise.race([
        fetch(request),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 5000)
        )
      ]);
      
      if (response.ok && request.method === 'GET') {
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      console.log('Network failed, trying cache:', error.message);
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }
      
      // Retornar respuesta offline para APIs críticas
      if (isCriticalAPI(request.url)) {
        return new Response(JSON.stringify({
          error: 'Offline',
          message: 'Esta funcionalidad no está disponible sin conexión',
          offline: true
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Network first strategy failed:', error);
    return new Response('Service Unavailable', { status: 503 });
  }
}

// Stale While Revalidate - Para páginas
async function staleWhileRevalidate(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    const fetchPromise = fetch(request).then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    }).catch(() => {
      // Si falla la red y no hay caché, mostrar página offline
      if (!cached && request.destination === 'document') {
        return cache.match('/offline.html');
      }
      throw new Error('Network failed');
    });
    
    return cached || await fetchPromise;
  } catch (error) {
    console.error('Stale while revalidate strategy failed:', error);
    const cache = await caches.open(cacheName);
    return cache.match('/offline.html') || new Response('Offline', { status: 503 });
  }
}

// Network Only - Para APIs que no se deben cachear
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('Network only strategy failed:', error);
    return new Response(JSON.stringify({
      error: 'Network Error',
      message: 'No se pudo conectar al servidor',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Utilidades
function isStaticFile(pathname) {
  return pathname.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/) ||
         pathname.startsWith('/_next/static/');
}

function isImage(pathname) {
  return pathname.match(/\.(png|jpg|jpeg|gif|webp|avif|svg)$/);
}

function isImmutableFile(url) {
  return url.includes('/_next/static/') || url.includes('.immutable.');
}

function isCacheableAPI(pathname) {
  return CACHEABLE_APIS.some(api => pathname.startsWith(api));
}

function isCriticalAPI(url) {
  const criticalAPIs = ['/api/auth/', '/api/user/', '/api/fields/', '/api/bookings/'];
  return criticalAPIs.some(api => url.includes(api));
}

// Sincronización en background
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  } else if (event.tag === 'booking-sync') {
    event.waitUntil(syncBookings());
  } else if (event.tag === 'profile-sync') {
    event.waitUntil(syncProfile());
  }
});

async function doBackgroundSync() {
  try {
    console.log('Performing background sync...');
    
    // Sincronizar datos pendientes
    const pendingData = await getStoredData('pending-sync');
    if (pendingData && pendingData.length > 0) {
      for (const data of pendingData) {
        try {
          await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
        } catch (error) {
          console.error('Failed to sync data:', error);
          // Mantener en cola para próximo intento
          continue;
        }
      }
      await clearStoredData('pending-sync');
      console.log('Background sync completed');
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function syncBookings() {
  try {
    const pendingBookings = await getStoredData('pending-bookings');
    if (pendingBookings && pendingBookings.length > 0) {
      for (const booking of pendingBookings) {
        await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(booking),
        });
      }
      await clearStoredData('pending-bookings');
    }
  } catch (error) {
    console.error('Booking sync failed:', error);
  }
}

async function syncProfile() {
  try {
    const pendingProfile = await getStoredData('pending-profile');
    if (pendingProfile) {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingProfile),
      });
      await clearStoredData('pending-profile');
    }
  } catch (error) {
    console.error('Profile sync failed:', error);
  }
}

// Notificaciones push
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  if (!event.data) {
    console.log('No data in push event');
    return;
  }
  
  try {
    const data = event.data.json();
    console.log('Push data:', data);
    
    const options = {
      body: data.body || 'Nueva notificación de TeeReserve',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      tag: data.tag || 'default',
      data: data.data || {},
      actions: data.actions || [
        {
          action: 'view',
          title: 'Ver',
          icon: '/icon-view.png'
        },
        {
          action: 'dismiss',
          title: 'Descartar',
          icon: '/icon-dismiss.png'
        }
      ],
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      vibrate: data.vibrate || [200, 100, 200],
      timestamp: Date.now(),
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'TeeReserve', options)
    );
  } catch (error) {
    console.error('Error processing push notification:', error);
  }
});

// Manejo de clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  const data = event.notification.data;
  const action = event.action;
  
  if (action === 'dismiss') {
    return;
  }
  
  let url = '/';
  if (action === 'view' && data.url) {
    url = data.url;
  } else if (data.type === 'booking') {
    url = `/bookings/${data.bookingId}`;
  } else if (data.type === 'message') {
    url = `/messages/${data.messageId}`;
  } else if (data.type === 'payment') {
    url = `/payments/${data.paymentId}`;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Buscar si ya hay una ventana abierta
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Abrir nueva ventana
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Manejo de cierre de notificaciones
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
  
  // Registrar métricas de notificaciones
  const data = event.notification.data;
  if (data.trackClose) {
    fetch('/api/analytics/notification-closed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationId: data.id,
        tag: event.notification.tag,
        closedAt: Date.now(),
      }),
    }).catch(() => {});
  }
});

// Utilidades para IndexedDB
async function getStoredData(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('teereserve-offline', 1);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('data')) {
        db.createObjectStore('data', { keyPath: 'key' });
      }
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['data'], 'readonly');
      const store = transaction.objectStore('data');
      const getRequest = store.get(key);
      
      getRequest.onsuccess = () => {
        resolve(getRequest.result?.value);
      };
      
      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function storeData(key, value) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('teereserve-offline', 1);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('data')) {
        db.createObjectStore('data', { keyPath: 'key' });
      }
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['data'], 'readwrite');
      const store = transaction.objectStore('data');
      const putRequest = store.put({ key, value, timestamp: Date.now() });
      
      putRequest.onsuccess = () => {
        resolve();
      };
      
      putRequest.onerror = () => {
        reject(putRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function clearStoredData(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('teereserve-offline', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['data'], 'readwrite');
      const store = transaction.objectStore('data');
      const deleteRequest = store.delete(key);
      
      deleteRequest.onsuccess = () => {
        resolve();
      };
      
      deleteRequest.onerror = () => {
        reject(deleteRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Manejo de errores globales
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Service Worker loaded successfully');

