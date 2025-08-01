// Sistema CRM Avanzado para TeeReserve Golf
// Segmentación de clientes, perfiles detallados y automatización de campañas

export interface CustomerProfile {
  customer_id: string
  personal_info: {
    name: string
    email: string
    phone: string
    date_of_birth: string
    location: {
      city: string
      country: string
      timezone: string
    }
    preferred_language: string
    registration_date: string
  }
  golf_profile: {
    handicap: number
    skill_level: 'beginner' | 'intermediate' | 'advanced' | 'professional'
    preferred_course_type: 'links' | 'parkland' | 'desert' | 'mountain' | 'coastal'
    favorite_tee_time: 'early_morning' | 'morning' | 'afternoon' | 'evening'
    typical_group_size: number
    equipment_preference: 'rental' | 'own' | 'premium_rental'
    cart_preference: 'walking' | 'cart_required' | 'cart_optional'
  }
  booking_behavior: {
    total_bookings: number
    avg_booking_value: number
    booking_frequency: 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'rarely'
    advance_booking_days: number
    cancellation_rate: number
    no_show_rate: number
    preferred_booking_channel: 'web' | 'mobile' | 'phone' | 'email'
    seasonal_patterns: string[]
  }
  financial_profile: {
    lifetime_value: number
    avg_spend_per_visit: number
    payment_method_preference: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer'
    price_sensitivity: 'low' | 'medium' | 'high'
    discount_responsiveness: number
    premium_willingness: number
  }
  engagement_metrics: {
    email_open_rate: number
    email_click_rate: number
    app_usage_frequency: number
    review_participation: number
    referral_count: number
    social_media_engagement: number
    customer_service_interactions: number
  }
  satisfaction_scores: {
    overall_satisfaction: number
    course_quality_rating: number
    service_quality_rating: number
    value_for_money_rating: number
    likelihood_to_recommend: number
    last_feedback_date: string
  }
  segment_info: {
    current_segment: string
    segment_history: Array<{
      segment: string
      start_date: string
      end_date?: string
    }>
    risk_score: number
    opportunity_score: number
    next_best_action: string
  }
}

export interface CampaignTemplate {
  template_id: string
  name: string
  description: string
  target_segments: string[]
  campaign_type: 'email' | 'sms' | 'push' | 'direct_mail' | 'phone'
  trigger_conditions: {
    event_type: 'booking' | 'cancellation' | 'birthday' | 'inactivity' | 'milestone'
    time_delay: number
    conditions: Record<string, any>
  }
  content: {
    subject: string
    message: string
    call_to_action: string
    offer_details?: {
      discount_percentage?: number
      discount_amount?: number
      valid_until: string
      terms_conditions: string
    }
  }
  personalization_fields: string[]
  success_metrics: {
    target_open_rate: number
    target_click_rate: number
    target_conversion_rate: number
  }
}

export interface LeadScore {
  lead_id: string
  customer_id?: string
  score: number
  score_breakdown: {
    demographic_score: number
    behavioral_score: number
    engagement_score: number
    intent_score: number
    fit_score: number
  }
  conversion_probability: number
  estimated_ltv: number
  recommended_actions: string[]
  priority_level: 'hot' | 'warm' | 'cold' | 'nurture'
  next_contact_date: string
  assigned_sales_rep?: string
}

export interface SegmentPerformance {
  segment_id: string
  segment_name: string
  period: string
  metrics: {
    total_customers: number
    new_customers: number
    churned_customers: number
    revenue: number
    avg_booking_value: number
    booking_frequency: number
    satisfaction_score: number
    retention_rate: number
    campaign_response_rate: number
  }
  trends: {
    revenue_growth: number
    customer_growth: number
    satisfaction_trend: number
    retention_trend: number
  }
  insights: string[]
  recommendations: string[]
}

class CRMSystem {
  private version = '3.0.0'
  private lastUpdate = '2024-07-19'

