import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PayPal Client class (reusing from create-order)
class PayPalClient {
  private environment: {
    clientId: string
    clientSecret: string
    baseURL: string
  }

  constructor() {
    const isProduction = process.env.PAYPAL_ENVIRONMENT === 'live'
    this.environment = {
      clientId: process.env.PAYPAL_CLIENT_ID!,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
      baseURL: isProduction 
        ? 'https://api.paypal.com' 
        : 'https://api.sandbox.paypal.com'
    }
  }

  async getAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${this.environment.clientId}:${this.environment.clientSecret}`
    ).toString('base64')

    const response = await fetch(`${this.environment.baseURL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      throw new Error('Failed to get PayPal access token')
    }

    const data = await response.json()
    return data.access_token
  }

  async captureOrder(orderID: string): Promise<any> {
    const accessToken = await this.getAccessToken()

    const response = await fetch(`${this.environment.baseURL}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`PayPal Capture Error: ${response.status} - ${errorData}`)
    }

    return response.json()
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'Client') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { orderID, discountCode } = await request.json()

    if (!orderID) {
      return NextResponse.json(
        { message: 'Order ID is required' },
        { status: 400 }
      )
    }

    const paypalClient = new PayPalClient()

    // Capturar el pago en PayPal
    const capture = await paypalClient.captureOrder(orderID)
    
    if (capture.status !== 'COMPLETED') {
      return NextResponse.json(
        { message: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Extraer datos de la orden
    const purchaseUnit = capture.purchase_units[0]
    const customData = JSON.parse(purchaseUnit.custom_id)
    const { golfCourseId, bookingDate, teeTime, numberOfPlayers } = customData

    // Obtener detalles del campo de golf
    const golfCourse = await prisma.golfCourse.findUnique({
      where: { id: golfCourseId }
    })

    if (!golfCourse) {
      return NextResponse.json(
        { message: 'Golf course not found' },
        { status: 404 }
      )
    }

    // Calcular precio y aplicar descuento
    let totalPrice = parseFloat(purchaseUnit.amount.value)
    let appliedDiscountCode = null

    if (discountCode) {
      const discount = await prisma.discountCode.findUnique({
        where: { code: discountCode }
      })

      if (discount && discount.expiresAt && discount.expiresAt > new Date()) {
        if (!discount.maxUses || discount.currentUses < discount.maxUses) {
          appliedDiscountCode = discount
          
          // Actualizar uso del código
          await prisma.discountCode.update({
            where: { id: discount.id },
            data: { currentUses: discount.currentUses + 1 }
          })
        }
      }
    }

    // Verificar disponibilidad
    const availabilitySlot = await prisma.availability.findFirst({
      where: {
        golfCourseId,
        date: new Date(bookingDate),
        startTime: new Date(`1970-01-01T${teeTime}:00.000Z`),
        availableSlots: { gt: 0 }
      }
    })

    if (!availabilitySlot) {
      return NextResponse.json(
        { message: 'Selected time slot is no longer available' },
        { status: 400 }
      )
    }

    // Crear la reserva
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        golfCourseId,
        bookingDate: new Date(bookingDate),
        teeTime: new Date(`${bookingDate}T${teeTime}:00.000Z`),
        numberOfPlayers,
        totalPrice,
        status: 'confirmed',
        paymentMethod: 'paypal',
        paymentData: JSON.stringify({
          paypalOrderId: orderID,
          captureId: capture.id,
          payerEmail: capture.payer?.email_address || '',
          paymentStatus: capture.status,
          captureTime: new Date().toISOString()
        }),
        paypalOrderId: orderID,
        discountCodeId: appliedDiscountCode?.id
      },
      include: {
        golfCourse: {
          select: { name: true, location: true }
        },
        user: {
          select: { name: true, email: true }
        }
      }
    })

    // Actualizar disponibilidad
    await prisma.availability.update({
      where: { id: availabilitySlot.id },
      data: { availableSlots: availabilitySlot.availableSlots - 1 }
    })

    return NextResponse.json({
      message: 'Booking confirmed successfully',
      booking,
      paymentDetails: {
        orderId: orderID,
        captureId: capture.id,
        status: capture.status,
        amount: purchaseUnit.amount.value,
        currency: purchaseUnit.amount.currency_code,
        paymentMethod: 'paypal'
      }
    })

  } catch (error) {
    console.error('Error capturing PayPal payment:', error)
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
