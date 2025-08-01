import { getTenantId } from '../tenant';
import { cacheService } from '../cache-service';
import { monitoringService } from '../monitoring-service';
import { iotGateway } from './iot-gateway';

// Tipos para Smart Irrigation
export interface IrrigationZone {
  id: string;
  name: string;
  fieldId: string;
  area: number; // m²
  grassType: GrassType;
  soilType: SoilType;
  location: ZoneLocation;
  sensors: ZoneSensor[];
  sprinklers: Sprinkler[];
  configuration: ZoneConfiguration;
  status: ZoneStatus;
  tenant: string;
}

export type GrassType = 
  | 'bermuda'
  | 'bentgrass'
  | 'zoysia'
  | 'fescue'
  | 'ryegrass'
  | 'kikuyu'
  | 'paspalum';

export type SoilType = 
  | 'clay'
  | 'sand'
  | 'loam'
  | 'silt'
  | 'clay_loam'
  | 'sandy_loam'
  | 'silty_loam';

export interface ZoneLocation {
  centerLatitude: number;
  centerLongitude: number;
  boundaries: GeoPoint[];
  elevation: number;
  slope: number;
  exposure: 'full_sun' | 'partial_sun' | 'shade';
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface ZoneSensor {
  id: string;
  type: SensorType;
  location: GeoPoint;
  depth?: number; // Para sensores de suelo
  status: 'active' | 'inactive' | 'maintenance';
  lastReading: Date;
  batteryLevel?: number;
}

export type SensorType = 
  | 'soil_moisture'
  | 'soil_temperature'
  | 'ambient_temperature'
  | 'humidity'
  | 'light_intensity'
  | 'wind_speed'
  | 'rain_gauge'
  | 'flow_meter'
  | 'pressure_sensor';

export interface Sprinkler {
  id: string;
  type: SprinklerType;
  location: GeoPoint;
  coverage: CoverageArea;
  flowRate: number; // L/min
  pressure: number; // bar
  status: SprinklerStatus;
  lastMaintenance: Date;
  efficiency: number; // %
}

export type SprinklerType = 
  | 'rotary'
  | 'spray'
  | 'drip'
  | 'micro_spray'
  | 'impact'
  | 'gear_driven';

export interface CoverageArea {
  radius: number; // metros
  angle: number; // grados
  pattern: 'full_circle' | 'part_circle' | 'square' | 'strip';
}

export interface SprinklerStatus {
  active: boolean;
  currentFlow: number;
  currentPressure: number;
  health: 'excellent' | 'good' | 'warning' | 'critical';
  issues: SprinklerIssue[];
}

export interface SprinklerIssue {
  type: 'clogged' | 'low_pressure' | 'misaligned' | 'damaged' | 'leak';
  severity: 'low' | 'medium' | 'high';
  description: string;
  detectedAt: Date;
}

export interface ZoneConfiguration {
  targetMoisture: MoistureTarget;
  irrigationSchedule: IrrigationSchedule;
  wateringRules: WateringRule[];
  seasonalAdjustments: SeasonalAdjustment[];
  emergencySettings: EmergencySettings;
}

export interface MoistureTarget {
  optimal: number; // %
  minimum: number; // %
  maximum: number; // %
  criticalLow: number; // %
}

export interface IrrigationSchedule {
  enabled: boolean;
  mode: ScheduleMode;
  fixedSchedule?: FixedSchedule[];
  smartSchedule?: SmartScheduleConfig;
}

export type ScheduleMode = 'fixed' | 'smart' | 'manual' | 'weather_based';

export interface FixedSchedule {
  daysOfWeek: number[];
  startTime: string;
  duration: number; // minutos
  active: boolean;
}

export interface SmartScheduleConfig {
  algorithm: 'et_based' | 'soil_based' | 'weather_based' | 'ai_optimized';
  factors: ScheduleFactor[];
  learningEnabled: boolean;
  adaptationRate: number;
}

export interface ScheduleFactor {
  name: string;
  weight: number;
  enabled: boolean;
}

export interface WateringRule {
  id: string;
  name: string;
  condition: RuleCondition;
  action: RuleAction;
  priority: number;
  enabled: boolean;
}

export interface RuleCondition {
  type: 'moisture' | 'temperature' | 'weather' | 'time' | 'season' | 'composite';
  operator: 'less_than' | 'greater_than' | 'equals' | 'between' | 'and' | 'or';
  value: number | string | RuleCondition[];
  sensor?: string;
}

export interface RuleAction {
  type: 'start_irrigation' | 'stop_irrigation' | 'adjust_duration' | 'send_alert' | 'skip_cycle';
  parameters: Record<string, any>;
  duration?: number;
}

export interface SeasonalAdjustment {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  moistureAdjustment: number; // %
  durationAdjustment: number; // %
  frequencyAdjustment: number; // %
  active: boolean;
}

export interface EmergencySettings {
  droughtMode: DroughtModeConfig;
  freezeProtection: FreezeProtectionConfig;
  floodPrevention: FloodPreventionConfig;
}

export interface DroughtModeConfig {
  enabled: boolean;
  triggerConditions: RuleCondition[];
  waterReduction: number; // %
  priorityZones: string[];
}

export interface FreezeProtectionConfig {
  enabled: boolean;
  temperatureThreshold: number; // °C
  protectionMethod: 'continuous_spray' | 'intermittent_spray' | 'heating';
  duration: number; // minutos
}

export interface FloodPreventionConfig {
  enabled: boolean;
  rainfallThreshold: number; // mm/h
  soilSaturationThreshold: number; // %
  suspensionDuration: number; // horas
}

export interface ZoneStatus {
  currentMoisture: number;
  targetMoisture: number;
  lastIrrigation: Date;
  nextScheduled: Date;
  waterUsageToday: number; // litros
  waterUsageWeek: number; // litros
  efficiency: number; // %
  health: ZoneHealth;
}

export interface ZoneHealth {
  score: number; // 0-100
  factors: HealthFactor[];
  recommendations: string[];
}

export interface HealthFactor {
  name: string;
  score: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface IrrigationEvent {
  id: string;
  zoneId: string;
  type: EventType;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutos
  waterUsed: number; // litros
  trigger: EventTrigger;
  efficiency: number;
  conditions: EventConditions;
  tenant: string;
}

export type EventType = 
  | 'scheduled'
  | 'manual'
  | 'emergency'
  | 'smart_trigger'
  | 'weather_based'
  | 'maintenance';

export interface EventTrigger {
  type: 'schedule' | 'sensor' | 'manual' | 'weather' | 'ai_decision';
  source: string;
  reason: string;
  confidence?: number;
}

export interface EventConditions {
  soilMoisture: number;
  airTemperature: number;
  humidity: number;
  windSpeed: number;
  rainfall: number;
  evapotranspiration: number;
}

export interface WaterUsageAnalytics {
  zoneId: string;
  period: DatePeriod;
  totalUsage: number; // litros
  averageDaily: number; // litros
  efficiency: number; // %
  cost: number; // moneda local
  trends: UsageTrend[];
  comparisons: UsageComparison[];
  recommendations: WaterSavingRecommendation[];
  tenant: string;
}

export interface DatePeriod {
  startDate: Date;
  endDate: Date;
  type: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'yearly';
}

export interface UsageTrend {
  date: Date;
  usage: number;
  efficiency: number;
  weather: WeatherSummary;
}

export interface WeatherSummary {
  avgTemperature: number;
  totalRainfall: number;
  avgHumidity: number;
  evapotranspiration: number;
}

export interface UsageComparison {
  period: string;
  currentUsage: number;
  previousUsage: number;
  change: number; // %
  reason: string;
}

export interface WaterSavingRecommendation {
  category: 'schedule' | 'equipment' | 'maintenance' | 'technology';
  description: string;
  potentialSavings: number; // %
  implementationCost: number;
  paybackPeriod: number; // meses
  priority: 'low' | 'medium' | 'high';
}

// Clase principal para Smart Irrigation
export class SmartIrrigationSystem {
  private static instance: SmartIrrigationSystem;
  private zones: Map<string, IrrigationZone> = new Map();
  private events: Map<string, IrrigationEvent[]> = new Map();
  private activeIrrigations: Map<string, IrrigationEvent> = new Map();
  private analytics: Map<string, WaterUsageAnalytics> = new Map();

