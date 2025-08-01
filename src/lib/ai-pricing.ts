import { getTenantId } from './tenant';
import { cacheService } from './cache-service';
import { monitoringService } from './monitoring-service';

// Tipos para IA de precios
export interface PricingData {
  fieldId: string;
  date: string;
  timeSlot: string;
  basePrice: number;
  currentPrice: number;
  demand: number;
  occupancy: number;
  weatherScore: number;
  seasonality: number;
  competition: number;
  events: string[];
  tenant: string;
}

export interface PricingRecommendation {
  fieldId: string;
  date: string;
  timeSlot: string;
  currentPrice: number;
  recommendedPrice: number;
  confidence: number;
  reasoning: string[];
  expectedDemand: number;
  expectedRevenue: number;
  factors: PricingFactors;
  tenant: string;
}

export interface PricingFactors {
  demand: number;
  weather: number;
  seasonality: number;
  competition: number;
  events: number;
  historical: number;
  dayOfWeek: number;
  timeOfDay: number;
}

export interface DemandPrediction {
  fieldId: string;
  date: string;
  timeSlot: string;
  predictedDemand: number;
  confidence: number;
  factors: {
    historical: number;
    weather: number;
    events: number;
    seasonality: number;
  };
  tenant: string;
}

export interface CompetitorData {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  distance: number;
  prices: { [timeSlot: string]: number };
  rating: number;
  amenities: string[];
  lastUpdated: number;
}

export interface PricingStrategy {
  id: string;
  name: string;
  description: string;
  type: 'dynamic' | 'fixed' | 'competitive' | 'demand_based' | 'ml_optimized';
  parameters: {
    minPrice?: number;
    maxPrice?: number;
    demandMultiplier?: number;
    weatherWeight?: number;
    competitionWeight?: number;
    seasonalityWeight?: number;
    updateFrequency?: number;
  };
  isActive: boolean;
  tenant: string;
}

// Clase principal para IA de precios
export class AIPricingService {
  private static instance: AIPricingService;
  private strategies: Map<string, PricingStrategy> = new Map();
  private historicalData: Map<string, PricingData[]> = new Map();
  private competitorData: Map<string, CompetitorData[]> = new Map();
  private models: Map<string, any> = new Map();

  private constructor() {
    this.initializeService();
  }

  public static getInstance(): AIPricingService {
    if (!AIPricingService.instance) {
      AIPricingService.instance = new AIPricingService();
    }
    return AIPricingService.instance;
  }

  private initializeService(): void {
    // Cargar estrategias por defecto
    this.loadDefaultStrategies();
    
    // Actualizar precios cada hora
    setInterval(() => {
      this.updateAllPrices();
    }, 60 * 60 * 1000);

    // Entrenar modelos diariamente
    setInterval(() => {
      this.trainModels();
    }, 24 * 60 * 60 * 1000);

    // Actualizar datos de competencia cada 6 horas
    setInterval(() => {
      this.updateCompetitorData();
    }, 6 * 60 * 60 * 1000);
  }

  private loadDefaultStrategies(): void {
    const defaultStrategies: PricingStrategy[] = [
      {
        id: 'dynamic_basic',
        name: 'Precios Dinámicos Básicos',
        description: 'Ajusta precios basado en demanda y ocupación',
        type: 'dynamic',
        parameters: {
          minPrice: 50,
          maxPrice: 200,
          demandMultiplier: 1.5,
          updateFrequency: 60,
        },
        isActive: true,
        tenant: 'default',
      },
      {
        id: 'weather_optimized',
        name: 'Optimizado por Clima',
        description: 'Considera condiciones climáticas en el precio',
        type: 'ml_optimized',
        parameters: {
          weatherWeight: 0.3,
          demandMultiplier: 1.2,
          updateFrequency: 30,
        },
        isActive: false,
        tenant: 'default',
      },
      {
        id: 'competitive',
        name: 'Precios Competitivos',
        description: 'Mantiene precios competitivos con otros campos',
        type: 'competitive',
        parameters: {
          competitionWeight: 0.4,
          demandMultiplier: 1.1,
          updateFrequency: 120,
        },
        isActive: false,
        tenant: 'default',
      },
    ];

    defaultStrategies.forEach(strategy => {
      this.strategies.set(`${strategy.tenant}:${strategy.id}`, strategy);
    });
  }

