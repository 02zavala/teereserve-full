import { getTenantId } from '../tenant';
import { cacheService } from '../cache-service';
import { monitoringService } from '../monitoring-service';

// Tipos para Deep Learning
export interface DemandPredictionModel {
  id: string;
  name: string;
  version: string;
  type: 'lstm' | 'transformer' | 'cnn' | 'hybrid';
  accuracy: number;
  lastTrained: Date;
  features: string[];
  hyperparameters: Record<string, any>;
  tenant: string;
}

export interface PredictionInput {
  fieldId: string;
  date: string;
  timeSlot: string;
  historicalData: HistoricalDataPoint[];
  externalFactors: ExternalFactors;
  tenant: string;
}

export interface HistoricalDataPoint {
  date: string;
  timeSlot: string;
  bookings: number;
  revenue: number;
  weather: WeatherData;
  events: string[];
  dayOfWeek: number;
  isHoliday: boolean;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  cloudCover: number;
  uvIndex: number;
  visibility: number;
}

export interface ExternalFactors {
  localEvents: LocalEvent[];
  economicIndicators: EconomicIndicators;
  competitorPricing: CompetitorPricing[];
  seasonality: SeasonalityData;
  marketTrends: MarketTrend[];
}

export interface LocalEvent {
  name: string;
  type: 'sports' | 'cultural' | 'business' | 'holiday';
  impact: 'low' | 'medium' | 'high';
  distance: number;
  attendees: number;
}

export interface EconomicIndicators {
  gdpGrowth: number;
  unemployment: number;
  inflation: number;
  consumerConfidence: number;
  disposableIncome: number;
}

export interface CompetitorPricing {
  competitorId: string;
  distance: number;
  price: number;
  rating: number;
  amenities: string[];
}

export interface SeasonalityData {
  month: number;
  quarter: number;
  season: 'spring' | 'summer' | 'fall' | 'winter';
  touristSeason: boolean;
  schoolHolidays: boolean;
}

export interface MarketTrend {
  category: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  impact: number;
  confidence: number;
}

export interface DemandPrediction {
  fieldId: string;
  date: string;
  timeSlot: string;
  predictedDemand: number;
  confidence: number;
  probabilityDistribution: number[];
  factors: PredictionFactors;
  recommendations: string[];
  tenant: string;
}

export interface PredictionFactors {
  historical: number;
  weather: number;
  seasonality: number;
  events: number;
  economic: number;
  competition: number;
  trends: number;
}

export interface ModelPerformance {
  modelId: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mape: number; // Mean Absolute Percentage Error
  rmse: number; // Root Mean Square Error
  lastEvaluated: Date;
}

export interface TrainingData {
  features: number[][];
  targets: number[];
  metadata: TrainingMetadata;
}

export interface TrainingMetadata {
  startDate: string;
  endDate: string;
  sampleCount: number;
  featureNames: string[];
  normalizationParams: NormalizationParams;
}

export interface NormalizationParams {
  means: number[];
  stds: number[];
  mins: number[];
  maxs: number[];
}

// Clase principal para Deep Learning
export class DeepLearningService {
  private static instance: DeepLearningService;
  private models: Map<string, DemandPredictionModel> = new Map();
  private modelPerformance: Map<string, ModelPerformance> = new Map();
  private trainingQueue: Map<string, TrainingData> = new Map();

  private constructor() {
    this.initializeService();
  }

  public static getInstance(): DeepLearningService {
    if (!DeepLearningService.instance) {
      DeepLearningService.instance = new DeepLearningService();
    }
    return DeepLearningService.instance;
  }

  private initializeService(): void {
    // Cargar modelos pre-entrenados
    this.loadPretrainedModels();
    
    // Programar reentrenamiento automático
    setInterval(() => {
      this.retrainModels();
    }, 24 * 60 * 60 * 1000); // Cada 24 horas

    // Programar evaluación de performance
    setInterval(() => {
      this.evaluateModelPerformance();
    }, 6 * 60 * 60 * 1000); // Cada 6 horas
  }