  private constructor() {
    this.initializeSystem();
  }

  public static getInstance(): SmartIrrigationSystem {
    if (!SmartIrrigationSystem.instance) {
      SmartIrrigationSystem.instance = new SmartIrrigationSystem();
    }
    return SmartIrrigationSystem.instance;
  }

  private initializeSystem(): void {
    // Inicializar zonas de ejemplo
    this.initializeExampleZones();
    
    // Iniciar monitoreo continuo
    this.startContinuousMonitoring();
    
    // Programar evaluaciones de riego
    setInterval(() => {
      this.evaluateIrrigationNeeds();
    }, 5 * 60 * 1000); // Cada 5 minutos

    // Programar análisis de eficiencia
    setInterval(() => {
      this.analyzeWaterUsage();
    }, 60 * 60 * 1000); // Cada hora
  }

  private initializeExampleZones(): void {
    // Zona Green Hoyo 1
    const greenZone: IrrigationZone = {
      id: 'zone_green_01',
      name: 'Green Hoyo 1',
      fieldId: 'field_001',
      area: 500, // m²
      grassType: 'bentgrass',
      soilType: 'sand',
      location: {
        centerLatitude: 19.4320,
        centerLongitude: -99.1330,
        boundaries: [
          { latitude: 19.4318, longitude: -99.1332 },
          { latitude: 19.4322, longitude: -99.1332 },
          { latitude: 19.4322, longitude: -99.1328 },
          { latitude: 19.4318, longitude: -99.1328 }
        ],
        elevation: 2240,
        slope: 2.5,
        exposure: 'full_sun'
      },
      sensors: [
        {
          id: 'sensor_moisture_01',
          type: 'soil_moisture',
          location: { latitude: 19.4320, longitude: -99.1330 },
          depth: 15,
          status: 'active',
          lastReading: new Date(),
          batteryLevel: 85
        },
        {
          id: 'sensor_temp_01',
          type: 'soil_temperature',
          location: { latitude: 19.4320, longitude: -99.1330 },
          depth: 10,
          status: 'active',
          lastReading: new Date(),
          batteryLevel: 78
        }
      ],
      sprinklers: [
        {
          id: 'sprinkler_01',
          type: 'rotary',
          location: { latitude: 19.4319, longitude: -99.1331 },
          coverage: {
            radius: 12,
            angle: 360,
            pattern: 'full_circle'
          },
          flowRate: 25,
          pressure: 2.5,
          status: {
            active: false,
            currentFlow: 0,
            currentPressure: 2.5,
            health: 'excellent',
            issues: []
          },
          lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          efficiency: 92
        }
      ],
      configuration: {
        targetMoisture: {
          optimal: 70,
          minimum: 60,
          maximum: 85,
          criticalLow: 50
        },
        irrigationSchedule: {
          enabled: true,
          mode: 'smart',
          smartSchedule: {
            algorithm: 'ai_optimized',
            factors: [
              { name: 'soil_moisture', weight: 0.4, enabled: true },
              { name: 'weather_forecast', weight: 0.3, enabled: true },
              { name: 'evapotranspiration', weight: 0.2, enabled: true },
              { name: 'grass_health', weight: 0.1, enabled: true }
            ],
            learningEnabled: true,
            adaptationRate: 0.1
          }
        },
        wateringRules: [
          {
            id: 'rule_critical_moisture',
            name: 'Riego de Emergencia',
            condition: {
              type: 'moisture',
              operator: 'less_than',
              value: 50,
              sensor: 'sensor_moisture_01'
            },
            action: {
              type: 'start_irrigation',
              parameters: { priority: 'high' },
              duration: 15
            },
            priority: 1,
            enabled: true
          }
        ],
        seasonalAdjustments: [
          {
            season: 'summer',
            moistureAdjustment: 10,
            durationAdjustment: 20,
            frequencyAdjustment: 15,
            active: true
          }
        ],
        emergencySettings: {
          droughtMode: {
            enabled: true,
            triggerConditions: [
              {
                type: 'moisture',
                operator: 'less_than',
                value: 40
              }
            ],
            waterReduction: 30,
            priorityZones: ['zone_green_01']
          },
          freezeProtection: {
            enabled: true,
            temperatureThreshold: 2,
            protectionMethod: 'continuous_spray',
            duration: 30
          },
          floodPrevention: {
            enabled: true,
            rainfallThreshold: 10,
            soilSaturationThreshold: 90,
            suspensionDuration: 6
          }
        }
      },
      status: {
        currentMoisture: 65,
        targetMoisture: 70,
        lastIrrigation: new Date(Date.now() - 6 * 60 * 60 * 1000),
        nextScheduled: new Date(Date.now() + 2 * 60 * 60 * 1000),
        waterUsageToday: 125,
        waterUsageWeek: 850,
        efficiency: 88,
        health: {
          score: 92,
          factors: [
            {
              name: 'moisture_level',
              score: 90,
              impact: 'positive',
              description: 'Nivel de humedad óptimo'
            },
            {
              name: 'sprinkler_efficiency',
              score: 95,
              impact: 'positive',
              description: 'Aspersores funcionando eficientemente'
            }
          ],
          recommendations: [
            'Mantener programa actual de riego',
            'Revisar sensores mensualmente'
          ]
        }
      },
      tenant: 'default'
    };

    this.zones.set('zone_green_01', greenZone);
  }

