/**
 * N8N Integration Library for TeeReserve Golf
 * Handles triggering of automation workflows
 */

import { 
  triggerNewUser, 
  triggerReservationReminder, 
  triggerAbandonedReservation, 
  triggerVIPUser,
  triggerNewReservation,
  triggerReservationConfirmed,
  triggerReservationCancelled,
  ReservationWebhookData,
  UserWebhookData,
  CancellationWebhookData
} from './n8n-webhooks'

// =============================================================================
// USER LIFECYCLE AUTOMATION
// =============================================================================

/**
 * Trigger welcome sequence for new users
 */
export async function automateNewUserWelcome(userData: {
  userId: string
  email: string
  name: string
  phone?: string
  registrationDate: string
}): Promise<void> {
  try {
    const webhookData: UserWebhookData = {
      ...userData,
      lastLogin: userData.registrationDate,
      totalReservations: 0,
      favoriteFields: []
    }

    await triggerNewUser(webhookData)
    console.log(`✅ New user welcome automation triggered for: ${userData.email}`)
  } catch (error) {
    console.error('❌ Failed to trigger new user welcome:', error)
  }
}

/**
 * Check and trigger VIP status for qualifying users
 */
export async function checkAndTriggerVIPStatus(userData: {
  userId: string
  email: string
  name: string
  phone?: string
  totalReservations: number
  favoriteFields: string[]
}): Promise<void> {
  try {
    // Trigger VIP sequence if user has 5+ reservations
    if (userData.totalReservations >= 5) {
      const webhookData: UserWebhookData = {
        ...userData,
        registrationDate: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }

      await triggerVIPUser(webhookData)
      console.log(`✅ VIP automation triggered for: ${userData.email} (${userData.totalReservations} reservations)`)
    }
  } catch (error) {
    console.error('❌ Failed to trigger VIP automation:', error)
  }
}

// =============================================================================
// RESERVATION LIFECYCLE AUTOMATION
// =============================================================================

/**
 * Trigger automation when new reservation is created
 */
export async function automateNewReservation(reservationData: {
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
}): Promise<void> {
  try {
    const webhookData: ReservationWebhookData = {
      ...reservationData,
      status: 'confirmed'
    }

    await triggerNewReservation(webhookData)
    console.log(`✅ New reservation automation triggered: ${reservationData.reservationId}`)
  } catch (error) {
    console.error('❌ Failed to trigger new reservation automation:', error)
  }
}

/**
 * Schedule reminder automation for upcoming reservations
 */
export async function scheduleReservationReminder(reservationData: {
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
}): Promise<void> {
  try {
    const webhookData: ReservationWebhookData = {
      ...reservationData,
      status: 'confirmed'
    }

    // Calculate reminder time (24 hours before reservation)
    const reservationDateTime = new Date(`${reservationData.date}T${reservationData.time}`)
    const reminderTime = new Date(reservationDateTime.getTime() - (24 * 60 * 60 * 1000))
    
    // Send immediate confirmation
    await sendWebhook(N8N_WEBHOOKS.RESERVATION_CONFIRMED, webhookData)
    
    // Schedule reminder (this would typically be handled by n8n workflow)
    console.log(`Reminder scheduled for ${reminderTime.toISOString()}`)
    
  } catch (error) {
    console.error('Error sending reservation confirmation:', error)
    throw error
  }
}

