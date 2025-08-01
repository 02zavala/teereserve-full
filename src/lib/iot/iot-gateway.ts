import { getTenantId } from '../tenant';
import { cacheService } from '../cache-service';
import { monitoringService } from '../monitoring-service';

// Tipos para IoT Gateway
export interface IoTDevice {
  id: string;
  name: string;
  type: DeviceType;
  fieldId: string;
  location: DeviceLocation;
  status: DeviceStatus;
  lastSeen: Date;
  batteryLevel?: number;
  firmwareVersion: string;
  configuration: DeviceConfiguration;
  capabilities: DeviceCapability[];
  tenant: string;
}

export type DeviceType = 
  | 'weather_station'
  | 'soil_sensor'
  | 'traffic_counter'
  | 'security_camera'
  | 'irrigation_controller'
  | 'equipment_monitor'
  | 'air_quality_sensor'
  | 'noise_monitor'
  | 'beacon'
  | 'smart_sprinkler'
  | 'gate_controller'
  | 'lighting_controller';

export interface DeviceLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  zone: string;
  description: string;
}

export interface DeviceStatus {
  online: boolean;
  health: 'excellent' | 'good' | 'warning' | 'critical';
  lastUpdate: Date;
  errorCount: number;
  uptime: number;
}

export interface DeviceConfiguration {
  reportingInterval: number; // seconds
  thresholds: Record<string, number>;
  alerts: AlertConfiguration[];
  powerManagement: PowerManagementConfig;
  networkSettings: NetworkSettings;
}

export interface AlertConfiguration {
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

export interface PowerManagementConfig {
  mode: 'always_on' | 'scheduled' | 'motion_activated' | 'solar_optimized';
  schedule?: ScheduleConfig[];
  lowPowerThreshold?: number;
}

export interface ScheduleConfig {
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  active: boolean;
}

export interface NetworkSettings {
  protocol: 'wifi' | 'lora' | 'cellular' | 'ethernet' | 'zigbee';
  encryption: boolean;
  compressionEnabled: boolean;
  retryAttempts: number;
}

export interface DeviceCapability {
  name: string;
  type: 'sensor' | 'actuator' | 'processor';
  unit?: string;
  range?: { min: number; max: number };
  accuracy?: number;
  resolution?: number;
}

export interface SensorReading {
  deviceId: string;
  timestamp: Date;
  metrics: SensorMetric[];
  location: DeviceLocation;
  quality: DataQuality;
  tenant: string;
}

export interface SensorMetric {
  name: string;
  value: number;
  unit: string;
  confidence: number;
  calibrated: boolean;
}

export interface DataQuality {
  score: number; // 0-100
  issues: QualityIssue[];
  validated: boolean;
  interpolated: boolean;
}

export interface QualityIssue {
  type: 'outlier' | 'missing_data' | 'sensor_drift' | 'calibration_needed' | 'network_issue';
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
}

export interface IoTAlert {
  id: string;
  deviceId: string;
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
  actionsTaken: string[];
  tenant: string;
}

export type AlertType = 
  | 'device_offline'
  | 'low_battery'
  | 'sensor_malfunction'
  | 'threshold_exceeded'
  | 'maintenance_required'
  | 'security_breach'
  | 'network_issue'
  | 'calibration_needed'
  | 'firmware_update_available';

export interface FieldConditions {
  fieldId: string;
  timestamp: Date;
  weather: WeatherConditions;
  soil: SoilConditions;
  traffic: TrafficConditions;
  security: SecurityStatus;
  irrigation: IrrigationStatus;
  equipment: EquipmentStatus;
  airQuality: AirQualityConditions;
  overallScore: number;
  tenant: string;
}

export interface WeatherConditions {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  rainfall: number;
  uvIndex: number;
  visibility: number;
  dewPoint: number;
}

export interface SoilConditions {
  moisture: number;
  temperature: number;
  ph: number;
  nutrients: NutrientLevels;
  compaction: number;
  salinity: number;
}

export interface NutrientLevels {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicMatter: number;
}

export interface TrafficConditions {
  playerCount: number;
  cartTraffic: number;
  maintenanceActivity: number;
  peakHours: string[];
  wearPatterns: WearPattern[];
}

export interface WearPattern {
  zone: string;
  intensity: number;
  type: 'foot_traffic' | 'cart_traffic' | 'maintenance';
  recommendation: string;
}

export interface SecurityStatus {
  perimeter: boolean;
  accessPoints: AccessPointStatus[];
  incidents: SecurityIncident[];
  overallStatus: 'secure' | 'warning' | 'breach';
}

export interface AccessPointStatus {
  id: string;
  location: string;
  status: 'open' | 'closed' | 'restricted';
  lastActivity: Date;
}

export interface SecurityIncident {
  id: string;
  type: 'unauthorized_access' | 'vandalism' | 'theft' | 'suspicious_activity';
  timestamp: Date;
  location: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
}

export interface IrrigationStatus {
  zones: IrrigationZone[];
  waterUsage: number;
  efficiency: number;
  nextScheduled: Date;
  issues: IrrigationIssue[];
}

export interface IrrigationZone {
  id: string;
  name: string;
  active: boolean;
  soilMoisture: number;
  targetMoisture: number;
  lastWatered: Date;
  duration: number;
}

export interface IrrigationIssue {
  zone: string;
  type: 'low_pressure' | 'blocked_sprinkler' | 'leak_detected' | 'sensor_error';
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface EquipmentStatus {
  mowers: EquipmentItem[];
  carts: EquipmentItem[];
  maintenance: EquipmentItem[];
  overallHealth: number;
}

export interface EquipmentItem {
  id: string;
  type: string;
  status: 'operational' | 'maintenance' | 'repair' | 'offline';
  location: DeviceLocation;
  batteryLevel?: number;
  hoursUsed: number;
  nextMaintenance: Date;
  issues: string[];
}

export interface AirQualityConditions {
  pm25: number;
  pm10: number;
  ozone: number;
  co2: number;
  temperature: number;
  humidity: number;
  aqi: number;
  healthRecommendation: string;
}

export interface MaintenanceRecommendation {
  id: string;
  fieldId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: MaintenanceCategory;
  description: string;
  estimatedDuration: number;
  estimatedCost: number;
  requiredEquipment: string[];
  weatherDependency: boolean;
  deadline: Date;
  generatedBy: 'iot_analysis' | 'predictive_model' | 'manual_inspection';
  confidence: number;
  tenant: string;
}

export type MaintenanceCategory = 
  | 'grass_care'
  | 'irrigation'
  | 'equipment_service'
  | 'facility_repair'
  | 'safety_check'
  | 'pest_control'
  | 'fertilization'
  | 'aeration'
  | 'overseeding';

// Clase principal para IoT Gateway
export class IoTGateway {
  private static instance: IoTGateway;
  private devices: Map<string, IoTDevice> = new Map();
  private readings: Map<string, SensorReading[]> = new Map();
  private alerts: Map<string, IoTAlert[]> = new Map();
  private fieldConditions: Map<string, FieldConditions> = new Map();
  private websocketConnections: Map<string, WebSocket> = new Map();