  private startContinuousMonitoring(): void {
    // Monitoreo continuo de sensores
    setInterval(() => {
      this.updateSensorReadings();
    }, 60 * 1000); // Cada minuto
  }

  private async updateSensorReadings(): Promise<void> {
    for (const [zoneId, zone] of this.zones.entries()) {
      try {
        // Obtener lecturas de sensores IoT
        const sensorData = await this.getSensorData(zone);
        
        // Actualizar estado de la zona
        this.updateZoneStatus(zone, sensorData);
        
        // Verificar reglas de riego
        await this.checkWateringRules(zone);
        
      } catch (error) {
        console.error(`Error updating sensor readings for zone ${zoneId}:`, error);
      }
    }
  }

  private async getSensorData(zone: IrrigationZone): Promise<Record<string, number>> {
    const sensorData: Record<string, number> = {};
    
    for (const sensor of zone.sensors) {
      try {
        // Obtener datos del gateway IoT
        const readings = await iotGateway.getDeviceReadings(
          sensor.id,
          new Date(Date.now() - 5 * 60 * 1000), // Últimos 5 minutos
          new Date(),
          zone.tenant
        );
        
        if (readings.length > 0) {
          const latestReading = readings[readings.length - 1];
          const metric = latestReading.metrics.find(m => 
            m.name.includes(sensor.type.replace('_', '_'))
          );
          
          if (metric) {
            sensorData[sensor.type] = metric.value;
            sensor.lastReading = latestReading.timestamp;
          }
        } else {
          // Generar datos simulados si no hay lecturas reales
          sensorData[sensor.type] = this.generateSimulatedSensorValue(sensor.type);
        }
      } catch (error) {
        console.error(`Error reading sensor ${sensor.id}:`, error);
        // Usar último valor conocido o valor por defecto
        sensorData[sensor.type] = this.getDefaultSensorValue(sensor.type);
      }
    }
    
    return sensorData;
  }

  private generateSimulatedSensorValue(sensorType: SensorType): number {
    const now = new Date();
    const hour = now.getHours();
    
    switch (sensorType) {
      case 'soil_moisture':
        // Humedad del suelo disminuye durante el día
        const baseMoisture = 65 - Math.sin((hour - 6) * Math.PI / 12) * 10;
        return Math.max(30, Math.min(90, baseMoisture + (Math.random() - 0.5) * 8));
      
      case 'soil_temperature':
        // Temperatura del suelo sigue la temperatura del aire con retraso
        const baseSoilTemp = 18 + Math.sin((hour - 8) * Math.PI / 12) * 6;
        return baseSoilTemp + (Math.random() - 0.5) * 2;
      
      case 'ambient_temperature':
        const baseAirTemp = 20 + Math.sin((hour - 6) * Math.PI / 12) * 8;
        return baseAirTemp + (Math.random() - 0.5) * 4;
      
      case 'humidity':
        const baseHumidity = 70 - Math.sin((hour - 6) * Math.PI / 12) * 20;
        return Math.max(30, Math.min(95, baseHumidity + (Math.random() - 0.5) * 10));
      
      case 'wind_speed':
        const baseWind = 5 + Math.sin((hour - 10) * Math.PI / 8) * 8;
        return Math.max(0, baseWind + (Math.random() - 0.5) * 6);
      
      case 'rain_gauge':
        // Probabilidad de lluvia baja
        return Math.random() < 0.1 ? Math.random() * 5 : 0;
      
      default:
        return Math.random() * 100;
    }
  }

