import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      courseId,
      courseName,
      date,
      time,
      players,
      pricePerPlayer,
      totalPrice,
      firstName,
      lastName,
      email,
      phone,
      specialRequests,
      paymentId,
      paymentStatus,
      paymentMethod
    } = body;

    // Validar campos requeridos
    if (!courseId || !courseName || !date || !time || !players || !pricePerPlayer || !totalPrice || 
        !firstName || !lastName || !email || !phone || !paymentId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Crear la reserva en la base de datos
    const reservation = await prisma.reservation.create({
      data: {
        courseId,
        courseName,
        date: new Date(date),
        time,
        players: parseInt(players),
        pricePerPlayer: parseFloat(pricePerPlayer),
        totalPrice: parseFloat(totalPrice),
        customerFirstName: firstName,
        customerLastName: lastName,
        customerEmail: email,
        customerPhone: phone,
        specialRequests: specialRequests || null,
        paymentId,
        paymentStatus: paymentStatus || 'completed',
        paymentMethod: paymentMethod || 'paypal',
        status: 'confirmed'
      }
    });

    // Enviar email de confirmación (opcional, implementar más tarde)
    // await sendConfirmationEmail(reservation);

    return NextResponse.json(reservation, { status: 201 });

  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (id) {
      // Obtener una reserva específica por ID
      const reservation = await prisma.reservation.findUnique({
        where: { id }
      });

      if (!reservation) {
        return NextResponse.json(
          { error: 'Reserva no encontrada' },
          { status: 404 }
        );
      }

      return NextResponse.json(reservation);
    }

    if (email) {
      // Obtener todas las reservas de un email
      const reservations = await prisma.reservation.findMany({
        where: { customerEmail: email },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json(reservations);
    }

    // Si no se proporciona ID o email, devolver error
    return NextResponse.json(
      { error: 'Se requiere ID o email' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

