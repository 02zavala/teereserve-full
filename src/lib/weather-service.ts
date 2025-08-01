import { getTenantId } from './tenant';
import { weatherAPI } from './external-integrations/api-gateway';
import { cacheService } from './cache-service';
import { monitoringService } from './monitoring-service';

// Tipos para el servicio de clima
export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  cloudCover: number;
  precipitation: number;
  condition: string;
  description: string;
  icon: string;
  timestamp: number;
}

export interface WeatherForecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  description: string;
  icon: string;
  precipitation: number;
  precipitationChance: number;
  windSpeed: number;
  humidity: number;
}

export interface WeatherAlert {
  id: string;
  type: 'severe_weather' | 'rain' | 'wind' | 'temperature' | 'uv_index';
  severity: 'low' | 'medium' | 'high' | 'extreme';
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  affectedFields: string[];
  recommendations: string[];
  tenant: string;
}

export interface FieldLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  tenant: string;
}

export interface WeatherConditions {
  playable: boolean;
  score: number; // 0-100, donde 100 es perfecto
  factors: {
    temperature: number;
    precipitation: number;
    wind: number;
    visibility: number;
    overall: number;
  };
  recommendations: string[];
  alerts: WeatherAlert[];
}

// Clase principal del servicio de clima
export class WeatherService {
  private static instance: WeatherService;
  private fieldLocations: Map<string, FieldLocation> = new Map();
  private activeAlerts: Map<string, WeatherAlert[]> = new Map();
  private weatherThresholds = {
    temperature: { min: 5, max: 40 }, // Celsius
    windSpeed: { max: 25 }, // km/h
    precipitation: { max: 2 }, // mm/h
    visibility: { min: 1000 }, // metros
    uvIndex: { max: 8 },
  };

  private constructor() {
    this.initializeService();
  }

  public static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  private initializeService(): void {
    // Actualizar datos meteorológicos cada 15 minutos
    setInterval(() => {
      this.updateAllFieldsWeather();
    }, 15 * 60 * 1000);

    // Verificar alertas cada 5 minutos
    setInterval(() => {
      this.checkWeatherAlerts();
    }, 5 * 60 * 1000);
  }

  // Registrar ubicación de campo
  registerField(field: FieldLocation): void {
    const key = `${field.tenant}:${field.id}`;
    this.fieldLocations.set(key, field);
    console.log(`Field registered for weather monitoring: ${field.name}`);
  }

