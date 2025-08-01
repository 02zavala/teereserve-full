import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

export async function POST(request: NextRequest) {
  try {
    const { 
      paymentIntentId,
      golfCourseId, 
      bookingDate, 
      teeTime, 
      numberOfPlayers,
      customerFirstName,
      customerLastName,
      customerEmail,
      customerPhone,
      specialRequests,
      discountCode 
    } = await request.json()

    if (!paymentIntentId || !golfCourseId || !bookingDate || !teeTime || !numberOfPlayers || 
        !customerFirstName || !customerLastName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { message: 'Missing required booking information' },
        { status: 400 }
      )
    }

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { message: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Get golf course details
    const golfCourse = await prisma.golfCourse.findUnique({
      where: { 
        OR: [
          { id: golfCourseId },
          { slug: golfCourseId }
        ]
      }
    })

    if (!golfCourse) {
      return NextResponse.json(
        { message: 'Golf course not found' },
        { status: 404 }
      )
    }

    // Calculate price per player based on day of week
    const bookingDateObj = new Date(bookingDate)
    const dayOfWeek = bookingDateObj.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    
    const pricePerPlayer = isWeekend ? 
      (golfCourse.priceWeekend || golfCourse.priceWeekday || 300) : 
      (golfCourse.priceWeekday || 300)
    
    let totalPrice = pricePerPlayer * numberOfPlayers

    // Apply discount code if provided
    if (discountCode) {
      const discount = await prisma.discountCode.findUnique({
        where: { code: discountCode }
      })

      if (discount && discount.expiresAt && discount.expiresAt > new Date()) {
        if (!discount.maxUses || discount.currentUses < discount.maxUses) {
          if (!discount.minBookingValue || totalPrice >= discount.minBookingValue) {
            if (discount.discountType === 'percentage') {
              totalPrice = totalPrice * (1 - discount.value / 100)
            } else if (discount.discountType === 'fixed_amount') {
              totalPrice = Math.max(0, totalPrice - discount.value)
            }
            
            // Update discount code usage
            await prisma.discountCode.update({
              where: { id: discount.id },
              data: {
                currentUses: discount.currentUses + 1
              }
            })
          }
        }
      }
    }

    // Create reservation using the new model
    const reservation = await prisma.reservation.create({
      data: {
        courseId: golfCourse.id,
        courseName: golfCourse.name,
        date: bookingDateObj,
        time: teeTime,
        players: numberOfPlayers,
        pricePerPlayer,
        totalPrice,
        customerFirstName,
        customerLastName,
        customerEmail,
        customerPhone,
        specialRequests,
        paymentId: paymentIntent.id,
        paymentStatus: 'completed',
        paymentMethod: 'stripe',
        status: 'confirmed'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Booking confirmed successfully',
      booking: {
        id: reservation.id,
        courseId: reservation.courseId,
        courseName: reservation.courseName,
        date: reservation.date,
        time: reservation.time,
        players: reservation.players,
        totalPrice: reservation.totalPrice,
        status: reservation.status,
        paymentStatus: reservation.paymentStatus,
        paymentMethod: reservation.paymentMethod,
        customerName: `${reservation.customerFirstName} ${reservation.customerLastName}`,
        customerEmail: reservation.customerEmail,
        customerPhone: reservation.customerPhone
      },
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount
      }
    })

  } catch (error) {
    console.error('Error confirming payment and booking:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

