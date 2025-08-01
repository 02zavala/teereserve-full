import { getTenantId } from '../tenant';
import { cacheService } from '../cache-service';
import { monitoringService } from '../monitoring-service';

// Tipos para Computer Vision
export interface FieldImage {
  id: string;
  fieldId: string;
  url: string;
  type: 'aerial' | 'ground' | 'green' | 'fairway' | 'tee' | 'hazard';
  timestamp: Date;
  metadata: ImageMetadata;
  tenant: string;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  camera: CameraInfo;
  location: GeoLocation;
  weather: WeatherConditions;
}

export interface CameraInfo {
  make: string;
  model: string;
  settings: CameraSettings;
  drone?: DroneInfo;
}

export interface CameraSettings {
  iso: number;
  aperture: string;
  shutterSpeed: string;
  focalLength: number;
}

export interface DroneInfo {
  model: string;
  altitude: number;
  gimbalAngle: number;
  flightMode: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  altitude: number;
  accuracy: number;
}

export interface WeatherConditions {
  temperature: number;
  humidity: number;
  windSpeed: number;
  cloudCover: number;
  lightConditions: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface FieldConditionAnalysis {
  fieldId: string;
  imageId: string;
  overallScore: number;
  conditions: ConditionMetrics;
  issues: FieldIssue[];
  recommendations: string[];
  confidence: number;
  analysisDate: Date;
  tenant: string;
}

export interface ConditionMetrics {
  grassHealth: GrassHealthMetrics;
  surfaceQuality: SurfaceQualityMetrics;
  maintenance: MaintenanceMetrics;
  playability: PlayabilityMetrics;
  aesthetics: AestheticsMetrics;
}

export interface GrassHealthMetrics {
  greenness: number;
  density: number;
  uniformity: number;
  diseaseDetection: DiseaseDetection[];
  stressIndicators: StressIndicator[];
  overallHealth: number;
}

export interface DiseaseDetection {
  type: string;
  severity: 'low' | 'medium' | 'high';
  affectedArea: number;
  location: BoundingBox;
  confidence: number;
}

export interface StressIndicator {
  type: 'drought' | 'overwatering' | 'nutrient_deficiency' | 'pest_damage' | 'traffic_wear';
  severity: number;
  location: BoundingBox;
  confidence: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SurfaceQualityMetrics {
  smoothness: number;
  firmness: number;
  drainage: number;
  levelness: number;
  compaction: number;
  overallQuality: number;
}

export interface MaintenanceMetrics {
  mowingQuality: number;
  edging: number;
  bunkerCondition: number;
  pathMaintenance: number;
  equipmentMarks: EquipmentMark[];
  overallMaintenance: number;
}

export interface EquipmentMark {
  type: 'mower_lines' | 'tire_tracks' | 'divots' | 'ball_marks';
  severity: number;
  location: BoundingBox;
  needsRepair: boolean;
}

export interface PlayabilityMetrics {
  ballRoll: number;
  lieQuality: number;
  hazardVisibility: number;
  safetyScore: number;
  overallPlayability: number;
}

export interface AestheticsMetrics {
  visualAppeal: number;
  colorConsistency: number;
  landscaping: number;
  cleanliness: number;
  overallAesthetics: number;
}

export interface FieldIssue {
  id: string;
  type: IssueType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: BoundingBox;
  estimatedCost: number;
  urgency: number;
  recommendations: string[];
  confidence: number;
}

export type IssueType = 
  | 'grass_disease'
  | 'bare_spots'
  | 'weeds'
  | 'drainage_problem'
  | 'surface_damage'
  | 'equipment_damage'
  | 'safety_hazard'
  | 'maintenance_needed'
  | 'pest_infestation'
  | 'irrigation_issue';

export interface ProgressTracking {
  fieldId: string;
  startDate: Date;
  endDate: Date;
  images: FieldImage[];
  improvements: ImprovementMetric[];
  overallProgress: number;
  tenant: string;
}

export interface ImprovementMetric {
  metric: string;
  startValue: number;
  endValue: number;
  improvement: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface CVModel {
  id: string;
  name: string;
  version: string;
  type: 'classification' | 'detection' | 'segmentation';
  accuracy: number;
  lastTrained: Date;
  classes: string[];
  inputSize: { width: number; height: number };
}

// Clase principal para Computer Vision
export class ComputerVisionService {
  private static instance: ComputerVisionService;
  private models: Map<string, CVModel> = new Map();
  private analysisHistory: Map<string, FieldConditionAnalysis[]> = new Map();

