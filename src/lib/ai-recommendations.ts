// Sistema de Recomendaciones con IA para TeeReserve Golf
// Versión simplificada para demostración

export interface UserPreferences {
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  preferred_time: 'morning' | 'afternoon' | 'evening';
  budget_range: 'budget' | 'mid-range' | 'premium' | 'luxury';
  location_preference: string;
  course_features: string[];
  playing_frequency: 'weekly' | 'monthly' | 'occasionally';
  group_size: number;
}

export interface GolfCourse {
  id: number;
  name: string;
  location: string;
  price: number;
  rating: number;
  difficulty: string;
  features: string[];
  description: string;
  image: string;
}

export interface RecommendationResult {
  course: GolfCourse;
  score: number;
  reasons: string[];
  best_time: string;
  estimated_price: number;
}

export class AIRecommendationEngine {
  private static instance: AIRecommendationEngine;
  
  public static getInstance(): AIRecommendationEngine {
    if (!AIRecommendationEngine.instance) {
      AIRecommendationEngine.instance = new AIRecommendationEngine();
    }
    return AIRecommendationEngine.instance;
  }

  /**
   * Genera recomendaciones personalizadas usando algoritmos inteligentes
   */
  async generateRecommendations(
    userPreferences: UserPreferences,
    availableCourses: GolfCourse[],
    userHistory?: any[]
  ): Promise<RecommendationResult[]> {
    // Simular procesamiento IA con delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return this.getIntelligentRecommendations(userPreferences, availableCourses, userHistory);
  }