  private constructor() {
    this.initializeGateway();
  }

  public static getInstance(): IoTGateway {
    if (!IoTGateway.instance) {
      IoTGateway.instance = new IoTGateway();
    }
    return IoTGateway.instance;
  }

  private initializeGateway(): void {
    // Simular dispositivos IoT
    this.initializeSimulatedDevices();
    
    // Iniciar recolección de datos
    this.startDataCollection();
    
    // Programar análisis de condiciones
    setInterval(() => {
      this.analyzeFieldConditions();
    }, 5 * 60 * 1000); // Cada 5 minutos

    // Programar mantenimiento predictivo
    setInterval(() => {
      this.generateMaintenanceRecommendations();
    }, 60 * 60 * 1000); // Cada hora
  }

  private initializeSimulatedDevices(): void {
    // Estación meteorológica
    const weatherStation: IoTDevice = {
      id: 'weather_001',
      name: 'Estación Meteorológica Principal',
      type: 'weather_station',
      fieldId: 'field_001',
      location: {
        latitude: 19.4326,
        longitude: -99.1332,
        altitude: 2240,
        zone: 'clubhouse',
        description: 'Ubicada en el techo del clubhouse'
      },
      status: {
        online: true,
        health: 'excellent',
        lastUpdate: new Date(),
        errorCount: 0,
        uptime: 99.8
      },
      batteryLevel: 85,
      firmwareVersion: '2.1.4',
      configuration: {
        reportingInterval: 300, // 5 minutos
        thresholds: {
          temperature: 35,
          humidity: 90,
          windSpeed: 50
        },
        alerts: [
          {
            metric: 'temperature',
            condition: 'greater_than',
            threshold: 35,
            severity: 'high',
            enabled: true
          }
        ],
        powerManagement: {
          mode: 'solar_optimized',
          lowPowerThreshold: 20
        },
        networkSettings: {
          protocol: 'wifi',
          encryption: true,
          compressionEnabled: true,
          retryAttempts: 3
        }
      },
      capabilities: [
        { name: 'temperature', type: 'sensor', unit: '°C', range: { min: -40, max: 60 }, accuracy: 0.1 },
        { name: 'humidity', type: 'sensor', unit: '%', range: { min: 0, max: 100 }, accuracy: 1 },
        { name: 'wind_speed', type: 'sensor', unit: 'km/h', range: { min: 0, max: 200 }, accuracy: 0.5 },
        { name: 'pressure', type: 'sensor', unit: 'hPa', range: { min: 800, max: 1200 }, accuracy: 0.1 }
      ],
      lastSeen: new Date(),
      tenant: 'default'
    };

    // Sensor de suelo
    const soilSensor: IoTDevice = {
      id: 'soil_001',
      name: 'Sensor de Suelo Green #1',
      type: 'soil_sensor',
      fieldId: 'field_001',
      location: {
        latitude: 19.4320,
        longitude: -99.1330,
        zone: 'green_01',
        description: 'Centro del green del hoyo 1'
      },
      status: {
        online: true,
        health: 'good',
        lastUpdate: new Date(),
        errorCount: 2,
        uptime: 97.5
      },
      batteryLevel: 72,
      firmwareVersion: '1.8.2',
      configuration: {
        reportingInterval: 900, // 15 minutos
        thresholds: {
          moisture: 30,
          temperature: 25,
          ph: 7.5
        },
        alerts: [
          {
            metric: 'moisture',
            condition: 'less_than',
            threshold: 30,
            severity: 'medium',
            enabled: true
          }
        ],
        powerManagement: {
          mode: 'scheduled',
          schedule: [
            {
              startTime: '06:00',
              endTime: '20:00',
              daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
              active: true
            }
          ]
        },
        networkSettings: {
          protocol: 'lora',
          encryption: true,
          compressionEnabled: false,
          retryAttempts: 5
        }
      },
      capabilities: [
        { name: 'soil_moisture', type: 'sensor', unit: '%', range: { min: 0, max: 100 }, accuracy: 2 },
        { name: 'soil_temperature', type: 'sensor', unit: '°C', range: { min: -10, max: 50 }, accuracy: 0.5 },
        { name: 'ph', type: 'sensor', unit: 'pH', range: { min: 4, max: 10 }, accuracy: 0.1 },
        { name: 'conductivity', type: 'sensor', unit: 'µS/cm', range: { min: 0, max: 5000 }, accuracy: 10 }
      ],
      lastSeen: new Date(),
      tenant: 'default'
    };

    // Cámara de seguridad
    const securityCamera: IoTDevice = {
      id: 'camera_001',
      name: 'Cámara Entrada Principal',
      type: 'security_camera',
      fieldId: 'field_001',
      location: {
        latitude: 19.4328,
        longitude: -99.1335,
        zone: 'entrance',
        description: 'Entrada principal del campo'
      },
      status: {
        online: true,
        health: 'excellent',
        lastUpdate: new Date(),
        errorCount: 0,
        uptime: 99.9
      },
      firmwareVersion: '3.2.1',
      configuration: {
        reportingInterval: 60, // 1 minuto
        thresholds: {
          motion_sensitivity: 75,
          recording_quality: 1080
        },
        alerts: [
          {
            metric: 'motion_detected',
            condition: 'equals',
            threshold: 1,
            severity: 'low',
            enabled: true
          }
        ],
        powerManagement: {
          mode: 'always_on'
        },
        networkSettings: {
          protocol: 'ethernet',
          encryption: true,
          compressionEnabled: true,
          retryAttempts: 2
        }
      },
      capabilities: [
        { name: 'video_recording', type: 'sensor', unit: 'fps', range: { min: 15, max: 60 } },
        { name: 'motion_detection', type: 'sensor', unit: 'boolean' },
        { name: 'night_vision', type: 'sensor', unit: 'boolean' },
        { name: 'pan_tilt', type: 'actuator', unit: 'degrees', range: { min: -180, max: 180 } }
      ],
      lastSeen: new Date(),
      tenant: 'default'
    };

    this.devices.set('weather_001', weatherStation);
    this.devices.set('soil_001', soilSensor);
    this.devices.set('camera_001', securityCamera);
  }

