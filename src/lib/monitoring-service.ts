import { getTenantId } from './tenant';
import { cacheService } from './cache-service';

// Tipos para el sistema de monitoreo
export interface MetricData {
  timestamp: number;
  value: number;
  tags?: Record<string, string>;
  tenant: string;
}

export interface Alert {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  threshold: number;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals';
  tenant: string;
  isActive: boolean;
  createdAt: number;
  triggeredAt?: number;
  resolvedAt?: number;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  databaseConnections: number;
  cacheHitRate: number;
  tenant: string;
  timestamp: number;
}

export interface PerformanceMetrics {
  apiResponseTime: number;
  pageLoadTime: number;
  databaseQueryTime: number;
  cacheResponseTime: number;
  errorCount: number;
  requestCount: number;
  activeConnections: number;
  tenant: string;
  timestamp: number;
}

// Clase principal del servicio de monitoreo
export class MonitoringService {
  private static instance: MonitoringService;
  private metrics: Map<string, MetricData[]> = new Map();
  private alerts: Map<string, Alert[]> = new Map();
  private healthChecks: Map<string, SystemHealth> = new Map();
  private performanceData: Map<string, PerformanceMetrics[]> = new Map();
  private alertCallbacks: Map<string, Function[]> = new Map();

  private constructor() {
    this.initializeMonitoring();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private initializeMonitoring() {
    // Ejecutar health checks cada 30 segundos
    setInterval(() => {
      this.performHealthCheck();
    }, 30000);

    // Limpiar métricas antiguas cada hora
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 3600000);

    // Verificar alertas cada minuto
    setInterval(() => {
      this.checkAlerts();
    }, 60000);
  }

  // Registrar métrica
  recordMetric(name: string, value: number, tags?: Record<string, string>, tenant?: string): void {
    const tenantId = tenant || getTenantId();
    const metric: MetricData = {
      timestamp: Date.now(),
      value,
      tags,
      tenant: tenantId,
    };

    const key = `${tenantId}:${name}`;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }

    const metrics = this.metrics.get(key)!;
    metrics.push(metric);

    // Mantener solo las últimas 1000 métricas por tipo
    if (metrics.length > 1000) {
      metrics.splice(0, metrics.length - 1000);
    }

