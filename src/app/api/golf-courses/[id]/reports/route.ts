import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/golf-courses/[id]/reports - Obtener reportes del campo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'

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

    // Calcular fechas basadas en el rango
    const now = new Date()
    const startDate = new Date()
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '365d':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Calcular período anterior para comparación
    const previousStartDate = new Date(startDate)
    const periodDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    previousStartDate.setDate(startDate.getDate() - periodDays)

    // Obtener datos de reservas actuales
    const [currentReservations, previousReservations] = await Promise.all([
      prisma.reservation.findMany({
        where: {
          courseId: golfCourse.id,
          date: {
            gte: startDate,
            lte: now
          }
        }
      }),
      prisma.reservation.findMany({
        where: {
          courseId: golfCourse.id,
          date: {
            gte: previousStartDate,
            lt: startDate
          }
        }
      })
    ])

    // Obtener datos de reservas antiguas (modelo Booking)
    const [currentBookings, previousBookings] = await Promise.all([
      prisma.booking.findMany({
        where: {
          golfCourseId: golfCourse.id,
          bookingDate: {
            gte: startDate,
            lte: now
          }
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.booking.findMany({
        where: {
          golfCourseId: golfCourse.id,
          bookingDate: {
            gte: previousStartDate,
            lt: startDate
          }
        }
      })
    ])

    // Combinar datos de ambos modelos
    const allCurrentReservations = [
      ...currentReservations.map(r => ({
        id: r.id,
        date: r.date,
        totalPrice: r.totalPrice,
        status: r.status,
        paymentStatus: r.paymentStatus,
        time: r.time,
        players: r.players,
        customerName: `${r.customerFirstName} ${r.customerLastName}`,
        customerEmail: r.customerEmail
      })),
      ...currentBookings.map(b => ({
        id: b.id,
        date: b.bookingDate,
        totalPrice: b.totalPrice,
        status: b.status,
        paymentStatus: b.paymentData ? 'completed' : 'pending',
        time: b.teeTime.toTimeString().slice(0, 5),
        players: b.numberOfPlayers,
        customerName: b.user.name || '',
        customerEmail: b.user.email
      }))
    ]

    const allPreviousReservations = [
      ...previousReservations,
      ...previousBookings.map(b => ({
        totalPrice: b.totalPrice,
        status: b.status
      }))
    ]

    // Calcular ingresos
    const currentRevenue = allCurrentReservations
      .filter(r => r.paymentStatus === 'completed')
      .reduce((sum, r) => sum + r.totalPrice, 0)
    
    const previousRevenue = allPreviousReservations
      .filter((r: any) => r.paymentData || r.paymentStatus === 'completed')
      .reduce((sum, r) => sum + r.totalPrice, 0)
    
    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0

    // Calcular crecimiento de reservas
    const reservationGrowth = allPreviousReservations.length > 0
      ? ((allCurrentReservations.length - allPreviousReservations.length) / allPreviousReservations.length) * 100
      : 0

    // Ingresos por mes
    const revenueByMonth = generateMonthlyData(allCurrentReservations, startDate, now, 'revenue')
    
    // Ingresos por día (últimos 7 días)
    const revenueByDay = generateDailyData(allCurrentReservations, 7, 'revenue')

    // Reservas por estado
    const reservationsByStatus = [
      {
        status: 'confirmed',
        count: allCurrentReservations.filter(r => r.status === 'confirmed').length,
        color: '#10b981'
      },
      {
        status: 'pending',
        count: allCurrentReservations.filter(r => r.status === 'pending').length,
        color: '#f59e0b'
      },
      {
        status: 'cancelled',
        count: allCurrentReservations.filter(r => r.status === 'cancelled').length,
        color: '#ef4444'
      },
      {
        status: 'completed',
        count: allCurrentReservations.filter(r => r.status === 'completed').length,
        color: '#3b82f6'
      }
    ]

    // Reservas por horario
    const reservationsByTimeSlot = generateTimeSlotData(allCurrentReservations)

    // Reservas por día de la semana
    const reservationsByDayOfWeek = generateDayOfWeekData(allCurrentReservations)

    // Calcular ocupación
    const totalSlotsPerDay = 26 // 6 AM a 6 PM cada 30 minutos
    const daysInPeriod = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalSlots = totalSlotsPerDay * daysInPeriod
    const occupiedSlots = allCurrentReservations.length
    const occupancyRate = Math.round((occupiedSlots / totalSlots) * 100)

    // Ocupación por mes
    const occupancyByMonth = generateMonthlyData(allCurrentReservations, startDate, now, 'occupancy')

    // Datos de clientes
    const uniqueCustomers = new Set(allCurrentReservations.map(r => r.customerEmail))
    const customerData = await analyzeCustomers(allCurrentReservations)

    const reportData = {
      revenue: {
        total: currentRevenue,
        growth: revenueGrowth,
        byMonth: revenueByMonth,
        byDay: revenueByDay
      },
      reservations: {
        total: allCurrentReservations.length,
        growth: reservationGrowth,
        byStatus: reservationsByStatus,
        byTimeSlot: reservationsByTimeSlot,
        byDayOfWeek: reservationsByDayOfWeek
      },
      occupancy: {
        rate: occupancyRate,
        trend: 0, // Se calcularía comparando con período anterior
        byMonth: occupancyByMonth
      },
      customers: {
        total: uniqueCustomers.size,
        returning: customerData.returning,
        new: customerData.new,
        topCustomers: customerData.topCustomers
      }
    }

    return NextResponse.json({
      success: true,
      data: reportData
    })

  } catch (error) {
    console.error('Error generating reports:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al generar los reportes' 
      },
      { status: 500 }
    )
  }
}

