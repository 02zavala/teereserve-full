import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// PayPal SDK types and client
interface PayPalEnvironment {
  clientId: string
  clientSecret: string
  baseURL: string
}

interface PayPalOrder {
  intent: string
  application_context: {
    brand_name: string
    locale: string
    landing_page: string
    shipping_preference: string
    user_action: string
    return_url: string
    cancel_url: string
  }
  purchase_units: Array<{
    reference_id: string
    description: string
    custom_id: string
    amount: {
      currency_code: string
      value: string
      breakdown: {
        item_total: {
          currency_code: string
          value: string
        }
      }
    }
    items: Array<{
      name: string
      description: string
      unit_amount: {
        currency_code: string
        value: string
      }
      quantity: string
      category: string
    }>
  }>
}

class PayPalClient {
  private environment: PayPalEnvironment

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

  async createOrder(orderData: PayPalOrder): Promise<any> {
    const accessToken = await this.getAccessToken()

    const response = await fetch(`${this.environment.baseURL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(orderData)
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`PayPal API Error: ${response.status} - ${errorData}`)
    }

    return response.json()
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'Client') {
      return NextResponse.json(
        { message: 'Unauthorized - Client access required' },
        { status: 403 }
      )
    }

    const { 
      amount, 
      currency = 'MXN',
      golfCourseId,
      golfCourseName,
      bookingDate,
      teeTime,
      numberOfPlayers 
    } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { message: 'Valid amount is required' },
        { status: 400 }
      )
    }

    if (!golfCourseId || !golfCourseName || !bookingDate || !teeTime || !numberOfPlayers) {
      return NextResponse.json(
        { message: 'Missing required booking information' },
        { status: 400 }
      )
    }

    const paypalClient = new PayPalClient()

    // Crear la orden de PayPal
    const orderData: PayPalOrder = {
      intent: 'CAPTURE',
      application_context: {
        brand_name: 'TeeReserve Golf',
        locale: 'es-MX',
        landing_page: 'BILLING',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXTAUTH_URL}/booking/success`,
        cancel_url: `${process.env.NEXTAUTH_URL}/booking/cancel`
      },
      purchase_units: [{
        reference_id: `booking_${Date.now()}`,
        description: `Reserva de Golf - ${golfCourseName}`,
        custom_id: JSON.stringify({
          userId: session.user.id,
          golfCourseId,
          bookingDate,
          teeTime,
          numberOfPlayers
        }),
        amount: {
          currency_code: currency,
          value: amount.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: currency,
              value: amount.toFixed(2)
            }
          }
        },
        items: [{
          name: `Reserva de Golf - ${golfCourseName}`,
          description: `${numberOfPlayers} jugador(es) - ${bookingDate} a las ${teeTime}`,
          unit_amount: {
            currency_code: currency,
            value: (amount / numberOfPlayers).toFixed(2)
          },
          quantity: numberOfPlayers.toString(),
          category: 'DIGITAL_GOODS'
        }]
      }]
    }

    const order = await paypalClient.createOrder(orderData)

    return NextResponse.json({
      orderID: order.id,
      status: order.status,
      links: order.links
    })

  } catch (error) {
    console.error('Error creating PayPal order:', error)
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