  private loadPretrainedModels(): void {
    // Modelo LSTM para predicción de demanda
    const lstmModel: DemandPredictionModel = {
      id: 'lstm_demand_v1',
      name: 'LSTM Demand Predictor',
      version: '1.0.0',
      type: 'lstm',
      accuracy: 0.87,
      lastTrained: new Date(),
      features: [
        'historical_bookings',
        'day_of_week',
        'hour_of_day',
        'temperature',
        'precipitation',
        'wind_speed',
        'seasonality',
        'local_events',
        'competitor_pricing',
        'economic_indicators'
      ],
      hyperparameters: {
        sequence_length: 30,
        hidden_units: 128,
        dropout_rate: 0.2,
        learning_rate: 0.001,
        batch_size: 32,
        epochs: 100
      },
      tenant: 'default'
    };

    // Modelo Transformer para análisis complejo
    const transformerModel: DemandPredictionModel = {
      id: 'transformer_demand_v1',
      name: 'Transformer Demand Predictor',
      version: '1.0.0',
      type: 'transformer',
      accuracy: 0.91,
      lastTrained: new Date(),
      features: [
        'multivariate_time_series',
        'attention_weights',
        'contextual_embeddings',
        'cross_field_patterns',
        'market_dynamics'
      ],
      hyperparameters: {
        d_model: 256,
        num_heads: 8,
        num_layers: 6,
        dropout_rate: 0.1,
        learning_rate: 0.0001,
        warmup_steps: 4000
      },
      tenant: 'default'
    };

    this.models.set('default:lstm_demand_v1', lstmModel);
    this.models.set('default:transformer_demand_v1', transformerModel);
  }

  // Predicción de demanda con Deep Learning
  async predictDemand(input: PredictionInput): Promise<DemandPrediction> {
    const tenantId = input.tenant || getTenantId();
    const cacheKey = `ml:demand:${input.fieldId}:${input.date}:${input.timeSlot}`;

    try {
      // Verificar caché
      const cached = await cacheService.get<DemandPrediction>(cacheKey, { tenant: tenantId });
      if (cached) {
        return cached;
      }

      // Seleccionar el mejor modelo
      const model = await this.selectBestModel(tenantId);
      if (!model) {
        throw new Error('No model available for prediction');
      }

      // Preparar features
      const features = await this.prepareFeatures(input);
      
      // Realizar predicción
      const prediction = await this.runInference(model, features);
      
      // Calcular factores de influencia
      const factors = await this.calculatePredictionFactors(input, features);
      
      // Generar recomendaciones
      const recommendations = await this.generateRecommendations(prediction, factors);

      const result: DemandPrediction = {
        fieldId: input.fieldId,
        date: input.date,
        timeSlot: input.timeSlot,
        predictedDemand: prediction.demand,
        confidence: prediction.confidence,
        probabilityDistribution: prediction.distribution,
        factors,
        recommendations,
        tenant: tenantId
      };

      // Guardar en caché por 1 hora
      await cacheService.set(cacheKey, result, {
        tenant: tenantId,
        ttl: 3600,
        tags: ['ml', 'demand', `field:${input.fieldId}`]
      });

      // Registrar métricas
      monitoringService.recordMetric('ml.prediction_generated', 1, {
        model: model.id,
        field: input.fieldId,
        confidence: prediction.confidence.toString()
      }, tenantId);

      return result;
    } catch (error) {
      console.error('Error in demand prediction:', error);
      monitoringService.recordMetric('ml.prediction_error', 1, {
        field: input.fieldId,
        error: (error as Error).message
      }, tenantId);
      throw error;
    }
  }

  // Seleccionar el mejor modelo para un tenant
  private async selectBestModel(tenant: string): Promise<DemandPredictionModel | null> {
    const tenantModels = Array.from(this.models.values())
      .filter(model => model.tenant === tenant || model.tenant === 'default');

    if (tenantModels.length === 0) {
      return null;
    }

    // Seleccionar por accuracy y performance reciente
    return tenantModels.reduce((best, current) => {
      const bestPerf = this.modelPerformance.get(best.id);
      const currentPerf = this.modelPerformance.get(current.id);
      
      if (!bestPerf) return current;
      if (!currentPerf) return best;
      
      return currentPerf.accuracy > bestPerf.accuracy ? current : best;
    });
  }

