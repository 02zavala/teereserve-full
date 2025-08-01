import { getTenantId } from './tenant';
import { cacheService } from './cache-service';
import { monitoringService } from './monitoring-service';

// Tipos para optimización de performance
export interface OptimizationConfig {
  enableQueryOptimization: boolean;
  enableImageOptimization: boolean;
  enableCDN: boolean;
  enableCompression: boolean;
  enableLazyLoading: boolean;
  enableServiceWorker: boolean;
  cacheStrategy: 'aggressive' | 'moderate' | 'conservative';
  tenant?: string;
}

export interface QueryOptimization {
  enableEagerLoading: boolean;
  enableQueryBatching: boolean;
  enableIndexHints: boolean;
  maxQueryTime: number;
  enableQueryCache: boolean;
}

export interface ImageOptimization {
  enableWebP: boolean;
  enableAVIF: boolean;
  quality: number;
  enableResponsive: boolean;
  enableLazyLoading: boolean;
  enablePlaceholder: boolean;
}

export interface CDNConfig {
  provider: 'cloudflare' | 'aws' | 'google';
  endpoint: string;
  enableImageOptimization: boolean;
  enableCompression: boolean;
  cacheHeaders: Record<string, string>;
}

export interface PerformanceReport {
  tenant: string;
  timestamp: number;
  metrics: {
    pageLoadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
    timeToInteractive: number;
  };
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  recommendations: string[];
}