  private constructor() {
    this.initializeService();
  }

  public static getInstance(): ComputerVisionService {
    if (!ComputerVisionService.instance) {
      ComputerVisionService.instance = new ComputerVisionService();
    }
    return ComputerVisionService.instance;
  }

  private initializeService(): void {
    // Cargar modelos pre-entrenados
    this.loadPretrainedModels();
    
    // Programar análisis automático de imágenes nuevas
    setInterval(() => {
      this.processNewImages();
    }, 60 * 60 * 1000); // Cada hora
  }

  private loadPretrainedModels(): void {
    // Modelo de clasificación de salud del césped
    const grassHealthModel: CVModel = {
      id: 'grass_health_classifier_v2',
      name: 'Grass Health Classifier',
      version: '2.0.0',
      type: 'classification',
      accuracy: 0.94,
      lastTrained: new Date(),
      classes: ['excellent', 'good', 'fair', 'poor', 'critical'],
      inputSize: { width: 512, height: 512 }
    };

    // Modelo de detección de problemas
    const issueDetectionModel: CVModel = {
      id: 'issue_detection_v1',
      name: 'Field Issue Detector',
      version: '1.0.0',
      type: 'detection',
      accuracy: 0.89,
      lastTrained: new Date(),
      classes: [
        'bare_spots', 'weeds', 'disease_spots', 'drainage_issues',
        'equipment_damage', 'pest_damage', 'irrigation_problems'
      ],
      inputSize: { width: 1024, height: 1024 }
    };

    // Modelo de segmentación de áreas
    const segmentationModel: CVModel = {
      id: 'field_segmentation_v1',
      name: 'Field Area Segmentation',
      version: '1.0.0',
      type: 'segmentation',
      accuracy: 0.92,
      lastTrained: new Date(),
      classes: ['green', 'fairway', 'rough', 'bunker', 'water', 'cart_path', 'tee'],
      inputSize: { width: 1024, height: 1024 }
    };

    this.models.set('grass_health_classifier_v2', grassHealthModel);
    this.models.set('issue_detection_v1', issueDetectionModel);
    this.models.set('field_segmentation_v1', segmentationModel);
  }

  // Analizar condiciones del campo
  async analyzeFieldConditions(image: FieldImage): Promise<FieldConditionAnalysis> {
    const tenantId = image.tenant || getTenantId();
    const cacheKey = `cv:analysis:${image.id}`;

    try {
      // Verificar caché
      const cached = await cacheService.get<FieldConditionAnalysis>(cacheKey, { tenant: tenantId });
      if (cached) {
        return cached;
      }

      console.log(`Analyzing field conditions for image ${image.id}...`);

      // Análisis de salud del césped
      const grassHealth = await this.analyzeGrassHealth(image);
      
      // Análisis de calidad de superficie
      const surfaceQuality = await this.analyzeSurfaceQuality(image);
      
      // Análisis de mantenimiento
      const maintenance = await this.analyzeMaintenanceStatus(image);
      
      // Análisis de jugabilidad
      const playability = await this.analyzePlayability(image);
      
      // Análisis estético
      const aesthetics = await this.analyzeAesthetics(image);

      // Detectar problemas específicos
      const issues = await this.detectFieldIssues(image);

      // Calcular puntuación general
      const overallScore = this.calculateOverallScore({
        grassHealth,
        surfaceQuality,
        maintenance,
        playability,
        aesthetics
      });

      // Generar recomendaciones
      const recommendations = await this.generateRecommendations(
        { grassHealth, surfaceQuality, maintenance, playability, aesthetics },
        issues
      );

      const analysis: FieldConditionAnalysis = {
        fieldId: image.fieldId,
        imageId: image.id,
        overallScore,
        conditions: {
          grassHealth,
          surfaceQuality,
          maintenance,
          playability,
          aesthetics
        },
        issues,
        recommendations,
        confidence: this.calculateAnalysisConfidence(grassHealth, surfaceQuality, maintenance),
        analysisDate: new Date(),
        tenant: tenantId
      };

      // Guardar en caché por 24 horas
      await cacheService.set(cacheKey, analysis, {
        tenant: tenantId,
        ttl: 86400,
        tags: ['cv', 'analysis', `field:${image.fieldId}`]
      });

      // Guardar en historial
      this.saveAnalysisToHistory(analysis);

      // Registrar métricas
      monitoringService.recordMetric('cv.analysis_completed', 1, {
        field: image.fieldId,
        score: overallScore.toString(),
        issues: issues.length.toString()
      }, tenantId);

      return analysis;
    } catch (error) {
      console.error('Error analyzing field conditions:', error);
      monitoringService.recordMetric('cv.analysis_error', 1, {
        field: image.fieldId,
        error: (error as Error).message
      }, tenantId);
      throw error;
    }
  }

