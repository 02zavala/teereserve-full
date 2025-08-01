// Sistema de Reportes Automáticos para TeeReserve Golf
// Reportes programados, alertas por thresholds y notificaciones push

export interface ReportTemplate {
  template_id: string
  name: string
  description: string
  report_type: 'executive' | 'financial' | 'operational' | 'marketing' | 'customer'
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'on_demand'
  schedule: {
    time: string // HH:MM format
    day_of_week?: number // 0-6 (Sunday-Saturday)
    day_of_month?: number // 1-31
    timezone: string
  }
  recipients: Array<{
    email: string
    name: string
    role: string
    delivery_method: 'email' | 'dashboard' | 'both'
  }>
  data_sources: string[]
  metrics: Array<{
    metric_name: string
    display_name: string
    format: 'number' | 'currency' | 'percentage' | 'text'
    aggregation: 'sum' | 'avg' | 'count' | 'max' | 'min'
    comparison_period?: 'previous_period' | 'same_period_last_year' | 'none'
  }>
  visualizations: Array<{
    chart_type: 'line' | 'bar' | 'pie' | 'table' | 'kpi_card'
    title: string
    data_source: string
    config: Record<string, any>
  }>
  filters: Record<string, any>
  export_formats: Array<'pdf' | 'excel' | 'csv' | 'json'>
  is_active: boolean
  created_at: string
  last_generated: string
  next_generation: string
}

export interface AlertRule {
  rule_id: string
  name: string
  description: string
  metric_name: string
  condition: {
    operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'between' | 'outside_range'
    threshold_value: number
    threshold_value_2?: number // For between/outside_range
    comparison_period: 'current' | 'previous_period' | 'same_period_last_year'
  }
  severity: 'low' | 'medium' | 'high' | 'critical'
  notification_channels: Array<{
    type: 'email' | 'sms' | 'push' | 'slack' | 'webhook'
    target: string
    template: string
  }>
  frequency_limit: {
    max_alerts_per_hour: number
    max_alerts_per_day: number
    cooldown_minutes: number
  }
  business_hours_only: boolean
  is_active: boolean
  created_at: string
  last_triggered: string
  trigger_count: number
}

export interface NotificationTemplate {
  template_id: string
  name: string
  type: 'alert' | 'report' | 'milestone' | 'reminder'
  channel: 'email' | 'push' | 'sms' | 'in_app'
  subject_template: string
  body_template: string
  variables: string[]
  styling: {
    priority_color: string
    icon: string
    sound?: string
  }
  personalization: {
    use_recipient_name: boolean
    use_recipient_role: boolean
    use_company_branding: boolean
  }
}

export interface GeneratedReport {
  report_id: string
  template_id: string
  generated_at: string
  period_start: string
  period_end: string
  status: 'generating' | 'completed' | 'failed' | 'cancelled'
  file_paths: Record<string, string> // format -> file_path
  metrics_summary: Record<string, any>
  recipients_sent: string[]
  generation_time_ms: number
  file_size_bytes: number
  error_message?: string
}

class AutomatedReportsSystem {
  private version = '2.1.0'
  private lastUpdate = '2024-07-19'