// Funciones auxiliares
function generateMonthlyData(reservations: any[], startDate: Date, endDate: Date, type: 'revenue' | 'occupancy') {
  const months = []
  const current = new Date(startDate)
  
  while (current <= endDate) {
    const monthStart = new Date(current.getFullYear(), current.getMonth(), 1)
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0)
    
    const monthReservations = reservations.filter(r => {
      const date = new Date(r.date)
      return date >= monthStart && date <= monthEnd
    })
    
    const monthName = current.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
    
    if (type === 'revenue') {
      months.push({
        month: monthName,
        revenue: monthReservations
          .filter(r => r.paymentStatus === 'completed')
          .reduce((sum, r) => sum + r.totalPrice, 0),
        reservations: monthReservations.length
      })
    } else {
      const daysInMonth = monthEnd.getDate()
      const totalSlots = 26 * daysInMonth
      const occupancyRate = Math.round((monthReservations.length / totalSlots) * 100)
      
      months.push({
        month: monthName,
        rate: occupancyRate
      })
    }
    
    current.setMonth(current.getMonth() + 1)
  }
  
  return months
}

function generateDailyData(reservations: any[], days: number, type: 'revenue') {
  const dailyData = []
  const now = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    const dayReservations = reservations.filter(r => {
      const rDate = new Date(r.date)
      return rDate.toDateString() === date.toDateString()
    })
    
    dailyData.push({
      day: date.toLocaleDateString('es-ES', { weekday: 'short' }),
      revenue: dayReservations
        .filter(r => r.paymentStatus === 'completed')
        .reduce((sum, r) => sum + r.totalPrice, 0)
    })
  }
  
  return dailyData
}

function generateTimeSlotData(reservations: any[]) {
  const timeSlots: { [key: string]: number } = {}
  
  reservations.forEach(r => {
    const hour = r.time.split(':')[0]
    const timeSlot = `${hour}:00`
    timeSlots[timeSlot] = (timeSlots[timeSlot] || 0) + 1
  })
  
  return Object.entries(timeSlots)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => a.time.localeCompare(b.time))
}

function generateDayOfWeekData(reservations: any[]) {
  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const dayData: { [key: string]: number } = {}
  
  daysOfWeek.forEach(day => {
    dayData[day] = 0
  })
  
  reservations.forEach(r => {
    const date = new Date(r.date)
    const dayName = daysOfWeek[date.getDay()]
    dayData[dayName]++
  })
  
  return Object.entries(dayData).map(([day, count]) => ({ day, count }))
}

async function analyzeCustomers(reservations: any[]) {
  const customerStats: { [email: string]: { name: string; totalSpent: number; reservations: number } } = {}
  
  reservations.forEach(r => {
    if (!customerStats[r.customerEmail]) {
      customerStats[r.customerEmail] = {
        name: r.customerName,
        totalSpent: 0,
        reservations: 0
      }
    }
    
    customerStats[r.customerEmail].reservations++
    if (r.paymentStatus === 'completed') {
      customerStats[r.customerEmail].totalSpent += r.totalPrice
    }
  })
  
  const customers = Object.entries(customerStats).map(([email, stats]) => ({
    email,
    ...stats
  }))
  
  const returning = customers.filter(c => c.reservations > 1).length
  const newCustomers = customers.filter(c => c.reservations === 1).length
  
  const topCustomers = customers
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5)
  
  return {
    returning,
    new: newCustomers,
    topCustomers
  }
}

