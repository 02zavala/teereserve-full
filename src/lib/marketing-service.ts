import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailCampaignData {
  name: string;
  subject: string;
  content: string;
  recipientSegment: 'all' | 'active' | 'new' | 'inactive' | 'custom';
  customRecipients?: string[];
  scheduledAt?: Date;
}

export interface LoyaltyRewardData {
  name: string;
  description?: string;
  pointsCost: number;
  rewardType: 'discount_percentage' | 'discount_fixed' | 'free_booking' | 'merchandise';
  rewardValue?: number;
}

export class MarketingService {
  private static instance: MarketingService;

  public static getInstance(): MarketingService {
    if (!MarketingService.instance) {
      MarketingService.instance = new MarketingService();
    }
    return MarketingService.instance;
  }

  /**
   * Create email campaign
   */
  async createEmailCampaign(
    tenantId: string,
    campaignData: EmailCampaignData
  ): Promise<any> {
    try {
      const { name, subject, content, recipientSegment, customRecipients, scheduledAt } = campaignData;

      // Get recipients based on segment
      let recipients: string[] = [];
      
      if (recipientSegment === 'custom' && customRecipients) {
        recipients = customRecipients;
      } else {
        recipients = await this.getRecipientsBySegment(tenantId, recipientSegment);
      }

      // Create campaign
      const campaign = await prisma.emailCampaign.create({
        data: {
          tenantId,
          name,
          subject,
          content,
          status: scheduledAt ? 'scheduled' : 'draft',
          scheduledAt,
          recipientCount: recipients.length
        }
      });

      // Create recipient records
      const recipientRecords = recipients.map(email => ({
        campaignId: campaign.id,
        email,
        name: '', // Could be enhanced to include names
        status: 'pending' as const
      }));

      await prisma.emailCampaignRecipient.createMany({
        data: recipientRecords
      });

      // If not scheduled, send immediately
      if (!scheduledAt) {
        await this.sendEmailCampaign(campaign.id);
      }

      return campaign;
    } catch (error) {
      console.error('Error creating email campaign:', error);
      throw error;
    }
  }

  /**
   * Send email campaign
   */
  async sendEmailCampaign(campaignId: string): Promise<void> {
    try {
      const campaign = await prisma.emailCampaign.findUnique({
        where: { id: campaignId },
        include: {
          recipients: {
            where: { status: 'pending' }
          }
        }
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Update campaign status
      await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: {
          status: 'sending',
          sentAt: new Date()
        }
      });

      // Send emails in batches
      const batchSize = 50;
      const recipients = campaign.recipients;

      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (recipient) => {
            try {
              await resend.emails.send({
                from: process.env.FROM_EMAIL || 'noreply@teereserve.com',
                to: recipient.email,
                subject: campaign.subject,
                html: this.personalizeContent(campaign.content, recipient.email)
              });

              await prisma.emailCampaignRecipient.update({
                where: { id: recipient.id },
                data: {
                  status: 'sent',
                  sentAt: new Date()
                }
              });
            } catch (error) {
              console.error(`Error sending email to ${recipient.email}:`, error);
              
              await prisma.emailCampaignRecipient.update({
                where: { id: recipient.id },
                data: { status: 'bounced' }
              });
            }
          })
        );