  private startDataCollection(): void {
    // Simular recolección de datos cada 30 segundos
    setInterval(() => {
      this.collectSensorData();
    }, 30 * 1000);
  }

  private async collectSensorData(): Promise<void> {
    for (const [deviceId, device] of this.devices.entries()) {
      try {
        const reading = await this.generateSensorReading(device);
        this.storeSensorReading(reading);
        
        // Verificar alertas
        await this.checkAlerts(device, reading);
        
        // Actualizar estado del dispositivo
        device.status.lastUpdate = new Date();
        device.lastSeen = new Date();
        
      } catch (error) {
        console.error(`Error collecting data from device ${deviceId}:`, error);
        this.handleDeviceError(deviceId, error as Error);
      }
    }
  }

  private async generateSensorReading(device: IoTDevice): Promise<SensorReading> {
    const metrics: SensorMetric[] = [];
    
    // Generar métricas basadas en las capacidades del dispositivo
    for (const capability of device.capabilities) {
      if (capability.type === 'sensor') {
        const value = this.generateRealisticValue(device.type, capability.name, capability.range);
        metrics.push({
          name: capability.name,
          value,
          unit: capability.unit || '',
          confidence: 0.9 + Math.random() * 0.1,
          calibrated: true
        });
      }
    }
    
    return {
      deviceId: device.id,
      timestamp: new Date(),
      metrics,
      location: device.location,
      quality: {
        score: 85 + Math.random() * 15,
        issues: [],
        validated: true,
        interpolated: false
      },
      tenant: device.tenant
    };
  }

