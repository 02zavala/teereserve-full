import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/billing-service';

const billingService = BillingService.getInstance();

export async function GET(request: NextRequest) {
  try {
    const plans = await billingService.getSubscriptionPlans();

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