  // Preparar features para el modelo
  private async prepareFeatures(input: PredictionInput): Promise<number[]> {
    const features: number[] = [];

    // Features temporales
    const date = new Date(input.date);
    features.push(
      date.getDay(), // Día de la semana
      parseInt(input.timeSlot.split(':')[0]), // Hora
      date.getMonth(), // Mes
      date.getDate(), // Día del mes
      this.isHoliday(date) ? 1 : 0 // Es feriado
    );

    // Features históricas
    const historicalFeatures = this.extractHistoricalFeatures(input.historicalData);
    features.push(...historicalFeatures);

    // Features de clima
    if (input.historicalData.length > 0) {
      const latestWeather = input.historicalData[input.historicalData.length - 1].weather;
      features.push(
        latestWeather.temperature,
        latestWeather.humidity,
        latestWeather.windSpeed,
        latestWeather.precipitation,
        latestWeather.cloudCover,
        latestWeather.uvIndex,
        latestWeather.visibility
      );
    }

    // Features de eventos externos
    const eventFeatures = this.extractEventFeatures(input.externalFactors.localEvents);
    features.push(...eventFeatures);

    // Features económicas
    const economicFeatures = this.extractEconomicFeatures(input.externalFactors.economicIndicators);
    features.push(...economicFeatures);

    // Features de competencia
    const competitorFeatures = this.extractCompetitorFeatures(input.externalFactors.competitorPricing);
    features.push(...competitorFeatures);

    // Features de estacionalidad
    const seasonalFeatures = this.extractSeasonalFeatures(input.externalFactors.seasonality);
    features.push(...seasonalFeatures);

    return features;
  }

  // Extraer features históricas
  private extractHistoricalFeatures(historicalData: HistoricalDataPoint[]): number[] {
    if (historicalData.length === 0) {
      return new Array(10).fill(0);
    }

    const recentData = historicalData.slice(-30); // Últimos 30 días
    
    const avgBookings = recentData.reduce((sum, d) => sum + d.bookings, 0) / recentData.length;
    const avgRevenue = recentData.reduce((sum, d) => sum + d.revenue, 0) / recentData.length;
    const trendBookings = this.calculateTrend(recentData.map(d => d.bookings));
    const trendRevenue = this.calculateTrend(recentData.map(d => d.revenue));
    const volatility = this.calculateVolatility(recentData.map(d => d.bookings));
    
    // Patrones por día de la semana
    const weekdayPattern = new Array(7).fill(0);
    recentData.forEach(d => {
      const dayOfWeek = new Date(d.date).getDay();
      weekdayPattern[dayOfWeek] += d.bookings;
    });
    
    const maxWeekdayBookings = Math.max(...weekdayPattern);
    const normalizedWeekdayPattern = weekdayPattern.map(v => maxWeekdayBookings > 0 ? v / maxWeekdayBookings : 0);

    return [
      avgBookings,
      avgRevenue,
      trendBookings,
      trendRevenue,
      volatility,
      ...normalizedWeekdayPattern.slice(0, 5) // Primeros 5 días
    ];
  }

  // Extraer features de eventos
  private extractEventFeatures(events: LocalEvent[]): number[] {
    const features = [
      events.length, // Número de eventos
      events.filter(e => e.impact === 'high').length, // Eventos de alto impacto
      events.filter(e => e.impact === 'medium').length, // Eventos de medio impacto
      events.filter(e => e.impact === 'low').length, // Eventos de bajo impacto
    ];

    // Distancia promedio de eventos
    const avgDistance = events.length > 0 
      ? events.reduce((sum, e) => sum + e.distance, 0) / events.length 
      : 0;
    features.push(avgDistance);

    // Asistentes totales estimados
    const totalAttendees = events.reduce((sum, e) => sum + e.attendees, 0);
    features.push(totalAttendees);

    return features;
  }

  // Extraer features económicas
  private extractEconomicFeatures(indicators: EconomicIndicators): number[] {
    return [
      indicators.gdpGrowth,
      indicators.unemployment,
      indicators.inflation,
      indicators.consumerConfidence,
      indicators.disposableIncome
    ];
  }

  // Extraer features de competencia
  private extractCompetitorFeatures(competitors: CompetitorPricing[]): number[] {
    if (competitors.length === 0) {
      return [0, 0, 0, 0, 0];
    }

    const avgPrice = competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length;
    const minPrice = Math.min(...competitors.map(c => c.price));
    const maxPrice = Math.max(...competitors.map(c => c.price));
    const avgRating = competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length;
    const avgDistance = competitors.reduce((sum, c) => sum + c.distance, 0) / competitors.length;

    return [avgPrice, minPrice, maxPrice, avgRating, avgDistance];
  }

