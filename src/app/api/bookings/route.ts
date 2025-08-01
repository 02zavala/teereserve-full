import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

// GET - Fetch bookings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const golfCourseId = searchParams.get('golfCourseId')
    const userId = searchParams.get('userId')

    let whereClause: any = {}

    // If user is a client, only show their bookings
    if (session.user.role === 'Client') {
      whereClause.userId = session.user.id
    } else if (golfCourseId) {
      whereClause.golfCourseId = golfCourseId
    } else if (userId) {
      whereClause.userId = userId
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        golfCourse: {
          select: {
            id: true,
            name: true,
            location: true
          }
        },
        discountCode: {
          select: {
            code: true,
            discountType: true,
            value: true
          }
        }
      },
      orderBy: {
        bookingDate: 'desc'
      }
    })

    return NextResponse.json({ bookings })

  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Create a new booking with Stripe payment
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
      golfCourseId, 
      bookingDate, 
      teeTime, 
      numberOfPlayers, 
      discountCode,
      affiliateCode,
      paymentMethodId 
    } = await request.json()

    if (!golfCourseId || !bookingDate || !teeTime || !numberOfPlayers) {
      return NextResponse.json(
        { message: 'Golf course ID, booking date, tee time, and number of players are required' },
        { status: 400 }
      )
    }

    // Get golf course details
    const golfCourse = await prisma.golfCourse.findUnique({
      where: { id: golfCourseId }
    })

    if (!golfCourse) {
      return NextResponse.json(
        { message: 'Golf course not found' },
        { status: 404 }
      )
    }

    // Calculate total price
    let totalPrice = golfCourse.pricePerRound.toNumber() * numberOfPlayers
    let appliedDiscountCode = null
    let affiliate = null

    // Check for affiliate code
    if (affiliateCode) {
      affiliate = await prisma.affiliate.findUnique({
        where: { referralCode: affiliateCode },
        include: { user: true }
      })
    }

    // Apply discount code if provided
    if (discountCode) {
      const discount = await prisma.discountCode.findUnique({
        where: { code: discountCode }
      })

      if (discount && discount.expiresAt && discount.expiresAt > new Date()) {
        if (!discount.maxUses || discount.currentUses < discount.maxUses) {
          if (!discount.minBookingValue || totalPrice >= discount.minBookingValue.toNumber()) {
            appliedDiscountCode = discount
            
            if (discount.discountType === 'percentage') {
              totalPrice = totalPrice * (1 - discount.value.toNumber())
            } else if (discount.discountType === 'fixed_amount') {
              totalPrice = Math.max(0, totalPrice - discount.value.toNumber())
            }
          }
        }
      }
    }

    // Check availability
    const availabilitySlot = await prisma.availability.findFirst({
      where: {
        golfCourseId,
        date: new Date(bookingDate),
        startTime: new Date(`1970-01-01T${teeTime}:00.000Z`),
        availableSlots: {
          gt: 0
        }
      }
    })

    if (!availabilitySlot) {
      return NextResponse.json(
        { message: 'Selected time slot is not available' },
        { status: 400 }
      )
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // Convert to cents
      currency: 'mxn',
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/bookings/success`,
      metadata: {
        golfCourseId,
        userId: session.user.id,
        numberOfPlayers: numberOfPlayers.toString()
      }
    })

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { message: 'Payment failed' },
        { status: 400 }
      )
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        golfCourseId,
        bookingDate: new Date(bookingDate),
        teeTime: new Date(`${bookingDate}T${teeTime}:00.000Z`),
        numberOfPlayers,
        totalPrice,
        status: 'confirmed',
        discountCodeId: appliedDiscountCode?.id
      },
      include: {
        golfCourse: {
          select: {
            name: true,
            location: true
          }
        }
      }
    })

    // Update availability
    await prisma.availability.update({
      where: { id: availabilitySlot.id },
      data: {
        availableSlots: availabilitySlot.availableSlots - 1
      }
    })

    // Update discount code usage
    if (appliedDiscountCode) {
      await prisma.discountCode.update({
        where: { id: appliedDiscountCode.id },
        data: {
          currentUses: appliedDiscountCode.currentUses + 1
        }
      })
    }

    // Create commission for affiliate if applicable
    if (affiliate) {
      const commissionAmount = totalPrice * affiliate.commissionRate.toNumber()
      await prisma.commission.create({
        data: {
          affiliateId: affiliate.id,
          bookingId: booking.id,
          amount: commissionAmount,
          status: 'pending'
        }
      })
    }

    return NextResponse.json({
      message: 'Booking created successfully',
      booking,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status
      }
    })

  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - Update booking status
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json(
        { message: 'Booking ID and status are required' },
        { status: 400 }
      )
    }

    // Check if user can update this booking
    const booking = await prisma.booking.findUnique({
      where: { id }
    })

    if (!booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      )
    }

    // Only allow user to update their own booking or admin/golf course to update any
    if (session.user.role === 'Client' && booking.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized to update this booking' },
        { status: 403 }
      )
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json({
      message: 'Booking updated successfully',
      booking: updatedBooking
    })

  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