  // Análisis avanzado de segmentación
  public analyzeCustomerSegmentation(customers: CustomerProfile[]): SegmentPerformance[] {
    const segments = this.getSegmentDefinitions()
    
    return segments.map(segment => {
      const segmentCustomers = customers.filter(customer => 
        customer.segment_info.current_segment === segment.id
      )

      const metrics = this.calculateSegmentMetrics(segmentCustomers)
      const trends = this.calculateSegmentTrends(segmentCustomers)
      const insights = this.generateSegmentInsights(segment.id, metrics, trends)
      const recommendations = this.generateSegmentRecommendations(segment.id, metrics)

      return {
        segment_id: segment.id,
        segment_name: segment.name,
        period: 'last_30_days',
        metrics,
        trends,
        insights,
        recommendations
      }
    })
  }

  // Sistema de scoring de leads
  public calculateLeadScore(customerData: Partial<CustomerProfile>): LeadScore {
    const demographic_score = this.calculateDemographicScore(customerData)
    const behavioral_score = this.calculateBehavioralScore(customerData)
    const engagement_score = this.calculateEngagementScore(customerData)
    const intent_score = this.calculateIntentScore(customerData)
    const fit_score = this.calculateFitScore(customerData)

    const total_score = Math.round(
      demographic_score * 0.2 +
      behavioral_score * 0.25 +
      engagement_score * 0.2 +
      intent_score * 0.2 +
      fit_score * 0.15
    )

    const conversion_probability = this.calculateConversionProbability(total_score)
    const estimated_ltv = this.estimateLifetimeValue(customerData, total_score)
    const priority_level = this.determinePriorityLevel(total_score)
    const recommended_actions = this.generateLeadActions(total_score, customerData)

    return {
      lead_id: customerData.customer_id || `lead_${Date.now()}`,
      customer_id: customerData.customer_id,
      score: total_score,
      score_breakdown: {
        demographic_score,
        behavioral_score,
        engagement_score,
        intent_score,
        fit_score
      },
      conversion_probability,
      estimated_ltv,
      recommended_actions,
      priority_level,
      next_contact_date: this.calculateNextContactDate(priority_level),
      assigned_sales_rep: this.assignSalesRep(priority_level)
    }
  }

