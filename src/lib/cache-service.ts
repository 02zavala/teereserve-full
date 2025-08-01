import { Redis } from 'ioredis';
import { getTenantId } from './tenant';

// Configuración de Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  family: 4,
});

// Configuración de cluster Redis para alta disponibilidad
const redisCluster = process.env.REDIS_CLUSTER_ENABLED === 'true' ? 
  new Redis.Cluster([
    {
      host: process.env.REDIS_CLUSTER_HOST_1 || 'localhost',
      port: parseInt(process.env.REDIS_CLUSTER_PORT_1 || '7000'),
    },
    {
      host: process.env.REDIS_CLUSTER_HOST_2 || 'localhost',
      port: parseInt(process.env.REDIS_CLUSTER_PORT_2 || '7001'),
    },
    {
      host: process.env.REDIS_CLUSTER_HOST_3 || 'localhost',
      port: parseInt(process.env.REDIS_CLUSTER_PORT_3 || '7002'),
    },
  ], {
    enableReadyCheck: false,
    redisOptions: {
      password: process.env.REDIS_PASSWORD,
    },
  }) : null;

const redisClient = redisCluster || redis;

// Tipos para el servicio de caché
export interface CacheOptions {
  ttl?: number; // Time to live en segundos
  tenant?: string; // ID del tenant
  tags?: string[]; // Tags para invalidación
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
  avgResponseTime: number;
}

// Clase principal del servicio de caché
export class CacheService {
  private static instance: CacheService;
  private metrics: Map<string, CacheMetrics> = new Map();
  private defaultTTL = 3600; // 1 hora por defecto

  private constructor() {
    this.initializeMetrics();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private initializeMetrics() {
    // Inicializar métricas por tenant
    setInterval(() => {
      this.updateMetrics();
    }, 60000); // Actualizar cada minuto
  }

  private generateKey(key: string, tenant?: string): string {
    const tenantId = tenant || getTenantId();
    return `tenant:${tenantId}:${key}`;
  }

  private generateTagKey(tag: string, tenant?: string): string {
    const tenantId = tenant || getTenantId();
    return `tags:${tenantId}:${tag}`;
  }

  // Obtener valor del caché
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const startTime = Date.now();
    const cacheKey = this.generateKey(key, options.tenant);
    
    try {
      const value = await redisClient.get(cacheKey);
      const responseTime = Date.now() - startTime;
      
      if (value) {
        this.recordHit(options.tenant, responseTime);
        return JSON.parse(value);
      } else {
        this.recordMiss(options.tenant, responseTime);
        return null;
      }
    } catch (error) {
      console.error('Error getting cache value:', error);
      this.recordMiss(options.tenant, Date.now() - startTime);
      return null;
    }
  }

  // Establecer valor en el caché
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    const cacheKey = this.generateKey(key, options.tenant);
    const ttl = options.ttl || this.defaultTTL;
    