  private generateRealisticValue(deviceType: DeviceType, metricName: string, range?: { min: number; max: number }): number {
    const now = new Date();
    const hour = now.getHours();
    
    switch (deviceType) {
      case 'weather_station':
        return this.generateWeatherValue(metricName, hour, range);
      case 'soil_sensor':
        return this.generateSoilValue(metricName, hour, range);
      case 'security_camera':
        return this.generateSecurityValue(metricName, hour, range);
      default:
        return range ? range.min + Math.random() * (range.max - range.min) : Math.random() * 100;
    }
  }

  private generateWeatherValue(metricName: string, hour: number, range?: { min: number; max: number }): number {
    switch (metricName) {
      case 'temperature':
        // Temperatura realista con variación diurna
        const baseTemp = 20 + Math.sin((hour - 6) * Math.PI / 12) * 8;
        return baseTemp + (Math.random() - 0.5) * 4;
      
      case 'humidity':
        // Humedad inversamente relacionada con temperatura
        const baseHumidity = 70 - Math.sin((hour - 6) * Math.PI / 12) * 20;
        return Math.max(30, Math.min(95, baseHumidity + (Math.random() - 0.5) * 10));
      
      case 'wind_speed':
        // Viento más fuerte durante el día
        const baseWind = 5 + Math.sin((hour - 10) * Math.PI / 8) * 8;
        return Math.max(0, baseWind + (Math.random() - 0.5) * 6);
      
      case 'pressure':
        // Presión atmosférica estable con pequeñas variaciones
        return 1013 + (Math.random() - 0.5) * 20;
      
      default:
        return range ? range.min + Math.random() * (range.max - range.min) : Math.random() * 100;
    }
  }

  private generateSoilValue(metricName: string, hour: number, range?: { min: number; max: number }): number {
    switch (metricName) {
      case 'soil_moisture':
        // Humedad del suelo disminuye durante el día
        const baseMoisture = 60 - Math.sin((hour - 6) * Math.PI / 12) * 15;
        return Math.max(20, Math.min(90, baseMoisture + (Math.random() - 0.5) * 8));
      
      case 'soil_temperature':
        // Temperatura del suelo sigue la temperatura del aire con retraso
        const baseSoilTemp = 18 + Math.sin((hour - 8) * Math.PI / 12) * 6;
        return baseSoilTemp + (Math.random() - 0.5) * 2;
      
      case 'ph':
        // pH relativamente estable
        return 6.5 + (Math.random() - 0.5) * 1;
      
      case 'conductivity':
        // Conductividad relacionada con humedad
        const moisture = this.generateSoilValue('soil_moisture', hour);
        return 800 + moisture * 20 + (Math.random() - 0.5) * 200;
      
      default:
        return range ? range.min + Math.random() * (range.max - range.min) : Math.random() * 100;
    }
  }

  private generateSecurityValue(metricName: string, hour: number, range?: { min: number; max: number }): number {
    switch (metricName) {
      case 'motion_detected':
        // Más movimiento durante horas de operación
        const isOperatingHours = hour >= 6 && hour <= 20;
        const motionProbability = isOperatingHours ? 0.3 : 0.05;
        return Math.random() < motionProbability ? 1 : 0;
      
      case 'video_recording':
        return 30; // 30 FPS constante
      
      default:
        return range ? range.min + Math.random() * (range.max - range.min) : Math.random() * 100;
    }
  }

  private storeSensorReading(reading: SensorReading): void {
    const deviceReadings = this.readings.get(reading.deviceId) || [];
    deviceReadings.push(reading);
    
    // Mantener solo las últimas 1000 lecturas por dispositivo
    if (deviceReadings.length > 1000) {
      deviceReadings.splice(0, deviceReadings.length - 1000);
    }
    
    this.readings.set(reading.deviceId, deviceReadings);
  }

  private async checkAlerts(device: IoTDevice, reading: SensorReading): Promise<void> {
    for (const alertConfig of device.configuration.alerts) {
      if (!alertConfig.enabled) continue;
      
      const metric = reading.metrics.find(m => m.name === alertConfig.metric);
      if (!metric) continue;
      
      const shouldAlert = this.evaluateAlertCondition(
        metric.value,
        alertConfig.condition,
        alertConfig.threshold
      );
      
      if (shouldAlert) {
        await this.createAlert(device, alertConfig, metric.value);
      }
    }
  }

