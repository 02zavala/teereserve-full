import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/analytics-service';
import { getCurrentUser } from '@/lib/auth';
import { getTenantFromRequest } from '@/lib/tenant';
import { hasPermission } from '@/lib/permissions';

const analyticsService = AnalyticsService.getInstance();

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

    // Check if user has permission to view scheduled reports
    if (!hasPermission(user.role.name, 'manage_reports')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const scheduledReports = await analyticsService.getScheduledReports(tenant.id);

    return NextResponse.json({ reports: scheduledReports });
  } catch (error) {
    console.error('Error fetching scheduled reports:', error);
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

    // Check if user has permission to create scheduled reports
    if (!hasPermission(user.role.name, 'manage_reports')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      type,
      parameters,
      schedule,
      format,
      recipients
    } = body;

    await analyticsService.scheduleReport(tenant.id, {
      name,
      type,
      parameters: JSON.stringify(parameters),
      schedule,
      format,
      recipients
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating scheduled report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