  // Analizar salud del césped
  private async analyzeGrassHealth(image: FieldImage): Promise<GrassHealthMetrics> {
    try {
      // Simular análisis de computer vision
      const greenness = await this.analyzeGreenness(image);
      const density = await this.analyzeGrassDensity(image);
      const uniformity = await this.analyzeUniformity(image);
      const diseases = await this.detectDiseases(image);
      const stressIndicators = await this.detectStressIndicators(image);

      const overallHealth = (greenness + density + uniformity) / 3;

      return {
        greenness,
        density,
        uniformity,
        diseaseDetection: diseases,
        stressIndicators,
        overallHealth
      };
    } catch (error) {
      console.error('Error analyzing grass health:', error);
      throw error;
    }
  }

  // Analizar verdor del césped
  private async analyzeGreenness(image: FieldImage): Promise<number> {
    // Simular análisis de color HSV
    // En producción, esto usaría OpenCV o TensorFlow.js
    
    // Factores que afectan el verdor
    const weatherFactor = this.getWeatherFactor(image.metadata.weather);
    const seasonFactor = this.getSeasonFactor(image.timestamp);
    const timeFactor = this.getTimeFactor(image.timestamp);
    
    // Simulación basada en condiciones
    let baseGreenness = 75 + Math.random() * 20;
    baseGreenness *= weatherFactor;
    baseGreenness *= seasonFactor;
    baseGreenness *= timeFactor;
    
    return Math.min(100, Math.max(0, baseGreenness));
  }

  // Analizar densidad del césped
  private async analyzeGrassDensity(image: FieldImage): Promise<number> {
    // Simular análisis de textura y patrones
    const baseScore = 70 + Math.random() * 25;
    
    // Ajustar por tipo de área
    let densityScore = baseScore;
    if (image.type === 'green') {
      densityScore += 10; // Los greens suelen tener mayor densidad
    } else if (image.type === 'rough') {
      densityScore -= 15; // El rough tiene menor densidad
    }
    
    return Math.min(100, Math.max(0, densityScore));
  }

  // Analizar uniformidad
  private async analyzeUniformity(image: FieldImage): Promise<number> {
    // Simular análisis de variación en color y textura
    const baseScore = 65 + Math.random() * 30;
    
    // Los greens deben ser más uniformes
    if (image.type === 'green') {
      return Math.min(100, baseScore + 15);
    }
    
    return Math.min(100, Math.max(0, baseScore));
  }

  // Detectar enfermedades
  private async detectDiseases(image: FieldImage): Promise<DiseaseDetection[]> {
    const diseases: DiseaseDetection[] = [];
    
    // Simular detección de enfermedades comunes
    const diseaseTypes = [
      'brown_patch', 'dollar_spot', 'fairy_ring', 'rust', 'pythium_blight'
    ];
    
    // Probabilidad basada en condiciones
    const weather = image.metadata.weather;
    let detectionProbability = 0.1;
    
    if (weather.humidity > 80 && weather.temperature > 25) {
      detectionProbability = 0.3; // Condiciones favorables para enfermedades
    }
    
    for (const diseaseType of diseaseTypes) {
      if (Math.random() < detectionProbability) {
        diseases.push({
          type: diseaseType,
          severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
          affectedArea: Math.random() * 100,
          location: this.generateRandomBoundingBox(),
          confidence: 0.7 + Math.random() * 0.25
        });
      }
    }
    
    return diseases;
  }