  private evaluateAlertCondition(
    value: number,
    condition: AlertConfiguration['condition'],
    threshold: number
  ): boolean {
    switch (condition) {
      case 'greater_than':
        return value > threshold;
      case 'less_than':
        return value < threshold;
      case 'equals':
        return Math.abs(value - threshold) < 0.001;
      case 'not_equals':
        return Math.abs(value - threshold) >= 0.001;
      default:
        return false;
    }
  }

  private async createAlert(
    device: IoTDevice,
    alertConfig: AlertConfiguration,
    currentValue: number
  ): Promise<void> {
    const alert: IoTAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      deviceId: device.id,
      type: this.mapMetricToAlertType(alertConfig.metric),
      severity: alertConfig.severity,
      message: `${alertConfig.metric} ${alertConfig.condition} ${alertConfig.threshold} (actual: ${currentValue})`,
      timestamp: new Date(),
      acknowledged: false,
      actionsTaken: [],
      tenant: device.tenant
    };
    
    const deviceAlerts = this.alerts.get(device.id) || [];
    deviceAlerts.push(alert);
    this.alerts.set(device.id, deviceAlerts);
    
    // Registrar métrica de alerta
    monitoringService.recordMetric('iot.alert_generated', 1, {
      device: device.id,
      type: alert.type,
      severity: alert.severity
    }, device.tenant);
    
    console.log(`IoT Alert: ${alert.message} from device ${device.name}`);
  }

  private mapMetricToAlertType(metric: string): AlertType {
    const mapping: Record<string, AlertType> = {
      temperature: 'threshold_exceeded',
      humidity: 'threshold_exceeded',
      moisture: 'threshold_exceeded',
      battery: 'low_battery',
      motion_detected: 'security_breach'
    };
    
    return mapping[metric] || 'threshold_exceeded';
  }

  private handleDeviceError(deviceId: string, error: Error): void {
    const device = this.devices.get(deviceId);
    if (!device) return;
    
    device.status.errorCount++;
    device.status.health = device.status.errorCount > 5 ? 'critical' : 'warning';
    
    // Crear alerta de mal funcionamiento
    this.createAlert(device, {
      metric: 'device_error',
      condition: 'equals',
      threshold: 1,
      severity: 'high',
      enabled: true
    }, 1);
  }

  // Analizar condiciones del campo
  private async analyzeFieldConditions(): Promise<void> {
    const fieldIds = [...new Set(Array.from(this.devices.values()).map(d => d.fieldId))];
    
    for (const fieldId of fieldIds) {
      try {
        const conditions = await this.calculateFieldConditions(fieldId);
        this.fieldConditions.set(fieldId, conditions);
        
        // Registrar métricas
        monitoringService.recordMetric('iot.field_conditions_analyzed', 1, {
          field: fieldId,
          score: conditions.overallScore.toString()
        }, conditions.tenant);
        
      } catch (error) {
        console.error(`Error analyzing conditions for field ${fieldId}:`, error);
      }
    }
  }

  private async calculateFieldConditions(fieldId: string): Promise<FieldConditions> {
    const fieldDevices = Array.from(this.devices.values()).filter(d => d.fieldId === fieldId);
    const tenant = fieldDevices[0]?.tenant || 'default';
    
    // Obtener lecturas recientes
    const recentReadings = this.getRecentReadings(fieldDevices, 30); // Últimos 30 minutos
    
    // Calcular condiciones por categoría
    const weather = this.calculateWeatherConditions(recentReadings);
    const soil = this.calculateSoilConditions(recentReadings);
    const traffic = this.calculateTrafficConditions(recentReadings);
    const security = this.calculateSecurityStatus(recentReadings);
    const irrigation = this.calculateIrrigationStatus(recentReadings);
    const equipment = this.calculateEquipmentStatus(recentReadings);
    const airQuality = this.calculateAirQualityConditions(recentReadings);
    
    // Calcular puntuación general
    const overallScore = this.calculateOverallFieldScore({
      weather,
      soil,
      traffic,
      security,
      irrigation,
      equipment,
      airQuality
    });
    
    return {
      fieldId,
      timestamp: new Date(),
      weather,
      soil,
      traffic,
      security,
      irrigation,
      equipment,
      airQuality,
      overallScore,
      tenant
    };
  }

  private getRecentReadings(devices: IoTDevice[], minutes: number): SensorReading[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    const readings: SensorReading[] = [];
    
    for (const device of devices) {
      const deviceReadings = this.readings.get(device.id) || [];
      const recentReadings = deviceReadings.filter(r => r.timestamp >= cutoff);
      readings.push(...recentReadings);
    }
    
    return readings;
  }

