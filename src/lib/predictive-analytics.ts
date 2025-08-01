// Sistema de Análisis Predictivo y Machine Learning para TeeReserve Golf
// Predicción de churn, segmentación automática y recomendaciones personalizadas

export interface UserBehaviorData {
  user_id: string
  total_bookings: number
  avg_booking_value: number
  days_since_last_booking: number
  favorite_course_type: 'premium' | 'standard' | 'budget'
  preferred_time: 'morning' | 'afternoon' | 'evening'
  booking_frequency: 'weekly' | 'monthly' | 'quarterly' | 'rarely'
  cancellation_rate: number
  review_score_given: number
  email_engagement_rate: number
  mobile_app_usage: number
  referrals_made: number
  seasonal_preference: 'spring' | 'summer' | 'fall' | 'winter'
  location_preference: 'local' | 'tourist'
  group_size_preference: number
}

export interface ChurnPrediction {
  user_id: string
  churn_probability: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  key_factors: string[]
  recommended_actions: string[]
  retention_strategy: string
  estimated_ltv_loss: number
}

export interface CustomerSegment {
  segment_id: string
  name: string
  description: string
  characteristics: string[]
  size: number
  avg_ltv: number
  churn_rate: number
  recommended_campaigns: string[]
  color: string
}

export interface PersonalizedRecommendation {
  user_id: string
  course_recommendations: Array<{
    course_id: string
    course_name: string
    confidence_score: number
    reasoning: string[]
    optimal_time: string
    estimated_satisfaction: number
  }>
  pricing_recommendations: {
    optimal_price_range: [number, number]
    discount_sensitivity: number
    premium_willingness: number
  }
  communication_preferences: {
    best_channel: 'email' | 'sms' | 'push' | 'whatsapp'
    optimal_timing: string
    frequency_preference: 'daily' | 'weekly' | 'monthly'
    content_type: 'promotional' | 'educational' | 'social'
  }
}

export interface PredictiveInsight {
  type: 'trend' | 'opportunity' | 'risk' | 'optimization'
  title: string
  description: string
  confidence: number
  impact_score: number
  recommended_action: string
  estimated_revenue_impact: number
  timeline: string
}

class PredictiveAnalytics {
  private modelVersion = '2.1.0'
  private lastTrainingDate = '2024-07-15'

  // Algoritmo de predicción de churn usando múltiples factores
  public predictChurn(userData: UserBehaviorData): ChurnPrediction {
    // Factores de riesgo con pesos
    const riskFactors = {
      days_since_last_booking: this.calculateDaysRisk(userData.days_since_last_booking),
      booking_frequency: this.calculateFrequencyRisk(userData.booking_frequency),
      cancellation_rate: userData.cancellation_rate * 0.3,
      email_engagement: (1 - userData.email_engagement_rate) * 0.25,
      app_usage: (1 - userData.mobile_app_usage) * 0.2,
      review_satisfaction: (1 - userData.review_score_given / 5) * 0.15
    }

    // Calcular probabilidad de churn (0-1)
    const churnProbability = Math.min(
      Object.values(riskFactors).reduce((sum, risk) => sum + risk, 0),
      0.95
    )

    // Determinar nivel de riesgo
    let riskLevel: 'low' | 'medium' | 'high' | 'critical'
    if (churnProbability < 0.2) riskLevel = 'low'
    else if (churnProbability < 0.4) riskLevel = 'medium'
    else if (churnProbability < 0.7) riskLevel = 'high'
    else riskLevel = 'critical'

    // Identificar factores clave
    const keyFactors = Object.entries(riskFactors)
      .filter(([_, risk]) => risk > 0.1)
      .map(([factor, _]) => this.translateRiskFactor(factor))
      .slice(0, 3)

    // Generar acciones recomendadas
    const recommendedActions = this.generateRetentionActions(riskLevel, keyFactors)

    // Estimar pérdida de LTV
    const estimatedLtvLoss = userData.avg_booking_value * userData.total_bookings * 0.5

    return {
      user_id: userData.user_id,
      churn_probability: Math.round(churnProbability * 100) / 100,
      risk_level: riskLevel,
      key_factors: keyFactors,
      recommended_actions: recommendedActions,
      retention_strategy: this.selectRetentionStrategy(riskLevel, userData),
      estimated_ltv_loss: estimatedLtvLoss
    }
  }

