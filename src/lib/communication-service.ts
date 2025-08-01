import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';

const prisma = new PrismaClient();
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId?: string;
  senderType: 'customer' | 'staff' | 'system' | 'bot';
  senderName: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  attachments?: string[];
  isRead: boolean;
  createdAt: Date;
}

export interface ChatConversation {
  id: string;
  tenantId: string;
  customerId?: string;
  customerEmail: string;
  customerName: string;
  golfCourseId?: string;
  status: 'open' | 'closed' | 'resolved';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
}

export interface WhatsAppMessage {
  to: string;
  body: string;
  mediaUrl?: string;
}

export class CommunicationService {
  private static instance: CommunicationService;

  public static getInstance(): CommunicationService {
    if (!CommunicationService.instance) {
      CommunicationService.instance = new CommunicationService();
    }
    return CommunicationService.instance;
  }

  /**
   * Create new chat conversation
   */
  async createConversation(
    tenantId: string,
    customerEmail: string,
    customerName: string,
    customerId?: string,
    golfCourseId?: string,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ): Promise<ChatConversation> {
    try {
      const conversation = await prisma.chatConversation.create({
        data: {
          tenantId,
          customerId,
          customerEmail,
          customerName,
          golfCourseId,
          priority,
          status: 'open'
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      // Send welcome message
      await this.sendMessage(
        conversation.id,
        undefined,
        'system',
        'Sistema',
        `¡Hola ${customerName}! Gracias por contactarnos. ¿En qué podemos ayudarte hoy?`,
        'system'
      );

      return conversation as ChatConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  /**
   * Send message in conversation
   */
  async sendMessage(
    conversationId: string,
    senderId: string | undefined,
    senderType: 'customer' | 'staff' | 'system' | 'bot',
    senderName: string,
    content: string,
    messageType: 'text' | 'image' | 'file' | 'system' = 'text',
    attachments?: string[]
  ): Promise<ChatMessage> {
    try {
      const message = await prisma.chatMessage.create({
        data: {
          conversationId,
          senderId,
          senderType,
          senderName,
          content,
          messageType,
          attachments: attachments ? JSON.stringify(attachments) : null,
          isRead: senderType === 'customer' // Mark as read if sent by customer
        }
      });

      // Update conversation timestamp
      await prisma.chatConversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
      });

      // If message is from customer, check for auto-responses
      if (senderType === 'customer') {
        await this.processAutoResponse(conversationId, content);
      }

      return message as ChatMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string): Promise<ChatConversation | null> {
    try {
      const conversation = await prisma.chatConversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          },
          golfCourse: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return conversation as ChatConversation | null;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }

  /**
   * Get conversations for tenant
   */
  async getConversations(
    tenantId: string,
    status?: 'open' | 'closed' | 'resolved',
    assignedTo?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ChatConversation[]> {
    try {
      const whereClause: any = { tenantId };
      
      if (status) {
        whereClause.status = status;
      }
      
      if (assignedTo) {
        whereClause.assignedTo = assignedTo;
      }

      const conversations = await prisma.chatConversation.findMany({
        where: whereClause,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1 // Only get the last message for preview
          },
          golfCourse: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset
      });

      return conversations as ChatConversation[];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  /**
   * Update conversation status
   */
  async updateConversationStatus(
    conversationId: string,
    status: 'open' | 'closed' | 'resolved',
    assignedTo?: string
  ): Promise<void> {
    try {
      const updateData: any = { status };
      
      if (assignedTo !== undefined) {
        updateData.assignedTo = assignedTo;
      }

      await prisma.chatConversation.update({
        where: { id: conversationId },
        data: updateData
      });

      // Send system message about status change
      const statusMessages = {
        open: 'Conversación reabierta',
        closed: 'Conversación cerrada',
        resolved: 'Conversación marcada como resuelta'
      };

      await this.sendMessage(
        conversationId,
        undefined,
        'system',
        'Sistema',
        statusMessages[status],
        'system'
      );
    } catch (error) {
      console.error('Error updating conversation status:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId: string, userId?: string): Promise<void> {
    try {
      const whereClause: any = { conversationId, isRead: false };
      
      // If userId is provided, only mark messages not sent by this user as read
      if (userId) {
        whereClause.senderId = { not: userId };
      }

      await prisma.chatMessage.updateMany({
        where: whereClause,
        data: { isRead: true }
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadMessageCount(
    tenantId: string,
    userId?: string
  ): Promise<number> {
    try {
      const whereClause: any = {
        conversation: { tenantId },
        isRead: false
      };

      // If userId is provided, count messages not sent by this user
      if (userId) {
        whereClause.senderId = { not: userId };
      }

      return await prisma.chatMessage.count({
        where: whereClause
      });
    } catch (error) {
      console.error('Error getting unread message count:', error);
      return 0;
    }
  }

  /**
   * Send WhatsApp message
   */
  async sendWhatsAppMessage(message: WhatsAppMessage): Promise<any> {
    try {
      const twilioMessage = await twilioClient.messages.create({
        body: message.body,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${message.to}`,
        ...(message.mediaUrl && { mediaUrl: [message.mediaUrl] })
      });

      return twilioMessage;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  /**
   * Process auto-response for common queries
   */
  private async processAutoResponse(conversationId: string, content: string): Promise<void> {
    const lowerContent = content.toLowerCase();
    
    // Define auto-response patterns
    const autoResponses = [
      {
        keywords: ['horario', 'hora', 'abierto', 'cerrado'],
        response: 'Nuestros horarios de atención son de lunes a domingo de 6:00 AM a 8:00 PM. ¿En qué más puedo ayudarte?'
      },
      {
        keywords: ['precio', 'costo', 'tarifa', 'cuanto'],
        response: 'Los precios varían según el campo de golf y el día de la semana. Te conectaré con un agente para darte información específica.'
      },
      {
        keywords: ['reserva', 'reservar', 'booking'],
        response: 'Para hacer una reserva, puedes usar nuestra plataforma online o te puedo ayudar aquí. ¿Para qué fecha y hora necesitas la reserva?'
      },
      {
        keywords: ['cancelar', 'cancelación'],
        response: 'Para cancelar una reserva, necesito tu número de confirmación. También puedes cancelar desde tu cuenta en la plataforma.'
      },
      {
        keywords: ['ubicación', 'dirección', 'donde'],
        response: 'Te puedo ayudar con la ubicación de nuestros campos de golf. ¿Cuál campo te interesa?'
      }
    ];

    // Check for matching keywords
    for (const autoResponse of autoResponses) {
      if (autoResponse.keywords.some(keyword => lowerContent.includes(keyword))) {
        // Wait a bit to simulate typing
        setTimeout(async () => {
          await this.sendMessage(
            conversationId,
            undefined,
            'bot',
            'Asistente Virtual',
            autoResponse.response,
            'text'
          );
        }, 1000);
        break;
      }
    }
  }

  /**
   * Search conversations
   */
  async searchConversations(
    tenantId: string,
    query: string,
    limit: number = 20
  ): Promise<ChatConversation[]> {
    try {
      const conversations = await prisma.chatConversation.findMany({
        where: {
          tenantId,
          OR: [
            { customerName: { contains: query, mode: 'insensitive' } },
            { customerEmail: { contains: query, mode: 'insensitive' } },
            {
              messages: {
                some: {
                  content: { contains: query, mode: 'insensitive' }
                }
              }
            }
          ]
        },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          golfCourse: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: limit
      });

      return conversations as ChatConversation[];
    } catch (error) {
      console.error('Error searching conversations:', error);
      throw error;
    }
  }

  /**
   * Get conversation analytics
   */
  async getConversationAnalytics(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    try {
      const totalConversations = await prisma.chatConversation.count({
        where: {
          tenantId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      const resolvedConversations = await prisma.chatConversation.count({
        where: {
          tenantId,
          status: 'resolved',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      const averageResponseTime = await this.calculateAverageResponseTime(
        tenantId,
        startDate,
        endDate
      );

      const conversationsByPriority = await prisma.chatConversation.groupBy({
        by: ['priority'],
        where: {
          tenantId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          priority: true
        }
      });

      return {
        totalConversations,
        resolvedConversations,
        resolutionRate: totalConversations > 0 ? (resolvedConversations / totalConversations) * 100 : 0,
        averageResponseTime,
        conversationsByPriority: conversationsByPriority.map(item => ({
          priority: item.priority,
          count: item._count.priority
        }))
      };
    } catch (error) {
      console.error('Error getting conversation analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate average response time
   */
  private async calculateAverageResponseTime(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    try {
      // This is a simplified calculation
      // In a real implementation, you'd want to calculate the time between customer messages and staff responses
      const conversations = await prisma.chatConversation.findMany({
        where: {
          tenantId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 10 // Limit to first 10 messages for performance
          }
        }
      });

      let totalResponseTime = 0;
      let responseCount = 0;

      conversations.forEach(conversation => {
        const messages = conversation.messages;
        for (let i = 0; i < messages.length - 1; i++) {
          const currentMessage = messages[i];
          const nextMessage = messages[i + 1];
          
          // If current message is from customer and next is from staff
          if (currentMessage.senderType === 'customer' && nextMessage.senderType === 'staff') {
            const responseTime = nextMessage.createdAt.getTime() - currentMessage.createdAt.getTime();
            totalResponseTime += responseTime;
            responseCount++;
          }
        }
      });

      return responseCount > 0 ? totalResponseTime / responseCount / 1000 / 60 : 0; // Return in minutes
    } catch (error) {
      console.error('Error calculating average response time:', error);
      return 0;
    }
  }
}

export default CommunicationService;