  // Plantillas de reportes predefinidas
  public getReportTemplates(): ReportTemplate[] {
    return [
      {
        template_id: 'executive_weekly',
        name: 'Reporte Ejecutivo Semanal',
        description: 'Resumen ejecutivo con métricas clave de negocio',
        report_type: 'executive',
        frequency: 'weekly',
        schedule: {
          time: '08:00',
          day_of_week: 1, // Monday
          timezone: 'America/Mexico_City'
        },
        recipients: [
          { email: 'ceo@teereserve.golf', name: 'CEO', role: 'executive', delivery_method: 'both' },
          { email: 'cmo@teereserve.golf', name: 'CMO', role: 'marketing', delivery_method: 'email' },
          { email: 'cfo@teereserve.golf', name: 'CFO', role: 'finance', delivery_method: 'both' }
        ],
        data_sources: ['bookings', 'revenue', 'customers', 'marketing'],
        metrics: [
          { metric_name: 'total_revenue', display_name: 'Ingresos Totales', format: 'currency', aggregation: 'sum', comparison_period: 'previous_period' },
          { metric_name: 'new_bookings', display_name: 'Nuevas Reservas', format: 'number', aggregation: 'count', comparison_period: 'previous_period' },
          { metric_name: 'customer_acquisition', display_name: 'Nuevos Clientes', format: 'number', aggregation: 'count', comparison_period: 'previous_period' },
          { metric_name: 'avg_booking_value', display_name: 'Valor Promedio de Reserva', format: 'currency', aggregation: 'avg', comparison_period: 'previous_period' },
          { metric_name: 'customer_satisfaction', display_name: 'Satisfacción del Cliente', format: 'number', aggregation: 'avg', comparison_period: 'previous_period' }
        ],
        visualizations: [
          { chart_type: 'kpi_card', title: 'Métricas Clave', data_source: 'summary', config: {} },
          { chart_type: 'line', title: 'Tendencia de Ingresos', data_source: 'revenue_trend', config: { period: '7_days' } },
          { chart_type: 'bar', title: 'Reservas por Campo', data_source: 'bookings_by_course', config: { top_n: 10 } },
          { chart_type: 'pie', title: 'Distribución de Clientes', data_source: 'customer_segments', config: {} }
        ],
        filters: { date_range: 'last_7_days' },
        export_formats: ['pdf', 'excel'],
        is_active: true,
        created_at: '2024-07-01T00:00:00Z',
        last_generated: '2024-07-15T08:00:00Z',
        next_generation: '2024-07-22T08:00:00Z'
      },
      {
        template_id: 'financial_monthly',
        name: 'Reporte Financiero Mensual',
        description: 'Análisis financiero detallado con P&L y métricas de rentabilidad',
        report_type: 'financial',
        frequency: 'monthly',
        schedule: {
          time: '09:00',
          day_of_month: 1,
          timezone: 'America/Mexico_City'
        },
        recipients: [
          { email: 'cfo@teereserve.golf', name: 'CFO', role: 'finance', delivery_method: 'both' },
          { email: 'accounting@teereserve.golf', name: 'Contabilidad', role: 'accounting', delivery_method: 'email' }
        ],
        data_sources: ['revenue', 'expenses', 'bookings', 'refunds'],
        metrics: [
          { metric_name: 'gross_revenue', display_name: 'Ingresos Brutos', format: 'currency', aggregation: 'sum', comparison_period: 'previous_period' },
          { metric_name: 'net_revenue', display_name: 'Ingresos Netos', format: 'currency', aggregation: 'sum', comparison_period: 'previous_period' },
          { metric_name: 'operating_expenses', display_name: 'Gastos Operativos', format: 'currency', aggregation: 'sum', comparison_period: 'previous_period' },
          { metric_name: 'profit_margin', display_name: 'Margen de Ganancia', format: 'percentage', aggregation: 'avg', comparison_period: 'previous_period' },
          { metric_name: 'customer_ltv', display_name: 'LTV Promedio', format: 'currency', aggregation: 'avg', comparison_period: 'previous_period' }
        ],
        visualizations: [
          { chart_type: 'kpi_card', title: 'Métricas Financieras', data_source: 'financial_summary', config: {} },
          { chart_type: 'line', title: 'Tendencia de Ingresos vs Gastos', data_source: 'revenue_expenses_trend', config: { period: '30_days' } },
          { chart_type: 'bar', title: 'Ingresos por Campo', data_source: 'revenue_by_course', config: {} },
          { chart_type: 'table', title: 'Detalle P&L', data_source: 'profit_loss_detail', config: {} }
        ],
        filters: { date_range: 'last_30_days' },
        export_formats: ['pdf', 'excel', 'csv'],
        is_active: true,
        created_at: '2024-07-01T00:00:00Z',
        last_generated: '2024-07-01T09:00:00Z',
        next_generation: '2024-08-01T09:00:00Z'
      },
      {
        template_id: 'marketing_weekly',
        name: 'Reporte de Marketing Semanal',
        description: 'Análisis de campañas, conversiones y ROI de marketing',
        report_type: 'marketing',
        frequency: 'weekly',
        schedule: {
          time: '10:00',
          day_of_week: 2, // Tuesday
          timezone: 'America/Mexico_City'
        },
        recipients: [
          { email: 'cmo@teereserve.golf', name: 'CMO', role: 'marketing', delivery_method: 'both' },
          { email: 'marketing@teereserve.golf', name: 'Marketing Team', role: 'marketing', delivery_method: 'email' }
        ],
        data_sources: ['campaigns', 'conversions', 'website_analytics', 'social_media'],
        metrics: [
          { metric_name: 'campaign_roi', display_name: 'ROI de Campañas', format: 'percentage', aggregation: 'avg', comparison_period: 'previous_period' },
          { metric_name: 'conversion_rate', display_name: 'Tasa de Conversión', format: 'percentage', aggregation: 'avg', comparison_period: 'previous_period' },
          { metric_name: 'cost_per_acquisition', display_name: 'Costo por Adquisición', format: 'currency', aggregation: 'avg', comparison_period: 'previous_period' },
          { metric_name: 'email_open_rate', display_name: 'Tasa de Apertura Email', format: 'percentage', aggregation: 'avg', comparison_period: 'previous_period' },
          { metric_name: 'social_engagement', display_name: 'Engagement Social', format: 'number', aggregation: 'sum', comparison_period: 'previous_period' }
        ],
        visualizations: [
          { chart_type: 'kpi_card', title: 'Métricas de Marketing', data_source: 'marketing_summary', config: {} },
          { chart_type: 'line', title: 'Tendencia de Conversiones', data_source: 'conversion_trend', config: { period: '7_days' } },
          { chart_type: 'bar', title: 'ROI por Canal', data_source: 'roi_by_channel', config: {} },
          { chart_type: 'pie', title: 'Distribución de Tráfico', data_source: 'traffic_sources', config: {} }
        ],
        filters: { date_range: 'last_7_days' },
        export_formats: ['pdf', 'excel'],
        is_active: true,
        created_at: '2024-07-01T00:00:00Z',
        last_generated: '2024-07-16T10:00:00Z',
        next_generation: '2024-07-23T10:00:00Z'
      },
      {
        template_id: 'operational_daily',
        name: 'Reporte Operacional Diario',
        description: 'Métricas operativas diarias para gestión del día a día',
        report_type: 'operational',
        frequency: 'daily',
        schedule: {
          time: '07:00',
          timezone: 'America/Mexico_City'
        },
        recipients: [
          { email: 'operations@teereserve.golf', name: 'Operations Manager', role: 'operations', delivery_method: 'both' },
          { email: 'support@teereserve.golf', name: 'Support Team', role: 'support', delivery_method: 'dashboard' }
        ],
        data_sources: ['bookings', 'cancellations', 'customer_service', 'system_health'],
        metrics: [
          { metric_name: 'daily_bookings', display_name: 'Reservas del Día', format: 'number', aggregation: 'count', comparison_period: 'previous_period' },
          { metric_name: 'cancellation_rate', display_name: 'Tasa de Cancelación', format: 'percentage', aggregation: 'avg', comparison_period: 'previous_period' },
          { metric_name: 'customer_service_tickets', display_name: 'Tickets de Soporte', format: 'number', aggregation: 'count', comparison_period: 'previous_period' },
          { metric_name: 'system_uptime', display_name: 'Uptime del Sistema', format: 'percentage', aggregation: 'avg', comparison_period: 'none' },
          { metric_name: 'avg_response_time', display_name: 'Tiempo de Respuesta Promedio', format: 'number', aggregation: 'avg', comparison_period: 'previous_period' }
        ],
        visualizations: [
          { chart_type: 'kpi_card', title: 'Métricas Operacionales', data_source: 'operational_summary', config: {} },
          { chart_type: 'line', title: 'Reservas por Hora', data_source: 'hourly_bookings', config: { period: '24_hours' } },
          { chart_type: 'bar', title: 'Tickets por Categoría', data_source: 'tickets_by_category', config: {} }
        ],
        filters: { date_range: 'today' },
        export_formats: ['pdf'],
        is_active: true,
        created_at: '2024-07-01T00:00:00Z',
        last_generated: '2024-07-19T07:00:00Z',
        next_generation: '2024-07-20T07:00:00Z'
      }
    ]
  }