  // Automatización de campañas por segmento
  public generateAutomatedCampaigns(segment: string): CampaignTemplate[] {
    const campaignTemplates: Record<string, CampaignTemplate[]> = {
      'vip_champions': [
        {
          template_id: 'vip_exclusive_access',
          name: 'Acceso Exclusivo VIP',
          description: 'Invitación a eventos exclusivos y nuevos campos',
          target_segments: ['vip_champions'],
          campaign_type: 'email',
          trigger_conditions: {
            event_type: 'milestone',
            time_delay: 0,
            conditions: { milestone_type: 'vip_anniversary' }
          },
          content: {
            subject: '🏆 Invitación Exclusiva: Nuevo Campo Premium',
            message: 'Como miembro VIP, tienes acceso anticipado a nuestro nuevo campo de golf de lujo.',
            call_to_action: 'Reservar Ahora',
            offer_details: {
              discount_percentage: 20,
              valid_until: '2024-08-31',
              terms_conditions: 'Válido solo para miembros VIP'
            }
          },
          personalization_fields: ['name', 'favorite_course', 'handicap'],
          success_metrics: {
            target_open_rate: 0.85,
            target_click_rate: 0.45,
            target_conversion_rate: 0.35
          }
        },
        {
          template_id: 'vip_concierge_service',
          name: 'Servicio de Concierge VIP',
          description: 'Oferta de servicios personalizados premium',
          target_segments: ['vip_champions'],
          campaign_type: 'email',
          trigger_conditions: {
            event_type: 'booking',
            time_delay: 24,
            conditions: { booking_value: { min: 300 } }
          },
          content: {
            subject: '🎩 Servicio de Concierge Personalizado',
            message: 'Permítenos hacer tu próxima experiencia de golf aún más especial.',
            call_to_action: 'Solicitar Concierge'
          },
          personalization_fields: ['name', 'next_booking_date'],
          success_metrics: {
            target_open_rate: 0.80,
            target_click_rate: 0.40,
            target_conversion_rate: 0.25
          }
        }
      ],
      'loyal_enthusiasts': [
        {
          template_id: 'loyalty_points_reminder',
          name: 'Recordatorio de Puntos de Lealtad',
          description: 'Recordatorio de puntos acumulados y beneficios',
          target_segments: ['loyal_enthusiasts'],
          campaign_type: 'email',
          trigger_conditions: {
            event_type: 'milestone',
            time_delay: 0,
            conditions: { points_threshold: 500 }
          },
          content: {
            subject: '⭐ ¡Tienes puntos por canjear!',
            message: 'Has acumulado suficientes puntos para obtener una ronda gratuita.',
            call_to_action: 'Canjear Puntos',
            offer_details: {
              discount_percentage: 15,
              valid_until: '2024-09-30',
              terms_conditions: 'Válido en campos seleccionados'
            }
          },
          personalization_fields: ['name', 'points_balance', 'favorite_course'],
          success_metrics: {
            target_open_rate: 0.70,
            target_click_rate: 0.35,
            target_conversion_rate: 0.25
          }
        }
      ],
      'casual_players': [
        {
          template_id: 'weekend_special_offer',
          name: 'Oferta Especial de Fin de Semana',
          description: 'Descuentos atractivos para jugadores ocasionales',
          target_segments: ['casual_players'],
          campaign_type: 'email',
          trigger_conditions: {
            event_type: 'inactivity',
            time_delay: 30,
            conditions: { days_since_last_booking: 30 }
          },
          content: {
            subject: '🏌️ Oferta Especial: 30% de Descuento',
            message: 'Te extrañamos en los campos. Disfruta de un descuento especial.',
            call_to_action: 'Reservar con Descuento',
            offer_details: {
              discount_percentage: 30,
              valid_until: '2024-08-15',
              terms_conditions: 'Válido fines de semana'
            }
          },
          personalization_fields: ['name', 'last_course_played'],
          success_metrics: {
            target_open_rate: 0.60,
            target_click_rate: 0.25,
            target_conversion_rate: 0.15
          }
        }
      ],
      'at_risk': [
        {
          template_id: 'win_back_campaign',
          name: 'Campaña de Recuperación',
          description: 'Oferta irresistible para clientes en riesgo',
          target_segments: ['at_risk'],
          campaign_type: 'email',
          trigger_conditions: {
            event_type: 'inactivity',
            time_delay: 60,
            conditions: { churn_probability: { min: 0.7 } }
          },
          content: {
            subject: '💔 Te extrañamos - Oferta Especial de Regreso',
            message: 'Queremos recuperarte con una oferta que no podrás rechazar.',
            call_to_action: 'Volver a Jugar',
            offer_details: {
              discount_percentage: 50,
              valid_until: '2024-08-31',
              terms_conditions: 'Oferta única de regreso'
            }
          },
          personalization_fields: ['name', 'days_since_last_visit'],
          success_metrics: {
            target_open_rate: 0.50,
            target_click_rate: 0.20,
            target_conversion_rate: 0.10
          }
        }
      ]
    }

    return campaignTemplates[segment] || []
  }

