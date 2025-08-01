import { NextRequest, NextResponse } from 'next/server';
import { MarketingService } from '@/lib/marketing-service';
import { getCurrentUser } from '@/lib/auth';
import { getTenantFromRequest } from '@/lib/tenant';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const marketingService = MarketingService.getInstance();

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await getTenantFromRequest(request);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Get loyalty program for tenant
    const loyaltyProgram = await prisma.loyaltyProgram.findUnique({
      where: { tenantId: tenant.id }
    });

    if (!loyaltyProgram) {
      return NextResponse.json({ error: 'No loyalty program found' }, { status: 404 });
    }

    // Get user's point balance
    const pointBalance = await marketingService.getUserPointBalance(user.id, loyaltyProgram.id);

    // Get user's recent transactions
    const transactions = await marketingService.getUserLoyaltyTransactions(
      user.id,
      loyaltyProgram.id,
      20
    );

    return NextResponse.json({
      pointBalance,
      transactions,
      loyaltyProgram
    });
  } catch (error) {
    console.error('Error fetching loyalty points:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await getTenantFromRequest(request);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const body = await request.json();
    const { rewardId, bookingId } = body;

    const redemption = await marketingService.redeemLoyaltyPoints(
      user.id,
      rewardId,
      bookingId
    );

    return NextResponse.json({ redemption });
  } catch (error) {
    console.error('Error redeeming loyalty points:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

