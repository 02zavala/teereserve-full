import { NextRequest, NextResponse } from 'next/server';
import { CommunicationService } from '@/lib/communication-service';
import { getCurrentUser } from '@/lib/auth';
import { getTenantFromRequest } from '@/lib/tenant';
import { hasPermission } from '@/lib/permissions';

const communicationService = CommunicationService.getInstance();

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

    // Check if user has permission to send WhatsApp messages
    if (!hasPermission(user.role.name, 'send_whatsapp')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { to, message, mediaUrl } = body;

    const result = await communicationService.sendWhatsAppMessage({
      to,
      body: message,
      mediaUrl
    });

    return NextResponse.json({ success: true, messageId: result.sid });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