  // Obtener recomendación de precio
  async getPricingRecommendation(
    fieldId: string,
    date: string,
    timeSlot: string,
    tenant?: string
  ): Promise<PricingRecommendation | null> {
    const tenantId = tenant || getTenantId();
    const cacheKey = `pricing:recommendation:${fieldId}:${date}:${timeSlot}`;

    try {
      // Verificar caché
      const cached = await cacheService.get<PricingRecommendation>(cacheKey, { tenant: tenantId });
      if (cached) {
        return cached;
      }

      // Obtener datos necesarios
      const currentData = await this.getCurrentPricingData(fieldId, date, timeSlot, tenantId);
      if (!currentData) {
        return null;
      }

      // Obtener estrategia activa
      const strategy = this.getActiveStrategy(tenantId);
      if (!strategy) {
        return null;
      }

      // Calcular recomendación
      const recommendation = await this.calculateRecommendation(currentData, strategy);

      // Guardar en caché por 30 minutos
      await cacheService.set(cacheKey, recommendation, {
        tenant: tenantId,
        ttl: 1800,
        tags: ['pricing', `field:${fieldId}`],
      });

      // Registrar métricas
      monitoringService.recordMetric('pricing.recommendation_generated', 1, {
        field: fieldId,
        strategy: strategy.id,
      }, tenantId);

      return recommendation;
    } catch (error) {
      console.error('Error getting pricing recommendation:', error);
      monitoringService.recordMetric('pricing.recommendation_error', 1, {
        field: fieldId,
        error: (error as Error).message,
      }, tenantId);
      return null;
    }
  }

  // Obtener datos actuales de precios
  private async getCurrentPricingData(
    fieldId: string,
    date: string,
    timeSlot: string,
    tenant: string
  ): Promise<PricingData | null> {
    try {
      // Aquí se obtendrían los datos reales de la base de datos
      // Por ahora simulamos datos
      
      const demand = await this.calculateDemand(fieldId, date, timeSlot, tenant);
      const occupancy = await this.getOccupancy(fieldId, date, timeSlot, tenant);
      const weatherScore = await this.getWeatherScore(fieldId, date, tenant);
      const seasonality = this.calculateSeasonality(date);
      const competition = await this.getCompetitionScore(fieldId, date, timeSlot, tenant);

      return {
        fieldId,
        date,
        timeSlot,
        basePrice: 100, // Se obtendría de la configuración
        currentPrice: 120, // Se obtendría de la base de datos
        demand,
        occupancy,
        weatherScore,
        seasonality,
        competition,
        events: [], // Se obtendrían eventos locales
        tenant,
      };
    } catch (error) {
      console.error('Error getting current pricing data:', error);
      return null;
    }
  }