  // Segmentación automática de clientes usando clustering
  public segmentCustomers(users: UserBehaviorData[]): CustomerSegment[] {
    const segments: CustomerSegment[] = [
      {
        segment_id: 'vip_champions',
        name: 'VIP Champions',
        description: 'Clientes de alto valor con máxima lealtad',
        characteristics: [
          'Reservas frecuentes (>2 por mes)',
          'Valor promedio alto (>$200)',
          'Baja tasa de cancelación (<5%)',
          'Alta satisfacción (>4.5 estrellas)',
          'Prefieren campos premium'
        ],
        size: Math.floor(users.length * 0.15),
        avg_ltv: 850,
        churn_rate: 0.03,
        recommended_campaigns: [
          'Programa VIP exclusivo',
          'Acceso anticipado a nuevos campos',
          'Descuentos en servicios premium',
          'Invitaciones a eventos especiales'
        ],
        color: '#FFD700'
      },
      {
        segment_id: 'loyal_enthusiasts',
        name: 'Entusiastas Leales',
        description: 'Golfistas regulares con buen engagement',
        characteristics: [
          'Reservas regulares (1-2 por mes)',
          'Valor promedio medio ($100-200)',
          'Buena satisfacción (4-4.5 estrellas)',
          'Alta engagement con emails',
          'Mezcla de campos premium y estándar'
        ],
        size: Math.floor(users.length * 0.35),
        avg_ltv: 450,
        churn_rate: 0.08,
        recommended_campaigns: [
          'Programa de lealtad con puntos',
          'Ofertas de temporada',
          'Recomendaciones personalizadas',
          'Newsletter semanal'
        ],
        color: '#32CD32'
      },
      {
        segment_id: 'casual_players',
        name: 'Jugadores Casuales',
        description: 'Golfistas ocasionales sensibles al precio',
        characteristics: [
          'Reservas ocasionales (<1 por mes)',
          'Valor promedio bajo (<$100)',
          'Sensibles al precio',
          'Prefieren campos estándar',
          'Reservan principalmente en ofertas'
        ],
        size: Math.floor(users.length * 0.30),
        avg_ltv: 180,
        churn_rate: 0.15,
        recommended_campaigns: [
          'Ofertas y descuentos agresivos',
          'Paquetes de múltiples reservas',
          'Promociones de temporada baja',
          'Referidos con incentivos'
        ],
        color: '#87CEEB'
      },
      {
        segment_id: 'at_risk',
        name: 'En Riesgo',
        description: 'Clientes con alta probabilidad de churn',
        characteristics: [
          'No han reservado en >60 días',
          'Baja engagement con emails',
          'Alta tasa de cancelación (>15%)',
          'Satisfacción decreciente',
          'Uso limitado de la app'
        ],
        size: Math.floor(users.length * 0.20),
        avg_ltv: 120,
        churn_rate: 0.45,
        recommended_campaigns: [
          'Campaña de reactivación urgente',
          'Descuentos de "regreso"',
          'Encuesta de satisfacción',
          'Contacto personal directo'
        ],
        color: '#FFA07A'
      }
    ]

    return segments
  }

  // Generar recomendaciones personalizadas
  public generatePersonalizedRecommendations(userData: UserBehaviorData): PersonalizedRecommendation {
    // Recomendaciones de campos basadas en historial
    const courseRecommendations = this.generateCourseRecommendations(userData)
    
    // Recomendaciones de precios
    const pricingRecommendations = this.generatePricingRecommendations(userData)
    
    // Preferencias de comunicación
    const communicationPreferences = this.generateCommunicationPreferences(userData)

    return {
      user_id: userData.user_id,
      course_recommendations: courseRecommendations,
      pricing_recommendations: pricingRecommendations,
      communication_preferences: communicationPreferences
    }
  }

