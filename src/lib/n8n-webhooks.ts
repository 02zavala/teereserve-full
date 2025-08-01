/**
 * N8N Webhooks Integration for TeeReserve Golf
 * Handles communication between TeeReserve and n8n automation workflows
 */

const N8N_BASE_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678'

export interface WebhookPayload {
  event: string
  data: any
  timestamp: string
  source: 'teereserve-golf'
}

export interface ReservationWebhookData {
  reservationId: string
  userId: string
  courseId: string
  courseName: string
  date: string
  time: string
  players: number
  totalAmount: number
  userEmail: string
  userPhone: string
  userName: string
  status: 'confirmed' | 'pending' | 'cancelled'
}

export interface UserWebhookData {
  userId: string
  email: string
  name: string
  phone?: string
  registrationDate: string
  lastLogin?: string
  totalReservations: number
  favoriteFields: string[]
}

export interface CancellationWebhookData {
  reservationId: string
  userId: string
  courseId: string
  courseName: string
  originalDate: string
  originalTime: string
  cancellationReason?: string
  refundAmount?: number
  userEmail: string
  userName: string
}

/**
 * Send webhook to n8n workflow
 */
async function sendWebhook(webhookPath: string, payload: WebhookPayload): Promise<boolean> {
  try {
    const response = await fetch(`${N8N_BASE_URL}/webhook/${webhookPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TeeReserve-Golf/1.0'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      console.error(`N8N Webhook error: ${response.status} ${response.statusText}`)
      return false
    }

    console.log(`N8N Webhook sent successfully: ${webhookPath}`)
    return true
  } catch (error) {
    console.error('Error sending N8N webhook:', error)
    return false
  }
}

/**
 * Create standardized webhook payload
 */
function createWebhookPayload(event: string, data: any): WebhookPayload {
  return {
    event,
    data,
    timestamp: new Date().toISOString(),
    source: 'teereserve-golf'
  }
}

// =============================================================================
// RESERVATION WEBHOOKS
// =============================================================================

/**
 * Trigger when a new reservation is created
 */
export async function triggerNewReservation(reservationData: ReservationWebhookData): Promise<boolean> {
  const payload = createWebhookPayload('reservation.created', reservationData)
  return sendWebhook('new-reservation', payload)
}

/**
 * Trigger when a reservation is confirmed
 */
export async function triggerReservationConfirmed(reservationData: ReservationWebhookData): Promise<boolean> {
  const payload = createWebhookPayload('reservation.confirmed', reservationData)
  return sendWebhook('reservation-confirmed', payload)
}

/**
 * Trigger when a reservation is cancelled
 */
export async function triggerReservationCancelled(cancellationData: CancellationWebhookData): Promise<boolean> {
  const payload = createWebhookPayload('reservation.cancelled', cancellationData)
  return sendWebhook('reservation-cancelled', payload)
}

/**
 * Trigger 24 hours before reservation (for reminders)
 */
export async function triggerReservationReminder(reservationData: ReservationWebhookData): Promise<boolean> {
  const payload = createWebhookPayload('reservation.reminder', reservationData)
  return sendWebhook('reservation-reminder', payload)
}

// =============================================================================
// USER WEBHOOKS
// =============================================================================

/**
 * Trigger when a new user registers
 */
export async function triggerNewUser(userData: UserWebhookData): Promise<boolean> {
  const payload = createWebhookPayload('user.registered', userData)
  return sendWebhook('new-user', payload)
}

/**
 * Trigger when user becomes inactive (no login for 30 days)
 */
export async function triggerInactiveUser(userData: UserWebhookData): Promise<boolean> {
  const payload = createWebhookPayload('user.inactive', userData)
  return sendWebhook('inactive-user', payload)
}

/**
 * Trigger for VIP users (5+ reservations)
 */
export async function triggerVIPUser(userData: UserWebhookData): Promise<boolean> {
  const payload = createWebhookPayload('user.vip', userData)
  return sendWebhook('vip-user', payload)
}

// =============================================================================
// MARKETING WEBHOOKS
// =============================================================================

/**
 * Trigger for abandoned cart (started reservation but didn't complete)
 */
export async function triggerAbandonedReservation(data: {
  userId: string
  courseId: string
  courseName: string
  userEmail: string
  userName: string
  abandonedAt: string
}): Promise<boolean> {
  const payload = createWebhookPayload('marketing.abandoned_reservation', data)
  return sendWebhook('abandoned-reservation', payload)
}

/**
 * Trigger for birthday campaigns
 */
export async function triggerBirthdayCampaign(data: {
  userId: string
  userEmail: string
  userName: string
  birthday: string
}): Promise<boolean> {
  const payload = createWebhookPayload('marketing.birthday', data)
  return sendWebhook('birthday-campaign', payload)
}

/**
 * Trigger for seasonal promotions
 */
export async function triggerSeasonalPromotion(data: {
  userId: string
  userEmail: string
  userName: string
  promotionType: string
  favoriteFields: string[]
}): Promise<boolean> {
  const payload = createWebhookPayload('marketing.seasonal_promotion', data)
  return sendWebhook('seasonal-promotion', payload)
}

// =============================================================================
// OPERATIONAL WEBHOOKS
// =============================================================================

/**
 * Trigger for weather alerts
 */
export async function triggerWeatherAlert(data: {
  courseId: string
  courseName: string
  weatherCondition: string
  affectedReservations: string[]
  date: string
}): Promise<boolean> {
  const payload = createWebhookPayload('operations.weather_alert', data)
  return sendWebhook('weather-alert', payload)
}

/**
 * Trigger for daily reports
 */
export async function triggerDailyReport(data: {
  date: string
  totalReservations: number
  totalRevenue: number
  newUsers: number
  topCourses: Array<{courseId: string, courseName: string, reservations: number}>
}): Promise<boolean> {
  const payload = createWebhookPayload('operations.daily_report', data)
  return sendWebhook('daily-report', payload)
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Test n8n connection
 */
export async function testN8NConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${N8N_BASE_URL}/webhook/health-check`, {
      method: 'GET',
      headers: {
        'User-Agent': 'TeeReserve-Golf/1.0'
      }
    })
    return response.ok
  } catch (error) {
    console.error('N8N connection test failed:', error)
    return false
  }
}

/**
 * Batch send multiple webhooks
 */
export async function sendBatchWebhooks(webhooks: Array<{path: string, payload: WebhookPayload}>): Promise<{success: number, failed: number}> {
  let success = 0
  let failed = 0

  const promises = webhooks.map(async ({path, payload}) => {
    const result = await sendWebhook(path, payload)
    if (result) success++
    else failed++
  })

  await Promise.all(promises)
  
  return {success, failed}
}