  // Extraer features de estacionalidad
  private extractSeasonalFeatures(seasonality: SeasonalityData): number[] {
    return [
      seasonality.month,
      seasonality.quarter,
      seasonality.season === 'spring' ? 1 : 0,
      seasonality.season === 'summer' ? 1 : 0,
      seasonality.season === 'fall' ? 1 : 0,
      seasonality.season === 'winter' ? 1 : 0,
      seasonality.touristSeason ? 1 : 0,
      seasonality.schoolHolidays ? 1 : 0
    ];
  }

  // Ejecutar inferencia del modelo
  private async runInference(model: DemandPredictionModel, features: number[]): Promise<{
    demand: number;
    confidence: number;
    distribution: number[];
  }> {
    try {
      // Simular inferencia de modelo de deep learning
      // En producción, esto se conectaría a TensorFlow.js o una API de ML
      
      const normalizedFeatures = this.normalizeFeatures(features, model);
      
      // Simulación de predicción LSTM/Transformer
      let prediction = 0;
      let confidence = 0;
      
      if (model.type === 'lstm') {
        prediction = this.simulateLSTMPrediction(normalizedFeatures);
        confidence = this.calculateLSTMConfidence(normalizedFeatures);
      } else if (model.type === 'transformer') {
        prediction = this.simulateTransformerPrediction(normalizedFeatures);
        confidence = this.calculateTransformerConfidence(normalizedFeatures);
      }

      // Generar distribución de probabilidad
      const distribution = this.generateProbabilityDistribution(prediction, confidence);

      return {
        demand: Math.max(0, prediction),
        confidence: Math.min(1, Math.max(0, confidence)),
        distribution
      };
    } catch (error) {
      console.error('Error in model inference:', error);
      throw new Error('Model inference failed');
    }
  }

  // Normalizar features
  private normalizeFeatures(features: number[], model: DemandPredictionModel): number[] {
    // En producción, usar parámetros de normalización guardados del entrenamiento
    return features.map(f => {
      // Z-score normalization simulada
      const mean = 50; // Valor medio simulado
      const std = 20; // Desviación estándar simulada
      return (f - mean) / std;
    });
  }

  // Simular predicción LSTM
  private simulateLSTMPrediction(features: number[]): number {
    // Simulación de red LSTM
    let output = 0;
    const weights = [0.1, 0.2, 0.15, 0.3, 0.25]; // Pesos simulados
    
    for (let i = 0; i < Math.min(features.length, weights.length); i++) {
      output += features[i] * weights[i];
    }
    
    // Aplicar función de activación (sigmoid)
    output = 1 / (1 + Math.exp(-output));
    
    // Escalar a rango de demanda (0-100)
    return output * 100;
  }

  // Simular predicción Transformer
  private simulateTransformerPrediction(features: number[]): number {
    // Simulación de arquitectura Transformer con attention
    const attentionWeights = this.calculateAttentionWeights(features);
    
    let output = 0;
    for (let i = 0; i < features.length; i++) {
      output += features[i] * attentionWeights[i];
    }
    
    // Aplicar capas feed-forward simuladas
    output = Math.tanh(output * 0.5);
    
    // Escalar a rango de demanda
    return (output + 1) * 50; // Rango 0-100
  }

  // Calcular pesos de atención
  private calculateAttentionWeights(features: number[]): number[] {
    const weights = features.map(f => Math.exp(f));
    const sum = weights.reduce((a, b) => a + b, 0);
    return weights.map(w => w / sum);
  }

  // Calcular confianza LSTM
  private calculateLSTMConfidence(features: number[]): number {
    const variance = this.calculateVariance(features);
    return Math.exp(-variance * 0.1); // Confianza inversamente proporcional a la varianza
  }

  // Calcular confianza Transformer
  private calculateTransformerConfidence(features: number[]): number {
    const attentionWeights = this.calculateAttentionWeights(features);
    const entropy = -attentionWeights.reduce((sum, w) => sum + w * Math.log(w + 1e-8), 0);
    return Math.exp(-entropy * 0.5); // Confianza inversamente proporcional a la entropía
  }