  private getDefaultSensorValue(sensorType: SensorType): number {
    const defaults: Record<SensorType, number> = {
      soil_moisture: 60,
      soil_temperature: 20,
      ambient_temperature: 22,
      humidity: 65,
      light_intensity: 50000,
      wind_speed: 10,
      rain_gauge: 0,
      flow_meter: 0,
      pressure_sensor: 2.5
    };
    
    return defaults[sensorType] || 0;
  }

  private updateZoneStatus(zone: IrrigationZone, sensorData: Record<string, number>): void {
    // Actualizar humedad actual
    if (sensorData.soil_moisture !== undefined) {
      zone.status.currentMoisture = sensorData.soil_moisture;
    }
    
    // Calcular eficiencia basada en condiciones
    zone.status.efficiency = this.calculateZoneEfficiency(zone, sensorData);
    
    // Actualizar salud de la zona
    zone.status.health = this.calculateZoneHealth(zone, sensorData);
  }

  private calculateZoneEfficiency(zone: IrrigationZone, sensorData: Record<string, number>): number {
    let efficiency = 100;
    
    // Penalizar por humedad fuera del rango óptimo
    const moistureDiff = Math.abs(zone.status.currentMoisture - zone.configuration.targetMoisture.optimal);
    efficiency -= moistureDiff * 2;
    
    // Penalizar por problemas en aspersores
    const sprinklerIssues = zone.sprinklers.reduce((count, s) => count + s.status.issues.length, 0);
    efficiency -= sprinklerIssues * 10;
    
    // Ajustar por condiciones climáticas
    if (sensorData.wind_speed > 20) {
      efficiency -= 15; // Viento fuerte reduce eficiencia
    }
    
    if (sensorData.ambient_temperature > 35) {
      efficiency -= 10; // Calor extremo reduce eficiencia
    }
    
    return Math.max(0, Math.min(100, efficiency));
  }

  private calculateZoneHealth(zone: IrrigationZone, sensorData: Record<string, number>): ZoneHealth {
    const factors: HealthFactor[] = [];
    let totalScore = 0;
    
    // Factor de humedad
    const moistureScore = this.calculateMoistureScore(zone.status.currentMoisture, zone.configuration.targetMoisture);
    factors.push({
      name: 'moisture_level',
      score: moistureScore,
      impact: moistureScore > 80 ? 'positive' : moistureScore < 60 ? 'negative' : 'neutral',
      description: `Humedad del suelo: ${zone.status.currentMoisture}%`
    });
    totalScore += moistureScore * 0.4;
    
    // Factor de equipos
    const equipmentScore = this.calculateEquipmentScore(zone.sprinklers);
    factors.push({
      name: 'equipment_health',
      score: equipmentScore,
      impact: equipmentScore > 85 ? 'positive' : equipmentScore < 70 ? 'negative' : 'neutral',
      description: `Estado de aspersores: ${equipmentScore}%`
    });
    totalScore += equipmentScore * 0.3;
    
    // Factor de eficiencia
    factors.push({
      name: 'irrigation_efficiency',
      score: zone.status.efficiency,
      impact: zone.status.efficiency > 85 ? 'positive' : zone.status.efficiency < 70 ? 'negative' : 'neutral',
      description: `Eficiencia de riego: ${zone.status.efficiency}%`
    });
    totalScore += zone.status.efficiency * 0.3;
    
    // Generar recomendaciones
    const recommendations = this.generateHealthRecommendations(factors);
    
    return {
      score: Math.round(totalScore),
      factors,
      recommendations
    };
  }

  private calculateMoistureScore(current: number, target: MoistureTarget): number {
    if (current >= target.minimum && current <= target.maximum) {
      // Dentro del rango aceptable
      const optimalDiff = Math.abs(current - target.optimal);
      return Math.max(80, 100 - optimalDiff * 2);
    } else if (current < target.minimum) {
      // Muy seco
      const deficit = target.minimum - current;
      return Math.max(0, 60 - deficit * 3);
    } else {
      // Muy húmedo
      const excess = current - target.maximum;
      return Math.max(0, 70 - excess * 2);
    }
  }

  private calculateEquipmentScore(sprinklers: Sprinkler[]): number {
    if (sprinklers.length === 0) return 0;
    
    const totalScore = sprinklers.reduce((sum, sprinkler) => {
      let score = sprinkler.efficiency;
      
      // Penalizar por problemas
      score -= sprinkler.status.issues.length * 15;
      
      // Penalizar por mantenimiento atrasado
      const daysSinceMaintenance = (Date.now() - sprinkler.lastMaintenance.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceMaintenance > 90) {
        score -= 10;
      }
      
      return sum + Math.max(0, score);
    }, 0);
    
    return totalScore / sprinklers.length;
  }

  private generateHealthRecommendations(factors: HealthFactor[]): string[] {
    const recommendations: string[] = [];
    
    factors.forEach(factor => {
      if (factor.impact === 'negative') {
        switch (factor.name) {
          case 'moisture_level':
            if (factor.score < 60) {
              recommendations.push('Aumentar frecuencia de riego');
            }
            break;
          case 'equipment_health':
            recommendations.push('Revisar y mantener aspersores');
            break;
          case 'irrigation_efficiency':
            recommendations.push('Optimizar programación de riego');
            break;
        }
      }
    });
    
    if (recommendations.length === 0) {
      recommendations.push('Mantener programa actual de mantenimiento');
    }
    
    return recommendations;
  }