  // Reglas de alertas predefinidas
  public getAlertRules(): AlertRule[] {
    return [
      {
        rule_id: 'revenue_drop_critical',
        name: 'Caída Crítica de Ingresos',
        description: 'Alerta cuando los ingresos diarios caen más del 30%',
        metric_name: 'daily_revenue',
        condition: {
          operator: 'less_than',
          threshold_value: 0.7, // 70% of previous period
          comparison_period: 'previous_period'
        },
        severity: 'critical',
        notification_channels: [
          { type: 'email', target: 'ceo@teereserve.golf', template: 'critical_revenue_drop' },
          { type: 'email', target: 'cfo@teereserve.golf', template: 'critical_revenue_drop' },
          { type: 'push', target: 'executives', template: 'critical_alert' },
          { type: 'sms', target: '+52-664-123-4567', template: 'critical_sms' }
        ],
        frequency_limit: {
          max_alerts_per_hour: 2,
          max_alerts_per_day: 6,
          cooldown_minutes: 30
        },
        business_hours_only: false,
        is_active: true,
        created_at: '2024-07-01T00:00:00Z',
        last_triggered: '2024-07-10T14:30:00Z',
        trigger_count: 3
      },
      {
        rule_id: 'booking_surge_high',
        name: 'Pico Alto de Reservas',
        description: 'Alerta cuando las reservas por hora superan la capacidad normal',
        metric_name: 'hourly_bookings',
        condition: {
          operator: 'greater_than',
          threshold_value: 50, // 50 bookings per hour
          comparison_period: 'current'
        },
        severity: 'high',
        notification_channels: [
          { type: 'email', target: 'operations@teereserve.golf', template: 'booking_surge' },
          { type: 'push', target: 'operations_team', template: 'high_alert' }
        ],
        frequency_limit: {
          max_alerts_per_hour: 3,
          max_alerts_per_day: 12,
          cooldown_minutes: 15
        },
        business_hours_only: true,
        is_active: true,
        created_at: '2024-07-01T00:00:00Z',
        last_triggered: '2024-07-18T11:45:00Z',
        trigger_count: 15
      },
      {
        rule_id: 'customer_satisfaction_low',
        name: 'Satisfacción Baja del Cliente',
        description: 'Alerta cuando la satisfacción promedio cae por debajo de 4.0',
        metric_name: 'avg_customer_satisfaction',
        condition: {
          operator: 'less_than',
          threshold_value: 4.0,
          comparison_period: 'current'
        },
        severity: 'medium',
        notification_channels: [
          { type: 'email', target: 'customer_success@teereserve.golf', template: 'satisfaction_drop' },
          { type: 'email', target: 'cmo@teereserve.golf', template: 'satisfaction_drop' }
        ],
        frequency_limit: {
          max_alerts_per_hour: 1,
          max_alerts_per_day: 3,
          cooldown_minutes: 60
        },
        business_hours_only: true,
        is_active: true,
        created_at: '2024-07-01T00:00:00Z',
        last_triggered: '2024-07-12T16:20:00Z',
        trigger_count: 7
      },
      {
        rule_id: 'system_downtime_critical',
        name: 'Caída Crítica del Sistema',
        description: 'Alerta inmediata cuando el uptime cae por debajo del 95%',
        metric_name: 'system_uptime',
        condition: {
          operator: 'less_than',
          threshold_value: 0.95, // 95%
          comparison_period: 'current'
        },
        severity: 'critical',
        notification_channels: [
          { type: 'email', target: 'tech@teereserve.golf', template: 'system_downtime' },
          { type: 'sms', target: '+52-664-123-4567', template: 'critical_sms' },
          { type: 'push', target: 'tech_team', template: 'critical_alert' },
          { type: 'slack', target: '#tech-alerts', template: 'system_alert' }
        ],
        frequency_limit: {
          max_alerts_per_hour: 10,
          max_alerts_per_day: 50,
          cooldown_minutes: 5
        },
        business_hours_only: false,
        is_active: true,
        created_at: '2024-07-01T00:00:00Z',
        last_triggered: '2024-07-05T03:15:00Z',
        trigger_count: 2
      },
      {
        rule_id: 'conversion_rate_drop',
        name: 'Caída en Tasa de Conversión',
        description: 'Alerta cuando la tasa de conversión cae más del 20%',
        metric_name: 'conversion_rate',
        condition: {
          operator: 'less_than',
          threshold_value: 0.8, // 80% of previous period
          comparison_period: 'previous_period'
        },
        severity: 'medium',
        notification_channels: [
          { type: 'email', target: 'marketing@teereserve.golf', template: 'conversion_drop' },
          { type: 'push', target: 'marketing_team', template: 'medium_alert' }
        ],
        frequency_limit: {
          max_alerts_per_hour: 2,
          max_alerts_per_day: 6,
          cooldown_minutes: 30
        },
        business_hours_only: true,
        is_active: true,
        created_at: '2024-07-01T00:00:00Z',
        last_triggered: '2024-07-14T10:30:00Z',
        trigger_count: 5
      }
    ]
  }