        // Small delay between batches to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Update campaign status
      await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: { status: 'sent' }
      });
    } catch (error) {
      console.error('Error sending email campaign:', error);
      
      // Update campaign status to failed
      await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: { status: 'failed' }
      });
      
      throw error;
    }
  }

  /**
   * Get recipients by segment
   */
  private async getRecipientsBySegment(
    tenantId: string,
    segment: 'all' | 'active' | 'new' | 'inactive'
  ): Promise<string[]> {
    let whereClause: any = { tenantId };

    switch (segment) {
      case 'active':
        // Users who made a booking in the last 30 days
        whereClause.bookings = {
          some: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        };
        break;
      case 'new':
        // Users created in the last 7 days
        whereClause.createdAt = {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        };
        break;
      case 'inactive':
        // Users who haven't made a booking in the last 90 days
        whereClause.bookings = {
          none: {
            createdAt: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
            }
          }
        };
        break;
      default:
        // All users
        break;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: { email: true }
    });

    return users.map(user => user.email);
  }

  /**
   * Personalize email content
   */
  private personalizeContent(content: string, email: string): string {
    // Simple personalization - could be enhanced
    return content.replace(/{{email}}/g, email);
  }

  /**
   * Track email open
   */
  async trackEmailOpen(campaignId: string, recipientEmail: string): Promise<void> {
    try {
      const recipient = await prisma.emailCampaignRecipient.findFirst({
        where: {
          campaignId,
          email: recipientEmail
        }
      });

      if (recipient && !recipient.openedAt) {
        await prisma.emailCampaignRecipient.update({
          where: { id: recipient.id },
          data: {
            status: 'opened',
            openedAt: new Date()
          }
        });

        // Update campaign open count
        await prisma.emailCampaign.update({
          where: { id: campaignId },
          data: {
            openCount: {
              increment: 1
            }
          }
        });
      }
    } catch (error) {
      console.error('Error tracking email open:', error);
    }
  }

  /**
   * Track email click
   */
  async trackEmailClick(campaignId: string, recipientEmail: string): Promise<void> {
    try {
      const recipient = await prisma.emailCampaignRecipient.findFirst({
        where: {
          campaignId,
          email: recipientEmail
        }
      });

      if (recipient && !recipient.clickedAt) {
        await prisma.emailCampaignRecipient.update({
          where: { id: recipient.id },
          data: {
            status: 'clicked',
            clickedAt: new Date()
          }
        });

        // Update campaign click count
        await prisma.emailCampaign.update({
          where: { id: campaignId },
          data: {
            clickCount: {
              increment: 1
            }
          }
        });
      }
    } catch (error) {
      console.error('Error tracking email click:', error);
    }
  }

  /**
   * Create loyalty program
   */
  async createLoyaltyProgram(
    tenantId: string,
    programData: {
      name: string;
      description?: string;
      pointsPerBooking: number;
      pointsPerDollar: number;
    }
  ): Promise<any> {
    try {
      const loyaltyProgram = await prisma.loyaltyProgram.create({
        data: {
          tenantId,
          name: programData.name,
          description: programData.description,
          pointsPerBooking: programData.pointsPerBooking,
          pointsPerDollar: programData.pointsPerDollar,
          isActive: true
        }
      });

      return loyaltyProgram;
    } catch (error) {
      console.error('Error creating loyalty program:', error);
      throw error;
    }
  }

  /**
   * Add loyalty reward
   */
  async addLoyaltyReward(
    programId: string,
    rewardData: LoyaltyRewardData
  ): Promise<any> {
    try {
      const reward = await prisma.loyaltyReward.create({
        data: {
          programId,
          name: rewardData.name,
          description: rewardData.description,
          pointsCost: rewardData.pointsCost,
          rewardType: rewardData.rewardType,
          rewardValue: rewardData.rewardValue,
          isActive: true
        }
      });

      return reward;
    } catch (error) {
      console.error('Error adding loyalty reward:', error);
      throw error;
    }
  }

  /**
   * Award loyalty points
   */
  async awardLoyaltyPoints(
    tenantId: string,
    userId: string,
    points: number,
    description: string,
    bookingId?: string
  ): Promise<void> {
    try {
      const loyaltyProgram = await prisma.loyaltyProgram.findUnique({
        where: { tenantId }
      });

      if (!loyaltyProgram) {
        return; // No loyalty program for this tenant
      }

      await prisma.loyaltyTransaction.create({
        data: {
          programId: loyaltyProgram.id,
          userId,
          type: 'earned',
          points,
          description,
          bookingId
        }
      });
    } catch (error) {
      console.error('Error awarding loyalty points:', error);
      throw error;
    }
  }

  /**
   * Redeem loyalty points
   */
  async redeemLoyaltyPoints(
    userId: string,
    rewardId: string,
    bookingId?: string
  ): Promise<any> {
    try {
      const reward = await prisma.loyaltyReward.findUnique({
        where: { id: rewardId },
        include: { program: true }
      });

      if (!reward) {
        throw new Error('Reward not found');
      }

      // Check user's point balance
      const pointBalance = await this.getUserPointBalance(userId, reward.program.id);
      
      if (pointBalance < reward.pointsCost) {
        throw new Error('Insufficient points');
      }

      // Create redemption record
      const redemption = await prisma.loyaltyRedemption.create({
        data: {
          rewardId,
          userId,
          pointsUsed: reward.pointsCost,
          status: 'pending',
          bookingId
        }
      });

      // Deduct points
      await prisma.loyaltyTransaction.create({
        data: {
          programId: reward.program.id,
          userId,
          type: 'redeemed',
          points: -reward.pointsCost,
          description: `Redeemed: ${reward.name}`
        }
      });

      return redemption;
    } catch (error) {
      console.error('Error redeeming loyalty points:', error);
      throw error;
    }
  }

  /**
   * Get user point balance
   */
  async getUserPointBalance(userId: string, programId: string): Promise<number> {
    try {
      const result = await prisma.loyaltyTransaction.aggregate({
        where: {
          userId,
          programId
        },
        _sum: {
          points: true
        }
      });

      return result._sum.points || 0;
    } catch (error) {
      console.error('Error getting user point balance:', error);
      return 0;
    }
  }

  /**
   * Get user loyalty transactions
   */
  async getUserLoyaltyTransactions(
    userId: string,
    programId: string,
    limit: number = 50
  ): Promise<any[]> {
    try {
      return await prisma.loyaltyTransaction.findMany({
        where: {
          userId,
          programId
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      });
    } catch (error) {
      console.error('Error getting user loyalty transactions:', error);
      return [];
    }
  }

  /**
   * Get email campaigns
   */
  async getEmailCampaigns(
    tenantId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    try {
      return await prisma.emailCampaign.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          _count: {
            select: { recipients: true }
          }
        }
      });
    } catch (error) {
      console.error('Error getting email campaigns:', error);
      return [];
    }
  }

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(campaignId: string): Promise<any> {
    try {
      const campaign = await prisma.emailCampaign.findUnique({
        where: { id: campaignId },
        include: {
          recipients: true
        }
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const totalRecipients = campaign.recipients.length;
      const sentCount = campaign.recipients.filter(r => r.status === 'sent' || r.status === 'opened' || r.status === 'clicked').length;
      const openedCount = campaign.recipients.filter(r => r.openedAt).length;
      const clickedCount = campaign.recipients.filter(r => r.clickedAt).length;
      const bouncedCount = campaign.recipients.filter(r => r.status === 'bounced').length;

      return {
        totalRecipients,
        sentCount,
        openedCount,
        clickedCount,
        bouncedCount,
        deliveryRate: totalRecipients > 0 ? (sentCount / totalRecipients) * 100 : 0,
        openRate: sentCount > 0 ? (openedCount / sentCount) * 100 : 0,
        clickRate: sentCount > 0 ? (clickedCount / sentCount) * 100 : 0,
        bounceRate: totalRecipients > 0 ? (bouncedCount / totalRecipients) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting campaign analytics:', error);
      throw error;
    }
  }

  /**
   * Segment users automatically
   */
  async segmentUsers(tenantId: string): Promise<any> {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      // VIP customers (high booking frequency and value)
      const vipCustomers = await prisma.user.findMany({
        where: {
          tenantId,
          bookings: {
            some: {
              createdAt: { gte: thirtyDaysAgo },
              totalPrice: { gte: 200 }
            }
          }
        },
        include: {
          _count: {
            select: { bookings: true }
          }
        }
      });

      // At-risk customers (no recent bookings)
      const atRiskCustomers = await prisma.user.findMany({
        where: {
          tenantId,
          bookings: {
            none: {
              createdAt: { gte: ninetyDaysAgo }
            }
          }
        }
      });

      // New customers (registered recently)
      const newCustomers = await prisma.user.findMany({
        where: {
          tenantId,
          createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
        }
      });

      return {
        vipCustomers: vipCustomers.filter(c => c._count.bookings >= 5),
        atRiskCustomers,
        newCustomers
      };
    } catch (error) {
      console.error('Error segmenting users:', error);
      throw error;
    }
  }
}

export default MarketingService;