  // Perfiles detallados de clientes
  public generateDetailedCustomerProfile(customerId: string): CustomerProfile {
    // Simulación de datos detallados del cliente
    return {
      customer_id: customerId,
      personal_info: {
        name: 'Carlos Mendoza',
        email: 'carlos.mendoza@email.com',
        phone: '+52-664-123-4567',
        date_of_birth: '1985-03-15',
        location: {
          city: 'Tijuana',
          country: 'México',
          timezone: 'America/Tijuana'
        },
        preferred_language: 'es',
        registration_date: '2023-05-20'
      },
      golf_profile: {
        handicap: 12,
        skill_level: 'intermediate',
        preferred_course_type: 'coastal',
        favorite_tee_time: 'morning',
        typical_group_size: 3,
        equipment_preference: 'own',
        cart_preference: 'cart_optional'
      },
      booking_behavior: {
        total_bookings: 24,
        avg_booking_value: 165,
        booking_frequency: 'bi_weekly',
        advance_booking_days: 7,
        cancellation_rate: 0.08,
        no_show_rate: 0.02,
        preferred_booking_channel: 'mobile',
        seasonal_patterns: ['spring_peak', 'summer_regular', 'winter_low']
      },
      financial_profile: {
        lifetime_value: 3960,
        avg_spend_per_visit: 165,
        payment_method_preference: 'credit_card',
        price_sensitivity: 'medium',
        discount_responsiveness: 0.7,
        premium_willingness: 0.6
      },
      engagement_metrics: {
        email_open_rate: 0.75,
        email_click_rate: 0.35,
        app_usage_frequency: 0.8,
        review_participation: 0.6,
        referral_count: 2,
        social_media_engagement: 0.4,
        customer_service_interactions: 3
      },
      satisfaction_scores: {
        overall_satisfaction: 4.3,
        course_quality_rating: 4.5,
        service_quality_rating: 4.2,
        value_for_money_rating: 4.0,
        likelihood_to_recommend: 8.5,
        last_feedback_date: '2024-07-10'
      },
      segment_info: {
        current_segment: 'loyal_enthusiasts',
        segment_history: [
          { segment: 'casual_players', start_date: '2023-05-20', end_date: '2023-11-15' },
          { segment: 'loyal_enthusiasts', start_date: '2023-11-15' }
        ],
        risk_score: 0.15,
        opportunity_score: 0.78,
        next_best_action: 'Ofrecer upgrade a membresía premium'
      }
    }
  }

  // Métodos auxiliares privados

  private getSegmentDefinitions() {
    return [
      { id: 'vip_champions', name: 'VIP Champions' },
      { id: 'loyal_enthusiasts', name: 'Entusiastas Leales' },
      { id: 'casual_players', name: 'Jugadores Casuales' },
      { id: 'at_risk', name: 'En Riesgo' }
    ]
  }

  private calculateSegmentMetrics(customers: CustomerProfile[]) {
    const totalCustomers = customers.length
    const totalRevenue = customers.reduce((sum, c) => sum + c.financial_profile.lifetime_value, 0)
    const avgBookingValue = customers.reduce((sum, c) => sum + c.booking_behavior.avg_booking_value, 0) / totalCustomers || 0
    const avgSatisfaction = customers.reduce((sum, c) => sum + c.satisfaction_scores.overall_satisfaction, 0) / totalCustomers || 0

    return {
      total_customers: totalCustomers,
      new_customers: Math.floor(totalCustomers * 0.15),
      churned_customers: Math.floor(totalCustomers * 0.05),
      revenue: totalRevenue,
      avg_booking_value: Math.round(avgBookingValue),
      booking_frequency: 2.3,
      satisfaction_score: Math.round(avgSatisfaction * 10) / 10,
      retention_rate: 0.92,
      campaign_response_rate: 0.34
    }
  }

  private calculateSegmentTrends(customers: CustomerProfile[]) {
    return {
      revenue_growth: Math.random() * 0.3 - 0.1, // -10% a +20%
      customer_growth: Math.random() * 0.25,     // 0% a +25%
      satisfaction_trend: Math.random() * 0.2 - 0.1, // -10% a +10%
      retention_trend: Math.random() * 0.15     // 0% a +15%
    }
  }

  private generateSegmentInsights(segmentId: string, metrics: any, trends: any): string[] {
    const insights = {
      'vip_champions': [
        'Los clientes VIP muestran la mayor lealtad y valor de por vida',
        'Responden excepcionalmente bien a ofertas exclusivas y experiencias premium',
        'Son los principales generadores de referidos de alta calidad'
      ],
      'loyal_enthusiasts': [
        'Segmento con mayor potencial de crecimiento hacia VIP',
        'Alta engagement con programas de lealtad y puntos',
        'Sensibles a ofertas de temporada y experiencias grupales'
      ],
      'casual_players': [
        'Altamente sensibles al precio y ofertas promocionales',
        'Prefieren reservas de último minuto y flexibilidad',
        'Oportunidad de conversión con paquetes familiares'
      ],
      'at_risk': [
        'Requieren intervención inmediata para prevenir churn',
        'Responden mejor a contacto personal y ofertas significativas',
        'Necesitan reactivación de engagement antes de ofertas comerciales'
      ]
    }

    return insights[segmentId] || ['Análisis en progreso']
  }

