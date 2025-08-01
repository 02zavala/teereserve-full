import { NextRequest, NextResponse } from 'next/server';
import { MarketingService } from '@/lib/marketing-service';
import { getCurrentUser } from '@/lib/auth';
import { getTenantFromRequest } from '@/lib/tenant';
import { hasPermission } from '@/lib/permissions';

const marketingService = MarketingService.getInstance();

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

    // Check if user has permission to manage loyalty program
    if (!hasPermission(user.role.name, 'manage_loyalty')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, pointsPerBooking, pointsPerDollar } = body;

    const loyaltyProgram = await marketingService.createLoyaltyProgram(tenant.id, {
      name,
      description,
      pointsPerBooking,
      pointsPerDollar
    });

    return NextResponse.json({ loyaltyProgram });
  } catch (error) {
    console.error('Error creating loyalty program:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

