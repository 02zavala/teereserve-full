import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/golf-courses/[id]/stats - Obtener estadísticas del campo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

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

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Estadísticas de reservas nuevas
    const [
      todayReservations,
      weekReservations,
      monthReservations,
      pendingReservations,
      monthRevenue
    ] = await Promise.all([
      // Reservas de hoy
      prisma.reservation.count({
        where: {
          courseId: golfCourse.id,
          date: today,
          status: {
            in: ['pending', 'confirmed']
          }
        }
      }),
      
      // Reservas de esta semana
      prisma.reservation.count({
        where: {
          courseId: golfCourse.id,
          date: {
            gte: weekStart
          },
          status: {
            in: ['pending', 'confirmed', 'completed']
          }
        }
      }),
      
      // Reservas de este mes
      prisma.reservation.count({
        where: {
          courseId: golfCourse.id,
          date: {
            gte: monthStart
          },
          status: {
            in: ['pending', 'confirmed', 'completed']
          }
        }
      }),
      
      // Reservas pendientes
      prisma.reservation.count({
        where: {
          courseId: golfCourse.id,
          status: 'pending'
        }
      }),
      
      // Ingresos del mes
      prisma.reservation.aggregate({
        where: {
          courseId: golfCourse.id,
          date: {
            gte: monthStart
          },
          status: {
            in: ['confirmed', 'completed']
          },
          paymentStatus: 'completed'
        },
        _sum: {
          totalPrice: true
        }
      })
    ])

    // Estadísticas de reservas antiguas (modelo Booking)
    const [
      oldTodayBookings,
      oldWeekBookings,
      oldMonthBookings,
      oldPendingBookings,
      oldMonthRevenue
    ] = await Promise.all([
      prisma.booking.count({
        where: {
          golfCourseId: golfCourse.id,
          bookingDate: today,
          status: {
            in: ['pending', 'confirmed']
          }
        }
      }),
      
      prisma.booking.count({
        where: {
          golfCourseId: golfCourse.id,
          bookingDate: {
            gte: weekStart
          },
          status: {
            in: ['pending', 'confirmed', 'completed']
          }
        }
      }),
      
      prisma.booking.count({
        where: {
          golfCourseId: golfCourse.id,
          bookingDate: {
            gte: monthStart
          },
          status: {
            in: ['pending', 'confirmed', 'completed']
          }
        }
      }),
      
      prisma.booking.count({
        where: {
          golfCourseId: golfCourse.id,
          status: 'pending'
        }
      }),
      
      prisma.booking.aggregate({
        where: {
          golfCourseId: golfCourse.id,
          bookingDate: {
            gte: monthStart
          },
          status: {
            in: ['confirmed', 'completed']
          }
        },
        _sum: {
          totalPrice: true
        }
      })
    ])

    // Calcular ocupación (estimado basado en horarios disponibles)
    const totalSlotsPerDay = 26 // 6 AM a 6 PM cada 30 minutos
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const totalSlotsMonth = totalSlotsPerDay * daysInMonth
    const occupiedSlots = monthReservations + oldMonthBookings
    const occupancyRate = Math.round((occupiedSlots / totalSlotsMonth) * 100)

    // Calcular rating promedio
    const reviews = await prisma.review.findMany({
      where: {
        golfCourseId: golfCourse.id
      },
      select: {
        rating: true
      }
    })

    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0

    // Estadísticas por día de la semana (últimos 30 días)
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)

    const weeklyStats = await prisma.reservation.groupBy({
      by: ['date'],
      where: {
        courseId: golfCourse.id,
        date: {
          gte: thirtyDaysAgo
        },
        status: {
          in: ['confirmed', 'completed']
        }
      },
      _count: {
        id: true
      },
      _sum: {
        totalPrice: true
      }
    })

    // Estadísticas por horario (últimos 30 días)
    const hourlyStats = await prisma.reservation.groupBy({
      by: ['time'],
      where: {
        courseId: golfCourse.id,
        date: {
          gte: thirtyDaysAgo
        },
        status: {
          in: ['confirmed', 'completed']
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        time: 'asc'
      }
    })

    const stats = {
      todayReservations: todayReservations + oldTodayBookings,
      weekReservations: weekReservations + oldWeekBookings,
      monthReservations: monthReservations + oldMonthBookings,
      pendingReservations: pendingReservations + oldPendingBookings,
      monthRevenue: (monthRevenue._sum.totalPrice || 0) + (oldMonthRevenue._sum.totalPrice || 0),
      occupancyRate,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      
      // Estadísticas adicionales
      weeklyStats: weeklyStats.map(stat => ({
        date: stat.date.toISOString().split('T')[0],
        reservations: stat._count.id,
        revenue: stat._sum.totalPrice || 0
      })),
      
      hourlyStats: hourlyStats.map(stat => ({
        time: stat.time,
        reservations: stat._count.id
      })),
      
      // Tendencias
      trends: {
        reservationsGrowth: 0, // Se calcularía comparando con el mes anterior
        revenueGrowth: 0,
        ratingTrend: 0
      }
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error fetching course stats:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener las estadísticas del campo' 
      },
      { status: 500 }
    )
  }
}

