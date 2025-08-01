import { NextRequest, NextResponse } from 'next/server';
import { CommunicationService } from '@/lib/communication-service';
import { getCurrentUser } from '@/lib/auth';

const communicationService = CommunicationService.getInstance();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversationId = params.id;
    const body = await request.json();
    const { content, messageType, attachments, senderType } = body;

    // Determine sender type based on user role
    const actualSenderType = senderType || (user.role.name === 'client' ? 'customer' : 'staff');
    const senderName = user.name || user.email;

    const message = await communicationService.sendMessage(
      conversationId,
      user.id,
      actualSenderType,
      senderName,
      content,
      messageType || 'text',
      attachments
    );

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