  // Plantillas de notificaciones
  public getNotificationTemplates(): NotificationTemplate[] {
    return [
      {
        template_id: 'critical_revenue_drop',
        name: 'Caída Crítica de Ingresos',
        type: 'alert',
        channel: 'email',
        subject_template: '🚨 ALERTA CRÍTICA: Caída significativa en ingresos - TeeReserve Golf',
        body_template: `
          <h2 style="color: #dc2626;">🚨 Alerta Crítica: Caída en Ingresos</h2>
          <p>Se ha detectado una caída significativa en los ingresos diarios.</p>
          
          <div style="background: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
            <h3>Detalles de la Alerta:</h3>
            <ul>
              <li><strong>Métrica:</strong> {{metric_name}}</li>
              <li><strong>Valor Actual:</strong> {{current_value}}</li>
              <li><strong>Valor Anterior:</strong> {{previous_value}}</li>
              <li><strong>Cambio:</strong> {{percentage_change}}%</li>
              <li><strong>Fecha/Hora:</strong> {{timestamp}}</li>
            </ul>
          </div>
          
          <h3>Acciones Recomendadas:</h3>
          <ul>
            <li>Revisar campañas de marketing activas</li>
            <li>Verificar funcionamiento del sistema de reservas</li>
            <li>Analizar competencia y precios</li>
            <li>Contactar a clientes VIP para feedback</li>
          </ul>
          
          <p><a href="{{dashboard_url}}" style="background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Dashboard Ejecutivo</a></p>
        `,
        variables: ['metric_name', 'current_value', 'previous_value', 'percentage_change', 'timestamp', 'dashboard_url'],
        styling: {
          priority_color: '#dc2626',
          icon: '🚨',
          sound: 'critical'
        },
        personalization: {
          use_recipient_name: true,
          use_recipient_role: true,
          use_company_branding: true
        }
      },
      {
        template_id: 'booking_surge',
        name: 'Pico de Reservas',
        type: 'alert',
        channel: 'email',
        subject_template: '📈 Pico Alto de Reservas Detectado - TeeReserve Golf',
        body_template: `
          <h2 style="color: #ea580c;">📈 Pico Alto de Reservas</h2>
          <p>Se ha detectado un volumen inusualmente alto de reservas.</p>
          
          <div style="background: #fff7ed; padding: 15px; border-left: 4px solid #ea580c; margin: 20px 0;">
            <h3>Detalles del Pico:</h3>
            <ul>
              <li><strong>Reservas por Hora:</strong> {{current_value}}</li>
              <li><strong>Umbral Normal:</strong> {{threshold_value}}</li>
              <li><strong>Exceso:</strong> {{excess_percentage}}%</li>
              <li><strong>Hora:</strong> {{timestamp}}</li>
            </ul>
          </div>
          
          <h3>Acciones Sugeridas:</h3>
          <ul>
            <li>Verificar capacidad de los campos</li>
            <li>Preparar personal adicional si es necesario</li>
            <li>Monitorear sistema de pagos</li>
            <li>Considerar ofertas de horarios alternativos</li>
          </ul>
        `,
        variables: ['current_value', 'threshold_value', 'excess_percentage', 'timestamp'],
        styling: {
          priority_color: '#ea580c',
          icon: '📈',
          sound: 'high'
        },
        personalization: {
          use_recipient_name: true,
          use_recipient_role: true,
          use_company_branding: true
        }
      },
      {
        template_id: 'critical_sms',
        name: 'SMS Crítico',
        type: 'alert',
        channel: 'sms',
        subject_template: '',
        body_template: '🚨 ALERTA CRÍTICA TeeReserve: {{metric_name}} - {{current_value}}. Revisar dashboard inmediatamente. {{timestamp}}',
        variables: ['metric_name', 'current_value', 'timestamp'],
        styling: {
          priority_color: '#dc2626',
          icon: '🚨'
        },
        personalization: {
          use_recipient_name: false,
          use_recipient_role: false,
          use_company_branding: false
        }
      },
      {
        template_id: 'weekly_executive_report',
        name: 'Reporte Ejecutivo Semanal',
        type: 'report',
        channel: 'email',
        subject_template: '📊 Reporte Ejecutivo Semanal - TeeReserve Golf ({{period_start}} - {{period_end}})',
        body_template: `
          <h1 style="color: #1f2937;">📊 Reporte Ejecutivo Semanal</h1>
          <p style="color: #6b7280;">Período: {{period_start}} - {{period_end}}</p>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1f2937;">🎯 Métricas Clave</h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
              <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
                <h3 style="margin: 0; color: #10b981;">Ingresos Totales</h3>
                <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">{{total_revenue}}</p>
                <p style="color: #6b7280; margin: 0;">{{revenue_change}}% vs semana anterior</p>
              </div>
              <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
                <h3 style="margin: 0; color: #3b82f6;">Nuevas Reservas</h3>
                <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">{{new_bookings}}</p>
                <p style="color: #6b7280; margin: 0;">{{bookings_change}}% vs semana anterior</p>
              </div>
            </div>
          </div>
          
          <h2>📈 Highlights de la Semana</h2>
          <ul>
            {{#each highlights}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
          
          <h2>⚠️ Áreas de Atención</h2>
          <ul>
            {{#each attention_areas}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
          
          <p><a href="{{report_url}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Ver Reporte Completo</a></p>
        `,
        variables: ['period_start', 'period_end', 'total_revenue', 'revenue_change', 'new_bookings', 'bookings_change', 'highlights', 'attention_areas', 'report_url'],
        styling: {
          priority_color: '#3b82f6',
          icon: '📊'
        },
        personalization: {
          use_recipient_name: true,
          use_recipient_role: true,
          use_company_branding: true
        }
      }
    ]
  }