  private async checkWateringRules(zone: IrrigationZone): Promise<void> {
    for (const rule of zone.configuration.wateringRules) {
      if (!rule.enabled) continue;
      
      try {
        const shouldTrigger = await this.evaluateRuleCondition(rule.condition, zone);
        
        if (shouldTrigger) {
          await this.executeRuleAction(rule.action, zone, rule);
        }
      } catch (error) {
        console.error(`Error checking watering rule ${rule.id}:`, error);
      }
    }
  }

  private async evaluateRuleCondition(condition: RuleCondition, zone: IrrigationZone): Promise<boolean> {
    switch (condition.type) {
      case 'moisture':
        const currentMoisture = zone.status.currentMoisture;
        return this.evaluateNumericCondition(currentMoisture, condition.operator, condition.value as number);
      
      case 'temperature':
        // Obtener temperatura actual de sensores
        const temperature = await this.getCurrentTemperature(zone);
        return this.evaluateNumericCondition(temperature, condition.operator, condition.value as number);
      
      case 'time':
        const currentHour = new Date().getHours();
        return this.evaluateNumericCondition(currentHour, condition.operator, condition.value as number);
      
      case 'weather':
        // Evaluar condiciones climáticas
        return await this.evaluateWeatherCondition(condition, zone);
      
      case 'composite':
        // Evaluar condiciones compuestas (AND/OR)
        return await this.evaluateCompositeCondition(condition, zone);
      
      default:
        return false;
    }
  }

  private evaluateNumericCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case 'less_than':
        return value < threshold;
      case 'greater_than':
        return value > threshold;
      case 'equals':
        return Math.abs(value - threshold) < 0.1;
      case 'between':
        // Para 'between', threshold debería ser un array [min, max]
        return false; // Simplificado
      default:
        return false;
    }
  }

  private async getCurrentTemperature(zone: IrrigationZone): Promise<number> {
    const tempSensor = zone.sensors.find(s => s.type === 'ambient_temperature' || s.type === 'soil_temperature');
    if (tempSensor) {
      return this.generateSimulatedSensorValue(tempSensor.type);
    }
    return 22; // Valor por defecto
  }

  private async evaluateWeatherCondition(condition: RuleCondition, zone: IrrigationZone): Promise<boolean> {
    // Simplificado - en producción obtendría datos meteorológicos reales
    return false;
  }

  private async evaluateCompositeCondition(condition: RuleCondition, zone: IrrigationZone): Promise<boolean> {
    if (!Array.isArray(condition.value)) return false;
    
    const subConditions = condition.value as RuleCondition[];
    const results = await Promise.all(
      subConditions.map(subCondition => this.evaluateRuleCondition(subCondition, zone))
    );
    
    if (condition.operator === 'and') {
      return results.every(result => result);
    } else if (condition.operator === 'or') {
      return results.some(result => result);
    }
    
    return false;
  }

  private async executeRuleAction(action: RuleAction, zone: IrrigationZone, rule: WateringRule): Promise<void> {
    switch (action.type) {
      case 'start_irrigation':
        await this.startIrrigation(zone.id, action.duration || 10, `Rule: ${rule.name}`);
        break;
      
      case 'stop_irrigation':
        await this.stopIrrigation(zone.id, `Rule: ${rule.name}`);
        break;
      
      case 'send_alert':
        await this.sendIrrigationAlert(zone, rule, action.parameters);
        break;
      
      case 'skip_cycle':
        await this.skipNextCycle(zone.id, `Rule: ${rule.name}`);
        break;
      
      default:
        console.log(`Unknown action type: ${action.type}`);
    }
  }

  // Evaluación de necesidades de riego
  private async evaluateIrrigationNeeds(): Promise<void> {
    for (const [zoneId, zone] of this.zones.entries()) {
      try {
        if (zone.configuration.irrigationSchedule.mode === 'smart') {
          await this.evaluateSmartIrrigation(zone);
        }
      } catch (error) {
        console.error(`Error evaluating irrigation needs for zone ${zoneId}:`, error);
      }
    }
  }

  private async evaluateSmartIrrigation(zone: IrrigationZone): Promise<void> {
    const smartConfig = zone.configuration.irrigationSchedule.smartSchedule;
    if (!smartConfig) return;
    
    // Calcular puntuación de necesidad de riego
    const irrigationScore = await this.calculateIrrigationScore(zone, smartConfig);
    
    // Decidir si regar basado en el algoritmo
    const shouldIrrigate = await this.makeIrrigationDecision(zone, irrigationScore, smartConfig);
    
    if (shouldIrrigate) {
      const duration = this.calculateOptimalDuration(zone, irrigationScore);
      await this.startIrrigation(zone.id, duration, 'Smart irrigation decision');
    }
  }

  private async calculateIrrigationScore(zone: IrrigationZone, config: SmartScheduleConfig): Promise<number> {
    let score = 0;
    
    for (const factor of config.factors) {
      if (!factor.enabled) continue;
      
      let factorScore = 0;
      
      switch (factor.name) {
        case 'soil_moisture':
          const moistureDeficit = zone.configuration.targetMoisture.optimal - zone.status.currentMoisture;
          factorScore = Math.max(0, moistureDeficit * 2); // 0-100 scale
          break;
        
        case 'weather_forecast':
          factorScore = await this.getWeatherForecastScore(zone);
          break;
        
        case 'evapotranspiration':
          factorScore = await this.getEvapotranspirationScore(zone);
          break;
        
        case 'grass_health':
          factorScore = 100 - zone.status.health.score; // Inverso de la salud
          break;
      }
      
      score += factorScore * factor.weight;
    }
    
    return Math.min(100, score);
  }