  // Detectar indicadores de estrés
  private async detectStressIndicators(image: FieldImage): Promise<StressIndicator[]> {
    const indicators: StressIndicator[] = [];
    
    const weather = image.metadata.weather;
    
    // Estrés por sequía
    if (weather.humidity < 40 && weather.temperature > 30) {
      indicators.push({
        type: 'drought',
        severity: 70 + Math.random() * 25,
        location: this.generateRandomBoundingBox(),
        confidence: 0.8
      });
    }
    
    // Estrés por exceso de agua
    if (weather.humidity > 90) {
      indicators.push({
        type: 'overwatering',
        severity: 60 + Math.random() * 30,
        location: this.generateRandomBoundingBox(),
        confidence: 0.75
      });
    }
    
    // Desgaste por tráfico (más probable en tees y fairways)
    if (image.type === 'tee' || image.type === 'fairway') {
      if (Math.random() < 0.4) {
        indicators.push({
          type: 'traffic_wear',
          severity: 50 + Math.random() * 40,
          location: this.generateRandomBoundingBox(),
          confidence: 0.85
        });
      }
    }
    
    return indicators;
  }

  // Analizar calidad de superficie
  private async analyzeSurfaceQuality(image: FieldImage): Promise<SurfaceQualityMetrics> {
    // Simular análisis de superficie
    const smoothness = 70 + Math.random() * 25;
    const firmness = 65 + Math.random() * 30;
    const drainage = 75 + Math.random() * 20;
    const levelness = 80 + Math.random() * 15;
    const compaction = 60 + Math.random() * 35;
    
    const overallQuality = (smoothness + firmness + drainage + levelness + compaction) / 5;
    
    return {
      smoothness,
      firmness,
      drainage,
      levelness,
      compaction,
      overallQuality
    };
  }

  // Analizar estado de mantenimiento
  private async analyzeMaintenanceStatus(image: FieldImage): Promise<MaintenanceMetrics> {
    const mowingQuality = 75 + Math.random() * 20;
    const edging = 70 + Math.random() * 25;
    const bunkerCondition = image.type === 'hazard' ? 65 + Math.random() * 30 : 80;
    const pathMaintenance = 80 + Math.random() * 15;
    
    // Detectar marcas de equipos
    const equipmentMarks = await this.detectEquipmentMarks(image);
    
    const overallMaintenance = (mowingQuality + edging + bunkerCondition + pathMaintenance) / 4;
    
    return {
      mowingQuality,
      edging,
      bunkerCondition,
      pathMaintenance,
      equipmentMarks,
      overallMaintenance
    };
  }

  // Detectar marcas de equipos
  private async detectEquipmentMarks(image: FieldImage): Promise<EquipmentMark[]> {
    const marks: EquipmentMark[] = [];
    
    // Simular detección de marcas
    const markTypes: Array<EquipmentMark['type']> = ['mower_lines', 'tire_tracks', 'divots', 'ball_marks'];
    
    for (const markType of markTypes) {
      if (Math.random() < 0.3) {
        marks.push({
          type: markType,
          severity: Math.random() * 100,
          location: this.generateRandomBoundingBox(),
          needsRepair: Math.random() < 0.4
        });
      }
    }
    
    return marks;
  }

  // Analizar jugabilidad
  private async analyzePlayability(image: FieldImage): Promise<PlayabilityMetrics> {
    let ballRoll = 75 + Math.random() * 20;
    let lieQuality = 70 + Math.random() * 25;
    
    // Ajustar por tipo de área
    if (image.type === 'green') {
      ballRoll += 15;
      lieQuality += 10;
    } else if (image.type === 'rough') {
      ballRoll -= 20;
      lieQuality -= 15;
    }
    
    const hazardVisibility = 85 + Math.random() * 10;
    const safetyScore = 90 + Math.random() * 8;
    
    const overallPlayability = (ballRoll + lieQuality + hazardVisibility + safetyScore) / 4;
    
    return {
      ballRoll: Math.min(100, Math.max(0, ballRoll)),
      lieQuality: Math.min(100, Math.max(0, lieQuality)),
      hazardVisibility,
      safetyScore,
      overallPlayability
    };
  }

