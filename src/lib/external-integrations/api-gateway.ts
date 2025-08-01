import { getTenantId } from '../tenant';
import { cacheService } from '../cache-service';
import { monitoringService } from '../monitoring-service';

// Tipos para el gateway de APIs
export interface APIConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  authType: 'none' | 'api_key' | 'bearer' | 'oauth2' | 'basic';
  headers?: Record<string, string>;
  rateLimit?: {
    requests: number;
    window: number; // en segundos
  };
  timeout?: number;
  retries?: number;
  cacheTTL?: number;
  tenant: string;
}

export interface APIRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  cache?: boolean;
  timeout?: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  headers?: Record<string, string>;
  cached?: boolean;
  responseTime?: number;
}

export interface RateLimitInfo {
  remaining: number;
  reset: number;
  limit: number;
}

// Clase principal del gateway de APIs
export class APIGateway {
  private static instance: APIGateway;
  private configs: Map<string, APIConfig> = new Map();
  private rateLimits: Map<string, RateLimitInfo> = new Map();
  private requestCounts: Map<string, number[]> = new Map();

  private constructor() {
    this.setupDefaultConfigs();
  }

  public static getInstance(): APIGateway {
    if (!APIGateway.instance) {
      APIGateway.instance = new APIGateway();
    }
    return APIGateway.instance;
  }

  private setupDefaultConfigs(): void {
    // Configuraciones por defecto para APIs comunes
    this.registerAPI({
      name: 'weather',
      baseUrl: 'https://api.openweathermap.org/data/2.5',
      authType: 'api_key',
      apiKey: process.env.OPENWEATHER_API_KEY,
      rateLimit: { requests: 1000, window: 3600 },
      timeout: 5000,
      retries: 3,
      cacheTTL: 600, // 10 minutos
      tenant: 'default',
    });

    this.registerAPI({
      name: 'google_maps',
      baseUrl: 'https://maps.googleapis.com/maps/api',
      authType: 'api_key',
      apiKey: process.env.GOOGLE_MAPS_API_KEY,
      rateLimit: { requests: 2500, window: 86400 },
      timeout: 10000,
      retries: 2,
      cacheTTL: 3600, // 1 hora
      tenant: 'default',
    });

    this.registerAPI({
      name: 'sendgrid',
      baseUrl: 'https://api.sendgrid.com/v3',
      authType: 'bearer',
      apiKey: process.env.SENDGRID_API_KEY,
      rateLimit: { requests: 600, window: 60 },
      timeout: 15000,
      retries: 3,
      tenant: 'default',
    });

    this.registerAPI({
      name: 'clubpro',
      baseUrl: 'https://api.clubpro.com/v1',
      authType: 'oauth2',
      rateLimit: { requests: 100, window: 60 },
      timeout: 30000,
      retries: 2,
      cacheTTL: 300, // 5 minutos
      tenant: 'default',
    });
  }

  // Registrar nueva API
  registerAPI(config: APIConfig): void {
    const key = `${config.tenant}:${config.name}`;
    this.configs.set(key, config);
    console.log(`API registered: ${config.name} for tenant ${config.tenant}`);
  }

  // Obtener configuración de API
  private getConfig(apiName: string, tenant?: string): APIConfig | null {
    const tenantId = tenant || getTenantId();
    const key = `${tenantId}:${apiName}`;
    return this.configs.get(key) || this.configs.get(`default:${apiName}`) || null;
  }

