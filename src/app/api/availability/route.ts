import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - Fetch availability for a golf course
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const golfCourseId = searchParams.get('golfCourseId')
    const date = searchParams.get('date')

    if (!golfCourseId) {
      return NextResponse.json(
        { message: 'Golf course ID is required' },
        { status: 400 }
      )
    }

    let whereClause: any = { golfCourseId }
    
    if (date) {
      const targetDate = new Date(date)
      whereClause.date = targetDate
    }

    const availability = await prisma.availability.findMany({
      where: whereClause,
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    })

    return NextResponse.json({ availability })

  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Create availability slots (Golf Course role only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'GolfCourse') {
      return NextResponse.json(
        { message: 'Unauthorized - Golf Course access required' },
        { status: 403 }
      )
    }

    const { golfCourseId, date, timeSlots } = await request.json()

    if (!golfCourseId || !date || !timeSlots || !Array.isArray(timeSlots)) {
      return NextResponse.json(
        { message: 'Golf course ID, date, and time slots are required' },
        { status: 400 }
      )
    }

    // Create availability slots
    const availabilityPromises = timeSlots.map((slot: any) => 
      prisma.availability.create({
        data: {
          golfCourseId,
          date: new Date(date),
          startTime: new Date(`1970-01-01T${slot.startTime}:00.000Z`),
          endTime: new Date(`1970-01-01T${slot.endTime}:00.000Z`),
          availableSlots: slot.availableSlots || 1
        }
      })
    )

    const createdAvailability = await Promise.all(availabilityPromises)

    return NextResponse.json({
      message: 'Availability created successfully',
      availability: createdAvailability
    })

  } catch (error) {
    console.error('Error creating availability:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - Update availability slots (Golf Course role only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'GolfCourse') {
      return NextResponse.json(
        { message: 'Unauthorized - Golf Course access required' },
        { status: 403 }
      )
    }

    const { id, availableSlots } = await request.json()

    if (!id || availableSlots === undefined) {
      return NextResponse.json(
        { message: 'Availability ID and available slots are required' },
        { status: 400 }
      )
    }

    const updatedAvailability = await prisma.availability.update({
      where: { id },
      data: { availableSlots }
    })

    return NextResponse.json({
      message: 'Availability updated successfully',
      availability: updatedAvailability
    })

  } catch (error) {
    console.error('Error updating availability:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - Remove availability slot (Golf Course role only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'GolfCourse') {
      return NextResponse.json(
        { message: 'Unauthorized - Golf Course access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { message: 'Availability ID is required' },
        { status: 400 }
      )
    }

    await prisma.availability.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Availability deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting availability:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