  private calculateWeatherConditions(readings: SensorReading[]): WeatherConditions {
    const weatherReadings = readings.filter(r => 
      this.devices.get(r.deviceId)?.type === 'weather_station'
    );
    
    if (weatherReadings.length === 0) {
      return this.getDefaultWeatherConditions();
    }
    
    const latest = weatherReadings[weatherReadings.length - 1];
    
    return {
      temperature: this.getMetricValue(latest, 'temperature') || 22,
      humidity: this.getMetricValue(latest, 'humidity') || 65,
      windSpeed: this.getMetricValue(latest, 'wind_speed') || 10,
      windDirection: this.getMetricValue(latest, 'wind_direction') || 180,
      pressure: this.getMetricValue(latest, 'pressure') || 1013,
      rainfall: this.getMetricValue(latest, 'rainfall') || 0,
      uvIndex: this.getMetricValue(latest, 'uv_index') || 5,
      visibility: this.getMetricValue(latest, 'visibility') || 10000,
      dewPoint: this.calculateDewPoint(
        this.getMetricValue(latest, 'temperature') || 22,
        this.getMetricValue(latest, 'humidity') || 65
      )
    };
  }

  private calculateSoilConditions(readings: SensorReading[]): SoilConditions {
    const soilReadings = readings.filter(r => 
      this.devices.get(r.deviceId)?.type === 'soil_sensor'
    );
    
    if (soilReadings.length === 0) {
      return this.getDefaultSoilConditions();
    }
    
    const latest = soilReadings[soilReadings.length - 1];
    
    return {
      moisture: this.getMetricValue(latest, 'soil_moisture') || 50,
      temperature: this.getMetricValue(latest, 'soil_temperature') || 20,
      ph: this.getMetricValue(latest, 'ph') || 6.8,
      nutrients: {
        nitrogen: this.getMetricValue(latest, 'nitrogen') || 25,
        phosphorus: this.getMetricValue(latest, 'phosphorus') || 15,
        potassium: this.getMetricValue(latest, 'potassium') || 20,
        organicMatter: this.getMetricValue(latest, 'organic_matter') || 3.5
      },
      compaction: this.getMetricValue(latest, 'compaction') || 30,
      salinity: this.getMetricValue(latest, 'salinity') || 0.5
    };
  }

  private calculateTrafficConditions(readings: SensorReading[]): TrafficConditions {
    const trafficReadings = readings.filter(r => 
      this.devices.get(r.deviceId)?.type === 'traffic_counter'
    );
    
    return {
      playerCount: this.calculatePlayerCount(trafficReadings),
      cartTraffic: this.calculateCartTraffic(trafficReadings),
      maintenanceActivity: this.calculateMaintenanceActivity(trafficReadings),
      peakHours: this.identifyPeakHours(trafficReadings),
      wearPatterns: this.analyzeWearPatterns(trafficReadings)
    };
  }

  private calculateSecurityStatus(readings: SensorReading[]): SecurityStatus {
    const securityReadings = readings.filter(r => 
      this.devices.get(r.deviceId)?.type === 'security_camera'
    );
    
    return {
      perimeter: true,
      accessPoints: [
        {
          id: 'main_entrance',
          location: 'Entrada Principal',
          status: 'open',
          lastActivity: new Date()
        }
      ],
      incidents: [],
      overallStatus: 'secure'
    };
  }

  private calculateIrrigationStatus(readings: SensorReading[]): IrrigationStatus {
    return {
      zones: [
        {
          id: 'zone_01',
          name: 'Green Hoyo 1',
          active: false,
          soilMoisture: 65,
          targetMoisture: 70,
          lastWatered: new Date(Date.now() - 6 * 60 * 60 * 1000),
          duration: 15
        }
      ],
      waterUsage: 1250,
      efficiency: 85,
      nextScheduled: new Date(Date.now() + 2 * 60 * 60 * 1000),
      issues: []
    };
  }

  private calculateEquipmentStatus(readings: SensorReading[]): EquipmentStatus {
    return {
      mowers: [
        {
          id: 'mower_01',
          type: 'Riding Mower',
          status: 'operational',
          location: {
            latitude: 19.4325,
            longitude: -99.1331,
            zone: 'maintenance',
            description: 'Área de mantenimiento'
          },
          batteryLevel: 78,
          hoursUsed: 245,
          nextMaintenance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          issues: []
        }
      ],
      carts: [],
      maintenance: [],
      overallHealth: 92
    };
  }

  private calculateAirQualityConditions(readings: SensorReading[]): AirQualityConditions {
    return {
      pm25: 12,
      pm10: 18,
      ozone: 45,
      co2: 410,
      temperature: 22,
      humidity: 65,
      aqi: 35,
      healthRecommendation: 'Excelente calidad del aire'
    };
  }

