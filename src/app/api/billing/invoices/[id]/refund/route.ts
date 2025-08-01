import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/billing-service';
import { getCurrentUser } from '@/lib/auth';
import { getTenantFromRequest } from '@/lib/tenant';
import { hasPermission } from '@/lib/permissions';

const billingService = BillingService.getInstance();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await getTenantFromRequest(request);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Check if user has permission to manage billing
    if (!hasPermission(user.role.name, 'manage_billing')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const invoiceId = params.id;
    const body = await request.json();
    const { amount, reason } = body;

    const result = await billingService.processRefund(invoiceId, amount, reason);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing refund:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

