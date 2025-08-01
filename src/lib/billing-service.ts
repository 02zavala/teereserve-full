import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export interface BillingData {
  tenantId: string;
  planId: string;
  paymentMethodId?: string;
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export interface InvoiceData {
  subscriptionId: string;
  amount: number;
  currency: string;
  dueDate: Date;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export class BillingService {
  private static instance: BillingService;

  public static getInstance(): BillingService {
    if (!BillingService.instance) {
      BillingService.instance = new BillingService();
    }
    return BillingService.instance;
  }

  /**
   * Create subscription for tenant
   */
  async createSubscription(billingData: BillingData): Promise<any> {
    try {
      const { tenantId, planId, paymentMethodId, billingAddress } = billingData;

      // Get subscription plan
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId }
      });

      if (!plan) {
        throw new Error('Subscription plan not found');
      }

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId }
      });

      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Create or get Stripe customer
      let stripeCustomer;
      try {
        const existingCustomers = await stripe.customers.list({
          email: `billing@${tenant.slug}.teereserve.com`,
          limit: 1
        });

        if (existingCustomers.data.length > 0) {
          stripeCustomer = existingCustomers.data[0];
        } else {
          stripeCustomer = await stripe.customers.create({
            email: `billing@${tenant.slug}.teereserve.com`,
            name: tenant.name,
            metadata: {
              tenantId: tenant.id
            },
            address: billingAddress
          });
        }
      } catch (error) {
        console.error('Error creating Stripe customer:', error);
        throw error;
      }

      // Attach payment method if provided
      if (paymentMethodId) {
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: stripeCustomer.id
        });

        await stripe.customers.update(stripeCustomer.id, {
          invoice_settings: {
            default_payment_method: paymentMethodId
          }
        });
      }

      // Create Stripe price if it doesn't exist
      let stripePrice;
      try {
        const existingPrices = await stripe.prices.list({
          product: plan.id,
          limit: 1
        });

        if (existingPrices.data.length > 0) {
          stripePrice = existingPrices.data[0];
        } else {
          // Create product first
          const stripeProduct = await stripe.products.create({
            id: plan.id,
            name: plan.name,
            description: plan.description || undefined
          });

          stripePrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: Math.round(plan.price * 100), // Convert to cents
            currency: plan.currency.toLowerCase(),
            recurring: {
              interval: plan.interval as 'month' | 'year'
            }
          });
        }
      } catch (error) {
        console.error('Error creating Stripe price:', error);
        throw error;
      }

      // Create Stripe subscription
      const stripeSubscription = await stripe.subscriptions.create({
        customer: stripeCustomer.id,
        items: [{ price: stripePrice.id }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent']
      });

      // Calculate period dates
      const currentPeriodStart = new Date();
      const currentPeriodEnd = new Date();
      if (plan.interval === 'month') {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
      } else {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
      }

      // Create subscription in database
      const subscription = await prisma.subscription.create({
        data: {
          tenantId,
          planId,
          status: 'active',
          currentPeriodStart,
          currentPeriodEnd,
          stripeSubscriptionId: stripeSubscription.id
        }
      });

      return {
        subscription,
        stripeSubscription,
        clientSecret: (stripeSubscription.latest_invoice as any)?.payment_intent?.client_secret
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    subscriptionId: string,
    updates: {
      planId?: string;
      paymentMethodId?: string;
      cancelAtPeriodEnd?: boolean;
    }
  ): Promise<any> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: true }
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const updateData: any = {};

      // Update plan if provided
      if (updates.planId && updates.planId !== subscription.planId) {
        const newPlan = await prisma.subscriptionPlan.findUnique({
          where: { id: updates.planId }
        });

        if (!newPlan) {
          throw new Error('New subscription plan not found');
        }

        // Update Stripe subscription
        if (subscription.stripeSubscriptionId) {
          await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            items: [{
              id: (await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId)).items.data[0].id,
              price: updates.planId // Assuming planId is also the Stripe price ID
            }],
            proration_behavior: 'create_prorations'
          });
        }

        updateData.planId = updates.planId;
      }

      // Update payment method if provided
      if (updates.paymentMethodId && subscription.stripeSubscriptionId) {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
        
        await stripe.paymentMethods.attach(updates.paymentMethodId, {
          customer: stripeSubscription.customer as string
        });

        await stripe.customers.update(stripeSubscription.customer as string, {
          invoice_settings: {
            default_payment_method: updates.paymentMethodId
          }
        });
      }

      // Update cancellation setting
      if (updates.cancelAtPeriodEnd !== undefined) {
        if (subscription.stripeSubscriptionId) {
          await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: updates.cancelAtPeriodEnd
          });
        }
        updateData.cancelAtPeriodEnd = updates.cancelAtPeriodEnd;
      }

      // Update database
      if (Object.keys(updateData).length > 0) {
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: updateData
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, immediately: boolean = false): Promise<void> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId }
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      if (subscription.stripeSubscriptionId) {
        if (immediately) {
          await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
          await prisma.subscription.update({
            where: { id: subscriptionId },
            data: { status: 'cancelled' }
          });
        } else {
          await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: true
          });
          await prisma.subscription.update({
            where: { id: subscriptionId },
            data: { cancelAtPeriodEnd: true }
          });
        }
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Create invoice
   */
  async createInvoice(invoiceData: InvoiceData): Promise<any> {
    try {
      const { subscriptionId, amount, currency, dueDate, items } = invoiceData;

      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { tenant: true }
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Create invoice in database
      const invoice = await prisma.invoice.create({
        data: {
          subscriptionId,
          amount,
          currency,
          status: 'pending',
          dueDate,
          tenantId: subscription.tenantId
        }
      });

      // Create Stripe invoice if Stripe subscription exists
      if (subscription.stripeSubscriptionId) {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
        
        // Create invoice items
        for (const item of items) {
          await stripe.invoiceItems.create({
            customer: stripeSubscription.customer as string,
            amount: Math.round(item.unitPrice * item.quantity * 100),
            currency: currency.toLowerCase(),
            description: item.description
          });
        }

        // Create and finalize invoice
        const stripeInvoice = await stripe.invoices.create({
          customer: stripeSubscription.customer as string,
          auto_advance: false
        });

        await stripe.invoices.finalizeInvoice(stripeInvoice.id);

        // Update database with Stripe invoice ID
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { stripeInvoiceId: stripeInvoice.id }
        });
      }

      return invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  /**
   * Process payment for invoice
   */
  async processInvoicePayment(invoiceId: string, paymentMethodId?: string): Promise<any> {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          subscription: {
            include: { tenant: true }
          }
        }
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (invoice.stripeInvoiceId) {
        // Pay Stripe invoice
        const stripeInvoice = await stripe.invoices.pay(invoice.stripeInvoiceId, {
          payment_method: paymentMethodId
        });

        if (stripeInvoice.status === 'paid') {
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
              status: 'paid',
              paidAt: new Date()
            }
          });
        }

        return { success: stripeInvoice.status === 'paid', stripeInvoice };
      } else {
        // Manual payment processing for non-Stripe invoices
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            status: 'paid',
            paidAt: new Date()
          }
        });

        return { success: true };
      }
    } catch (error) {
      console.error('Error processing invoice payment:', error);
      throw error;
    }
  }

  /**
   * Process refund
   */
  async processRefund(
    invoiceId: string,
    amount?: number,
    reason?: string
  ): Promise<any> {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId }
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (invoice.status !== 'paid') {
        throw new Error('Invoice is not paid, cannot refund');
      }

      let refund;
      if (invoice.stripeInvoiceId) {
        // Get payment intent from Stripe invoice
        const stripeInvoice = await stripe.invoices.retrieve(invoice.stripeInvoiceId);
        
        if (stripeInvoice.payment_intent) {
          refund = await stripe.refunds.create({
            payment_intent: stripeInvoice.payment_intent as string,
            amount: amount ? Math.round(amount * 100) : undefined,
            reason: reason as any
          });
        }
      }

      // Update invoice status
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: amount && amount < invoice.amount ? 'paid' : 'refunded'
        }
      });

      return { success: true, refund };
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  /**
   * Get subscription plans
   */
  async getSubscriptionPlans(): Promise<any[]> {
    return await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });
  }

  /**
   * Get tenant subscription
   */
  async getTenantSubscription(tenantId: string): Promise<any> {
    return await prisma.subscription.findUnique({
      where: { tenantId },
      include: {
        plan: true,
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
  }

  /**
   * Get tenant invoices
   */
  async getTenantInvoices(
    tenantId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    return await prisma.invoice.findMany({
      where: { tenantId },
      include: { subscription: { include: { plan: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
  }

  /**
   * Handle Stripe webhook
   */
  async handleStripeWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling Stripe webhook:', error);
      throw error;
    }
  }

  private async handleInvoicePaymentSucceeded(stripeInvoice: Stripe.Invoice): Promise<void> {
    const invoice = await prisma.invoice.findFirst({
      where: { stripeInvoiceId: stripeInvoice.id }
    });

    if (invoice) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'paid',
          paidAt: new Date()
        }
      });
    }
  }

  private async handleInvoicePaymentFailed(stripeInvoice: Stripe.Invoice): Promise<void> {
    const invoice = await prisma.invoice.findFirst({
      where: { stripeInvoiceId: stripeInvoice.id }
    });

    if (invoice) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'failed' }
      });
    }
  }

  private async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription): Promise<void> {
    const subscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: stripeSubscription.id }
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: stripeSubscription.status,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
        }
      });
    }
  }

  private async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription): Promise<void> {
    const subscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: stripeSubscription.id }
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'cancelled' }
      });
    }
  }
}

export default BillingService;