  private calculateOverallFieldScore(conditions: any): number {
    // Algoritmo simplificado para calcular puntuación general
    const weights = {
      weather: 0.2,
      soil: 0.25,
      traffic: 0.15,
      security: 0.1,
      irrigation: 0.15,
      equipment: 0.1,
      airQuality: 0.05
    };
    
    let score = 0;
    score += this.normalizeWeatherScore(conditions.weather) * weights.weather;
    score += this.normalizeSoilScore(conditions.soil) * weights.soil;
    score += 85 * weights.traffic; // Simplificado
    score += 95 * weights.security; // Simplificado
    score += 88 * weights.irrigation; // Simplificado
    score += conditions.equipment.overallHealth * weights.equipment;
    score += this.normalizeAirQualityScore(conditions.airQuality) * weights.airQuality;
    
    return Math.round(score);
  }

  // Generar recomendaciones de mantenimiento
  private async generateMaintenanceRecommendations(): Promise<void> {
    console.log('Generating maintenance recommendations based on IoT data...');
    
    for (const [fieldId, conditions] of this.fieldConditions.entries()) {
      try {
        const recommendations = await this.analyzeMaintenanceNeeds(fieldId, conditions);
        
        // En producción, estas recomendaciones se guardarían en la base de datos
        console.log(`Generated ${recommendations.length} maintenance recommendations for field ${fieldId}`);
        
      } catch (error) {
        console.error(`Error generating maintenance recommendations for field ${fieldId}:`, error);
      }
    }
  }

  private async analyzeMaintenanceNeeds(
    fieldId: string,
    conditions: FieldConditions
  ): Promise<MaintenanceRecommendation[]> {
    const recommendations: MaintenanceRecommendation[] = [];
    
    // Análisis de suelo
    if (conditions.soil.moisture < 40) {
      recommendations.push({
        id: `maint_${Date.now()}_irrigation`,
        fieldId,
        priority: 'high',
        category: 'irrigation',
        description: 'Humedad del suelo baja - activar riego',
        estimatedDuration: 2,
        estimatedCost: 50,
        requiredEquipment: ['sistema_riego'],
        weatherDependency: false,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        generatedBy: 'iot_analysis',
        confidence: 0.9,
        tenant: conditions.tenant
      });
    }
    
    // Análisis de pH
    if (conditions.soil.ph < 6.0 || conditions.soil.ph > 7.5) {
      recommendations.push({
        id: `maint_${Date.now()}_ph`,
        fieldId,
        priority: 'medium',
        category: 'fertilization',
        description: `pH del suelo fuera del rango óptimo (${conditions.soil.ph})`,
        estimatedDuration: 4,
        estimatedCost: 200,
        requiredEquipment: ['aplicador_cal', 'fertilizadora'],
        weatherDependency: true,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        generatedBy: 'iot_analysis',
        confidence: 0.85,
        tenant: conditions.tenant
      });
    }
    
    // Análisis de equipos
    if (conditions.equipment.overallHealth < 80) {
      recommendations.push({
        id: `maint_${Date.now()}_equipment`,
        fieldId,
        priority: 'medium',
        category: 'equipment_service',
        description: 'Revisión general de equipos requerida',
        estimatedDuration: 6,
        estimatedCost: 500,
        requiredEquipment: ['herramientas_mantenimiento'],
        weatherDependency: false,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        generatedBy: 'iot_analysis',
        confidence: 0.8,
        tenant: conditions.tenant
      });
    }
    
    return recommendations;
  }

  // Métodos auxiliares
  private getMetricValue(reading: SensorReading, metricName: string): number | null {
    const metric = reading.metrics.find(m => m.name === metricName);
    return metric ? metric.value : null;
  }

  private getDefaultWeatherConditions(): WeatherConditions {
    return {
      temperature: 22,
      humidity: 65,
      windSpeed: 10,
      windDirection: 180,
      pressure: 1013,
      rainfall: 0,
      uvIndex: 5,
      visibility: 10000,
      dewPoint: 15
    };
  }

  private getDefaultSoilConditions(): SoilConditions {
    return {
      moisture: 50,
      temperature: 20,
      ph: 6.8,
      nutrients: {
        nitrogen: 25,
        phosphorus: 15,
        potassium: 20,
        organicMatter: 3.5
      },
      compaction: 30,
      salinity: 0.5
    };
  }