    // Verificar si esta métrica dispara alguna alerta
    this.checkMetricAlerts(name, value, tenantId);
  }

  // Obtener métricas
  getMetrics(name: string, tenant?: string, timeRange?: { start: number; end: number }): MetricData[] {
    const tenantId = tenant || getTenantId();
    const key = `${tenantId}:${name}`;
    const metrics = this.metrics.get(key) || [];

    if (!timeRange) {
      return metrics;
    }

    return metrics.filter(
      metric => metric.timestamp >= timeRange.start && metric.timestamp <= timeRange.end
    );
  }

  // Crear alerta
  createAlert(alert: Omit<Alert, 'id' | 'createdAt' | 'isActive'>): string {
    const tenantId = alert.tenant || getTenantId();
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newAlert: Alert = {
      ...alert,
      id: alertId,
      tenant: tenantId,
      isActive: true,
      createdAt: Date.now(),
    };

    const key = tenantId;
    if (!this.alerts.has(key)) {
      this.alerts.set(key, []);
    }

    this.alerts.get(key)!.push(newAlert);
    return alertId;
  }

  // Obtener alertas
  getAlerts(tenant?: string, activeOnly: boolean = false): Alert[] {
    const tenantId = tenant || getTenantId();
    const alerts = this.alerts.get(tenantId) || [];

    if (activeOnly) {
      return alerts.filter(alert => alert.isActive && !alert.resolvedAt);
    }

    return alerts;
  }

  // Resolver alerta
  resolveAlert(alertId: string, tenant?: string): boolean {
    const tenantId = tenant || getTenantId();
    const alerts = this.alerts.get(tenantId) || [];
    const alert = alerts.find(a => a.id === alertId);

    if (alert) {
      alert.resolvedAt = Date.now();
      return true;
    }

    return false;
  }

  // Verificar alertas para una métrica específica
  private checkMetricAlerts(metricName: string, value: number, tenant: string): void {
    const alerts = this.alerts.get(tenant) || [];
    const relevantAlerts = alerts.filter(
      alert => alert.metric === metricName && alert.isActive && !alert.resolvedAt
    );

    for (const alert of relevantAlerts) {
      let triggered = false;

      switch (alert.condition) {
        case 'greater_than':
          triggered = value > alert.threshold;
          break;
        case 'less_than':
          triggered = value < alert.threshold;
          break;
        case 'equals':
          triggered = value === alert.threshold;
          break;
      }

      if (triggered && !alert.triggeredAt) {
        alert.triggeredAt = Date.now();
        this.triggerAlert(alert);
      } else if (!triggered && alert.triggeredAt) {
        // Auto-resolver si la condición ya no se cumple
        alert.resolvedAt = Date.now();
      }
    }
  }

  // Disparar alerta
  private triggerAlert(alert: Alert): void {
    console.warn(`🚨 ALERT TRIGGERED: ${alert.name}`, {
      severity: alert.severity,
      description: alert.description,
      tenant: alert.tenant,
      timestamp: new Date(alert.triggeredAt!).toISOString(),
    });

    // Ejecutar callbacks registrados
    const callbacks = this.alertCallbacks.get(alert.tenant) || [];
    callbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error executing alert callback:', error);
      }
    });

    // Enviar notificación (integración con sistema de notificaciones)
    this.sendAlertNotification(alert);
  }

  // Enviar notificación de alerta
  private async sendAlertNotification(alert: Alert): Promise<void> {
    try {
      // Aquí se integraría con el sistema de notificaciones existente
      const notificationData = {
        type: 'system_alert',
        severity: alert.severity,
        title: `Alerta del Sistema: ${alert.name}`,
        message: alert.description,
        tenant: alert.tenant,
        metadata: {
          alertId: alert.id,
          metric: alert.metric,
          threshold: alert.threshold,
          triggeredAt: alert.triggeredAt,
        },
      };

      // Enviar a administradores del tenant
      // await notificationService.sendToAdmins(notificationData);
      
      console.log('Alert notification sent:', notificationData);
    } catch (error) {
      console.error('Error sending alert notification:', error);
    }
  }

  // Registrar callback para alertas
  onAlert(tenant: string, callback: Function): void {
    if (!this.alertCallbacks.has(tenant)) {
      this.alertCallbacks.set(tenant, []);
    }
    this.alertCallbacks.get(tenant)!.push(callback);
  }

  // Realizar health check
  private async performHealthCheck(): Promise<void> {
    const tenants = Array.from(new Set([
      ...Array.from(this.metrics.keys()).map(key => key.split(':')[0]),
      ...Array.from(this.alerts.keys()),
    ]));

    for (const tenant of tenants) {
      try {
        const health = await this.collectHealthMetrics(tenant);
        this.healthChecks.set(tenant, health);
        
        // Registrar métricas de salud
        this.recordMetric('system.uptime', health.uptime, undefined, tenant);
        this.recordMetric('system.response_time', health.responseTime, undefined, tenant);
        this.recordMetric('system.error_rate', health.errorRate, undefined, tenant);
        this.recordMetric('system.memory_usage', health.memoryUsage, undefined, tenant);
        this.recordMetric('system.cpu_usage', health.cpuUsage, undefined, tenant);
        this.recordMetric('system.cache_hit_rate', health.cacheHitRate, undefined, tenant);
      } catch (error) {
        console.error(`Error performing health check for tenant ${tenant}:`, error);
      }
    }
  }

  // Recopilar métricas de salud
  private async collectHealthMetrics(tenant: string): Promise<SystemHealth> {
    const startTime = Date.now();
    
    // Simular verificación de salud del sistema
    const responseTime = Date.now() - startTime;
    
    // Obtener métricas de caché
    const cacheMetrics = cacheService.getMetrics(tenant);
    const cacheHitRate = cacheMetrics?.hitRate || 0;
    
    // Obtener métricas del sistema (simuladas)
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    // Calcular estado de salud
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (responseTime > 1000 || cacheHitRate < 50) {
      status = 'warning';
    }
    if (responseTime > 5000 || cacheHitRate < 20) {
      status = 'critical';
    }

    return {
      status,
      uptime,
      responseTime,
      errorRate: 0, // Se calcularía basado en métricas reales
      activeUsers: 0, // Se obtendría de la base de datos
      memoryUsage: memoryUsage.heapUsed / memoryUsage.heapTotal * 100,
      cpuUsage: 0, // Se obtendría del sistema
      diskUsage: 0, // Se obtendría del sistema
      databaseConnections: 0, // Se obtendría de Prisma
      cacheHitRate,
      tenant,
      timestamp: Date.now(),
    };
  }

  // Obtener salud del sistema
  getSystemHealth(tenant?: string): SystemHealth | null {
    const tenantId = tenant || getTenantId();
    return this.healthChecks.get(tenantId) || null;
  }

  // Registrar métricas de performance
  recordPerformance(metrics: Omit<PerformanceMetrics, 'tenant' | 'timestamp'>, tenant?: string): void {
    const tenantId = tenant || getTenantId();
    const performanceData: PerformanceMetrics = {
      ...metrics,
      tenant: tenantId,
      timestamp: Date.now(),
    };

    if (!this.performanceData.has(tenantId)) {
      this.performanceData.set(tenantId, []);
    }

    const data = this.performanceData.get(tenantId)!;
    data.push(performanceData);

    // Mantener solo los últimos 1000 registros
    if (data.length > 1000) {
      data.splice(0, data.length - 1000);
    }

    // Registrar métricas individuales
    this.recordMetric('performance.api_response_time', metrics.apiResponseTime, undefined, tenantId);
    this.recordMetric('performance.page_load_time', metrics.pageLoadTime, undefined, tenantId);
    this.recordMetric('performance.database_query_time', metrics.databaseQueryTime, undefined, tenantId);
    this.recordMetric('performance.error_count', metrics.errorCount, undefined, tenantId);
    this.recordMetric('performance.request_count', metrics.requestCount, undefined, tenantId);
  }

  // Obtener métricas de performance
  getPerformanceMetrics(tenant?: string, timeRange?: { start: number; end: number }): PerformanceMetrics[] {
    const tenantId = tenant || getTenantId();
    const data = this.performanceData.get(tenantId) || [];

    if (!timeRange) {
      return data;
    }

    return data.filter(
      metric => metric.timestamp >= timeRange.start && metric.timestamp <= timeRange.end
    );
  }

  // Verificar todas las alertas
  private checkAlerts(): void {
    for (const [tenant, alerts] of this.alerts.entries()) {
      for (const alert of alerts) {
        if (!alert.isActive || alert.resolvedAt) continue;

        // Obtener métricas recientes para la alerta
        const recentMetrics = this.getMetrics(alert.metric, tenant, {
          start: Date.now() - 300000, // Últimos 5 minutos
          end: Date.now(),
        });

        if (recentMetrics.length > 0) {
          const latestValue = recentMetrics[recentMetrics.length - 1].value;
          this.checkMetricAlerts(alert.metric, latestValue, tenant);
        }
      }
    }
  }

  // Limpiar métricas antiguas
  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - 86400000; // 24 horas

    for (const [key, metrics] of this.metrics.entries()) {
      const filteredMetrics = metrics.filter(metric => metric.timestamp > cutoffTime);
      this.metrics.set(key, filteredMetrics);
    }

    for (const [tenant, data] of this.performanceData.entries()) {
      const filteredData = data.filter(metric => metric.timestamp > cutoffTime);
      this.performanceData.set(tenant, filteredData);
    }
  }

  // Obtener dashboard de métricas
  getDashboardData(tenant?: string): any {
    const tenantId = tenant || getTenantId();
    const health = this.getSystemHealth(tenantId);
    const alerts = this.getAlerts(tenantId, true);
    const cacheMetrics = cacheService.getMetrics(tenantId);
    
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    
    const performanceMetrics = this.getPerformanceMetrics(tenantId, {
      start: oneHourAgo,
      end: now,
    });

    return {
      health,
      alerts: alerts.length,
      cacheMetrics,
      performance: {
        avgResponseTime: performanceMetrics.length > 0 
          ? performanceMetrics.reduce((sum, m) => sum + m.apiResponseTime, 0) / performanceMetrics.length 
          : 0,
        totalRequests: performanceMetrics.reduce((sum, m) => sum + m.requestCount, 0),
        totalErrors: performanceMetrics.reduce((sum, m) => sum + m.errorCount, 0),
      },
      timestamp: now,
    };
  }
}