  // Analizar estética
  private async analyzeAesthetics(image: FieldImage): Promise<AestheticsMetrics> {
    const visualAppeal = 75 + Math.random() * 20;
    const colorConsistency = 70 + Math.random() * 25;
    const landscaping = 80 + Math.random() * 15;
    const cleanliness = 85 + Math.random() * 12;
    
    const overallAesthetics = (visualAppeal + colorConsistency + landscaping + cleanliness) / 4;
    
    return {
      visualAppeal,
      colorConsistency,
      landscaping,
      cleanliness,
      overallAesthetics
    };
  }

  // Detectar problemas del campo
  private async detectFieldIssues(image: FieldImage): Promise<FieldIssue[]> {
    const issues: FieldIssue[] = [];
    
    // Simular detección de problemas
    const issueTypes: IssueType[] = [
      'bare_spots', 'weeds', 'drainage_problem', 'surface_damage', 'maintenance_needed'
    ];
    
    for (const issueType of issueTypes) {
      if (Math.random() < 0.2) { // 20% probabilidad por tipo
        issues.push({
          id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: issueType,
          severity: Math.random() > 0.8 ? 'critical' : Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
          description: this.generateIssueDescription(issueType),
          location: this.generateRandomBoundingBox(),
          estimatedCost: Math.random() * 5000 + 100,
          urgency: Math.random() * 100,
          recommendations: this.generateIssueRecommendations(issueType),
          confidence: 0.7 + Math.random() * 0.25
        });
      }
    }
    
    return issues;
  }

