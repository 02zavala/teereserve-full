import { NextRequest, NextResponse } from 'next/server'
// Twilio will be imported dynamically

// Function to get Twilio client
const getTwilioClient = async () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return null
  }

  try {
    const twilio = (await import('twilio')).default
    return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  } catch (error) {
    console.error('Error loading Twilio:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { to, message, type = 'reservation' } = await request.json()

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Número de teléfono y mensaje son requeridos' },
        { status: 400 }
      )
    }

    // Format phone number for WhatsApp
    const whatsappNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+19015863419'

    // Get Twilio client
    const client = await getTwilioClient()

    if (!client) {
      return NextResponse.json(
        { error: 'WhatsApp API no está configurado correctamente' },
        { status: 500 }
      )
    }

    // Send WhatsApp message via Twilio
    const twilioMessage = await client.messages.create({
      body: message,
      from: fromNumber,
      to: whatsappNumber
    })

    // Save message to database
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    try {
      await prisma.whatsAppMessage.create({
        data: {
          phoneNumber: to,
          message: message,
          type: type.toUpperCase(),
          twilioSid: twilioMessage.sid,
          status: 'SENT',
          sentAt: new Date()
        }
      })
    } catch (dbError) {
      console.error('Error saving to database:', dbError)
      // Continue even if DB save fails
    } finally {
      await prisma.$disconnect()
    }

    return NextResponse.json({
      success: true,
      messageId: twilioMessage.sid,
      status: twilioMessage.status,
      message: 'Mensaje de WhatsApp enviado exitosamente'
    })

  } catch (error) {
    console.error('Error sending WhatsApp message:', error)

    return NextResponse.json(
      {
        error: 'Error al enviar mensaje de WhatsApp',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check WhatsApp API status
export async function GET() {
  try {
    // Check if Twilio credentials are configured
    const isConfigured = !!(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_WHATSAPP_NUMBER
    )

    return NextResponse.json({
      status: 'active',
      configured: isConfigured,
      whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
      message: 'WhatsApp Business API está funcionando'
    })

  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        configured: false,
        error: 'Error al verificar configuración de WhatsApp'
      },
      { status: 500 }
    )
  }
}