// Middleware para monitoreo automático de APIs
export function monitoringMiddleware(req: any, res: any, next: any) {
  const startTime = Date.now();
  const tenant = req.headers['x-tenant-id'] || getTenantId();

  // Interceptar la respuesta
  const originalSend = res.send;
  res.send = function(data: any) {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Registrar métricas
    monitoringService.recordMetric('api.response_time', responseTime, {
      method: req.method,
      path: req.path,
      status: statusCode.toString(),
    }, tenant);

    monitoringService.recordMetric('api.request_count', 1, {
      method: req.method,
      path: req.path,
      status: statusCode.toString(),
    }, tenant);

    if (statusCode >= 400) {
      monitoringService.recordMetric('api.error_count', 1, {
        method: req.method,
        path: req.path,
        status: statusCode.toString(),
      }, tenant);
    }

    return originalSend.call(this, data);
  };

  next();
}

// Exportar instancia
export const monitoringService = MonitoringService.getInstance();

// Configurar alertas por defecto
export function setupDefaultAlerts(tenant: string) {
  const monitoring = MonitoringService.getInstance();

  // Alerta de tiempo de respuesta alto
  monitoring.createAlert({
    name: 'High API Response Time',
    description: 'API response time is above 2 seconds',
    severity: 'high',
    threshold: 2000,
    metric: 'api.response_time',
    condition: 'greater_than',
    tenant,
  });

  // Alerta de tasa de error alta
  monitoring.createAlert({
    name: 'High Error Rate',
    description: 'Error rate is above 5%',
    severity: 'critical',
    threshold: 5,
    metric: 'system.error_rate',
    condition: 'greater_than',
    tenant,
  });

  // Alerta de uso de memoria alto
  monitoring.createAlert({
    name: 'High Memory Usage',
    description: 'Memory usage is above 90%',
    severity: 'warning',
    threshold: 90,
    metric: 'system.memory_usage',
    condition: 'greater_than',
    tenant,
  });

  // Alerta de baja tasa de hit de caché
  monitoring.createAlert({
    name: 'Low Cache Hit Rate',
    description: 'Cache hit rate is below 70%',
    severity: 'medium',
    threshold: 70,
    metric: 'system.cache_hit_rate',
    condition: 'less_than',
    tenant,
  });
}

