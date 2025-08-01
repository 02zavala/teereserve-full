import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import twilio from 'twilio';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export interface NotificationData {
  userId?: string;
  userEmail?: string;
  userPhone?: string;
  tenantId: string;
  event: string;
  data: Record<string, any>;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  event: string;
  subject?: string;
  content: string;
  isActive: boolean;
}

export class NotificationService {
  private static instance: NotificationService;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Send notification based on event and user preferences
   */
  async sendNotification(notificationData: NotificationData): Promise<void> {
    try {
      const { userId, userEmail, userPhone, tenantId, event, data } = notificationData;

      // Get user preferences if userId is provided
      let preferences = null;
      if (userId) {
        preferences = await prisma.notificationPreference.findUnique({
          where: {
            userId_event: {
              userId,
              event
            }
          }
        });
      }

      // Get notification templates for this event and tenant
      const templates = await prisma.notificationTemplate.findMany({
        where: {
          tenantId,
          event,
          isActive: true
        }
      });

      // Send notifications based on preferences and available templates
      for (const template of templates) {
        const shouldSend = this.shouldSendNotification(template.type, preferences);
        
        if (shouldSend) {
          await this.sendNotificationByType(template, notificationData);
        }
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Check if notification should be sent based on user preferences
   */
  private shouldSendNotification(
    type: string, 
    preferences: any
  ): boolean {
    if (!preferences) {
      // Default preferences if not set
      return type === 'email' || type === 'in_app';
    }

    switch (type) {
      case 'email':
        return preferences.email;
      case 'sms':
        return preferences.sms;
      case 'push':
        return preferences.push;
      case 'in_app':
        return preferences.inApp;
      default:
        return false;
    }
  }

  /**
   * Send notification by specific type
   */
  private async sendNotificationByType(
    template: NotificationTemplate,
    notificationData: NotificationData
  ): Promise<void> {
    const { userId, userEmail, userPhone, tenantId, data } = notificationData;
    
    // Replace placeholders in template content
    const content = this.replacePlaceholders(template.content, data);
    const subject = template.subject ? this.replacePlaceholders(template.subject, data) : undefined;

    // Create notification record
    const notification = await prisma.notification.create({
      data: {
        userId,
        userEmail,
        userPhone,
        type: template.type,
        event: template.event,
        subject,
        content,
        templateId: template.id,
        tenantId,
        metadata: JSON.stringify(data)
      }
    });

    try {
      switch (template.type) {
        case 'email':
          await this.sendEmailNotification(notification, userEmail || '', subject || '', content);
          break;
        case 'sms':
          await this.sendSMSNotification(notification, userPhone || '', content);
          break;
        case 'push':
          await this.sendPushNotification(notification, userId || '', content);
          break;
        case 'in_app':
          // In-app notifications are stored in database and shown in UI
          break;
      }

      // Update notification status
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: 'sent',
          sentAt: new Date()
        }
      });
    } catch (error) {
      // Update notification status to failed
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: 'failed',
          metadata: JSON.stringify({ ...data, error: error.message })
        }
      });
      throw error;
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    notification: any,
    email: string,
    subject: string,
    content: string
  ): Promise<void> {
    if (!email) {
      throw new Error('Email address is required for email notifications');
    }

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@teereserve.com',
      to: email,
      subject,
      html: content
    });
  }

  /**
   * Send SMS notification
   */
  private async sendSMSNotification(
    notification: any,
    phone: string,
    content: string
  ): Promise<void> {
    if (!phone) {
      throw new Error('Phone number is required for SMS notifications');
    }

    await twilioClient.messages.create({
      body: content,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(
    notification: any,
    userId: string,
    content: string
  ): Promise<void> {
    // TODO: Implement push notification using service worker
    // For now, we'll just log it
    console.log(`Push notification for user ${userId}: ${content}`);
  }

  /**
   * Replace placeholders in template content
   */
  private replacePlaceholders(template: string, data: Record<string, any>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    }
    
    return result;
  }

  /**
   * Get user's notification preferences
   */
  async getUserPreferences(userId: string): Promise<any[]> {
    return await prisma.notificationPreference.findMany({
      where: { userId }
    });
  }

  /**
   * Update user's notification preferences
   */
  async updateUserPreferences(
    userId: string,
    tenantId: string,
    preferences: Array<{
      event: string;
      email: boolean;
      sms: boolean;
      push: boolean;
      inApp: boolean;
    }>
  ): Promise<void> {
    for (const pref of preferences) {
      await prisma.notificationPreference.upsert({
        where: {
          userId_event: {
            userId,
            event: pref.event
          }
        },
        update: {
          email: pref.email,
          sms: pref.sms,
          push: pref.push,
          inApp: pref.inApp
        },
        create: {
          userId,
          tenantId,
          event: pref.event,
          email: pref.email,
          sms: pref.sms,
          push: pref.push,
          inApp: pref.inApp
        }
      });
    }
  }

  /**
   * Get notification templates for a tenant
   */
  async getNotificationTemplates(tenantId: string): Promise<NotificationTemplate[]> {
    return await prisma.notificationTemplate.findMany({
      where: { tenantId }
    });
  }

  /**
   * Create or update notification template
   */
  async upsertNotificationTemplate(
    tenantId: string,
    template: Omit<NotificationTemplate, 'id'>
  ): Promise<NotificationTemplate> {
    return await prisma.notificationTemplate.upsert({
      where: {
        tenantId_event_type: {
          tenantId,
          event: template.event,
          type: template.type
        }
      },
      update: {
        name: template.name,
        subject: template.subject,
        content: template.content,
        isActive: template.isActive
      },
      create: {
        tenantId,
        name: template.name,
        type: template.type,
        event: template.event,
        subject: template.subject,
        content: template.content,
        isActive: template.isActive
      }
    });
  }

  /**
   * Get user's notifications (in-app)
   */
  async getUserNotifications(
    userId: string,
    tenantId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    return await prisma.notification.findMany({
      where: {
        userId,
        tenantId,
        type: 'in_app'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset,
      include: {
        template: true
      }
    });
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: 'read',
        readAt: new Date()
      }
    });
  }

  /**
   * Get unread notification count
   */
  async getUnreadNotificationCount(userId: string, tenantId: string): Promise<number> {
    return await prisma.notification.count({
      where: {
        userId,
        tenantId,
        type: 'in_app',
        status: {
          in: ['sent', 'delivered']
        }
      }
    });
  }
}

