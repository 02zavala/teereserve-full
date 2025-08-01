import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/golf-courses/[id]/reservations - Obtener reservas del campo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Verificar que el campo existe
    const golfCourse = await prisma.golfCourse.findUnique({
      where: { 
        OR: [
          { id },
          { slug: id }
        ]
      }
    })

    if (!golfCourse) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campo de golf no encontrado' 
        },
        { status: 404 }
      )
    }

    const where: any = {
      courseId: golfCourse.id
    }

    if (status) {
      where.status = status
    }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    // Obtener reservas del nuevo modelo
    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.reservation.count({ where })
    ])

    // También obtener reservas del modelo antiguo si existen
    const [oldBookings, oldTotal] = await Promise.all([
      prisma.booking.findMany({
        where: {
          golfCourseId: golfCourse.id,
          ...(status && { status }),
          ...(startDate || endDate) && {
            bookingDate: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) })
            }
          }
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.booking.count({
        where: {
          golfCourseId: golfCourse.id,
          ...(status && { status }),
          ...(startDate || endDate) && {
            bookingDate: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) })
            }
          }
        }
      })
    ])

    // Combinar y formatear reservas
    const allReservations = [
      ...reservations.map(r => ({
        id: r.id,
        courseId: r.courseId,
        courseName: r.courseName,
        date: r.date.toISOString().split('T')[0],
        time: r.time,
        players: r.players,
        totalPrice: r.totalPrice,
        pricePerPlayer: r.pricePerPlayer,
        status: r.status,
        paymentStatus: r.paymentStatus,
        paymentMethod: r.paymentMethod,
        customerFirstName: r.customerFirstName,
        customerLastName: r.customerLastName,
        customerEmail: r.customerEmail,
        customerPhone: r.customerPhone,
        specialRequests: r.specialRequests,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        source: 'new'
      })),
      ...oldBookings.map(b => ({
        id: b.id,
        courseId: b.golfCourseId,
        courseName: golfCourse.name,
        date: b.bookingDate.toISOString().split('T')[0],
        time: b.teeTime.toTimeString().slice(0, 5),
        players: b.numberOfPlayers,
        totalPrice: b.totalPrice,
        pricePerPlayer: b.totalPrice / b.numberOfPlayers,
        status: b.status,
        paymentStatus: b.paymentData ? 'completed' : 'pending',
        paymentMethod: b.paymentMethod,
        customerFirstName: b.user.name?.split(' ')[0] || '',
        customerLastName: b.user.name?.split(' ').slice(1).join(' ') || '',
        customerEmail: b.user.email,
        customerPhone: b.user.phone || '',
        specialRequests: null,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
        source: 'old'
      }))
    ]

    // Ordenar por fecha de creación
    allReservations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      success: true,
      data: allReservations.slice((page - 1) * limit, page * limit),
      pagination: {
        page,
        limit,
        total: total + oldTotal,
        pages: Math.ceil((total + oldTotal) / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching course reservations:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener las reservas del campo' 
      },
      { status: 500 }
    )
  }
}