  // Generar reporte automático
  public async generateReport(templateId: string): Promise<GeneratedReport> {
    const template = this.getReportTemplates().find(t => t.template_id === templateId)
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    const startTime = Date.now()
    const reportId = `report_${templateId}_${Date.now()}`
    
    // Simular generación de reporte
    const mockData = this.generateMockReportData(template)
    
    const report: GeneratedReport = {
      report_id: reportId,
      template_id: templateId,
      generated_at: new Date().toISOString(),
      period_start: this.calculatePeriodStart(template.frequency),
      period_end: new Date().toISOString(),
      status: 'completed',
      file_paths: {
        'pdf': `/reports/${reportId}.pdf`,
        'excel': `/reports/${reportId}.xlsx`
      },
      metrics_summary: mockData,
      recipients_sent: template.recipients.map(r => r.email),
      generation_time_ms: Date.now() - startTime,
      file_size_bytes: Math.floor(Math.random() * 1000000) + 500000, // 0.5-1.5MB
      error_message: undefined
    }

    return report
  }

  // Evaluar reglas de alertas
  public evaluateAlertRules(currentMetrics: Record<string, number>): Array<{rule: AlertRule, triggered: boolean, details: any}> {
    const rules = this.getAlertRules()
    const results = []

    for (const rule of rules) {
      if (!rule.is_active) continue

      const currentValue = currentMetrics[rule.metric_name]
      if (currentValue === undefined) continue

      const triggered = this.evaluateCondition(rule.condition, currentValue)
      
      results.push({
        rule,
        triggered,
        details: {
          current_value: currentValue,
          threshold: rule.condition.threshold_value,
          severity: rule.severity,
          last_triggered: rule.last_triggered
        }
      })
    }

    return results
  }