  /**
   * Algoritmo inteligente de recomendaciones
   */
  private getIntelligentRecommendations(
    preferences: UserPreferences,
    courses: GolfCourse[],
    history?: any[]
  ): RecommendationResult[] {
    const scoredCourses = courses.map(course => {
      let score = 0;
      const reasons: string[] = [];

      // Score base por rating (30% del total)
      const ratingScore = (course.rating / 5) * 30;
      score += ratingScore;
      if (course.rating >= 4.5) {
        reasons.push('Excelente calificación de usuarios (4.5+ estrellas)');
      } else if (course.rating >= 4.0) {
        reasons.push('Muy buena calificación de usuarios');
      }

      // Score por presupuesto (25% del total)
      const budgetScore = this.calculateBudgetScore(course.price, preferences.budget_range);
      score += budgetScore;
      if (budgetScore >= 20) {
        reasons.push('Perfecto para tu rango de presupuesto');
      } else if (budgetScore >= 15) {
        reasons.push('Buen valor por el dinero');
      }

      // Score por características (20% del total)
      const featureScore = this.calculateFeatureScore(course.features, preferences.course_features);
      score += featureScore;
      const matchingFeatures = course.features.filter(feature => 
        preferences.course_features.includes(feature)
      );
      if (matchingFeatures.length > 0) {
        reasons.push(`Incluye: ${matchingFeatures.slice(0, 2).join(', ')}`);
      }

      // Score por nivel de habilidad (15% del total)
      const skillScore = this.calculateSkillScore(course.difficulty, preferences.skill_level);
      score += skillScore;
      if (skillScore >= 12) {
        reasons.push('Perfecto para tu nivel de habilidad');
      }

      // Score por ubicación (10% del total)
      const locationScore = this.calculateLocationScore(course.location, preferences.location_preference);
      score += locationScore;
      if (locationScore >= 8) {
        reasons.push('Ubicación muy conveniente');
      }

      // Bonus por historial (si existe)
      if (history && history.some(h => h.course_name.includes(course.name.split(' ')[0]))) {
        score += 5;
        reasons.push('Basado en tu historial positivo');
      }

      // Bonus por frecuencia de juego
      if (preferences.playing_frequency === 'weekly' && course.features.includes('Golf academy')) {
        score += 3;
        reasons.push('Ideal para jugadores frecuentes');
      }

      return {
        course,
        score: Math.min(Math.round(score), 100),
        reasons: reasons.slice(0, 3),
        best_time: this.getBestTimeRecommendation(preferences.preferred_time, course),
        estimated_price: this.calculateEstimatedPrice(course.price, preferences.preferred_time),
      };
    });

    return scoredCourses
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  private calculateBudgetScore(price: number, budgetRange: string): number {
    const budgetRanges = {
      budget: { min: 0, max: 100, optimal: 75 },
      'mid-range': { min: 100, max: 200, optimal: 150 },
      premium: { min: 200, max: 300, optimal: 250 },
      luxury: { min: 300, max: 1000, optimal: 400 }
    };
    
    const range = budgetRanges[budgetRange as keyof typeof budgetRanges];
    if (price >= range.min && price <= range.max) {
      const distanceFromOptimal = Math.abs(price - range.optimal) / range.optimal;
      return 25 * (1 - distanceFromOptimal);
    }
    return 0;
  }

  private calculateFeatureScore(courseFeatures: string[], preferredFeatures: string[]): number {
    const matchingFeatures = courseFeatures.filter(feature => 
      preferredFeatures.includes(feature)
    );
    return Math.min(matchingFeatures.length * 5, 20);
  }

  private calculateSkillScore(difficulty: string, skillLevel: string): number {
    const skillMap = {
      beginner: ['Fácil', 'Principiante'],
      intermediate: ['Intermedio', 'Moderado'],
      advanced: ['Avanzado', 'Intermedio-Avanzado'],
      professional: ['Profesional', 'Avanzado', 'Experto']
    };
    
    const appropriateDifficulties = skillMap[skillLevel as keyof typeof skillMap] || [];
    return appropriateDifficulties.some(d => difficulty.includes(d)) ? 15 : 8;
  }

  private calculateLocationScore(courseLocation: string, preferredLocation: string): number {
    if (courseLocation.toLowerCase().includes(preferredLocation.toLowerCase())) {
      return 10;
    }
    // Bonus por ubicaciones populares
    if (courseLocation.includes('Los Cabos') || courseLocation.includes('Cancún')) {
      return 6;
    }
    return 3;
  }

  private getBestTimeRecommendation(preferredTime: string, course: GolfCourse): string {
    const timeRecommendations = {
      morning: '7:30 AM - 9:30 AM',
      afternoon: '1:00 PM - 3:00 PM',
      evening: '4:30 PM - 6:30 PM'
    };
    
    let baseTime = timeRecommendations[preferredTime as keyof typeof timeRecommendations] || '9:00 AM - 11:00 AM';
    
    // Ajustar según el campo
    if (course.features.includes('Vista al mar')) {
      if (preferredTime === 'morning') baseTime = '6:30 AM - 8:30 AM (mejor luz)';
      if (preferredTime === 'evening') baseTime = '5:00 PM - 7:00 PM (atardecer)';
    }
    
    return baseTime;
  }

  private calculateEstimatedPrice(basePrice: number, preferredTime: string): number {
    let price = basePrice;
    
    // Ajustar precio según horario
    if (preferredTime === 'morning') {
      price *= 0.9; // 10% descuento matutino
    } else if (preferredTime === 'evening') {
      price *= 1.1; // 10% premium vespertino
    }
    
    return Math.round(price);
  }

  /**
   * Analiza patrones de usuario (versión simplificada)
   */
  async analyzeUserPatterns(userId: string, bookingHistory: any[]): Promise<UserPreferences> {
    // Simular análisis
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!bookingHistory || bookingHistory.length === 0) {
      return this.getDefaultPreferences();
    }

    // Análisis básico del historial
    const avgPrice = bookingHistory.reduce((sum, booking) => sum + booking.price, 0) / bookingHistory.length;
    const mostCommonLocation = this.getMostCommonLocation(bookingHistory);
    const preferredFeatures = this.extractPreferredFeatures(bookingHistory);

    return {
      skill_level: this.inferSkillLevel(bookingHistory),
      preferred_time: this.inferPreferredTime(bookingHistory),
      budget_range: this.inferBudgetRange(avgPrice),
      location_preference: mostCommonLocation,
      course_features: preferredFeatures,
      playing_frequency: this.inferPlayingFrequency(bookingHistory),
      group_size: Math.round(bookingHistory.reduce((sum, b) => sum + (b.group_size || 2), 0) / bookingHistory.length),
    };
  }

