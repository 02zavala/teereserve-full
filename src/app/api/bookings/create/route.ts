import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with test key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51234567890abcdef', {
  apiVersion: '2024-06-20',
})

interface BookingRequest {
  courseId: string
  date: string
  time: string
  players: number
  comments: string
  totalAmount: number
  customerEmail?: string
  customerName?: string
  customerPhone?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingRequest = await request.json()
    
    const {
      courseId,
      date,
      time,
      players,
      comments,
      totalAmount,
      customerEmail = 'test@teereserve.golf',
      customerName = 'Usuario Test',
      customerPhone = '+52 555 123 4567'
    } = body

    // Validate required fields
    if (!courseId || !date || !time || !players || !totalAmount) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Generate booking ID
    const bookingId = `TRG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // For demo purposes, always return success
    const booking = {
      id: bookingId,
      folio: `TRG-2025-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      courseId,
      courseName: 'Cabo Real Golf Club', // This would come from database
      date,
      time,
      players,
      comments,
      totalAmount,
      customerEmail,
      customerName,
      customerPhone,
      status: 'confirmed',
      paymentIntentId: 'pi_test_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    }

    // In a real application, you would:
    // 1. Save booking to database
    // 2. Send confirmation email
    // 3. Generate PDF confirmation
    // 4. Send WhatsApp message
    // 5. Update course availability

    // For now, we'll simulate these actions
    console.log('Booking created:', booking)
    console.log('Sending confirmation email to:', customerEmail)
    console.log('Generating PDF confirmation...')
    console.log('Sending WhatsApp message to:', customerPhone)

    // Simulate email sending
    await simulateEmailConfirmation(booking)
    
    // Simulate PDF generation
    await simulatePDFGeneration(booking)
    
    // Simulate WhatsApp message
    await simulateWhatsAppMessage(booking)

    return NextResponse.json({
      success: true,
      booking,
      bookingId: booking.id,
      folio: booking.folio,
      paymentIntent: {
        id: booking.paymentIntentId,
        status: 'succeeded',
      },
      message: 'Reserva creada exitosamente. Se han enviado las confirmaciones por email, PDF y WhatsApp.',
    })

  } catch (error) {
    console.error('Error creating booking:', error)
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor al procesar la reserva',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

async function simulateEmailConfirmation(booking: any) {
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  console.log(`
    📧 EMAIL CONFIRMATION SENT
    ========================
    To: ${booking.customerEmail}
    Subject: Confirmación de Reserva TeeReserve - ${booking.courseName}
    
    Estimado/a ${booking.customerName},
    
    Su reserva ha sido confirmada exitosamente:
    
    📍 Campo: ${booking.courseName}
    📅 Fecha: ${new Date(booking.date).toLocaleDateString('es-ES')}
    🕐 Hora: ${booking.time}
    👥 Jugadores: ${booking.players}
    💰 Total: $${booking.totalAmount} USD
    🆔 ID Reserva: ${booking.id}
    
    ${booking.comments ? `📝 Comentarios: ${booking.comments}` : ''}
    
    ¡Esperamos verle en el campo!
    
    Equipo TeeReserve Golf
  `)
}

async function simulatePDFGeneration(booking: any) {
  // Simulate PDF generation delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  console.log(`
    📄 PDF CONFIRMATION GENERATED
    ============================
    File: booking-confirmation-${booking.id}.pdf
    Size: 245 KB
    
    PDF Contents:
    - TeeReserve Golf Logo
    - Booking Details
    - Course Information
    - QR Code for check-in
    - Terms and Conditions
    
    PDF saved to: /confirmations/pdf/${booking.id}.pdf
  `)
}

async function simulateWhatsAppMessage(booking: any) {
  // Simulate WhatsApp sending delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  console.log(`
    📱 WHATSAPP MESSAGE SENT
    =======================
    To: ${booking.customerPhone}
    
    🏌️‍♂️ *TeeReserve Golf - Confirmación de Reserva*
    
    ¡Hola ${booking.customerName}! 👋
    
    Tu reserva está confirmada:
    
    🏌️ *${booking.courseName}*
    📅 ${new Date(booking.date).toLocaleDateString('es-ES')}
    🕐 ${booking.time}
    👥 ${booking.players} jugadores
    💰 $${booking.totalAmount} USD
    
    🆔 *ID:* ${booking.id}
    
    📄 Tu confirmación en PDF llegará por email
    
    ¡Nos vemos en el campo! ⛳
    
    _TeeReserve Golf Team_
  `)
}

// GET endpoint to retrieve booking details
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const bookingId = searchParams.get('id')
  
  if (!bookingId) {
    return NextResponse.json(
      { error: 'ID de reserva requerido' },
      { status: 400 }
    )
  }
  
  // Mock booking retrieval
  const mockBooking = {
    id: bookingId,
    courseId: '1',
    courseName: 'Cabo Real Golf Club',
    date: '2025-07-15',
    time: '09:00',
    players: 2,
    totalAmount: 280,
    status: 'confirmed',
    customerName: 'Usuario Test',
    customerEmail: 'test@teereserve.golf',
    createdAt: new Date().toISOString(),
  }
  
  return NextResponse.json({ booking: mockBooking })
}