  // Generar distribución de probabilidad
  private generateProbabilityDistribution(prediction: number, confidence: number): number[] {
    const distribution = new Array(101).fill(0); // 0-100 demanda
    const std = (1 - confidence) * 20; // Mayor incertidumbre = mayor desviación
    
    for (let i = 0; i <= 100; i++) {
      // Distribución normal centrada en la predicción
      const prob = Math.exp(-Math.pow(i - prediction, 2) / (2 * std * std));
      distribution[i] = prob;
    }
    
    // Normalizar
    const sum = distribution.reduce((a, b) => a + b, 0);
    return distribution.map(p => p / sum);
  }

  // Calcular factores de predicción
  private async calculatePredictionFactors(
    input: PredictionInput, 
    features: number[]
  ): Promise<PredictionFactors> {
    // Análisis de importancia de features usando SHAP simulado
    const featureImportance = this.calculateFeatureImportance(features);
    
    return {
      historical: featureImportance.historical,
      weather: featureImportance.weather,
      seasonality: featureImportance.seasonality,
      events: featureImportance.events,
      economic: featureImportance.economic,
      competition: featureImportance.competition,
      trends: featureImportance.trends
    };
  }

  // Calcular importancia de features
  private calculateFeatureImportance(features: number[]): PredictionFactors {
    // Simulación de análisis SHAP
    const totalImportance = features.reduce((sum, f) => sum + Math.abs(f), 0);
    
    return {
      historical: Math.abs(features[0] || 0) / totalImportance * 100,
      weather: Math.abs(features[5] || 0) / totalImportance * 100,
      seasonality: Math.abs(features[10] || 0) / totalImportance * 100,
      events: Math.abs(features[15] || 0) / totalImportance * 100,
      economic: Math.abs(features[20] || 0) / totalImportance * 100,
      competition: Math.abs(features[25] || 0) / totalImportance * 100,
      trends: Math.abs(features[30] || 0) / totalImportance * 100
    };
  }

  // Generar recomendaciones
  private async generateRecommendations(
    prediction: { demand: number; confidence: number },
    factors: PredictionFactors
  ): Promise<string[]> {
    const recommendations: string[] = [];

    if (prediction.demand > 80) {
      recommendations.push('Alta demanda predicha - considerar incrementar precios');
      recommendations.push('Preparar personal adicional para el horario');
    } else if (prediction.demand < 30) {
      recommendations.push('Baja demanda predicha - considerar promociones especiales');
      recommendations.push('Oportunidad para mantenimiento del campo');
    }

    if (prediction.confidence < 0.7) {
      recommendations.push('Predicción con incertidumbre - monitorear de cerca');
    }

    if (factors.weather > 30) {
      recommendations.push('Clima es factor importante - revisar pronóstico actualizado');
    }

    if (factors.events > 25) {
      recommendations.push('Eventos locales influyen significativamente');
    }

    return recommendations;
  }

  // Entrenar modelo
  async trainModel(
    modelId: string,
    trainingData: TrainingData,
    tenant?: string
  ): Promise<boolean> {
    const tenantId = tenant || getTenantId();
    
    try {
      console.log(`Training model ${modelId} for tenant ${tenantId}...`);
      
      // Simular entrenamiento
      await this.simulateTraining(modelId, trainingData);
      
      // Actualizar modelo
      const model = this.models.get(`${tenantId}:${modelId}`);
      if (model) {
        model.lastTrained = new Date();
        model.accuracy = 0.85 + Math.random() * 0.1; // Simular mejora
      }

      monitoringService.recordMetric('ml.model_trained', 1, {
        model: modelId,
        samples: trainingData.features.length.toString()
      }, tenantId);

      return true;
    } catch (error) {
      console.error('Error training model:', error);
      return false;
    }
  }

  // Simular entrenamiento
  private async simulateTraining(modelId: string, trainingData: TrainingData): Promise<void> {
    // Simular tiempo de entrenamiento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`Model ${modelId} trained with ${trainingData.features.length} samples`);
  }