  // Enviar notificación
  public async sendNotification(templateId: string, variables: Record<string, any>, recipients: string[]): Promise<boolean> {
    const template = this.getNotificationTemplates().find(t => t.template_id === templateId)
    if (!template) {
      throw new Error(`Notification template not found: ${templateId}`)
    }

    // Simular envío de notificación
    console.log(`Sending ${template.channel} notification: ${template.name}`)
    console.log(`Recipients: ${recipients.join(', ')}`)
    console.log(`Variables:`, variables)

    // En implementación real, aquí se integraría con servicios como:
    // - SendGrid/Resend para email
    // - Twilio para SMS
    // - Firebase para push notifications
    // - Slack API para Slack
    
    return true
  }

  // Métodos auxiliares privados

  private generateMockReportData(template: ReportTemplate): Record<string, any> {
    const data: Record<string, any> = {}

    for (const metric of template.metrics) {
      switch (metric.format) {
        case 'currency':
          data[metric.metric_name] = Math.floor(Math.random() * 100000) + 10000
          break
        case 'percentage':
          data[metric.metric_name] = Math.random() * 100
          break
        case 'number':
          data[metric.metric_name] = Math.floor(Math.random() * 1000) + 100
          break
        default:
          data[metric.metric_name] = 'Sample data'
      }
    }

    return data
  }

