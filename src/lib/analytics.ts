// Sistema de Analytics Avanzado para TeeReserve Golf
// Integración con Google Analytics 4 y sistema de eventos personalizado

export interface AnalyticsEvent {
  name: string
  parameters?: Record<string, any>
  user_id?: string
  session_id?: string
  timestamp?: number
}

export interface UserProperties {
  user_id: string
  email?: string
  preferred_language: string
  registration_date: string
  total_bookings: number
  total_spent: number
  favorite_course?: string
  skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'professional'
  location?: string
  age_group?: string
  customer_segment?: 'new' | 'active' | 'vip' | 'inactive'
}

export interface ConversionFunnel {
  step: string
  users: number
  conversion_rate: number
  drop_off_rate: number
  avg_time_spent: number
}

export interface BusinessMetrics {
  total_revenue: number
  total_bookings: number
  avg_booking_value: number
  customer_lifetime_value: number
  monthly_recurring_revenue: number
  churn_rate: number
  retention_rate: number
  net_promoter_score: number
}

class AdvancedAnalytics {
  private isInitialized = false
  private sessionId: string
  private userId?: string
  private events: AnalyticsEvent[] = []

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeAnalytics()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeAnalytics() {
    if (typeof window === 'undefined') return

    // Configuración de Google Analytics 4
    this.initializeGA4()
    
    // Configuración de eventos personalizados
    this.setupCustomEvents()
    
    this.isInitialized = true
  }

  private initializeGA4() {
    // Simulación de configuración GA4 (en producción se usaría el ID real)
    const GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX'
    
    // Cargar gtag script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`
    document.head.appendChild(script)

    // Configurar gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    
    gtag('js', new Date())
    gtag('config', GA4_MEASUREMENT_ID, {
      page_title: 'TeeReserve Golf',
      page_location: window.location.href,
      custom_map: {
        custom_parameter_1: 'golf_course_id',
        custom_parameter_2: 'booking_value',
        custom_parameter_3: 'user_segment'
      }
    })

    // Configurar eventos de comercio electrónico mejorado
    gtag('config', GA4_MEASUREMENT_ID, {
      custom_map: {
        'custom_parameter_1': 'golf_course_id',
        'custom_parameter_2': 'booking_value'
      }
    })
  }

  private setupCustomEvents() {
    // Tracking automático de interacciones
    this.trackPageViews()
    this.trackUserEngagement()
    this.trackScrollDepth()
    this.trackTimeOnPage()
  }

  // Métodos públicos para tracking de eventos