  // Evaluar performance del modelo
  private async evaluateModelPerformance(): Promise<void> {
    console.log('Evaluating model performance...');
    
    for (const [key, model] of this.models.entries()) {
      try {
        // Simular evaluación
        const performance: ModelPerformance = {
          modelId: model.id,
          accuracy: 0.8 + Math.random() * 0.15,
          precision: 0.75 + Math.random() * 0.2,
          recall: 0.7 + Math.random() * 0.25,
          f1Score: 0.72 + Math.random() * 0.23,
          mape: 5 + Math.random() * 10,
          rmse: 8 + Math.random() * 12,
          lastEvaluated: new Date()
        };

        this.modelPerformance.set(model.id, performance);
        
        monitoringService.recordMetric('ml.model_accuracy', performance.accuracy, {
          model: model.id
        }, model.tenant);
      } catch (error) {
        console.error(`Error evaluating model ${model.id}:`, error);
      }
    }
  }

  // Reentrenar modelos
  private async retrainModels(): Promise<void> {
    console.log('Starting automatic model retraining...');
    
    for (const [key, model] of this.models.entries()) {
      try {
        // Verificar si necesita reentrenamiento
        const daysSinceTraining = (Date.now() - model.lastTrained.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceTraining > 7) { // Reentrenar cada semana
          const trainingData = await this.generateTrainingData(model.tenant);
          await this.trainModel(model.id, trainingData, model.tenant);
        }
      } catch (error) {
        console.error(`Error retraining model ${model.id}:`, error);
      }
    }
  }

  // Generar datos de entrenamiento
  private async generateTrainingData(tenant: string): Promise<TrainingData> {
    // En producción, esto obtendría datos reales de la base de datos
    const features: number[][] = [];
    const targets: number[] = [];
    
    // Simular datos de entrenamiento
    for (let i = 0; i < 1000; i++) {
      const feature = new Array(35).fill(0).map(() => Math.random() * 100);
      const target = Math.random() * 100;
      
      features.push(feature);
      targets.push(target);
    }

    return {
      features,
      targets,
      metadata: {
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        sampleCount: features.length,
        featureNames: [
          'day_of_week', 'hour', 'month', 'day_of_month', 'is_holiday',
          'avg_bookings', 'avg_revenue', 'trend_bookings', 'trend_revenue', 'volatility',
          'temperature', 'humidity', 'wind_speed', 'precipitation', 'cloud_cover',
          'event_count', 'high_impact_events', 'avg_event_distance', 'total_attendees',
          'gdp_growth', 'unemployment', 'inflation', 'consumer_confidence', 'disposable_income',
          'avg_competitor_price', 'min_competitor_price', 'max_competitor_price', 'avg_rating',
          'month_seasonal', 'quarter_seasonal', 'tourist_season', 'school_holidays'
        ],
        normalizationParams: {
          means: new Array(35).fill(50),
          stds: new Array(35).fill(20),
          mins: new Array(35).fill(0),
          maxs: new Array(35).fill(100)
        }
      }
    };
  }

  // Utilidades matemáticas
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  private isHoliday(date: Date): boolean {
    // Simplificado - en producción usar librería de feriados
    const month = date.getMonth();
    const day = date.getDate();
    
    // Algunos feriados fijos
    return (month === 0 && day === 1) || // Año nuevo
           (month === 11 && day === 25) || // Navidad
           (month === 6 && day === 4); // Día de la independencia (US)
  }

  // Obtener estadísticas del servicio
  getServiceStats(tenant?: string): any {
    const tenantId = tenant || getTenantId();
    const modelsForTenant = Array.from(this.models.values())
      .filter(model => model.tenant === tenantId || model.tenant === 'default');

    const performanceStats = modelsForTenant.map(model => {
      const perf = this.modelPerformance.get(model.id);
      return {
        modelId: model.id,
        accuracy: perf?.accuracy || 0,
        lastEvaluated: perf?.lastEvaluated || null
      };
    });

    return {
      totalModels: modelsForTenant.length,
      averageAccuracy: performanceStats.reduce((sum, p) => sum + p.accuracy, 0) / performanceStats.length,
      bestModel: performanceStats.reduce((best, current) => 
        current.accuracy > best.accuracy ? current : best, performanceStats[0]),
      lastTraining: Math.max(...modelsForTenant.map(m => m.lastTrained.getTime())),
      modelsPerformance: performanceStats
    };
  }
}

// Exportar instancia
export const deepLearningService = DeepLearningService.getInstance();