  // Realizar request a API externa
  async request<T = any>(
    apiName: string,
    request: APIRequest,
    tenant?: string
  ): Promise<APIResponse<T>> {
    const startTime = Date.now();
    const tenantId = tenant || getTenantId();
    const config = this.getConfig(apiName, tenantId);

    if (!config) {
      return {
        success: false,
        error: `API configuration not found: ${apiName}`,
      };
    }

    // Verificar rate limiting
    const rateLimitCheck = this.checkRateLimit(apiName, tenantId);
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        error: `Rate limit exceeded. Try again in ${rateLimitCheck.resetIn} seconds`,
        status: 429,
      };
    }

    // Verificar caché si está habilitado
    if (request.cache !== false && request.method === 'GET' && config.cacheTTL) {
      const cacheKey = this.generateCacheKey(apiName, request, tenantId);
      const cached = await cacheService.get<T>(cacheKey, { tenant: tenantId });
      
      if (cached) {
        const responseTime = Date.now() - startTime;
        this.recordMetrics(apiName, tenantId, responseTime, 200, true);
        return {
          success: true,
          data: cached,
          cached: true,
          responseTime,
        };
      }
    }

    // Construir URL
    const url = this.buildUrl(config.baseUrl, request.endpoint, request.params);

    // Construir headers
    const headers = this.buildHeaders(config, request.headers);

    // Configurar opciones de fetch
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      signal: AbortSignal.timeout(request.timeout || config.timeout || 10000),
    };

    if (request.data && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      fetchOptions.body = JSON.stringify(request.data);
    }

    // Realizar request con reintentos
    let lastError: Error | null = null;
    const maxRetries = config.retries || 1;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, fetchOptions);
        const responseTime = Date.now() - startTime;

        // Registrar métricas
        this.recordMetrics(apiName, tenantId, responseTime, response.status, false);

        // Actualizar rate limit info
        this.updateRateLimit(apiName, tenantId, response.headers);

        if (!response.ok) {
          const errorText = await response.text();
          return {
            success: false,
            error: `HTTP ${response.status}: ${errorText}`,
            status: response.status,
            responseTime,
          };
        }

        const data = await response.json();

        // Guardar en caché si está habilitado
        if (request.cache !== false && request.method === 'GET' && config.cacheTTL) {
          const cacheKey = this.generateCacheKey(apiName, request, tenantId);
          await cacheService.set(cacheKey, data, {
            tenant: tenantId,
            ttl: config.cacheTTL,
            tags: [`api:${apiName}`],
          });
        }

        return {
          success: true,
          data,
          status: response.status,
          headers: this.extractHeaders(response.headers),
          responseTime,
        };

      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          // Esperar antes del siguiente intento (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    const responseTime = Date.now() - startTime;
    this.recordMetrics(apiName, tenantId, responseTime, 0, false, lastError?.message);

    return {
      success: false,
      error: lastError?.message || 'Unknown error',
      responseTime,
    };
  }

  // Verificar rate limiting
  private checkRateLimit(apiName: string, tenant: string): { allowed: boolean; resetIn?: number } {
    const config = this.getConfig(apiName, tenant);
    if (!config?.rateLimit) {
      return { allowed: true };
    }

    const key = `${tenant}:${apiName}`;
    const now = Date.now();
    const windowMs = config.rateLimit.window * 1000;
    
    // Obtener requests recientes
    let requests = this.requestCounts.get(key) || [];
    
    // Filtrar requests dentro de la ventana
    requests = requests.filter(timestamp => now - timestamp < windowMs);
    
    if (requests.length >= config.rateLimit.requests) {
      const oldestRequest = Math.min(...requests);
      const resetIn = Math.ceil((oldestRequest + windowMs - now) / 1000);
      return { allowed: false, resetIn };
    }

    // Agregar request actual
    requests.push(now);
    this.requestCounts.set(key, requests);

    return { allowed: true };
  }

  // Actualizar información de rate limit desde headers
  private updateRateLimit(apiName: string, tenant: string, headers: Headers): void {
    const key = `${tenant}:${apiName}`;
    
    const remaining = headers.get('x-ratelimit-remaining') || headers.get('x-rate-limit-remaining');
    const reset = headers.get('x-ratelimit-reset') || headers.get('x-rate-limit-reset');
    const limit = headers.get('x-ratelimit-limit') || headers.get('x-rate-limit-limit');

    if (remaining && reset && limit) {
      this.rateLimits.set(key, {
        remaining: parseInt(remaining),
        reset: parseInt(reset),
        limit: parseInt(limit),
      });
    }
  }

  // Construir URL completa
  private buildUrl(baseUrl: string, endpoint: string, params?: Record<string, string>): string {
    let url = `${baseUrl}${endpoint}`;
    
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }
    
    return url;
  }

  // Construir headers
  private buildHeaders(config: APIConfig, requestHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'TeeReserve/1.0',
      ...config.headers,
      ...requestHeaders,
    };

    // Agregar autenticación
    switch (config.authType) {
      case 'api_key':
        if (config.apiKey) {
          headers['X-API-Key'] = config.apiKey;
        }
        break;
      case 'bearer':
        if (config.apiKey) {
          headers['Authorization'] = `Bearer ${config.apiKey}`;
        }
        break;
      case 'basic':
        if (config.apiKey) {
          headers['Authorization'] = `Basic ${btoa(config.apiKey)}`;
        }
        break;
    }

    return headers;
  }

  // Generar clave de caché
  private generateCacheKey(apiName: string, request: APIRequest, tenant: string): string {
    const keyData = {
      api: apiName,
      endpoint: request.endpoint,
      method: request.method,
      params: request.params,
      data: request.data,
    };
    
    const hash = btoa(JSON.stringify(keyData)).replace(/[^a-zA-Z0-9]/g, '');
    return `api:${apiName}:${hash}`;
  }

  // Extraer headers relevantes
  private extractHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    
    const relevantHeaders = [
      'content-type',
      'x-ratelimit-remaining',
      'x-ratelimit-reset',
      'x-ratelimit-limit',
      'x-total-count',
      'link',
    ];

    relevantHeaders.forEach(header => {
      const value = headers.get(header);
      if (value) {
        result[header] = value;
      }
    });

    return result;
  }

  // Registrar métricas
  private recordMetrics(
    apiName: string,
    tenant: string,
    responseTime: number,
    status: number,
    cached: boolean,
    error?: string
  ): void {
    monitoringService.recordMetric('api.external.response_time', responseTime, {
      api: apiName,
      status: status.toString(),
      cached: cached.toString(),
    }, tenant);

    monitoringService.recordMetric('api.external.request_count', 1, {
      api: apiName,
      status: status.toString(),
    }, tenant);

    if (error) {
      monitoringService.recordMetric('api.external.error_count', 1, {
        api: apiName,
        error,
      }, tenant);
    }
  }

  // Obtener información de rate limit
  getRateLimitInfo(apiName: string, tenant?: string): RateLimitInfo | null {
    const tenantId = tenant || getTenantId();
    const key = `${tenantId}:${apiName}`;
    return this.rateLimits.get(key) || null;
  }

  // Invalidar caché de API
  async invalidateCache(apiName: string, tenant?: string): Promise<number> {
    const tenantId = tenant || getTenantId();
    return cacheService.invalidateByTag(`api:${apiName}`, tenantId);
  }

  // Obtener estadísticas de API
  getAPIStats(apiName: string, tenant?: string): any {
    const tenantId = tenant || getTenantId();
    const config = this.getConfig(apiName, tenantId);
    const rateLimitInfo = this.getRateLimitInfo(apiName, tenantId);
    
    const key = `${tenantId}:${apiName}`;
    const requests = this.requestCounts.get(key) || [];
    const now = Date.now();
    const recentRequests = requests.filter(timestamp => now - timestamp < 3600000); // Última hora

    return {
      config: config ? {
        name: config.name,
        baseUrl: config.baseUrl,
        authType: config.authType,
        rateLimit: config.rateLimit,
        timeout: config.timeout,
        retries: config.retries,
        cacheTTL: config.cacheTTL,
      } : null,
      rateLimitInfo,
      requestsLastHour: recentRequests.length,
      lastRequestTime: requests.length > 0 ? Math.max(...requests) : null,
    };
  }
}