  // Obtener clima actual
  async getCurrentWeather(fieldId: string, tenant?: string): Promise<WeatherData | null> {
    const tenantId = tenant || getTenantId();
    const field = this.getField(fieldId, tenantId);
    
    if (!field) {
      console.error(`Field not found: ${fieldId}`);
      return null;
    }

    const cacheKey = `weather:current:${fieldId}`;
    
    try {
      // Intentar obtener del caché primero
      const cached = await cacheService.get<WeatherData>(cacheKey, { tenant: tenantId });
      if (cached) {
        return cached;
      }

      // Obtener datos de la API
      const response = await weatherAPI.getCurrentWeather(field.latitude, field.longitude, tenantId);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch weather data');
      }

      const weatherData = this.parseCurrentWeather(response.data);
      
      // Guardar en caché por 10 minutos
      await cacheService.set(cacheKey, weatherData, {
        tenant: tenantId,
        ttl: 600,
        tags: ['weather', `field:${fieldId}`],
      });

      // Registrar métricas
      monitoringService.recordMetric('weather.api_call', 1, {
        field: fieldId,
        type: 'current',
      }, tenantId);

      return weatherData;
    } catch (error) {
      console.error('Error fetching current weather:', error);
      monitoringService.recordMetric('weather.api_error', 1, {
        field: fieldId,
        error: (error as Error).message,
      }, tenantId);
      return null;
    }
  }

  // Obtener pronóstico
  async getForecast(fieldId: string, days: number = 5, tenant?: string): Promise<WeatherForecast[]> {
    const tenantId = tenant || getTenantId();
    const field = this.getField(fieldId, tenantId);
    
    if (!field) {
      console.error(`Field not found: ${fieldId}`);
      return [];
    }

    const cacheKey = `weather:forecast:${fieldId}:${days}`;
    
    try {
      // Intentar obtener del caché primero
      const cached = await cacheService.get<WeatherForecast[]>(cacheKey, { tenant: tenantId });
      if (cached) {
        return cached;
      }

      // Obtener datos de la API
      const response = await weatherAPI.getForecast(field.latitude, field.longitude, days, tenantId);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch forecast data');
      }

      const forecast = this.parseForecast(response.data);
      
      // Guardar en caché por 30 minutos
      await cacheService.set(cacheKey, forecast, {
        tenant: tenantId,
        ttl: 1800,
        tags: ['weather', `field:${fieldId}`],
      });

      // Registrar métricas
      monitoringService.recordMetric('weather.api_call', 1, {
        field: fieldId,
        type: 'forecast',
        days: days.toString(),
      }, tenantId);

      return forecast;
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      monitoringService.recordMetric('weather.api_error', 1, {
        field: fieldId,
        error: (error as Error).message,
      }, tenantId);
      return [];
    }
  }

  // Evaluar condiciones de juego
  async evaluatePlayingConditions(fieldId: string, tenant?: string): Promise<WeatherConditions | null> {
    const tenantId = tenant || getTenantId();
    const weather = await this.getCurrentWeather(fieldId, tenantId);
    
    if (!weather) {
      return null;
    }

    const factors = {
      temperature: this.evaluateTemperature(weather.temperature),
      precipitation: this.evaluatePrecipitation(weather.precipitation),
      wind: this.evaluateWind(weather.windSpeed),
      visibility: this.evaluateVisibility(weather.visibility),
      overall: 0,
    };

    // Calcular puntuación general
    factors.overall = (factors.temperature + factors.precipitation + factors.wind + factors.visibility) / 4;

    const playable = factors.overall >= 60; // Umbral mínimo para jugar
    const recommendations = this.generateRecommendations(weather, factors);
    const alerts = await this.getActiveAlerts(fieldId, tenantId);

    return {
      playable,
      score: Math.round(factors.overall),
      factors,
      recommendations,
      alerts,
    };
  }

  // Evaluar temperatura
  private evaluateTemperature(temp: number): number {
    const { min, max } = this.weatherThresholds.temperature;
    
    if (temp < min || temp > max) {
      return 20; // Condiciones extremas
    }
    
    // Temperatura ideal entre 15-25°C
    if (temp >= 15 && temp <= 25) {
      return 100;
    }
    
    // Calcular puntuación basada en distancia de la temperatura ideal
    const ideal = 20;
    const distance = Math.abs(temp - ideal);
    return Math.max(20, 100 - (distance * 8));
  }

  // Evaluar precipitación
  private evaluatePrecipitation(precip: number): number {
    if (precip === 0) return 100;
    if (precip <= 0.5) return 80;
    if (precip <= 1) return 60;
    if (precip <= 2) return 40;
    return 20;
  }

  // Evaluar viento
  private evaluateWind(windSpeed: number): number {
    if (windSpeed <= 10) return 100;
    if (windSpeed <= 15) return 80;
    if (windSpeed <= 20) return 60;
    if (windSpeed <= 25) return 40;
    return 20;
  }

  // Evaluar visibilidad
  private evaluateVisibility(visibility: number): number {
    if (visibility >= 10000) return 100;
    if (visibility >= 5000) return 80;
    if (visibility >= 2000) return 60;
    if (visibility >= 1000) return 40;
    return 20;
  }

  // Generar recomendaciones
  private generateRecommendations(weather: WeatherData, factors: any): string[] {
    const recommendations: string[] = [];

    if (factors.temperature < 60) {
      if (weather.temperature < 10) {
        recommendations.push('Temperatura muy baja - usar ropa de abrigo');
      } else if (weather.temperature > 35) {
        recommendations.push('Temperatura muy alta - mantenerse hidratado y usar protección solar');
      }
    }

    if (factors.precipitation < 80) {
      if (weather.precipitation > 0) {
        recommendations.push('Lluvia presente - considerar posponer el juego');
      }
    }

    if (factors.wind < 60) {
      recommendations.push('Viento fuerte - ajustar la estrategia de juego');
    }

    if (factors.visibility < 80) {
      recommendations.push('Visibilidad reducida - extremar precauciones');
    }

    if (weather.uvIndex > 6) {
      recommendations.push('Índice UV alto - usar protección solar');
    }

    return recommendations;
  }

  // Verificar alertas meteorológicas
  private async checkWeatherAlerts(): Promise<void> {
    for (const [key, field] of this.fieldLocations.entries()) {
      try {
        const weather = await this.getCurrentWeather(field.id, field.tenant);
        if (!weather) continue;

        const alerts = this.generateAlerts(field, weather);
        
        if (alerts.length > 0) {
          this.activeAlerts.set(key, alerts);
          await this.notifyAlerts(field, alerts);
        } else {
          this.activeAlerts.delete(key);
        }
      } catch (error) {
        console.error(`Error checking alerts for field ${field.id}:`, error);
      }
    }
  }

  // Generar alertas
  private generateAlerts(field: FieldLocation, weather: WeatherData): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];
    const now = Date.now();

    // Alerta de lluvia
    if (weather.precipitation > 1) {
      alerts.push({
        id: `rain_${field.id}_${now}`,
        type: 'rain',
        severity: weather.precipitation > 5 ? 'high' : 'medium',
        title: 'Alerta de Lluvia',
        description: `Lluvia intensa detectada (${weather.precipitation}mm/h)`,
        startTime: now,
        endTime: now + 3600000, // 1 hora
        affectedFields: [field.id],
        recommendations: ['Considerar cancelar reservas', 'Cerrar áreas expuestas'],
        tenant: field.tenant,
      });
    }

    // Alerta de viento
    if (weather.windSpeed > 25) {
      alerts.push({
        id: `wind_${field.id}_${now}`,
        type: 'wind',
        severity: weather.windSpeed > 40 ? 'high' : 'medium',
        title: 'Alerta de Viento Fuerte',
        description: `Vientos fuertes detectados (${weather.windSpeed} km/h)`,
        startTime: now,
        endTime: now + 3600000,
        affectedFields: [field.id],
        recommendations: ['Extremar precauciones', 'Asegurar objetos sueltos'],
        tenant: field.tenant,
      });
    }

    // Alerta de temperatura extrema
    if (weather.temperature < 0 || weather.temperature > 40) {
      alerts.push({
        id: `temp_${field.id}_${now}`,
        type: 'temperature',
        severity: 'high',
        title: 'Temperatura Extrema',
        description: `Temperatura extrema detectada (${weather.temperature}°C)`,
        startTime: now,
        endTime: now + 7200000, // 2 horas
        affectedFields: [field.id],
        recommendations: weather.temperature < 0 
          ? ['Riesgo de hielo', 'Cerrar campo si es necesario']
          : ['Riesgo de golpe de calor', 'Proporcionar hidratación'],
        tenant: field.tenant,
      });
    }

    // Alerta de UV alto
    if (weather.uvIndex > 8) {
      alerts.push({
        id: `uv_${field.id}_${now}`,
        type: 'uv_index',
        severity: 'medium',
        title: 'Índice UV Muy Alto',
        description: `Índice UV peligroso (${weather.uvIndex})`,
        startTime: now,
        endTime: now + 14400000, // 4 horas
        affectedFields: [field.id],
        recommendations: ['Usar protección solar', 'Buscar sombra frecuentemente'],
        tenant: field.tenant,
      });
    }

    return alerts;
  }

  // Notificar alertas
  private async notifyAlerts(field: FieldLocation, alerts: WeatherAlert[]): Promise<void> {
    for (const alert of alerts) {
      try {
        // Enviar notificación a administradores del campo
        // Aquí se integraría con el sistema de notificaciones
        console.log(`Weather alert for ${field.name}:`, alert);
        
        // Registrar métrica
        monitoringService.recordMetric('weather.alert_generated', 1, {
          field: field.id,
          type: alert.type,
          severity: alert.severity,
        }, field.tenant);
      } catch (error) {
        console.error('Error sending weather alert:', error);
      }
    }
  }

  // Obtener alertas activas
  async getActiveAlerts(fieldId: string, tenant?: string): Promise<WeatherAlert[]> {
    const tenantId = tenant || getTenantId();
    const key = `${tenantId}:${fieldId}`;
    return this.activeAlerts.get(key) || [];
  }

  // Actualizar clima de todos los campos
  private async updateAllFieldsWeather(): Promise<void> {
    console.log('Updating weather for all fields...');
    
    for (const [key, field] of this.fieldLocations.entries()) {
      try {
        await this.getCurrentWeather(field.id, field.tenant);
      } catch (error) {
        console.error(`Error updating weather for field ${field.id}:`, error);
      }
    }
  }

  // Obtener campo
  private getField(fieldId: string, tenant: string): FieldLocation | null {
    const key = `${tenant}:${fieldId}`;
    return this.fieldLocations.get(key) || null;
  }

  // Parsear datos de clima actual
  private parseCurrentWeather(data: any): WeatherData {
    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed * 3.6, // Convertir m/s a km/h
      windDirection: data.wind.deg,
      pressure: data.main.pressure,
      visibility: data.visibility,
      uvIndex: data.uvi || 0,
      cloudCover: data.clouds.all,
      precipitation: data.rain?.['1h'] || data.snow?.['1h'] || 0,
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      timestamp: Date.now(),
    };
  }

  // Parsear pronóstico
  private parseForecast(data: any): WeatherForecast[] {
    const forecast: WeatherForecast[] = [];
    const dailyData: { [key: string]: any[] } = {};

    // Agrupar por día
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = [];
      }
      dailyData[date].push(item);
    });

    // Procesar cada día
    Object.entries(dailyData).forEach(([date, items]) => {
      const temps = items.map(item => item.main.temp);
      const precipitations = items.map(item => item.rain?.['3h'] || item.snow?.['3h'] || 0);
      const conditions = items.map(item => item.weather[0]);
      
      // Encontrar condición más significativa del día
      const mainCondition = conditions.find(c => c.main !== 'Clear') || conditions[0];

      forecast.push({
        date,
        high: Math.max(...temps),
        low: Math.min(...temps),
        condition: mainCondition.main,
        description: mainCondition.description,
        icon: mainCondition.icon,
        precipitation: Math.max(...precipitations),
        precipitationChance: items.filter(item => 
          (item.rain?.['3h'] || item.snow?.['3h'] || 0) > 0
        ).length / items.length * 100,
        windSpeed: items.reduce((sum, item) => sum + item.wind.speed, 0) / items.length * 3.6,
        humidity: items.reduce((sum, item) => sum + item.main.humidity, 0) / items.length,
      });
    });

    return forecast;
  }

  // Configurar umbrales personalizados
  setWeatherThresholds(thresholds: Partial<typeof this.weatherThresholds>): void {
    this.weatherThresholds = { ...this.weatherThresholds, ...thresholds };
  }

  // Obtener estadísticas del servicio
  getServiceStats(tenant?: string): any {
    const tenantId = tenant || getTenantId();
    const fieldsForTenant = Array.from(this.fieldLocations.values())
      .filter(field => field.tenant === tenantId);
    
    const alertsForTenant = Array.from(this.activeAlerts.entries())
      .filter(([key]) => key.startsWith(`${tenantId}:`))
      .reduce((sum, [, alerts]) => sum + alerts.length, 0);

    return {
      registeredFields: fieldsForTenant.length,
      activeAlerts: alertsForTenant,
      thresholds: this.weatherThresholds,
      lastUpdate: Date.now(),
    };
  }
}

// Exportar instancia
export const weatherService = WeatherService.getInstance();