  private async getWeatherForecastScore(zone: IrrigationZone): Promise<number> {
    // Simplificado - en producción obtendría pronóstico real
    // Puntuación alta si no se espera lluvia
    const rainProbability = Math.random() * 100;
    return 100 - rainProbability;
  }

  private async getEvapotranspirationScore(zone: IrrigationZone): Promise<number> {
    // Calcular ET basado en temperatura, humedad, viento
    const temperature = await this.getCurrentTemperature(zone);
    const humidity = 65; // Simplificado
    const windSpeed = 10; // Simplificado
    
    // Fórmula simplificada de ET
    const et = (temperature - 5) * (100 - humidity) / 100 * (1 + windSpeed / 100);
    return Math.min(100, et * 10);
  }

  private async makeIrrigationDecision(
    zone: IrrigationZone,
    score: number,
    config: SmartScheduleConfig
  ): Promise<boolean> {
    // Verificar si ya está regando
    if (this.activeIrrigations.has(zone.id)) {
      return false;
    }
    
    // Verificar tiempo mínimo entre riegos
    const timeSinceLastIrrigation = Date.now() - zone.status.lastIrrigation.getTime();
    const minInterval = 2 * 60 * 60 * 1000; // 2 horas mínimo
    
    if (timeSinceLastIrrigation < minInterval) {
      return false;
    }
    
    // Decidir basado en algoritmo
    switch (config.algorithm) {
      case 'ai_optimized':
        return score > 60; // Umbral para IA optimizada
      
      case 'soil_based':
        return zone.status.currentMoisture < zone.configuration.targetMoisture.minimum;
      
      case 'et_based':
        const etScore = await this.getEvapotranspirationScore(zone);
        return etScore > 70;
      
      case 'weather_based':
        const weatherScore = await this.getWeatherForecastScore(zone);
        return weatherScore > 80 && score > 40;
      
      default:
        return score > 70;
    }
  }

  private calculateOptimalDuration(zone: IrrigationZone, score: number): number {
    // Duración base según tipo de césped
    const baseDuration = this.getBaseDurationForGrass(zone.grassType);
    
    // Ajustar según puntuación de necesidad
    const scoreMultiplier = score / 100;
    
    // Ajustar según área
    const areaMultiplier = Math.sqrt(zone.area / 500); // Normalizado para 500m²
    
    // Ajustar según eficiencia de aspersores
    const efficiencyMultiplier = 100 / zone.status.efficiency;
    
    const duration = baseDuration * scoreMultiplier * areaMultiplier * efficiencyMultiplier;
    
    return Math.max(5, Math.min(60, Math.round(duration))); // Entre 5 y 60 minutos
  }

  private getBaseDurationForGrass(grassType: GrassType): number {
    const durations: Record<GrassType, number> = {
      bentgrass: 15,
      bermuda: 20,
      zoysia: 18,
      fescue: 25,
      ryegrass: 22,
      kikuyu: 20,
      paspalum: 18
    };
    
    return durations[grassType] || 20;
  }

