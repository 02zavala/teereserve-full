import { NextRequest, NextResponse } from 'next/server';
import EmailMarketingEngine from '@/lib/email-marketing';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const emailEngine = EmailMarketingEngine.getInstance();

    switch (action) {
      case 'campaigns':
        // Retornar campañas mock
        const campaigns = [
          {
            id: 1,
            name: 'Campaña de Bienvenida',
            type: 'welcome',
            status: 'active',
            subject: '¡Bienvenido a TeeReserve Golf! 🏌️‍♂️',
            sent: 245,
            opened: 156,
            clicked: 34,
            conversions: 12,
            revenue: 1850,
            createdAt: '2024-07-15',
            lastSent: '2024-07-18'
          },
          {
            id: 2,
            name: 'Recordatorios de Reserva',
            type: 'reminder',
            status: 'active',
            subject: 'Recordatorio: Tu tee time es mañana',
            sent: 89,
            opened: 78,
            clicked: 23,
            conversions: 8,
            revenue: 0,
            createdAt: '2024-07-10',
            lastSent: '2024-07-18'
          }
        ];
        
        return NextResponse.json({ campaigns });

      case 'analytics':
        const analytics = await emailEngine.getCampaignAnalytics('all');
        return NextResponse.json({ analytics });

      case 'segments':
        // Usuarios mock para segmentación
        const mockUsers = [
          {
            id: '1',
            email: 'usuario1@example.com',
            firstName: 'Carlos',
            lastName: 'Mendoza',
            preferences: {
              welcomeEmails: true,
              bookingReminders: true,
              promotionalOffers: true,
              newsletter: true,
              courseUpdates: true,
              frequency: 'weekly',
              preferredTime: 'morning'
            },
            segments: ['active_users', 'high_value'],
            lastActivity: new Date('2024-07-17'),
            registrationDate: new Date('2024-06-15'),
            totalBookings: 8,
            averageSpend: 180,
            favoriteLocations: ['Los Cabos']
          }
        ];

        const segments = emailEngine.segmentUsers(mockUsers);
        return NextResponse.json({ segments });

      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error en API de email marketing:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    const emailEngine = EmailMarketingEngine.getInstance();

    switch (action) {
      case 'send_welcome':
        const welcomeResult = await emailEngine.sendWelcomeEmail(data.user);
        return NextResponse.json({ success: welcomeResult });

      case 'send_reminder':
        const reminderResult = await emailEngine.sendBookingReminder(data.user, data.booking);
        return NextResponse.json({ success: reminderResult });

      case 'send_promotional':
        const promoResult = await emailEngine.sendPromotionalOffer(data.user, data.offer);
        return NextResponse.json({ success: promoResult });

      case 'send_newsletter':
        const newsletterResult = await emailEngine.sendNewsletter(data.users, data.content);
        return NextResponse.json({ sent: newsletterResult });

      case 'create_campaign':
        // Simular creación de campaña
        const newCampaign = {
          id: Date.now(),
          ...data,
          status: 'draft',
          createdAt: new Date().toISOString(),
          analytics: {
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            bounced: 0,
            unsubscribed: 0,
            conversions: 0,
            revenue: 0
          }
        };
        
        return NextResponse.json({ campaign: newCampaign });

      case 'test_email':
        // Simular envío de email de prueba
        console.log('📧 Email de prueba enviado:', data);
        return NextResponse.json({ success: true, message: 'Email de prueba enviado' });

      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error en POST de email marketing:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, updates } = body;

    // Simular actualización de campaña
    console.log(`📝 Actualizando campaña ${campaignId}:`, updates);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Campaña actualizada exitosamente' 
    });
  } catch (error) {
    console.error('Error en PUT de email marketing:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');

    if (!campaignId) {
      return NextResponse.json({ error: 'ID de campaña requerido' }, { status: 400 });
    }

    // Simular eliminación de campaña
    console.log(`🗑️ Eliminando campaña ${campaignId}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Campaña eliminada exitosamente' 
    });
  } catch (error) {
    console.error('Error en DELETE de email marketing:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