// Clase principal del optimizador de performance
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private config: Map<string, OptimizationConfig> = new Map();
  private queryCache: Map<string, any> = new Map();
  private imageCache: Map<string, string> = new Map();

  private constructor() {
    this.initializeOptimizer();
  }

  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  private initializeOptimizer() {
    // Configurar optimizaciones por defecto
    this.setDefaultConfig();
    
    // Limpiar cachés periódicamente
    setInterval(() => {
      this.cleanupCaches();
    }, 3600000); // Cada hora
  }

  private setDefaultConfig() {
    const defaultConfig: OptimizationConfig = {
      enableQueryOptimization: true,
      enableImageOptimization: true,
      enableCDN: true,
      enableCompression: true,
      enableLazyLoading: true,
      enableServiceWorker: true,
      cacheStrategy: 'moderate',
    };

    this.config.set('default', defaultConfig);
  }

  // Configurar optimizaciones para un tenant
  setConfig(config: OptimizationConfig, tenant?: string): void {
    const tenantId = tenant || getTenantId();
    this.config.set(tenantId, { ...config, tenant: tenantId });
  }

  // Obtener configuración
  getConfig(tenant?: string): OptimizationConfig {
    const tenantId = tenant || getTenantId();
    return this.config.get(tenantId) || this.config.get('default')!;
  }

  // Optimizar consulta de base de datos
  async optimizeQuery<T>(
    queryFn: () => Promise<T>,
    cacheKey: string,
    options: {
      ttl?: number;
      enableCache?: boolean;
      tenant?: string;
      tags?: string[];
    } = {}
  ): Promise<T> {
    const tenantId = options.tenant || getTenantId();
    const config = this.getConfig(tenantId);
    
    if (!config.enableQueryOptimization) {
      return queryFn();
    }

    const startTime = Date.now();
    
    // Intentar obtener del caché primero
    if (options.enableCache !== false) {
      const cached = await cacheService.get<T>(cacheKey, {
        tenant: tenantId,
        ttl: options.ttl,
      });
      
      if (cached) {
        const queryTime = Date.now() - startTime;
        monitoringService.recordMetric('database.query_time', queryTime, {
          type: 'cache_hit',
          key: cacheKey,
        }, tenantId);
        return cached;
      }
    }

    // Ejecutar consulta
    try {
      const result = await queryFn();
      const queryTime = Date.now() - startTime;
      
      // Registrar métricas
      monitoringService.recordMetric('database.query_time', queryTime, {
        type: 'database',
        key: cacheKey,
      }, tenantId);

      // Guardar en caché si está habilitado
      if (options.enableCache !== false && result) {
        await cacheService.set(cacheKey, result, {
          tenant: tenantId,
          ttl: options.ttl || 300, // 5 minutos por defecto
          tags: options.tags,
        });
      }

      return result;
    } catch (error) {
      const queryTime = Date.now() - startTime;
      monitoringService.recordMetric('database.query_error', 1, {
        key: cacheKey,
        error: (error as Error).message,
      }, tenantId);
      throw error;
    }
  }

  // Optimizar imagen
  optimizeImage(
    imageUrl: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'jpeg' | 'png';
      tenant?: string;
    } = {}
  ): string {
    const tenantId = options.tenant || getTenantId();
    const config = this.getConfig(tenantId);
    
    if (!config.enableImageOptimization) {
      return imageUrl;
    }

    const cacheKey = `image:${imageUrl}:${JSON.stringify(options)}`;
    const cached = this.imageCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Construir URL optimizada
    let optimizedUrl = imageUrl;
    const params = new URLSearchParams();

    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);

    // Agregar parámetros de optimización automática
    params.set('auto', 'compress,format');
    params.set('fit', 'crop');

    if (params.toString()) {
      optimizedUrl = `${imageUrl}?${params.toString()}`;
    }

    // Guardar en caché
    this.imageCache.set(cacheKey, optimizedUrl);
    
    return optimizedUrl;
  }

  // Generar Service Worker
  generateServiceWorker(tenant?: string): string {
    const tenantId = tenant || getTenantId();
    const config = this.getConfig(tenantId);
    
    if (!config.enableServiceWorker) {
      return '';
    }

    const cacheStrategy = config.cacheStrategy;
    
    return `
// Service Worker para ${tenantId}
const CACHE_NAME = 'teereserve-${tenantId}-v1';
const STATIC_CACHE = 'static-${tenantId}-v1';
const DYNAMIC_CACHE = 'dynamic-${tenantId}-v1';

// Archivos para cachear inmediatamente
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/assets/css/main.css',
  '/assets/js/main.js',
  '/assets/images/logo.png',
];

// Estrategias de caché
const CACHE_STRATEGIES = {
  aggressive: {
    networkTimeoutSeconds: 3,
    cacheFirst: true,
  },
  moderate: {
    networkTimeoutSeconds: 5,
    cacheFirst: false,
  },
  conservative: {
    networkTimeoutSeconds: 10,
    cacheFirst: false,
  },
};

const strategy = CACHE_STRATEGIES['${cacheStrategy}'];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_FILES);
    })
  );
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
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
  if (STATIC_FILES.includes(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Estrategia para APIs
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    return;
  }

  // Estrategia para páginas
  event.respondWith(
    strategy.cacheFirst 
      ? cacheFirst(request, DYNAMIC_CACHE)
      : networkFirst(request, DYNAMIC_CACHE)
  );
});

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    // Actualizar en background
    fetch(request).then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
    }).catch(() => {});
    
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Retornar página offline si está disponible
    if (request.destination === 'document') {
      return cache.match('/offline.html');
    }
    throw error;
  }
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), strategy.networkTimeoutSeconds * 1000)
      )
    ]);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    // Retornar página offline para documentos
    if (request.destination === 'document') {
      return cache.match('/offline.html');
    }
    
    throw error;
  }
}

// Sincronización en background
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Sincronizar datos pendientes cuando vuelva la conexión
  try {
    const pendingData = await getStoredData('pending-sync');
    if (pendingData && pendingData.length > 0) {
      for (const data of pendingData) {
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      await clearStoredData('pending-sync');
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Notificaciones push
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/assets/images/icon-192.png',
    badge: '/assets/images/badge-72.png',
    tag: data.tag || 'default',
    data: data.data,
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Manejo de clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const data = event.notification.data;
  const action = event.action;
  
  if (action === 'view' || !action) {
    event.waitUntil(
      clients.openWindow(data.url || '/')
    );
  }
});

// Utilidades para IndexedDB
async function getStoredData(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('teereserve-${tenantId}', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['data'], 'readonly');
      const store = transaction.objectStore('data');
      const getRequest = store.get(key);
      
      getRequest.onsuccess = () => resolve(getRequest.result?.value);
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}

async function clearStoredData(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('teereserve-${tenantId}', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['data'], 'readwrite');
      const store = transaction.objectStore('data');
      const deleteRequest = store.delete(key);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}
`;
  }

  // Generar configuración de CDN
  generateCDNConfig(tenant?: string): CDNConfig {
    const tenantId = tenant || getTenantId();
    const config = this.getConfig(tenantId);
    
    if (!config.enableCDN) {
      return {
        provider: 'cloudflare',
        endpoint: '',
        enableImageOptimization: false,
        enableCompression: false,
        cacheHeaders: {},
      };
    }

    return {
      provider: 'cloudflare',
      endpoint: `https://cdn.teereserve.golf/${tenantId}`,
      enableImageOptimization: true,
      enableCompression: true,
      cacheHeaders: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Vary': 'Accept-Encoding',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
      },
    };
  }

  // Analizar performance de página
  async analyzePagePerformance(url: string, tenant?: string): Promise<PerformanceReport> {
    const tenantId = tenant || getTenantId();
    
    // Simular análisis de performance (en producción usaría Lighthouse API)
    const mockMetrics = {
      pageLoadTime: Math.random() * 3000 + 1000,
      firstContentfulPaint: Math.random() * 2000 + 500,
      largestContentfulPaint: Math.random() * 4000 + 1500,
      cumulativeLayoutShift: Math.random() * 0.1,
      firstInputDelay: Math.random() * 100 + 50,
      timeToInteractive: Math.random() * 5000 + 2000,
    };

    const scores = {
      performance: Math.max(0, 100 - (mockMetrics.pageLoadTime / 50)),
      accessibility: 85 + Math.random() * 15,
      bestPractices: 80 + Math.random() * 20,
      seo: 90 + Math.random() * 10,
    };

    const recommendations = this.generateRecommendations(mockMetrics, scores);

    return {
      tenant: tenantId,
      timestamp: Date.now(),
      metrics: mockMetrics,
      scores,
      recommendations,
    };
  }

  // Generar recomendaciones de optimización
  private generateRecommendations(metrics: any, scores: any): string[] {
    const recommendations: string[] = [];

    if (metrics.pageLoadTime > 3000) {
      recommendations.push('Optimizar tiempo de carga de página (>3s)');
    }

    if (metrics.largestContentfulPaint > 2500) {
      recommendations.push('Mejorar Largest Contentful Paint');
    }

    if (metrics.cumulativeLayoutShift > 0.1) {
      recommendations.push('Reducir Cumulative Layout Shift');
    }

    if (metrics.firstInputDelay > 100) {
      recommendations.push('Optimizar First Input Delay');
    }

    if (scores.performance < 90) {
      recommendations.push('Implementar lazy loading para imágenes');
      recommendations.push('Minificar CSS y JavaScript');
      recommendations.push('Habilitar compresión gzip/brotli');
    }

    if (scores.accessibility < 90) {
      recommendations.push('Mejorar contraste de colores');
      recommendations.push('Agregar alt text a imágenes');
    }

    return recommendations;
  }

  // Limpiar cachés
  private cleanupCaches(): void {
    const cutoffTime = Date.now() - 3600000; // 1 hora
    
    // Limpiar caché de consultas
    for (const [key, data] of this.queryCache.entries()) {
      if (data.timestamp < cutoffTime) {
        this.queryCache.delete(key);
      }
    }

    // Limpiar caché de imágenes
    if (this.imageCache.size > 1000) {
      const entries = Array.from(this.imageCache.entries());
      const toDelete = entries.slice(0, entries.length - 500);
      toDelete.forEach(([key]) => this.imageCache.delete(key));
    }
  }

  // Obtener métricas de performance
  getPerformanceMetrics(tenant?: string): any {
    const tenantId = tenant || getTenantId();
    
    return {
      queryCacheSize: this.queryCache.size,
      imageCacheSize: this.imageCache.size,
      config: this.getConfig(tenantId),
      timestamp: Date.now(),
    };
  }
}

