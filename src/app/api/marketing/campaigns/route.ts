import { NextRequest, NextResponse } from 'next/server';
import { MarketingService } from '@/lib/marketing-service';
import { getCurrentUser } from '@/lib/auth';
import { getTenantFromRequest } from '@/lib/tenant';
import { hasPermission } from '@/lib/permissions';

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

    // Check if user has permission to view marketing campaigns
    if (!hasPermission(user.role.name, 'view_marketing')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const campaigns = await marketingService.getEmailCampaigns(tenant.id, limit, offset);

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
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

    // Check if user has permission to create marketing campaigns
    if (!hasPermission(user.role.name, 'manage_marketing')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      subject,
      content,
      recipientSegment,
      customRecipients,
      scheduledAt
    } = body;

    const campaign = await marketingService.createEmailCampaign(tenant.id, {
      name,
      subject,
      content,
      recipientSegment,
      customRecipients,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