  public setUserId(userId: string) {
    this.userId = userId
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-XXXXXXXXXX', {
        user_id: userId
      })
    }
  }

  public setUserProperties(properties: Partial<UserProperties>) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('set', {
        user_properties: properties
      })
    }
  }

  public trackEvent(event: AnalyticsEvent) {
    const enrichedEvent = {
      ...event,
      session_id: this.sessionId,
      user_id: this.userId,
      timestamp: Date.now(),
      page_url: typeof window !== 'undefined' ? window.location.href : '',
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : ''
    }

    // Almacenar evento localmente
    this.events.push(enrichedEvent)

    // Enviar a Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.name, event.parameters)
    }

    // Enviar a sistema personalizado (simulado)
    this.sendToCustomAnalytics(enrichedEvent)
  }

  // Eventos específicos del negocio de golf

  public trackCourseView(courseId: string, courseName: string) {
    this.trackEvent({
      name: 'course_view',
      parameters: {
        course_id: courseId,
        course_name: courseName,
        event_category: 'engagement',
        event_label: 'course_detail_view'
      }
    })
  }

  public trackBookingStart(courseId: string, coursePrice: number) {
    this.trackEvent({
      name: 'begin_checkout',
      parameters: {
        currency: 'USD',
        value: coursePrice,
        course_id: courseId,
        event_category: 'ecommerce',
        event_label: 'booking_initiated'
      }
    })
  }

  public trackBookingComplete(bookingData: {
    courseId: string
    courseName: string
    price: number
    bookingId: string
    date: string
    time: string
  }) {
    this.trackEvent({
      name: 'purchase',
      parameters: {
        transaction_id: bookingData.bookingId,
        value: bookingData.price,
        currency: 'USD',
        items: [{
          item_id: bookingData.courseId,
          item_name: bookingData.courseName,
          category: 'golf_course',
          quantity: 1,
          price: bookingData.price
        }],
        event_category: 'ecommerce',
        event_label: 'booking_completed'
      }
    })
  }

  public trackSearchQuery(query: string, resultsCount: number) {
    this.trackEvent({
      name: 'search',
      parameters: {
        search_term: query,
        results_count: resultsCount,
        event_category: 'engagement',
        event_label: 'course_search'
      }
    })
  }

  public trackRecommendationClick(courseId: string, recommendationType: string, position: number) {
    this.trackEvent({
      name: 'select_promotion',
      parameters: {
        creative_name: recommendationType,
        creative_slot: position.toString(),
        promotion_id: courseId,
        event_category: 'engagement',
        event_label: 'ai_recommendation_click'
      }
    })
  }

  public trackLanguageChange(fromLanguage: string, toLanguage: string) {
    this.trackEvent({
      name: 'language_change',
      parameters: {
        from_language: fromLanguage,
        to_language: toLanguage,
        event_category: 'user_preference',
        event_label: 'language_switch'
      }
    })
  }

  public trackEmailCampaignClick(campaignId: string, campaignType: string) {
    this.trackEvent({
      name: 'campaign_click',
      parameters: {
        campaign_id: campaignId,
        campaign_type: campaignType,
        source: 'email',
        event_category: 'marketing',
        event_label: 'email_campaign_engagement'
      }
    })
  }

  // Métodos de tracking automático

  private trackPageViews() {
    if (typeof window === 'undefined') return

    // Track initial page view
    this.trackEvent({
      name: 'page_view',
      parameters: {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
        event_category: 'engagement'
      }
    })

    // Track SPA navigation
    let currentPath = window.location.pathname
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname
        this.trackEvent({
          name: 'page_view',
          parameters: {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname,
            event_category: 'engagement'
          }
        })
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })
  }

  private trackUserEngagement() {
    if (typeof window === 'undefined') return

    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      
      // Track CTA button clicks
      if (target.matches('button[class*="btn-premium"], a[class*="btn-premium"]')) {
        this.trackEvent({
          name: 'cta_click',
          parameters: {
            button_text: target.textContent?.trim(),
            button_location: this.getElementPath(target),
            event_category: 'engagement',
            event_label: 'cta_interaction'
          }
        })
      }

      // Track navigation clicks
      if (target.matches('nav a, header a')) {
        this.trackEvent({
          name: 'navigation_click',
          parameters: {
            link_text: target.textContent?.trim(),
            link_url: target.getAttribute('href'),
            event_category: 'navigation',
            event_label: 'menu_interaction'
          }
        })
      }
    })
  }

  private trackScrollDepth() {
    if (typeof window === 'undefined') return

    let maxScroll = 0
    const milestones = [25, 50, 75, 90, 100]
    const triggered = new Set<number>()

    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      )

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent

        milestones.forEach(milestone => {
          if (scrollPercent >= milestone && !triggered.has(milestone)) {
            triggered.add(milestone)
            this.trackEvent({
              name: 'scroll_depth',
              parameters: {
                scroll_depth: milestone,
                page_path: window.location.pathname,
                event_category: 'engagement',
                event_label: `scroll_${milestone}%`
              }
            })
          }
        })
      }
    })
  }

  private trackTimeOnPage() {
    if (typeof window === 'undefined') return

    const startTime = Date.now()
    const intervals = [30, 60, 120, 300] // seconds
    const triggered = new Set<number>()

    const checkTime = () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)
      
      intervals.forEach(interval => {
        if (timeSpent >= interval && !triggered.has(interval)) {
          triggered.add(interval)
          this.trackEvent({
            name: 'time_on_page',
            parameters: {
              time_spent: interval,
              page_path: window.location.pathname,
              event_category: 'engagement',
              event_label: `time_${interval}s`
            }
          })
        }
      })
    }

    setInterval(checkTime, 10000) // Check every 10 seconds

    // Track when user leaves page
    window.addEventListener('beforeunload', () => {
      const totalTime = Math.floor((Date.now() - startTime) / 1000)
      this.trackEvent({
        name: 'page_exit',
        parameters: {
          total_time_spent: totalTime,
          page_path: window.location.pathname,
          event_category: 'engagement',
          event_label: 'page_exit'
        }
      })
    })
  }

  private getElementPath(element: HTMLElement): string {
    const path = []
    let current = element

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase()
      
      if (current.id) {
        selector += `#${current.id}`
      } else if (current.className) {
        selector += `.${current.className.split(' ').join('.')}`
      }
      
      path.unshift(selector)
      current = current.parentElement!
    }

    return path.join(' > ')
  }

  private sendToCustomAnalytics(event: AnalyticsEvent) {
    // En producción, esto enviaría datos a un endpoint personalizado
    console.log('📊 Analytics Event:', event)
    
    // Simular envío a API personalizada
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'teereserve_analytics_events',
        JSON.stringify([
          ...this.getStoredEvents(),
          event
        ].slice(-100)) // Mantener solo los últimos 100 eventos
      )
    }
  }

  private getStoredEvents(): AnalyticsEvent[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem('teereserve_analytics_events')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  // Métodos para obtener métricas

  public getSessionEvents(): AnalyticsEvent[] {
    return this.events
  }

  public getStoredAnalytics(): AnalyticsEvent[] {
    return this.getStoredEvents()
  }

  // Análisis de comportamiento

  public generateUserInsights(userId: string): Promise<any> {
    return new Promise((resolve) => {
      // Simular análisis de datos del usuario
      setTimeout(() => {
        const insights = {
          user_id: userId,
          total_sessions: Math.floor(Math.random() * 50) + 10,
          avg_session_duration: Math.floor(Math.random() * 300) + 120,
          favorite_courses: ['Cabo Real Golf Club', 'Cabo del Sol Golf Club'],
          booking_frequency: 'monthly',
          preferred_time: 'morning',
          spending_pattern: 'premium',
          engagement_score: Math.floor(Math.random() * 40) + 60,
          churn_risk: Math.random() > 0.8 ? 'high' : Math.random() > 0.6 ? 'medium' : 'low',
          recommendations: [
            'Offer early morning tee times',
            'Promote premium courses',
            'Send monthly newsletter'
          ]
        }
        resolve(insights)
      }, 1000)
    })
  }

  public generateBusinessMetrics(): Promise<BusinessMetrics> {
    return new Promise((resolve) => {
      // Simular métricas de negocio
      setTimeout(() => {
        const metrics: BusinessMetrics = {
          total_revenue: 187350,
          total_bookings: 1247,
          avg_booking_value: 150.24,
          customer_lifetime_value: 450.75,
          monthly_recurring_revenue: 23500,
          churn_rate: 0.08,
          retention_rate: 0.92,
          net_promoter_score: 8.7
        }
        resolve(metrics)
      }, 800)
    })
  }

  public generateConversionFunnel(): Promise<ConversionFunnel[]> {
    return new Promise((resolve) => {
      // Simular datos del funnel de conversión
      setTimeout(() => {
        const funnel: ConversionFunnel[] = [
          {
            step: 'Landing Page Visit',
            users: 10000,
            conversion_rate: 100,
            drop_off_rate: 0,
            avg_time_spent: 45
          },
          {
            step: 'Course Browse',
            users: 6500,
            conversion_rate: 65,
            drop_off_rate: 35,
            avg_time_spent: 120
          },
          {
            step: 'Course Detail View',
            users: 3250,
            conversion_rate: 32.5,
            drop_off_rate: 50,
            avg_time_spent: 180
          },
          {
            step: 'Booking Started',
            users: 1625,
            conversion_rate: 16.25,
            drop_off_rate: 50,
            avg_time_spent: 240
          },
          {
            step: 'Payment Process',
            users: 1300,
            conversion_rate: 13,
            drop_off_rate: 20,
            avg_time_spent: 300
          },
          {
            step: 'Booking Completed',
            users: 1170,
            conversion_rate: 11.7,
            drop_off_rate: 10,
            avg_time_spent: 360
          }
        ]
        resolve(funnel)
      }, 600)
    })
  }
}

// Instancia global
export const analytics = new AdvancedAnalytics()

// Declaración de tipos para window.gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export default analytics