// Middleware para optimización automática
export function performanceMiddleware(req: any, res: any, next: any) {
  const startTime = Date.now();
  const tenant = req.headers['x-tenant-id'] || getTenantId();
  const optimizer = PerformanceOptimizer.getInstance();
  const config = optimizer.getConfig(tenant);

  // Habilitar compresión
  if (config.enableCompression) {
    res.setHeader('Vary', 'Accept-Encoding');
  }

  // Agregar headers de caché
  if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }

  // Interceptar respuesta para métricas
  const originalSend = res.send;
  res.send = function(data: any) {
    const responseTime = Date.now() - startTime;
    
    monitoringService.recordMetric('performance.response_time', responseTime, {
      path: req.path,
      method: req.method,
    }, tenant);

    return originalSend.call(this, data);
  };

  next();
}

// Utilidades para optimización de consultas
export function withQueryOptimization<T>(
  queryFn: () => Promise<T>,
  cacheKey: string,
  options?: {
    ttl?: number;
    tags?: string[];
    tenant?: string;
  }
): Promise<T> {
  const optimizer = PerformanceOptimizer.getInstance();
  return optimizer.optimizeQuery(queryFn, cacheKey, options);
}

// Utilidades para optimización de imágenes
export function optimizeImageUrl(
  url: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
  }
): string {
  const optimizer = PerformanceOptimizer.getInstance();
  return optimizer.optimizeImage(url, options);
}

// Exportar instancia
export const performanceOptimizer = PerformanceOptimizer.getInstance();