  // Calcular demanda
  private async calculateDemand(
    fieldId: string,
    date: string,
    timeSlot: string,
    tenant: string
  ): Promise<number> {
    try {
      // Obtener datos históricos
      const historical = await this.getHistoricalDemand(fieldId, date, timeSlot, tenant);
      
      // Obtener reservas actuales
      const currentBookings = await this.getCurrentBookings(fieldId, date, timeSlot, tenant);
      
      // Calcular demanda basada en tendencias
      const dayOfWeek = new Date(date).getDay();
      const hour = parseInt(timeSlot.split(':')[0]);
      
      let demandScore = historical;
      
      // Ajustar por día de la semana
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Fin de semana
        demandScore *= 1.3;
      }
      
      // Ajustar por hora del día
      if (hour >= 7 && hour <= 9) { // Horas pico matutinas
        demandScore *= 1.2;
      } else if (hour >= 16 && hour <= 18) { // Horas pico vespertinas
        demandScore *= 1.4;
      }
      
      // Ajustar por reservas actuales
      demandScore += currentBookings * 0.1;
      
      return Math.min(100, Math.max(0, demandScore));
    } catch (error) {
      console.error('Error calculating demand:', error);
      return 50; // Valor por defecto
    }
  }

  // Obtener demanda histórica
  private async getHistoricalDemand(
    fieldId: string,
    date: string,
    timeSlot: string,
    tenant: string
  ): Promise<number> {
    // Simular datos históricos
    const dayOfWeek = new Date(date).getDay();
    const hour = parseInt(timeSlot.split(':')[0]);
    
    let baseDemand = 60;
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      baseDemand = 80;
    }
    
    if (hour >= 7 && hour <= 9 || hour >= 16 && hour <= 18) {
      baseDemand += 15;
    }
    
    return baseDemand + Math.random() * 20 - 10;
  }

  // Obtener reservas actuales
  private async getCurrentBookings(
    fieldId: string,
    date: string,
    timeSlot: string,
    tenant: string
  ): Promise<number> {
    // Aquí se consultaría la base de datos
    return Math.floor(Math.random() * 10);
  }

  // Obtener ocupación
  private async getOccupancy(
    fieldId: string,
    date: string,
    timeSlot: string,
    tenant: string
  ): Promise<number> {
    // Simular ocupación basada en reservas
    const bookings = await this.getCurrentBookings(fieldId, date, timeSlot, tenant);
    const capacity = 20; // Capacidad máxima del campo
    
    return (bookings / capacity) * 100;
  }

  // Obtener puntuación del clima
  private async getWeatherScore(fieldId: string, date: string, tenant: string): Promise<number> {
    try {
      // Aquí se integraría con el servicio de clima
      // Por ahora simulamos
      return 75 + Math.random() * 25;
    } catch (error) {
      console.error('Error getting weather score:', error);
      return 75;
    }
  }

  // Calcular estacionalidad
  private calculateSeasonality(date: string): number {
    const month = new Date(date).getMonth();
    
    // Temporada alta: marzo-mayo, septiembre-noviembre
    if ((month >= 2 && month <= 4) || (month >= 8 && month <= 10)) {
      return 90;
    }
    
    // Temporada media: diciembre-febrero, junio-agosto
    return 70;
  }

  // Obtener puntuación de competencia
  private async getCompetitionScore(
    fieldId: string,
    date: string,
    timeSlot: string,
    tenant: string
  ): Promise<number> {
    try {
      const competitors = this.competitorData.get(`${tenant}:${fieldId}`) || [];
      if (competitors.length === 0) return 50;
      
      const avgCompetitorPrice = competitors.reduce((sum, comp) => {
        return sum + (comp.prices[timeSlot] || 100);
      }, 0) / competitors.length;
      
      // Normalizar a escala 0-100
      return Math.min(100, Math.max(0, (avgCompetitorPrice / 200) * 100));
    } catch (error) {
      console.error('Error getting competition score:', error);
      return 50;
    }
  }

  // Calcular recomendación
  private async calculateRecommendation(
    data: PricingData,
    strategy: PricingStrategy
  ): Promise<PricingRecommendation> {
    const factors: PricingFactors = {
      demand: data.demand,
      weather: data.weatherScore,
      seasonality: data.seasonality,
      competition: data.competition,
      events: data.events.length * 10,
      historical: await this.getHistoricalPerformance(data.fieldId, data.date, data.timeSlot, data.tenant),
      dayOfWeek: this.getDayOfWeekFactor(data.date),
      timeOfDay: this.getTimeOfDayFactor(data.timeSlot),
    };

    let recommendedPrice = data.basePrice;
    const reasoning: string[] = [];

    switch (strategy.type) {
      case 'dynamic':
        recommendedPrice = this.calculateDynamicPrice(data, factors, strategy, reasoning);
        break;
      case 'competitive':
        recommendedPrice = this.calculateCompetitivePrice(data, factors, strategy, reasoning);
        break;
      case 'ml_optimized':
        recommendedPrice = await this.calculateMLOptimizedPrice(data, factors, strategy, reasoning);
        break;
      default:
        recommendedPrice = data.currentPrice;
    }

    // Aplicar límites
    if (strategy.parameters.minPrice) {
      recommendedPrice = Math.max(recommendedPrice, strategy.parameters.minPrice);
    }
    if (strategy.parameters.maxPrice) {
      recommendedPrice = Math.min(recommendedPrice, strategy.parameters.maxPrice);
    }

    const confidence = this.calculateConfidence(factors, strategy);
    const expectedDemand = this.predictDemand(recommendedPrice, factors);
    const expectedRevenue = recommendedPrice * expectedDemand;

    return {
      fieldId: data.fieldId,
      date: data.date,
      timeSlot: data.timeSlot,
      currentPrice: data.currentPrice,
      recommendedPrice: Math.round(recommendedPrice),
      confidence,
      reasoning,
      expectedDemand,
      expectedRevenue,
      factors,
      tenant: data.tenant,
    };
  }

  // Calcular precio dinámico
  private calculateDynamicPrice(
    data: PricingData,
    factors: PricingFactors,
    strategy: PricingStrategy,
    reasoning: string[]
  ): number {
    let price = data.basePrice;
    const multiplier = strategy.parameters.demandMultiplier || 1.2;

    // Ajustar por demanda
    if (factors.demand > 80) {
      price *= multiplier;
      reasoning.push(`Alta demanda (${factors.demand}%) - incremento del ${((multiplier - 1) * 100).toFixed(0)}%`);
    } else if (factors.demand < 30) {
      price *= 0.9;
      reasoning.push(`Baja demanda (${factors.demand}%) - descuento del 10%`);
    }

    // Ajustar por clima
    if (factors.weather > 85) {
      price *= 1.1;
      reasoning.push(`Excelente clima (${factors.weather}%) - incremento del 10%`);
    } else if (factors.weather < 50) {
      price *= 0.85;
      reasoning.push(`Clima desfavorable (${factors.weather}%) - descuento del 15%`);
    }

    // Ajustar por estacionalidad
    if (factors.seasonality > 85) {
      price *= 1.15;
      reasoning.push(`Temporada alta - incremento del 15%`);
    }

    return price;
  }

  // Calcular precio competitivo
  private calculateCompetitivePrice(
    data: PricingData,
    factors: PricingFactors,
    strategy: PricingStrategy,
    reasoning: string[]
  ): number {
    const competitionWeight = strategy.parameters.competitionWeight || 0.4;
    const avgCompetitorPrice = factors.competition * 2; // Convertir de escala 0-100 a precio

    let price = data.basePrice * (1 - competitionWeight) + avgCompetitorPrice * competitionWeight;
    
    reasoning.push(`Precio ajustado por competencia (peso: ${(competitionWeight * 100).toFixed(0)}%)`);

    // Ajustar ligeramente por demanda
    if (factors.demand > 70) {
      price *= 1.05;
      reasoning.push(`Ajuste por demanda alta (+5%)`);
    }

    return price;
  }

  // Calcular precio optimizado por ML
  private async calculateMLOptimizedPrice(
    data: PricingData,
    factors: PricingFactors,
    strategy: PricingStrategy,
    reasoning: string[]
  ): Promise<number> {
    try {
      // Aquí se usaría un modelo de ML entrenado
      // Por ahora simulamos con una función compleja
      
      const weights = {
        demand: 0.3,
        weather: strategy.parameters.weatherWeight || 0.2,
        seasonality: 0.15,
        competition: 0.2,
        historical: 0.15,
      };

      let score = 0;
      score += factors.demand * weights.demand;
      score += factors.weather * weights.weather;
      score += factors.seasonality * weights.seasonality;
      score += factors.competition * weights.competition;
      score += factors.historical * weights.historical;

      const priceMultiplier = 0.8 + (score / 100) * 0.6; // Rango 0.8 - 1.4
      const price = data.basePrice * priceMultiplier;

      reasoning.push(`Precio optimizado por ML (score: ${score.toFixed(1)})`);
      reasoning.push(`Multiplicador aplicado: ${priceMultiplier.toFixed(2)}`);

      return price;
    } catch (error) {
      console.error('Error in ML pricing calculation:', error);
      return data.currentPrice;
    }
  }

  // Calcular confianza
  private calculateConfidence(factors: PricingFactors, strategy: PricingStrategy): number {
    // La confianza se basa en la calidad y cantidad de datos disponibles
    let confidence = 70; // Base

    // Aumentar confianza si tenemos buenos datos históricos
    if (factors.historical > 50) {
      confidence += 15;
    }

    // Aumentar confianza si la demanda es clara (muy alta o muy baja)
    if (factors.demand > 80 || factors.demand < 20) {
      confidence += 10;
    }

    // Reducir confianza si hay muchos factores inciertos
    const uncertainFactors = Object.values(factors).filter(f => f > 40 && f < 60).length;
    confidence -= uncertainFactors * 5;

    return Math.min(95, Math.max(30, confidence));
  }

  // Predecir demanda
  private predictDemand(price: number, factors: PricingFactors): number {
    // Función de demanda simplificada (elasticidad de precio)
    const baseDemand = factors.demand;
    const priceElasticity = -0.5; // Elasticidad típica para golf
    
    // Calcular cambio porcentual en precio vs precio base (100)
    const priceChange = (price - 100) / 100;
    
    // Aplicar elasticidad
    const demandChange = priceElasticity * priceChange;
    
    return Math.max(0, baseDemand * (1 + demandChange));
  }

  // Obtener rendimiento histórico
  private async getHistoricalPerformance(
    fieldId: string,
    date: string,
    timeSlot: string,
    tenant: string
  ): Promise<number> {
    // Simular datos históricos de rendimiento
    return 60 + Math.random() * 30;
  }

  // Factor día de la semana
  private getDayOfWeekFactor(date: string): number {
    const dayOfWeek = new Date(date).getDay();
    
    // Fin de semana tiene mayor demanda
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 85;
    }
    
    // Viernes también es popular
    if (dayOfWeek === 5) {
      return 75;
    }
    
    return 60;
  }

  // Factor hora del día
  private getTimeOfDayFactor(timeSlot: string): number {
    const hour = parseInt(timeSlot.split(':')[0]);
    
    // Horas pico matutinas
    if (hour >= 7 && hour <= 9) {
      return 90;
    }
    
    // Horas pico vespertinas
    if (hour >= 16 && hour <= 18) {
      return 95;
    }
    
    // Horas medias
    if (hour >= 10 && hour <= 15) {
      return 70;
    }
    
    // Horas bajas
    return 40;
  }

  // Obtener estrategia activa
  private getActiveStrategy(tenant: string): PricingStrategy | null {
    for (const [key, strategy] of this.strategies.entries()) {
      if (key.startsWith(`${tenant}:`) && strategy.isActive) {
        return strategy;
      }
    }
    
    // Fallback a estrategia por defecto
    return this.strategies.get('default:dynamic_basic') || null;
  }

  // Actualizar todos los precios
  private async updateAllPrices(): Promise<void> {
    console.log('Updating all prices...');
    
    // Aquí se implementaría la lógica para actualizar precios de todos los campos
    // basándose en las recomendaciones generadas
  }

  // Entrenar modelos
  private async trainModels(): Promise<void> {
    console.log('Training ML models...');
    
    // Aquí se implementaría el entrenamiento de modelos de ML
    // usando datos históricos de precios, demanda y revenue
  }

  // Actualizar datos de competencia
  private async updateCompetitorData(): Promise<void> {
    console.log('Updating competitor data...');
    
    // Aquí se implementaría la recopilación de datos de competencia
    // desde APIs públicas o web scraping
  }

  // Registrar estrategia personalizada
  registerStrategy(strategy: Omit<PricingStrategy, 'id'>): string {
    const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullStrategy: PricingStrategy = {
      ...strategy,
      id,
    };

    const key = `${strategy.tenant}:${id}`;
    this.strategies.set(key, fullStrategy);

    return id;
  }

  // Activar estrategia
  activateStrategy(strategyId: string, tenant?: string): boolean {
    const tenantId = tenant || getTenantId();
    
    // Desactivar todas las estrategias del tenant
    for (const [key, strategy] of this.strategies.entries()) {
      if (key.startsWith(`${tenantId}:`)) {
        strategy.isActive = false;
      }
    }
    
    // Activar la estrategia seleccionada
    const targetKey = `${tenantId}:${strategyId}`;
    const strategy = this.strategies.get(targetKey);
    
    if (strategy) {
      strategy.isActive = true;
      return true;
    }
    
    return false;
  }

  // Obtener estadísticas del servicio
  getServiceStats(tenant?: string): any {
    const tenantId = tenant || getTenantId();
    const strategiesForTenant = Array.from(this.strategies.values())
      .filter(strategy => strategy.tenant === tenantId);

    return {
      totalStrategies: strategiesForTenant.length,
      activeStrategy: strategiesForTenant.find(s => s.isActive)?.name || 'None',
      modelsLoaded: this.models.size,
      lastUpdate: Date.now(),
    };
  }
}

// Exportar instancia
export const aiPricingService = AIPricingService.getInstance();

