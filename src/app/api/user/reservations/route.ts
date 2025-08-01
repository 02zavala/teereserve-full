import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/user/reservations - Obtener reservas del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No autorizado' 
        },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Usuario no encontrado' 
        },
        { status: 404 }
      )
    }

    const where: any = {
      customerEmail: user.email
    }

    if (status) {
      where.status = status
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
          userId: user.id,
          ...(status && { status })
        },
        include: {
          golfCourse: {
            select: {
              name: true,
              location: true
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
          userId: user.id,
          ...(status && { status })
        }
      })
    ])

    // Combinar y formatear reservas
    const allReservations = [
      ...reservations.map(r => ({
        id: r.id,
        courseName: r.courseName,
        courseLocation: '', // No disponible en el nuevo modelo
        date: r.date.toISOString().split('T')[0],
        time: r.time,
        players: r.players,
        totalPrice: r.totalPrice,
        pricePerPlayer: r.pricePerPlayer,
        status: r.status,
        paymentStatus: r.paymentStatus,
        paymentMethod: r.paymentMethod,
        customerName: `${r.customerFirstName} ${r.customerLastName}`,
        customerEmail: r.customerEmail,
        customerPhone: r.customerPhone,
        specialRequests: r.specialRequests,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        source: 'new'
      })),
      ...oldBookings.map(b => ({
        id: b.id,
        courseName: b.golfCourse.name,
        courseLocation: b.golfCourse.location,
        date: b.bookingDate.toISOString().split('T')[0],
        time: b.teeTime.toTimeString().slice(0, 5),
        players: b.numberOfPlayers,
        totalPrice: b.totalPrice,
        pricePerPlayer: b.totalPrice / b.numberOfPlayers,
        status: b.status,
        paymentStatus: b.paymentData ? 'completed' : 'pending',
        paymentMethod: b.paymentMethod,
        customerName: user.name || '',
        customerEmail: user.email,
        customerPhone: user.phone || '',
        specialRequests: null,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
        source: 'old'
      }))
    ]

    // Ordenar por fecha de creación
    allReservations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Calcular estadísticas
    const stats = {
      total: total + oldTotal,
      pending: allReservations.filter(r => r.status === 'pending').length,
      confirmed: allReservations.filter(r => r.status === 'confirmed').length,
      cancelled: allReservations.filter(r => r.status === 'cancelled').length,
      completed: allReservations.filter(r => r.status === 'completed').length,
      totalSpent: allReservations.reduce((sum, r) => sum + r.totalPrice, 0),
      averageSpent: allReservations.length > 0 ? allReservations.reduce((sum, r) => sum + r.totalPrice, 0) / allReservations.length : 0,
      uniqueCourses: new Set(allReservations.map(r => r.courseName)).size
    }

    return NextResponse.json({
      success: true,
      data: {
        reservations: allReservations.slice((page - 1) * limit, page * limit),
        pagination: {
          page,
          limit,
          total: total + oldTotal,
          pages: Math.ceil((total + oldTotal) / limit)
        },
        stats
      }
    })

  } catch (error) {
    console.error('Error fetching user reservations:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener las reservas' 
      },
      { status: 500 }
    )
  }
}

// PUT /api/user/reservations - Actualizar reserva (cancelar, etc.)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No autorizado' 
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { reservationId, action, reason } = body

    if (!reservationId || !action) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'reservationId y action son requeridos' 
        },
        { status: 400 }
      )
    }

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Usuario no encontrado' 
        },
        { status: 404 }
      )
    }

    // Buscar reserva en el nuevo modelo
    let reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        customerEmail: user.email
      }
    })

    let isOldBooking = false
    let booking = null

    // Si no se encuentra en el nuevo modelo, buscar en el antiguo
    if (!reservation) {
      booking = await prisma.booking.findFirst({
        where: {
          id: reservationId,
          userId: user.id
        }
      })
      isOldBooking = true
    }

    if (!reservation && !booking) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Reserva no encontrada' 
        },
        { status: 404 }
      )
    }

    // Procesar acción
    if (action === 'cancel') {
      const currentReservation = reservation || booking!
      
      // Verificar que la reserva se puede cancelar
      if (currentReservation.status === 'cancelled') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'La reserva ya está cancelada' 
          },
          { status: 400 }
        )
      }

      if (currentReservation.status === 'completed') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'No se puede cancelar una reserva completada' 
          },
          { status: 400 }
        )
      }

      // Verificar tiempo de cancelación (24 horas antes)
      const reservationDate = isOldBooking ? booking!.bookingDate : reservation!.date
      const now = new Date()
      const timeDiff = reservationDate.getTime() - now.getTime()
      const hoursDiff = timeDiff / (1000 * 3600)

      if (hoursDiff < 24) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Solo se puede cancelar con al menos 24 horas de anticipación' 
          },
          { status: 400 }
        )
      }

      // Cancelar reserva
      if (isOldBooking) {
        await prisma.booking.update({
          where: { id: reservationId },
          data: {
            status: 'cancelled',
            updatedAt: new Date()
          }
        })
      } else {
        await prisma.reservation.update({
          where: { id: reservationId },
          data: {
            status: 'cancelled',
            updatedAt: new Date()
          }
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Reserva cancelada exitosamente',
        data: {
          reservationId,
          status: 'cancelled',
          reason: reason || 'Cancelada por el usuario'
        }
      })
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Acción no válida' 
      },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error updating reservation:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar la reserva' 
      },
      { status: 500 }
    )
  }
}