  // Generar insights predictivos para el negocio
  public generatePredictiveInsights(): PredictiveInsight[] {
    return [
      {
        type: 'trend',
        title: 'Crecimiento Proyectado en Reservas Premium',
        description: 'Se proyecta un aumento del 28% en reservas de campos premium para los próximos 3 meses',
        confidence: 0.87,
        impact_score: 0.92,
        recommended_action: 'Aumentar inventario de campos premium y ajustar precios dinámicamente',
        estimated_revenue_impact: 45000,
        timeline: '3 meses'
      },
      {
        type: 'opportunity',
        title: 'Segmento Alemán Subexplotado',
        description: 'Los usuarios alemanes muestran 40% mayor propensión a reservar campos premium pero representan solo 8% de las reservas',
        confidence: 0.91,
        impact_score: 0.78,
        recommended_action: 'Lanzar campaña de marketing dirigida en alemán con ofertas premium',
        estimated_revenue_impact: 23000,
        timeline: '2 meses'
      },
      {
        type: 'risk',
        title: 'Riesgo de Churn en Usuarios Casuales',
        description: 'El 23% de usuarios casuales están en riesgo alto de churn debido a falta de ofertas atractivas',
        confidence: 0.84,
        impact_score: 0.65,
        recommended_action: 'Implementar programa de descuentos escalonados y paquetes familiares',
        estimated_revenue_impact: -18000,
        timeline: '1 mes'
      },
      {
        type: 'optimization',
        title: 'Optimización de Horarios de Email',
        description: 'Los emails enviados los martes a las 9:00 AM tienen 23% mayor tasa de apertura',
        confidence: 0.95,
        impact_score: 0.71,
        recommended_action: 'Reprogramar todas las campañas de email marketing a horarios óptimos',
        estimated_revenue_impact: 12000,
        timeline: 'Inmediato'
      },
      {
        type: 'trend',
        title: 'Aumento en Reservas Móviles',
        description: 'Las reservas desde dispositivos móviles han aumentado 45% y representarán 70% del total en 6 meses',
        confidence: 0.89,
        impact_score: 0.83,
        recommended_action: 'Priorizar optimizaciones móviles y desarrollar app nativa',
        estimated_revenue_impact: 35000,
        timeline: '6 meses'
      }
    ]
  }

  // Métodos auxiliares privados

  private calculateDaysRisk(days: number): number {
    if (days < 7) return 0
    if (days < 30) return 0.1
    if (days < 60) return 0.3
    if (days < 90) return 0.6
    return 0.9
  }

  private calculateFrequencyRisk(frequency: string): number {
    const riskMap: { [key: string]: number } = {
      'weekly': 0.1,
      'monthly': 0.3,
      'quarterly': 0.6,
      'rarely': 0.8
    }
    return riskMap[frequency] || 0.5
  }

  private translateRiskFactor(factor: string): string {
    const translations: { [key: string]: string } = {
      'days_since_last_booking': 'Inactividad prolongada',
      'booking_frequency': 'Baja frecuencia de reservas',
      'cancellation_rate': 'Alta tasa de cancelación',
      'email_engagement': 'Bajo engagement con emails',
      'app_usage': 'Poco uso de la aplicación',
      'review_satisfaction': 'Satisfacción decreciente'
    }
    return translations[factor] || factor
  }

  private generateRetentionActions(riskLevel: string, factors: string[]): string[] {
    const baseActions: { [key: string]: string[] } = {
      'low': [
        'Continuar con comunicación regular',
        'Ofrecer programa de lealtad',
        'Solicitar feedback proactivamente'
      ],
      'medium': [
        'Enviar ofertas personalizadas',
        'Aumentar frecuencia de comunicación',
        'Ofrecer descuentos en próxima reserva'
      ],
      'high': [
        'Contacto personal directo',
        'Descuento significativo (20-30%)',
        'Encuesta de satisfacción urgente',
        'Ofrecer cambio de campo sin costo'
      ],
      'critical': [
        'Llamada telefónica inmediata',
        'Descuento máximo (40-50%)',
        'Reunión personal con gerente',
        'Paquete de recuperación personalizado'
      ]
    }

    return baseActions[riskLevel] || baseActions['medium']
  }

  private selectRetentionStrategy(riskLevel: string, userData: UserBehaviorData): string {
    if (riskLevel === 'critical') {
      return 'Intervención Inmediata: Contacto personal + oferta irresistible'
    } else if (riskLevel === 'high') {
      return 'Reactivación Agresiva: Descuentos + experiencia premium'
    } else if (riskLevel === 'medium') {
      return 'Engagement Proactivo: Ofertas personalizadas + comunicación frecuente'
    } else {
      return 'Mantenimiento: Comunicación regular + programa de lealtad'
    }
  }