// Event types for notifications
export const NOTIFICATION_EVENTS = {
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_REMINDER: 'booking_reminder',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_FAILED: 'payment_failed',
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password_reset',
  AFFILIATE_COMMISSION: 'affiliate_commission',
  COURSE_REVIEW_REQUEST: 'course_review_request',
  PROMOTIONAL_OFFER: 'promotional_offer'
} as const;

// Default notification templates
export const DEFAULT_NOTIFICATION_TEMPLATES = [
  {
    name: 'Booking Confirmation Email',
    type: 'email' as const,
    event: NOTIFICATION_EVENTS.BOOKING_CONFIRMED,
    subject: 'Reserva Confirmada - {{courseName}}',
    content: `
      <h2>¡Tu reserva ha sido confirmada!</h2>
      <p>Hola {{customerName}},</p>
      <p>Tu reserva en <strong>{{courseName}}</strong> ha sido confirmada.</p>
      <h3>Detalles de la reserva:</h3>
      <ul>
        <li><strong>Fecha:</strong> {{date}}</li>
        <li><strong>Hora:</strong> {{time}}</li>
        <li><strong>Jugadores:</strong> {{players}}</li>
        <li><strong>Precio total:</strong> ${{totalPrice}}</li>
      </ul>
      <p>¡Esperamos verte pronto en el campo!</p>
    `,
    isActive: true
  },
  {
    name: 'Booking Confirmation SMS',
    type: 'sms' as const,
    event: NOTIFICATION_EVENTS.BOOKING_CONFIRMED,
    content: 'Reserva confirmada en {{courseName}} para {{date}} a las {{time}}. {{players}} jugadores. Total: ${{totalPrice}}',
    isActive: true
  },
  {
    name: 'Booking Reminder Email',
    type: 'email' as const,
    event: NOTIFICATION_EVENTS.BOOKING_REMINDER,
    subject: 'Recordatorio de Reserva - {{courseName}}',
    content: `
      <h2>Recordatorio de tu reserva</h2>
      <p>Hola {{customerName}},</p>
      <p>Te recordamos que tienes una reserva mañana en <strong>{{courseName}}</strong>.</p>
      <h3>Detalles:</h3>
      <ul>
        <li><strong>Fecha:</strong> {{date}}</li>
        <li><strong>Hora:</strong> {{time}}</li>
        <li><strong>Jugadores:</strong> {{players}}</li>
      </ul>
      <p>¡Nos vemos en el campo!</p>
    `,
    isActive: true
  }
];

export default NotificationService;