  private generateSegmentRecommendations(segmentId: string, metrics: any): string[] {
    const recommendations: { [key: string]: string[] } = {
      'vip_champions': [
        'Implementar programa de concierge personalizado',
        'Crear eventos exclusivos y acceso anticipado',
        'Desarrollar ofertas de experiencias premium únicas'
      ],
      'loyal_enthusiasts': [
        'Lanzar programa de upgrade a VIP con beneficios claros',
        'Aumentar frecuencia de comunicación con contenido valioso',
        'Ofrecer descuentos por referidos exitosos'
      ],
      'casual_players': [
        'Crear paquetes de múltiples rondas con descuento',
        'Implementar ofertas de último minuto via push notifications',
        'Desarrollar programa de introducción al golf para familias'
      ],
      'at_risk': [
        'Activar campaña de retención inmediata con descuento 40%+',
        'Asignar representante de servicio al cliente dedicado',
        'Realizar encuesta de satisfacción y seguimiento personal'
      ]
    }

    return recommendations[segmentId] || ['Recomendaciones en desarrollo']
  }

  private calculateDemographicScore(data: Partial<CustomerProfile>): number {
    let score = 50 // Base score

    // Ubicación (mercados objetivo)
    if (data.personal_info?.location.country === 'México') score += 20
    if (data.personal_info?.location.country === 'Estados Unidos') score += 15

    // Edad (golfistas típicos 25-65)
    const age = data.personal_info?.date_of_birth ? 
      new Date().getFullYear() - new Date(data.personal_info.date_of_birth).getFullYear() : 40
    if (age >= 30 && age <= 60) score += 15
    else if (age >= 25 && age <= 70) score += 10

    return Math.min(score, 100)
  }

  private calculateBehavioralScore(data: Partial<CustomerProfile>): number {
    let score = 30

    const bookings = data.booking_behavior?.total_bookings || 0
    const avgValue = data.booking_behavior?.avg_booking_value || 0
    const frequency = data.booking_behavior?.booking_frequency

    // Historial de reservas
    if (bookings > 10) score += 25
    else if (bookings > 5) score += 15
    else if (bookings > 0) score += 10

    // Valor promedio
    if (avgValue > 200) score += 20
    else if (avgValue > 150) score += 15
    else if (avgValue > 100) score += 10

    // Frecuencia
    if (frequency === 'weekly') score += 15
    else if (frequency === 'bi_weekly') score += 12
    else if (frequency === 'monthly') score += 8

    return Math.min(score, 100)
  }

  private calculateEngagementScore(data: Partial<CustomerProfile>): number {
    let score = 20

    const emailOpen = data.engagement_metrics?.email_open_rate || 0
    const appUsage = data.engagement_metrics?.app_usage_frequency || 0
    const reviews = data.engagement_metrics?.review_participation || 0

    score += emailOpen * 30
    score += appUsage * 25
    score += reviews * 25

    return Math.min(score, 100)
  }

  private calculateIntentScore(data: Partial<CustomerProfile>): number {
    let score = 40

    const advanceBooking = data.booking_behavior?.advance_booking_days || 0
    const cancellationRate = data.booking_behavior?.cancellation_rate || 0

    // Planificación anticipada indica mayor intención
    if (advanceBooking > 14) score += 20
    else if (advanceBooking > 7) score += 15
    else if (advanceBooking > 3) score += 10

    // Baja tasa de cancelación indica compromiso
    if (cancellationRate < 0.05) score += 20
    else if (cancellationRate < 0.1) score += 15
    else if (cancellationRate < 0.2) score += 10

    return Math.min(score, 100)
  }