  // Control de riego
  async startIrrigation(zoneId: string, duration: number, reason: string, tenant?: string): Promise<boolean> {
    const tenantId = tenant || getTenantId();
    const zone = this.zones.get(zoneId);
    
    if (!zone || zone.tenant !== tenantId) {
      throw new Error('Zone not found or access denied');
    }
    
    // Verificar si ya está regando
    if (this.activeIrrigations.has(zoneId)) {
      throw new Error('Zone is already being irrigated');
    }
    
    try {
      // Crear evento de riego
      const event: IrrigationEvent = {
        id: `irrigation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        zoneId,
        type: reason.includes('Rule') ? 'smart_trigger' : 'manual',
        startTime: new Date(),
        duration,
        waterUsed: 0,
        trigger: {
          type: reason.includes('Rule') ? 'ai_decision' : 'manual',
          source: reason,
          reason,
          confidence: 0.85
        },
        efficiency: zone.status.efficiency,
        conditions: await this.getCurrentConditions(zone),
        tenant: tenantId
      };
      
      // Activar aspersores
      await this.activateSprinklers(zone, true);
      
      // Registrar evento activo
      this.activeIrrigations.set(zoneId, event);
      
      // Programar finalización
      setTimeout(() => {
        this.stopIrrigation(zoneId, 'Scheduled stop');
      }, duration * 60 * 1000);
      
      // Actualizar estado de la zona
      zone.status.lastIrrigation = new Date();
      zone.status.nextScheduled = this.calculateNextScheduled(zone);
      
      // Registrar métricas
      monitoringService.recordMetric('irrigation.started', 1, {
        zone: zoneId,
        duration: duration.toString(),
        reason
      }, tenantId);
      
      console.log(`Irrigation started for zone ${zone.name} - Duration: ${duration} minutes`);
      return true;
      
    } catch (error) {
      console.error(`Error starting irrigation for zone ${zoneId}:`, error);
      throw error;
    }
  }

  async stopIrrigation(zoneId: string, reason: string, tenant?: string): Promise<boolean> {
    const tenantId = tenant || getTenantId();
    const zone = this.zones.get(zoneId);
    const activeEvent = this.activeIrrigations.get(zoneId);
    
    if (!zone || zone.tenant !== tenantId) {
      throw new Error('Zone not found or access denied');
    }
    
    if (!activeEvent) {
      return false; // No hay riego activo
    }
    
    try {
      // Desactivar aspersores
      await this.activateSprinklers(zone, false);
      
      // Finalizar evento
      activeEvent.endTime = new Date();
      const actualDuration = (activeEvent.endTime.getTime() - activeEvent.startTime.getTime()) / (1000 * 60);
      activeEvent.waterUsed = this.calculateWaterUsed(zone, actualDuration);
      
      // Guardar evento en historial
      this.saveIrrigationEvent(activeEvent);
      
      // Remover de activos
      this.activeIrrigations.delete(zoneId);
      
      // Actualizar uso de agua
      zone.status.waterUsageToday += activeEvent.waterUsed;
      zone.status.waterUsageWeek += activeEvent.waterUsed;
      
      // Registrar métricas
      monitoringService.recordMetric('irrigation.stopped', 1, {
        zone: zoneId,
        duration: actualDuration.toString(),
        water_used: activeEvent.waterUsed.toString()
      }, tenantId);
      
      console.log(`Irrigation stopped for zone ${zone.name} - Water used: ${activeEvent.waterUsed}L`);
      return true;
      
    } catch (error) {
      console.error(`Error stopping irrigation for zone ${zoneId}:`, error);
      throw error;
    }
  }

  private async activateSprinklers(zone: IrrigationZone, activate: boolean): Promise<void> {
    for (const sprinkler of zone.sprinklers) {
      sprinkler.status.active = activate;
      sprinkler.status.currentFlow = activate ? sprinkler.flowRate : 0;
      
      // En producción, esto enviaría comandos reales a los aspersores
      console.log(`Sprinkler ${sprinkler.id} ${activate ? 'activated' : 'deactivated'}`);
    }
  }

  private async getCurrentConditions(zone: IrrigationZone): Promise<EventConditions> {
    const sensorData = await this.getSensorData(zone);
    
    return {
      soilMoisture: sensorData.soil_moisture || zone.status.currentMoisture,
      airTemperature: sensorData.ambient_temperature || 22,
      humidity: sensorData.humidity || 65,
      windSpeed: sensorData.wind_speed || 10,
      rainfall: sensorData.rain_gauge || 0,
      evapotranspiration: await this.getEvapotranspirationScore(zone)
    };
  }

  private calculateWaterUsed(zone: IrrigationZone, duration: number): number {
    const totalFlowRate = zone.sprinklers.reduce((sum, s) => sum + s.flowRate, 0);
    return totalFlowRate * duration; // L/min * min = L
  }

  private saveIrrigationEvent(event: IrrigationEvent): void {
    const zoneEvents = this.events.get(event.zoneId) || [];
    zoneEvents.push(event);
    
    // Mantener solo los últimos 1000 eventos por zona
    if (zoneEvents.length > 1000) {
      zoneEvents.splice(0, zoneEvents.length - 1000);
    }
    
    this.events.set(event.zoneId, zoneEvents);
  }

  private calculateNextScheduled(zone: IrrigationZone): Date {
    // Simplificado - calcular próximo riego basado en configuración
    const now = new Date();
    
    if (zone.configuration.irrigationSchedule.mode === 'smart') {
      // Para riego inteligente, estimar basado en condiciones actuales
      const hoursUntilNext = 6 + Math.random() * 12; // 6-18 horas
      return new Date(now.getTime() + hoursUntilNext * 60 * 60 * 1000);
    } else {
      // Para horario fijo, usar próximo horario programado
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Mañana
    }
  }

  private async skipNextCycle(zoneId: string, reason: string): Promise<void> {
    const zone = this.zones.get(zoneId);
    if (!zone) return;
    
    // Postponer próximo riego programado
    const currentNext = zone.status.nextScheduled;
    zone.status.nextScheduled = new Date(currentNext.getTime() + 24 * 60 * 60 * 1000);
    
    console.log(`Next irrigation cycle skipped for zone ${zone.name}: ${reason}`);
  }

  private async sendIrrigationAlert(zone: IrrigationZone, rule: WateringRule, parameters: any): Promise<void> {
    const alert = {
      zoneId: zone.id,
      zoneName: zone.name,
      rule: rule.name,
      message: `Irrigation alert: ${rule.name}`,
      timestamp: new Date(),
      parameters
    };
    
    // En producción, esto enviaría notificaciones reales
    console.log('Irrigation Alert:', alert);
  }

  // Análisis de uso de agua
  private async analyzeWaterUsage(): Promise<void> {
    for (const [zoneId, zone] of this.zones.entries()) {
      try {
        const analytics = await this.generateWaterUsageAnalytics(zone);
        this.analytics.set(zoneId, analytics);
      } catch (error) {
        console.error(`Error analyzing water usage for zone ${zoneId}:`, error);
      }
    }
  }

  private async generateWaterUsageAnalytics(zone: IrrigationZone): Promise<WaterUsageAnalytics> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // Últimos 30 días
    
    const events = this.events.get(zone.id) || [];
    const periodEvents = events.filter(e => 
      e.startTime >= startDate && e.startTime <= endDate && e.endTime
    );
    
    const totalUsage = periodEvents.reduce((sum, e) => sum + e.waterUsed, 0);
    const averageDaily = totalUsage / 30;
    const efficiency = periodEvents.length > 0 
      ? periodEvents.reduce((sum, e) => sum + e.efficiency, 0) / periodEvents.length 
      : zone.status.efficiency;
    
    return {
      zoneId: zone.id,
      period: {
        startDate,
        endDate,
        type: 'monthly'
      },
      totalUsage,
      averageDaily,
      efficiency,
      cost: totalUsage * 0.002, // $0.002 por litro (ejemplo)
      trends: this.calculateUsageTrends(periodEvents),
      comparisons: this.calculateUsageComparisons(zone, totalUsage),
      recommendations: this.generateWaterSavingRecommendations(zone, efficiency),
      tenant: zone.tenant
    };
  }

  private calculateUsageTrends(events: IrrigationEvent[]): UsageTrend[] {
    // Agrupar eventos por día
    const dailyUsage = new Map<string, { usage: number; efficiency: number; count: number }>();
    
    events.forEach(event => {
      const dateKey = event.startTime.toISOString().split('T')[0];
      const existing = dailyUsage.get(dateKey) || { usage: 0, efficiency: 0, count: 0 };
      
      existing.usage += event.waterUsed;
      existing.efficiency += event.efficiency;
      existing.count++;
      
      dailyUsage.set(dateKey, existing);
    });
    
    return Array.from(dailyUsage.entries()).map(([dateStr, data]) => ({
      date: new Date(dateStr),
      usage: data.usage,
      efficiency: data.efficiency / data.count,
      weather: {
        avgTemperature: 22 + Math.random() * 10,
        totalRainfall: Math.random() * 5,
        avgHumidity: 60 + Math.random() * 20,
        evapotranspiration: 3 + Math.random() * 4
      }
    }));
  }

  private calculateUsageComparisons(zone: IrrigationZone, currentUsage: number): UsageComparison[] {
    // Comparaciones simuladas
    return [
      {
        period: 'Previous Month',
        currentUsage,
        previousUsage: currentUsage * (0.9 + Math.random() * 0.2),
        change: -5 + Math.random() * 10,
        reason: 'Seasonal variation'
      },
      {
        period: 'Same Month Last Year',
        currentUsage,
        previousUsage: currentUsage * (0.8 + Math.random() * 0.4),
        change: -10 + Math.random() * 20,
        reason: 'Weather differences'
      }
    ];
  }

  private generateWaterSavingRecommendations(zone: IrrigationZone, efficiency: number): WaterSavingRecommendation[] {
    const recommendations: WaterSavingRecommendation[] = [];
    
    if (efficiency < 80) {
      recommendations.push({
        category: 'equipment',
        description: 'Upgrade to high-efficiency sprinklers',
        potentialSavings: 15,
        implementationCost: 2000,
        paybackPeriod: 18,
        priority: 'high'
      });
    }
    
    if (zone.configuration.irrigationSchedule.mode !== 'smart') {
      recommendations.push({
        category: 'technology',
        description: 'Implement smart irrigation scheduling',
        potentialSavings: 25,
        implementationCost: 1500,
        paybackPeriod: 12,
        priority: 'high'
      });
    }
    
    recommendations.push({
      category: 'maintenance',
      description: 'Regular sprinkler calibration and maintenance',
      potentialSavings: 10,
      implementationCost: 200,
      paybackPeriod: 3,
      priority: 'medium'
    });
    
    return recommendations;
  }

  // API pública
  async getZoneStatus(zoneId: string, tenant?: string): Promise<IrrigationZone | null> {
    const tenantId = tenant || getTenantId();
    const zone = this.zones.get(zoneId);
    
    if (!zone || zone.tenant !== tenantId) {
      return null;
    }
    
    return zone;
  }

  async getZoneAnalytics(zoneId: string, tenant?: string): Promise<WaterUsageAnalytics | null> {
    const tenantId = tenant || getTenantId();
    const zone = this.zones.get(zoneId);
    
    if (!zone || zone.tenant !== tenantId) {
      return null;
    }
    
    return this.analytics.get(zoneId) || null;
  }

  async getIrrigationHistory(
    zoneId: string,
    startDate?: Date,
    endDate?: Date,
    tenant?: string
  ): Promise<IrrigationEvent[]> {
    const tenantId = tenant || getTenantId();
    const zone = this.zones.get(zoneId);
    
    if (!zone || zone.tenant !== tenantId) {
      return [];
    }
    
    let events = this.events.get(zoneId) || [];
    
    if (startDate) {
      events = events.filter(e => e.startTime >= startDate);
    }
    
    if (endDate) {
      events = events.filter(e => e.startTime <= endDate);
    }
    
    return events.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  async getActiveIrrigations(tenant?: string): Promise<IrrigationEvent[]> {
    const tenantId = tenant || getTenantId();
    const activeEvents: IrrigationEvent[] = [];
    
    for (const [zoneId, event] of this.activeIrrigations.entries()) {
      const zone = this.zones.get(zoneId);
      if (zone && zone.tenant === tenantId) {
        activeEvents.push(event);
      }
    }
    
    return activeEvents;
  }

  // Obtener estadísticas del servicio
  getServiceStats(tenant?: string): any {
    const tenantId = tenant || getTenantId();
    const zonesForTenant = Array.from(this.zones.values())
      .filter(zone => zone.tenant === tenantId);

    const totalWaterUsage = zonesForTenant.reduce((sum, zone) => sum + zone.status.waterUsageToday, 0);
    const averageEfficiency = zonesForTenant.reduce((sum, zone) => sum + zone.status.efficiency, 0) / zonesForTenant.length;
    const activeIrrigationCount = Array.from(this.activeIrrigations.keys())
      .filter(zoneId => {
        const zone = this.zones.get(zoneId);
        return zone && zone.tenant === tenantId;
      }).length;

    return {
      totalZones: zonesForTenant.length,
      activeIrrigations: activeIrrigationCount,
      totalWaterUsageToday: totalWaterUsage,
      averageEfficiency,
      totalSprinklers: zonesForTenant.reduce((sum, zone) => sum + zone.sprinklers.length, 0),
      totalSensors: zonesForTenant.reduce((sum, zone) => sum + zone.sensors.length, 0),
      averageZoneHealth: zonesForTenant.reduce((sum, zone) => sum + zone.status.health.score, 0) / zonesForTenant.length
    };
  }
}

// Exportar instancia
export const smartIrrigationSystem = SmartIrrigationSystem.getInstance();