// Funciones de conveniencia para APIs específicas

// Weather API
export class WeatherAPI {
  private gateway = APIGateway.getInstance();

  async getCurrentWeather(lat: number, lon: number, tenant?: string): Promise<APIResponse> {
    return this.gateway.request('weather', {
      endpoint: '/weather',
      method: 'GET',
      params: {
        lat: lat.toString(),
        lon: lon.toString(),
        units: 'metric',
        appid: process.env.OPENWEATHER_API_KEY || '',
      },
    }, tenant);
  }

  async getForecast(lat: number, lon: number, days: number = 5, tenant?: string): Promise<APIResponse> {
    return this.gateway.request('weather', {
      endpoint: '/forecast',
      method: 'GET',
      params: {
        lat: lat.toString(),
        lon: lon.toString(),
        cnt: (days * 8).toString(), // 8 forecasts per day (3-hour intervals)
        units: 'metric',
        appid: process.env.OPENWEATHER_API_KEY || '',
      },
    }, tenant);
  }
}

// Google Maps API
export class GoogleMapsAPI {
  private gateway = APIGateway.getInstance();

  async geocode(address: string, tenant?: string): Promise<APIResponse> {
    return this.gateway.request('google_maps', {
      endpoint: '/geocode/json',
      method: 'GET',
      params: {
        address,
        key: process.env.GOOGLE_MAPS_API_KEY || '',
      },
    }, tenant);
  }