  private calculateFitScore(data: Partial<CustomerProfile>): number {
    let score = 50

    const satisfaction = data.satisfaction_scores?.overall_satisfaction || 0
    const ltv = data.financial_profile?.lifetime_value || 0

    // Satisfacción alta indica buen fit
    if (satisfaction > 4.5) score += 25
    else if (satisfaction > 4.0) score += 20
    else if (satisfaction > 3.5) score += 15

    // LTV alto indica valor para el negocio
    if (ltv > 1000) score += 25
    else if (ltv > 500) score += 20
    else if (ltv > 200) score += 15

    return Math.min(score, 100)
  }

  private calculateConversionProbability(score: number): number {
    // Conversión basada en score
    if (score >= 80) return 0.85
    if (score >= 70) return 0.70
    if (score >= 60) return 0.55
    if (score >= 50) return 0.40
    if (score >= 40) return 0.25
    return 0.15
  }

  private estimateLifetimeValue(data: Partial<CustomerProfile>, score: number): number {
    const baseValue = data.financial_profile?.lifetime_value || 300
    const multiplier = score / 100
    return Math.round(baseValue * (1 + multiplier))
  }

  private determinePriorityLevel(score: number): 'hot' | 'warm' | 'cold' | 'nurture' {
    if (score >= 80) return 'hot'
    if (score >= 65) return 'warm'
    if (score >= 45) return 'cold'
    return 'nurture'
  }

  private generateLeadActions(score: number, data: Partial<CustomerProfile>): string[] {
    if (score >= 80) {
      return [
        'Contacto inmediato por teléfono',
        'Ofrecer demo personalizada',
        'Proponer membresía premium',
        'Asignar account manager dedicado'
      ]
    } else if (score >= 65) {
      return [
        'Enviar email personalizado',
        'Ofrecer descuento especial',
        'Invitar a evento de golf',
        'Seguimiento en 3 días'
      ]
    } else if (score >= 45) {
      return [
        'Agregar a secuencia de nurturing',
        'Enviar contenido educativo',
        'Ofrecer ronda de prueba',
        'Seguimiento en 1 semana'
      ]
    } else {
      return [
        'Agregar a newsletter',
        'Enviar contenido de valor',
        'Monitorear engagement',
        'Reevaluar en 1 mes'
      ]
    }
  }

    private calculateFollowUpDate(priority: string): string {
    const now = new Date()
    const days: { [key: string]: number } = {
      'hot': 1,
      'warm': 3,
      'cold': 7,
      'nurture': 30
    }
    
    now.setDate(now.getDate() + days[priority])
    return now.toISOString().split('T')[0]
  }

  private assignSalesRep(priority: string): string {
    const reps: { [key: string]: string } = {
      'hot': 'María González (Senior)',
      'warm': 'Carlos Ruiz (Especialista)',
      'cold': 'Ana López (Junior)',
      'nurture': 'Sistema Automatizado'
    }
    
    return reps[priority]
  }

  // Análisis de rendimiento de campañas
  public analyzeCampaignPerformance(campaignId: string): any {
    return {
      campaign_id: campaignId,
      performance_metrics: {
        sent: 1250,
        delivered: 1198,
        opened: 838,
        clicked: 294,
        converted: 73,
        revenue_generated: 12450
      },
      rates: {
        delivery_rate: 0.958,
        open_rate: 0.699,
        click_rate: 0.351,
        conversion_rate: 0.248,
        roi: 4.2
      },
      segment_breakdown: {
        'vip_champions': { sent: 125, converted: 31, roi: 8.5 },
        'loyal_enthusiasts': { sent: 450, converted: 27, roi: 3.8 },
        'casual_players': { sent: 500, converted: 12, roi: 2.1 },
        'at_risk': { sent: 175, converted: 3, roi: 1.2 }
      },
      optimization_suggestions: [
        'Aumentar frecuencia para segmento VIP',
        'Mejorar subject lines para jugadores casuales',
        'Personalizar ofertas por historial de compra',
        'Implementar A/B testing en call-to-action'
      ]
    }
  }
}

// Instancia global del sistema CRM
export const crmSystem = new CRMSystem()

export default crmSystem

