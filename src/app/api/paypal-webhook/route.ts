import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  let eventBody;
  try {
    eventBody = await request.text();
  } catch (error) {
    console.error('Error reading request body:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const event = JSON.parse(eventBody);
  console.log('Received PayPal webhook event:', event.event_type);

  try {
    switch (event.event_type) {
      case 'CHECKOUT.ORDER.APPROVED':
        // El pago ha sido aprobado, actualizar el estado de la reserva
        const orderIdApproved = event.resource.id;
        const reservationApproved = await prisma.reservation.findFirst({
          where: { paymentId: orderIdApproved },
        });

        if (reservationApproved) {
          await prisma.reservation.update({
            where: { id: reservationApproved.id },
            data: { paymentStatus: 'completed', status: 'confirmed' },
          });
          console.log(`Reservation ${reservationApproved.id} confirmed for order ${orderIdApproved}`);
        } else {
          console.warn(`Reservation not found for approved order ${orderIdApproved}`);
        }
        break;

      case 'PAYMENT.CAPTURE.COMPLETED':
        // El pago ha sido capturado exitosamente
        const captureIdCompleted = event.resource.id;
        const orderIdCompleted = event.resource.supplementary_data?.related_resources?.[0]?.order?.id || event.resource.links.find((link: any) => link.rel === 'order')?.href.split('/').pop();
        
        if (orderIdCompleted) {
          const reservationCompleted = await prisma.reservation.findFirst({
            where: { paymentId: orderIdCompleted },
          });

          if (reservationCompleted) {
            await prisma.reservation.update({
              where: { id: reservationCompleted.id },
              data: { paymentStatus: 'completed', status: 'confirmed' },
            });
            console.log(`Reservation ${reservationCompleted.id} payment captured for order ${orderIdCompleted}`);
          } else {
            console.warn(`Reservation not found for completed capture ${captureIdCompleted} and order ${orderIdCompleted}`);
          }
        } else {
          console.warn(`Order ID not found for completed capture ${captureIdCompleted}`);
        }
        break;

      case 'PAYMENT.CAPTURE.REFUNDED':
        // El pago ha sido reembolsado
        const captureIdRefunded = event.resource.id;
        const orderIdRefunded = event.resource.supplementary_data?.related_resources?.[0]?.order?.id || event.resource.links.find((link: any) => link.rel === 'order')?.href.split('/').pop();

        if (orderIdRefunded) {
          const reservationRefunded = await prisma.reservation.findFirst({
            where: { paymentId: orderIdRefunded },
          });

          if (reservationRefunded) {
            await prisma.reservation.update({
              where: { id: reservationRefunded.id },
              data: { paymentStatus: 'refunded', status: 'cancelled' },
            });
            console.log(`Reservation ${reservationRefunded.id} refunded for order ${orderIdRefunded}`);
          } else {
            console.warn(`Reservation not found for refunded capture ${captureIdRefunded} and order ${orderIdRefunded}`);
          }
        } else {
          console.warn(`Order ID not found for refunded capture ${captureIdRefunded}`);
        }
        break;

      case 'CHECKOUT.ORDER.VOIDED':
        // La autorización del pedido ha sido anulada
        const orderIdVoided = event.resource.id;
        const reservationVoided = await prisma.reservation.findFirst({
          where: { paymentId: orderIdVoided },
        });

        if (reservationVoided) {
          await prisma.reservation.update({
            where: { id: reservationVoided.id },
            data: { paymentStatus: 'voided', status: 'cancelled' },
          });
          console.log(`Reservation ${reservationVoided.id} voided for order ${orderIdVoided}`);
        } else {
          console.warn(`Reservation not found for voided order ${orderIdVoided}`);
        }
        break;

      // Puedes añadir más tipos de eventos de webhook según sea necesario
      default:
        console.log(`Unhandled PayPal webhook event type: ${event.event_type}`);
        break;
    }

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing PayPal webhook event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Para manejar solicitudes HEAD (usado por PayPal para verificar el endpoint)
export async function HEAD() {
  return new Response(null, { status: 200 });
}

// Para manejar solicitudes GET (opcional, para depuración)
export async function GET() {
  return NextResponse.json({ message: 'PayPal Webhook endpoint' });
}