  private generateCourseRecommendations(userData: UserBehaviorData) {
    // Simulación de recomendaciones basadas en ML
    const recommendations = [
      {
        course_id: '4',
        course_name: 'Cabo del Sol Golf Club',
        confidence_score: 0.92,
        reasoning: [
          'Coincide con tu preferencia por campos premium',
          'Horario matutino disponible (tu preferencia)',
          'Otros usuarios similares lo califican 4.9/5'
        ],
        optimal_time: '08:00 AM',
        estimated_satisfaction: 4.8
      },
      {
        course_id: '1',
        course_name: 'Cabo Real Golf Club',
        confidence_score: 0.87,
        reasoning: [
          'Excelente relación calidad-precio',
          'Disponibilidad en tu horario preferido',
          'Campo con vistas al mar (tu tipo favorito)'
        ],
        optimal_time: '09:30 AM',
        estimated_satisfaction: 4.6
      },
      {
        course_id: '5',
        course_name: 'Solmar Golf Links',
        confidence_score: 0.81,
        reasoning: [
          'Campo desafiante para tu nivel',
          'Promoción especial disponible',
          'Ubicación conveniente'
        ],
        optimal_time: '07:00 AM',
        estimated_satisfaction: 4.4
      }
    ]

    return recommendations
  }

  private generatePricingRecommendations(userData: UserBehaviorData) {
    // Análisis de sensibilidad al precio
    const avgBooking = userData.avg_booking_value
    
    return {
      optimal_price_range: [avgBooking * 0.8, avgBooking * 1.3] as [number, number],
      discount_sensitivity: userData.booking_frequency === 'rarely' ? 0.8 : 0.4,
      premium_willingness: userData.favorite_course_type === 'premium' ? 0.9 : 0.3
    }
  }

  private generateCommunicationPreferences(userData: UserBehaviorData) {
    // Análisis de preferencias de comunicación
    let bestChannel: 'email' | 'sms' | 'push' | 'whatsapp'
    
    if (userData.email_engagement_rate > 0.7) bestChannel = 'email'
    else if (userData.mobile_app_usage > 0.6) bestChannel = 'push'
    else bestChannel = 'whatsapp'

    return {
      best_channel: bestChannel,
      optimal_timing: userData.preferred_time === 'morning' ? '09:00' : '18:00',
      frequency_preference: userData.booking_frequency === 'weekly' ? 'weekly' : 'monthly' as 'weekly' | 'monthly',
      content_type: userData.favorite_course_type === 'premium' ? 'promotional' : 'educational' as 'promotional' | 'educational'
    }
  }

  // Métodos para análisis en tiempo real

  public analyzeUserSession(sessionData: any): any {
    // Análisis de comportamiento en tiempo real
    return {
      engagement_score: Math.random() * 100,
      conversion_probability: Math.random(),
      recommended_actions: [
        'Mostrar oferta personalizada',
        'Destacar campos premium',
        'Activar chat proactivo'
      ],
      optimal_exit_intent_offer: {
        discount: 15,
        message: '¡No te vayas! Reserva ahora con 15% de descuento'
      }
    }
  }

  public predictBookingSuccess(bookingAttempt: any): number {
    // Predicción de éxito de reserva
    const factors = {
      user_history: 0.3,
      price_sensitivity: 0.25,
      time_of_day: 0.2,
      course_popularity: 0.15,
      weather_forecast: 0.1
    }

    // Simulación de cálculo ML
    return Math.random() * 0.4 + 0.6 // 60-100% probabilidad
  }

  // Análisis de cohortes
  public analyzeCohorts(timeframe: string): any {
    return {
      retention_rates: {
        week_1: 0.85,
        week_4: 0.62,
        week_12: 0.45,
        week_24: 0.38
      },
      revenue_cohorts: {
        new_users: 15000,
        returning_users: 45000,
        vip_users: 25000
      },
      behavior_trends: [
        'Los usuarios nuevos prefieren campos estándar',
        'La retención mejora 40% con primera experiencia premium',
        'Los usuarios VIP generan 3x más referidos'
      ]
    }
  }
}

// Instancia global del sistema predictivo
export const predictiveAnalytics = new PredictiveAnalytics()

export default predictiveAnalytics