  private calculatePeriodStart(frequency: string): string {
    const now = new Date()
    
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
      case 'weekly':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString()
      case 'quarterly':
        return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).toISOString()
      default:
        return now.toISOString()
    }
  }

  private evaluateCondition(condition: AlertRule['condition'], currentValue: number): boolean {
    const { operator, threshold_value, threshold_value_2 } = condition

    switch (operator) {
      case 'greater_than':
        return currentValue > threshold_value
      case 'less_than':
        return currentValue < threshold_value
      case 'equals':
        return currentValue === threshold_value
      case 'not_equals':
        return currentValue !== threshold_value
      case 'between':
        return threshold_value_2 !== undefined && 
               currentValue >= threshold_value && 
               currentValue <= threshold_value_2
      case 'outside_range':
        return threshold_value_2 !== undefined && 
               (currentValue < threshold_value || currentValue > threshold_value_2)
      default:
        return false
    }
  }

  // Obtener próximos reportes programados
  public getUpcomingReports(): Array<{template: ReportTemplate, next_run: string, time_until: string}> {
    const templates = this.getReportTemplates().filter(t => t.is_active)
    const now = new Date()

    return templates.map(template => {
      const nextRun = new Date(template.next_generation)
      const timeUntil = this.formatTimeUntil(nextRun.getTime() - now.getTime())

      return {
        template,
        next_run: template.next_generation,
        time_until: timeUntil
      }
    }).sort((a, b) => new Date(a.next_run).getTime() - new Date(b.next_run).getTime())
  }

  private formatTimeUntil(milliseconds: number): string {
    if (milliseconds < 0) return 'Vencido'
    
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days} día${days !== 1 ? 's' : ''}`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  // Obtener estadísticas del sistema
  public getSystemStats(): Record<string, any> {
    const templates = this.getReportTemplates()
    const alerts = this.getAlertRules()

    return {
      total_report_templates: templates.length,
      active_report_templates: templates.filter(t => t.is_active).length,
      total_alert_rules: alerts.length,
      active_alert_rules: alerts.filter(a => a.is_active).length,
      reports_generated_today: Math.floor(Math.random() * 10) + 5,
      alerts_triggered_today: Math.floor(Math.random() * 5) + 1,
      system_uptime: '99.8%',
      last_system_check: new Date().toISOString()
    }
  }
}

// Instancia global del sistema de reportes
export const automatedReportsSystem = new AutomatedReportsSystem()

export default automatedReportsSystem