  private calculateDewPoint(temperature: number, humidity: number): number {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temperature) / (b + temperature)) + Math.log(humidity / 100);
    return (b * alpha) / (a - alpha);
  }

  private calculatePlayerCount(readings: SensorReading[]): number {
    // Simulado basado en lecturas de tráfico
    return Math.floor(Math.random() * 50) + 10;
  }

  private calculateCartTraffic(readings: SensorReading[]): number {
    return Math.floor(Math.random() * 20) + 5;
  }

  private calculateMaintenanceActivity(readings: SensorReading[]): number {
    return Math.floor(Math.random() * 5);
  }

  private identifyPeakHours(readings: SensorReading[]): string[] {
    return ['08:00-10:00', '14:00-16:00'];
  }

  private analyzeWearPatterns(readings: SensorReading[]): WearPattern[] {
    return [
      {
        zone: 'tee_01',
        intensity: 65,
        type: 'foot_traffic',
        recommendation: 'Rotar área de tee'
      }
    ];
  }

  private normalizeWeatherScore(weather: WeatherConditions): number {
    // Algoritmo simplificado para normalizar condiciones climáticas
    let score = 100;
    
    // Penalizar temperaturas extremas
    if (weather.temperature < 10 || weather.temperature > 35) {
      score -= 20;
    }
    
    // Penalizar humedad muy alta o muy baja
    if (weather.humidity < 30 || weather.humidity > 90) {
      score -= 15;
    }
    
    // Penalizar viento fuerte
    if (weather.windSpeed > 30) {
      score -= 10;
    }
    
    return Math.max(0, score);
  }

  private normalizeSoilScore(soil: SoilConditions): number {
    let score = 100;
    
    // Penalizar humedad inadecuada
    if (soil.moisture < 40 || soil.moisture > 80) {
      score -= 20;
    }
    
    // Penalizar pH fuera del rango
    if (soil.ph < 6.0 || soil.ph > 7.5) {
      score -= 15;
    }
    
    // Penalizar compactación alta
    if (soil.compaction > 70) {
      score -= 10;
    }
    
    return Math.max(0, score);
  }

  private normalizeAirQualityScore(airQuality: AirQualityConditions): number {
    // Convertir AQI a puntuación 0-100
    return Math.max(0, 100 - airQuality.aqi);
  }

  // API pública
  async getDeviceStatus(deviceId: string, tenant?: string): Promise<IoTDevice | null> {
    const tenantId = tenant || getTenantId();
    const device = this.devices.get(deviceId);
    
    if (!device || device.tenant !== tenantId) {
      return null;
    }
    
    return device;
  }

  async getFieldConditions(fieldId: string, tenant?: string): Promise<FieldConditions | null> {
    const tenantId = tenant || getTenantId();
    const conditions = this.fieldConditions.get(fieldId);
    
    if (!conditions || conditions.tenant !== tenantId) {
      return null;
    }
    
    return conditions;
  }

  async getDeviceReadings(
    deviceId: string,
    startTime?: Date,
    endTime?: Date,
    tenant?: string
  ): Promise<SensorReading[]> {
    const tenantId = tenant || getTenantId();
    const device = this.devices.get(deviceId);
    
    if (!device || device.tenant !== tenantId) {
      return [];
    }
    
    let readings = this.readings.get(deviceId) || [];
    
    if (startTime) {
      readings = readings.filter(r => r.timestamp >= startTime);
    }
    
    if (endTime) {
      readings = readings.filter(r => r.timestamp <= endTime);
    }
    
    return readings;
  }

  async getActiveAlerts(fieldId?: string, tenant?: string): Promise<IoTAlert[]> {
    const tenantId = tenant || getTenantId();
    const allAlerts: IoTAlert[] = [];
    
    for (const [deviceId, alerts] of this.alerts.entries()) {
      const device = this.devices.get(deviceId);
      if (!device || device.tenant !== tenantId) continue;
      
      if (fieldId && device.fieldId !== fieldId) continue;
      
      const activeAlerts = alerts.filter(alert => !alert.acknowledged && !alert.resolvedAt);
      allAlerts.push(...activeAlerts);
    }
    
    return allAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Obtener estadísticas del servicio
  getServiceStats(tenant?: string): any {
    const tenantId = tenant || getTenantId();
    const devicesForTenant = Array.from(this.devices.values())
      .filter(device => device.tenant === tenantId);

    const onlineDevices = devicesForTenant.filter(d => d.status.online).length;
    const totalReadings = Array.from(this.readings.values())
      .flat()
      .filter(r => r.tenant === tenantId).length;
    
    const activeAlerts = Array.from(this.alerts.values())
      .flat()
      .filter(a => a.tenant === tenantId && !a.acknowledged).length;

    return {
      totalDevices: devicesForTenant.length,
      onlineDevices,
      offlineDevices: devicesForTenant.length - onlineDevices,
      totalReadings,
      activeAlerts,
      deviceTypes: devicesForTenant.reduce((acc, device) => {
        acc[device.type] = (acc[device.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      averageUptime: devicesForTenant.reduce((sum, d) => sum + d.status.uptime, 0) / devicesForTenant.length,
      lastDataCollection: Date.now()
    };
  }
}

// Exportar instancia
export const iotGateway = IoTGateway.getInstance();