    try {
      const serializedValue = JSON.stringify(value);
      await redisClient.setex(cacheKey, ttl, serializedValue);
      
      // Agregar a tags si se especifican
      if (options.tags) {
        await this.addToTags(key, options.tags, options.tenant);
      }
      
      return true;
    } catch (error) {
      console.error('Error setting cache value:', error);
      return false;
    }
  }

  // Eliminar valor del caché
  async delete(key: string, options: CacheOptions = {}): Promise<boolean> {
    const cacheKey = this.generateKey(key, options.tenant);
    
    try {
      const result = await redisClient.del(cacheKey);
      return result > 0;
    } catch (error) {
      console.error('Error deleting cache value:', error);
      return false;
    }
  }

  // Invalidar por tags
  async invalidateByTag(tag: string, tenant?: string): Promise<number> {
    const tagKey = this.generateTagKey(tag, tenant);
    
    try {
      const keys = await redisClient.smembers(tagKey);
      if (keys.length === 0) return 0;
      
      const cacheKeys = keys.map(key => this.generateKey(key, tenant));
      const result = await redisClient.del(...cacheKeys);
      
      // Limpiar el tag
      await redisClient.del(tagKey);
      
      return result;
    } catch (error) {
      console.error('Error invalidating by tag:', error);
      return 0;
    }
  }

  // Invalidar todo el caché de un tenant
  async invalidateTenant(tenant?: string): Promise<number> {
    const tenantId = tenant || getTenantId();
    const pattern = `tenant:${tenantId}:*`;
    
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length === 0) return 0;
      
      const result = await redisClient.del(...keys);
      return result;
    } catch (error) {
      console.error('Error invalidating tenant cache:', error);
      return 0;
    }
  }

  // Agregar clave a tags
  private async addToTags(key: string, tags: string[], tenant?: string): Promise<void> {
    try {
      for (const tag of tags) {
        const tagKey = this.generateTagKey(tag, tenant);
        await redisClient.sadd(tagKey, key);
      }
    } catch (error) {
      console.error('Error adding to tags:', error);
    }
  }

  // Registrar hit en métricas
  private recordHit(tenant?: string, responseTime?: number): void {
    const tenantId = tenant || getTenantId();
    const metrics = this.metrics.get(tenantId) || {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      avgResponseTime: 0,
    };
    
    metrics.hits++;
    metrics.totalRequests++;
    metrics.hitRate = (metrics.hits / metrics.totalRequests) * 100;
    
    if (responseTime) {
      metrics.avgResponseTime = (metrics.avgResponseTime + responseTime) / 2;
    }
    
    this.metrics.set(tenantId, metrics);
  }

  // Registrar miss en métricas
  private recordMiss(tenant?: string, responseTime?: number): void {
    const tenantId = tenant || getTenantId();
    const metrics = this.metrics.get(tenantId) || {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      avgResponseTime: 0,
    };
    
    metrics.misses++;
    metrics.totalRequests++;
    metrics.hitRate = (metrics.hits / metrics.totalRequests) * 100;
    
    if (responseTime) {
      metrics.avgResponseTime = (metrics.avgResponseTime + responseTime) / 2;
    }
    
    this.metrics.set(tenantId, metrics);
  }

  // Obtener métricas
  getMetrics(tenant?: string): CacheMetrics | null {
    const tenantId = tenant || getTenantId();
    return this.metrics.get(tenantId) || null;
  }

  // Obtener todas las métricas
  getAllMetrics(): Map<string, CacheMetrics> {
    return new Map(this.metrics);
  }

  // Actualizar métricas periódicamente
  private async updateMetrics(): Promise<void> {
    try {
      // Obtener información del servidor Redis
      const info = await redisClient.info('stats');
      console.log('Redis stats updated:', info);
    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  }

  // Verificar conexión
  async isConnected(): Promise<boolean> {
    try {
      await redisClient.ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Cerrar conexión
  async disconnect(): Promise<void> {
    try {
      await redisClient.quit();
    } catch (error) {
      console.error('Error disconnecting from Redis:', error);
    }
  }
}

// Funciones de conveniencia para caché específicos

// Caché de sesiones de usuario
export class SessionCache {
  private cache = CacheService.getInstance();
  private ttl = 86400; // 24 horas

  async getSession(sessionId: string, tenant?: string): Promise<any> {
    return this.cache.get(`session:${sessionId}`, { tenant, ttl: this.ttl });
  }

  async setSession(sessionId: string, sessionData: any, tenant?: string): Promise<boolean> {
    return this.cache.set(`session:${sessionId}`, sessionData, {
      tenant,
      ttl: this.ttl,
      tags: ['sessions'],
    });
  }

  async deleteSession(sessionId: string, tenant?: string): Promise<boolean> {
    return this.cache.delete(`session:${sessionId}`, { tenant });
  }

  async invalidateUserSessions(userId: string, tenant?: string): Promise<number> {
    return this.cache.invalidateByTag(`user:${userId}`, tenant);
  }
}

// Caché de disponibilidad de campos
export class AvailabilityCache {
  private cache = CacheService.getInstance();
  private ttl = 300; // 5 minutos

  async getAvailability(fieldId: string, date: string, tenant?: string): Promise<any> {
    return this.cache.get(`availability:${fieldId}:${date}`, { tenant, ttl: this.ttl });
  }

  async setAvailability(fieldId: string, date: string, availability: any, tenant?: string): Promise<boolean> {
    return this.cache.set(`availability:${fieldId}:${date}`, availability, {
      tenant,
      ttl: this.ttl,
      tags: ['availability', `field:${fieldId}`],
    });
  }

  async invalidateFieldAvailability(fieldId: string, tenant?: string): Promise<number> {
    return this.cache.invalidateByTag(`field:${fieldId}`, tenant);
  }
}

// Caché de analytics y reportes
export class AnalyticsCache {
  private cache = CacheService.getInstance();
  private ttl = 1800; // 30 minutos

  async getReport(reportId: string, params: any, tenant?: string): Promise<any> {
    const key = `report:${reportId}:${JSON.stringify(params)}`;
    return this.cache.get(key, { tenant, ttl: this.ttl });
  }

  async setReport(reportId: string, params: any, data: any, tenant?: string): Promise<boolean> {
    const key = `report:${reportId}:${JSON.stringify(params)}`;
    return this.cache.set(key, data, {
      tenant,
      ttl: this.ttl,
      tags: ['analytics', 'reports'],
    });
  }

  async invalidateReports(tenant?: string): Promise<number> {
    return this.cache.invalidateByTag('reports', tenant);
  }
}

// Exportar instancias
export const cacheService = CacheService.getInstance();
export const sessionCache = new SessionCache();
export const availabilityCache = new AvailabilityCache();
export const analyticsCache = new AnalyticsCache();