  async getDirections(origin: string, destination: string, tenant?: string): Promise<APIResponse> {
    return this.gateway.request('google_maps', {
      endpoint: '/directions/json',
      method: 'GET',
      params: {
        origin,
        destination,
        key: process.env.GOOGLE_MAPS_API_KEY || '',
      },
    }, tenant);
  }

  async findNearbyPlaces(lat: number, lon: number, type: string, radius: number = 5000, tenant?: string): Promise<APIResponse> {
    return this.gateway.request('google_maps', {
      endpoint: '/place/nearbysearch/json',
      method: 'GET',
      params: {
        location: `${lat},${lon}`,
        radius: radius.toString(),
        type,
        key: process.env.GOOGLE_MAPS_API_KEY || '',
      },
    }, tenant);
  }
}

// SendGrid API
export class SendGridAPI {
  private gateway = APIGateway.getInstance();

  async sendEmail(to: string, subject: string, content: string, tenant?: string): Promise<APIResponse> {
    return this.gateway.request('sendgrid', {
      endpoint: '/mail/send',
      method: 'POST',
      data: {
        personalizations: [{
          to: [{ email: to }],
          subject,
        }],
        from: { email: process.env.SENDGRID_FROM_EMAIL || 'noreply@teereserve.golf' },
        content: [{
          type: 'text/html',
          value: content,
        }],
      },
    }, tenant);
  }

  async addToList(listId: string, email: string, firstName?: string, lastName?: string, tenant?: string): Promise<APIResponse> {
    return this.gateway.request('sendgrid', {
      endpoint: '/marketing/contacts',
      method: 'PUT',
      data: {
        list_ids: [listId],
        contacts: [{
          email,
          first_name: firstName,
          last_name: lastName,
        }],
      },
    }, tenant);
  }
}

// ClubPro API
export class ClubProAPI {
  private gateway = APIGateway.getInstance();

  async getTeeSheets(courseId: string, date: string, tenant?: string): Promise<APIResponse> {
    return this.gateway.request('clubpro', {
      endpoint: `/courses/${courseId}/tee-sheets`,
      method: 'GET',
      params: {
        date,
      },
    }, tenant);
  }

  async createBooking(courseId: string, bookingData: any, tenant?: string): Promise<APIResponse> {
    return this.gateway.request('clubpro', {
      endpoint: `/courses/${courseId}/bookings`,
      method: 'POST',
      data: bookingData,
    }, tenant);
  }
}

// Exportar instancias
export const apiGateway = APIGateway.getInstance();
export const weatherAPI = new WeatherAPI();
export const googleMapsAPI = new GoogleMapsAPI();
export const sendGridAPI = new SendGridAPI();
export const clubProAPI = new ClubProAPI();

