import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notification-service';
import { getCurrentUser } from '@/lib/auth';
import { getTenantFromRequest } from '@/lib/tenant';
import { hasPermission } from '@/lib/permissions';

const notificationService = NotificationService.getInstance();

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

    // Check if user has permission to view notification templates
    if (!hasPermission(user.role.name, 'manage_notifications')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const templates = await notificationService.getNotificationTemplates(tenant.id);

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching notification templates:', error);
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

    // Check if user has permission to manage notification templates
    if (!hasPermission(user.role.name, 'manage_notifications')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, type, event, subject, content, isActive } = body;

    const template = await notificationService.upsertNotificationTemplate(
      tenant.id,
      {
        name,
        type,
        event,
        subject,
        content,
        isActive
      }
    );

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error creating/updating notification template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

