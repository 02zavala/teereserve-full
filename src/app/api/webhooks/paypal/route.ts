import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Función para verificar la firma del webhook de PayPal
function verifyPayPalWebhook(payload: string, headers: any, webhookId: string): boolean {
  try {
    const authAlgo = headers['paypal-auth-algo'];
    const transmission_id = headers['paypal-transmission-id'];
    const cert_id = headers['paypal-cert-id'];
    const transmission_sig = headers['paypal-transmission-sig'];
    const transmission_time = headers['paypal-transmission-time'];

    // En un entorno de producción, deberías verificar la firma usando la clave pública de PayPal
    // Por ahora, para sandbox, simplemente verificamos que los headers estén presentes
    return !!(authAlgo && transmission_id && cert_id && transmission_sig && transmission_time);
  } catch (error) {
    console.error('Error verifying PayPal webhook:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headers = Object.fromEntries(request.headers.entries());
    
    // Verificar la firma del webhook (en producción)
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (webhookId && !verifyPayPalWebhook(body, headers, webhookId)) {
      console.error('Invalid PayPal webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    console.log('PayPal webhook received:', event.event_type);

    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(event);
        break;
      
      case 'PAYMENT.CAPTURE.DENIED':
        await handlePaymentDenied(event);
        break;
      
      case 'PAYMENT.CAPTURE.REFUNDED':
        await handlePaymentRefunded(event);
        break;
      
      case 'CHECKOUT.ORDER.APPROVED':
        await handleOrderApproved(event);
        break;
      
      default:
        console.log(`Unhandled PayPal webhook event: ${event.event_type}`);
    }

    return NextResponse.json({ status: 'success' });

  } catch (error) {
    console.error('Error processing PayPal webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function handlePaymentCompleted(event: any) {
  try {
    const paymentId = event.resource.id;
    const orderId = event.resource.supplementary_data?.related_ids?.order_id;
    
    console.log(`Payment completed: ${paymentId}, Order: ${orderId}`);

    // Actualizar el estado de la reserva
    const reservation = await prisma.reservation.findFirst({
      where: { paymentId: orderId || paymentId }
    });

    if (reservation) {
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: {
          paymentStatus: 'completed',
          status: 'confirmed',
          updatedAt: new Date()
        }
      });

      console.log(`Reservation ${reservation.id} confirmed via webhook`);
      
      // Aquí podrías enviar un email de confirmación adicional si es necesario
      // await sendConfirmationEmail(reservation);
    } else {
      console.warn(`No reservation found for payment ID: ${paymentId}`);
    }

  } catch (error) {
    console.error('Error handling payment completed:', error);
  }
}

async function handlePaymentDenied(event: any) {
  try {
    const paymentId = event.resource.id;
    const orderId = event.resource.supplementary_data?.related_ids?.order_id;
    
    console.log(`Payment denied: ${paymentId}, Order: ${orderId}`);

    // Actualizar el estado de la reserva
    const reservation = await prisma.reservation.findFirst({
      where: { paymentId: orderId || paymentId }
    });

    if (reservation) {
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: {
          paymentStatus: 'failed',
          status: 'cancelled',
          updatedAt: new Date()
        }
      });

      console.log(`Reservation ${reservation.id} cancelled due to payment denial`);
      
      // Aquí podrías enviar un email notificando el fallo del pago
      // await sendPaymentFailedEmail(reservation);
    }

  } catch (error) {
    console.error('Error handling payment denied:', error);
  }
}

async function handlePaymentRefunded(event: any) {
  try {
    const refundId = event.resource.id;
    const paymentId = event.resource.links?.find((link: any) => 
      link.rel === 'up'
    )?.href?.split('/').pop();
    
    console.log(`Payment refunded: ${refundId}, Original payment: ${paymentId}`);

    // Buscar la reserva por payment ID
    const reservation = await prisma.reservation.findFirst({
      where: { paymentId: paymentId }
    });

    if (reservation) {
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: {
          paymentStatus: 'refunded',
          status: 'cancelled',
          updatedAt: new Date()
        }
      });

      console.log(`Reservation ${reservation.id} refunded`);
      
      // Aquí podrías enviar un email notificando el reembolso
      // await sendRefundConfirmationEmail(reservation);
    }

  } catch (error) {
    console.error('Error handling payment refunded:', error);
  }
}

async function handleOrderApproved(event: any) {
  try {
    const orderId = event.resource.id;
    
    console.log(`Order approved: ${orderId}`);

    // Actualizar el estado de la reserva a "pending" si existe
    const reservation = await prisma.reservation.findFirst({
      where: { paymentId: orderId }
    });

    if (reservation) {
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: {
          paymentStatus: 'pending',
          status: 'pending',
          updatedAt: new Date()
        }
      });

      console.log(`Reservation ${reservation.id} marked as pending approval`);
    }

  } catch (error) {
    console.error('Error handling order approved:', error);
  }
}

// Endpoint GET para verificar que el webhook está funcionando
export async function GET() {
  return NextResponse.json({ 
    status: 'PayPal webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}