  // Generar descripción de problema
  private generateIssueDescription(issueType: IssueType): string {
    const descriptions: Record<IssueType, string[]> = {
      bare_spots: ['Área sin césped detectada', 'Zona con cobertura vegetal insuficiente'],
      weeds: ['Presencia de malezas identificada', 'Vegetación no deseada detectada'],
      grass_disease: ['Posible enfermedad del césped', 'Síntomas de patología vegetal'],
      drainage_problem: ['Problema de drenaje identificado', 'Acumulación de agua detectada'],
      surface_damage: ['Daño en la superficie del campo', 'Irregularidades en el terreno'],
      equipment_damage: ['Marcas de equipos visibles', 'Daño causado por maquinaria'],
      safety_hazard: ['Riesgo de seguridad identificado', 'Condición peligrosa detectada'],
      maintenance_needed: ['Mantenimiento requerido', 'Área que necesita atención'],
      pest_infestation: ['Posible infestación de plagas', 'Daño por insectos detectado'],
      irrigation_issue: ['Problema de irrigación', 'Sistema de riego deficiente']
    };
    
    const options = descriptions[issueType] || ['Problema no especificado'];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Generar recomendaciones para problemas
  private generateIssueRecommendations(issueType: IssueType): string[] {
    const recommendations: Record<IssueType, string[]> = {
      bare_spots: ['Resembrar área afectada', 'Aplicar fertilizante', 'Mejorar drenaje si es necesario'],
      weeds: ['Aplicar herbicida selectivo', 'Mejorar densidad del césped', 'Ajustar programa de fertilización'],
      grass_disease: ['Aplicar fungicida específico', 'Mejorar circulación de aire', 'Ajustar riego'],
      drainage_problem: ['Instalar drenaje adicional', 'Nivelar superficie', 'Mejorar pendientes'],
      surface_damage: ['Reparar superficie', 'Nivelar área', 'Resembrar si es necesario'],
      equipment_damage: ['Reparar marcas', 'Revisar procedimientos de mantenimiento', 'Capacitar operadores'],
      safety_hazard: ['Corregir inmediatamente', 'Señalizar área', 'Restringir acceso temporal'],
      maintenance_needed: ['Programar mantenimiento', 'Asignar recursos', 'Establecer cronograma'],
      pest_infestation: ['Aplicar tratamiento específico', 'Monitorear población', 'Implementar control integrado'],
      irrigation_issue: ['Revisar sistema de riego', 'Ajustar programación', 'Reparar componentes defectuosos']
    };
    
    return recommendations[issueType] || ['Consultar con especialista'];
  }

  // Calcular puntuación general
  private calculateOverallScore(conditions: ConditionMetrics): number {
    const weights = {
      grassHealth: 0.3,
      surfaceQuality: 0.25,
      maintenance: 0.2,
      playability: 0.15,
      aesthetics: 0.1
    };
    
    return (
      conditions.grassHealth.overallHealth * weights.grassHealth +
      conditions.surfaceQuality.overallQuality * weights.surfaceQuality +
      conditions.maintenance.overallMaintenance * weights.maintenance +
      conditions.playability.overallPlayability * weights.playability +
      conditions.aesthetics.overallAesthetics * weights.aesthetics
    );
  }

  // Generar recomendaciones
  private async generateRecommendations(
    conditions: ConditionMetrics,
    issues: FieldIssue[]
  ): Promise<string[]> {
    const recommendations: string[] = [];
    
    // Recomendaciones basadas en puntuaciones
    if (conditions.grassHealth.overallHealth < 70) {
      recommendations.push('Mejorar programa de fertilización y cuidado del césped');
    }
    
    if (conditions.surfaceQuality.overallQuality < 75) {
      recommendations.push('Revisar y mejorar condiciones de superficie');
    }
    
    if (conditions.maintenance.overallMaintenance < 80) {
      recommendations.push('Intensificar programa de mantenimiento');
    }
    
    // Recomendaciones basadas en problemas críticos
    const criticalIssues = issues.filter(issue => issue.severity === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push('Atender inmediatamente problemas críticos identificados');
    }
    
    // Recomendaciones estacionales
    const season = this.getCurrentSeason();
    recommendations.push(...this.getSeasonalRecommendations(season));
    
    return recommendations;
  }

  // Calcular confianza del análisis
  private calculateAnalysisConfidence(
    grassHealth: GrassHealthMetrics,
    surfaceQuality: SurfaceQualityMetrics,
    maintenance: MaintenanceMetrics
  ): number {
    // La confianza se basa en la consistencia de las métricas
    const metrics = [
      grassHealth.overallHealth,
      surfaceQuality.overallQuality,
      maintenance.overallMaintenance
    ];
    
    const mean = metrics.reduce((a, b) => a + b, 0) / metrics.length;
    const variance = metrics.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / metrics.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Menor desviación = mayor confianza
    return Math.max(0.5, 1 - (standardDeviation / 100));
  }

  // Rastrear progreso a lo largo del tiempo
  async trackProgress(fieldId: string, startDate: Date, endDate: Date, tenant?: string): Promise<ProgressTracking> {
    const tenantId = tenant || getTenantId();
    
    try {
      // Obtener análisis históricos
      const historyKey = `${tenantId}:${fieldId}`;
      const analyses = this.analysisHistory.get(historyKey) || [];
      
      const relevantAnalyses = analyses.filter(analysis => 
        analysis.analysisDate >= startDate && analysis.analysisDate <= endDate
      );
      
      if (relevantAnalyses.length < 2) {
        throw new Error('Insufficient data for progress tracking');
      }
      
      // Calcular mejoras
      const improvements = this.calculateImprovements(relevantAnalyses);
      
      // Calcular progreso general
      const overallProgress = improvements.reduce((sum, imp) => sum + imp.improvement, 0) / improvements.length;
      
      return {
        fieldId,
        startDate,
        endDate,
        images: [], // Se llenarían con las imágenes reales
        improvements,
        overallProgress,
        tenant: tenantId
      };
    } catch (error) {
      console.error('Error tracking progress:', error);
      throw error;
    }
  }

  // Calcular mejoras
  private calculateImprovements(analyses: FieldConditionAnalysis[]): ImprovementMetric[] {
    if (analyses.length < 2) return [];
    
    const first = analyses[0];
    const last = analyses[analyses.length - 1];
    
    const improvements: ImprovementMetric[] = [
      {
        metric: 'Overall Score',
        startValue: first.overallScore,
        endValue: last.overallScore,
        improvement: ((last.overallScore - first.overallScore) / first.overallScore) * 100,
        trend: last.overallScore > first.overallScore ? 'improving' : 
               last.overallScore < first.overallScore ? 'declining' : 'stable'
      },
      {
        metric: 'Grass Health',
        startValue: first.conditions.grassHealth.overallHealth,
        endValue: last.conditions.grassHealth.overallHealth,
        improvement: ((last.conditions.grassHealth.overallHealth - first.conditions.grassHealth.overallHealth) / first.conditions.grassHealth.overallHealth) * 100,
        trend: last.conditions.grassHealth.overallHealth > first.conditions.grassHealth.overallHealth ? 'improving' : 
               last.conditions.grassHealth.overallHealth < first.conditions.grassHealth.overallHealth ? 'declining' : 'stable'
      }
    ];
    
    return improvements;
  }

  // Procesar nuevas imágenes
  private async processNewImages(): Promise<void> {
    console.log('Processing new images for analysis...');
    
    // En producción, esto obtendría nuevas imágenes de la base de datos
    // y las procesaría automáticamente
  }

  // Guardar análisis en historial
  private saveAnalysisToHistory(analysis: FieldConditionAnalysis): void {
    const key = `${analysis.tenant}:${analysis.fieldId}`;
    const history = this.analysisHistory.get(key) || [];
    
    history.push(analysis);
    
    // Mantener solo los últimos 100 análisis
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    this.analysisHistory.set(key, history);
  }

  // Utilidades
  private generateRandomBoundingBox(): BoundingBox {
    return {
      x: Math.random() * 800,
      y: Math.random() * 600,
      width: 50 + Math.random() * 200,
      height: 50 + Math.random() * 200
    };
  }

  private getWeatherFactor(weather: WeatherConditions): number {
    let factor = 1.0;
    
    if (weather.temperature < 10 || weather.temperature > 35) {
      factor *= 0.8; // Temperaturas extremas afectan el verdor
    }
    
    if (weather.humidity < 30) {
      factor *= 0.9; // Baja humedad afecta el verdor
    }
    
    if (weather.cloudCover > 80) {
      factor *= 0.95; // Mucha nubosidad reduce el verdor
    }
    
    return factor;
  }

  private getSeasonFactor(timestamp: Date): number {
    const month = timestamp.getMonth();
    
    // Primavera y verano tienen mejor verdor
    if (month >= 2 && month <= 8) {
      return 1.0;
    } else {
      return 0.8; // Otoño e invierno
    }
  }

  private getTimeFactor(timestamp: Date): number {
    const hour = timestamp.getHours();
    
    // Mejores condiciones de luz entre 10 AM y 4 PM
    if (hour >= 10 && hour <= 16) {
      return 1.0;
    } else {
      return 0.9;
    }
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  private getSeasonalRecommendations(season: string): string[] {
    const recommendations: Record<string, string[]> = {
      spring: ['Aplicar fertilizante de primavera', 'Airear el suelo', 'Resembrar áreas dañadas'],
      summer: ['Mantener riego adecuado', 'Monitorear plagas', 'Cortar a altura apropiada'],
      fall: ['Aplicar fertilizante de otoño', 'Recoger hojas', 'Preparar para invierno'],
      winter: ['Reducir tráfico', 'Proteger áreas sensibles', 'Planificar mantenimiento']
    };
    
    return recommendations[season] || [];
  }

  // Obtener estadísticas del servicio
  getServiceStats(tenant?: string): any {
    const tenantId = tenant || getTenantId();
    
    const totalAnalyses = Array.from(this.analysisHistory.values())
      .flat()
      .filter(analysis => analysis.tenant === tenantId).length;
    
    const recentAnalyses = Array.from(this.analysisHistory.values())
      .flat()
      .filter(analysis => 
        analysis.tenant === tenantId && 
        analysis.analysisDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
    
    const avgScore = recentAnalyses.length > 0 
      ? recentAnalyses.reduce((sum, a) => sum + a.overallScore, 0) / recentAnalyses.length 
      : 0;
    
    return {
      totalAnalyses,
      recentAnalyses: recentAnalyses.length,
      averageScore: avgScore,
      modelsLoaded: this.models.size,
      lastAnalysis: recentAnalyses.length > 0 
        ? Math.max(...recentAnalyses.map(a => a.analysisDate.getTime()))
        : null
    };
  }
}

// Exportar instancia
export const computerVisionService = ComputerVisionService.getInstance();