  private getMostCommonLocation(history: any[]): string {
    const locations = history.map(h => h.location || 'Los Cabos');
    const locationCounts = locations.reduce((acc, loc) => {
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(locationCounts).reduce((a, b) => 
      locationCounts[a] > locationCounts[b] ? a : b
    );
  }

  private extractPreferredFeatures(history: any[]): string[] {
    const allFeatures = history.flatMap(h => h.features || []);
    const featureCounts = allFeatures.reduce((acc, feature) => {
      acc[feature] = (acc[feature] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(featureCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([feature]) => feature);
  }

  private inferSkillLevel(history: any[]): UserPreferences['skill_level'] {
    const avgRating = history.reduce((sum, h) => sum + (h.rating || 4), 0) / history.length;
    const hasAdvancedCourses = history.some(h => h.difficulty?.includes('Avanzado'));
    
    if (avgRating >= 4.5 && hasAdvancedCourses) return 'advanced';
    if (avgRating >= 4.0) return 'intermediate';
    return 'beginner';
  }

  private inferPreferredTime(history: any[]): UserPreferences['preferred_time'] {
    const times = history.map(h => h.time || '9:00');
    const morningCount = times.filter(t => parseInt(t) < 12).length;
    const afternoonCount = times.filter(t => parseInt(t) >= 12 && parseInt(t) < 17).length;
    
    if (morningCount > afternoonCount) return 'morning';
    if (afternoonCount > morningCount) return 'afternoon';
    return 'evening';
  }

  private inferBudgetRange(avgPrice: number): UserPreferences['budget_range'] {
    if (avgPrice < 100) return 'budget';
    if (avgPrice < 200) return 'mid-range';
    if (avgPrice < 300) return 'premium';
    return 'luxury';
  }

  private inferPlayingFrequency(history: any[]): UserPreferences['playing_frequency'] {
    const monthsSpan = 6; // Asumimos 6 meses de historial
    const gamesPerMonth = history.length / monthsSpan;
    
    if (gamesPerMonth >= 4) return 'weekly';
    if (gamesPerMonth >= 1) return 'monthly';
    return 'occasionally';
  }

  /**
   * Preferencias por defecto
   */
  private getDefaultPreferences(): UserPreferences {
    return {
      skill_level: 'intermediate',
      preferred_time: 'morning',
      budget_range: 'mid-range',
      location_preference: 'Los Cabos',
      course_features: ['Vista al mar', 'Driving range'],
      playing_frequency: 'monthly',
      group_size: 2,
    };
  }

  /**
   * Genera insights para el dashboard administrativo
   */
  async generateBusinessInsights(bookingsData: any[]): Promise<any> {
    // Simular análisis
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      trends: [
        'Incremento del 25% en reservas matutinas',
        'Mayor preferencia por campos con vista al mar',
        'Crecimiento en segmento premium (+15%)'
      ],
      recommendations: [
        'Optimizar precios en horarios pico (7-9 AM)',
        'Expandir oferta de campos premium',
        'Implementar paquetes de múltiples rondas'
      ],
      peak_times: ['7:30 AM - 9:30 AM', '2:00 PM - 4:00 PM'],
      popular_courses: ['Cabo Real Golf Club', 'Cabo del Sol', 'Solmar Golf Links'],
      revenue_opportunities: [
        'Membresías anuales con descuentos',
        'Paquetes corporativos',
        'Servicios premium (caddie, transporte)'
      ]
    };
  }
}

export default AIRecommendationEngine;

